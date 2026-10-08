"use client"

import { useTheme } from "next-themes"
import { MoonIcon, SunIcon } from "lucide-react"

import { Dock, DockAction, DockBar, DockItem } from "@/components/glass/dock"
import { PALETTES, usePalette, type Palette } from "./providers"
import { PaletteSwatch } from "./site-header"

/** The landing page's palette switcher is itself a Dock. */
export function PaletteDock() {
  const { palette, setPalette } = usePalette()
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Dock>
      <DockBar value={palette} onValueChange={(v) => setPalette(v as Palette)} aria-label="Palette">
        {PALETTES.map((p) => (
          <DockItem key={p} value={p} className="min-w-11 px-1.5 capitalize sm:min-w-16" aria-label={p}>
            <PaletteSwatch palette={p} className="size-5" />
            <span className="hidden sm:inline">{p}</span>
          </DockItem>
        ))}
      </DockBar>
      <DockAction aria-label="Toggle dark mode" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="size-13 sm:size-15">
        <SunIcon className="hidden dark:block" />
        <MoonIcon className="dark:hidden" />
      </DockAction>
    </Dock>
  )
}
