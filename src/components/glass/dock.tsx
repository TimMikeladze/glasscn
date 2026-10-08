"use client"

import * as React from "react"
import { cn } from "cn"
import { Slot, ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { slidingIndicatorClass, useSlidingIndicator } from "@/hooks/use-sliding-indicator"

/**
 * The floating tab bar: a glass capsule of destinations with a pill that slides
 * to the current one, and an optional round action beside it.
 *
 *   <Dock>
 *     <DockBar value={tab} onValueChange={setTab}>
 *       <DockItem value="today"><MoonIcon />Today</DockItem>
 *       …
 *     </DockBar>
 *     <DockAction aria-label="Write"><PenIcon /></DockAction>
 *   </Dock>
 */
function Dock({ className, position = "fixed", ...props }: React.ComponentProps<"div"> & { position?: "fixed" | "static" }) {
  return (
    <div
      data-slot="dock"
      data-position={position}
      className={cn(
        "pointer-events-none z-40 flex items-center justify-center gap-3 data-[position=fixed]:fixed data-[position=fixed]:inset-x-0 data-[position=fixed]:bottom-[max(1rem,env(safe-area-inset-bottom))] *:pointer-events-auto",
        className
      )}
      {...props}
    />
  )
}

type DockBarProps = Omit<React.ComponentProps<typeof ToggleGroupPrimitive.Root>, "type" | "value" | "defaultValue" | "onValueChange"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

function DockBar({ className, value, defaultValue, onValueChange, children, ...props }: DockBarProps) {
  const [inner, setInner] = React.useState(defaultValue ?? "")
  const current = value ?? inner
  const ref = useSlidingIndicator<HTMLDivElement>('[data-slot="dock-item"][data-state="on"]')
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      type="single"
      data-slot="dock-bar"
      aria-label={props["aria-label"] ?? "Navigation"}
      value={current}
      onValueChange={(v: string) => {
        if (!v) return
        setInner(v)
        onValueChange?.(v)
      }}
      className={cn("glass relative flex items-center rounded-full p-1.5", className)}
      {...props}
    >
      <span data-slot="dock-indicator" aria-hidden className={cn(slidingIndicatorClass, "rounded-full bg-fill")} />
      {children}
    </ToggleGroupPrimitive.Root>
  )
}

function DockItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="dock-item"
      className={cn(
        "relative z-10 flex h-13 min-w-18 flex-col items-center justify-center gap-0.5 rounded-full px-3 text-[0.65rem] font-semibold text-foreground transition-[color,transform] outline-none active:scale-95 focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=on]:text-primary [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[1.35rem]",
        className
      )}
      {...props}
    />
  )
}

/** The round accent button beside the bar — compose, add, search. */
function DockAction({ className, asChild = false, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="dock-action"
      className={cn(
        "inline-flex size-15 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_24px_color-mix(in_oklch,var(--primary)_35%,transparent),inset_0_1px_0_oklch(1_0_0/35%)] transition-transform outline-none active:scale-92 focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg:not([class*='size-'])]:size-6",
        className
      )}
      {...props}
    />
  )
}

export { Dock, DockBar, DockItem, DockAction }
