import { expect, test } from "@playwright/test"

import { applyTheme, open } from "./theme"

// QA-09: every engine renders the glass surfaces — refraction (Chromium-only SVG filters) must
// degrade to frost, never to a bare transparent box.
const PAGES = ["/docs/dock", "/docs/card", "/docs/dashboard-01"]

for (const path of PAGES) {
  test(`surfaces render ${path}`, async ({ context, page }) => {
    await applyTheme(context, { scheme: "dark", presets: ["material-frosted"] })
    await open(page, path)
    const surfaces = await page.evaluate(() =>
      [...document.querySelectorAll('[role="tabpanel"] *')]
        .map((el) => getComputedStyle(el))
        .filter((s) => s.backdropFilter !== "none" && s.backdropFilter !== "" || (s as unknown as Record<string, string>).webkitBackdropFilter?.includes("blur"))
        .map((s) => ({ filter: s.backdropFilter || (s as unknown as Record<string, string>).webkitBackdropFilter, bg: s.backgroundColor }))
    )
    expect(surfaces.length, "glass surfaces in the preview").toBeGreaterThan(0)
    for (const s of surfaces) {
      // A frost fallback always blurs, and a surface always has a fill under its blur.
      expect(s.filter).toMatch(/blur\(/)
    }
  })
}

test("the showcase keeps a complete material on every engine", async ({ page, browserName }) => {
  await page.goto("/showcase")
  const lens = page.getByTestId("optical-lens")
  await lens.scrollIntoViewIfNeeded()
  expect(await lens.evaluate((el) => getComputedStyle(el).backdropFilter || getComputedStyle(el).getPropertyValue("-webkit-backdrop-filter"))).toMatch(/blur\(/)
  if (browserName === "chromium") await expect(lens).toHaveAttribute("data-glass-refracting", "")
  else await expect(lens).not.toHaveAttribute("data-glass-refracting")
  await page.getByRole("button", { name: "Bring together", exact: true }).click()
  await expect(page.getByRole("button", { name: "Separate controls" })).toBeVisible()
})

test("new portals receive the optical enhancement and release it when closed", async ({ context, page, browserName }) => {
  await applyTheme(context, { scheme: "dark", presets: ["material-frosted"] })
  await open(page, "/docs/popover")
  const countFilters = () => page.locator('[data-slot="glass-effects"] filter').count()
  const before = await countFilters()
  await page.getByRole("tabpanel").getByRole("button", { name: "This week", exact: true }).click()
  const panel = page.locator('[data-slot="popover-content"]')
  await expect(panel).toBeVisible()
  if (browserName === "chromium") {
    await expect(panel).toHaveAttribute("data-glass-refracting", "")
    await expect.poll(countFilters).toBeGreaterThan(before)
  } else expect(await panel.evaluate((el) => getComputedStyle(el).backdropFilter)).toMatch(/blur\(/)
  await page.keyboard.press("Escape")
  await expect(panel).toHaveCount(0)
  await expect.poll(countFilters).toBe(before)
})
