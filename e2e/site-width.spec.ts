import { expect, test } from "@playwright/test"

for (const path of ["/", "/themes"]) for (const width of [768, 900]) test(`${path} fits a ${width}px desktop window`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 })
  await page.goto(path, { waitUntil: "networkidle" })
  const layout = await page.getByRole("banner").evaluate((header) => {
    const pane = header.firstElementChild!.getBoundingClientRect()
    const visible = [...header.querySelectorAll<HTMLElement>("a,button")].filter((el) => el.getBoundingClientRect().width > 0)
    return { viewport: innerWidth, document: document.documentElement.scrollWidth, pane: { left: pane.left, right: pane.right }, controls: visible.map((el) => ({ label: el.getAttribute("aria-label") || el.textContent, left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right })) }
  })
  expect(layout.document).toBeLessThanOrEqual(layout.viewport)
  for (const control of layout.controls) {
    expect(control.left, `${control.label} starts inside the header`).toBeGreaterThanOrEqual(layout.pane.left)
    expect(control.right, `${control.label} ends inside the header`).toBeLessThanOrEqual(layout.pane.right)
  }
})

test("compact desktop navigation keeps every top-level destination available", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 })
  await page.goto("/")
  await page.getByRole("button", { name: "Menu", exact: true }).click()
  const navigation = page.getByRole("navigation", { name: "Site navigation" })
  for (const name of ["Showcase", "Docs", "Components", "Studio", "Theming", "Native"]) await expect(navigation.getByRole("link", { name, exact: true })).toBeVisible()
})
