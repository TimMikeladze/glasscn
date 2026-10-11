import * as React from "react"
import { I18nManager, View, type ViewProps } from "react-native"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react-native"

import { Button } from "@/components/glass/native/button"
import { Press } from "@/components/glass/native/press"
import { GText, alpha, useUI, web } from "@/components/glass/native/ui"

/**
 * The month grid for React Native, with the web Calendar's selection modes
 * (`single`, `multiple`, `range`) and look: circular days, an accent today,
 * a tinted band between a range's ends. Plain `Date`s; no date library.
 */

type DateRange = { from: Date | undefined; to?: Date | undefined }

type Shared = ViewProps & {
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  /** Days that can't be chosen: a list, or a test. */
  disabled?: Date[] | ((date: Date) => boolean)
  /** 0 = Sunday (default), 1 = Monday. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  showOutsideDays?: boolean
  locale?: string
  /** The month arrows' button variant (the web's `buttonVariant`). */
  buttonVariant?: "ghost" | "secondary" | "outline"
}

type CalendarProps =
  | (Shared & { mode?: "single"; selected?: Date; onSelect?: (date: Date | undefined) => void })
  | (Shared & { mode: "multiple"; selected?: Date[]; onSelect?: (dates: Date[]) => void })
  | (Shared & { mode: "range"; selected?: DateRange; onSelect?: (range: DateRange | undefined) => void })

const sameDay = (a?: Date, b?: Date) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/** The 6×7 grid of days shown for `month`, starting on `weekStartsOn`. */
export function monthGrid(month: Date, weekStartsOn = 0): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const offset = (first.getDay() - weekStartsOn + 7) % 7
  return Array.from({ length: 42 }, (_, i) => new Date(first.getFullYear(), first.getMonth(), 1 - offset + i))
}

function Calendar(props: CalendarProps) {
  const { month: monthProp, defaultMonth, onMonthChange, disabled, weekStartsOn = 0, showOutsideDays = true, locale, buttonVariant = "ghost", style, ...rest } = props
  const ui = useUI()
  const initial = defaultMonth ?? (props.mode === "range" ? props.selected?.from : props.mode === "multiple" ? props.selected?.[0] : props.selected) ?? new Date()
  const [innerMonth, setInnerMonth] = React.useState(() => new Date(initial.getFullYear(), initial.getMonth(), 1))
  const month = monthProp ?? innerMonth
  const go = (delta: number) => {
    const next = new Date(month.getFullYear(), month.getMonth() + delta, 1)
    if (!monthProp) setInnerMonth(next)
    onMonthChange?.(next)
  }
  const today = startOfDay(new Date())
  const days = monthGrid(month, weekStartsOn)
  const isDisabled = (d: Date) => (typeof disabled === "function" ? disabled(d) : (disabled ?? []).some((x) => sameDay(x, d)))
  const caption = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month)
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "narrow" })
  const dayName = new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  const cell = Math.round(ui.control.default * 0.9)

  const state = (d: Date) => {
    if (props.mode === "range") {
      const { from, to } = props.selected ?? { from: undefined }
      const start = sameDay(d, from)
      const end = sameDay(d, to)
      const middle = !!from && !!to && d > from && d < to && !start && !end
      return { selected: start || end || (start && !to), start, end, middle }
    }
    if (props.mode === "multiple") return { selected: (props.selected ?? []).some((x) => sameDay(x, d)), start: false, end: false, middle: false }
    return { selected: sameDay(props.selected, d), start: false, end: false, middle: false }
  }

  const pick = (d: Date) => {
    if (props.mode === "range") {
      const r = props.selected
      if (!r?.from || r.to) props.onSelect?.({ from: d, to: undefined })
      else if (d < r.from) props.onSelect?.({ from: d, to: r.from })
      else props.onSelect?.({ from: r.from, to: d })
    } else if (props.mode === "multiple") {
      const list = props.selected ?? []
      props.onSelect?.(list.some((x) => sameDay(x, d)) ? list.filter((x) => !sameDay(x, d)) : [...list, d])
    } else props.onSelect?.(sameDay(props.selected, d) ? undefined : d)
  }

  const rtl = I18nManager.isRTL
  return (
    <View style={[{ padding: 8, gap: 8, alignSelf: "flex-start" }, style]} {...rest}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Button variant={buttonVariant} size="icon-sm" accessibilityLabel="Previous month" onPress={() => go(-1)}>
          {rtl ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </Button>
        <GText size="sm" weight="600" role="heading" aria-live="polite">
          {caption}
        </GText>
        <Button variant={buttonVariant} size="icon-sm" accessibilityLabel="Next month" onPress={() => go(1)}>
          {rtl ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </Button>
      </View>
      <View role="grid" aria-label={caption}>
        <View style={{ flexDirection: "row" }}>
          {days.slice(0, 7).map((d) => (
            <GText key={d.getDay()} size="xs" tone="muted" weight="500" align="center" style={{ width: cell }}>
              {weekday.format(d)}
            </GText>
          ))}
        </View>
        {[0, 1, 2, 3, 4, 5].map((w) => (
          <View key={w} role="row" style={{ flexDirection: "row", marginTop: 4 }}>
            {days.slice(w * 7, w * 7 + 7).map((d) => {
              const outside = d.getMonth() !== month.getMonth()
              if (outside && !showOutsideDays) return <View key={d.toISOString()} style={{ width: cell, height: cell }} />
              const s = state(d)
              const off = isDisabled(d)
              const isToday = sameDay(d, today)
              const filled = s.selected && !s.middle
              const band = s.middle || (s.start && !!(props.mode === "range" && props.selected?.to)) || s.end
              return (
                <View
                  key={d.toISOString()}
                  style={{
                    width: cell,
                    height: cell,
                    backgroundColor: band ? alpha(ui.primary, 0.12) : "transparent",
                    // start/end, so the band's rounded ends follow RTL (NAT-25)
                    borderTopStartRadius: s.start ? cell / 2 : 0,
                    borderBottomStartRadius: s.start ? cell / 2 : 0,
                    borderTopEndRadius: s.end ? cell / 2 : 0,
                    borderBottomEndRadius: s.end ? cell / 2 : 0,
                  }}
                >
                  <Press
                    haptic
                    role="button"
                    aria-pressed={s.selected || s.middle}
                    aria-disabled={off}
                    aria-label={`${dayName.format(d)}${isToday ? ", today" : ""}`}
                    accessibilityState={{ selected: s.selected || s.middle, disabled: off }}
                    disabled={off}
                    onPress={() => pick(d)}
                    style={[
                      { width: cell, height: cell, borderRadius: cell / 2, alignItems: "center", justifyContent: "center", backgroundColor: filled ? ui.primary : "transparent", opacity: off ? 0.4 : 1 },
                      web({ cursor: off ? "default" : "pointer" }),
                    ]}
                  >
                    <GText
                      size="sm"
                      weight={filled || isToday ? "600" : undefined}
                      color={filled ? ui.primaryForeground : isToday ? ui.primary : outside ? ui.mutedForeground : ui.foreground}
                      style={{ fontVariant: ["tabular-nums"] }}
                    >
                      {d.getDate()}
                    </GText>
                  </Press>
                </View>
              )
            })}
          </View>
        ))}
      </View>
    </View>
  )
}

export { Calendar }
export type { CalendarProps, DateRange }
