"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { RotateCcwIcon } from "lucide-react"

import { Button } from "@/components/glass/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
import { Label } from "@/components/glass/label"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/segmented-control"
import { Slider } from "@/components/glass/slider"
import { CodeBlockClient } from "./code-block-client"
import { PALETTES, usePalette, type Palette } from "./providers"
import { PaletteSwatch } from "./site-header"

const DEFAULTS = { blur: 28, saturate: 180, frost: 52, radius: 0.625 }
type Knobs = typeof DEFAULTS

/** The glass fill for a frost percentage, per scheme — the same hue the tokens use. */
const fillFor = (frost: number, dark: boolean) => (dark ? `oklch(0.27 0.012 285 / ${Math.round(frost * 0.8)}%)` : `oklch(1 0 0 / ${frost}%)`)

/**
 * Turn the knobs and the whole site follows: the variables are written onto
 * <html>, and the CSS to keep them is printed below, ready for globals.css.
 */
export function Customizer() {
  const { resolvedTheme, setTheme } = useTheme()
  const { palette, setPalette } = usePalette()
  const [k, setK] = React.useState<Knobs>(DEFAULTS)
  const dark = resolvedTheme === "dark"

  React.useEffect(() => {
    const root = document.documentElement.style
    root.setProperty("--glass-blur", `${k.blur}px`)
    root.setProperty("--glass-saturate", `${k.saturate}%`)
    root.setProperty("--glass", fillFor(k.frost, dark))
    root.setProperty("--radius", `${k.radius}rem`)
    return () => {
      for (const v of ["--glass-blur", "--glass-saturate", "--glass", "--radius"]) root.removeProperty(v)
    }
  }, [k, dark])

  const css = `:root {
  --radius: ${k.radius}rem;
  --glass: ${fillFor(k.frost, false)};
  --glass-blur: ${k.blur}px;
  --glass-saturate: ${k.saturate}%;
}

.dark {
  --glass: ${fillFor(k.frost, true)};
}`
  const knob = (key: keyof Knobs, label: string, min: number, max: number, step: number, unit: string) => (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {k[key]}
          {unit}
        </span>
      </div>
      <Slider value={[k[key]]} min={min} max={max} step={step} onValueChange={([v]) => setK((s) => ({ ...s, [key]: v }))} aria-label={label} />
    </div>
  )

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Customize</CardTitle>
          <CardDescription>Changes apply to this whole site, live.</CardDescription>
          <CardAction>
            <Button variant="ghost" size="icon-sm" aria-label="Reset" onClick={() => setK(DEFAULTS)}>
              <RotateCcwIcon />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-3">
            <Label>Palette</Label>
            <div className="grid grid-cols-3 gap-2">
              {PALETTES.map((p) => (
                <Button key={p} variant={palette === p ? "tinted" : "secondary"} size="sm" className="justify-start capitalize" onClick={() => setPalette(p as Palette)}>
                  <PaletteSwatch palette={p} />
                  {p}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            <Label>Mode</Label>
            <SegmentedControl value={dark ? "dark" : "light"} onValueChange={setTheme} className="w-full" aria-label="Mode">
              <SegmentedControlItem value="light">Light</SegmentedControlItem>
              <SegmentedControlItem value="dark">Dark</SegmentedControlItem>
            </SegmentedControl>
          </div>
          {knob("blur", "Blur", 0, 64, 1, "px")}
          {knob("saturate", "Saturation", 100, 260, 5, "%")}
          {knob("frost", "Frost", 10, 90, 1, "%")}
          {knob("radius", "Radius", 0.25, 1.25, 0.025, "rem")}
        </CardContent>
      </Card>
      <div className="grid content-start gap-3">
        <p className="text-sm text-muted-foreground">
          Add the theme with <code className="rounded-md bg-fill px-1.5 py-0.5 font-mono text-xs">shadcn add …/theme-{palette}.json</code>, then paste your knobs into{" "}
          <code className="rounded-md bg-fill px-1.5 py-0.5 font-mono text-xs">globals.css</code>:
        </p>
        <CodeBlockClient code={css} title="globals.css" />
      </div>
    </div>
  )
}
