import { defineConfig } from "@playwright/test";

const { E2E_APP_URL, E2E_PROJECT_DIR } = process.env;
if (!E2E_APP_URL || !E2E_PROJECT_DIR) {
  throw new Error("Start the isolated test deployment with npm run test:e2e.");
}

export default defineConfig({
  testDir: "./tests/e2e",
  forbidOnly: Boolean(process.env.CI),
  use: {
    baseURL: E2E_APP_URL,
    browserName: "chromium",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port ${new URL(E2E_APP_URL).port}`,
    cwd: E2E_PROJECT_DIR,
    url: E2E_APP_URL,
    timeout: 90_000,
    gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
    reuseExistingServer: false,
  },
});
