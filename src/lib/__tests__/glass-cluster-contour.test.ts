import { describe, expect, it } from "vitest"

import { unionContour } from "@/components/glass/glass-cluster"

const capsule = (x: number) => ({ x, y: 0, width: 48, height: 48, radius: 24 })
const loops = (d: string) => d.split("M").filter(Boolean).length

describe("unionContour", () => {
  it("joins items nearer than the blend into one outline", () => {
    expect(loops(unionContour([capsule(0), { ...capsule(56), radius: 12 }], 24))).toBe(1)
  })
  it("keeps distant items as separate outlines", () => {
    expect(loops(unionContour([capsule(0), capsule(120)], 24))).toBe(2)
  })
  it("traces an inset outline inside the edge for the rim", () => {
    const xs = (d: string) => [...d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => Number(m[1]))
    const outer = unionContour([capsule(0)], 24)
    const inner = unionContour([capsule(0)], 24, { inset: 1.3 })
    expect(Math.min(...xs(inner))).toBeGreaterThan(Math.min(...xs(outer)))
    expect(Math.max(...xs(inner))).toBeLessThan(Math.max(...xs(outer)))
  })
  it("offsets the path by the origin", () => {
    const xs = [...unionContour([capsule(10)], 0, { origin: [10, 0] }).matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => Number(m[1]))
    expect(Math.min(...xs)).toBeCloseTo(0, 0)
    expect(Math.max(...xs)).toBeCloseTo(48, 0)
  })
})
