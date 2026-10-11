"use client"

import * as React from "react"
import { cn } from "cn"
import { Slot, ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { useGlassPointer } from "@/hooks/use-glass-pointer"
import { slidingIndicatorClass, useSlidingIndicator } from "@/hooks/use-sliding-indicator"
import { useScrollMinimized } from "@/components/glass/scroll-edge"
import { SearchField, type SearchFieldProps } from "@/components/glass/search-field"

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
 *
 * `minimizeBehavior="onScrollDown"` folds the bar to its current item while the page
 * scrolls down; a `DockAccessory` (now playing, a draft) sits above the bar and moves
 * inline beside it when minimized — read where with `usePlacement()`. `DockSearch` is
 * the separate search tab that opens into a field. Drag across the bar to scrub.
 */

type Placement = "expanded" | "inline"
type DockCtx = { minimized: boolean; placement: Placement; setSearching: (on: boolean) => void }
const DockContext = React.createContext<DockCtx>({ minimized: false, placement: "expanded", setSearching: () => {} })

/** Where a DockAccessory currently sits: above the bar (`expanded`) or beside the minimized bar (`inline`). */
function usePlacement(): Placement {
  return React.useContext(DockContext).placement
}

type DockProps = React.ComponentProps<"div"> & {
  position?: "fixed" | "static"
  /** `onScrollDown` folds the bar to its current item while content scrolls down; it opens again on scroll up. */
  minimizeBehavior?: "never" | "onScrollDown"
  /** `compact` lays icon and label side by side in shorter items (iPad, landscape). */
  layout?: "default" | "compact"
}

function Dock({ className, position = "fixed", minimizeBehavior = "never", layout = "default", ref: forwardedRef, ...props }: DockProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement)
  useDockInset(ref, position === "fixed")
  const scrolled = useScrollMinimized(ref, minimizeBehavior === "onScrollDown")
  const [searching, setSearching] = React.useState(false)
  const minimized = scrolled || searching
  const ctx = React.useMemo<DockCtx>(() => ({ minimized, placement: minimized ? "inline" : "expanded", setSearching }), [minimized])
  return (
    <DockContext.Provider value={ctx}>
      <div
        ref={ref}
        data-slot="dock"
        data-position={position}
        data-layout={layout}
        data-bar-edge={position === "fixed" ? "bottom" : undefined}
        data-minimized={minimized ? "" : undefined}
        className={cn(
          "group/dock pointer-events-none z-40 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-3 data-[position=fixed]:fixed data-[position=fixed]:inset-x-0 data-[position=fixed]:bottom-[max(1rem,env(safe-area-inset-bottom))] *:pointer-events-auto",
          "data-minimized:flex-nowrap",
          className
        )}
        {...props}
      />
    </DockContext.Provider>
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

const itemSelector = '[data-slot="dock-item"]'

/**
 * Drag across the bar to scrub: the item under the finger is picked as it passes (a
 * DockBar), or opened on release (a DockNav). A plain tap is left to the item itself.
 */
function useScrub(onPick: (item: HTMLElement, done: boolean) => void) {
  const [dragging, setDragging] = React.useState(false)
  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return
    const bar = e.currentTarget
    const start = e.clientX
    let moved = false
    let last: HTMLElement | null = null
    const at = (x: number, y: number) => {
      const hit = document.elementFromPoint(x, y)?.closest<HTMLElement>(itemSelector)
      return hit && bar.contains(hit) && !hit.matches(":disabled,[data-disabled]") ? hit : null
    }
    const move = (ev: PointerEvent) => {
      if (!moved && Math.abs(ev.clientX - start) < 6) return
      if (!moved) {
        moved = true
        setDragging(true)
      }
      const item = at(ev.clientX, ev.clientY)
      if (item && item !== last) {
        last = item
        onPick(item, false)
      }
    }
    const up = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
      if (!moved) return
      setDragging(false)
      if (last) onPick(last, true)
      // the click that follows a drag lands on the bar, not an item; nothing to cancel
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
  }
  return { dragging, onPointerDown }
}

type DockBarProps = Omit<React.ComponentProps<typeof ToggleGroupPrimitive.Root>, "type" | "value" | "defaultValue" | "onValueChange"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

// The bar is liquid glass (the control layer); the pill inside it is a fill, never more glass.
const barClass = "glass-liquid glass-shadow-adaptive relative flex touch-pan-y items-center rounded-button p-1.5 select-none"
const indicator = (
  <span
    data-slot="dock-indicator"
    data-glass-motion=""
    aria-hidden
    className={cn(slidingIndicatorClass, "rounded-button bg-fill in-data-dragging:bg-fill-strong")}
  />
)
const itemClass = cn(
  "relative z-10 flex h-control-lg min-w-[min(4.5rem,13vw)] flex-col items-center justify-center gap-0.5 overflow-visible rounded-button px-[min(0.75rem,2vw)] text-[0.65rem] whitespace-nowrap font-semibold text-foreground transition-[color,transform] duration-(--glass-duration) ease-glass glass-focus-inset active:scale-(--glass-press-scale) data-[state=on]:text-primary not-in-data-indicator-ready:data-[state=on]:bg-fill [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[1.35rem]",
  "data-prominent:text-primary-ink",
  // compact: icon and label side by side, a shorter bar
  "group-data-[layout=compact]/dock:h-control group-data-[layout=compact]/dock:flex-row group-data-[layout=compact]/dock:gap-1.5 group-data-[layout=compact]/dock:px-pad-sm group-data-[layout=compact]/dock:text-xs group-data-[layout=compact]/dock:[&_svg:not([class*='size-'])]:size-[1.1rem]",
  // minimized: only the current item, glyph only
  "group-data-minimized/dock:min-w-control-lg group-data-minimized/dock:gap-0 group-data-minimized/dock:px-0 group-data-minimized/dock:text-[0px] group-data-minimized/dock:data-[state=off]:hidden"
)

/** A count on an item: "3" reads as "3 new" to assistive tech. */
function DockBadge({ children }: { children: React.ReactNode }) {
  if (children == null || children === false || children === 0) return null
  return (
    <span
      data-slot="dock-badge"
      className="pointer-events-none absolute -top-0.5 start-1/2 ms-1.5 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-badge bg-destructive px-1 text-[0.65rem] leading-none font-semibold text-destructive-foreground numeric-glass group-data-minimized/dock:ms-2"
    >
      {children}
      <span className="sr-only"> new</span>
    </span>
  )
}

/** In-page views: one choice at a time (radio semantics). For routes use DockNav. */
function DockBar({ className, value, defaultValue, onValueChange, children, onPointerDown, ref: forwardedRef, ...props }: DockBarProps) {
  const [inner, setInner] = React.useState(defaultValue ?? "")
  const current = value ?? inner
  const ref = useSlidingIndicator<HTMLDivElement>('[data-slot="dock-item"][data-state="on"]', forwardedRef)
  const select = (v: string) => {
    if (!v || v === current) return
    setInner(v)
    onValueChange?.(v)
  }
  const scrub = useScrub((item) => select(item.dataset.value ?? ""))
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      type="single"
      data-slot="dock-bar"
      data-dragging={scrub.dragging ? "" : undefined}
      aria-label={props["aria-label"] ?? "Navigation"}
      value={current}
      onValueChange={select}
      onPointerDown={(e: React.PointerEvent<HTMLDivElement>) => {
        onPointerDown?.(e)
        scrub.onPointerDown(e)
      }}
      className={cn(barClass, className)}
      {...props}
    >
      {indicator}
      {children}
    </ToggleGroupPrimitive.Root>
  )
}

