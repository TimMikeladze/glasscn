"use client"

import * as React from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react"

/**
 * Sonner, dressed in glass: capsule-ish frosted toasts with accent icons.
 * Pass `theme` from your theme provider (e.g. next-themes) if you have one.
 */
function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-primary" />,
        info: <InfoIcon className="size-4 text-primary" />,
        warning: <TriangleAlertIcon className="size-4 text-foreground" />,
        error: <OctagonXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin text-muted-foreground" />,
      }}
      style={
        {
          "--normal-bg": "color-mix(in oklch, var(--glass-tint) var(--glass-opacity-strong), transparent)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "color-mix(in oklch, var(--glass-border-color) var(--glass-border-opacity), transparent)",
          "--border-radius": "var(--glass-radius-surface)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "glass-strong!",
          description: "text-muted-foreground!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
