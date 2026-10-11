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
function Dock({ className, position = "fixed", ref: forwardedRef, ...props }: React.ComponentProps<"div"> & { position?: "fixed" | "static" }) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement)
  useDockInset(ref, position === "fixed")
  return (
    <div
      ref={ref}
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

/**
 * A fixed Dock publishes `--dock-inset` on <html>: its height plus its distance from the
 * bottom edge (safe area included). Pad scrolling content with it so nothing ends under
 * the dock — `pb-(--dock-inset)` — and the Toaster lifts its toasts above it.
 */
function useDockInset(ref: React.RefObject<HTMLElement | null>, fixed: boolean) {
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el || !fixed) return
    const root = document.documentElement
    let value = ""
    const update = () => {
      value = `calc(${el.offsetHeight}px + max(1rem, env(safe-area-inset-bottom)))`
      root.style.setProperty("--dock-inset", value)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => {
      observer.disconnect()
      if (root.style.getPropertyValue("--dock-inset") === value) root.style.removeProperty("--dock-inset")
    }
  }, [ref, fixed])
}

type DockBarProps = Omit<React.ComponentProps<typeof ToggleGroupPrimitive.Root>, "type" | "value" | "defaultValue" | "onValueChange"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

// The bar is liquid glass (the control layer); the pill inside it is a fill, never more glass.
const barClass = "glass-liquid relative flex items-center rounded-button p-1.5"
const indicator = <span data-slot="dock-indicator" aria-hidden className={cn(slidingIndicatorClass, "rounded-button bg-fill")} />
const itemClass =
  "relative z-10 flex h-[calc(3.25rem*var(--glass-density))] min-w-[min(4.5rem,13vw)] flex-col items-center justify-center gap-0.5 overflow-hidden rounded-button px-[min(0.75rem,2vw)] text-[0.65rem] whitespace-nowrap font-semibold text-foreground transition-[color,transform] duration-(--glass-duration) ease-glass glass-focus-inset active:scale-(--glass-press-scale) data-[state=on]:text-primary not-in-data-indicator-ready:data-[state=on]:bg-fill [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[1.35rem]"

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

/**
 * The round accent button beside the bar — compose, add, search. Tinted liquid glass:
 * the accent mixed into the frost, its glyph in the accent's ink (not a solid fill).
 */
function DockAction({ className, asChild = false, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="dock-action"
      className={cn(
        "glass-liquid glass-focus inline-flex size-[calc(3.75rem*var(--glass-density))] shrink-0 items-center justify-center rounded-button text-primary-ink transition-transform duration-(--glass-duration) ease-glass [--glass-tinted:color-mix(in_oklch,var(--primary)_45%,var(--glass-tint))] active:scale-(--glass-press-scale) [&_svg:not([class*='size-'])]:size-6",
        className
      )}
      {...props}
    />
  )
}

export { Dock, DockAction, DockBar, DockItem, DockLink, DockNav }
