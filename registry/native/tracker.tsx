import * as React from "react"
import { I18nManager, Platform, View, type LayoutChangeEvent, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, type SharedValue } from "react-native-reanimated"

import { ChartTooltip } from "@/components/glass/native/chart"
import { stepIndex } from "@/components/glass/native/chart-math"
import { alpha, useUI, type UI } from "@/components/glass/native/ui"

export interface TrackerBlock {
  /** Read by screen readers and passed to `onSelect`. */
  title: string
  /** A status from `colors`; unknown statuses render as empty. */
  status?: string
  key?: string
}

/** The default status colours, from the theme. */
function defaultColors(ui: UI): Record<string, string> {
  return { done: ui.primary, partial: alpha(ui.primary, 0.45), missed: alpha(ui.foreground, 0.25), rest: ui.fill }
}

/**
 * A row of status blocks — uptime, a habit's last 30 days. Blocks stretch to
 * fill the width. Map your statuses to colours with `colors`.
 *
 * The blocks are plain views under one gesture layer (NAT-69): pressing or
 * hovering shows a block's title, a tap calls `onSelect`. A screen reader hears
 * a count per status and swipes up and down through the blocks.
 */
export function Tracker({
  data,
  colors,
  onSelect,
  accessibilityLabel,
  style,
  ...props
}: Omit<ViewProps, "style"> & {
  data: TrackerBlock[]
  /** Status → colour (any colour string, e.g. `ui.charts[1]`). */
  colors?: Record<string, string>
  /** Tapping a block (the web shows its title on hover). */
  onSelect?: (block: TrackerBlock, index: number) => void
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  const map = colors ?? defaultColors(ui)
  const radius = ui.radius.control * 0.7
  const [width, setWidth] = React.useState(0)
  const n = data.length
  const counts = data.reduce<Record<string, number>>((acc, b) => ((acc[b.status ?? "none"] = (acc[b.status ?? "none"] ?? 0) + 1), acc), {})
  const summary =
    accessibilityLabel ??
    `${n} ${n === 1 ? "block" : "blocks"}: ${Object.entries(counts)
      .map(([k, v]) => `${v} ${k}`)
      .join(", ")}`

  const rtl = I18nManager.isRTL
  const focus = useSharedValue(-1)
  const select = (i: number) => onSelect?.(data[i], i)
  const gesture = (() => {
    const at = (x: number) => {
      "worklet"
      if (width <= 0) return -1
      const k = Math.floor((x / width) * n)
      // gesture x runs left to right; blocks run from the leading edge
      const i = rtl ? n - 1 - k : k
      return i >= 0 && i < n ? i : -1
    }
    const move = (x: number) => {
      "worklet"
      const i = at(x)
      if (i !== focus.get()) focus.set(i)
    }
    const clear = () => {
      "worklet"
      focus.set(-1)
    }
    const pan = Gesture.Pan()
      .activeOffsetX([-6, 6])
      .failOffsetY([-12, 12])
      .onBegin((e) => move(e.x))
      .onUpdate((e) => move(e.x))
      .onFinalize(clear)
    const tap = Gesture.Tap()
      .enabled(!!onSelect)
      .onEnd((e, ok) => {
        const i = at(e.x)
        if (ok && i >= 0) runOnJS(select)(i)
      })
    const hover = Gesture.Hover()
      .onBegin((e) => move(e.x))
      .onUpdate((e) => move(e.x))
      .onFinalize(clear)
    return Gesture.Simultaneous(pan, tap, hover)
  })()
  const slot = n ? width / n : 0
  const markStyle = useAnimatedStyle(() => {
    const i = focus.value
    if (i < 0) return { opacity: 0 }
    return { opacity: 1, transform: [{ translateX: (rtl ? n - 1 - i : i) * slot }] }
  })

  const [a11y, setA11y] = React.useState<number | null>(null)
  const step = (d: 1 | -1) => {
    const i = stepIndex(a11y, d, n)
    setA11y(i)
    focus.set(i ?? -1)
  }

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={summary}
      accessibilityValue={a11y !== null ? { text: data[a11y].title } : undefined}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }, ...(onSelect ? [{ name: "activate" as const }] : [])]}
      onAccessibilityAction={(e) => {
        const name = e.nativeEvent.actionName
        if (name === "increment") step(1)
        else if (name === "decrement") step(-1)
        else if (name === "activate" && a11y !== null) onSelect?.(data[a11y], a11y)
      }}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={[{ height: ui.control.sm, width: "100%" }, style]}
      {...props}
    >
      <View style={{ flexDirection: "row", height: "100%", gap: 2 }}>
        {data.map((b, i) => (
          <View
            key={b.key ?? i}
            style={{
              flex: 1,
              minWidth: 0,
              height: "100%",
              backgroundColor: (b.status && map[b.status]) || ui.fill,
              borderTopStartRadius: i === 0 ? radius : 0,
              borderBottomStartRadius: i === 0 ? radius : 0,
              borderTopEndRadius: i === n - 1 ? radius : 0,
              borderBottomEndRadius: i === n - 1 ? radius : 0,
            }}
          />
        ))}
      </View>
      <Animated.View pointerEvents="none" style={[{ position: "absolute", top: -3, bottom: -3, left: 0, width: Math.max(2, slot - 2), borderRadius: 3, borderWidth: 2, borderColor: ui.foreground }, markStyle]} />
      <GestureDetector gesture={gesture}>
        <View collapsable={false} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, ...(Platform.OS === "web" && onSelect ? ({ cursor: "pointer" } as object) : {}) }} />
      </GestureDetector>
      <BlockTip focus={focus} titles={data.map((b) => b.title)} slot={slot} width={width} />
    </View>
  )
}

/** The focused block's title — its own state, so only it re-renders as the finger moves. */
function BlockTip({ focus, titles, slot, width }: { focus: SharedValue<number>; titles: string[]; slot: number; width: number }) {
  const [shown, setShown] = React.useState(-1)
  useAnimatedReaction(
    () => focus.value,
    (now, prev) => {
      if (prev !== null && now !== prev) runOnJS(setShown)(now)
    }
  )
  if (shown < 0 || !titles[shown]) return null
  return (
    <View pointerEvents="none" style={{ position: "absolute", bottom: "100%", marginBottom: 8, left: Math.min(Math.max(0, width - 160), Math.max(0, shown * slot - 40)) }}>
      <ChartTooltip content={{ rows: [{ label: titles[shown], value: "" }] }} />
    </View>
  )
}
