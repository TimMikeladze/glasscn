import { describe, expect, it } from "vitest"

import { cn } from "../glass-cn"

describe("glass token class merging", () => {
  it("lets a requested capsule or square radius replace the base surface shape", () => {
    expect(cn("rounded-surface", "rounded-button")).toBe("rounded-button")
    expect(cn("rounded-button", "rounded-none")).toBe("rounded-none")
    expect(cn("rounded-control", "rounded-concentric")).toBe("rounded-concentric")
  })

  it("lets themed control heights and padding replace each other", () => {
    expect(cn("h-control", "h-control-sm")).toBe("h-control-sm")
    expect(cn("px-pad", "px-pad-sm")).toBe("px-pad-sm")
    expect(cn("size-control", "size-control-lg")).toBe("size-control-lg")
    expect(cn("h-control", "h-12")).toBe("h-12")
  })

  it("keeps variant boundaries and independent text color/type decisions", () => {
    expect(cn("rounded-surface hover:rounded-control", "rounded-button")).toBe("hover:rounded-control rounded-button")
    expect(cn("type-glass-heading type-step-2 text-primary-ink", "text-foreground")).toBe("type-glass-heading type-step-2 text-foreground")
  })
})
