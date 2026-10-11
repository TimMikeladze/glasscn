import * as React from "react"
import { Platform, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { KeyboardStickyView } from "react-native-keyboard-controller"
import { SearchIcon, XIcon } from "lucide-react-native"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { Glass } from "@/components/glass/native/glass"
import { Press, haptics } from "@/components/glass/native/press"
import { GText, useUI, web } from "@/components/glass/native/ui"

type Suggestion = string | { value: string; label: React.ReactNode }
const suggestionValue = (s: Suggestion) => (typeof s === "string" ? s : s.value)
const suggestionLabel = (s: Suggestion) => (typeof s === "string" ? s : s.label)

export type SearchFieldProps = Omit<TextInputProps, "value" | "defaultValue" | "onChangeText" | "style"> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onSubmit?: (value: string) => void
  /** Start as a round search button; it morphs open on press and folds back when left empty. */
  minimized?: boolean
  /** Open state of a minimized field, controlled. */
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  /** `bottom` floats it at the bottom edge, riding above the keyboard. */
  placement?: "inline" | "bottom"
  /** Show Cancel while focused (`auto`), always, or never. */
  showCancel?: "auto" | "always" | "never"
  cancelLabel?: string
  onCancel?: () => void
  suggestions?: Suggestion[]
  onSuggestionSelect?: (value: string) => void
  style?: StyleProp<ViewStyle>
}

function useControlled<T>(value: T | undefined, initial: T, onChange?: (v: T) => void) {
  const [inner, setInner] = React.useState(initial)
  const set = React.useCallback(
    (v: T) => {
      setInner(v)
      onChange?.(v)
    },
    [onChange]
  )
  return [value ?? inner, set] as const
}

/** A capsule search field on Liquid Glass: Clear, Cancel, a minimized button that morphs open, suggestions, keyboard-riding bottom placement. */
function SearchField({
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  minimized = false,
  expanded,
  onExpandedChange,
  placement = "inline",
  showCancel = "auto",
  cancelLabel = "Cancel",
  onCancel,
  suggestions = [],
  onSuggestionSelect,
  placeholder = "Search",
  style,
  onFocus,
  onBlur,
  ...props
}: SearchFieldProps) {
  const ui = useUI()
  const reduced = useReducedMotion()
  const [text, setText] = useControlled(value, defaultValue, onValueChange)
  const [open, setOpen] = useControlled(expanded, !minimized, onExpandedChange)
  const [focused, setFocused] = React.useState(false)
  const input = React.useRef<TextInput>(null)
  const cancel = showCancel === "always" || (showCancel === "auto" && (focused || (minimized && open)))
  const finish = () => {
    setText("")
    input.current?.blur()
    if (minimized) setOpen(false)
    onCancel?.()
  }
  // the capsule morphs between the round button and the field (a layout spring, never a fade)
  const morph = reduced ? undefined : LinearTransition.springify().duration(ui.motion.duration * 2.2).dampingRatio(0.8)
  const field = !open ? (
    <Press haptic liquid accessibilityRole="search" accessibilityLabel={placeholder} accessibilityHint="Opens the search field" onPress={() => (setOpen(true), setTimeout(() => input.current?.focus(), 0))}>
      <Animated.View layout={morph}>
        <Glass variant="liquid" interactive radius={ui.radius.button} style={{ width: ui.control.lg, height: ui.control.lg, alignItems: "center", justifyContent: "center" }}>
          <SearchIcon size={20} color={ui.foreground} />
        </Glass>
      </Animated.View>
    </Press>
  ) : (
    <View style={{ gap: 8 }}>
      {focused && suggestions.length ? (
        <Glass variant="liquid" role="list" radius={ui.radius.surface} style={{ padding: 6, order: placement === "bottom" ? 0 : 2 } as ViewStyle}>
          {suggestions.map((s) => (
            <Press
              key={suggestionValue(s)}
              accessibilityRole="button"
              onPress={() => {
                haptics.selection()
                setText(suggestionValue(s))
                onSuggestionSelect?.(suggestionValue(s))
              }}
              style={[{ minHeight: 44, justifyContent: "center", paddingHorizontal: ui.pad.sm, borderRadius: ui.radius.control }, web({ cursor: "pointer" })]}
            >
              {typeof suggestionLabel(s) === "string" ? <GText size="sm">{suggestionLabel(s)}</GText> : suggestionLabel(s)}
            </Press>
          ))}
        </Glass>
      ) : null}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, order: 1 } as ViewStyle}>
        <Animated.View layout={morph} style={{ flex: 1 }}>
          <Glass variant="liquid" interactive radius={ui.radius.button} style={{ height: ui.control.lg, flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 14, paddingRight: 6 }}>
            <SearchIcon size={18} color={ui.mutedForeground} />
            <TextInput
              ref={input}
              value={text}
              onChangeText={setText}
              placeholder={placeholder}
              placeholderTextColor={ui.mutedForeground}
              selectionColor={ui.primary}
              cursorColor={ui.primary}
              returnKeyType="search"
              enterKeyHint="search"
              accessibilityRole="search"
              accessibilityLabel={props.accessibilityLabel ?? placeholder}
              onSubmitEditing={() => onSubmit?.(text)}
              onFocus={(e) => {
                setFocused(true)
                onFocus?.(e)
              }}
              onBlur={(e) => {
                setFocused(false)
                if (minimized && !text) setOpen(false)
                onBlur?.(e)
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
        </Animated.View>
        {cancel ? (
          <Press accessibilityRole="button" onPress={finish} hitSlop={8} style={{ minHeight: 44, justifyContent: "center" }}>
            <GText size="sm" tone="primary" weight="500">
              {cancelLabel}
            </GText>
          </Press>
        ) : null}
      </View>
    </View>
  )
  if (placement === "bottom") {
    const pinned: ViewStyle = { position: "absolute", left: 12, right: 12, bottom: 12, zIndex: 40 }
    if (Platform.OS === "web") return <View style={[pinned, web({ position: "fixed" }), style]}>{field}</View>
    return <KeyboardStickyView style={[pinned, style]}>{field}</KeyboardStickyView>
  }
  return <View style={style}>{field}</View>
}

export { SearchField }
