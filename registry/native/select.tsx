import * as React from "react"
import { View, type ViewProps } from "react-native"
import { ChevronDownIcon, ChevronsUpDownIcon } from "lucide-react-native"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/glass/native/dropdown-menu"
import { GText, useUI, type GTextProps } from "@/components/glass/native/ui"

type Ctx = { value?: string; setValue: (v: string) => void; labels: React.RefObject<Map<string, React.ReactNode>>; disabled?: boolean }
const SelectContext = React.createContext<Ctx | null>(null)
function useSelect() {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error("Select parts must be inside <Select>")
  return ctx
}

/** shadcn's Select: a field trigger opening the glass menu, the chosen row checked. */
function Select({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  children,
}: { value?: string; defaultValue?: string; onValueChange?: (value: string) => void; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; disabled?: boolean; children?: React.ReactNode }) {
  const [inner, setInner] = React.useState(defaultValue)
  const labels = React.useRef(new Map<string, React.ReactNode>())
  const current = value ?? inner
  const ctx = React.useMemo(
    () => ({
      value: current,
      disabled,
      labels,
      setValue: (v: string) => {
        setInner(v)
        onValueChange?.(v)
      },
    }),
    [current, disabled, onValueChange]
  )
  return (
    <SelectContext.Provider value={ctx}>
      <DropdownMenu open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        {children}
      </DropdownMenu>
    </SelectContext.Provider>
  )
}

/** The field (or `variant="pill"`, Apple's pop-up button) showing the current choice. */
function SelectTrigger({ size = "default", variant = "default", style, children, accessibilityLabel }: { size?: "sm" | "default" | "lg"; variant?: "default" | "pill"; style?: ViewProps["style"]; children?: React.ReactNode; accessibilityLabel?: string }) {
  const ui = useUI()
  const { disabled } = useSelect()
  const pill = variant === "pill"
  const Icon = pill ? ChevronsUpDownIcon : ChevronDownIcon
  return (
    <DropdownMenuTrigger
      disabled={disabled}
      accessibilityRole="combobox"
      accessibilityLabel={accessibilityLabel}
      style={[
        { height: ui.control[size], flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingHorizontal: pill ? 12 : ui.pad.sm, borderRadius: pill ? ui.radius.button : ui.radius.control, backgroundColor: ui.fill, opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {children}
        <Icon size={pill ? 14 : 16} color={ui.mutedForeground} />
      </View>
    </DropdownMenuTrigger>
  )
}

/** The chosen item's label, or `placeholder`. */
function SelectValue({ placeholder, ...props }: GTextProps & { placeholder?: string }) {
  const { value, labels } = useSelect()
  const label = value !== undefined ? (labels.current?.get(value) ?? value) : undefined
  return (
    <GText size="sm" tone={label === undefined ? "subtle" : "default"} numberOfLines={1} {...props}>
      {label ?? placeholder}
    </GText>
  )
}

function SelectContent({ children, ...props }: React.ComponentProps<typeof DropdownMenuContent>) {
  const { value, setValue } = useSelect()
  return (
    <DropdownMenuContent {...props}>
      <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
        {children}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  )
}

function SelectItem({ value, children, disabled }: { value: string; children?: React.ReactNode; disabled?: boolean }) {
  const { labels } = useSelect()
  labels.current?.set(value, children)
  return (
    <DropdownMenuRadioItem value={value} disabled={disabled}>
      {children}
    </DropdownMenuRadioItem>
  )
}

const SelectGroup = DropdownMenuGroup
const SelectLabel = DropdownMenuLabel
const SelectSeparator = DropdownMenuSeparator
/** The native menu scrolls itself; kept for API parity. */
const SelectScrollUpButton = () => null
const SelectScrollDownButton = () => null

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue }
