"use client"

import * as React from "react"
import { cn } from "cn"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"

import { AlertDialogDescription, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle } from "@/components/glass/alert-dialog"

/**
 * The iOS action sheet: a short list of choices tied to what the person just did,
 * rising from the bottom on phones and centred from `sm`. The choices share one
 * piece of liquid glass; Cancel is its own capsule below. Tapping outside cancels.
 * Built on the alert-dialog primitives (focus trap, Escape, roles).
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

const ActionSheetContext = React.createContext<(open: boolean) => void>(() => {})

function ActionSheet({ open, defaultOpen, onOpenChange, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  const [inner, setInner] = React.useState(defaultOpen ?? false)
  const setOpen = React.useCallback(
    (next: boolean) => {
      setInner(next)
      onOpenChange?.(next)
    },
    [onOpenChange]
  )
  return (
    <ActionSheetContext.Provider value={setOpen}>
      <AlertDialogPrimitive.Root data-slot="action-sheet" open={open ?? inner} onOpenChange={setOpen} {...props} />
    </ActionSheetContext.Provider>
  )
}

function ActionSheetTrigger(props: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="action-sheet-trigger" {...props} />
}

function ActionSheetContent({ className, children, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  const setOpen = React.useContext(ActionSheetContext)
  // the content fills the screen so a tap beside the sheet lands here: that tap cancels
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="action-sheet-content"
        data-glass-motion=""
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) setOpen(false)
        }}
        className={cn(
          "fixed inset-0 z-50 flex flex-col justify-end gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] outline-hidden sm:items-center sm:justify-center",
          "duration-[calc(var(--glass-duration)*1.5)] ease-glass data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-8 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom-8 sm:data-open:slide-in-from-bottom-0 sm:data-open:zoom-in-95 sm:data-closed:slide-out-to-bottom-0 sm:data-closed:zoom-out-95",
          "motion-reduce:[--tw-enter-translate-y:0]! motion-reduce:[--tw-exit-translate-y:0]! motion-reduce:[--tw-enter-scale:1]! motion-reduce:[--tw-exit-scale:1]!",
          "*:w-full *:sm:max-w-sm",
          className
        )}
        {...props}
      >
        <ActionSheetGroupFrame>{React.Children.toArray(children).filter((c) => !isCancel(c))}</ActionSheetGroupFrame>
        {React.Children.toArray(children).filter(isCancel)}
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  )
}

const isCancel = (c: React.ReactNode) => React.isValidElement(c) && c.type === ActionSheetCancel

/** The shared glass behind the header and the choices. */
function ActionSheetGroupFrame({ children }: { children: React.ReactNode }) {
  return (
    <div data-slot="action-sheet-group" className="glass-liquid flex max-h-[70dvh] flex-col overflow-y-auto overscroll-contain rounded-surface divide-y divide-separator">
      {children}
    </div>
  )
}

function ActionSheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="action-sheet-header" className={cn("grid gap-0.5 px-pad py-3 text-center", className)} {...props} />
}

function ActionSheetTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogTitle>) {
  return <AlertDialogTitle data-slot="action-sheet-title" className={cn("text-sm font-semibold text-muted-foreground", className)} {...props} />
}

function ActionSheetDescription({ className, ...props }: React.ComponentProps<typeof AlertDialogDescription>) {
  return <AlertDialogDescription data-slot="action-sheet-description" className={cn("text-xs", className)} {...props} />
}

const row =
  "glass-focus-inset flex h-control-lg w-full shrink-0 items-center justify-center gap-2 px-pad text-base text-primary-ink transition-colors duration-(--glass-duration) ease-glass hover:bg-fill active:bg-fill-strong disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-5"

/** A choice; it closes the sheet. `destructive` for the risky one; `preferred` sets it in bold. */
function ActionSheetAction({ className, variant = "default", ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Action> & { variant?: "default" | "destructive" | "preferred" }) {
  return (
    <AlertDialogPrimitive.Action
      data-slot="action-sheet-action"
      data-variant={variant}
      className={cn(row, "data-[variant=destructive]:text-destructive-ink data-[variant=preferred]:font-semibold", className)}
      {...props}
    />
  )
}

/** Cancel, in its own capsule below the choices, in bold. Focused on open. */
function ActionSheetCancel({ className, children = "Cancel", ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel data-slot="action-sheet-cancel" className={cn("glass-liquid rounded-surface font-semibold", row, className)} {...props}>
      {children}
    </AlertDialogPrimitive.Cancel>
  )
}

export { ActionSheet, ActionSheetAction, ActionSheetCancel, ActionSheetContent, ActionSheetDescription, ActionSheetHeader, ActionSheetTitle, ActionSheetTrigger }
