import * as React from "react"
import { View, type ViewProps } from "react-native"

import { hitSlop } from "@/components/glass/native/a11y"
import { Press } from "@/components/glass/native/press"
import { useUI, web } from "@/components/glass/native/ui"

type Ctx = { value?: string; setValue: (v: string) => void; disabled?: boolean; variant: "default" | "card" }
const RadioContext = React.createContext<Ctx>({ setValue: () => {}, variant: "default" })

/** shadcn's RadioGroup on glass: accent circles with a dot. `variant="card"` for selectable tiles (RadioGroupCard). */
function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  disabled,
  variant = "default",
  style,
  ...props
}: ViewProps & { value?: string; defaultValue?: string; onValueChange?: (value: string) => void; disabled?: boolean; variant?: "default" | "card" }) {
  const [inner, setInner] = React.useState(defaultValue)
  const current = value ?? inner
  const ctx = React.useMemo(
    () => ({
      value: current,
      disabled,
      variant,
      setValue: (v: string) => {
        setInner(v)
        onValueChange?.(v)
      },
    }),
    [current, disabled, variant, onValueChange]
  )
  return (
    <RadioContext.Provider value={ctx}>
      <View role="radiogroup" style={[{ gap: 12 }, style]} {...props} />
    </RadioContext.Provider>
  )
}

function RadioGroupItem({ value, disabled, accessibilityLabel, style }: { value: string; disabled?: boolean; accessibilityLabel?: string; style?: ViewProps["style"] }) {
  const ui = useUI()
  const g = React.useContext(RadioContext)
  const checked = g.value === value
  const off = disabled || g.disabled
  const size = 18
  return (
    <Press
      haptic
      hitSlop={hitSlop(size)}
      disabled={off}
      onPress={() => g.setValue(value)}
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel}
      aria-checked={checked}
      aria-disabled={off}
      accessibilityState={{ checked, disabled: !!off }}
      style={[
        { width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: checked ? "transparent" : ui.mutedForeground, backgroundColor: checked ? ui.primary : ui.fill, opacity: off ? 0.5 : 1 },
        web({ cursor: off ? "not-allowed" : "pointer" }),
        style,
      ]}
    >
      {checked ? <View style={{ width: size * 0.4, height: size * 0.4, borderRadius: size, backgroundColor: ui.primaryForeground }} /> : null}
    </Press>
  )
}

/** A selectable tile for `variant="card"`: pressing anywhere chooses `value`. */
function RadioGroupCard({ value, style, children, ...props }: ViewProps & { value: string }) {
  const ui = useUI()
  const g = React.useContext(RadioContext)
  const checked = g.value === value
  return (
      <Press
        haptic
        onPress={() => g.setValue(value)}
        disabled={g.disabled}
        accessibilityRole="radio"
        aria-checked={checked}
        accessibilityState={{ checked, disabled: !!g.disabled }}
        style={[{ flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: ui.radius.control, backgroundColor: ui.fill, borderWidth: checked ? 2 : 1, borderColor: checked ? ui.primary : ui.glassBorder }, style]}
        {...props}
      >
        {children}
      </Press>
  )
}

export { RadioGroup, RadioGroupItem, RadioGroupCard }
