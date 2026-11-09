import { expect, test } from "@playwright/test"

import { open } from "./theme"

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  test.describe(`action sheet with ${reducedMotion} motion`, () => {
    test.use({ reducedMotion })
    test("outside and Escape dismiss choices and return focus to the source", async ({ page }) => {
      await open(page, "/docs/action-sheet")
      const trigger = page.getByRole("tabpanel").getByRole("button", { name: "Entry options", exact: true })
      await trigger.click()
      const dialog = page.getByRole("dialog", { name: "Day 401" })
      await expect(dialog).toBeVisible()
      await dialog.click({ position: { x: 8, y: 8 } })
      await expect(dialog).toHaveCount(0)
      await expect(trigger).toBeFocused()
      await trigger.click()
      await expect(dialog).toBeVisible()
      await page.keyboard.press("Escape")
      await expect(dialog).toHaveCount(0)
      await expect(trigger).toBeFocused()
    })
  })
}

test("source placement opens beside its trigger without Cancel and keeps the page usable", async ({ page }) => {
  await open(page, "/docs/action-sheet")
  const trigger = page.getByRole("tabpanel").getByRole("button", { name: "From the button", exact: true })
  await trigger.click()
  const dialog = page.getByRole("dialog", { name: "Day 401" })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole("button", { name: "Cancel" })).toHaveCount(0)
  const t = (await trigger.boundingBox())!
  const d = (await dialog.boundingBox())!
  // anchored: the sheet's edge sits within 16px of the trigger, above or below it
  expect(Math.min(Math.abs(d.y - (t.y + t.height)), Math.abs(d.y + d.height - t.y))).toBeLessThan(16)
  await page.mouse.click(4, 4)
  await expect(dialog).toHaveCount(0)
  await trigger.click()
  await expect(dialog).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
})
