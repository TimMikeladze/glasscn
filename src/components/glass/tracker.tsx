import * as React from "react"
import { cn } from "cn"

export interface TrackerBlock {
  /** Shown on hover and read by screen readers. */
  title: string
  /** A status from `colors`; unknown statuses render as empty. */
  status?: string
  key?: string
}

const DEFAULT_COLORS: Record<string, string> = {
  done: "bg-primary",
  partial: "bg-primary/45",
  missed: "bg-foreground/25",
  rest: "bg-fill",
}

/**
 * A row of status blocks — uptime, a habit's last 30 days. Blocks stretch to
 * fill the width. Map your statuses to colour classes with `colors`.
 */
function Tracker({
  data,
  colors = DEFAULT_COLORS,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  data: TrackerBlock[]
  /** Status → colour class (`bg-chart-2`, `bg-primary/40`). */
  colors?: Record<string, string>
}) {
  return (
    <div data-slot="tracker" role="list" className={cn("flex h-[calc(2rem*var(--glass-density))] w-full gap-[2px]", className)} {...props}>
      {data.map((b, i) => (
        <div
          key={b.key ?? i}
          role="listitem"
          data-slot="tracker-block"
          data-status={b.status}
          title={b.title}
          aria-label={b.title}
          className={cn(
            "min-w-0 flex-1 transition-transform duration-(--glass-duration) ease-glass first:rounded-l-control-sm last:rounded-r-control-sm hover:scale-y-110",
            (b.status && colors[b.status]) || "bg-fill"
          )}
        />
      ))}
    </div>
  )
}

export { Tracker }
