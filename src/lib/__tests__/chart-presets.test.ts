import { describe, expect, it } from "vitest"
import { axisKind, monotoneCurve, runningTotals } from "../glass-charts"

describe("chart presets", () => {
  it("picks the x axis from the first value present", () => {
    expect(axisKind([null, new Date(0)])).toBe("time")
    expect(axisKind([undefined, 3, 4])).toBe("linear")
    expect(axisKind(["Mon", "Tue"])).toBe("category")
    expect(axisKind([])).toBe("category")
  })

  it("stacks running totals, counting gaps as zero", () => {
    expect(runningTotals([1.5, null, 2, undefined, 0.5])).toEqual([1.5, 1.5, 3.5, 3.5, 4])
  })

  it("draws a monotone curve that never overshoots its points", () => {
    const pts = [[0, 10], [10, 0], [20, 0], [30, 10]] as const
    const d = monotoneCurve.line(pts)
    expect(d.startsWith("M0,10")).toBe(true)
    // every control point stays within the data's y range — a flat run stays flat
    const ys = [...d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => Number(m[2]))
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0)
    expect(Math.max(...ys)).toBeLessThanOrEqual(10)
    expect(d).toContain("C13.33,0 16.67,0 20,0")
  })

  it("closes an area along the reversed baseline", () => {
    const d = monotoneCurve.area([[0, 5], [10, 2]], [[0, 10], [10, 10]])
    expect(d).toMatch(/^M0,5 C.* L10,10 C.* 0,10 Z$/)
    expect(monotoneCurve.line([])).toBe("")
  })
})
