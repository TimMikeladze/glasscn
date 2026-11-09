"use client"

import * as React from "react"
import { cn } from "@/lib/glass-cn"
import { Dialog as DialogPrimitive } from "radix-ui"

import { DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from "@/components/glass/dialog"
import { GlassMorphContext, useGlassMorphRef, useGlassPresentation } from "@/lib/glass-transitions"

/**
 * A custom action sheet: a short list of choices tied to what the person just did,
 * rising from the bottom on phones and centred from `sm`. The choices share one
 * piece of liquid glass; Cancel is its own capsule below. Tapping outside cancels.
 * Built on Dialog for focus trapping, Escape and implicit outside dismissal.
 *
 * `placement="source"` is the iOS 27 sheet with a source: it opens beside its trigger, drops
 * Cancel (tapping outside cancels) and leaves the rest of the page usable.
 *
 *   <ActionSheet>
 *     <ActionSheetTrigger asChild><Button>…</Button></ActionSheetTrigger>
 *     <ActionSheetContent>
 *       <ActionSheetHeader><ActionSheetTitle>Delete entry?</ActionSheetTitle></ActionSheetHeader>
 *       <ActionSheetAction variant="destructive" onClick={remove}>Delete</ActionSheetAction>
 *       <ActionSheetAction>Archive</ActionSheetAction>
 *       <ActionSheetCancel />
 *     </ActionSheetContent>
 *   </ActionSheet>
 */

type Placement = "sheet" | "source"
const ActionSheetContext = React.createContext<{ setOpen: (open: boolean) => void; placement: Placement; triggerRef: React.RefObject<HTMLElement | null> }>({ setOpen: () => {}, placement: "sheet", triggerRef: { current: null } })

function ActionSheet({ open, defaultOpen, onOpenChange, placement = "sheet", ...props }: React.ComponentProps<typeof DialogPrimitive.Root> & { placement?: Placement }) {
  const presentation = useGlassPresentation({ open, defaultOpen, onOpenChange })
  const { setOpen } = presentation
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const ctx = React.useMemo(() => ({ setOpen, placement, triggerRef }), [setOpen, placement])
  return (
    <GlassMorphContext.Provider value={presentation}>
      <ActionSheetContext.Provider value={ctx}>
        <DialogPrimitive.Root data-slot="action-sheet" modal={placement === "sheet"} open={presentation.open} onOpenChange={setOpen} {...props} />
      </ActionSheetContext.Provider>
    </GlassMorphContext.Provider>
  )
}

function ActionSheetTrigger({ ref, ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  const { triggerRef } = React.useContext(ActionSheetContext)
  const source = useGlassMorphRef<HTMLButtonElement>("trigger", ref)
  const attach = React.useCallback((node: HTMLButtonElement | null) => { triggerRef.current = node; source(node) }, [triggerRef, source])
  return <DialogPrimitive.Trigger ref={attach} data-slot="action-sheet-trigger" {...props} />
}

/** Beside the trigger, opening toward the side with more room; kept inside the viewport. */
function useSourcePosition(triggerRef: React.RefObject<HTMLElement | null>, active: boolean) {
  const [style, setStyle] = React.useState<React.CSSProperties>({ visibility: "hidden" })
  React.useLayoutEffect(() => {
    if (!active) return
    const place = () => {
      const r = triggerRef.current?.getBoundingClientRect()
      if (!r) return
      const width = Math.min(288, window.innerWidth - 24)
      const left = Math.max(12, Math.min(r.right - width, window.innerWidth - width - 12))
      const below = window.innerHeight - r.bottom > r.top
      setStyle(below ? { left, width, top: r.bottom + 8 } : { left, width, bottom: window.innerHeight - r.top + 8 })
    }
    place()
    window.addEventListener("resize", place)
    window.addEventListener("scroll", place, true)
    return () => { window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true) }
  }, [triggerRef, active])
  return style
}

function ActionSheetContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  const { setOpen, placement, triggerRef } = React.useContext(ActionSheetContext)
  const morph = React.useContext(GlassMorphContext)
  const source = placement === "source"
  const position = useSourcePosition(triggerRef, source)
  if (source) {
    // no Cancel and no scrim: a tap outside cancels (Radix's non-modal outside dismissal)
    return (
      <DialogPortal>
        <DialogPrimitive.Content
          data-slot="action-sheet-content"
          data-placement="source"
          data-glass-motion=""
          style={position}
          className={cn("fixed z-50 outline-hidden duration-(--glass-duration) ease-glass data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 motion-reduce:[--tw-enter-scale:1]! motion-reduce:[--tw-exit-scale:1]!", className)}
          {...props}
        >
          <ActionSheetGroupFrame>{React.Children.toArray(children).filter((c) => !isCancel(c))}</ActionSheetGroupFrame>
        </DialogPrimitive.Content>
      </DialogPortal>
    )
  }
  // the content fills the screen so a tap beside the sheet lands here: that tap cancels
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="action-sheet-content"
        data-morphing={morph?.morphing || undefined}
        data-glass-motion=""
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) setOpen(false)
        }}
        className={cn(
          "fixed inset-0 z-50 flex flex-col justify-end gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] outline-hidden sm:items-center sm:justify-center",
          "duration-[calc(var(--glass-duration)*1.5)] ease-glass data-morphing:animate-none! data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-8 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom-8 sm:data-open:slide-in-from-bottom-0 sm:data-open:zoom-in-95 sm:data-closed:slide-out-to-bottom-0 sm:data-closed:zoom-out-95",
          "motion-reduce:[--tw-enter-translate-y:0]! motion-reduce:[--tw-exit-translate-y:0]! motion-reduce:[--tw-enter-scale:1]! motion-reduce:[--tw-exit-scale:1]!",
          "*:w-full *:sm:max-w-sm",
          className
        )}
        {...props}
      >
        <ActionSheetGroupFrame>{React.Children.toArray(children).filter((c) => !isCancel(c))}</ActionSheetGroupFrame>
        {React.Children.toArray(children).filter(isCancel)}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

