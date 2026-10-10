import * as React from "react"
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"

import { fraction, segmentAt, segments } from "@/components/glass/native/chart-math"
import { GText, useUI } from "@/components/glass/native/ui"

/**
 * A range split into bands — a score scale, a budget — with an optional marker
 * at `marker`. `values` are band sizes in order; the marker sits on the same
 * scale (their running total), so `[50, 20, 30]` with `marker={62}` lands in the
 * second band.
 */
export function CategoryBar({
  values,
  marker,
  colors,
  labels = true,
  markerLabel,
  style,
  ...props
}: Omit<ViewProps, "style"> & {
  values: number[]
  marker?: number
  /** One colour per band; cycles. Defaults to the five chart colours. */
  colors?: string[]
  /** Show the band edges under the bar. */
  labels?: boolean
  /** Accessible text for the marker, e.g. "Score 62". */
  markerLabel?: string
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  const palette = colors ?? ui.charts
  const segs = segments(values)
  const clean = values.map((v) => (Number.isFinite(v) && v > 0 ? v : 0))
  const total = clean.reduce((a, v) => a + v, 0)
  const at = marker === undefined ? null : fraction(marker, 0, total) * 100
  const active = at === null ? -1 : segmentAt(segs, at)
  const edges = clean.reduce<number[]>((acc, v) => [...acc, (acc[acc.length - 1] ?? 0) + v], [])
  return (
    <View style={[{ gap: 6 }, style]} {...props}>
      <View>
        <View style={{ flexDirection: "row", height: 8, width: "100%", gap: 2 }}>
          {segs.map((s, i) => (
            <View
              key={i}
              style={{
                width: `${s.width}%`,
                flexShrink: 1,
                height: "100%",
                backgroundColor: palette[i % palette.length],
                opacity: active === -1 || i === active ? 1 : 0.4,
                borderTopLeftRadius: i === 0 ? ui.radius.badge : 0,
                borderBottomLeftRadius: i === 0 ? ui.radius.badge : 0,
                borderTopRightRadius: i === segs.length - 1 ? ui.radius.badge : 0,
                borderBottomRightRadius: i === segs.length - 1 ? ui.radius.badge : 0,
              }}
            />
          ))}
        </View>
        {at === null ? null : (
          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel={markerLabel ?? `${marker}`}
            style={{ position: "absolute", top: -4, bottom: -4, left: `${at}%`, width: 4, marginLeft: -2, borderRadius: 999, backgroundColor: ui.foreground, borderWidth: 1, borderColor: ui.auroraBase }}
          />
        )}
      </View>
      {labels ? (
        <View style={{ height: 16 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Edge style={{ left: 0 }}>0</Edge>
          {values.map((_, i) => {
            const left = segs[i].start + segs[i].width
            const last = i === values.length - 1
            // drop an inner edge that would collide with its neighbour or the end label
            if (!last && (left - (segs[i - 1] ? segs[i - 1].start + segs[i - 1].width : 0) < 8 || 100 - left < 8)) return null
            return last ? (
              <Edge key={i} style={{ right: 0 }}>
                {edges[i]}
              </Edge>
            ) : (
              // centre on the edge: a fixed-width box shifted back by half
              <Edge key={i} style={{ left: `${left}%`, width: 48, marginLeft: -24 }} align="center">
                {edges[i]}
              </Edge>
            )
          })}
        </View>
      ) : null}
    </View>
  )
}

function Edge({ style, align, children }: { style: ViewStyle; align?: "center"; children: React.ReactNode }) {
  return (
    <View style={[{ position: "absolute", top: 0 }, style]}>
      <GText size="xs" tone="muted" align={align} style={{ fontVariant: ["tabular-nums"] }}>
        {children}
      </GText>
    </View>
  )
}
