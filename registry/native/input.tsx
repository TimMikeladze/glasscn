import * as React from "react"
import { TextInput, type TextInputProps } from "react-native"

import { alpha, useUI, web } from "@/components/glass/native/ui"

export type InputProps = TextInputProps & {
  /** Mark the value invalid: a destructive ring (the web's aria-invalid). */
  invalid?: boolean
  /** Not editable, dimmed (the web's disabled). */
  disabled?: boolean
}

/** Focus, ring and fill shared by Input and Textarea. */
export function useField({ invalid, disabled, onFocus, onBlur, editable }: InputProps) {
  const ui = useUI()
  const [focused, setFocused] = React.useState(false)
  const ring = invalid ? alpha(ui.destructive, 0.3) : focused ? alpha(ui.primary, 0.4) : "transparent"
  return {
    ui,
    props: {
      editable: !disabled && editable !== false,
      "aria-disabled": !!disabled,
      placeholderTextColor: ui.mutedForeground,
      selectionColor: alpha(ui.primary, 0.45),
      cursorColor: ui.primary,
      onFocus: (e: Parameters<NonNullable<TextInputProps["onFocus"]>>[0]) => {
        setFocused(true)
        onFocus?.(e)
      },
      onBlur: (e: Parameters<NonNullable<TextInputProps["onBlur"]>>[0]) => {
        setFocused(false)
        onBlur?.(e)
      },
    },
    style: {
      width: "100%" as const,
      borderRadius: ui.radius.control,
      borderCurve: "continuous" as const,
      backgroundColor: focused ? ui.fillStrong : ui.fill,
      paddingHorizontal: 14,
      fontSize: ui.text.base,
      color: ui.foreground,
      borderWidth: 3,
      borderColor: ring,
      opacity: disabled ? 0.5 : 1,
      ...web({ outlineStyle: "none", caretColor: ui.primary }),
    },
  }
}

/** A filled field on glass: soft fill, no border, accent caret and ring. */
function Input({ invalid, disabled, style, onFocus, onBlur, editable, ...props }: InputProps) {
  const f = useField({ invalid, disabled, onFocus, onBlur, editable })
  return <TextInput {...f.props} style={[f.style, { height: f.ui.control.default }, style]} {...props} />
}

export { Input }
