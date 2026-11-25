import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { createServer } from "node:net";
import { basename, join } from "node:path";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

const root = fileURLToPath(new URL("../", import.meta.url));
const scratch = join(root, ".e2e");
const convexCli = join(root, "node_modules/convex/bin/main.js");
const playwrightCli = fileURLToPath(
  import.meta.resolve("@playwright/test/cli"),
);
const cancel = new AbortController();
const convexEnv = { ...process.env };
for (const name of Object.keys(convexEnv)) {
  if (/^(CONVEX_|NEXT_PUBLIC_CONVEX_)/.test(name)) delete convexEnv[name];
}
convexEnv.NEXT_TELEMETRY_DISABLED = "1";

function start(
  script: string,
  args: readonly string[],
  cwd: string,
  env: NodeJS.ProcessEnv,
) {
  return spawn(process.execPath, [script, ...args], {
    cwd,
    env,
    stdio: ["ignore", "inherit", "inherit"],
  });
}

async function run(
  script: string,
  args: readonly string[],
  cwd: string,
  env: NodeJS.ProcessEnv,
) {
  cancel.signal.throwIfAborted();
  const child = start(script, args, cwd, env);
  const stop = () => child.kill("SIGINT");
  cancel.signal.addEventListener("abort", stop, { once: true });
  try {
    await once(child, "exit");
    if (child.exitCode !== 0) {
      throw new Error(
        `${args[0]} exited with ${child.exitCode ?? child.signalCode}`,
      );
    }
  } finally {
    cancel.signal.removeEventListener("abort", stop);
  }
}

async function waitFor<T>(
  label: string,
  convex: ChildProcess,
  probe: () => Promise<T | undefined>,
) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    cancel.signal.throwIfAborted();
    if (convex.exitCode !== null || convex.signalCode !== null) {
      throw new Error(`Local Convex exited while waiting for ${label}.`);
    }
    const ready = await probe();
    if (ready !== undefined) return ready;
    await setTimeout(250, undefined, { signal: cancel.signal });
  }
  throw new Error(`Timed out waiting for ${label}.`);
}

async function allocateAppPort() {
  const server = createServer().listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  if (!address || typeof address === "string") {
    throw new Error("Could not allocate a TCP port for Next.js.");
  }
  return address.port;
}

async function prepareProject(project: string) {
  for (const path of [
    "convex",
    "src",
    "next.config.ts",
    "package.json",
    "tsconfig.json",
  ]) {
    await cp(join(root, path), join(project, path), { recursive: true });
  }
  await symlink(
    join(root, "node_modules"),
    join(project, "node_modules"),
    "dir",
  );
  await cp(
    join(root, "tests/e2e/fixtures/resend"),
    join(project, "convex/resend"),
    { recursive: true },
  );
  const configPath = join(project, "convex/convex.config.ts");
  const config = await readFile(configPath, "utf8");
  const withTestSender = config.replace(
    '"@convex-dev/resend/convex.config.js"',
    '"./resend/convex.config"',
  );
  if (config === withTestSender) {
    throw new Error("Could not replace Resend in the isolated Convex project.");
  }
  await writeFile(configPath, withTestSender);
}

async function getLocalUrls(envFile: string, deployment: string) {
  const contents = await readFile(envFile, "utf8").catch((error: unknown) => {
    if (!(
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    )) {
      throw error;
    }
    return "";
  });
  if (!contents) return;
  const env = parseEnv(contents);
  const {
    CONVEX_DEPLOYMENT,
    NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CONVEX_SITE_URL,
  } = env;
  if (
    !CONVEX_DEPLOYMENT ||
    !NEXT_PUBLIC_CONVEX_URL ||
    !NEXT_PUBLIC_CONVEX_SITE_URL
  )
    return;

  if (
    CONVEX_DEPLOYMENT !== deployment ||
    ![NEXT_PUBLIC_CONVEX_URL, NEXT_PUBLIC_CONVEX_SITE_URL].every((url) =>
      /^http:\/\/127\.0\.0\.1:\d+$/.test(url),
    )
  ) {
    throw new Error(
      "Browser tests require an anonymous Convex deployment on localhost.",
    );
  }
  return { NEXT_PUBLIC_CONVEX_URL, NEXT_PUBLIC_CONVEX_SITE_URL };
}

process.once("SIGINT", () => cancel.abort());
process.once("SIGTERM", () => cancel.abort());

await mkdir(scratch, { recursive: true });
const project = await mkdtemp(join(scratch, "firefly-auth-"));
let convex: ChildProcess | undefined;
try {
  await prepareProject(project);
  const appUrl = `http://localhost:${await allocateAppPort()}`;
  const deployment = `anonymous:anonymous-${basename(project)}`;
  const envFile = join(project, ".env.local");
  const settingsFile = join(project, ".env.e2e");
  await writeFile(
    settingsFile,
    `SITE_URL=${appUrl}\nRESEND_KEY=re_local_test\nSENDER_EMAIL=auth@example.test\n`,
  );

  convex = start(
    convexCli,
    ["dev", "--typecheck", "disable", "--tail-logs", "disable"],
    project,
    convexEnv,
  );
  convex.once("error", (error) => cancel.abort(error));
  const urls = await waitFor("local deployment configuration", convex, () =>
    getLocalUrls(envFile, deployment),
  );
  await run(
    convexCli,
    ["env", "set", "--env-file", envFile, "--from-file", settingsFile],
    project,
    convexEnv,
  );
  const client = new ConvexHttpClient(urls.NEXT_PUBLIC_CONVEX_URL);
  await waitFor("deployed auth functions", convex, async () => {
    try {
      await client.query(
        makeFunctionReference<"query">("auth:isAuthenticated"),
        {},
      );
      return true;
    } catch {
      return undefined;
    }
  });
  await run(playwrightCli, ["test", ...process.argv.slice(2)], root, {
    ...convexEnv,
    ...urls,
    E2E_APP_URL: appUrl,
    E2E_PROJECT_DIR: project,
  });
} finally {
  if (convex?.pid && convex.exitCode === null && convex.signalCode === null) {
    const stopped = once(convex, "exit");
    convex.kill("SIGINT");
    await stopped;
  }
  await rm(project, { recursive: true, force: true });
}
