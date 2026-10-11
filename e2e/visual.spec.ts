import { expect, test } from "@playwright/test"

import { applyTheme, open } from "./theme"

// QA-03: docs previews × 3 palettes × 2 schemes × {shape-square, density-compact}, on a curated
// set of items that between them cover every surface kind. Update with `pnpm test:e2e:update`.
const ITEMS = ["button", "card", "tabs", "slider", "dashboard-01"]
const PALETTES = ["dusk", "ocean", "rose"]
const SCHEMES = ["light", "dark"] as const
const PRESETS = ["shape-square", "density-compact"]

for (const palette of PALETTES)
  for (const scheme of SCHEMES)
    for (const preset of PRESETS)
      test.describe(`${palette} ${scheme} ${preset}`, () => {
        test.use({ viewport: { width: 1100, height: 900 } })
        test.beforeEach(async ({ context }) => applyTheme(context, { palette, scheme, presets: [preset] }))
        for (const item of ITEMS)
          test(item, async ({ page }) => {
            await open(page, `/docs/${item}`)
            const preview = page.locator('[role="tabpanel"] > div').first()
            await expect(preview).toHaveScreenshot(`${item}-${palette}-${scheme}-${preset}.png`)
          })
      })
