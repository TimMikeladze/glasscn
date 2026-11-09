"use client"

import * as React from "react"
import { cn } from "@/lib/glass-cn"
import { Popover as PopoverPrimitive } from "radix-ui"
import { GlassPortal } from "@/lib/glass-portal"
import { GlassMorphContext, useGlassMorphRef, useGlassPresentation } from "@/lib/glass-transitions"

function Popover({ open, defaultOpen, onOpenChange, ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  const presentation = useGlassPresentation({ open, defaultOpen, onOpenChange })
  return <GlassMorphContext.Provider value={presentation}><PopoverPrimitive.Root data-slot="popover" open={presentation.open} onOpenChange={presentation.setOpen} {...props} /></GlassMorphContext.Provider>
}

function PopoverTrigger({ ref, ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  const source = useGlassMorphRef<HTMLButtonElement>("trigger", ref)
  return <PopoverPrimitive.Trigger ref={source} data-slot="popover-trigger" {...props} />
}

/**
 * A liquid-glass panel (the control layer), never taller than the space available — it scrolls.
 * It grows out of its trigger and materialises; reduced motion cross-fades. Inside it use fills, not glass.
 */
function PopoverContent({ className, ref, align = "center", sideOffset = 8, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  const morph = React.useContext(GlassMorphContext)
  const target = useGlassMorphRef<HTMLDivElement>("content", ref)
  return (
    <GlassPortal>{(container) => <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Content
        ref={target}
        data-slot="popover-content"
        data-morphing={morph?.morphing || undefined}
        data-glass-motion=""
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "glass-liquid z-50 flex max-h-(--radix-popover-content-available-height) w-72 flex-col gap-3 overflow-y-auto overscroll-contain rounded-surface-sm p-4 text-sm text-popover-foreground outline-hidden glass-materialize data-morphing:animate-none! data-morphing:[clip-path:none] data-morphing:transition-none glass-morph-origin [--glass-morph-w:var(--radix-popover-trigger-width)] [--glass-morph-h:var(--radix-popover-trigger-height)] [--glass-morph-origin:var(--radix-popover-content-transform-origin)]",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>}</GlassPortal>
  )
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger }
