import * as React from "react"
import { Platform, ScrollView, StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { KeyboardStickyView } from "react-native-keyboard-controller"
import { SearchIcon, XIcon } from "lucide-react-native"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { Glass } from "@/components/glass/native/glass"
import { Press, haptics } from "@/components/glass/native/press"
import { GIcon, GText, useGlassForeground, useUI, web } from "@/components/glass/native/ui"

export type SearchToken = { id: string; label: string }

type Suggestion = string | { value: string; label: React.ReactNode }
const suggestionValue = (s: Suggestion) => (typeof s === "string" ? s : s.value)
const suggestionLabel = (s: Suggestion) => (typeof s === "string" ? s : s.label)

export type SearchFieldProps = Omit<TextInputProps, "value" | "defaultValue" | "onChangeText" | "style"> & {
  tokens?: readonly SearchToken[]
  onTokenRemove?: (id: string) => void
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onSubmit?: (value: string) => void
  /** Start as a round search button; it morphs open on press and folds back when left empty. */
  minimized?: boolean
  /** Diameter of the minimized button; a Dock matches it to its bar. Defaults to the large control height. */
  collapsedSize?: number
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

function SearchInput({ style, placeholderTextColor, ...props }: React.ComponentPropsWithRef<typeof TextInput>) {
  const ui = useUI()
  const foreground = useGlassForeground(StyleSheet.flatten(style)?.color ?? ui.foreground)
  const placeholder = useGlassForeground(placeholderTextColor ?? ui.mutedForeground)
  return <TextInput {...props} placeholderTextColor={placeholder} style={[style, { color: foreground }]} />
}

/** A capsule search field on Liquid Glass: Clear, Cancel, a minimized button that morphs open, suggestions, keyboard-riding bottom placement. */
function SearchField({
  value,
  defaultValue = "",
  onValueChange,
  tokens = [],
  onTokenRemove,
  onSubmit,
  minimized = false,
  collapsedSize,
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
  onKeyPress,
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
  const list =
    focused && suggestions.length ? (
      <Glass key="suggestions" variant="liquid" role="list" radius={ui.radius.surface} style={{ padding: 6 }}>
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
    ) : null
  const bar = (
    <View key="field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Animated.View layout={morph} style={{ flex: 1 }}>
        <Glass variant="liquid" interactive radius={ui.radius.button} style={{ minHeight: ui.control.lg, flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6, paddingLeft: 14, paddingRight: 6 }}>
          <GIcon><SearchIcon size={18} color={ui.mutedForeground} /></GIcon>
          {tokens.length ? <ScrollView horizontal accessibilityLabel="Search filters" showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, flexShrink: 1, maxWidth: "50%" }} contentContainerStyle={{ alignItems: "center", gap: 4 }}>
            {tokens.map(token => <View key={token.id} style={{ flexDirection: "row", alignItems: "center", gap: 4, borderRadius: ui.radius.badge, backgroundColor: ui.fill, paddingLeft: 8 }}><GText size="sm" dynamicTypeRamp="subheadline">{token.label}</GText>{onTokenRemove ? <Press accessibilityRole="button" accessibilityLabel={`Remove ${token.label} filter`} onPress={() => { onTokenRemove(token.id); input.current?.focus() }} hitSlop={8} style={{ minWidth: ui.control.xs, minHeight: ui.control.xs, alignItems: "center", justifyContent: "center", borderRadius: ui.radius.button }}><GIcon><XIcon size={14} color={ui.mutedForeground} /></GIcon></Press> : null}</View>)}
          </ScrollView> : null}
          <SearchInput
            ref={input}
            value={text}
            onChangeText={setText}
            onKeyPress={event => {
              onKeyPress?.(event)
              if (!event.isDefaultPrevented() && event.nativeEvent.key === "Backspace" && !text && tokens.length) onTokenRemove?.(tokens[tokens.length - 1].id)
            }}
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
            style={[{ flex: 1, minHeight: ui.control.lg - 12, paddingVertical: 0, fontSize: ui.text.base, color: ui.foreground }, web({ outlineStyle: "none" })]}
            {...props}
          />
          {text ? (
            <Press accessibilityRole="button" accessibilityLabel="Clear" hitSlop={8} onPress={() => setText("")} style={{ width: ui.control.xs, height: ui.control.xs, borderRadius: ui.radius.button, alignItems: "center", justifyContent: "center", backgroundColor: ui.fill }}>
              <GIcon><XIcon size={14} color={ui.mutedForeground} /></GIcon>
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
  )
  const field = !open ? (
    <Press haptic liquid accessibilityRole="search" accessibilityLabel={placeholder} accessibilityHint="Opens the search field" onPress={() => (setOpen(true), setTimeout(() => input.current?.focus(), 0))}>
      <Animated.View layout={morph}>
        <Glass variant="liquid" interactive radius={ui.radius.button} style={{ width: collapsedSize ?? ui.control.lg, height: collapsedSize ?? ui.control.lg, alignItems: "center", justifyContent: "center" }}>
          <GIcon><SearchIcon size={22} color={ui.foreground} /></GIcon>
        </Glass>
      </Animated.View>
    </Press>
  ) : (
    // Yoga has no CSS `order`: the list sits under an inline field and over a bottom one by its
    // place in this keyed array, so the field never moves or remounts while suggestions change
    <View style={{ gap: 8 }}>{placement === "bottom" ? [list, bar] : [bar, list]}</View>
  )
  if (placement === "bottom") {
    const pinned: ViewStyle = { position: "absolute", left: 12, right: 12, bottom: 12, zIndex: 40 }
    if (Platform.OS === "web") return <View style={[pinned, web({ position: "fixed" }), style]}>{field}</View>
    return <KeyboardStickyView style={[pinned, style]}>{field}</KeyboardStickyView>
  }
  return <View style={style}>{field}</View>
}

export { SearchField }
