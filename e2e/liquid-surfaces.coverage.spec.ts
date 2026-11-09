import { expect, test } from "@playwright/test"

import { applyTheme } from "./theme"

for (const scheme of ["light", "dark"] as const) test(`fully tinted clear glass keeps readable ${scheme} labels`, async ({ page, context }) => {
  await applyTheme(context, { scheme })
  await page.goto("/showcase")
  await page.evaluate(() => document.documentElement.style.setProperty("--glass-clarity", "1"))
  const pane = page.getByTestId("liquid-glass-scene").locator(".glass-liquid-clear").first()
  const contrast = await pane.evaluate((element) => {
    const style = getComputedStyle(element)
    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext("2d")!
    const luminance = (color: string) => {
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 1, 1)
      const rgb = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map((v) => {
        const n = v / 255
        return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4
      })
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722
    }
    const ink = luminance(style.color), fill = luminance(style.backgroundColor)
    return (Math.max(ink, fill) + 0.05) / (Math.min(ink, fill) + 0.05)
  })
  expect(contrast).toBeGreaterThanOrEqual(4.5)
})

test("editing a scoped style text node refreshes its optical material", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Other engines retain the CSS material")
  await page.goto("/showcase")
  const pane = page.getByTestId("optical-lens")
  await pane.scrollIntoViewIfNeeded()
  await expect(pane).toHaveAttribute("data-glass-refracting", "")
  await page.evaluate(() => {
    const style = document.createElement("style")
    style.id = "live-scoped-tokens"
    style.textContent = '[data-testid="optical-lens"] { --glass-refraction: 14px; }'
    document.head.append(style)
  })
  await expect(pane).toHaveAttribute("data-glass-refracting", "")
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
  await page.evaluate(() => {
    document.getElementById("live-scoped-tokens")!.firstChild!.nodeValue = '[data-testid="optical-lens"] { --glass-refraction: 0px; }'
  })
  await expect(pane).not.toHaveAttribute("data-glass-refracting")
  expect(await pane.evaluate((el) => getComputedStyle(el).backdropFilter)).not.toContain("url(")
})

test("a cluster follows a child-only transform without a container resize", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/docs/glass-cluster")
  const cluster = page.locator('[data-slot="glass-cluster"]').first()
  await cluster.scrollIntoViewIfNeeded()
  const surface = cluster.locator('[data-slot="glass-cluster-surface"]')
  await expect(surface).toBeVisible()
  const initial = await surface.getAttribute("data-shapes")
  const item = cluster.locator('[data-slot="glass-cluster-item"]').first()
  await item.evaluate((el) => { (el as HTMLElement).style.transition = "transform 150ms linear" })
  await item.evaluate((el) => { (el as HTMLElement).style.transform = "translateX(20px)" })
  await expect.poll(() => surface.getAttribute("data-shapes")).not.toBe(initial)
  await expect.poll(() => item.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41)).toBeCloseTo(20, 1)
  const geometry = await cluster.evaluate((el) => {
    const left = el.getBoundingClientRect().left
    const shapes = (el.querySelector('[data-slot="glass-cluster-surface"]') as HTMLElement).dataset.shapes ?? ""
    return { mask: Number(shapes.split(",")[0]), item: el.querySelector('[data-slot="glass-cluster-item"]')!.getBoundingClientRect().left - left }
  })
  expect(geometry.mask).toBeCloseTo(geometry.item, 0)
})

test("regular glass gains depth as it grows and contrast preferences remove the enhancement", async ({ page }) => {
  await page.goto("/showcase")
  const pane = page.getByTestId("optical-lens")
  await pane.scrollIntoViewIfNeeded()
  const initial = await pane.evaluate((el) => parseFloat(getComputedStyle(el).backdropFilter.match(/blur\(([\d.]+)px\)/)?.[1] ?? "0"))
  await pane.evaluate((el) => { (el as HTMLElement).style.height = "240px" })
  await expect.poll(() => pane.evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue("--glass-surface-depth")))).toBeGreaterThan(0)
  expect(await pane.evaluate((el) => parseFloat(getComputedStyle(el).backdropFilter.match(/blur\(([\d.]+)px\)/)?.[1] ?? "0"))).toBeGreaterThan(initial)
  await page.getByRole("switch", { name: "Reduce transparency", exact: true }).click()
  await pane.scrollIntoViewIfNeeded()
  await expect.poll(() => pane.evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue("--glass-surface-depth")))).toBe(0)
})

test("window focus events quiet glass and restore its active treatment", async ({ page }) => {
  await page.goto("/showcase")
  const pane = page.getByTestId("optical-lens")
  await pane.scrollIntoViewIfNeeded()
  const active = await pane.evaluate((el) => getComputedStyle(el).boxShadow)
  // Headless engines keep every automation page focused; deliver the same browser
  // event with a controlled document focus state, then check the rendered material.
  await page.evaluate(() => {
    Object.defineProperty(document, "hasFocus", { configurable: true, value: () => false })
    window.dispatchEvent(new Event("blur"))
  })
  await expect(page.locator("html")).toHaveAttribute("data-glass-window-active", "false")
  await expect.poll(() => pane.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe(active)
  await page.evaluate(() => {
    Object.defineProperty(document, "hasFocus", { configurable: true, value: () => true })
    window.dispatchEvent(new Event("focus"))
  })
  await expect(page.locator("html")).toHaveAttribute("data-glass-window-active", "true")
  await expect.poll(() => pane.evaluate((el) => getComputedStyle(el).boxShadow)).toBe(active)
})
