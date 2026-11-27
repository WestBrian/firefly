import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { promisify } from "node:util";
import { expect, test, type Page } from "@playwright/test";

const exec = promisify(execFile);
const passkeyButton = "Continue with passkey";
const invalidCredentials = "The email address or password is incorrect.";

function newEmailAccount() {
  return {
    email: `firefly-${randomUUID()}@example.test`,
    password: `Firefly-${randomUUID()}`,
  };
}

type EmailAccount = ReturnType<typeof newEmailAccount>;

async function expectDashboard(page: Page) {
  await expect(page).toHaveURL("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Dashboard", exact: true }),
  ).toBeVisible();
}

async function expectSignIn(page: Page) {
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("button", { name: passkeyButton, exact: true }),
  ).toBeVisible();
}

async function signOut(page: Page) {
  const button = page.getByRole("button", { name: "Sign out", exact: true });
  await expect(button).toBeEnabled();
  await button.click();
  await expectSignIn(page);
}

async function submitPasskey(page: Page, username: string) {
  const button = page.getByRole("button", {
    name: passkeyButton,
    exact: true,
  });
  await button.click();
  await page.getByLabel("Username", { exact: true }).fill(username);
  await button.click();
}

async function submitEmailSignIn(page: Page, account: EmailAccount) {
  await page.getByLabel("Email address", { exact: true }).fill(account.email);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

async function emailLink({
  page,
  to,
  path,
}: {
  page: Page;
  to: string;
  path: "/validate-email" | "/reset-password";
}) {
  const project = process.env.E2E_PROJECT_DIR;
  if (!project) throw new Error("Run the suite with npm run test:e2e.");

  const origin = new URL(page.url()).origin;
  let link = "";
  await expect
    .poll(
      async () => {
        const { stdout } = await exec(
          process.execPath,
          [
            join(project, "node_modules/convex/bin/main.js"),
            "run",
            "--component",
            "resend",
            "lib:latest",
            JSON.stringify({ to }),
          ],
          { cwd: project, timeout: 5_000 },
        );
        const message: unknown = stdout ? JSON.parse(stdout) : null;
        const candidates =
          typeof message === "string"
            ? (message.match(/https?:\/\/\S+/g) ?? [])
            : [];
        link =
          candidates
            .map((candidate) => new URL(candidate))
            .find(
              (url) =>
                url.origin === origin &&
                url.pathname === path &&
                url.searchParams.get("code"),
            )?.href ?? "";
        return Boolean(link);
      },
      { message: `Expected an email with a ${path} link` },
    )
    .toBe(true);
  return link;
}

async function createVerifiedAccount(page: Page, account: EmailAccount) {
  await page.goto("/");
  const createAccount = page.getByRole("button", {
    name: "Create account",
    exact: true,
  });
  await createAccount.click();
  const form = page.locator("form").filter({ has: createAccount });
  await form.getByLabel("Email address", { exact: true }).fill(account.email);
  await form.getByLabel("Password", { exact: true }).fill(account.password);
  await form
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByText("Check your inbox", { exact: true }),
  ).toBeVisible();

  await page.goto(
    await emailLink({ page, to: account.email, path: "/validate-email" }),
  );
  await expectDashboard(page);
}

test("passkey registration and sign-in protect the dashboard across sessions", async ({
  context,
  page,
}) => {
  await context.credentials.install();
  await context.addInitScript(function disablePasskeyAutofill() {
    PublicKeyCredential.isConditionalMediationAvailable = async () => false;
  });
  const username = `firefly-${randomUUID().slice(0, 8)}`;

  await page.goto("/dashboard");
  await expectSignIn(page);

  await submitPasskey(page, username);
  await expectDashboard(page);
  const rpId = new URL(page.url()).hostname;
  const [registered] = await context.credentials.get({ rpId });
  if (!registered)
    throw new Error("The authenticator did not create a passkey.");
  await page.reload();
  await expectDashboard(page);

  await signOut(page);
  await submitPasskey(page, username);
  await expectDashboard(page);
  const credentials = await context.credentials.get({ rpId });
  expect(credentials.map(({ id }) => id)).toEqual([registered.id]);
  expect(credentials[0].signCount).toBeGreaterThan(registered.signCount);
  await signOut(page);
  await page.goto("/dashboard");
  await expectSignIn(page);
});

test("email verification enables sign-in with the right password", async ({
  page,
}) => {
  const account = newEmailAccount();
  await createVerifiedAccount(page, account);
  await signOut(page);

  await submitEmailSignIn(page, {
    email: account.email,
    password: `Wrong-${randomUUID()}`,
  });
  await expect(
    page.getByText(invalidCredentials, { exact: true }),
  ).toBeVisible();
  await expectSignIn(page);

  await submitEmailSignIn(page, account);
  await expectDashboard(page);
});

test("password reset requires the requesting browser and replaces the old password", async ({
  browser,
  page,
}) => {
  const account = newEmailAccount();
  await createVerifiedAccount(page, account);
  await signOut(page);

  await page.getByRole("button", { name: "Forgot password?" }).click();
  const sendResetLink = page.getByRole("button", {
    name: "Send reset link",
    exact: true,
  });
  await page
    .locator("form")
    .filter({ has: sendResetLink })
    .getByLabel("Email address", { exact: true })
    .fill(account.email);
  await sendResetLink.click();
  await expect(
    page.getByText("Check your inbox", { exact: true }),
  ).toBeVisible();

  const link = await emailLink({
    page,
    to: account.email,
    path: "/reset-password",
  });
  const otherBrowser = await browser.newContext();
  try {
    const otherPage = await otherBrowser.newPage();
    await otherPage.goto(link);
    await expect(
      otherPage.getByText(
        "Open the link in the browser where you requested it.",
        {
          exact: true,
        },
      ),
    ).toBeVisible();
    await expect(
      otherPage.getByRole("button", { name: "Reset password", exact: true }),
    ).toHaveCount(0);
  } finally {
    await otherBrowser.close();
  }

  await page.goto(link);
  const newPassword = `Reset-${randomUUID()}`;
  await page.getByLabel("Password", { exact: true }).fill(newPassword);
  await page
    .getByRole("button", { name: "Reset password", exact: true })
    .click();
  await expectDashboard(page);
  await signOut(page);

  await submitEmailSignIn(page, account);
  await expect(
    page.getByText(invalidCredentials, { exact: true }),
  ).toBeVisible();
  await expectSignIn(page);

  await submitEmailSignIn(page, { ...account, password: newPassword });
  await expectDashboard(page);
});