const isCancel = (c: React.ReactNode) => React.isValidElement(c) && c.type === ActionSheetCancel

/** The shared glass behind the header and the choices. */
function ActionSheetGroupFrame({ children }: { children: React.ReactNode }) {
  const target = useGlassMorphRef<HTMLDivElement>("content")
  return (
    <div ref={target} data-slot="action-sheet-group" className="glass-liquid flex max-h-[70dvh] flex-col overflow-y-auto overscroll-contain rounded-surface divide-y divide-separator">
      {children}
    </div>
  )
}

function ActionSheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="action-sheet-header" className={cn("grid gap-0.5 px-pad py-3 text-center", className)} {...props} />
}

function ActionSheetTitle({ className, ...props }: React.ComponentProps<typeof DialogTitle>) {
  return <DialogTitle data-slot="action-sheet-title" className={cn("text-sm font-semibold text-muted-foreground", className)} {...props} />
}

function ActionSheetDescription({ className, ...props }: React.ComponentProps<typeof DialogDescription>) {
  return <DialogDescription data-slot="action-sheet-description" className={cn("text-xs", className)} {...props} />
}

const row =
  "glass-focus-inset flex h-control-lg w-full shrink-0 items-center justify-center gap-2 px-pad text-base text-primary-ink transition-colors duration-(--glass-duration) ease-glass hover:bg-fill active:bg-fill-strong disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-5"

/** A choice; it closes the sheet. `destructive` for the risky one; `preferred` sets it in bold. */
function ActionSheetAction({ className, variant = "default", ...props }: React.ComponentProps<typeof DialogPrimitive.Close> & { variant?: "default" | "destructive" | "preferred" }) {
  return (
    <DialogPrimitive.Close
      data-slot="action-sheet-action"
      data-variant={variant}
      className={cn(row, "data-[variant=destructive]:text-destructive-label data-[variant=preferred]:font-semibold", className)}
      {...props}
    />
  )
}

/** Cancel, in its own capsule below the choices. Focus returns to the trigger on close. */
function ActionSheetCancel({ className, children = "Cancel", ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close data-slot="action-sheet-cancel" className={cn("glass-liquid rounded-surface font-semibold", row, className)} {...props}>
      {children}
    </DialogPrimitive.Close>
  )
}

export { ActionSheet, ActionSheetAction, ActionSheetCancel, ActionSheetContent, ActionSheetDescription, ActionSheetHeader, ActionSheetTitle, ActionSheetTrigger }
