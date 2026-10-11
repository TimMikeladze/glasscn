import * as React from "react"
import { cn } from "cn"

/** A filled field on glass: soft fill, a hairline rim, accent caret, a focus outline; invalid draws a destructive rim. */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-control w-full min-w-0 rounded-control bg-fill inset-ring inset-ring-glass-border forced-colors:border forced-colors:border-[CanvasText] px-pad-sm text-base text-foreground caret-primary transition-[box-shadow,background-color] duration-(--glass-duration) ease-out glass-focus placeholder:text-glass-label-tertiary selection:bg-primary/25 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:bg-fill-strong disabled:cursor-not-allowed disabled:bg-fill-subtle disabled:text-glass-label-tertiary aria-invalid:inset-ring-2 aria-invalid:inset-ring-destructive/70 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
