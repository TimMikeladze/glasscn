import { describe, expect, it } from "vitest"
import { categoryKey, categoryLabel, foldOther, formatCompact, rangeSpan, ringLaps, stackEdges, stepCurve, summarize, summarySentence } from "../glass-charts"

describe("chart text alternatives", () => {
  it("summarises a series, skipping gaps", () => {
    expect(summarize([3, null, 9, 5])).toEqual({ count: 3, min: 3, max: 9, first: 3, latest: 5, trend: "up" })
    expect(summarize([5, 9, 5])?.trend).toBe("flat")
    expect(summarize([null, undefined])).toBeNull()
    expect(summarySentence("Steps", summarize([2, 1]))).toBe("Steps: 2 values, low 1, high 2, latest 1, trending down.")
    expect(summarySentence("Steps", null)).toBe("Steps: no data.")
  })
})

describe("categorical", () => {
  it("folds the smallest slices into Other past the limit, keeping order", () => {
    expect(foldOther([1, 2, 3], 8)).toEqual({ keep: [0, 1, 2], other: null, folded: [] })
    const f = foldOther([5, 1, 9, 2, 7], 3)
    expect(f.keep).toEqual([2, 4])
    expect(f.folded).toEqual([0, 1, 3])
    expect(f.other).toBe(8)
  })

  it("keys categories by local day and row, so repeated labels never merge", () => {
    // 23:30 local on the 8th is still the 8th — never the UTC day
    expect(categoryLabel(categoryKey(new Date(2026, 9, 8, 23, 30), 0))).toBe("2026-10-08")
    expect(categoryKey("Mon", 0)).not.toBe(categoryKey("Mon", 7))
    expect(categoryLabel(categoryKey("Mon", 7))).toBe("Mon")
  })

  it("formats compact figures in a locale", () => {
    expect(formatCompact(12480, "en-US")).toBe("12.5K")
    expect(formatCompact(Number.NaN)).toBe("–")
  })
})

describe("stacks and curves", () => {
  it("stacks positives up and negatives down from zero", () => {
    const row = [3, -2, 4, -1]
    expect(stackEdges(row, 0)).toEqual([0, 3])
    expect(stackEdges(row, 1)).toEqual([0, -2])
    expect(stackEdges(row, 2)).toEqual([3, 7])
    expect(stackEdges(row, 3)).toEqual([-2, -3])
    expect(stackEdges([null, 2], 1)).toEqual([0, 2])
  })

  it("steps at the midpoint between samples", () => {
    expect(stepCurve.line([[0, 10], [10, 0]])).toBe("M0,10 H5 V0 H10")
    expect(stepCurve.line([])).toBe("")
  })
})

describe("range chart and rings", () => {
  it("places a capsule in a shared domain, whichever way round", () => {
    expect(rangeSpan(10, 20, 0, 40)).toEqual({ start: 25, width: 25 })
    expect(rangeSpan(20, 10, 0, 40)).toEqual({ start: 25, width: 25 })
    expect(rangeSpan(-10, 50, 0, 40)).toEqual({ start: 0, width: 100 })
  })

  it("splits a ring value into closed laps and the arc on top", () => {
    expect(ringLaps(0.4)).toEqual({ full: 0, partial: 0.4 })
    expect(ringLaps(2.25)).toEqual({ full: 2, partial: 0.25 })
    // an exact lap reads as a closed ring on top, not an empty arc
    expect(ringLaps(1)).toEqual({ full: 0, partial: 1 })
    expect(ringLaps(3)).toEqual({ full: 2, partial: 1 })
    expect(ringLaps(-1)).toEqual({ full: 0, partial: 0 })
  })
})
