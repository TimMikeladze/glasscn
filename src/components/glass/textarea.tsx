import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-control bg-fill inset-ring inset-ring-glass-border forced-colors:border forced-colors:border-[CanvasText] px-pad-sm py-3 text-base text-foreground caret-primary transition-[box-shadow,background-color] duration-(--glass-duration) ease-out glass-focus placeholder:text-glass-label-tertiary selection:bg-primary/25 focus-visible:bg-fill-strong disabled:cursor-not-allowed disabled:bg-fill-subtle disabled:text-glass-label-tertiary aria-invalid:inset-ring-2 aria-invalid:inset-ring-destructive/70 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
