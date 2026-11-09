import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  // networkidle: under a loaded machine a click on `load` can land before React hydrates the demo
  await page.goto("/docs/glass-morph", { waitUntil: "networkidle" })
  await page.locator('[data-slot="glass-morph"]').first().scrollIntoViewIfNeeded()
})

test("a centered morph preserves the existing action's position at the start of expansion", async ({ page }) => {
  const morph = page.locator('[data-slot="glass-morph"]').first()
  const before = await morph.locator('[data-glass-morph-id="expand"]').boundingBox()
  await page.evaluate(() => {
    const animate = Element.prototype.animate
    Element.prototype.animate = function (...args) {
      const animation = animate.apply(this, args)
      if (this.matches('[data-slot="glass-cluster-item"]')) { animation.pause(); animation.currentTime = 0 }
      return animation
    }
  })
  await morph.getByRole("button", { name: "Show badges" }).click()
  const after = await morph.locator('[data-glass-morph-id="expand"]').boundingBox()
  expect(Math.abs(after!.x - before!.x)).toBeLessThan(1)
  expect(await morph.locator('[data-glass-morph-id="expand"]').evaluate((el) => el.getAnimations().length)).toBeGreaterThan(0)
})

test("a morph inside a scaled ancestor uses local geometry", async ({ page }) => {
  const morph = page.locator('[data-slot="glass-morph"]').first()
  await morph.evaluate((el) => { el.parentElement!.style.transform = "scale(0.8)" })
  const before = await morph.locator('[data-glass-morph-id="expand"]').boundingBox()
  await page.evaluate(() => {
    const animate = Element.prototype.animate
    Element.prototype.animate = function (...args) {
      const animation = animate.apply(this, args)
      if (this.matches('[data-slot="glass-cluster-item"]')) { animation.pause(); animation.currentTime = 0 }
      return animation
    }
  })
  await morph.getByRole("button", { name: "Show badges" }).click()
  const after = await morph.locator('[data-glass-morph-id="expand"]').boundingBox()
  expect(Math.abs(after!.x - before!.x)).toBeLessThan(1)
  await expect.poll(() => morph.evaluate((el) => {
    const surface = el.querySelector('[data-slot="glass-cluster-surface"]')!.getBoundingClientRect()
    return [...el.querySelectorAll('[data-slot="glass-cluster-item"]')].every((item) => {
      const r = item.getBoundingClientRect()
      return r.left >= surface.left - 1 && r.right <= surface.right + 1 && r.top >= surface.top - 1 && r.bottom <= surface.bottom + 1
    })
  })).toBe(true)
})

test("an opacity-only consumer animation does not keep contour measurement running", async ({ page }) => {
  const morph = page.locator('[data-slot="glass-morph"]').first()
  await morph.evaluate((el) => {
    const animation = el.querySelector('[data-glass-morph-id="expand"]')!.animate([{ opacity: 0.99 }, { opacity: 1 }], { duration: 2000, iterations: Infinity })
    animation.id = "consumer-opacity"
    el.dispatchEvent(new Event("glass-geometry-change"))
  })
  const reads = await morph.evaluate(async (el) => {
    await new Promise(resolve => setTimeout(resolve, 100))
    let count = 0
    const original = el.getBoundingClientRect.bind(el)
    el.getBoundingClientRect = () => { count++; return original() }
    await new Promise(resolve => setTimeout(resolve, 350))
    return count
  })
  expect(reads).toBe(0)
  expect(await morph.evaluate((el) => el.getAnimations({ subtree: true }).find((a) => a.id === "consumer-opacity")?.playState)).toBe("running")
})

