"use client"

import * as React from "react"
import { cn } from "cn"
import { Switch as SwitchPrimitive } from "radix-ui"

/** The iOS switch: a capsule that fills with the accent, a white knob that springs across. */
function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & { size?: "sm" | "default" }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-button p-0.5 transition-colors duration-(--glass-duration) ease-glass focus-visible:outline-hidden focus-visible:ring-(length:--glass-ring-width) focus-visible:ring-ring/50 data-[size=default]:h-[calc(1.9375rem*var(--glass-density))] data-[size=default]:w-[calc(3.1875rem*var(--glass-density))] data-[size=sm]:h-[calc(1.375rem*var(--glass-density))] data-[size=sm]:w-[calc(2.25rem*var(--glass-density))] data-checked:bg-primary data-unchecked:bg-fill-strong data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-button bg-glass-knob shadow-glass-knob transition-transform duration-[calc(var(--glass-duration)*1.5)] ease-glass group-data-[size=default]/switch:size-[calc(1.6875rem*var(--glass-density))] group-data-[size=sm]/switch:size-[calc(1.125rem*var(--glass-density))] data-unchecked:translate-x-0 group-data-[size=default]/switch:data-checked:translate-x-[calc(1.25rem*var(--glass-density))] group-data-[size=sm]/switch:data-checked:translate-x-[calc(0.875rem*var(--glass-density))] rtl:group-data-[size=default]/switch:data-checked:-translate-x-[calc(1.25rem*var(--glass-density))] rtl:group-data-[size=sm]/switch:data-checked:-translate-x-[calc(0.875rem*var(--glass-density))] motion-reduce:transition-none"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
