import * as React from "react"
import { cn } from "cn"

import { heatmapWeeks, isoDate, monthLabels, parseDate, type HeatCell } from "@/lib/glass-charts"

const LEVEL = ["bg-fill", "bg-primary/25", "bg-primary/50", "bg-primary/75", "bg-primary"]

/**
 * Days as rounded cells in week columns, coloured by intensity — a contribution
 * graph. Values are numbers by ISO date; levels are quantised against the max.
 * Pass `onSelect` to make cells buttons.
 */
function Heatmap({
  values,
  weeks = 26,
  weekStart = 1,
  today = isoDate(new Date()),
  max,
  cellSize = 16,
  onSelect,
  formatTitle = (c) => `${parseDate(c.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}${c.value ? ` · ${c.value}` : ""}`,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "onSelect"> & {
  values: Record<string, number>
  weeks?: number
  weekStart?: 0 | 1
  today?: string
  max?: number
  /** Largest a cell grows, in px — cells shrink below it to fit narrow containers. */
  cellSize?: number
  onSelect?: (date: string) => void
  formatTitle?: (cell: HeatCell) => string
}) {
  const cols = heatmapWeeks(values, { today, weeks, weekStart, max })
  const months = monthLabels(cols)
  const days = Array.from({ length: 7 }, (_, r) => parseDate(cols[0][r].date).toLocaleDateString(undefined, { weekday: "short" }))
  return (
    <div data-slot="heatmap" className={cn("flex gap-1.5 text-[0.625rem] text-muted-foreground", className)} {...props}>
      <div className="flex shrink-0 flex-col gap-[3px] pt-4">
        {days.map((d, r) => (
          <div key={r} className="flex flex-1 items-center leading-none">
            {r % 2 === 0 ? d : null}
          </div>
        ))}
      </div>
      <div className="grid min-w-0 flex-1 justify-start gap-[3px]" style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, ${cellSize}px))` }}>
        {cols.map((col, w) => (
          <div key={col[0].date} className="flex min-w-0 flex-col gap-[3px]">
            <div className="relative h-3.5">{months[w] ? <span className="absolute left-0 whitespace-nowrap">{months[w]}</span> : null}</div>
            {col.map((cell) => {
              const cls = cn(
                "relative aspect-square w-full rounded-[3px] outline-none",
                cell.future ? "bg-transparent" : LEVEL[cell.level],
                cell.today && "ring-2 ring-primary ring-inset",
                onSelect && !cell.future && "cursor-pointer transition-transform hover:scale-125 focus-visible:ring-2 focus-visible:ring-ring"
              )
              return onSelect && !cell.future ? (
                <button key={cell.date} type="button" data-slot="heatmap-cell" data-level={cell.level} title={formatTitle(cell)} aria-label={formatTitle(cell)} onClick={() => onSelect(cell.date)} className={cls} />
              ) : (
                <div key={cell.date} data-slot="heatmap-cell" data-level={cell.level} title={cell.future ? undefined : formatTitle(cell)} className={cls} />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/** "Less ▢▢▢▢▢ More". */
function HeatmapLegend({ className, less = "Less", more = "More", ...props }: React.ComponentProps<"div"> & { less?: string; more?: string }) {
  return (
    <div data-slot="heatmap-legend" className={cn("flex items-center gap-1 text-xs text-muted-foreground", className)} {...props}>
      <span className="mr-1">{less}</span>
      {LEVEL.map((c) => (
        <span key={c} className={cn("size-2.5 rounded-[3px]", c)} />
      ))}
      <span className="ml-1">{more}</span>
    </div>
  )
}

export { Heatmap, HeatmapLegend }
