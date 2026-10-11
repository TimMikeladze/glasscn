import * as React from "react"
import { View, type ViewProps } from "react-native"

import { Toggle } from "@/components/glass/native/toggle"

type Ctx = { values: string[]; toggle: (v: string) => void; variant?: "default" | "outline"; size?: "sm" | "default" | "lg"; spacing: number; disabled?: boolean }
const GroupContext = React.createContext<Ctx | null>(null)

type Single = { type: "single"; value?: string; defaultValue?: string; onValueChange?: (value: string) => void }
type Multiple = { type: "multiple"; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void }

/** Toggles in a row, `type="single"` or `"multiple"`. `spacing={0}` joins them. */
function ToggleGroup({ variant, size, spacing = 0, disabled, style, children, ...rest }: ViewProps & (Single | Multiple) & { variant?: "default" | "outline"; size?: "sm" | "default" | "lg"; spacing?: number; disabled?: boolean }) {
  const { type, value, defaultValue, onValueChange, ...props } = rest as ViewProps & (Single | Multiple)
  const toArr = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : v ? [v] : [])
  const [inner, setInner] = React.useState<string[]>(toArr(defaultValue))
  const values = value !== undefined ? toArr(value) : inner
  const toggle = (v: string) => {
    const next = type === "single" ? (values.includes(v) ? [] : [v]) : values.includes(v) ? values.filter((x) => x !== v) : [...values, v]
    setInner(next)
    if (type === "single") (onValueChange as Single["onValueChange"])?.(next[0] ?? "")
    else (onValueChange as Multiple["onValueChange"])?.(next)
  }
  return (
    <GroupContext.Provider value={{ values, toggle, variant, size, spacing, disabled }}>
      <View role="group" style={[{ flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: spacing * 4 }, style]} {...props}>
        {children}
      </View>
    </GroupContext.Provider>
  )
}

function ToggleGroupItem({ value, style, ...props }: Omit<React.ComponentProps<typeof Toggle>, "pressed" | "onPressedChange"> & { value: string }) {
  const g = React.useContext(GroupContext)
  if (!g) throw new Error("ToggleGroupItem must be inside <ToggleGroup>")
  return (
    <Toggle
      variant={g.variant}
      size={g.size}
      disabled={g.disabled}
      pressed={g.values.includes(value)}
      onPressedChange={() => g.toggle(value)}
      style={[g.spacing === 0 ? { borderRadius: 0 } : null, style]}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
