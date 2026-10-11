import * as React from "react"
import { Pressable, View } from "react-native"

import { GText, useUI, type GTextProps } from "@/components/glass/native/ui"

// htmlFor on native (NAT-43): controls register a focus function under their `id`;
// a Label with that `htmlFor` focuses it on press and names it (`aria-labelledby`).
const targets = new Map<string, () => void>()

/** The label's nativeID for a control `id` — what the control's `aria-labelledby` points at. */
export const labelIdFor = (id: string) => `${id}-label`

/** Register `focus` as the target of `<Label htmlFor={id}>` while mounted. */
export function useLabelTarget(id: string | undefined, focus: () => void) {
  const latest = React.useRef(focus)
  React.useEffect(() => {
    latest.current = focus
  })
  React.useEffect(() => {
    if (!id) return
    const run = () => latest.current()
    targets.set(id, run)
    return () => {
      if (targets.get(id) === run) targets.delete(id)
    }
  }, [id])
}

/**
 * A field's label. `htmlFor` names the control's `id`: pressing the label focuses it and the
 * control is labelled by it. Inside a Field, FieldLabel wires this for you. `disabled` dims it.
 */
function Label({ disabled, required, optional, htmlFor, style, children: label, ...props }: GTextProps & { disabled?: boolean; required?: boolean; optional?: boolean | string; htmlFor?: string }) {
  const ui = useUI()
  const nativeID = props.nativeID ?? (htmlFor ? labelIdFor(htmlFor) : undefined)
  const extras = [
    required ? (
      <GText key="required" size="sm" color={ui.destructive} aria-hidden>
        {" *"}
      </GText>
    ) : null,
    optional ? (
      <GText key="optional" size="sm" tone="muted">
        {` ${typeof optional === "string" ? optional : "(optional)"}`}
      </GText>
    ) : null,
  ].filter(Boolean)
  const text = (c: React.ReactNode, id?: string) => (
    <GText size="sm" weight="500" nativeID={id} style={[{ lineHeight: 16 }, disabled ? { opacity: 0.5 } : null, style]} {...props}>
      {c}
    </GText>
  )
  const kids = [...React.Children.toArray(label), ...extras]
  // Mixed content (an icon + words) sits in a row, like the web's flex gap-2.
  // all text (with the marks): one Text, so it wraps as a line
  const body = React.Children.toArray(label).every((c) => typeof c === "string" || typeof c === "number") ? (
    text(
      <>
        {label}
        {extras}
      </>,
      nativeID
    )
  ) : (
    <View nativeID={nativeID} style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, disabled ? { opacity: 0.5 } : null]}>
      {kids.map((c, i) => (typeof c === "string" || typeof c === "number" ? <React.Fragment key={i}>{text(c)}</React.Fragment> : c))}
    </View>
  )
  if (!htmlFor || disabled) return body
  // the label isn't a separate stop for VoiceOver: the control carries its name
  return (
    <Pressable accessible={false} onPress={() => targets.get(htmlFor)?.()} style={{ alignSelf: "flex-start", flexShrink: 1 }}>
      {body}
    </Pressable>
  )
}

export { Label }
