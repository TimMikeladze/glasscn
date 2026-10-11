import { describe, expect, it } from "vitest"

import { arcPath, barShares, fraction, heatmapWeeks, levelOf, monotoneCurve, ringArc, ringRadii, runningTotals, sanitizeId, scaleSeries, segmentAt, segments, axisKind, foldOther, hitIndex, ringLaps, stepIndex, summarize, summarySentence } from "./chart-math"

describe("native chart-math", () => {
  it("ring radii stay inside the box and drop rings that don't fit", () => {
    expect(ringRadii(100, 10, 2, 3)).toEqual([45, 33, 21])
    expect(ringRadii(40, 10, 2, 5)).toEqual([15])
  })

  it("ringArc laps past 1 and clamps bad input", () => {
    const one = ringArc(10, 0.5)
    expect(one.offset).toBeCloseTo(one.circumference / 2)
    expect(one.lapOffset).toBeNull()
    const lap = ringArc(10, 1.25)
    expect(lap.offset).toBe(0)
    expect(lap.lapOffset).toBeCloseTo(lap.circumference * 0.75)
    expect(ringArc(10, NaN).offset).toBeCloseTo(ringArc(10, 0).circumference)
  })

  it("scaleSeries skips gaps and handles a flat series", () => {
    expect(scaleSeries([1, null, 3], 100, 50, 0).map((p) => p.x)).toEqual([0, 100])
    expect(scaleSeries([], 10, 10)).toEqual([])
    const flat = scaleSeries([2, 2], 10, 10, 0)
    expect(flat[0].y).toBe(flat[1].y)
  })

  it("levels, shares, fractions and segments", () => {
    expect([0, 1, 5, 10, 99].map((v) => levelOf(v, 10))).toEqual([0, 1, 2, 4, 4])
    expect(barShares([5, 10, -1, NaN])).toEqual([50, 100, 0, 0])
    expect(barShares([0, 0])).toEqual([0, 0])
    expect(fraction(15, 10, 20)).toBe(0.5)
    expect(fraction(99, 0, 10)).toBe(1)
    expect(fraction(1, 5, 5)).toBe(0)
    const segs = segments([1, 1, 2])
    expect(segs.map((s) => s.width)).toEqual([25, 25, 50])
    expect(segmentAt(segs, 30)).toBe(1)
    expect(segmentAt(segs, 100)).toBe(2)
  })

  it("heatmap weeks end on the week with today, aligned to weekStart", () => {
    const cols = heatmapWeeks({ "2026-10-07": 4 }, { today: "2026-10-08", weeks: 2, weekStart: 1 })
    expect(cols).toHaveLength(2)
    expect(cols[0][0].date).toBe("2026-09-28") // a Monday
    const today = cols[1].find((c) => c.today)!
    expect(today.date).toBe("2026-10-08")
    expect(cols[1].find((c) => c.date === "2026-10-07")!.level).toBe(4)
    expect(cols[1][6].future).toBe(true)
  })

  it("arcs, ids, axes and stacks", () => {
    expect(arcPath(0, 0, 10, 1, 1)).toBe("")
    expect(arcPath(0, 0, 10, 0, Math.PI * 1.5)).toContain(" 0 1 1 ")
    expect(sanitizeId(":r1:«x»")).toBe("r1x")
    expect(axisKind([null, new Date()])).toBe("time")
    expect(axisKind([3])).toBe("linear")
    expect(axisKind(["a"])).toBe("category")
    expect(runningTotals([1, null, 2])).toEqual([1, 1, 3])
  })

  it("monotone curve never overshoots a peak", () => {
    const d = monotoneCurve.line([[0, 0], [10, 10], [20, 0]])
    const ys = [...d.matchAll(/,(-?[\d.]+)/g)].map((m) => Number(m[1]))
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0)
    expect(Math.max(...ys)).toBeLessThanOrEqual(10)
    expect(monotoneCurve.area([[0, 1], [1, 2]], [[0, 0], [1, 0]])).toMatch(/Z$/)
  })

  it("hitIndex finds the nearest row on an axis, in 2D within a radius, and the slice under an angle", () => {
    expect(hitIndex({ kind: "x", at: [10, 50, 90] }, 62, 0)).toBe(1)
    expect(hitIndex({ kind: "y", at: [10, 50, 90] }, 0, 88)).toBe(2)
    expect(hitIndex({ kind: "x", at: [] }, 5, 5)).toBe(-1)
    expect(hitIndex({ kind: "xy", x: [0, 100], y: [0, 100], radius: 20 }, 95, 90)).toBe(1)
    expect(hitIndex({ kind: "xy", x: [0, 100], y: [0, 100], radius: 20 }, 50, 50)).toBe(-1)
    const donut = { kind: "angle" as const, cx: 50, cy: 50, inner: 20, outer: 40, start: [0, Math.PI], end: [Math.PI, Math.PI * 2] }
    expect(hitIndex(donut, 80, 50)).toBe(0) // three o'clock
    expect(hitIndex(donut, 20, 50)).toBe(1) // nine o'clock
    expect(hitIndex(donut, 50, 50)).toBe(-1) // the hole
  })

  it("stepIndex starts from either end and clamps", () => {
    expect(stepIndex(null, 1, 5)).toBe(0)
    expect(stepIndex(null, -1, 5)).toBe(4)
    expect(stepIndex(4, 1, 5)).toBe(4)
    expect(stepIndex(0, -1, 5)).toBe(0)
    expect(stepIndex(2, 1, 0)).toBeNull()
  })

  it("ringLaps reads an exact lap count as a closed ring", () => {
    expect(ringLaps(0.4)).toEqual({ full: 0, partial: 0.4 })
    expect(ringLaps(2)).toEqual({ full: 1, partial: 1 })
    expect(ringLaps(2.25).full).toBe(2)
    expect(ringLaps(-1)).toEqual({ full: 0, partial: 0 })
  })

  it("summarize + summarySentence describe a series for screen readers", () => {
    expect(summarySentence("Steps", summarize([3, null, 9, 7]))).toBe("Steps: 3 values, low 3, high 9, latest 7, trending up.")
    expect(summarySentence("Steps", summarize([]))).toBe("Steps: no data.")
  })

  it("foldOther keeps the largest and folds the rest", () => {
    const { keep, other } = foldOther([5, 1, 9, 2, 8], 3)
    expect(keep).toEqual([2, 4])
    expect(other).toBe(8)
    expect(foldOther([1, 2], 3).other).toBeNull()
  })
})
