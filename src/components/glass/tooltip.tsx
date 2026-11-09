"use client"

import * as React from "react"
import { cn } from "@/lib/glass-cn"
import { Tooltip as TooltipPrimitive } from "radix-ui"
import { GlassPortal } from "@/lib/glass-portal"

function TooltipProvider({ delayDuration = 120, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />
}

/** Brings its own provider (as shadcn's does), so a Tooltip works anywhere; an outer TooltipProvider still sets shared delays. */
function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

/** A small liquid-glass capsule (the control layer) that grows out of its trigger. */
function TooltipContent({ className, sideOffset = 6, children, ...props }: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <GlassPortal>{(container) => <TooltipPrimitive.Portal container={container}>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        data-glass-motion=""
        sideOffset={sideOffset}
        className={cn(
          "glass-liquid z-50 inline-flex w-fit max-w-xs items-center gap-1.5 rounded-[min(var(--glass-radius-button),1rem)] px-3 py-1.5 text-xs font-medium text-popover-foreground [--glass-shadow-y:6px] [--glass-shadow-blur:18px] has-data-[slot=kbd]:pe-1.5 glass-materialize glass-morph-origin [--glass-morph-w:var(--radix-tooltip-trigger-width)] [--glass-morph-h:var(--radix-tooltip-trigger-height)] [--glass-morph-origin:var(--radix-tooltip-content-transform-origin)]",
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>}</GlassPortal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
