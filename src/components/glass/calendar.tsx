"use client"

import * as React from "react"
import { cn } from "cn"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker, getDefaultClassNames, type DayButton } from "react-day-picker"

import { buttonVariants } from "@/components/glass/button"

/**
 * shadcn's Calendar (react-day-picker) for glass. Transparent: it sits on whatever pane
 * holds it — a card, or the date picker's liquid popover. Days are circles that fill with
 * the accent when chosen; today is the accent's ink; a range is joined by a tinted band.
 * Every `DayPicker` prop works: `mode="single" | "multiple" | "range"`, `captionLayout`,
 * `numberOfMonths`, `disabled`, `locale`, `dir`.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & { buttonVariant?: React.ComponentProps<typeof CalendarDayButton>["variant"] }) {
  const d = getDefaultClassNames()
  return (
    <DayPicker
      data-slot="calendar"
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn("group/calendar p-2 [--cell-size:calc(2.25rem*var(--glass-density))] rtl:**:[.rdp-button_next>svg]:rotate-180 rtl:**:[.rdp-button_previous>svg]:rotate-180", className)}
      formatters={{ formatMonthDropdown: (date) => date.toLocaleString(props.locale?.code, { month: "short" }), ...formatters }}
      classNames={{
        root: cn("w-fit", d.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", d.months),
        month: cn("flex w-full flex-col gap-3", d.month),
        nav: cn("absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1", d.nav),
        button_previous: cn(buttonVariants({ variant: buttonVariant, size: "icon-sm" }), "size-(--cell-size) aria-disabled:opacity-40", d.button_previous),
        button_next: cn(buttonVariants({ variant: buttonVariant, size: "icon-sm" }), "size-(--cell-size) aria-disabled:opacity-40", d.button_next),
        month_caption: cn("flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)", d.month_caption),
        dropdowns: cn("flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-semibold", d.dropdowns),
        dropdown_root: cn("relative rounded-control-sm bg-fill has-focus:outline-(length:--glass-ring-width) has-focus:outline-ring has-focus:outline-solid", d.dropdown_root),
        dropdown: cn("absolute inset-0 bg-popover opacity-0", d.dropdown),
        caption_label: cn(
          "font-semibold select-none",
          captionLayout === "label" ? "text-sm" : "flex h-control-xs items-center gap-1 rounded-control-sm ps-2 pe-1 text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
          d.caption_label
        ),
        month_grid: "w-full border-collapse",
        weekdays: cn("flex", d.weekdays),
        weekday: cn("flex-1 rounded-control-sm type-caption-2 font-medium text-muted-foreground uppercase select-none", d.weekday),
        week: cn("mt-1 flex w-full", d.week),
        week_number_header: cn("w-(--cell-size) select-none", d.week_number_header),
        week_number: cn("type-caption-2 text-muted-foreground select-none", d.week_number),
        day: cn(
          "group/day relative aspect-square h-full w-full p-0 text-center select-none",
          // the range band: tinted, capsule-ended
          "[&.range-middle]:bg-primary/12 [&.range-start]:rounded-s-button [&.range-start]:bg-primary/12 [&.range-end]:rounded-e-button [&.range-end]:bg-primary/12 [&.range-start.range-end]:bg-transparent",
          d.day
        ),
        range_start: "range-start",
        range_middle: "range-middle",
        range_end: "range-end",
        today: cn("today", d.today),
        outside: cn("text-glass-label-tertiary aria-selected:text-glass-label-tertiary", d.outside),
        disabled: cn("text-glass-label-tertiary opacity-50", d.disabled),
        hidden: cn("invisible", d.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...p }) => <div data-slot="calendar" ref={rootRef} className={cn(className)} {...p} />,
        Chevron: ({ className, orientation, ...p }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className={cn("size-4", className)} {...p} />
          ) : orientation === "right" ? (
            <ChevronRightIcon className={cn("size-4", className)} {...p} />
          ) : (
            <ChevronDownIcon className={cn("size-4", className)} {...p} />
          ),
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...p }) => (
          <td {...p}>
            <div className="flex size-(--cell-size) items-center justify-center text-center">{children}</div>
          </td>
        ),
        ...components,
      }}
      {...props}
    />
  )
}

/** A day: a circle — accent-filled when selected (and at a range's ends), the accent's ink when it's today. */
function CalendarDayButton({ className, day, modifiers, variant = "ghost", ...props }: React.ComponentProps<typeof DayButton> & { variant?: "ghost" | "secondary" | "outline" }) {
  const d = getDefaultClassNames()
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])
  const single = modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle
  return (
    <button
      ref={ref}
      type="button"
      data-slot="calendar-day"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={single || undefined}
      data-range-start={modifiers.range_start || undefined}
      data-range-end={modifiers.range_end || undefined}
      data-range-middle={modifiers.range_middle || undefined}
      data-today={modifiers.today || undefined}
      className={cn(
        buttonVariants({ variant, size: "icon" }),
        "mx-auto size-(--cell-size) min-w-(--cell-size) text-sm font-normal numeric-glass",
        "data-[today]:font-semibold data-[today]:not-data-[selected-single]:not-data-[range-start]:not-data-[range-end]:text-primary-ink",
        "data-[selected-single]:bg-primary data-[selected-single]:font-semibold data-[selected-single]:text-primary-foreground",
        "data-range-start:bg-primary data-range-start:text-primary-foreground data-range-end:bg-primary data-range-end:text-primary-foreground data-range-middle:bg-transparent data-range-middle:text-foreground",
        d.day_button,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
