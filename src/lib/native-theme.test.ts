import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { createGlassTheme, parseOklch, PALETTES, toNativeTheme } from "./glass-theme"

// a computed path, so the site's tsc (which excludes registry/native) doesn't follow it
const GENERATED = "../../registry/native/tokens.generated"
type Generated = Record<string, Record<string, unknown> & { highContrast: Record<string, unknown> }>
const NATIVE: Generated = ((await import(/* @vite-ignore */ GENERATED)) as { PALETTES: Generated }).PALETTES

// NAT-50 token parity: the generated native tokens are exactly what toNativeTheme() makes, and their hex sits within ΔE 2 of the OKLCH source.

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
function hexToOklab(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => toLinear(v / 255))
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
}
function oklchToOklab(value: string): [number, number, number] {
  const [L, C, H] = parseOklch(value)!
  const h = (H * Math.PI) / 180
  return [L, C * Math.cos(h), C * Math.sin(h)]
}
/** ΔE OK, scaled ×100 so 2 ≈ a just-noticeable difference. */
const deltaE = (a: [number, number, number], b: [number, number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) * 100

const names = Object.keys(PALETTES)

describe("native tokens", () => {
  it("cover all 12 palettes", () => {
    expect(Object.keys(NATIVE).sort()).toEqual([...names].sort())
    expect(names).toHaveLength(12)
  })

  for (const palette of names) {
    const theme = createGlassTheme({ palette })
    const native = toNativeTheme(theme)
    for (const scheme of ["light", "dark"] as const) {
      it(`${palette}/${scheme} matches toNativeTheme`, () => {
        expect(NATIVE[palette][scheme]).toEqual(native[scheme])
        expect(NATIVE[palette].highContrast[scheme]).toEqual(native.highContrast[scheme])
      })
      it(`${palette}/${scheme} primary is within ΔE 2 of its OKLCH source`, () => {
        const src = theme[scheme].primary
        expect(deltaE(hexToOklab(native[scheme].primary), oklchToOklab(src))).toBeLessThan(2)
        const label = theme[scheme]["glass-label"]
        if (label && parseOklch(label)) expect(deltaE(hexToOklab(native[scheme].label), oklchToOklab(label))).toBeLessThan(2)
      })
    }
  }

  it("regenerating is a no-op", () => {
    const path = "registry/native/tokens.generated.ts"
    const before = readFileSync(path, "utf8")
    execFileSync("node", ["scripts/generate.mjs"], { stdio: "ignore" })
    expect(readFileSync(path, "utf8")).toBe(before)
  }, 120_000)
})
