import * as React from "react"
import { Keyboard, Platform, TextInput, View, type TextInputProps } from "react-native"
import { SearchIcon, XIcon } from "lucide-react-native"

import { Glass } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { GText, useUI, web } from "@/components/glass/native/ui"

type Props = Omit<TextInputProps, "value" | "defaultValue" | "onChangeText"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onSubmit?: (value: string) => void
  /** Start as a round search button that opens on press. */
  minimized?: boolean
  /** `bottom` floats it above the keyboard. */
  placement?: "inline" | "bottom"
  showCancel?: "auto" | "always" | "never"
  cancelLabel?: string
  onCancel?: () => void
  suggestions?: string[]
  onSuggestionSelect?: (value: string) => void
}

/** Height of the on-screen keyboard (0 when hidden). */
function useKeyboardHeight(enabled: boolean) {
  const [height, setHeight] = React.useState(0)
  React.useEffect(() => {
    if (!enabled) return
    const show = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", (e) => setHeight(e.endCoordinates.height))
    const hide = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setHeight(0))
    return () => {
      show.remove()
      hide.remove()
    }
  }, [enabled])
  return height
}

/** A capsule search field on liquid glass: Clear, Cancel, a minimized button form, suggestions, keyboard-riding bottom placement. */
function SearchField({ value, defaultValue = "", onValueChange, onSubmit, minimized = false, placement = "inline", showCancel = "auto", cancelLabel = "Cancel", onCancel, suggestions = [], onSuggestionSelect, placeholder = "Search", style, ...props }: Props) {
  const ui = useUI()
  const [inner, setInner] = React.useState(defaultValue)
  const text = value ?? inner
  const setText = (v: string) => {
    setInner(v)
    onValueChange?.(v)
  }
  const [open, setOpen] = React.useState(!minimized)
  const [focused, setFocused] = React.useState(false)
  const input = React.useRef<TextInput>(null)
  const keyboard = useKeyboardHeight(placement === "bottom")
  const cancel = showCancel === "always" || (showCancel === "auto" && (focused || (minimized && open)))
  const finish = () => {
    setText("")
    input.current?.blur()
    if (minimized) setOpen(false)
    onCancel?.()
  }
  const wrap = placement === "bottom" ? { position: "absolute" as const, left: 12, right: 12, bottom: 12 + keyboard, zIndex: 40 } : null
  if (!open) {
    return (
      <View style={[wrap, style as object]}>
        <Press haptic accessibilityRole="button" accessibilityLabel={placeholder} onPress={() => (setOpen(true), setTimeout(() => input.current?.focus(), 0))}>
          <Glass interactive radius={ui.radius.button} style={{ width: ui.control.lg, height: ui.control.lg, alignItems: "center", justifyContent: "center" }}>
            <SearchIcon size={20} color={ui.foreground} />
          </Glass>
        </Press>
      </View>
    )
  }
  return (
    <View style={[{ gap: 8 }, wrap, style as object]}>
      {focused && suggestions.length ? (
        <Glass role="list" radius={ui.radius.surface} style={{ padding: 6, order: placement === "bottom" ? 0 : 2 } as object}>
          {suggestions.map((s) => (
            <Press key={s} accessibilityRole="button" onPress={() => (setText(s), onSuggestionSelect?.(s))} style={{ height: ui.control.default, justifyContent: "center", paddingHorizontal: ui.pad.sm, borderRadius: ui.radius.control }}>
              <GText size="sm">{s}</GText>
            </Press>
          ))}
        </Glass>
      ) : null}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, order: 1 } as object}>
        <Glass interactive radius={ui.radius.button} style={{ flex: 1, height: ui.control.lg, flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 14, paddingRight: 6 }}>
          <SearchIcon size={18} color={ui.mutedForeground} />
          <TextInput
            ref={input}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor={ui.mutedForeground}
            returnKeyType="search"
            accessibilityRole="search"
            onSubmitEditing={() => onSubmit?.(text)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false)
              if (minimized && !text) setOpen(false)
            }}
            style={[{ flex: 1, height: "100%", fontSize: ui.text.base, color: ui.foreground }, web({ outlineStyle: "none" })]}
            {...props}
          />
          {text ? (
            <Press accessibilityRole="button" accessibilityLabel="Clear" hitSlop={8} onPress={() => setText("")} style={{ width: ui.control.xs, height: ui.control.xs, borderRadius: ui.radius.button, alignItems: "center", justifyContent: "center", backgroundColor: ui.fill }}>
              <XIcon size={14} color={ui.mutedForeground} />
            </Press>
          ) : null}
        </Glass>
        {cancel ? (
          <Press accessibilityRole="button" onPress={finish} hitSlop={8}>
            <GText size="sm" tone="primary" weight="500">
              {cancelLabel}
            </GText>
          </Press>
        ) : null}
      </View>
    </View>
  )
}

export { SearchField }
