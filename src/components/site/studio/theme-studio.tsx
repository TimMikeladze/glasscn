"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { cn } from "cn"
import { DicesIcon, DownloadIcon, MoonIcon, RotateCcwIcon, SunIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/glass/badge"
import { Button } from "@/components/glass/button"
import { Glass } from "@/components/glass/glass"
import { Label } from "@/components/glass/label"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/segmented-control"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/glass/dialog"
import { Slider } from "@/components/glass/slider"
import { Switch } from "@/components/glass/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/glass/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/glass/tooltip"
import { applySiteTheme, hasSiteTheme } from "@/components/site/providers"
import {
  DENSITIES,
  GROUPS,
  MATERIALS,
  MOTIONS,
  PALETTES,
  SHAPES,
  TOKENS,
  TYPE_PRESETS,
  createGlassTheme,
  decodeTheme,
  encodeTheme,
  legibility,
  randomTheme,
  themeDiff,
  themeToCss,
  type CreateThemeOptions,
  type Harmony,
  type Scheme,
  type TokenGroup,
  type Tokens,
} from "@/lib/glass-theme"
import { ExportPanel } from "./export-panel"
import { StudioPreview } from "./studio-preview"
import { TokenControl } from "./token-control"

interface Recipe {
  palette: string // a palette key, or "custom"
  hue: number
  harmony: Harmony
  chroma: number
  material: string
  shape: string
  motion: string
  density: number
  type: string
}
const START: Recipe = { palette: "dusk", hue: 35, harmony: "analogous", chroma: 0.17, material: "frosted", shape: "round", motion: "spring", density: 1, type: "default" }
const EMPTY = { light: {} as Tokens, dark: {} as Tokens }

/** Which token groups each preset owns — choosing a preset clears your edits there. */
const OWNS: Record<string, (t: string) => boolean> = {
  palette: (t) => group(t) === "Colour",
  material: (t) => ["Material", "Rim", "Depth"].includes(group(t)),
  shape: (t) => group(t) === "Shape",
  motion: (t) => group(t) === "Motion" || t === "aurora-speed",
  density: (t) => group(t) === "Density",
  type: (t) => group(t) === "Type" || group(t) === "Fonts",
}
const GROUP_OF = Object.fromEntries(TOKENS.map((t) => [t.name, t.group]))
const group = (t: string) => GROUP_OF[t] as TokenGroup

const toOptions = (r: Recipe, o: typeof EMPTY): CreateThemeOptions => ({
  palette: r.palette === "custom" ? { hue: r.hue, harmony: r.harmony, chroma: r.chroma } : r.palette,
  material: r.material,
  shape: r.shape,
  motion: r.motion,
  density: r.density,
  ...(r.type !== "default" ? { type: r.type } : {}),
  ...(Object.keys(o.light).length ? { light: o.light } : {}),
  ...(Object.keys(o.dark).length ? { dark: o.dark } : {}),
})

function Chips({ value, options, onChange, label }: { value: string; options: Record<string, { title: string; description: string }>; onChange: (v: string) => void; label: string }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(options).map(([k, o]) => (
          <Tooltip key={k}>
            <TooltipTrigger asChild>
              <Button size="xs" variant={value === k ? "default" : "secondary"} onClick={() => onChange(k)} aria-pressed={value === k}>
                {o.title}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-56">{o.description}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}

const noop = () => () => {}

/**
 * The studio reads the share code (#t=…) and the "applied to site" flag once, on the
 * client — so it renders only after mount, and never remounts from its own hash updates.
 */
export function ThemeStudio() {
  const mounted = React.useSyncExternalStore(noop, () => true, () => false)
  if (!mounted) return <div className="mx-auto h-[70vh] max-w-[1400px]" aria-busy />
  return <Studio initialCode={new URLSearchParams(window.location.hash.slice(1)).get("t") ?? ""} initialApplied={hasSiteTheme()} />
}

function seed(code: string) {
  const loaded = code ? decodeTheme(code) : null
  if (!loaded) return EMPTY
  const diff = themeDiff(loaded, createGlassTheme(toOptions(START, EMPTY)))
  return { light: diff.l, dark: diff.d }
}

function Studio({ initialCode, initialApplied }: { initialCode: string; initialApplied: boolean }) {
  const { resolvedTheme } = useTheme()
  const [recipe, setRecipe] = React.useState<Recipe>(START)
  const [overrides, setOverrides] = React.useState(() => seed(initialCode))
  const [editing, setEditing] = React.useState<"both" | Scheme>("both")
  const [preview, setPreview] = React.useState<Scheme | null>(null)
  const [applied, setApplied] = React.useState(initialApplied)
  const scheme: Scheme = preview ?? (resolvedTheme === "dark" ? "dark" : "light")

  const options = toOptions(recipe, overrides)
  const theme = createGlassTheme(options)
  const base = createGlassTheme(toOptions(recipe, EMPTY))

  // keep the link and (when on) the whole site in step
  React.useEffect(() => {
    const t = setTimeout(() => {
      history.replaceState(null, "", `#t=${encodeTheme(theme)}`)
      if (applied) applySiteTheme(themeToCss(theme, { selector: ":root[data-glass-custom]", darkSelector: ":root.dark[data-glass-custom]", fontImport: true }))
    }, 120)
    return () => clearTimeout(t)
  })

  const choose = (key: keyof Recipe, value: string | number, owns?: (t: string) => boolean) => {
    setRecipe((r) => ({ ...r, [key]: value }))
    if (owns) setOverrides((o) => ({ light: Object.fromEntries(Object.entries(o.light).filter(([k]) => !owns(k))), dark: Object.fromEntries(Object.entries(o.dark).filter(([k]) => !owns(k))) }))
  }
  const setToken = (name: string, value: string) =>
    setOverrides((o) => ({
      light: editing === "dark" ? o.light : { ...o.light, [name]: value },
      dark: editing === "light" ? o.dark : { ...o.dark, [name]: value },
    }))
  const resetToken = (name: string) =>
    setOverrides((o) => {
      const strip = (t: Tokens) => Object.fromEntries(Object.entries(t).filter(([k]) => k !== name))
      return { light: editing === "dark" ? o.light : strip(o.light), dark: editing === "light" ? o.dark : strip(o.dark) }
    })
  const randomise = () => {
    const r = randomTheme()
    setRecipe(START)
    const diff = themeDiff(r, createGlassTheme(toOptions(START, EMPTY)))
    setOverrides({ light: diff.l, dark: diff.d })
  }
  const reset = () => {
    setRecipe(START)
    setOverrides(EMPTY)
  }
  const toggleSite = (on: boolean) => {
    setApplied(on)
    applySiteTheme(on ? themeToCss(theme, { selector: ":root[data-glass-custom]", darkSelector: ":root.dark[data-glass-custom]", fontImport: true }) : null)
    toast(on ? "Applied to the whole site" : "Site back to its palette")
  }

  const shown: Scheme = editing === "both" ? scheme : editing
  const legible = legibility(theme, scheme)
  const changedCount = new Set([...Object.keys(overrides.light), ...Object.keys(overrides.dark)]).size

  return (
    <div className="mx-auto grid max-w-[1400px] gap-5 px-4 pt-8 pb-12 sm:px-6 lg:grid-cols-[400px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:h-[calc(100dvh-7.5rem)]">
        <Glass className="flex h-full flex-col overflow-hidden">
          <div className="flex items-center gap-2 border-b border-glass-border p-4">
            <div className="min-w-0 flex-1">
              <h1 className="type-glass-heading text-xl">Theme Studio</h1>
              <p className="text-xs text-muted-foreground">
                {TOKENS.length} primitives · {changedCount} edited{initialCode ? " · loaded from a link" : ""}
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Randomise" onClick={randomise}>
                  <DicesIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Randomise</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Reset everything" onClick={reset}>
                  <RotateCcwIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset</TooltipContent>
            </Tooltip>
          </div>
          <div className="grid flex-1 content-start gap-5 overflow-y-auto p-4">
            <div className="grid gap-2">
              <Label>Palette</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {Object.entries(PALETTES).map(([k, p]) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={recipe.palette === k}
                    onClick={() => choose("palette", k, OWNS.palette)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-control p-1.5 text-[0.7rem] text-muted-foreground transition-colors outline-none hover:bg-fill focus-visible:ring-(length:--glass-ring-width) focus-visible:ring-ring/50",
                      recipe.palette === k && "bg-fill-strong text-foreground"
                    )}
                  >
                    <span
                      className="size-7 rounded-full border border-glass-border"
                      style={{ background: `conic-gradient(${p.theme[scheme]["aurora-1"]}, ${p.theme[scheme]["aurora-2"]}, ${p.theme[scheme].primary}, ${p.theme[scheme]["aurora-3"]}, ${p.theme[scheme]["aurora-1"]})` }}
                    />
                    {p.title}
                  </button>
                ))}
              </div>
              <Button size="sm" variant={recipe.palette === "custom" ? "default" : "secondary"} onClick={() => choose("palette", "custom", OWNS.palette)}>
                Generate from a hue
              </Button>
              {recipe.palette === "custom" ? (
                <div className="glass-subtle grid gap-3 rounded-control p-3 [--glass-elevation:0_0_#0000]">
                  <div className="grid gap-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Hue</span>
                      <span className="font-mono">{recipe.hue}°</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: `linear-gradient(to right, ${Array.from({ length: 13 }, (_, i) => `oklch(0.7 0.16 ${i * 30})`).join(",")})` }} aria-hidden />
                    <Slider value={[recipe.hue]} min={0} max={360} step={1} aria-label="Hue" onValueChange={([v]) => choose("hue", v)} />
                  </div>
                  <div className="grid gap-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Chroma</span>
                      <span className="font-mono">{recipe.chroma.toFixed(2)}</span>
                    </div>
                    <Slider value={[recipe.chroma]} min={0.02} max={0.26} step={0.005} aria-label="Chroma" onValueChange={([v]) => choose("chroma", v)} />
                  </div>
                  <SegmentedControl size="sm" value={recipe.harmony} onValueChange={(v) => choose("harmony", v)} className="w-full" aria-label="Harmony">
                    {(["analogous", "complementary", "triadic", "split", "monochrome"] as const).map((h) => (
                      <SegmentedControlItem key={h} value={h} className="px-1 text-[0.65rem] capitalize">
                        {h === "complementary" ? "compl." : h === "monochrome" ? "mono" : h}
                      </SegmentedControlItem>
                    ))}
                  </SegmentedControl>
                </div>
              ) : null}
            </div>
            <Chips label="Material" value={recipe.material} options={MATERIALS} onChange={(v) => choose("material", v, OWNS.material)} />
            <Chips label="Shape" value={recipe.shape} options={SHAPES} onChange={(v) => choose("shape", v, OWNS.shape)} />
            <Chips label="Motion" value={recipe.motion} options={MOTIONS} onChange={(v) => choose("motion", v, OWNS.motion)} />
            <Chips label="Type" value={recipe.type} options={TYPE_PRESETS} onChange={(v) => choose("type", v, OWNS.type)} />
            <div className="grid gap-2">
              <Label>Density</Label>
              <SegmentedControl size="sm" value={String(recipe.density)} onValueChange={(v) => choose("density", Number(v), OWNS.density)} className="w-full" aria-label="Density">
                {Object.entries(DENSITIES).map(([k, v]) => (
                  <SegmentedControlItem key={k} value={String(v)} className="capitalize">
                    {k}
                  </SegmentedControlItem>
                ))}
              </SegmentedControl>
            </div>

            <div className="grid gap-3 border-t border-glass-border pt-4">
              <div className="flex items-center justify-between gap-2">
                <Label>Fine-tune</Label>
                <SegmentedControl size="sm" value={editing} onValueChange={(v) => setEditing(v as typeof editing)} aria-label="Editing scheme">
                  <SegmentedControlItem value="both">Both</SegmentedControlItem>
                  <SegmentedControlItem value="light">Light</SegmentedControlItem>
                  <SegmentedControlItem value="dark">Dark</SegmentedControlItem>
                </SegmentedControl>
              </div>
              <Tabs defaultValue="Material">
                <TabsList variant="plain" className="flex w-full flex-wrap justify-start gap-0.5">
                  {GROUPS.map((g) => (
                    <TabsTrigger key={g} value={g} className="h-7 flex-none px-2.5 text-xs">
                      {g}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {GROUPS.map((g) => (
                  <TabsContent key={g} value={g} className="grid gap-4 pt-2">
                    {TOKENS.filter((t) => t.group === g).map((t) => (
                      <TokenControl
                        key={`${t.name}-${shown}`}
                        def={t}
                        value={theme[shown][t.name]}
                        changed={theme[shown][t.name] !== base[shown][t.name]}
                        onChange={(v) => setToken(t.name, v)}
                        onReset={() => resetToken(t.name)}
                      />
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </Glass>
      </aside>

      <section className="grid content-start gap-4">
        <Glass intensity="subtle" elevation="flat" className="flex flex-wrap items-center gap-3 rounded-button p-2 pl-4">
          <SegmentedControl size="sm" value={scheme} onValueChange={(v) => setPreview(v as Scheme)} aria-label="Preview scheme">
            <SegmentedControlItem value="light" aria-label="Light preview">
              <SunIcon /> Light
            </SegmentedControlItem>
            <SegmentedControlItem value="dark" aria-label="Dark preview">
              <MoonIcon /> Dark
            </SegmentedControlItem>
          </SegmentedControl>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant={legible.level === "low" ? "destructive" : "tinted"} className="cursor-help">
                Text {legible.level} · {legible.ratio}:1
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-64">Worst-case contrast of body text on a default pane over the ground and each aurora blob — an estimate, not a WCAG audit.</TooltipContent>
          </Tooltip>
          <label className="ml-auto flex items-center gap-2 text-sm">
            Apply to site
            <Switch size="sm" checked={applied} onCheckedChange={toggleSite} aria-label="Apply to the whole site" />
          </label>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <DownloadIcon data-icon="inline-start" /> Export
              </Button>
            </DialogTrigger>
            {/* header stays put; the panel scrolls inside a fixed-height dialog */}
            <DialogContent className="flex max-h-[min(85dvh,52rem)] flex-col gap-4 sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Export theme</DialogTitle>
                <DialogDescription>Take it to your project.</DialogDescription>
              </DialogHeader>
              <div className="-mx-6 min-h-0 flex-1 overflow-y-auto px-6 pb-1">
                <ExportPanel theme={theme} recipe={options} />
              </div>
            </DialogContent>
          </Dialog>
        </Glass>
        <StudioPreview theme={theme} scheme={scheme} />
      </section>
    </div>
  )
}
