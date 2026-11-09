import { expect, test } from "@playwright/test"

import { SITE_SETTINGS_VERSION, SITE_SETTINGS_VERSION_KEY } from "../src/lib/site-settings"

test("landing page resets old settings once and preserves later choices", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" })
  await page.goto("/")
  await page.evaluate((versionKey) => {
    localStorage.removeItem(versionKey)
    localStorage.setItem("glasscn-palette", "rose")
    localStorage.setItem("glasscn-custom-css", ":root[data-glass-custom]{--glass-blur:0px}")
    localStorage.setItem("theme", "dark")
    localStorage.setItem("glass-preferences", JSON.stringify({ clarity: 1, reduceTransparency: true, reduceHighlights: true, showBorders: true }))
  }, SITE_SETTINGS_VERSION_KEY)

  await page.reload()

  await expect(page.locator("html")).toHaveClass(/light/)
  await expect(page.locator("html")).not.toHaveAttribute("data-palette")
  await expect(page.locator("html")).not.toHaveAttribute("data-glass-custom")
  await expect(page.locator("html")).not.toHaveAttribute("data-glass-reduce-transparency")
  await expect(page.locator("html")).not.toHaveAttribute("data-glass-reduce-highlights")
  await expect(page.locator("html")).not.toHaveAttribute("data-glass-show-borders")
  await expect(page.locator("#glasscn-custom, #glass-preferences")).toHaveCount(0)
  expect(await page.evaluate(() => ["glasscn-palette", "glasscn-custom-css", "theme", "glass-preferences"].map((key) => localStorage.getItem(key)))).toEqual([null, null, null, null])
  expect(await page.evaluate((key) => localStorage.getItem(key), SITE_SETTINGS_VERSION_KEY)).toBe(SITE_SETTINGS_VERSION)

  await page.evaluate(() => {
    localStorage.setItem("glasscn-palette", "ocean")
    localStorage.setItem("theme", "dark")
    localStorage.setItem("glasscn-custom-css", ":root[data-glass-custom]{--glass-blur:12px}")
    localStorage.setItem("glass-preferences", JSON.stringify({ clarity: 0.7, reduceTransparency: false, showBorders: true }))
  })
  await page.reload()

  await expect(page.locator("html")).toHaveClass(/dark/)
  await expect(page.locator("html")).toHaveAttribute("data-palette", "ocean")
  await expect(page.locator("html")).toHaveAttribute("data-glass-custom", "")
  await expect(page.locator("html")).toHaveAttribute("data-glass-show-borders", "")
  expect(await page.locator("html").evaluate((el) => getComputedStyle(el).getPropertyValue("--glass-blur").trim())).toBe("12px")
  expect(await page.locator("html").evaluate((el) => getComputedStyle(el).getPropertyValue("--glass-clarity").trim())).toBe("0.7")
})
