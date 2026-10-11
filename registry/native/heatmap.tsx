import * as React from "react"
import { I18nManager, Platform, View, type LayoutChangeEvent, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, type SharedValue } from "react-native-reanimated"

import { ChartTooltip } from "@/components/glass/native/chart"
import { heatCellTitle, heatmapWeeks, isoDate, monthLabels, weekdayLabels, type HeatCell } from "@/components/glass/native/chart-math"
import { alpha, GText, useUI, type UI } from "@/components/glass/native/ui"

const GAP = 3
const MONTH_ROW = 14
const levels = (ui: UI) => [ui.fill, alpha(ui.primary, 0.25), alpha(ui.primary, 0.5), alpha(ui.primary, 0.75), ui.primary]

/**
 * Days as rounded cells in week columns, coloured by intensity — a contribution
 * graph. Values are numbers by ISO date; levels are quantised against the max.
 *
 * The cells are plain views under one gesture layer (NAT-69): pressing or
 * hovering lights a cell and shows its title, and a tap calls `onSelect`. A
 * screen reader hears one summary and swipes up and down through the days.
 */
export function Heatmap({
  values,
  weeks = 26,
  weekStart = 1,
  today = isoDate(new Date()),
  max,
  cellSize = 16,
  locale = "en-US",
  onSelect,
  formatTitle = (c) => heatCellTitle(c, locale),
  accessibilityLabel,
  style,
  ...props
}: Omit<ViewProps, "style"> & {
  values: Record<string, number>
  weeks?: number
  weekStart?: 0 | 1
  today?: string
  max?: number
  /** Largest a cell grows, in px — cells shrink below it to fit narrow containers. */
  cellSize?: number
  /** BCP 47 locale for weekday, month and title text — the same as the web Heatmap's. */
  locale?: string
  onSelect?: (date: string) => void
  formatTitle?: (cell: HeatCell) => string
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  const fills = levels(ui)
  const [width, setWidth] = React.useState(0)
  const cols = heatmapWeeks(values, { today, weeks, weekStart, max })
  const months = monthLabels(cols, locale)
  const days = weekdayLabels(weekStart, locale)
  const cell = width ? Math.max(4, Math.min(cellSize, (width - GAP * (weeks - 1)) / weeks)) : cellSize
  // every day up to today, in order: what the gesture and the screen reader walk
  const cells = cols.flat()
  const past = cells.filter((c) => !c.future)
  const active = past.filter((c) => c.value > 0)
  const best = active.reduce<HeatCell | null>((a, c) => (!a || c.value > a.value ? c : a), null)
  const summary =
    accessibilityLabel ??
    `${weeks} weeks, ${active.length} active ${active.length === 1 ? "day" : "days"}${best ? `, most on ${formatTitle(best)}` : ""}`

  // ---- one gesture layer: hit-test the grid on the UI thread ----
  const rtl = I18nManager.isRTL
  const focus = useSharedValue(-1)
  const step = cell + GAP
  const n = cells.length
  const futureMask = cells.map((c) => (c.future ? 1 : 0))
  const select = (i: number) => onSelect?.(cells[i].date)
  const gesture = (() => {
    const at = (x: number, y: number) => {
      "worklet"
      const k = Math.floor(x / step)
      // gesture x runs left to right; weeks run from the leading edge
      const w = rtl ? weeks - 1 - k : k
      const r = Math.floor((y - MONTH_ROW - GAP) / step)
      if (w < 0 || w >= weeks || r < 0 || r > 6) return -1
      const i = w * 7 + r
      return i < n && !futureMask[i] ? i : -1
    }
    const move = (x: number, y: number) => {
      "worklet"
      const i = at(x, y)
      if (i !== focus.get()) focus.set(i)
    }
    const clear = () => {
      "worklet"
      focus.set(-1)
    }
    const pan = Gesture.Pan()
      .activeOffsetX([-6, 6])
      .failOffsetY([-12, 12])
      .onBegin((e) => move(e.x, e.y))
      .onUpdate((e) => move(e.x, e.y))
      .onFinalize(clear)
    const tap = Gesture.Tap()
      .enabled(!!onSelect)
      .onEnd((e, ok) => {
        const i = at(e.x, e.y)
        if (ok && i >= 0) runOnJS(select)(i)
      })
    const hover = Gesture.Hover()
      .onBegin((e) => move(e.x, e.y))
      .onUpdate((e) => move(e.x, e.y))
      .onFinalize(clear)
    return Gesture.Simultaneous(pan, tap, hover)
  })()
  const ringStyle = useAnimatedStyle(() => {
    const i = focus.value
    if (i < 0) return { opacity: 0 }
    return { opacity: 1, transform: [{ translateX: (rtl ? weeks - 1 - Math.floor(i / 7) : Math.floor(i / 7)) * step - 2 }, { translateY: MONTH_ROW + GAP + (i % 7) * step - 2 }] }
  })

  // ---- screen reader: one summary, swipe through the days ----
  const [a11y, setA11y] = React.useState<number | null>(null)
  const pastIndex = cells.map((c, i) => (c.future ? -1 : i)).filter((i) => i >= 0)
  const stepA11y = (d: 1 | -1) => {
    const k = a11y === null ? (d > 0 ? 0 : pastIndex.length - 1) : Math.min(pastIndex.length - 1, Math.max(0, pastIndex.indexOf(a11y) + d))
    const i = pastIndex[k] ?? null
    setA11y(i)
    focus.set(i ?? -1)
  }

  const label = (text: React.ReactNode) => (
    <GText style={{ fontSize: 10, lineHeight: 12 }} tone="muted" numberOfLines={1}>
      {text}
    </GText>
  )
  return (
    <View style={[{ flexDirection: "row", gap: 6 }, style]} {...props}>
      <View style={{ flexShrink: 0, gap: GAP, paddingTop: MONTH_ROW + GAP }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {days.map((d, r) => (
          <View key={r} style={{ height: cell, justifyContent: "center" }}>
            {r % 2 === 0 ? label(d) : null}
          </View>
        ))}
      </View>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={summary}
        accessibilityValue={a11y !== null ? { text: formatTitle(cells[a11y]) } : undefined}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }, ...(onSelect ? [{ name: "activate" as const }] : [])]}
        onAccessibilityAction={(e) => {
          const name = e.nativeEvent.actionName
          if (name === "increment") stepA11y(1)
          else if (name === "decrement") stepA11y(-1)
          else if (name === "activate" && a11y !== null) onSelect?.(cells[a11y].date)
        }}
        style={{ flex: 1, minWidth: 0 }}
        onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      >
        <View style={{ flexDirection: "row", gap: GAP }}>
          {cols.map((col, w) => (
            <View key={col[0].date} style={{ width: cell, gap: GAP }}>
              <View style={{ height: MONTH_ROW, overflow: "visible" }}>{months[w] ? <View style={{ position: "absolute", left: 0, width: 40 }}>{label(months[w])}</View> : null}</View>
              {col.map((c) => (
                <View
                  key={c.date}
                  style={{ width: cell, height: cell, borderRadius: 3, backgroundColor: c.future ? "transparent" : fills[c.level], borderWidth: c.today ? 2 : 0, borderColor: ui.primary }}
                />
              ))}
            </View>
          ))}
        </View>
        <Animated.View pointerEvents="none" style={[{ position: "absolute", top: 0, left: 0, width: cell + 4, height: cell + 4, borderRadius: 5, borderWidth: 2, borderColor: ui.foreground }, ringStyle]} />
        <GestureDetector gesture={gesture}>
          <View collapsable={false} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, ...(Platform.OS === "web" && onSelect ? ({ cursor: "pointer" } as object) : {}) }} />
        </GestureDetector>
        <CellTip focus={focus} titles={cells.map((c) => formatTitle(c))} colors={cells.map((c) => fills[c.level])} step={step} width={width} />
      </View>
    </View>
  )
}

