import { describe, expect, it } from "vitest"

import { createLensMap, lensGeometry } from "../glass-optics"

describe("rounded lens displacement", () => {
  it("keeps the interior neutral while opposite edges refract in opposite directions", () => {
    const { width, data } = createLensMap({ width: 120, height: 60, radius: 24, bezel: 12 })
    const pixel = (x: number, y: number) => [...data.slice((y * width + x) * 4, (y * width + x) * 4 + 4)]
    expect(pixel(60, 30)).toEqual([128, 128, 128, 255])
    expect(pixel(3, 30)[0]).toBeGreaterThan(128)
    expect(pixel(116, 30)[0]).toBeLessThan(128)
    expect(Math.abs(pixel(3, 30)[0] + pixel(116, 30)[0] - 256)).toBeLessThanOrEqual(1)
    expect(pixel(60, 3)[1]).toBeGreaterThan(128)
    expect(pixel(60, 56)[1]).toBeLessThan(128)
  })

  it("keeps rounded corners outside the surface neutral and produces valid RGBA data", () => {
    const map = createLensMap({ width: 90, height: 54, radius: 27, bezel: 10 })
    expect([...map.data.slice(0, 4)]).toEqual([128, 128, 128, 255])
    expect(map.data.length).toBe(map.width * map.height * 4)
    expect(map.data.every(Number.isFinite)).toBe(true)
    expect(map.data.some((v, i) => i % 4 < 2 && v !== 128)).toBe(true)
  })

  it("normalizes invalid dimensions, caps map cost and clamps corners to the surface", () => {
    expect(lensGeometry({ width: NaN, height: -10, radius: Infinity, bezel: -1 })).toEqual({ width: 1, height: 1, radius: 0.5, bezel: 0.5 })
    const large = lensGeometry({ width: 3000, height: 2000, radius: 100, bezel: 20 })
    expect(large.width * large.height).toBeLessThanOrEqual(180_000)
    expect(large.width / large.height).toBeCloseTo(1.5, 1)
    const capsule = lensGeometry({ width: 180, height: 44, radius: 9999, bezel: 18 })
    expect(capsule.radius).toBe(22)
    expect(capsule.bezel).toBeLessThanOrEqual(22)
  })
})
