import { expect, test } from "@playwright/test"

import { open } from "./theme"

test("mobile sidebar traps focus, closes with Escape and restores its trigger", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await open(page, "/docs/sidebar")
  const preview = page.getByRole("tabpanel")
  const trigger = preview.getByRole("button", { name: "Toggle sidebar" })
  await expect(trigger).toHaveAttribute("aria-expanded", "false")
  await expect(preview.getByRole("button", { name: "Tonight", exact: true })).toHaveCount(0)
  await trigger.click()
  const dialog = page.getByRole("dialog", { name: "Library", exact: true })
  await expect(dialog).toBeVisible()
  await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)
  await page.keyboard.press("Shift+Tab")
  await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)
  await page.keyboard.press("Escape")
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test("large sheet anchors to the viewport and returns to an inset medium detent", async ({ page }) => {
  await open(page, "/docs/sheet")
  await page.getByRole("tabpanel").getByRole("button", { name: "Detents", exact: true }).click()
  const sheet = page.getByRole("dialog", { name: "Tonight’s note" })
  const partial = await sheet.boundingBox()
  expect(partial?.x).toBeGreaterThan(0)
  await sheet.getByRole("button", { name: "Expand sheet" }).click()
  await expect(sheet).toHaveAttribute("data-detent", "large")
  await expect.poll(async () => {
    const bounds = await sheet.boundingBox()
    return bounds ? Math.abs(bounds.x) + Math.abs(bounds.y) + Math.abs(bounds.width - (page.viewportSize()?.width ?? 0)) : Infinity
  }).toBeLessThan(1)
  await sheet.getByRole("button", { name: "Shrink sheet" }).click()
  await expect(sheet).toHaveAttribute("data-detent", "medium")
  await expect.poll(async () => (await sheet.boundingBox())?.x ?? 0).toBeGreaterThan(0)
})

test("navigation bar uses a uniform automatic backdrop while content scrolls beneath it", async ({ page }) => {
  await open(page, "/docs/navigation-bar")
  const scroller = page.getByRole("tabpanel").locator('[aria-label="Journal"]')
  const bar = scroller.locator('[data-slot="navigation-bar"]')
  await expect(bar).not.toHaveAttribute("data-over-content")
  await scroller.evaluate((element) => { element.scrollTop = 220 })
  await expect(bar).toHaveAttribute("data-over-content", "")
  await expect(bar).toHaveAttribute("data-collapsed", "")
  const backdrop = bar.locator(".scroll-edge-automatic")
  const paint = await backdrop.evaluate((element) => {
    const style = getComputedStyle(element)
    return { background: style.backgroundColor, filter: style.backdropFilter || style.getPropertyValue("-webkit-backdrop-filter") }
  })
  expect(paint.filter).toContain("blur(")
  expect(paint.background).not.toBe("rgba(0, 0, 0, 0)")
})

