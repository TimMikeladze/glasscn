"use client"

import * as React from "react"
import { cn } from "cn"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Calendar } from "@/components/glass/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/glass/popover"

/**
 * A date (or range, or date and time) behind a button. `variant="compact"` is iOS's compact
 * date picker: the value as an accent-tinted capsule that opens the calendar; `field` is a
 * full-width fill with an icon, for forms. The calendar floats in the popover's liquid panel.
 *
 *   <DatePicker value={day} onValueChange={setDay} />
 *   <DatePicker mode="range" value={trip} onValueChange={setTrip} variant="field" />
 *   <DatePicker time minuteStep={15} value={at} onValueChange={setAt} />
 */

/** Minutes past the hour a `step` allows. The step must divide 60 (1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60). */
function minuteSlots(step = 1): number[] {
  if (!Number.isInteger(step) || step < 1 || 60 % step !== 0) throw new RangeError(`minuteStep must divide 60, got ${step}`)
  return Array.from({ length: 60 / step }, (_, i) => i * step)
}

/** `date` with its minutes snapped down to the step. */
function snapMinutes(date: Date, step = 1): Date {
  const next = new Date(date)
  next.setMinutes(Math.floor(next.getMinutes() / step) * step, 0, 0)
  return next
}

type Shared = {
  placeholder?: string
  variant?: "compact" | "field"
  disabled?: boolean
  /** Intl options for the label; defaults to a medium date (and short time with `time`). */
  formatOptions?: Intl.DateTimeFormatOptions
  locale?: string
  className?: string
  id?: string
  "aria-label"?: string
  /** Passed to the Calendar — `disabled` days, `startMonth`, `numberOfMonths`… */
  calendarProps?: Omit<React.ComponentProps<typeof Calendar>, "mode" | "selected" | "onSelect">
}

type DatePickerProps =
  | (Shared & { mode?: "single"; value?: Date; defaultValue?: Date; onValueChange?: (value: Date | undefined) => void; time?: boolean; minuteStep?: number })
  | (Shared & { mode: "range"; value?: DateRange; defaultValue?: DateRange; onValueChange?: (value: DateRange | undefined) => void; time?: never; minuteStep?: never })

const triggerClass = {
  compact:
    "glass-focus inline-flex h-control-sm items-center rounded-button bg-fill px-pad-sm text-sm font-medium numeric-glass text-foreground transition-colors hover:bg-fill-strong data-[state=open]:text-primary-ink data-empty:text-muted-foreground",
  field:
    "glass-focus flex h-control w-full items-center gap-2 rounded-control bg-fill ps-pad-sm pe-3 text-start text-sm numeric-glass text-foreground transition-colors hover:bg-fill-strong data-[state=open]:bg-fill-strong data-empty:text-glass-label-tertiary",
}

const selectClass = "glass-focus h-control-sm rounded-control-sm bg-fill px-2 text-sm numeric-glass text-foreground"

function DatePicker(props: DatePickerProps) {
  const { placeholder = props.mode === "range" ? "Pick dates" : "Pick a date", variant = "compact", disabled, locale, className, id, calendarProps } = props
  const [open, setOpen] = React.useState(false)
  const [inner, setInner] = React.useState<Date | DateRange | undefined>(props.defaultValue)
  const value = props.value ?? inner
  const step = props.mode !== "range" ? (props.minuteStep ?? 1) : 1
  const slots = React.useMemo(() => minuteSlots(step), [step])

  const commit = (next: Date | DateRange | undefined) => {
    if (props.value === undefined) setInner(next)
    ;(props.onValueChange as ((v: Date | DateRange | undefined) => void) | undefined)?.(next)
  }

  const fmt = new Intl.DateTimeFormat(locale, props.formatOptions ?? (props.time ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }))
  const label =
    value instanceof Date
      ? fmt.format(value)
      : value?.from
        ? value.to
          ? fmt.formatRange(value.from, value.to)
          : fmt.format(value.from)
        : undefined

  const single = value instanceof Date ? value : undefined
  const setTime = (hours: number, minutes: number) => {
    const base = single ?? snapMinutes(new Date(), step)
    const next = new Date(base)
    next.setHours(hours, minutes, 0, 0)
    commit(next)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          id={id}
          type="button"
          data-slot="date-picker-trigger"
          data-variant={variant}
          data-empty={!label || undefined}
          aria-label={props["aria-label"] ? `${props["aria-label"]}${label ? `, ${label}` : ""}` : undefined}
          className={cn(triggerClass[variant], "disabled:pointer-events-none disabled:opacity-50", className)}
        >
          {variant === "field" ? <CalendarIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" /> : null}
          <span className="truncate">{label ?? placeholder}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent data-slot="date-picker-content" align="start" className="w-auto gap-0 p-1">
        {props.mode === "range" ? (
          <Calendar
            {...calendarProps}
            mode="range"
            selected={value as DateRange | undefined}
            defaultMonth={(value as DateRange | undefined)?.from}
            numberOfMonths={calendarProps?.numberOfMonths ?? 2}
            onSelect={(r) => commit(r)}
          />
        ) : (
          <Calendar
            {...calendarProps}
            mode="single"
            selected={single}
            defaultMonth={single}
            onSelect={(d) => {
              if (d && single && props.time) d.setHours(single.getHours(), single.getMinutes(), 0, 0)
              commit(d)
              if (!props.time) setOpen(false)
            }}
          />
        )}
        {props.mode !== "range" && props.time ? (
          <div data-slot="date-picker-time" className="flex items-center gap-2 border-t border-separator px-3 py-2 text-sm">
            <span className="me-auto text-muted-foreground">Time</span>
            <select
              aria-label="Hour"
              className={selectClass}
              value={single?.getHours() ?? ""}
              onChange={(e) => setTime(Number(e.target.value), single ? Math.floor(single.getMinutes() / step) * step : 0)}
            >
              {single ? null : <option value="">--</option>}
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}
                </option>
              ))}
            </select>
            <span aria-hidden>:</span>
            <select
              aria-label="Minute"
              className={selectClass}
              value={single ? Math.floor(single.getMinutes() / step) * step : ""}
              onChange={(e) => setTime(single?.getHours() ?? 9, Number(e.target.value))}
            >
              {single ? null : <option value="">--</option>}
              {slots.map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker, minuteSlots, snapMinutes }
export type { DatePickerProps }
