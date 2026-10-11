import { describe, expect, it } from "vitest"

import { HIT_MIN, hitSlop } from "./a11y"

describe("hitSlop", () => {
  it("grows a small control to 44pt each way", () => {
    expect(HIT_MIN).toBe(44)
    expect(hitSlop(28)).toEqual({ top: 8, bottom: 8, left: 8, right: 8 })
    expect(hitSlop(32, 100)).toEqual({ top: 6, bottom: 6, left: 0, right: 0 })
    expect(hitSlop(31)).toEqual({ top: 7, bottom: 7, left: 7, right: 7 })
  })
  it("leaves 44pt+ controls alone", () => {
    expect(hitSlop(44)).toBeUndefined()
    expect(hitSlop(60, 120)).toBeUndefined()
  })
})
