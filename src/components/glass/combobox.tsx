"use client"

import * as React from "react"
import { cn } from "cn"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/glass/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/glass/popover"

/**
 * A searchable select — shadcn's Popover + Command combobox as one component. Single
 * (`value: string`) or `multiple` (`value: string[]`, chosen items as removable chips in
 * the field, so it doubles as a token field). The field is an inline fill; the list
 * floats in the popover's liquid panel and grows out of the field.
 *
 *   <Combobox options={moods} value={mood} onValueChange={setMood} placeholder="Mood" />
 *   <Combobox multiple options={tags} value={tags} onValueChange={setTags} />
 */

type ComboboxOption = { value: string; label: string; keywords?: string[]; disabled?: boolean; icon?: React.ReactNode; group?: string }

type ComboboxBase = {
  options: ComboboxOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: React.ReactNode
  disabled?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  contentClassName?: string
  id?: string
  "aria-label"?: string
  "aria-invalid"?: boolean
}

type ComboboxSingle = ComboboxBase & { multiple?: false; value?: string; defaultValue?: string; onValueChange?: (value: string) => void }
type ComboboxMultiple = ComboboxBase & { multiple: true; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void }
type ComboboxProps = ComboboxSingle | ComboboxMultiple

const fieldClass =
  "glass-focus flex min-h-control w-full items-center gap-1.5 rounded-control bg-fill ps-pad-sm pe-2 py-1 text-start text-sm text-foreground transition-colors hover:bg-fill-strong aria-invalid:ring-(length:--glass-ring-width) aria-invalid:ring-destructive/40 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[state=open]:bg-fill-strong"

function Combobox(props: ComboboxProps) {
  const { options, placeholder = "Select…", searchPlaceholder = "Search…", emptyText = "Nothing found.", disabled, className, contentClassName, id } = props
  const [innerOpen, setInnerOpen] = React.useState(false)
  const open = props.open ?? innerOpen
  const setOpen = (o: boolean) => {
    if (props.open === undefined) setInnerOpen(o)
    props.onOpenChange?.(o)
  }
  const [innerValue, setInnerValue] = React.useState<string | string[]>(props.defaultValue ?? (props.multiple ? [] : ""))
  const value = props.value ?? innerValue
  const selected = Array.isArray(value) ? value : value ? [value] : []
  const byValue = React.useMemo(() => new Map(options.map((o) => [o.value, o])), [options])
  const listId = React.useId()

  const commit = (next: string | string[]) => {
    if (props.value === undefined) setInnerValue(next)
    ;(props.onValueChange as ((v: string | string[]) => void) | undefined)?.(next)
  }
  const choose = (v: string) => {
    if (props.multiple) commit(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v])
    else {
      commit(v === value ? "" : v)
      setOpen(false)
    }
  }

  const groups = React.useMemo(() => {
    const map = new Map<string | undefined, ComboboxOption[]>()
    for (const o of options) map.set(o.group, [...(map.get(o.group) ?? []), o])
    return [...map]
  }, [options])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {props.multiple ? (
          <div
            id={id}
            role="combobox"
            tabIndex={disabled ? -1 : 0}
            aria-expanded={open}
            aria-controls={listId}
            aria-haspopup="listbox"
            aria-label={props["aria-label"]}
            aria-invalid={props["aria-invalid"]}
            aria-disabled={disabled || undefined}
            data-slot="combobox-trigger"
            data-multiple=""
            className={cn(fieldClass, "cursor-default flex-wrap", className)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && selected.length) commit(selected.slice(0, -1))
              else if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                e.preventDefault()
                setOpen(true)
              }
            }}
          >
            {selected.length ? (
              selected.map((v) => (
                <span key={v} data-slot="combobox-chip" className="inline-flex h-control-xs max-w-48 items-center gap-1 rounded-badge bg-primary/16 ps-2 pe-0.5 text-xs font-medium text-primary-ink">
                  <span className="truncate">{byValue.get(v)?.label ?? v}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${byValue.get(v)?.label ?? v}`}
                    className="glass-focus inline-flex size-5 items-center justify-center rounded-badge hover:bg-primary/16"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation()
                      commit(selected.filter((s) => s !== v))
                    }}
                  >
                    <XIcon aria-hidden className="size-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-glass-label-tertiary">{placeholder}</span>
            )}
            <ChevronsUpDownIcon aria-hidden className="ms-auto size-4 shrink-0 text-muted-foreground" />
          </div>
        ) : (
          <button
            id={id}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-haspopup="listbox"
            aria-label={props["aria-label"]}
            aria-invalid={props["aria-invalid"]}
            data-slot="combobox-trigger"
            className={cn(fieldClass, "h-control", className)}
          >
            {selected[0] && byValue.get(selected[0])?.icon ? <span className="flex shrink-0 [&_svg]:size-4">{byValue.get(selected[0])?.icon}</span> : null}
            <span className={cn("min-w-0 flex-1 truncate", !selected.length && "text-glass-label-tertiary")}>{selected.length ? (byValue.get(selected[0])?.label ?? selected[0]) : placeholder}</span>
            <ChevronsUpDownIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        data-slot="combobox-content"
        align="start"
        className={cn("w-(--radix-popover-trigger-width) min-w-56 gap-0 p-0", contentClassName)}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} autoFocus />
          <CommandList id={listId} aria-multiselectable={props.multiple || undefined}>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {groups.map(([group, items]) => (
              <CommandGroup key={group ?? ""} heading={group}>
                {items.map((o) => {
                  const on = selected.includes(o.value)
                  return (
                    <CommandItem key={o.value} value={o.value} keywords={[o.label, ...(o.keywords ?? [])]} disabled={o.disabled} aria-checked={on} data-checked={on || undefined} onSelect={() => choose(o.value)}>
                      {o.icon}
                      <span className="min-w-0 flex-1 truncate">{o.label}</span>
                      <CheckIcon aria-hidden className={cn("text-primary!", !on && "invisible")} />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { Combobox }
export type { ComboboxOption, ComboboxProps }
