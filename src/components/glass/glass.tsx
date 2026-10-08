import * as React from "react"
import { cn } from "cn"
import { Slot } from "radix-ui"

import { glassVariants, type GlassVariantProps } from "@/lib/glass-variants"

/**
 * A frosted pane: the base every glasscn surface is made from.
 * Blurs and saturates whatever is behind it, rimmed with a light edge.
 */
function Glass({
  className,
  intensity,
  tint,
  elevation,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & GlassVariantProps & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="glass"
      data-intensity={intensity ?? "default"}
      className={cn(glassVariants({ intensity, tint, elevation }), "rounded-surface", className)}
      {...props}
    />
  )
}

export { Glass, glassVariants }
