import { expect, test } from "@playwright/test"
import sharp from "sharp"
import AxeBuilder from "@axe-core/playwright"
import { applyTheme } from "./theme"

test("Photos controls keep their state while the content changes", async ({ page }) => {
  await page.goto("/showcase")
  const scene = page.getByTestId("liquid-glass-scene")
  await expect(scene).toHaveAttribute("data-scene", "photos")
  await scene.getByRole("button", { name: "Favorite photo", exact: true }).click()
  await expect(scene.getByRole("button", { name: "Remove favorite", exact: true })).toHaveAttribute("aria-pressed", "true")
  await scene.getByRole("button", { name: "Next photo" }).click()
  await expect(scene.getByRole("img", { name: /Coast/ })).toBeVisible()
  await expect(scene.getByRole("button", { name: "Favorite photo", exact: true })).toHaveAttribute("aria-pressed", "false")
})

test("Music playback, standard search and Maps filtering work", async ({ page }) => {
  await page.goto("/showcase")
  const scene = page.getByTestId("liquid-glass-scene")
  await page.getByRole("tab", { name: "Music", exact: true }).click()
  await scene.getByRole("button", { name: "Pause playback" }).click()
  await expect(scene.getByRole("button", { name: "Play music" })).toBeVisible()
  await scene.getByRole("tab", { name: "Search", exact: true }).click()
  await expect(scene.getByRole("searchbox", { name: "Search music" })).not.toBeFocused()
  await page.getByRole("tab", { name: "Maps", exact: true }).click()
  await scene.getByRole("searchbox", { name: "Search places" }).fill("no such place")
  await expect(scene.getByRole("status")).toHaveText(/No places/)
  await scene.getByRole("button", { name: "Clear search" }).click()
  await expect(scene.getByRole("button", { name: /Forest Park/ })).toBeVisible()
})

test("Music tabs support keyboard navigation and bars return on reverse scroll", async ({ page }) => {
  await page.goto("/showcase")
  await page.getByRole("tab", { name: "Music", exact: true }).click()
  const scene = page.getByTestId("liquid-glass-scene")
  await scene.getByRole("tab", { name: "Home", exact: true }).focus()
  await page.keyboard.press("ArrowRight")
  await expect(scene.getByRole("tab", { name: "New", exact: true })).toBeFocused()
  await expect(scene.getByRole("tab", { name: "New", exact: true })).toHaveAttribute("aria-selected", "true")
  await expect(scene.getByRole("tabpanel")).toHaveAccessibleName("New")
  await scene.getByRole("tab", { name: "Home", exact: true }).click()
  await page.mouse.click(5, 500)
  const scroll = scene.locator('[data-slot="music-scroll"]')
  await scroll.evaluate((el) => { el.scrollTop = 300 })
  // minimized: the tabs collapse to the selected one, Search stays as its own trailing tab
  await expect(scene.getByRole("tab", { name: "Library", exact: true })).toHaveCount(0)
  await expect(scene.getByRole("tab", { name: "Search", exact: true })).toBeVisible()
  await scroll.evaluate((el) => { el.scrollTop = 180 })
  await expect(scene.getByRole("tab", { name: "Library", exact: true })).toBeVisible()
  await page.getByRole("tab", { name: "Safari", exact: true }).click()
  const article = scene.getByRole("region", { name: "Article" })
  await article.evaluate((el) => { el.scrollTop = 300 })
  await expect(scene.getByRole("button", { name: "Expand address field" })).toBeVisible()
  await article.evaluate((el) => { el.scrollTop = 180 })
  await expect(scene.getByRole("textbox", { name: "Website address" })).toBeVisible()
})

