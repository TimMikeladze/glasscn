"use client"

import * as React from "react"
import { cn } from "cn"
import { ChevronDownIcon, RotateCcwIcon } from "lucide-react"

import { Button } from "@/components/glass/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/glass/dropdown-menu"
import { Input } from "@/components/glass/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/glass/popover"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/segmented-control"
import { Slider } from "@/components/glass/slider"
import { FONTS, parseOklch, sanitizeValue, type TokenDef } from "@/lib/glass-theme"

/** Every catalogue Google font, subset to the letters of its own name — a few KB, so the menu can show each font in itself. */
const FONT_SPECIMEN_URL = (() => {
  // the site loads Geist and Geist Mono in full; a subset face under the same name would mix glyphs
  const google = Object.values(FONTS).filter((f) => f.google && !["Geist", "Geist Mono"].includes(f.google.family))
  const families = google.map((f) => `family=${f.google!.family.replace(/ /g, "+")}`).join("&")
  const letters = [...new Set(google.map((f) => f.label).join(""))].join("")
  return `https://fonts.googleapis.com/css2?${families}&text=${encodeURIComponent(letters)}&display=swap`
})()

const decimals = (step: number) => (String(step).split(".")[1] ?? "").length
const fmt = (n: number, step: number) => String(Number(n.toFixed(decimals(step))))

/** One primitive, edited with the control its schema asks for. */
export function TokenControl({ def, value, changed, onChange, onReset }: { def: TokenDef; value: string; changed: boolean; onChange: (v: string) => void; onReset: () => void }) {
  return (
    <div className="grid gap-2" data-token={def.name}>
      <div className="flex items-center justify-between gap-2">
        <label className="flex min-w-0 items-center gap-1.5 text-sm font-medium" title={def.description}>
          <span className="truncate">{def.label}</span>
          {changed ? <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-label="changed" /> : null}
        </label>
        <div className="flex items-center gap-1">
          <code className="max-w-32 truncate font-mono text-[0.7rem] text-muted-foreground" title={`--${def.name}: ${value}`}>
            {def.control.type === "select" ? (def.control.options.find((o) => o.value === value)?.label ?? "custom") : value}
          </code>
          {changed ? (
            <Button variant="ghost" size="icon-xs" aria-label={`Reset ${def.label}`} onClick={onReset}>
              <RotateCcwIcon />
            </Button>
          ) : null}
        </div>
      </div>
      {def.control.type === "range" ? <RangeControl def={def} value={value} onChange={onChange} /> : null}
      {def.control.type === "colour" ? <ColourControl def={def} value={value} onChange={onChange} /> : null}
      {def.control.type === "select" ? <SelectControl def={def} value={value} onChange={onChange} /> : null}
    </div>
  )
}

function RangeControl({ def, value, onChange }: { def: TokenDef; value: string; onChange: (v: string) => void }) {
  if (def.control.type !== "range") return null
  const { min, max, step, unit } = def.control
  const n = parseFloat(value)
  return (
    <Slider
      value={[Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min]}
      min={min}
      max={max}
      step={step}
      aria-label={def.label}
      onValueChange={([v]) => onChange(`${fmt(v, step)}${unit}`)}
    />
  )
}

function ColourControl({ def, value, onChange }: { def: TokenDef; value: string; onChange: (v: string) => void }) {
  const parsed = parseOklch(value)
  // the raw field shows what you're typing while focused, the live value otherwise
  const [draft, setDraft] = React.useState<string | null>(null)
  const [l, c, h, a] = parsed ?? [0.7, 0.1, 0, 1]
  const set = (nl: number, nc: number, nh: number, na: number) => {
    const v = `oklch(${fmt(nl, 0.001)} ${fmt(nc, 0.001)} ${fmt(nh, 0.1)}${na < 1 ? ` / ${fmt(na * 100, 1)}%` : ""})`
    onChange(v)
  }
  const channel = (label: string, v: number, min: number, max: number, step: number, apply: (x: number) => void, track: string) => (
    <div className="grid gap-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono tabular-nums">{fmt(v, step)}</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: track }} aria-hidden />
      <Slider value={[v]} min={min} max={max} step={step} aria-label={`${def.label} ${label}`} onValueChange={([x]) => apply(x)} />
    </div>
  )
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="glass-subtle flex h-9 w-full items-center gap-2 rounded-control px-2 text-left text-xs [--glass-elevation:0_0_#0000] focus-visible:ring-(length:--glass-ring-width) focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label={`Edit ${def.label}`}
        >
          <span className="size-5 shrink-0 rounded-md border border-glass-border" style={{ background: value }} />
          <span className="truncate font-mono text-muted-foreground">{value}</span>
          <ChevronDownIcon className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        {parsed ? (
          <>
            {channel("Lightness", l, 0, 1, 0.005, (x) => set(x, c, h, a), "linear-gradient(to right, black, white)")}
            {channel("Chroma", c, 0, 0.37, 0.002, (x) => set(l, x, h, a), `linear-gradient(to right, oklch(${l} 0 ${h}), oklch(${l} 0.37 ${h}))`)}
            {channel("Hue", h, 0, 360, 1, (x) => set(l, c, x, a), `linear-gradient(to right, ${Array.from({ length: 13 }, (_, i) => `oklch(${Math.max(0.5, l)} ${Math.max(0.1, c)} ${i * 30})`).join(", ")})`)}
            {channel("Alpha", a, 0, 1, 0.01, (x) => set(l, c, h, x), `linear-gradient(to right, transparent, oklch(${l} ${c} ${h}))`)}
          </>
        ) : (
          <p className="text-xs text-muted-foreground">Not OKLCH — edit the raw value.</p>
        )}
        <Input
          value={draft ?? value}
          onChange={(e) => {
            setDraft(e.target.value)
            const ok = sanitizeValue(e.target.value)
            if (ok) onChange(ok)
          }}
          onBlur={() => setDraft(null)}
          aria-label={`${def.label} value`}
          className="h-9 font-mono text-xs"
        />
      </PopoverContent>
    </Popover>
  )
}

function SelectControl({ def, value, onChange }: { def: TokenDef; value: string; onChange: (v: string) => void }) {
  if (def.control.type !== "select") return null
  const { options } = def.control
  if (options.length <= 4)
    return (
      <SegmentedControl size="sm" value={value} onValueChange={onChange} className="w-full" aria-label={def.label}>
        {options.map((o) => (
          <SegmentedControlItem key={o.label} value={o.value} className="capitalize">
            {o.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" shape="rounded" className={cn("w-full justify-between capitalize")}>
          {options.find((o) => o.value === value)?.label ?? value}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-80 w-(--radix-dropdown-menu-trigger-width)">
        {def.group === "Fonts" ? <link rel="stylesheet" href={FONT_SPECIMEN_URL} precedence="glass-fonts" /> : null}
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.label} value={o.value} className={def.group === "Fonts" ? "text-[0.95rem]" : "capitalize"} style={def.group === "Fonts" && o.value ? { fontFamily: o.value } : undefined}>
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
