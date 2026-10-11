"use client"

import * as React from "react"
import { cn } from "cn"
import { Slot, ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { slidingIndicatorClass, useSlidingIndicator } from "@/hooks/use-sliding-indicator"

/**
 * The floating tab bar: a glass capsule of destinations with a pill that slides
 * to the current one, and an optional round action beside it.
 *
 * Routes — a nav landmark of links, the current one marked `active` (aria-current="page"):
 *
 *   <Dock>
 *     <DockNav>
 *       <DockLink href="/today" active><MoonIcon />Today</DockLink>
 *       <DockLink asChild><Link href="/trends"><ChartIcon />Trends</Link></DockLink>
 *     </DockNav>
 *     <DockAction aria-label="Write"><PenIcon /></DockAction>
 *   </Dock>
 *
 * Views inside one page — a single-choice group:
 *
 *   <DockBar value={tab} onValueChange={setTab}>
 *     <DockItem value="today"><MoonIcon />Today</DockItem>
 *   </DockBar>
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

const barClass = "glass relative flex items-center rounded-button p-1.5"
const indicator = <span data-slot="dock-indicator" aria-hidden className={cn(slidingIndicatorClass, "rounded-button bg-fill")} />
const itemClass =
  "relative z-10 flex h-[calc(3.25rem*var(--glass-density))] min-w-[min(4.5rem,13vw)] flex-col items-center justify-center gap-0.5 overflow-hidden rounded-button px-[min(0.75rem,2vw)] text-[0.65rem] whitespace-nowrap font-semibold text-foreground transition-[color,transform] duration-(--glass-duration) ease-glass focus-visible:outline-hidden active:scale-(--glass-press-scale) focus-visible:ring-(length:--glass-ring-width) focus-visible:ring-ring/50 data-[state=on]:text-primary [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[1.35rem]"

/** In-page views: one choice at a time (radio semantics). For routes use DockNav. */
function DockBar({ className, value, defaultValue, onValueChange, children, ref: forwardedRef, ...props }: DockBarProps) {
  const [inner, setInner] = React.useState(defaultValue ?? "")
  const current = value ?? inner
  const ref = useSlidingIndicator<HTMLDivElement>('[data-slot="dock-item"][data-state="on"]', forwardedRef)
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
      className={cn(barClass, className)}
      {...props}
    >
      {indicator}
      {children}
    </ToggleGroupPrimitive.Root>
  )
}

/** Route navigation: a `nav` landmark of DockLinks. */
function DockNav({ className, children, ref: forwardedRef, ...props }: React.ComponentProps<"nav">) {
  const ref = useSlidingIndicator<HTMLElement>('[data-slot="dock-item"][data-state="on"]', forwardedRef)
  return (
    <nav ref={ref} data-slot="dock-bar" aria-label="Main" className={cn(barClass, className)} {...props}>
      {indicator}
      {children}
    </nav>
  )
}

/** A destination link. `active` marks the current page (aria-current) and moves the pill to it. */
function DockLink({ className, active = false, asChild = false, ...props }: React.ComponentProps<"a"> & { active?: boolean; asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "a"
  return <Comp data-slot="dock-item" data-state={active ? "on" : "off"} aria-current={active ? "page" : undefined} className={cn(itemClass, className)} {...props} />
}

function DockItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return <ToggleGroupPrimitive.Item data-slot="dock-item" className={cn(itemClass, className)} {...props} />
}

/** The round accent button beside the bar — compose, add, search. */
function DockAction({ className, asChild = false, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="dock-action"
      className={cn(
        "inline-flex size-[calc(3.75rem*var(--glass-density))] shrink-0 items-center justify-center rounded-button bg-primary text-primary-foreground shadow-glass-accent transition-transform duration-(--glass-duration) ease-glass focus-visible:outline-hidden active:scale-(--glass-press-scale) focus-visible:ring-(length:--glass-ring-width) focus-visible:ring-ring/50 [&_svg:not([class*='size-'])]:size-6",
        className
      )}
      {...props}
    />
  )
}

export { Dock, DockAction, DockBar, DockItem, DockLink, DockNav }
