"use client"

import * as React from "react"
import { cn } from "cn"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { CheckIcon, MinusIcon } from "lucide-react"

/** shadcn's Checkbox on glass: a soft filled box that fills with the accent; `checked="indeterminate"` shows a dash. */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer group/checkbox inline-flex size-[calc(1.125rem*var(--glass-density))] shrink-0 items-center justify-center rounded-[calc(var(--glass-radius-control)*0.35)] border border-foreground/25 bg-fill text-primary-foreground transition-[background-color,border-color,box-shadow,transform] duration-(--glass-duration) ease-glass outline-none focus-visible:ring-(length:--glass-ring-width) focus-visible:ring-ring/50 active:scale-(--glass-press-scale) disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-(length:--glass-ring-width) aria-invalid:ring-destructive/30 data-[state=checked]:border-transparent data-[state=checked]:bg-primary data-[state=indeterminate]:border-transparent data-[state=indeterminate]:bg-primary",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="flex items-center justify-center text-current [&_svg]:size-[85%] [&_svg]:stroke-3">
        <CheckIcon className="hidden group-data-[state=checked]/checkbox:block" />
        <MinusIcon className="hidden group-data-[state=indeterminate]/checkbox:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
