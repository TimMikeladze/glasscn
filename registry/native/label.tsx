import * as React from "react"
import { View } from "react-native"

import { GText, useUI, type GTextProps } from "@/components/glass/native/ui"

/**
 * A field's label. Give it a `nativeID` and point the field's
 * `aria-labelledby` at it; `onPress` can focus the field. `disabled` dims it.
 */
function Label({ disabled, required, optional, style, children: label, ...props }: GTextProps & { disabled?: boolean; required?: boolean; optional?: boolean | string }) {
  const ui = useUI()
  const children = (
    <>
      {label}
      {required ? <GText size="sm" color={ui.destructive} aria-hidden>{" *"}</GText> : null}
      {optional ? <GText size="sm" tone="muted">{` ${typeof optional === "string" ? optional : "(optional)"}`}</GText> : null}
    </>
  )
  const text = (c: React.ReactNode) => (
    <GText size="sm" weight="500" style={[{ lineHeight: 16 }, disabled ? { opacity: 0.5 } : null, style]} {...props}>
      {c}
    </GText>
  )
  const kids = React.Children.toArray(required || optional ? children : label)
  // Mixed content (an icon + words) sits in a row, like the web's flex gap-2.
  if (kids.every((c) => typeof c === "string" || typeof c === "number")) return text(label)
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, disabled ? { opacity: 0.5 } : null]}>
      {kids.map((c, i) => (typeof c === "string" || typeof c === "number" ? <React.Fragment key={i}>{text(c)}</React.Fragment> : c))}
    </View>
  )
}

export { Label }
