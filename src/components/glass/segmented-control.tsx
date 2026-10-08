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
  ...props
}: SegmentedControlProps) {
  const [inner, setInner] = React.useState(defaultValue ?? "")
  const current = value ?? inner
  const ref = useSlidingIndicator<HTMLDivElement>('[data-slot="segmented-control-item"][data-state="on"]')
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
        "group/segmented relative inline-flex w-fit items-stretch rounded-xl bg-fill p-0.5 data-[size=default]:h-9 data-[size=lg]:h-11 data-[size=sm]:h-7",
        className
      )}
      {...props}
    >
      <span
        data-slot="segmented-control-thumb"
        aria-hidden
        className={cn(
          slidingIndicatorClass,
          "rounded-[10px] bg-glass-thumb shadow-[0_3px_8px_rgb(0_0_0/0.12),0_0_1px_rgb(0_0_0/0.1)] dark:shadow-none"
        )}
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
        "relative z-10 inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[10px] px-3 text-sm font-medium whitespace-nowrap text-foreground/70 transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 data-[state=on]:font-semibold data-[state=on]:text-foreground group-data-[size=lg]/segmented:text-base group-data-[size=sm]/segmented:px-2 group-data-[size=sm]/segmented:text-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

export { SegmentedControl, SegmentedControlItem }
