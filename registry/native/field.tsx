import * as React from "react"
import { View, type ViewProps } from "react-native"

import { announce } from "@/components/glass/native/a11y"
import { Label } from "@/components/glass/native/label"
import { Separator } from "@/components/glass/native/separator"
import { GText, useUI, type GTextProps } from "@/components/glass/native/ui"

/**
 * shadcn's Field: label, control, description and error laid out together.
 * Native wiring is automatic for glasscn controls (Input, Textarea, InputGroupInput): inside a
 * Field they take the field's `id` (so FieldLabel focuses and names them), `invalid` from the
 * Field or a FieldError, and the description and error as their accessibility hint (NAT-43).
 * Other controls read `useFieldIds()`.
 */
type Ids = {
  /** The control's id — FieldLabel's `htmlFor`. */
  control: string
  label: string
  description: string
  error: string
  invalid: boolean
  /** Description and error text, for the control's accessibilityHint. */
  hint?: string
  setText: (part: "description" | "error", text: string | undefined) => void
}
const FieldContext = React.createContext<Ids | null>(null)
export const useFieldIds = () => React.useContext(FieldContext)

const plain = (n: React.ReactNode): string | undefined => {
  const parts = React.Children.toArray(n).filter((c) => typeof c === "string" || typeof c === "number")
  return parts.length ? parts.join("") : undefined
}

function FieldSet({ style, ...props }: ViewProps) {
  return <View role="group" style={[{ gap: 24 }, style]} {...props} />
}

function FieldLegend({ variant = "legend", ...props }: GTextProps & { variant?: "legend" | "label" }) {
  return <GText font="heading" size={variant === "legend" ? "base" : "sm"} style={{ marginBottom: 12 }} {...props} />
}

function FieldGroup({ style, ...props }: ViewProps) {
  return <View style={[{ gap: 24, width: "100%" }, style]} {...props} />
}

function Field({ orientation = "vertical", invalid, style, ...props }: ViewProps & { orientation?: "vertical" | "horizontal" | "responsive"; invalid?: boolean }) {
  const base = React.useId().replace(/:/g, "")
  const [text, setTexts] = React.useState<{ description?: string; error?: string }>({})
  const setText = React.useCallback((part: "description" | "error", t: string | undefined) => setTexts((p) => (p[part] === t ? p : { ...p, [part]: t })), [])
  const ids = React.useMemo(
    () => ({
      control: `${base}-control`,
      label: `${base}-control-label`,
      description: `${base}-description`,
      error: `${base}-error`,
      invalid: !!invalid || !!text.error,
      hint: [text.error, text.description].filter(Boolean).join(". ") || undefined,
      setText,
    }),
    [base, invalid, text, setText]
  )
  const row = orientation === "horizontal"
  return (
    <FieldContext.Provider value={ids}>
      <View role="group" data-invalid={invalid} style={[{ gap: 8, width: "100%" }, row ? { flexDirection: "row", alignItems: "center", justifyContent: "space-between" } : null, style]} {...props} />
    </FieldContext.Provider>
  )
}

function FieldContent({ style, ...props }: ViewProps) {
  return <View style={[{ flex: 1, gap: 4 }, style]} {...props} />
}

function FieldLabel(props: React.ComponentProps<typeof Label>) {
  const ids = useFieldIds()
  return <Label htmlFor={ids?.control} {...props} />
}

function FieldTitle(props: GTextProps) {
  return <GText size="sm" weight="500" {...props} />
}

function FieldDescription(props: GTextProps) {
  const ids = useFieldIds()
  const text = plain(props.children)
  const setText = ids?.setText
  React.useEffect(() => {
    setText?.("description", text)
    return () => setText?.("description", undefined)
  }, [setText, text])
  return <GText nativeID={ids?.description} size="sm" tone="muted" {...props} />
}

function FieldSeparator({ children }: { children?: React.ReactNode }) {
  const ui = useUI()
  if (!children) return <Separator />
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Separator style={{ flex: 1, width: undefined }} />
      <GText size="sm" color={ui.mutedForeground}>
        {children}
      </GText>
      <Separator style={{ flex: 1, width: undefined }} />
    </View>
  )
}

/** The error under a field: `errors` (react-hook-form / zod) or children; nothing when empty. */
function FieldError({ errors, children, ...props }: GTextProps & { errors?: Array<{ message?: string } | undefined> }) {
  const ids = useFieldIds()
  const messages = [...new Set((errors ?? []).map((e) => e?.message).filter(Boolean))] as string[]
  const content = children ?? (messages.length ? messages.join("\n") : null)
  const text = plain(content)
  const setText = ids?.setText
  React.useEffect(() => {
    setText?.("error", text)
    // VoiceOver/TalkBack hear a new error once, as it appears
    if (text) announce(text)
    return () => setText?.("error", undefined)
  }, [setText, text])
  if (!content) return null
  return (
    <GText nativeID={ids?.error} role="alert" aria-live="polite" size="sm" tone="destructive" {...props}>
      {content}
    </GText>
  )
}

export { Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldLegend, FieldSeparator, FieldSet, FieldContent, FieldTitle }