/** Route navigation: a `nav` landmark of DockLinks. Drag across it and release to open the link under your finger. */
function DockNav({ className, children, onPointerDown, ref: forwardedRef, ...props }: React.ComponentProps<"nav">) {
  const ref = useSlidingIndicator<HTMLElement>('[data-slot="dock-item"][data-state="on"]', forwardedRef)
  const scrub = useScrub((item, done) => {
    if (done && item.getAttribute("aria-current") !== "page") item.click()
  })
  return (
    <nav
      ref={ref}
      data-slot="dock-bar"
      data-dragging={scrub.dragging ? "" : undefined}
      aria-label="Main"
      onPointerDown={(e) => {
        onPointerDown?.(e)
        scrub.onPointerDown(e)
      }}
      className={cn(barClass, className)}
      {...props}
    >
      {indicator}
      {children}
    </nav>
  )
}

type ItemExtras = {
  /** A count (or short text) in a red badge on the item's corner. */
  badge?: React.ReactNode
  /** Tint the item in the accent even when it isn't current — the one destination to draw the eye to. */
  prominent?: boolean
}

/** A destination link. `active` marks the current page (aria-current) and moves the pill to it. */
function DockLink({ className, active = false, asChild = false, badge, prominent = false, children, ...props }: React.ComponentProps<"a"> & { active?: boolean; asChild?: boolean } & ItemExtras) {
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="dock-item"
      data-state={active ? "on" : "off"}
      data-prominent={prominent ? "" : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(itemClass, className)}
      {...props}
    >
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
      <DockBadge>{badge}</DockBadge>
    </Comp>
  )
}

function DockItem({ className, badge, prominent = false, children, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & ItemExtras) {
  return (
    <ToggleGroupPrimitive.Item data-slot="dock-item" data-value={props.value} data-prominent={prominent ? "" : undefined} className={cn(itemClass, className)} {...props}>
      {children}
      <DockBadge>{badge}</DockBadge>
    </ToggleGroupPrimitive.Item>
  )
}

/**
 * The round accent button beside the bar — compose, add, search. Tinted liquid glass
 * (`glass-prominent`): the accent mixed into the frost, a lit rim, a glow where pressed.
 */
function DockAction({ className, asChild = false, ref: forwardedRef, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  const ref = useGlassPointer<HTMLButtonElement>({}, forwardedRef)
  return (
    <Comp
      ref={ref}
      data-slot="dock-action"
      className={cn(
        "glass-prominent glass-illuminate glass-press-liquid glass-shadow-adaptive glass-focus inline-flex size-[calc(var(--spacing-control-lg)+0.75rem)] shrink-0 items-center justify-center rounded-button transition-transform duration-(--glass-duration) ease-glass group-data-minimized/dock:size-control-lg [&_svg:not([class*='size-'])]:size-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * A companion above the bar — a now-playing strip, a draft in progress. When the dock
 * minimizes it moves inline beside the bar; children can read `usePlacement()` to
 * show less there.
 */
function DockAccessory({ className, ...props }: React.ComponentProps<"div">) {
  const placement = usePlacement()
  return (
    <div
      data-slot="dock-accessory"
      data-placement={placement}
      className={cn(
        "glass-liquid glass-shadow-adaptive flex h-control-lg min-w-0 items-center gap-3 rounded-button px-pad-sm text-sm",
        "data-[placement=expanded]:order-first data-[placement=expanded]:w-full data-[placement=expanded]:max-w-md data-[placement=expanded]:basis-full",
        "data-[placement=inline]:max-w-xs data-[placement=inline]:flex-1",
        className
      )}
      {...props}
    />
  )
}

/**
 * The search tab: a round glass button at the end of the dock that opens into a search
 * field; while it's open the bar folds to its current item. Takes SearchField's props.
 */
function DockSearch({ className, onExpandedChange, ...props }: Omit<SearchFieldProps, "minimized" | "placement">) {
  const { setSearching } = React.useContext(DockContext)
  React.useEffect(() => () => setSearching(false), [setSearching])
  return (
    <SearchField
      minimized
      onExpandedChange={(open) => {
        setSearching(open)
        onExpandedChange?.(open)
      }}
      className={cn("data-expanded:min-w-0 data-expanded:flex-1 data-expanded:max-w-md", className)}
      {...props}
    />
  )
}

export { Dock, DockAccessory, DockAction, DockBar, DockItem, DockLink, DockNav, DockSearch, usePlacement }
