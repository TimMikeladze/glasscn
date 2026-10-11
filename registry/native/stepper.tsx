import * as React from "react"
import { View, type StyleProp, type ViewStyle } from "react-native"
import { MinusIcon, PlusIcon } from "lucide-react-native"

import { hitSlop } from "@/components/glass/native/a11y"
import { Press } from "@/components/glass/native/press"
import { useUI } from "@/components/glass/native/ui"

/** Apple's − / + capsule pair: an adjustable (VoiceOver swipe up/down), hold to repeat. Show the value beside it. */
function Stepper({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  formatValue,
  size = "default",
  accessibilityLabel,
  style,
}: {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  formatValue?: (value: number) => string
  size?: "sm" | "default"
  accessibilityLabel?: string
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  const [inner, setInner] = React.useState(defaultValue)
  const value = valueProp ?? inner
  const latest = React.useRef(value)
  React.useEffect(() => {
    latest.current = value
  }, [value])
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const set = (next: number) => {
    const c = Math.min(max, Math.max(min, Math.round(next / step) * step))
    if (c === latest.current) return false
    latest.current = c
    setInner(c)
    onValueChange?.(c)
    return true
  }
  const stop = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }
  React.useEffect(() => stop, [])
  const start = (dir: 1 | -1) => {
    set(latest.current + dir * step)
    const tick = (delay: number) => {
      timer.current = setTimeout(() => (set(latest.current + dir * step) ? tick(70) : stop()), delay)
    }
    tick(420)
  }
  const h = size === "sm" ? ui.control.xs : ui.control.sm
  const half = (dir: 1 | -1) => (
    <Press
      haptic
      disabled={disabled || (dir < 0 ? value <= min : value >= max)}
      onPressIn={() => start(dir)}
      onPressOut={stop}
      hitSlop={hitSlop(h, 44)}
      importantForAccessibility="no"
      accessibilityElementsHidden
      style={{ flex: 1, alignItems: "center", justifyContent: "center", opacity: disabled || (dir < 0 ? value <= min : value >= max) ? 0.35 : 1 }}
    >
      {dir < 0 ? <MinusIcon size={16} color={ui.foreground} /> : <PlusIcon size={16} color={ui.foreground} />}
    </Press>
  )
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: value, text: formatValue?.(value) ?? String(value) }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(e) => set(latest.current + (e.nativeEvent.actionName === "increment" ? step : -step))}
      aria-disabled={disabled}
      style={[{ flexDirection: "row", minHeight: h, width: size === "sm" ? 76 : 92, borderRadius: ui.radius.button, backgroundColor: ui.fill, overflow: "hidden", opacity: disabled ? 0.5 : 1 }, style]}
    >
      {half(-1)}
      <View style={{ width: 1, marginVertical: h / 4, backgroundColor: ui.separator }} />
      {half(1)}
    </View>
  )
}

export { Stepper }
