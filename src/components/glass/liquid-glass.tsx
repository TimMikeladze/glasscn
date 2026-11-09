"use client"

import * as React from "react"
import { cn } from "@/lib/glass-cn"

import { Glass } from "@/components/glass/glass"
import { GlassEffects } from "@/components/glass/glass-effects"

const subscribeHydration = () => () => {}

/** A floating lens. For clear glass, dim bright media underneath with Backdrop, not the lens. */
export function LiquidGlass({
  variant = "regular",
  optics = true,
  followLight = false,
  interactive = false,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Glass>, "variant" | "intensity"> & {
  variant?: "regular" | "clear"
  optics?: boolean
  followLight?: boolean
  interactive?: boolean
}) {
  const hydrated = React.useSyncExternalStore(subscribeHydration, () => true, () => false)
  return (
    <>
      <GlassEffects enabled={optics} />
      <Glass
        data-slot="liquid-glass"
        data-liquid-surface=""
        data-glass-ready={hydrated ? "" : undefined}
        data-glass-optics={optics ? undefined : "off"}
        data-glass-follow-light={followLight ? "" : undefined}
        variant={variant === "clear" ? "liquid-clear" : "liquid"}
        className={cn("glass-illuminate", interactive && "glass-press-liquid", className)}
        {...props}
      />
    </>
  )
}
