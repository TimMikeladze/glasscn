import * as React from "react"
import { AccessibilityInfo, Animated, Easing, Platform, View, type LayoutChangeEvent, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from "react-native-svg"

import { areaPath, scaleSeries, smoothPath } from "@/components/glass/native/chart-math"
import { useUI } from "@/components/glass/native/ui"

// Animated sets collapsable={false}, which react-native-svg would pass to the DOM on web — strip it.
const APath = Animated.createAnimatedComponent(({ collapsable, ...p }: React.ComponentProps<typeof Path> & { collapsable?: boolean }) => {
  void collapsable
  return <Path {...p} />
})
const AView = Animated.View

/**
 * A measure over time: a smooth stroke that draws itself, a soft gradient
 * beneath, the latest point lit. Gaps (`null`) are skipped. Scales to its
 * container's width; set the height with `height`.
 */
export function Sparkline({
  data,
  height = 72,
  color,
  area = true,
  dot = true,
  style,
  onLayout,
  ...props
}: Omit<ViewProps, "children" | "style"> & {
  data: (number | null | undefined)[]
  height?: number
  color?: string
  area?: boolean
  dot?: boolean
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  const tone = color ?? ui.primary
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const [width, setWidth] = React.useState(0)
  const [draw] = React.useState(() => new Animated.Value(0))
  const [fade] = React.useState(() => new Animated.Value(0))
  React.useEffect(() => {
    if (!width) return
    let anim: Animated.CompositeAnimation | null = null
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (reduce) {
          draw.setValue(1)
          fade.setValue(1)
          return
        }
        const driver = Platform.OS !== "web"
        anim = Animated.parallel([
          Animated.timing(draw, { toValue: 1, duration: 1100, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: driver }),
          Animated.timing(fade, { toValue: 1, duration: 700, delay: 300, easing: Easing.out(Easing.quad), useNativeDriver: driver }),
        ])
        anim.start()
      })
    return () => anim?.stop()
  }, [width, draw, fade])

  const measure = (e: LayoutChangeEvent) => {
    setWidth(Math.round(e.nativeEvent.layout.width))
    onLayout?.(e)
  }
  const points = width ? scaleSeries(data, width, height, 6) : []
  if (points.length < 2) {
    return (
      <View style={[{ width: "100%", height }, style]} onLayout={measure} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" {...props}>
        {width ? (
          <Svg width={width} height={height}>
            <Line x1={6} x2={width - 6} y1={height - 6} y2={height - 6} stroke={ui.foreground} strokeOpacity={0.15} />
          </Svg>
        ) : null}
      </View>
    )
  }
  const last = points[points.length - 1]
  // overestimate the path length: the dash only has to cover it
  let length = 0
  for (let i = 1; i < points.length; i++) length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
  length = Math.ceil(length * 1.2)
  const present = data.filter((v): v is number => typeof v === "number" && Number.isFinite(v))
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Trend, latest ${present[present.length - 1]}`}
      style={[{ width: "100%", height, overflow: "visible" }, style]}
      onLayout={measure}
      {...props}
    >
      <Svg width={width} height={height} style={{ overflow: "visible" }}>
        <Defs>
          <LinearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={tone} stopOpacity={0.32} />
            <Stop offset="1" stopColor={tone} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {area ? <APath d={areaPath(points, height - 2)} fill={`url(#spark-${id})`} opacity={fade} /> : null}
        <APath
          d={smoothPath(points)}
          fill="none"
          stroke={tone}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${length} ${length}`}
          strokeDashoffset={draw.interpolate({ inputRange: [0, 1], outputRange: [length, 0] })}
        />
      </Svg>
      {dot ? (
        // the lit point pops in once the stroke reaches it
        <AView
          pointerEvents="none"
          style={{ position: "absolute", left: last.x - 7, top: last.y - 7, width: 14, height: 14, transform: [{ scale: draw.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0, 0, 1] }) }] }}
        >
          <Svg width={14} height={14}>
            <Circle cx={7} cy={7} r={7} fill={tone} opacity={0.22} />
            <Circle cx={7} cy={7} r={3.6} fill={tone} stroke={ui.auroraBase} strokeWidth={1.5} />
          </Svg>
        </AView>
      ) : null}
    </View>
  )
}
