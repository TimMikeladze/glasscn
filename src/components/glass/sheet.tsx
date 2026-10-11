"use client"

import * as React from "react"
import { cn } from "cn"
import { Dialog as SheetPrimitive } from "radix-ui"
import { XIcon } from "lucide-react"

import { Button } from "@/components/glass/button"

const SheetContext = React.createContext<{ modal: boolean; setOpen: (open: boolean) => void }>({ modal: true, setOpen: () => {} })

/**
 * Root. `modal={false}` makes an inspector: no dimmed page, no focus trap, the page
 * stays usable and outside clicks don't close it.
 */
function Sheet({ modal = true, open, defaultOpen, onOpenChange, ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  const [inner, setInner] = React.useState(defaultOpen ?? false)
  const current = open ?? inner
  const setOpen = React.useCallback(
    (next: boolean) => {
      setInner(next)
      onOpenChange?.(next)
    },
    [onOpenChange]
  )
  const ctx = React.useMemo(() => ({ modal, setOpen }), [modal, setOpen])
  return (
    <SheetContext.Provider value={ctx}>
      <SheetPrimitive.Root data-slot="sheet" modal={modal} open={current} onOpenChange={setOpen} {...props} />
    </SheetContext.Provider>
  )
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

/** A resting height for a bottom sheet: half, full, a fraction of the viewport (0–1) or pixels. */
type SheetDetent = "medium" | "large" | number | `${number}px`

/** A detent's height in px for a viewport `vh` tall; `large` leaves `top` px clear at the top. */
export function detentHeight(detent: SheetDetent, vh: number, top = 0) {
  const max = vh - top
  if (detent === "large") return max
  if (detent === "medium") return Math.min(max, vh / 2)
  if (typeof detent === "number") return Math.min(max, vh * detent)
  return Math.min(max, parseFloat(detent))
}

/**
 * Where a drag ends: the index of the detent nearest the released height (flung past
 * by velocity, px/ms, positive = downward), or -1 to dismiss — dragged below half the
 * smallest detent, or flung down from it.
 */
export function settleDetent(heights: number[], height: number, velocity = 0) {
  const projected = height - velocity * 150
  const smallest = Math.min(...heights)
  if (projected < smallest / 2 || (velocity > 1 && height <= smallest)) return -1
  let best = 0
  heights.forEach((h, i) => {
    if (Math.abs(h - projected) < Math.abs(heights[best] - projected)) best = i
  })
  return best
}

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
  detents,
  detent,
  defaultDetent,
  onDetentChange,
  grabber,
  onBeforeDismiss,
  style,
  onInteractOutside,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: SheetSide
  showCloseButton?: boolean
  /** Bottom sheets: the heights it rests at, smallest first — `["medium", "large"]`. */
  detents?: SheetDetent[]
  /** The current detent's index (controlled). */
  detent?: number
  defaultDetent?: number
  onDetentChange?: (index: number) => void
  /** The capsule at the top: tap (or Enter / Space) cycles the detents, drag resizes or dismisses. Defaults on with detents. */
  grabber?: boolean
  /** Asked before a drag-to-dismiss closes the sheet; return false (or a promise of false) to keep it — "Discard changes?". */
  onBeforeDismiss?: () => boolean | Promise<boolean>
}) {
  const { modal, setOpen } = React.useContext(SheetContext)
  const sized = side === "bottom" && !!detents?.length
  const [innerDetent, setInnerDetent] = React.useState(defaultDetent ?? 0)
  const index = Math.min(detent ?? innerDetent, (detents?.length ?? 1) - 1)
  const setDetent = (i: number) => {
    setInnerDetent(i)
    onDetentChange?.(i)
  }
  const drag = useSheetDrag({ enabled: sized, detents: detents ?? [], index, setDetent, setOpen, onBeforeDismiss })
  const large = sized && detents?.[index] === "large"
  const showGrabber = grabber ?? sized
  return (
    <SheetPortal>
      {modal ? <SheetOverlay /> : null}
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        data-modal={modal ? undefined : "false"}
        data-detent={sized ? String(detents?.[index]) : undefined}
        data-dragging={drag.dragging ? "" : undefined}
        data-glass-motion=""
        onInteractOutside={(e) => {
          onInteractOutside?.(e)
          // an inspector stays open while the page is used
          if (!modal) e.preventDefault()
        }}
        style={sized ? { height: drag.height, ...style } : style}
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
          // detents: height follows the drag, springs to rest; full height turns opaque (iOS)
          "data-detent:overflow-hidden data-detent:transition-[height,background-color] data-detent:duration-[calc(var(--glass-duration)*1.5)] data-dragging:transition-none sm:data-detent:mx-auto sm:data-detent:max-w-xl motion-reduce:data-detent:transition-none",
          "data-[detent=large]:bg-popover data-[detent=large]:[--glass-liquid-opacity:100%]",
          className
        )}
        {...props}
      >
        {showGrabber ? <SheetGrabber detents={detents ?? []} index={index} large={large} onStep={(to) => setDetent(to)} {...drag.handle} /> : null}
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

