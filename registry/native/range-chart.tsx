import * as React from "react"
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg"

import { fraction } from "@/components/glass/native/chart-math"
import { GText, useUI } from "@/components/glass/native/ui"

/**
 * Low-to-high capsules on a shared scale with an optional current dot — the
 * web's RangeChart (Weather's ten-day temperatures). Each capsule shows its
 * slice of one gradient across the domain.
 */
export function RangeChart<Row>({
  data,
  label,
  low,
  high,
  current,
  min,
  max,
  valueFormat = (v) => v.toLocaleString(),
  from,
  to,
  style,
  ...props
}: Omit<ViewProps, "style" | "children"> & {
  data: readonly Row[]
  label: (d: Row) => React.ReactNode
  low: (d: Row) => number
  high: (d: Row) => number
  current?: (d: Row) => number | null | undefined
  min?: number
  max?: number
  valueFormat?: (value: number) => string
  from?: string
  to?: string
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  const [width, setWidth] = React.useState(0)
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const all = data.flatMap((d) => [low(d), high(d)])
  const lo = min ?? Math.min(...all)
  const hi = max ?? Math.max(...all)
  const c0 = from ?? ui.charts[4]
  const c1 = to ?? ui.charts[0]
  return (
    <View accessibilityRole="list" style={[{ gap: 8 }, style]} {...props}>
      {data.map((d, i) => {
        const l = Math.min(low(d), high(d))
        const h = Math.max(low(d), high(d))
        const now = current?.(d)
        const x0 = fraction(l, lo, hi) * width
        const x1 = fraction(h, lo, hi) * width
        return (
          <View key={i} accessible accessibilityRole="text" accessibilityLabel={`${typeof label(d) === "string" || typeof label(d) === "number" ? label(d) : `Row ${i + 1}`}: low ${valueFormat(l)}, high ${valueFormat(h)}${now == null ? "" : `, now ${valueFormat(now)}`}`} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {typeof label(d) === "string" || typeof label(d) === "number" ? (
              <GText size="sm" weight="500" style={{ minWidth: 48 }}>
                {label(d) as string}
              </GText>
            ) : (
              <View style={{ minWidth: 48 }}>{label(d)}</View>
            )}
            <GText size="sm" tone="muted" style={{ minWidth: 32, textAlign: "right", fontVariant: ["tabular-nums"] }}>
              {valueFormat(l)}
            </GText>
            <View style={{ flex: 1, height: 10 }} onLayout={i === 0 ? (e) => setWidth(e.nativeEvent.layout.width) : undefined}>
              {width > 0 ? (
                <Svg width={width} height={10}>
                  <Defs>
                    <LinearGradient id={`${id}-g`} x1="0" y1="0" x2={String(width)} y2="0" gradientUnits="userSpaceOnUse">
                      <Stop offset="0" stopColor={c0} />
                      <Stop offset="1" stopColor={c1} />
                    </LinearGradient>
                  </Defs>
                  <Rect x={0} y={2} width={width} height={6} rx={3} fill={ui.fill} />
                  <Rect x={x0} y={2} width={Math.max(6, x1 - x0)} height={6} rx={3} fill={`url(#${id}-g)`} />
                  {now == null ? null : <Rect x={fraction(now, lo, hi) * width - 4} y={1} width={8} height={8} rx={4} fill={ui.foreground} stroke={ui.auroraBase} strokeWidth={2} />}
                </Svg>
              ) : null}
            </View>
            <GText size="sm" weight="500" style={{ minWidth: 32 }}>
              {valueFormat(h)}
            </GText>
          </View>
        )
      })}
    </View>
  )
}
