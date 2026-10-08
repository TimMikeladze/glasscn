import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-control bg-fill px-[calc(0.875rem*var(--glass-density))] py-3 text-base text-foreground caret-primary transition-[box-shadow,background-color] outline-none placeholder:text-muted-foreground/80 selection:bg-primary/25 focus-visible:bg-fill-strong focus-visible:ring-(length:--glass-ring-width) focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-(length:--glass-ring-width) aria-invalid:ring-destructive/30 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
