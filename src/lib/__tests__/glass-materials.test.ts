import { describe, expect, it } from "vitest"

import { glassVariants } from "@/lib/glass-variants"

describe("the four named standard materials", () => {
  it.each([
    ["ultraThin", "glass-subtle"], ["thin", "glass"],
    ["regular", "glass-strong"], ["thick", "glass-thick"],
  ] as const)("exposes %s independently of the Liquid Glass variants", (intensity, className) => {
    expect(glassVariants({ variant: "material", intensity }).split(" ")).toContain(className)
    expect(glassVariants({ variant: "liquid", intensity })).toContain("glass-liquid")
  })
})
