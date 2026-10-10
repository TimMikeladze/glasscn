import * as React from "react"
import { type StyleProp, type ViewStyle } from "react-native"
import { CheckIcon, MinusIcon } from "lucide-react-native"

import { Press } from "@/components/glass/native/press"
import { alpha, useUI, web } from "@/components/glass/native/ui"

type CheckedState = boolean | "indeterminate"

type CheckboxProps = {
  checked?: CheckedState
  defaultChecked?: CheckedState
  onCheckedChange?: (checked: CheckedState) => void
  disabled?: boolean
  /** aria-invalid: a destructive border. */
  invalid?: boolean
  accessibilityLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
}

/** shadcn's Checkbox on glass: a soft filled box that fills with the accent; `checked="indeterminate"` shows a dash. */
export function Checkbox({ checked, defaultChecked = false, onCheckedChange, disabled, invalid, style, ...props }: CheckboxProps) {
  const ui = useUI()
  const [inner, setInner] = React.useState<CheckedState>(defaultChecked)
  const state = checked ?? inner
  const filled = state !== false
  const size = 18
  return (
    <Press
      haptic
      squash={ui.motion.pressScale}
      disabled={disabled}
      hitSlop={10}
      onPress={() => {
        const next = state === "indeterminate" ? true : !state
        setInner(next)
        onCheckedChange?.(next)
      }}
      accessibilityRole="checkbox"
      aria-checked={state === "indeterminate" ? "mixed" : state} aria-disabled={disabled}
      style={[
        {
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: ui.radius.control * 0.35,
          borderWidth: 1,
          borderColor: invalid ? ui.destructive : filled ? "transparent" : alpha(ui.foreground, 0.25),
          backgroundColor: filled ? ui.primary : ui.fill,
          opacity: disabled ? 0.5 : 1,
        },
        web({ cursor: disabled ? "not-allowed" : "pointer" }),
        style,
      ]}
      {...props}
    >
      {state === true ? <CheckIcon size={size * 0.85} strokeWidth={3} color={ui.primaryForeground} /> : null}
      {state === "indeterminate" ? <MinusIcon size={size * 0.85} strokeWidth={3} color={ui.primaryForeground} /> : null}
    </Press>
  )
}
