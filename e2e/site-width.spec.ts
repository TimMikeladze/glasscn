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

// UX3-W08 / W15: the header collapses by its own width in rem, so enlarged text collapses it too
for (const path of ["/", "/showcase", "/themes"]) test(`${path} has no sideways scroll at 390px with text at 200%`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto(path, { waitUntil: "networkidle" })
  await page.addStyleTag({ content: "html { font-size: 200% !important }" })
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  const outside = await page.getByRole("banner").evaluate((header) => {
    const pane = header.firstElementChild!.getBoundingClientRect()
    return [...header.querySelectorAll<HTMLElement>("a,button")].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > pane.right + 1 || r.left < pane.left - 1) }).map((el) => el.getAttribute("aria-label") || el.textContent)
  })
  expect(outside).toEqual([])
})

test("the primary navigation shows at 1024px once it fits", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 })
  await page.goto("/", { waitUntil: "networkidle" })
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Menu", exact: true })).toBeHidden()
})
