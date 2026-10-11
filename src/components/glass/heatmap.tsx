"use client"

import * as React from "react"
import { cn } from "cn"

import { heatCellTitle, heatmapWeeks, isoDate, monthLabels, weekdayLabels, type HeatCell } from "@/lib/glass-charts"

const LEVEL = ["bg-fill", "bg-primary/25", "bg-primary/50", "bg-primary/75", "bg-primary"]

/** Cell corners follow the shape preset (3px at the default control radius; square stays square). */
const CELL = "rounded-[calc(var(--glass-radius-control)*0.25)]"

const noop = () => () => {}

/**
 * The viewer's local date — but only once hydrated. The server can't know the
 * viewer's time zone, so it (and the hydration pass) gets `null`, then the client
 * re-renders with its own date: no hydration mismatch.
 */
function useLocalToday(): string | null {
  return React.useSyncExternalStore(noop, () => isoDate(new Date()), () => null)
}

/**
 * Days as rounded cells in week columns, coloured by intensity — a contribution
 * graph. Values are numbers by ISO date; levels are quantised against the max.
 * Pass `onSelect` to make cells buttons. Without `today` the grid fills in on
 * the client (the server renders empty cells); pass it to render dates on the server.
 */
function Heatmap({
  values,
  weeks = 26,
  weekStart = 1,
  today: todayProp,
  max,
  cellSize = 16,
  locale = "en-US",
  onSelect,
  formatTitle,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "onSelect"> & {
  values: Record<string, number>
  weeks?: number
  weekStart?: 0 | 1
  /** ISO date (YYYY-MM-DD) of the last day shown. Defaults to the viewer's local date, resolved after hydration. */
  today?: string
  max?: number
  /** Largest a cell grows, in px — cells shrink below it to fit narrow containers. */
  cellSize?: number
  /** BCP 47 locale for weekday, month and title text. Fixed (not the browser's) so server and client agree. */
  locale?: string
  onSelect?: (date: string) => void
  formatTitle?: (cell: HeatCell) => string
}) {
  const localToday = useLocalToday()
  const today = todayProp ?? localToday
  const title = formatTitle ?? ((c: HeatCell) => heatCellTitle(c, locale))
  const cols = today ? heatmapWeeks(values, { today, weeks, weekStart, max }) : null
  const months = cols ? monthLabels(cols, locale) : []
  const days = weekdayLabels(weekStart, locale)
  return (
    <div data-slot="heatmap" data-pending={cols ? undefined : ""} className={cn("flex gap-1.5 type-step-n2 text-muted-foreground [--heatmap-gap:calc(0.1875rem*var(--glass-density))]", className)} {...props}>
      <div className="flex shrink-0 flex-col gap-(--heatmap-gap) pt-4">
        {days.map((d, r) => (
          <div key={r} className="flex flex-1 items-center leading-none">
            {r % 2 === 0 ? d : null}
          </div>
        ))}
      </div>
      <div className="grid min-w-0 flex-1 justify-start gap-(--heatmap-gap)" style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, ${cellSize}px))` }}>
        {cols
          ? cols.map((col, w) => (
              <div key={col[0].date} className="flex min-w-0 flex-col gap-(--heatmap-gap)">
                <div className="relative h-3.5">{months[w] ? <span className="absolute start-0 whitespace-nowrap">{months[w]}</span> : null}</div>
                {col.map((cell) => {
                  const cls = cn(
                    "relative aspect-square w-full",
                    CELL,
                    cell.future ? "bg-transparent" : LEVEL[cell.level],
                    // the foreground reads on every level, including a full-accent cell
                    cell.today && "inset-ring-(length:--glass-ring-width) inset-ring-foreground/70",
                    onSelect &&
                      !cell.future &&
                      "glass-focus cursor-pointer transition-transform duration-(--glass-duration) ease-glass hover:scale-125 focus-visible:z-10 motion-reduce:hover:scale-100"
                  )
                  return onSelect && !cell.future ? (
                    <button key={cell.date} type="button" data-slot="heatmap-cell" data-level={cell.level} title={title(cell)} aria-label={title(cell)} onClick={() => onSelect(cell.date)} className={cls} />
                  ) : (
                    <div key={cell.date} data-slot="heatmap-cell" data-level={cell.level} title={cell.future ? undefined : title(cell)} className={cls} />
                  )
                })}
              </div>
            ))
          : // no `today` until hydrated: the same grid, empty, so nothing shifts when it fills in
            Array.from({ length: weeks }, (_, w) => (
              <div key={w} aria-hidden className="flex min-w-0 flex-col gap-(--heatmap-gap)">
                <div className="h-3.5" />
                {Array.from({ length: 7 }, (_, r) => (
                  <div key={r} data-slot="heatmap-cell" data-level={0} className={cn("aspect-square w-full", CELL, LEVEL[0])} />
                ))}
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
      <span className="me-1">{less}</span>
      {LEVEL.map((c) => (
        <span key={c} className={cn("size-2.5", CELL, c)} />
      ))}
      <span className="ms-1">{more}</span>
    </div>
  )
}

export { Heatmap, HeatmapLegend }
