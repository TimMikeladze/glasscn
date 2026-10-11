"use client"

import * as React from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react"

/** Follows the `.dark` / `.light` class on <html> (next-themes, shadcn); with neither, the system setting. */
function subscribeScheme(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  return () => observer.disconnect()
}
function documentScheme(): NonNullable<ToasterProps["theme"]> {
  const classes = document.documentElement.classList
  return classes.contains("dark") ? "dark" : classes.contains("light") ? "light" : "system"
}

// Sonner's own button styles sit on attribute selectors, so these win with `!`.
const button =
  "h-control-xs! rounded-button! px-pad-xs! text-xs! font-medium! transition-[background-color,filter]! duration-(--glass-duration)! ease-glass! glass-focus! focus-visible:shadow-none!"

/**
 * Sonner, dressed in liquid glass (the control layer): frosted toasts with accent icons,
 * the action, cancel and close buttons styled like the theme's buttons.
 *
 * The scheme follows the `.dark` class on <html>; pass `theme` to set it yourself.
 * Toasts clear a fixed Dock: the default offsets add `--dock-inset`, which a fixed Dock
 * sets on the document. Pass `offset` / `mobileOffset` to place them yourself.
 */
function Toaster({ theme, ...props }: ToasterProps) {
  const scheme = React.useSyncExternalStore(subscribeScheme, documentScheme, () => "system" as const)
  return (
    <Sonner
      className="toaster group"
      theme={theme ?? scheme}
      offset={{ bottom: "calc(var(--dock-inset, 12px) + 12px)" }}
      mobileOffset={{ bottom: "calc(var(--dock-inset, 4px) + 12px)" }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-success-ink" />,
        info: <InfoIcon className="size-4 text-primary" />,
        warning: <TriangleAlertIcon className="size-4 text-warning-ink" />,
        error: <OctagonXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin text-muted-foreground" />,
      }}
      style={
        {
          "--normal-bg": "color-mix(in oklch, var(--glass-tint) var(--glass-liquid-opacity), transparent)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "color-mix(in oklch, var(--glass-border-color) var(--glass-border-opacity), transparent)",
          "--border-radius": "var(--glass-radius-surface)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "glass-liquid! glass-focus",
          description: "text-muted-foreground!",
          actionButton: `${button} bg-primary! text-primary-foreground! hover:brightness-105!`,
          cancelButton: `${button} bg-fill! text-foreground! hover:bg-fill-strong!`,
          closeButton: "bg-popover! text-popover-foreground! border-glass-border! hover:bg-fill-strong! glass-focus! focus-visible:shadow-none!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
