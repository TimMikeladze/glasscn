import * as React from "react"
import { type PressableProps, type StyleProp, type ViewStyle } from "react-native"

import { decorate } from "@/components/glass/native/button"
import { Press } from "@/components/glass/native/press"
import { alpha, useUI, web, type UI } from "@/components/glass/native/ui"

type Variant = "default" | "outline"
type Size = "sm" | "default" | "lg"

/** Resolved styles for a toggle — the native stand-in for the web's cva helper. */
function toggleVariants(ui: UI, { variant = "default", size = "default", on = false }: { variant?: Variant; size?: Size; on?: boolean } = {}) {
  const h = ui.control[size]
  return {
    container: {
      height: h,
      minWidth: h,
      paddingHorizontal: size === "lg" ? ui.pad.sm : ui.pad.xs,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      gap: 8,
      borderRadius: ui.radius.control,
      backgroundColor: on ? alpha(ui.primary, ui.scheme === "dark" ? 0.22 : 0.16) : "transparent",
      borderWidth: variant === "outline" ? 1 : 0,
      borderColor: ui.glassBorder,
    },
    color: on ? ui.primary : ui.foreground,
  }
}

type ToggleProps = Omit<PressableProps, "style" | "children"> & {
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  variant?: Variant
  size?: Size
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

/** A two-state button: clear off, the accent's tint on. */
function Toggle({ pressed, defaultPressed = false, onPressedChange, variant, size, disabled, style, children, ...props }: ToggleProps) {
  const ui = useUI()
  const [inner, setInner] = React.useState(defaultPressed)
  const on = pressed ?? inner
  const v = toggleVariants(ui, { variant, size, on })
  return (
    <Press
      haptic
      squash={ui.motion.pressScale}
      disabled={disabled}
      accessibilityRole="button"
      aria-pressed={on}
      aria-disabled={!!disabled}
      onPress={() => {
        setInner(!on)
        onPressedChange?.(!on)
      }}
      style={[v.container, disabled ? { opacity: 0.45 } : null, web({ cursor: disabled ? "default" : "pointer" }), style]}
      {...props}
    >
      {decorate(children, { color: v.color, fontSize: 14, fontWeight: "500" }, v.color, 16)}
    </Press>
  )
}

export { Toggle, toggleVariants }
