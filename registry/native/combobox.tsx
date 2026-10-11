import * as React from "react"
import { View } from "react-native"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react-native"

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/glass/native/command"
import { Floating, useAnchorRect } from "@/components/glass/native/popover"
import { Press } from "@/components/glass/native/press"
import { GText, alpha, useUI, web } from "@/components/glass/native/ui"

/**
 * A searchable select: a fill field that opens a glass panel with a search capsule.
 * Single (`value: string`) or `multiple` (`value: string[]`, chosen items as removable chips).
 */

type ComboboxOption = { value: string; label: string; keywords?: string[]; disabled?: boolean; group?: string }

type ComboboxBase = {
  options: ComboboxOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  "aria-label"?: string
}
type ComboboxProps =
  | (ComboboxBase & { multiple?: false; value?: string; defaultValue?: string; onValueChange?: (value: string) => void })
  | (ComboboxBase & { multiple: true; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void })

function Combobox(props: ComboboxProps) {
  const { options, placeholder = "Select…", searchPlaceholder = "Search…", emptyText = "Nothing found.", disabled } = props
  const ui = useUI()
  const [open, setOpen] = React.useState(false)
  const [inner, setInner] = React.useState<string | string[]>(props.defaultValue ?? (props.multiple ? [] : ""))
  const value = props.value ?? inner
  const selected = Array.isArray(value) ? value : value ? [value] : []
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v
  const triggerRef = React.useRef<View>(null)
  const target = React.useCallback(() => triggerRef.current, [])
  const rect = useAnchorRect(open, target)

  const commit = (next: string | string[]) => {
    if (props.value === undefined) setInner(next)
    ;(props.onValueChange as ((v: string | string[]) => void) | undefined)?.(next)
  }
  const choose = (v: string) => {
    if (props.multiple) commit(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v])
    else {
      commit(v === value ? "" : v)
      setOpen(false)
    }
  }
  const groups = [...new Set(options.map((o) => o.group))]

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <Press
          role="combobox"
          aria-expanded={open}
          aria-label={props["aria-label"]}
          aria-disabled={!!disabled}
          disabled={disabled}
          squash={0.99}
          onPress={() => setOpen(!open)}
          style={[
            { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, minHeight: ui.control.default, borderRadius: ui.radius.control, backgroundColor: open ? ui.fillStrong : ui.fill, paddingLeft: ui.pad.sm, paddingRight: 8, paddingVertical: 4, opacity: disabled ? 0.5 : 1 },
            web({ cursor: "pointer" }),
          ]}
        >
          {selected.length && props.multiple ? (
            selected.map((v) => (
              <View key={v} style={{ flexDirection: "row", alignItems: "center", gap: 2, height: ui.control.xs, borderRadius: ui.radius.badge, backgroundColor: alpha(ui.primary, 0.16), paddingLeft: 8, paddingRight: 2 }}>
                <GText size="xs" weight="500" color={ui.primary}>
                  {labelOf(v)}
                </GText>
                <Press accessibilityRole="button" accessibilityLabel={`Remove ${labelOf(v)}`} onPress={() => commit(selected.filter((s) => s !== v))} style={{ padding: 4 }}>
                  <XIcon size={12} color={ui.primary} />
                </Press>
              </View>
            ))
          ) : (
            <GText size="sm" tone={selected.length ? "default" : "muted"} numberOfLines={1} style={{ flex: 1 }}>
              {selected.length ? labelOf(selected[0]) : placeholder}
            </GText>
          )}
          <ChevronsUpDownIcon size={16} color={ui.mutedForeground} style={{ marginLeft: "auto" }} />
        </Press>
      </View>
      <Floating open={open} anchor={rect} onClose={() => setOpen(false)} align="start" sideOffset={6} style={{ width: Math.max(224, rect?.width ?? 0), overflow: "hidden" }}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList aria-multiselectable={props.multiple || undefined}>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {groups.map((g) => (
              <CommandGroup key={g ?? ""} heading={g}>
                {options
                  .filter((o) => o.group === g)
                  .map((o) => {
                    const on = selected.includes(o.value)
                    return (
                      <CommandItem key={o.value} value={o.value} keywords={[o.label, ...(o.keywords ?? [])]} disabled={o.disabled} aria-checked={on} onSelect={() => choose(o.value)}>
                        <GText size="sm" style={{ flex: 1 }}>
                          {o.label}
                        </GText>
                        <CheckIcon size={16} color={on ? ui.primary : "transparent"} />
                      </CommandItem>
                    )
                  })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </Floating>
    </>
  )
}

export { Combobox }
export type { ComboboxOption, ComboboxProps }
