// Playwright tests of the built site (npm test). The site is served by `vite preview` from dist/,
// exactly as GitHub Pages serves it.
import { defineConfig, devices } from "@playwright/test";

const PORT = 4790;

export default defineConfig({
  testDir: "tests",
  timeout: 45_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}/posmtrade-public-site/`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/posmtrade-public-site/`,
    reuseExistingServer: !process.env.CI,
  },
});
