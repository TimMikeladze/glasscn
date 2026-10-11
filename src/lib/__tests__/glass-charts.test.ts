import { describe, expect, it } from "vitest"
import { addDays, arcPath, areaPath, barShares, fraction, heatCellTitle, heatmapWeeks, levelOf, monthLabels, polarPoint, polylineLength, ringArc, ringRadii, sanitizeId, scaleSeries, segmentAt, segments, smoothPath, weekdayLabels } from "../glass-charts"

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
    // ICU spellings vary by runtime, so compare with Intl rather than a literal
    const de = (m: number) => new Date(2026, m, 1).toLocaleString("de-DE", { month: "short" })
    expect(monthLabels(cols, "de-DE")).toEqual([de(8), null, de(9)])
  })
  it("names weekday rows from the week start, independent of today", () => {
    expect(weekdayLabels(1)).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
    expect(weekdayLabels(0)[0]).toBe("Sun")
    expect(weekdayLabels(1, "de-DE")[0]).toBe(new Date(2026, 9, 5).toLocaleDateString("de-DE", { weekday: "short" })) // a Monday
    // the rows line up with the grid's dates
    const cols = heatmapWeeks({}, { today: "2026-10-08", weeks: 1, weekStart: 0 })
    expect(cols[0].map((c) => heatCellTitle(c).slice(0, 3))).toEqual(weekdayLabels(0))
  })
  it("titles a cell in the given locale, with its value when there is one", () => {
    expect(heatCellTitle({ date: "2026-10-08", value: 3, level: 3, future: false, today: true })).toBe("Thu, Oct 8 · 3")
    expect(heatCellTitle({ date: "2026-10-08", value: 0, level: 0, future: false, today: true })).toBe("Thu, Oct 8")
    expect(heatCellTitle({ date: "2026-10-08", value: 0, level: 0, future: false, today: true }, "de-DE")).toBe(
      new Date(2026, 9, 8).toLocaleDateString("de-DE", { weekday: "short", month: "short", day: "numeric" })
    )
  })
})

describe("polyline length", () => {
  it("measures the stretched path, so a dash can cover it at any width", () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 3, y: 4 },
    ]
    expect(polylineLength(pts)).toBe(5)
    expect(polylineLength(pts, 2)).toBeCloseTo(Math.hypot(6, 4))
    expect(polylineLength([{ x: 1, y: 1 }])).toBe(0)
  })
})

describe("ids", () => {
  it("keeps only id-safe characters from React 18 and 19 useId values", () => {
    expect(sanitizeId(":r1:")).toBe("r1")
    expect(sanitizeId("«r1»")).toBe("r1")
    expect(sanitizeId("_r_1_")).toBe("_r_1_")
    expect(sanitizeId("a b#c(d)")).toBe("abcd")
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