test("optics can be removed live without losing the CSS material", async ({ page }) => {
  await page.goto("/showcase")
  const surface = page.getByTestId("optical-lens")
  await surface.scrollIntoViewIfNeeded()
  await expect(surface).toHaveAttribute("data-glass-refracting", "")
  await page.getByRole("switch", { name: "Optical refraction", exact: true }).click()
  await expect(surface).not.toHaveAttribute("data-glass-refracting")
  expect(await surface.evaluate((el) => getComputedStyle(el).backdropFilter)).toMatch(/blur\(/)
  await page.getByRole("switch", { name: "Optical refraction", exact: true }).click()
  await expect(surface).toHaveAttribute("data-glass-refracting", "")
  await page.emulateMedia({ contrast: "more" })
  await expect(surface).not.toHaveAttribute("data-glass-refracting")
})

test("sibling controls split and merge without moving their labels into a filter", async ({ page }) => {
  await page.goto("/showcase")
  const cluster = page.locator('[data-slot="glass-cluster"]')
  await cluster.scrollIntoViewIfNeeded()
  await expect(cluster.locator('[data-slot="glass-cluster-surface"]')).toBeVisible()
  const initial = await cluster.locator('[data-slot="glass-cluster-surface"]').getAttribute("data-shapes")
  await page.getByRole("button", { name: "Bring together", exact: true }).click()
  await expect(cluster.getByRole("button", { name: "Separate controls" })).toBeVisible()
  await expect.poll(() => cluster.locator('[data-slot="glass-cluster-surface"]').getAttribute("data-shapes")).not.toBe(initial)
  await expect(cluster.getByRole("button", { name: "Save landscape" })).toHaveCSS("filter", "none")
})

test("a fixed-width cluster tracks moving item positions throughout a merge", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/showcase")
  const cluster = page.locator('[data-slot="glass-cluster"]')
  await cluster.scrollIntoViewIfNeeded()
  await cluster.evaluate((el) => { (el as HTMLElement).style.width = "100%"; (el as HTMLElement).style.transitionDuration = "400ms" })
  await page.getByRole("button", { name: "Bring together", exact: true }).click()
  await expect(cluster).toHaveCSS("column-gap", "0px")
  const geometry = await cluster.evaluate((el) => {
    const rect = el.getBoundingClientRect()
    const shapes = (el.querySelector('[data-slot="glass-cluster-surface"]') as HTMLElement).dataset.shapes ?? ""
    return { mask: shapes.split(" ").map((shape) => Number(shape.split(",")[0])), items: [...el.querySelectorAll('[data-slot="glass-cluster-item"]')].map((item) => item.getBoundingClientRect().left - rect.left) }
  })
  expect(geometry.mask).toHaveLength(3)
  geometry.mask.forEach((x, i) => expect(x).toBeCloseTo(geometry.items[i], 0))
})

test("the optical filter displaces edge pixels beyond the neutral interior", async ({ page }) => {
  await page.goto("/showcase")
  const lens = page.getByTestId("optical-lens")
  await lens.scrollIntoViewIfNeeded()
  await page.getByRole("radio", { name: "Clear", exact: true }).click()
  await lens.evaluate((element) => {
    const parent = element.parentElement!
    const photo = parent.querySelector("img")!
    photo.style.visibility = "hidden"
    parent.style.background = "repeating-linear-gradient(90deg, black 0px, black 8px, white 8px, white 16px)"
  })
  await expect(lens).toHaveAttribute("data-glass-refracting", "")
  await page.mouse.move(0, 0)
  const before = await sharp(await lens.screenshot()).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  await page.getByRole("switch", { name: "Optical refraction", exact: true }).click()
  await expect(lens).not.toHaveAttribute("data-glass-refracting")
  await page.mouse.move(0, 0)
  const after = await sharp(await lens.screenshot()).ensureAlpha().raw().toBuffer()
  let edge = 0, edgePixels = 0, center = 0, centerPixels = 0
  for (let y = 0; y < before.info.height; y++) for (let x = 0; x < before.info.width; x++) {
    const i = (y * before.info.width + x) * 4
    const delta = Math.abs(before.data[i] - after[i]) + Math.abs(before.data[i + 1] - after[i + 1]) + Math.abs(before.data[i + 2] - after[i + 2])
    const distance = Math.min(y, before.info.height - 1 - y)
    if (x > 60 && x < before.info.width - 60 && distance < 12) { edge += delta; edgePixels++ }
    if (x > 60 && x < before.info.width - 60 && distance > 30) { center += delta; centerPixels++ }
  }
  expect(edge / edgePixels, "lensing changes actual backdrop pixels at the rounded edge").toBeGreaterThan(center / centerPixels * 2 + 0.5)
})

test("reduced transparency keeps clear controls readable and removes optical enhancement", async ({ page }) => {
  await page.goto("/showcase")
  const clear = page.getByTestId("liquid-glass-scene").locator('[data-variant="liquid-clear"]').first()
  await expect(clear).toHaveAttribute("data-glass-refracting", "")
  await page.getByRole("switch", { name: "Reduce transparency", exact: true }).last().click()
  await expect(clear).not.toHaveAttribute("data-glass-refracting")
  expect(await page.getByTestId("optical-lens").evaluate((el) => getComputedStyle(el).getPropertyValue("--glass-clarity").trim())).toBe("0.9")
  await expect.poll(() => clear.evaluate((el) => getComputedStyle(el).color)).not.toBe("oklch(0.985 0 0)")
  await page.getByRole("switch", { name: "Reduce bright effects", exact: true }).last().click()
  expect(await clear.evaluate((el) => getComputedStyle(el).getPropertyValue("--glass-illumination").trim())).toBe("0%")
})

for (const scheme of ["light", "dark"] as const) {
  test(`every showcase scene has accessible controls in ${scheme}`, async ({ context, page }) => {
    await applyTheme(context, { scheme })
    await page.goto("/showcase")
    for (const name of ["Photos", "Music", "Maps", "Safari", "Mail", "Controls", "Landmarks", "Notes", "Search", "Materials"]) {
      await page.getByRole("tab", { name, exact: true }).click()
      const result = await new AxeBuilder({ page }).include('[data-testid="liquid-glass-scene"]').withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()
      expect(result.violations, `${name}: ${result.violations.map((v) => v.id).join(", ")}`).toEqual([])
    }
  })
}
