"use client"

import * as React from "react"
import { cn } from "@/lib/glass-cn"
import { Popover as PopoverPrimitive } from "radix-ui"
import { GlassPortal } from "@/lib/glass-portal"
import { GlassMorphContext, useGlassMorphRef, useGlassPresentation } from "@/lib/glass-transitions"

import { Button } from "@/components/glass/button"

/**
 * A confirmation anchored to the button that asked for it — "Delete this entry?" next to the
 * Delete button, not a dialog across the page (Apple's popover confirm). It's an `alertdialog`:
 * the title names it, focus starts on Cancel (the safe choice), Escape or a click outside cancels.
 * On phones an ActionSheet is usually the better fit.
 *
 *   <ConfirmationPopover>
 *     <ConfirmationPopoverTrigger asChild><Button variant="destructive">Delete</Button></ConfirmationPopoverTrigger>
 *     <ConfirmationPopoverContent title="Delete this entry?" description="It can't be undone." confirmLabel="Delete" onConfirm={remove} />
 *   </ConfirmationPopover>
 */
function ConfirmationPopover({ open, defaultOpen, onOpenChange, ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  const presentation = useGlassPresentation({ open, defaultOpen, onOpenChange })
  return <GlassMorphContext.Provider value={presentation}><PopoverPrimitive.Root data-slot="confirmation-popover" open={presentation.open} onOpenChange={presentation.setOpen} {...props} /></GlassMorphContext.Provider>
}

function ConfirmationPopoverTrigger({ ref, ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  const source = useGlassMorphRef<HTMLButtonElement>("trigger", ref)
  return <PopoverPrimitive.Trigger ref={source} data-slot="confirmation-popover-trigger" {...props} />
}

function ConfirmationPopoverContent({
  className,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  onConfirm,
  onCancel,
  align = "center",
  sideOffset = 8,
  children,
  ref,
  ...props
}: Omit<React.ComponentProps<typeof PopoverPrimitive.Content>, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: React.ReactNode
  cancelLabel?: React.ReactNode
  /** `destructive` (default) colours the confirm button red; `default` uses the accent. */
  variant?: "destructive" | "default"
  onConfirm?: () => void
  onCancel?: () => void
}) {
  const id = React.useId()
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  const morph = React.useContext(GlassMorphContext)
  const target = useGlassMorphRef<HTMLDivElement>("content", ref)
  return (
    <GlassPortal>{(container) => <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Content
        role="alertdialog"
        aria-labelledby={`${id}-title`}
        aria-describedby={description ? `${id}-description` : undefined}
        ref={target}
        data-slot="confirmation-popover-content"
        data-morphing={morph?.morphing || undefined}
        data-glass-motion=""
        align={align}
        sideOffset={sideOffset}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          cancelRef.current?.focus()
        }}
        className={cn(
          "glass-liquid z-50 flex w-64 flex-col gap-3 rounded-surface-sm p-4 text-sm text-popover-foreground outline-hidden glass-materialize data-morphing:animate-none! data-morphing:[clip-path:none] data-morphing:transition-none glass-morph-origin [--glass-morph-w:var(--radix-popover-trigger-width)] [--glass-morph-h:var(--radix-popover-trigger-height)] [--glass-morph-origin:var(--radix-popover-content-transform-origin)]",
          className
        )}
        {...props}
      >
        <div className="grid gap-1">
          <p id={`${id}-title`} data-slot="confirmation-popover-title" className="type-glass-heading text-base">
            {title}
          </p>
          {description ? (
            <p id={`${id}-description`} data-slot="confirmation-popover-description" className="text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {children}
        <div data-slot="confirmation-popover-actions" className="flex justify-end gap-2">
          <PopoverPrimitive.Close asChild>
            <Button ref={cancelRef} variant="secondary" size="sm" onClick={onCancel}>
              {cancelLabel}
            </Button>
          </PopoverPrimitive.Close>
          <PopoverPrimitive.Close asChild>
            <Button variant={variant === "destructive" ? "destructive" : "default"} size="sm" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </PopoverPrimitive.Close>
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>}</GlassPortal>
  )
}

export { ConfirmationPopover, ConfirmationPopoverTrigger, ConfirmationPopoverContent }
