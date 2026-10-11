import * as React from "react"
import { TextInput, View, type ViewProps } from "react-native"

import { Button } from "@/components/glass/native/button"
import { useField, type InputProps } from "@/components/glass/native/input"
import { GText, useUI, type GTextProps } from "@/components/glass/native/ui"

/** One filled field holding a bare input and addons (icon, unit, clear, reveal, submit). The group owns the fill and ring. */
function InputGroup({ style, ...props }: ViewProps) {
  const ui = useUI()
  return (
    <View
      role="group"
      style={[{ flexDirection: "row", alignItems: "center", minHeight: ui.control.default, width: "100%", borderRadius: ui.radius.control, borderCurve: "continuous", backgroundColor: ui.fill }, style]}
      {...props}
    />
  )
}

/** Content beside the input: `inline-start` (default) or `inline-end`; block alignments stack above/below. */
function InputGroupAddon({ align = "inline-start", style, ...props }: ViewProps & { align?: "inline-start" | "inline-end" | "block-start" | "block-end" }) {
  const ui = useUI()
  const block = align.startsWith("block")
  return (
    <View
      style={[
        { flexDirection: "row", alignItems: "center", gap: 8, order: align === "inline-end" || align === "block-end" ? 1 : -1 } as object,
        block ? { width: "100%", paddingHorizontal: ui.pad.sm, paddingVertical: 8 } : align === "inline-start" ? { paddingLeft: ui.pad.sm } : { paddingRight: ui.pad.xs },
        style,
      ]}
      {...props}
    />
  )
}

function InputGroupButton({ variant = "ghost", size = "icon-sm", ...props }: React.ComponentProps<typeof Button>) {
  return <Button variant={variant} size={size} {...props} />
}

function InputGroupText(props: GTextProps) {
  return <GText size="sm" tone="muted" {...props} />
}

function InputGroupInput({ invalid, disabled, style, onFocus, onBlur, editable, ...props }: InputProps) {
  const f = useField({ invalid, disabled, onFocus, onBlur, editable })
  return <TextInput {...f.props} style={[f.style, { flex: 1, width: undefined, height: f.ui.control.default, backgroundColor: "transparent", borderWidth: 0 }, style]} {...props} />
}

function InputGroupTextarea({ invalid, disabled, style, onFocus, onBlur, editable, ...props }: InputProps) {
  const f = useField({ invalid, disabled, onFocus, onBlur, editable })
  return <TextInput multiline textAlignVertical="top" {...f.props} style={[f.style, { flex: 1, width: undefined, minHeight: 96, paddingVertical: 12, backgroundColor: "transparent", borderWidth: 0 }, style]} {...props} />
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea }
