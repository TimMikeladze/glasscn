import * as React from "react"
import { ScrollView, View } from "react-native"
import { CalendarIcon } from "lucide-react-native"

import { Calendar, type DateRange } from "@/components/glass/native/calendar"
import { Floating, useAnchorRect } from "@/components/glass/native/popover"
import { Press } from "@/components/glass/native/press"
import { GText, useUI, web } from "@/components/glass/native/ui"

/**
 * A date (or range, or date and time) behind a button: iOS's compact capsule
 * (`variant="compact"`) or a form field, opening the calendar in a glass panel.
 * `minuteStep` must divide 60.
 */

export function minuteSlots(step = 1): number[] {
  if (!Number.isInteger(step) || step < 1 || 60 % step !== 0) throw new RangeError(`minuteStep must divide 60, got ${step}`)
  return Array.from({ length: 60 / step }, (_, i) => i * step)
}

type Shared = { placeholder?: string; variant?: "compact" | "field"; disabled?: boolean; locale?: string; formatOptions?: Intl.DateTimeFormatOptions; "aria-label"?: string }
type DatePickerProps =
  | (Shared & { mode?: "single"; value?: Date; defaultValue?: Date; onValueChange?: (value: Date | undefined) => void; time?: boolean; minuteStep?: number })
  | (Shared & { mode: "range"; value?: DateRange; defaultValue?: DateRange; onValueChange?: (value: DateRange | undefined) => void; time?: never; minuteStep?: never })

function DatePicker(props: DatePickerProps) {
  const { placeholder = props.mode === "range" ? "Pick dates" : "Pick a date", variant = "compact", disabled, locale } = props
  const ui = useUI()
  const [open, setOpen] = React.useState(false)
  const [inner, setInner] = React.useState<Date | DateRange | undefined>(props.defaultValue)
  const value = props.value ?? inner
  const triggerRef = React.useRef<View>(null)
  const target = React.useCallback(() => triggerRef.current, [])
  const rect = useAnchorRect(open, target)
  const step = props.mode !== "range" ? (props.minuteStep ?? 1) : 1
  const slots = React.useMemo(() => minuteSlots(step), [step])

  const commit = (next: Date | DateRange | undefined) => {
    if (props.value === undefined) setInner(next)
    ;(props.onValueChange as ((v: Date | DateRange | undefined) => void) | undefined)?.(next)
  }
  const fmt = new Intl.DateTimeFormat(locale, props.formatOptions ?? (props.time ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }))
  const single = value instanceof Date ? value : undefined
  const range = value instanceof Date ? undefined : value
  const label = single ? fmt.format(single) : range?.from ? (range.to ? `${fmt.format(range.from)} – ${fmt.format(range.to)}` : fmt.format(range.from)) : undefined
  const setTime = (h: number, m: number) => {
    const next = new Date(single ?? new Date())
    next.setHours(h, m, 0, 0)
    commit(next)
  }

  const chip = (on: boolean, text: string, onPress: () => void, key: number) => (
    <Press key={key} accessibilityRole="button" aria-selected={on} onPress={onPress} style={{ minWidth: 36, height: ui.control.sm, borderRadius: ui.radius.control - 4, alignItems: "center", justifyContent: "center", backgroundColor: on ? ui.primary : ui.fill, paddingHorizontal: 6 }}>
      <GText size="sm" color={on ? ui.primaryForeground : ui.foreground} style={{ fontVariant: ["tabular-nums"] }}>
        {text}
      </GText>
    </Press>
  )

  return (
    <>
      <View ref={triggerRef} collapsable={false} style={{ alignSelf: variant === "field" ? "stretch" : "flex-start" }}>
        <Press
          accessibilityRole="button"
          aria-expanded={open}
          aria-label={props["aria-label"] ? `${props["aria-label"]}${label ? `, ${label}` : ""}` : undefined}
          aria-disabled={!!disabled}
          disabled={disabled}
          onPress={() => setOpen(!open)}
          style={[
            variant === "field"
              ? { flexDirection: "row", alignItems: "center", gap: 8, height: ui.control.default, borderRadius: ui.radius.control, paddingLeft: ui.pad.sm, paddingRight: 12 }
              : { height: ui.control.sm, borderRadius: ui.radius.button, paddingHorizontal: ui.pad.sm, alignItems: "center", justifyContent: "center" },
            { backgroundColor: open ? ui.fillStrong : ui.fill, opacity: disabled ? 0.5 : 1 },
            web({ cursor: "pointer" }),
          ]}
        >
          {variant === "field" ? <CalendarIcon size={16} color={ui.mutedForeground} /> : null}
          <GText size="sm" weight={variant === "compact" ? "500" : undefined} color={!label ? ui.mutedForeground : open && variant === "compact" ? ui.primary : ui.foreground} style={{ fontVariant: ["tabular-nums"] }}>
            {label ?? placeholder}
          </GText>
        </Press>
      </View>
      <Floating open={open} anchor={rect} onClose={() => setOpen(false)} align="start" sideOffset={6} style={{ padding: 4 }}>
        {props.mode === "range" ? (
          <Calendar mode="range" selected={range} onSelect={(r) => commit(r)} />
        ) : (
          <Calendar
            mode="single"
            selected={single}
            onSelect={(d) => {
              if (d && single && props.time) d.setHours(single.getHours(), single.getMinutes(), 0, 0)
              commit(d)
              if (!props.time) setOpen(false)
            }}
          />
        )}
        {props.mode !== "range" && props.time ? (
          <View style={{ gap: 6, borderTopWidth: 1, borderTopColor: ui.separator, padding: 8 }}>
            <GText size="xs" tone="muted">
              Time
            </GText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }} accessibilityLabel="Hour">
              {Array.from({ length: 24 }, (_, h) => chip(single?.getHours() === h, String(h).padStart(2, "0"), () => setTime(h, single?.getMinutes() ?? 0), h))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }} accessibilityLabel="Minute">
              {slots.map((m) => chip(!!single && Math.floor(single.getMinutes() / step) * step === m, String(m).padStart(2, "0"), () => setTime(single?.getHours() ?? 9, m), m))}
            </ScrollView>
          </View>
        ) : null}
      </Floating>
    </>
  )
}

export { DatePicker }
export type { DatePickerProps }
