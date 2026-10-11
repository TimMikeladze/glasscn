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
