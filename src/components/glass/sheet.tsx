"use client"

import * as React from "react"
import { cn } from "cn"
import { Dialog as SheetPrimitive } from "radix-ui"
import { XIcon } from "lucide-react"

import { Button } from "@/components/glass/button"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      data-glass-motion=""
      className={cn(
        "fixed inset-0 z-50 bg-glass-dim duration-[calc(var(--glass-duration)*1.5)] ease-glass data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

type SheetSide = "top" | "right" | "bottom" | "left" | "start" | "end"

/**
 * A floating liquid-glass panel (the control layer) that slides from an edge —
 * inset from the screen edges (and the safe area) like an iPad sheet, not glued to them.
 * `start` / `end` follow the writing direction (left / right in LTR, mirrored in RTL).
 * Put long content in SheetBody so it scrolls between the header and footer.
 */
function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: SheetSide
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        data-glass-motion=""
        className={cn(
          "glass-liquid fixed z-50 flex flex-col gap-4 overflow-y-auto overscroll-contain rounded-surface text-sm text-popover-foreground ease-glass data-open:animate-in data-open:fade-in-0 data-open:duration-[calc(var(--glass-duration)*1.5)] data-closed:animate-out data-closed:fade-out-0 data-closed:duration-(--glass-duration)",
          // under reduced motion the slide is dropped — only the fade is left (and data-glass-motion stills even that)
          "motion-reduce:[--tw-enter-translate-x:0]! motion-reduce:[--tw-enter-translate-y:0]! motion-reduce:[--tw-exit-translate-x:0]! motion-reduce:[--tw-exit-translate-y:0]!",
          "data-[side=end]:inset-y-3 data-[side=left]:inset-y-3 data-[side=right]:inset-y-3 data-[side=start]:inset-y-3",
          "data-[side=end]:w-[calc(100%-1.5rem)] data-[side=left]:w-[calc(100%-1.5rem)] data-[side=right]:w-[calc(100%-1.5rem)] data-[side=start]:w-[calc(100%-1.5rem)] sm:data-[side=end]:max-w-sm sm:data-[side=left]:max-w-sm sm:data-[side=right]:max-w-sm sm:data-[side=start]:max-w-sm",
          "data-[side=right]:right-3 data-[side=right]:data-open:slide-in-from-right data-[side=right]:data-closed:slide-out-to-right",
          "data-[side=left]:left-3 data-[side=left]:data-open:slide-in-from-left data-[side=left]:data-closed:slide-out-to-left",
          "data-[side=end]:end-3 data-[side=end]:data-open:slide-in-from-end data-[side=end]:data-closed:slide-out-to-end",
          "data-[side=start]:start-3 data-[side=start]:data-open:slide-in-from-start data-[side=start]:data-closed:slide-out-to-start",
          "data-[side=top]:inset-x-3 data-[side=top]:top-[max(0.75rem,env(safe-area-inset-top))] data-[side=top]:max-h-[calc(100dvh-1.5rem-env(safe-area-inset-top))] data-[side=top]:data-open:slide-in-from-top data-[side=top]:data-closed:slide-out-to-top",
          "data-[side=bottom]:inset-x-3 data-[side=bottom]:bottom-[max(0.75rem,env(safe-area-inset-bottom))] data-[side=bottom]:max-h-[calc(100dvh-1.5rem-env(safe-area-inset-bottom))] data-[side=bottom]:data-open:slide-in-from-bottom data-[side=bottom]:data-closed:slide-out-to-bottom",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close data-slot="sheet-close" asChild>
            <Button variant="secondary" className="hit-area absolute top-3.5 end-3.5" size="icon-sm">
              <XIcon />
              <span className="sr-only">Close</span>
            </Button>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex shrink-0 flex-col gap-1 p-5 pe-14", className)} {...props} />
}

/** The sheet's scrolling middle: grows to fill, scrolls when the content is taller than the sheet. */
function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-body" className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-5", className)} {...props} />
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex shrink-0 flex-col gap-2 p-5", className)} {...props} />
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("type-glass-heading text-lg", className)} {...props} />
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetBody, SheetFooter, SheetTitle, SheetDescription }