test("toolbar surfaces deepen their shadow when the nearest content scrolls beneath them", async ({ page }) => {
  await open(page, "/docs/toolbar")
  const scroller = page.getByRole("tabpanel").locator('[data-slot="toolbar-demo-scroll"]')
  const bar = scroller.getByRole("toolbar", { name: "Entry", exact: true })
  const group = bar.locator('[data-slot="toolbar-group"]').first()
  const before = await group.evaluate((element) => getComputedStyle(element).boxShadow)
  await scroller.evaluate((element) => { element.scrollTop = 180 })
  await expect(bar).toHaveAttribute("data-over-content", "")
  await expect.poll(() => group.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe(before)
  await expect(bar.locator('[data-slot="toolbar-backdrop"]')).toHaveCSS("opacity", "1")
})

test("portaled content retains its source scope and follows a live primitive change", async ({ page }) => {
  await open(page, "/docs/theme-scope")
  const scope = page.getByRole("tabpanel").locator('[data-slot="theme-scope"]').filter({ hasText: "Sage · always light" })
  const primary = await scope.evaluate((element) => getComputedStyle(element).getPropertyValue("--primary").trim())
  await scope.getByRole("button", { name: "Preview" }).click()
  const panel = page.getByRole("dialog", { name: "Sage · always light" })
  await expect(panel).toBeVisible()
  expect(await panel.evaluate((element) => getComputedStyle(element).getPropertyValue("--primary").trim())).toBe(primary)
  expect(await panel.evaluate((element) => getComputedStyle(element).colorScheme)).toBe("light")
  await scope.evaluate((element) => (element as HTMLElement).style.setProperty("--glass-liquid-blur", "7px"))
  await expect.poll(() => panel.evaluate((element) => getComputedStyle(element).getPropertyValue("--glass-liquid-blur").trim())).toBe("7px")
})

test.describe("source motion", () => {
  test.use({ reducedMotion: "no-preference" })
  const presentations = [
    ["sheet", "button", "Open sheet", "sheet-content"],
    ["dialog", "button", "Rename journal", "dialog-content"],
    ["alert-dialog", "button", "Delete notes", "alert-dialog-content"],
    ["action-sheet", "button", "Entry options", "action-sheet-group"],
    ["popover", "button", "This week", "popover-content"],
    ["dropdown-menu", "button", "This night", "dropdown-menu-content"],
    ["select", "combobox", "Mood", "select-content"],
    ["confirmation-popover", "button", "Delete entry", "confirmation-popover-content"],
  ] as const
  for (const [slug, role, trigger, slot] of presentations) test(`${slug} flows from its trigger and returns on close`, async ({ page }) => {
    await open(page, `/docs/${slug}`)
    const supported = await page.evaluate(() => {
      const doc = document as unknown as { startViewTransition?: (update: () => void) => { ready: Promise<void>; finished: Promise<void> } }
      if (typeof doc.startViewTransition !== "function") return false
      const native = doc.startViewTransition.bind(doc)
      const state = window as Window & { __glassMorphs?: { from: string; to: string; slot?: string; ready: boolean; lowest?: number }[] }
      state.__glassMorphs = []
      const named = () => [...document.querySelectorAll<HTMLElement>("*")].find((element) => element.style.viewTransitionName?.startsWith("glass-presentation-"))
      doc.startViewTransition = (update) => {
        const from = named()?.style.viewTransitionName ?? ""
        const record: { from: string; to: string; slot: string; ready: boolean; lowest?: number } = { from, to: "", slot: "", ready: false }
        state.__glassMorphs?.push(record)
        let presented: HTMLElement | undefined
        const transition = native(() => {
          update()
          presented = named()
          record.to = presented?.style.viewTransitionName ?? ""
          record.slot = presented?.dataset.slot ?? ""
        })
        void transition.ready.then(() => { record.ready = true }).catch(() => {})
        // once the morph hands over, the presented surface must stay shown, not replay its entry
        void transition.finished.then(() => {
          const root = presented?.closest<HTMLElement>("[data-glass-motion]") ?? presented
          if (!root?.isConnected) return
          let lowest = 1
          const start = performance.now()
          const tick = () => {
            if (root.isConnected) lowest = Math.min(lowest, Number(getComputedStyle(root).opacity))
            if (performance.now() - start < 400) requestAnimationFrame(tick)
            else record.lowest = lowest
          }
          tick()
        }).catch(() => {})
        return transition
      }
      return true
    })
    await page.getByRole("tabpanel").getByRole(role, { name: trigger, exact: true }).click()
    const panel = page.locator(`[data-slot="${slot}"]`)
    await expect(panel).toBeVisible()
    if (!supported) return
    await expect.poll(() => page.evaluate(() => (window as Window & { __glassMorphs?: { ready: boolean }[] }).__glassMorphs?.[0]?.ready)).toBe(true)
    const transition = await page.evaluate(() => (window as Window & { __glassMorphs?: { from: string; to: string; slot: string }[] }).__glassMorphs?.[0])
    expect(transition?.from).toMatch(/^glass-presentation-/)
    expect(transition?.to).toBe(transition?.from)
    expect(transition?.slot).toBe(slot)
    await expect.poll(() => page.evaluate(() => (window as Window & { __glassMorphs?: { lowest?: number }[] }).__glassMorphs?.[0]?.lowest), { timeout: 5000 }).toBeGreaterThan(0.95)
    await page.keyboard.press("Escape")
    await expect(panel).toHaveCount(0)
    await expect.poll(() => page.evaluate(() => (window as Window & { __glassMorphs?: { ready: boolean }[] }).__glassMorphs?.[1]?.ready)).toBe(true)
    const closing = await page.evaluate(() => (window as Window & { __glassMorphs?: { from: string; to: string; slot: string }[] }).__glassMorphs?.[1])
    expect(closing?.from).toBe(transition?.from)
    expect(closing?.to).toBe(transition?.from)
    expect(closing?.slot).toBe(`${slug}-trigger`)
  })
})
