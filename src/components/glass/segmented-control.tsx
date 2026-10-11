"use client"

import * as React from "react"
import { cn } from "cn"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { slidingIndicatorClass, useSlidingIndicator } from "@/hooks/use-sliding-indicator"

type SegmentedControlProps = Omit<
  React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
  "type" | "value" | "defaultValue" | "onValueChange"
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  size?: "sm" | "default" | "lg"
}

/**
 * The iOS segmented control: a soft track with one raised thumb that slides
 * to the chosen segment. Always has a selection — tapping the chosen segment
 * again keeps it (unlike a toggle group).
 */
function SegmentedControl({
  className,
  value,
  defaultValue,
  onValueChange,
  size = "default",
  children,
  ref: forwardedRef,
  ...props
}: SegmentedControlProps) {
  const [inner, setInner] = React.useState(defaultValue ?? "")
  const current = value ?? inner
  const ref = useSlidingIndicator<HTMLDivElement>('[data-slot="segmented-control-item"][data-state="on"]', forwardedRef)
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      type="single"
      data-slot="segmented-control"
      data-size={size}
      value={current}
      onValueChange={(v: string) => {
        if (!v) return
        setInner(v)
        onValueChange?.(v)
      }}
      className={cn(
        // heights match Button's (h-control-sm / h-control / h-control-lg) so they line up in a toolbar;
        // the container radius + padding make the thumb concentric (rounded-concentric)
        "group/segmented relative inline-flex w-fit items-stretch rounded-control bg-fill [--glass-container-pad:0.125rem] [--glass-container-radius:var(--glass-radius-control)] p-(--glass-container-pad) data-[size=default]:h-control data-[size=lg]:h-control-lg data-[size=sm]:h-control-sm",
        className
      )}
      {...props}
    >
      <span
        data-slot="segmented-control-thumb"
        data-glass-motion
        aria-hidden
        className={cn(slidingIndicatorClass, "rounded-concentric bg-glass-thumb shadow-glass-knob")}
      />
      {children}
    </ToggleGroupPrimitive.Root>
  )
}

function SegmentedControlItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="segmented-control-item"
      className={cn(
        // before the thumb is measured (server render, no JS) the chosen item draws the thumb itself
        "relative z-10 inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-concentric px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors duration-(--glass-duration) ease-out glass-focus-inset hover:text-foreground disabled:pointer-events-none disabled:text-glass-label-tertiary data-[state=on]:font-semibold data-[state=on]:text-foreground not-in-data-indicator-ready:data-[state=on]:bg-glass-thumb not-in-data-indicator-ready:data-[state=on]:shadow-glass-knob group-data-[size=lg]/segmented:text-base group-data-[size=sm]/segmented:px-2 group-data-[size=sm]/segmented:text-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

export { SegmentedControl, SegmentedControlItem }
