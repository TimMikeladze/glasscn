"use client"

import * as React from "react"
import { cn } from "cn"
import { Slider as SliderPrimitive } from "radix-ui"

/** A soft track, an accent range and white glass knobs. */
function Slider({ className, defaultValue, value, min = 0, max = 100, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const values = React.useMemo(() => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]), [value, defaultValue, min, max])
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full bg-fill-strong data-horizontal:h-1.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-1.5"
      >
        <SliderPrimitive.Range data-slot="slider-range" className="absolute bg-primary data-horizontal:h-full data-vertical:w-full" />
      </SliderPrimitive.Track>
      {Array.from({ length: values.length }, (_, i) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={i}
          className="block size-[calc(1.5rem*var(--glass-density))] shrink-0 rounded-button border border-glass-border bg-glass-knob shadow-glass-knob transition-transform duration-(--glass-duration) ease-glass focus-visible:outline-hidden hover:scale-105 focus-visible:ring-(length:--glass-ring-width) focus-visible:ring-ring/50 active:scale-110 data-disabled:pointer-events-none motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