/** The focused day's title — its own state, so only it re-renders as the finger moves. */
function CellTip({ focus, titles, colors, step, width }: { focus: SharedValue<number>; titles: string[]; colors: string[]; step: number; width: number }) {
  const [shown, setShown] = React.useState(-1)
  useAnimatedReaction(
    () => focus.value,
    (now, prev) => {
      if (prev !== null && now !== prev) runOnJS(setShown)(now)
    }
  )
  if (shown < 0 || !titles[shown]) return null
  const left = Math.min(Math.max(0, width - 150), Math.max(0, Math.floor(shown / 7) * step - 40))
  const top = Math.max(-44, MONTH_ROW + GAP + (shown % 7) * step - 44)
  return (
    <View pointerEvents="none" style={{ position: "absolute", left, top }}>
      <ChartTooltip content={{ rows: [{ label: titles[shown], value: "", color: colors[shown] }] }} />
    </View>
  )
}

/** "Less ▢▢▢▢▢ More". */
export function HeatmapLegend({ less = "Less", more = "More", style, ...props }: Omit<ViewProps, "style"> & { less?: string; more?: string; style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", gap: 4 }, style]} {...props}>
      <GText size="xs" tone="muted" style={{ marginEnd: 4 }}>
        {less}
      </GText>
      {levels(ui).map((c, i) => (
        <View key={i} style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: c }} />
      ))}
      <GText size="xs" tone="muted" style={{ marginStart: 4 }}>
        {more}
      </GText>
    </View>
  )
}