function subscribeResize(onChange: () => void) {
  window.addEventListener("resize", onChange)
  return () => window.removeEventListener("resize", onChange)
}

/** Drag the grabber (or header) to resize between detents; release below the smallest to dismiss. */
function useSheetDrag({
  enabled,
  detents,
  index,
  setDetent,
  setOpen,
  onBeforeDismiss,
}: {
  enabled: boolean
  detents: SheetDetent[]
  index: number
  setDetent: (i: number) => void
  setOpen: (open: boolean) => void
  onBeforeDismiss?: () => boolean | Promise<boolean>
}) {
  const vh = React.useSyncExternalStore(subscribeResize, () => window.innerHeight, () => 0)
  const [dragHeight, setDragHeight] = React.useState<number | null>(null)
  // 0.75rem gap above and below, as the edges of an inset sheet
  const heights = detents.map((d) => detentHeight(d, vh, 24))
  const height = !enabled || !vh ? undefined : (dragHeight ?? heights[index])

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (!enabled || e.button !== 0) return
    const startY = e.clientY
    const startH = heights[index]
    let lastY = startY
    let lastT = e.timeStamp
    let velocity = 0
    let moved = false
    const move = (ev: PointerEvent) => {
      if (!moved && Math.abs(ev.clientY - startY) < 4) return
      moved = true
      const dt = Math.max(1, ev.timeStamp - lastT)
      velocity = (ev.clientY - lastY) / dt
      lastY = ev.clientY
      lastT = ev.timeStamp
      // rubber-band past the tallest detent
      const raw = startH - (ev.clientY - startY)
      const top = Math.max(...heights)
      setDragHeight(raw > top ? top + (raw - top) * 0.2 : Math.max(0, raw))
    }
    const up = async (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
      if (!moved) return
      const target = settleDetent(heights, startH - (ev.clientY - startY), velocity)
      setDragHeight(null)
      if (target >= 0) setDetent(target)
      else if ((await onBeforeDismiss?.()) !== false) setOpen(false)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
  }
  return { height, dragging: dragHeight !== null, handle: { onPointerDown } }
}

/**
 * The capsule at the top of a resizable sheet. A button: press (or Enter / Space) to
 * step to the next detent; Arrow Up / Down step up or down. Drag it to resize.
 */
function SheetGrabber({
  detents,
  index,
  large,
  onStep,
  onPointerDown,
}: {
  detents: SheetDetent[]
  index: number
  large: boolean
  onStep: (index: number) => void
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void
}) {
  const many = detents.length > 1
  const onCycle = () => onStep((index + 1) % detents.length)
  return (
    <div
      role="button"
      tabIndex={0}
      data-slot="sheet-grabber"
      aria-label={many ? (large ? "Shrink sheet" : "Expand sheet") : "Sheet grabber"}
      onClick={() => many && onCycle()}
      onPointerDown={onPointerDown}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (many) onCycle()
          e.preventDefault()
        } else if (e.key === "ArrowUp" && index < detents.length - 1) {
          onStep(index + 1)
          e.preventDefault()
        } else if (e.key === "ArrowDown" && index > 0) {
          onStep(index - 1)
          e.preventDefault()
        }
      }}
      className="glass-focus-inset absolute inset-x-0 top-0 z-10 flex h-6 cursor-grab touch-none items-center justify-center rounded-t-surface active:cursor-grabbing"
    >
      <span aria-hidden className="h-[0.3125rem] w-9 rounded-badge bg-fill-strong" />
    </div>
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

export type { SheetDetent }
export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetBody, SheetFooter, SheetTitle, SheetDescription }
