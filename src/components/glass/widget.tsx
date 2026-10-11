import * as React from "react"
import { cn } from "cn"

import { glassVariants } from "@/lib/glass-variants"

/**
 * Apple's widget families, sized in points. Home-screen widgets are glass panes;
 * the lock-screen accessories (`circular`, `rectangular`, `inline`) sit straight
 * on the ground with no pane of their own.
 */
const SIZES = {
  small: "w-[10.625rem] aspect-square",
  medium: "w-[22.75rem] max-w-full aspect-[364/170]",
  large: "w-[22.75rem] max-w-full aspect-[364/382]",
  extraLarge: "w-[48rem] max-w-full aspect-[768/382]",
  circular: "size-[4.75rem] rounded-full",
  rectangular: "h-[4.75rem] w-[10.75rem]",
  inline: "h-6 w-max max-w-full",
} as const

type WidgetSize = keyof typeof SIZES
const ACCESSORY = new Set<WidgetSize>(["circular", "rectangular", "inline"])

/**
 * A glanceable widget, at one of Apple's sizes. The pane is a container, so its
 * content lays itself out by the space it gets (`@container/widget`): a small
 * widget shows the figure, a medium one adds the chart beside it. 16pt margins,
 * text never under 11pt, inner tiles take `rounded-concentric`.
 *
 * `accented` renders it like iOS's tinted home screen: content in one tone (the
 * accent), charts desaturated — glanceable in any palette.
 *
 *   <Widget size="small"><WidgetHeader><WidgetTitle>Steps</WidgetTitle></WidgetHeader><WidgetValue>7,412</WidgetValue></Widget>
 */
function Widget({
  size = "small",
  accented = false,
  className,
  ...props
}: React.ComponentProps<"div"> & { size?: WidgetSize; accented?: boolean }) {
  const accessory = ACCESSORY.has(size)
  return (
    <div
      data-slot="widget"
      data-size={size}
      data-accented={accented || undefined}
      className={cn(
        "@container/widget relative flex min-w-0 flex-col overflow-hidden text-[max(0.6875rem,calc(0.875rem*var(--glass-text-scale)))]",
        accessory
          ? "items-center justify-center gap-0.5 text-center data-[size=inline]:flex-row data-[size=inline]:justify-start data-[size=inline]:gap-1.5 data-[size=rectangular]:items-start data-[size=rectangular]:text-start"
          : cn(glassVariants(), "gap-2 rounded-surface p-4 [--glass-container-pad:1rem] [--glass-container-radius:var(--glass-radius-surface)]"),
        size === "circular" && "bg-fill p-2",
        size === "rectangular" && "p-1",
        accented && "text-primary [&_[data-slot=widget-content]]:grayscale [&_[data-slot=widget-title]]:text-primary",
        SIZES[size],
        className
      )}
      {...props}
    />
  )
}

function WidgetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="widget-header" className={cn("flex min-w-0 items-center gap-1.5", className)} {...props} />
}

/** The widget's name — caption weight, tinted like Apple's (the accent). */
function WidgetTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="widget-title" className={cn("truncate text-[0.6875rem] font-semibold tracking-wide text-muted-foreground uppercase", className)} {...props} />
}

/** The headline figure; scales down in the smaller families. */
function WidgetValue({ className, title, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="widget-value"
      title={title ?? (typeof children === "string" || typeof children === "number" ? String(children) : undefined)}
      className={cn(
        "truncate type-glass-display type-step-3 numeric-glass in-data-[size=circular]:type-step-0 in-data-[size=inline]:type-step-n1 in-data-[size=rectangular]:type-step-1 @[20rem]/widget:type-step-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/** A secondary line — the unit, the goal, "updated 2m ago". */
function WidgetDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="widget-description" className={cn("truncate text-[0.6875rem] text-muted-foreground", className)} {...props} />
}

/** The body: fills the rest of the widget. Lay it out with container queries (`@md/widget:grid-cols-2`). */
function WidgetContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="widget-content" className={cn("flex min-h-0 min-w-0 flex-1 flex-col gap-2", className)} {...props} />
}

export { Widget, WidgetHeader, WidgetTitle, WidgetValue, WidgetDescription, WidgetContent, type WidgetSize }
