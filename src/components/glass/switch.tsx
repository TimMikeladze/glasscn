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
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-[size=default]:h-[31px] data-[size=default]:w-[51px] data-[size=sm]:h-[22px] data-[size=sm]:w-[36px] data-checked:bg-primary data-unchecked:bg-fill-strong data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.15),0_1px_1px_rgb(0_0_0/0.12)] transition-transform duration-300 ease-[cubic-bezier(0.2,0.9,0.3,1.2)] group-data-[size=default]/switch:size-[27px] group-data-[size=sm]/switch:size-[18px] data-unchecked:translate-x-0 group-data-[size=default]/switch:data-checked:translate-x-5 group-data-[size=sm]/switch:data-checked:translate-x-3.5 motion-reduce:transition-none"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
