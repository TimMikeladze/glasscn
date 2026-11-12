"use client"

import * as React from "react"
import { cn } from "@/lib/glass-cn"
import { Dialog as DialogPrimitive } from "radix-ui"
import { GlassPortal } from "@/lib/glass-portal"
import { XIcon } from "lucide-react"
import { GlassMorphContext, useGlassMorphRef, useGlassPresentation } from "@/lib/glass-transitions"

import { Button } from "@/components/glass/button"

/**
 * Opens out of its trigger: the trigger morphs into the panel (and back on close) with a
 * View Transition where the browser has them; elsewhere, and under reduced motion, the panel
 * materialises in place. Controlled or not, as Radix's Dialog.
 */
function Dialog({ open, defaultOpen = false, onOpenChange, ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  const presentation = useGlassPresentation({ open, defaultOpen, onOpenChange })
  return (
    <GlassMorphContext.Provider value={presentation}>
      <DialogPrimitive.Root data-slot="dialog" open={presentation.open} onOpenChange={presentation.setOpen} {...props} />
    </GlassMorphContext.Provider>
  )
}

function DialogTrigger({ ref, ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  const source = useGlassMorphRef<HTMLButtonElement>("trigger", ref)
  return <DialogPrimitive.Trigger ref={source} data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ container, ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <GlassPortal container={container}>{(host) => <DialogPrimitive.Portal data-slot="dialog-portal" container={host} {...props} />}</GlassPortal>
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

/** The page dims behind the glass (no blur: a blurred scrim under a frosted pane is blur on blur). */
function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      data-glass-motion=""
      className={cn(
        "fixed inset-0 isolate z-50 bg-glass-dim transition-none duration-(--glass-duration) ease-glass data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * A liquid-glass panel (the control layer) over a dimmed page. Never taller than the
 * viewport: long content scrolls — wrap it in DialogBody to keep the header and footer in view.
 * Inside it use fills and `secondary` / `ghost` buttons, never more glass.
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ref,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { showCloseButton?: boolean }) {
  const morph = React.useContext(GlassMorphContext)
  const setRef = useGlassMorphRef<HTMLDivElement>("content", ref)
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={setRef}
        data-slot="dialog-content"
        data-glass-motion=""
        // the View Transition is the animation: don't materialise on top of it
        data-morphing={morph?.morphing || undefined}
        className={cn(
          "glass-liquid fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto overscroll-contain rounded-surface p-6 text-sm text-popover-foreground focus-visible:outline-hidden sm:max-w-md glass-materialize data-morphing:animate-none!",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <Button variant="secondary" className="hit-area absolute top-3.5 end-3.5" size="icon-sm">
              <XIcon />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("flex flex-col gap-1.5 pe-8", className)} {...props} />
}

/** The scrolling middle of a long dialog: the header and footer stay put while this scrolls. */
function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-body" className={cn("-mx-6 min-h-0 overflow-y-auto overscroll-contain px-6", className)} {...props} />
}

function DialogFooter({ className, showCloseButton = false, children, ...props }: React.ComponentProps<"div"> & { showCloseButton?: boolean }) {
  return (
    <div data-slot="dialog-footer" className={cn("flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end", className)} {...props}>
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="secondary">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("type-glass-heading text-lg", className)} {...props} />
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger }
