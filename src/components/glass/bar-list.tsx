import * as React from "react"
import { cn } from "cn"

import { barShares, drawEase, glassTime } from "@/lib/glass-charts"

export interface BarListItem {
  name: React.ReactNode
  value: number
  /** Makes the row a link. */
  href?: string
  icon?: React.ReactNode
  /** Stable key when `name` isn't a string. */
  key?: string
}

/**
 * Ranked horizontal bars: label inside the bar, value at the end. Bars grow in
 * once; widths are shares of the largest value (or `max`). Sort the items
 * yourself — the list keeps your order.
 */
function BarList({
  data,
  max,
  valueFormat = (v) => v.toLocaleString(),
  color = "var(--primary)",
  onSelect,
  className,
  ...props
}: Omit<React.ComponentProps<"ul">, "onSelect"> & {
  data: BarListItem[]
  max?: number
  valueFormat?: (value: number) => React.ReactNode
  color?: string
  onSelect?: (item: BarListItem, index: number) => void
}) {
  const shares = barShares(
    data.map((d) => d.value),
    max
  )
  return (
    <ul data-slot="bar-list" className={cn("grid gap-[calc(0.375rem*var(--glass-density))]", className)} {...props}>
      {data.map((item, i) => {
        const body = (
          <>
            <span className="relative min-w-0 flex-1">
              <span
                data-slot="bar-list-bar"
                aria-hidden
                data-glass-motion
                className="absolute inset-y-0 start-0 origin-left rounded-control-sm rtl:origin-right"
                style={{
                  width: `max(${shares[i]}%, 0.375rem)`,
                  background: `color-mix(in oklch, ${color} 22%, transparent)`,
                  animation: `glass-grow ${glassTime(4)} ${drawEase} ${glassTime(i * 0.2)} both`,
                }}
              />
              <span className="relative flex h-control-sm items-center gap-2 px-pad-xs text-sm">
                {item.icon ? <span className="shrink-0 text-muted-foreground [&_svg:not([class*='size-'])]:size-4">{item.icon}</span> : null}
                <span className="truncate">{item.name}</span>
              </span>
            </span>
            <span data-slot="bar-list-value" className="shrink-0 text-sm font-medium numeric-glass">
              {valueFormat(item.value)}
            </span>
          </>
        )
        const row = "glass-focus flex w-full items-center gap-3 rounded-control-sm text-start"
        const key = item.key ?? (typeof item.name === "string" ? item.name : i)
        return (
          <li key={key} data-slot="bar-list-item">
            {item.href ? (
              <a href={item.href} className={cn(row, "transition-colors duration-(--glass-duration) ease-glass hover:bg-fill")} onClick={onSelect ? () => onSelect(item, i) : undefined}>
                {body}
              </a>
            ) : onSelect ? (
              <button type="button" className={cn(row, "cursor-pointer transition-colors duration-(--glass-duration) ease-glass hover:bg-fill")} onClick={() => onSelect(item, i)}>
                {body}
              </button>
            ) : (
              <div className={row}>{body}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export { BarList }
