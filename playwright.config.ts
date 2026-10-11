import { defineConfig, devices } from "@playwright/test"

// End-to-end suite (docs/testing.md): axe, visual regression, browser matrix, blur budget.
// Reuses a dev server already on E2E_BASE_URL (default :3011); otherwise starts one there.
const base = process.env.E2E_BASE_URL ?? "http://localhost:3011"
const port = new URL(base).port || "3011"

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled" } },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  snapshotPathTemplate: "e2e/__screenshots__/{testFilePath}/{arg}-{projectName}{ext}",
  use: { baseURL: base, reducedMotion: "reduce" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // The browser matrix only runs the liquid-surfaces spec (QA-09).
    { name: "webkit", use: { ...devices["Desktop Safari"] }, testMatch: /liquid-surfaces/ },
    { name: "firefox", use: { ...devices["Desktop Firefox"] }, testMatch: /liquid-surfaces/ },
  ],
  webServer: {
    command: `pnpm exec next dev -p ${port}`,
    url: base,
    reuseExistingServer: true,
    timeout: 180_000,
  },
})
