import * as React from "react"

import { Glass, type GlassProps } from "@/components/glass/native/glass"

export type LiquidGlassProps = Omit<GlassProps, "variant"> & {
  variant?: "regular" | "clear"
}

/** Native system glass. Place any dim on bright media behind clear controls. */
export function LiquidGlass({ variant = "regular", ...props }: LiquidGlassProps) {
  return <Glass variant={variant === "clear" ? "liquid-clear" : "liquid"} {...props} />
}
