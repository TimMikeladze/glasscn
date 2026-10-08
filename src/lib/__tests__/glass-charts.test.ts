import { describe, expect, it } from "vitest"
import { addDays, arcPath, areaPath, barShares, fraction, heatmapWeeks, levelOf, monthLabels, polarPoint, ringArc, ringRadii, scaleSeries, segmentAt, segments, smoothPath } from "../glass-charts"

describe("rings", () => {
  it("fits concentric radii inside the size and drops rings that would collapse", () => {
    expect(ringRadii(160, 16, 4, 3)).toEqual([72, 52, 32])
    expect(ringRadii(40, 16, 4, 3)).toEqual([12])
  })
  it("offsets the dash by the unfilled share, and laps past 100%", () => {
    const half = ringArc(10, 0.5)
    expect(half.offset).toBeCloseTo(half.circumference / 2)
    expect(half.lapOffset).toBeNull()
    const over = ringArc(10, 1.25)
    expect(over.offset).toBe(0)
    expect(over.lapOffset).toBeCloseTo(over.circumference * 0.75)
  })
  it("treats negative and non-finite values as empty", () => {
    expect(ringArc(10, -1).offset).toBeCloseTo(ringArc(10, 0).circumference)
    expect(ringArc(10, Number.NaN).offset).toBeCloseTo(ringArc(10, 0).circumference)
  })
})

describe("series", () => {
  it("scales into the box, skipping gaps but keeping their x position", () => {
    const pts = scaleSeries([0, null, 10], 100, 50, 0)
    expect(pts).toEqual([
      { x: 0, y: 50 },
      { x: 100, y: 0 },
    ])
  })
  it("centres a flat series", () => {
    expect(scaleSeries([3, 3], 100, 50, 0).map((p) => p.y)).toEqual([25, 25])
  })
  it("draws a smooth path and closes the area to the floor", () => {
    const pts = [
      { x: 0, y: 10 },
      { x: 50, y: 0 },
      { x: 100, y: 10 },
    ]
    expect(smoothPath(pts)).toMatch(/^M0,10 C.* 100,10$/)
    expect(areaPath(pts, 20)).toMatch(/L100,20 L0,20 Z$/)
    expect(smoothPath([])).toBe("")
  })
})

describe("heatmap", () => {
  it("quantises values into levels 0–4", () => {
    expect([0, 1, 5, 10].map((v) => levelOf(v, 10))).toEqual([0, 1, 2, 4])
  })
  it("ends on the week holding today, aligned to the week start", () => {
    const today = "2026-10-08" // a Thursday
    const cols = heatmapWeeks({ [today]: 4, [addDays(today, -1)]: 2 }, { today, weeks: 2, weekStart: 1 })
    expect(cols).toHaveLength(2)
    expect(cols[0][0].date).toBe("2026-09-28") // a Monday
    const flat = cols.flat()
    expect(flat.find((c) => c.today)?.level).toBe(4)
    expect(flat.find((c) => c.date === addDays(today, -1))?.level).toBe(2)
    expect(flat.filter((c) => c.future)).toHaveLength(3) // Fri, Sat, Sun
  })
  it("labels a column only when its month changes", () => {
    const cols = heatmapWeeks({}, { today: "2026-10-08", weeks: 3, weekStart: 1 })
    expect(monthLabels(cols)).toEqual(["Sep", null, "Oct"])
  })
})

describe("bar list", () => {
  it("sizes bars against the largest value, or a given max", () => {
    expect(barShares([50, 100, 25])).toEqual([50, 100, 25])
    expect(barShares([50, 200], 100)).toEqual([50, 100])
  })
  it("treats negatives, NaN and an all-zero list as empty", () => {
    expect(barShares([-5, Number.NaN, 10])).toEqual([0, 0, 100])
    expect(barShares([0, 0])).toEqual([0, 0])
  })
})

describe("gauge", () => {
  it("clamps the value into 0–1 of its range", () => {
    expect(fraction(75, 50, 100)).toBe(0.5)
    expect(fraction(120, 0, 100)).toBe(1)
    expect(fraction(-1)).toBe(0)
    expect(fraction(5, 3, 3)).toBe(0)
  })
  it("measures angles clockwise from 12 o'clock", () => {
    const p = polarPoint(50, 50, 10, Math.PI / 2)
    expect(p.x).toBeCloseTo(60)
    expect(p.y).toBeCloseTo(50)
  })
  it("draws a half-circle arc and nothing for an empty sweep", () => {
    expect(arcPath(50, 50, 40, -Math.PI / 2, Math.PI / 2)).toBe("M10,50 A40,40 0 0 1 90,50")
    expect(arcPath(50, 50, 40, 1, 1)).toBe("")
  })
})

describe("category bar", () => {
  it("lays segments end to end as shares of the total", () => {
    expect(segments([1, 1, 2])).toEqual([
      { start: 0, width: 25 },
      { start: 25, width: 25 },
      { start: 50, width: 50 },
    ])
  })
  it("finds the segment under a marker; the last owns the end", () => {
    const segs = segments([1, 1, 2])
    expect(segmentAt(segs, 10)).toBe(0)
    expect(segmentAt(segs, 25)).toBe(1)
    expect(segmentAt(segs, 100)).toBe(2)
  })
})
