import { expect, test } from "@playwright/test"

import { open } from "./theme"

// UX-04: at most 12 blurred elements in the initial viewport — each backdrop-filter is a
// full re-composite on every scroll frame.
const BUDGET = 12
const PAGES = ["/", "/docs", "/docs/button", "/docs/dashboard-01", "/themes"]

for (const path of PAGES) {
  test(`blur budget ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await open(page, path)
    const blurred = await page.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .filter((el) => {
          const s = getComputedStyle(el)
          if (!s.backdropFilter || s.backdropFilter === "none" || s.visibility === "hidden" || s.display === "none") return false
          const r = el.getBoundingClientRect()
          return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth
        })
        .map((el) => `${el.tagName.toLowerCase()}[data-slot=${el.getAttribute("data-slot") ?? ""}].${String(el.className).slice(0, 60)}`)
    )
    expect(blurred.length, blurred.join("\n")).toBeLessThanOrEqual(BUDGET)
  })
}
