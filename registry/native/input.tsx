import * as React from "react"
import { TextInput, type TextInputProps } from "react-native"

import { useFieldIds } from "@/components/glass/native/field"
import { labelIdFor, useLabelTarget } from "@/components/glass/native/label"
import { alpha, useUI, web } from "@/components/glass/native/ui"

export type InputProps = TextInputProps & {
  /** Mark the value invalid: a destructive ring, announced as invalid (the web's aria-invalid). */
  invalid?: boolean
  "aria-invalid"?: boolean
  /** Not editable, dimmed (the web's disabled). */
  disabled?: boolean
  /** Pairs with `<Label htmlFor>`: the label focuses and names this field. Inside a Field, set for you. */
  id?: string
}

/**
 * Focus, ring, fill and accessibility wiring shared by Input, Textarea and InputGroup's fields.
 * Inside a Field it takes the field's id, invalid state, and description/error as its hint (NAT-43).
 */
export function useField({ invalid: invalidProp, "aria-invalid": ariaInvalid, disabled, onFocus, onBlur, editable, id: idProp, accessibilityHint, ...rest }: InputProps) {
  const ui = useUI()
  const field = useFieldIds()
  const ref = React.useRef<TextInput>(null)
  const [focused, setFocused] = React.useState(false)
  const id = idProp ?? field?.control
  const invalid = invalidProp ?? ariaInvalid ?? field?.invalid ?? false
  useLabelTarget(id, () => ref.current?.focus())
  const ring = invalid ? alpha(ui.destructive, 0.3) : focused ? alpha(ui.primary, 0.4) : "transparent"
  const hint = [invalid && !field?.hint ? "Invalid" : null, field?.hint, accessibilityHint].filter(Boolean).join(". ") || undefined
  return {
    ui,
    ref,
    props: {
      ref,
      nativeID: id,
      editable: !disabled && editable !== false,
      "aria-disabled": !!disabled,
      "aria-invalid": invalid || undefined,
      "aria-labelledby": rest["aria-labelledby"] ?? (id && !rest.accessibilityLabel && !rest["aria-label"] ? labelIdFor(id) : undefined),
      // the web reads aria-describedby; VoiceOver and TalkBack read the hint
      "aria-describedby": field ? [field.hint && invalid ? field.error : null, field.description].filter(Boolean).join(" ") : undefined,
      accessibilityHint: hint,
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
    } as TextInputProps & { ref: React.RefObject<TextInput | null> },
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

/** Split the props useField consumes from the ones passed straight to TextInput. */
export function fieldProps({ invalid, "aria-invalid": ariaInvalid, disabled, onFocus, onBlur, editable, id, accessibilityHint, ...props }: InputProps) {
  return [{ invalid, "aria-invalid": ariaInvalid, disabled, onFocus, onBlur, editable, id, accessibilityHint, accessibilityLabel: props.accessibilityLabel, "aria-label": props["aria-label"], "aria-labelledby": props["aria-labelledby"] }, props] as const
}

/** A filled field on glass: soft fill, no border, accent caret and ring. minHeight, so large text grows it. */
function Input({ style, size = "default", ...rest }: InputProps & { size?: "sm" | "default" | "lg" }) {
  const [own, props] = fieldProps(rest)
  const f = useField(own)
  const pad = size === "sm" ? { paddingHorizontal: f.ui.pad.xs, fontSize: f.ui.text.sm } : size === "lg" ? { paddingHorizontal: f.ui.pad.default } : null
  return <TextInput {...f.props} style={[f.style, { minHeight: f.ui.control[size] }, pad, style]} {...props} />
}

export { Input }
