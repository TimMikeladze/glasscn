import * as React from "react"
import { cn } from "cn"

/** A filled field on glass: soft fill, no border, accent caret and ring. */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-control w-full min-w-0 rounded-control bg-fill px-[calc(0.875rem*var(--glass-density))] text-base text-foreground caret-primary transition-[box-shadow,background-color] duration-(--glass-duration) ease-glass outline-none placeholder:text-muted-foreground/80 selection:bg-primary/25 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:bg-fill-strong focus-visible:ring-(length:--glass-ring-width) focus-visible:ring-ring/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-(length:--glass-ring-width) aria-invalid:ring-destructive/30 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