test("a collapsing morph paints glass under its departing actions", async ({ page }) => {
  const morph = page.locator('[data-slot="glass-morph"]').first()
  await morph.getByRole("button", { name: "Show badges" }).click()
  await expect.poll(() => morph.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length)).toBe(0)
  await page.evaluate(() => {
    const animate = Element.prototype.animate
    Element.prototype.animate = function (...args) {
      const animation = animate.apply(this, args)
      if (this.matches('[data-slot="glass-cluster-item"]')) { animation.pause(); animation.currentTime = 0 }
      return animation
    }
  })
  await morph.getByRole("button", { name: "Hide badges" }).click()
  await expect(morph.locator('[data-slot="glass-cluster-item"][aria-hidden="true"]')).toHaveCount(2)
  await expect.poll(() => morph.evaluate((el) => {
    const surface = el.querySelector('[data-slot="glass-cluster-surface"]')!.getBoundingClientRect()
    return [...el.querySelectorAll('[data-slot="glass-cluster-item"]')].every((item) => {
      const r = item.getBoundingClientRect()
      return r.left >= surface.left - 1 && r.top >= surface.top - 1 && r.right <= surface.right + 1 && r.bottom <= surface.bottom + 1
    })
  })).toBe(true)
})

test("enabling Reduce Motion stops owned morphs and preserves consumer animations", async ({ page }) => {
  const morph = page.locator('[data-slot="glass-morph"]').first()
  await morph.evaluate((el) => {
    (el as HTMLElement).style.setProperty("--glass-duration", "10s")
    const animation = el.querySelector('[data-glass-morph-id="expand"]')!.animate([{ opacity: 0.99 }, { opacity: 1 }], { duration: 2000, iterations: Infinity })
    animation.id = "consumer-opacity"
  })
  await morph.getByRole("button", { name: "Show badges" }).click()
  await expect.poll(() => morph.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.id !== "consumer-opacity" && a.effect instanceof KeyframeEffect && a.effect.getKeyframes().some((frame) => frame.transform !== undefined)).length)).toBeGreaterThan(0)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect.poll(() => morph.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.id !== "consumer-opacity" && a.effect instanceof KeyframeEffect && a.effect.getKeyframes().some((frame) => frame.transform !== undefined)).length), { timeout: 5000 }).toBe(0)
  expect(await morph.evaluate((el) => el.getAnimations({ subtree: true }).find((a) => a.id === "consumer-opacity")?.playState)).toBe("running")
  await expect(morph.locator('[data-slot="glass-cluster-item"][aria-hidden="true"]')).toHaveCount(0)
})

test("the shared glass covers every badge in every frame of a reorder", async ({ page }) => {
  const morph = page.locator('[data-slot="glass-morph"]').first()
  await morph.getByRole("button", { name: "Show badges" }).click()
  await expect.poll(() => morph.evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length)).toBe(0)
  await morph.evaluate((el) => {
    const w = window as unknown as { samples: number[] }
    w.samples = []
    const surface = el.querySelector<HTMLElement>('[data-slot="glass-cluster-surface"]')!
    const path = document.getElementById(surface.style.maskImage.match(/#([\w-]+)/)![1])!.querySelector("path")!
    const start = performance.now()
    const tick = () => {
      const s = surface.getBoundingClientRect()
      let outside = 0
      for (const item of el.querySelectorAll('[data-slot="glass-cluster-item"]')) {
        const r = item.getBoundingClientRect()
        for (const [fx, fy] of [[0.5, 0.5], [0.25, 0.5], [0.75, 0.5], [0.5, 0.25], [0.5, 0.75]]) if (!path.isPointInFill(new DOMPoint(r.left + r.width * fx - s.left, r.top + r.height * fy - s.top))) outside++
      }
      w.samples.push(outside)
      if (performance.now() - start < 900) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  await page.getByRole("button", { name: "Reorder badges" }).click()
  await expect.poll(() => page.evaluate(() => (window as unknown as { samples: number[] }).samples.length), { timeout: 5000 }).toBeGreaterThan(20)
  await page.waitForTimeout(950)
  const samples = await page.evaluate(() => (window as unknown as { samples: number[] }).samples)
  expect(samples.filter(Boolean)).toEqual([])
})
