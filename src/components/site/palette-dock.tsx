"use client"

import { useTheme } from "next-themes"
import { ChevronUpIcon, MoonIcon, SunIcon } from "lucide-react"

import { Dock, DockAction, DockBar, DockItem } from "@/components/glass/dock"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/glass/dropdown-menu"
import { usePalette, type Palette } from "./providers"
import { PaletteSwatch } from "./site-header"

/**
 * The landing page's palette switcher is itself a Dock. All the labelled palettes need ~850px, so below `lg`
 * it collapses to one capsule — the current palette — that opens the swatches above it, with the
 * light/dark action always beside it on screen.
 */
export function PaletteDock() {
  const { palette, setPalette, palettes } = usePalette()
  const { resolvedTheme, setTheme } = useTheme()
  const choose = (v: string) => setPalette(v as Palette)
  return (
    <Dock>
      <DockBar value={palette} onValueChange={choose} aria-label="Palette" className="hidden lg:flex">
        {palettes.map((p) => (
          <DockItem key={p} value={p} className="min-w-16 px-1.5 capitalize" aria-label={p}>
            <PaletteSwatch palette={p} className="size-5" />
            <span>{p}</span>
          </DockItem>
        ))}
      </DockBar>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Palette: ${palette}`}
          className="glass flex h-13 items-center gap-2.5 rounded-button pr-4 pl-2 text-sm font-semibold capitalize outline-none transition-transform duration-(--glass-duration) ease-glass focus-visible:ring-(length:--glass-ring-width) focus-visible:ring-ring/50 active:scale-(--glass-press-scale) lg:hidden"
        >
          <PaletteSwatch palette={palette} className="size-9" />
          {palette}
          <ChevronUpIcon className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="center" sideOffset={10} className="w-72">
          <DropdownMenuLabel>Palette</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={palette} onValueChange={choose} className="grid grid-cols-2">
            {palettes.map((p) => (
              <DropdownMenuRadioItem key={p} value={p} className="capitalize">
                <PaletteSwatch palette={p} />
                {p}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DockAction aria-label="Toggle dark mode" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="size-13 lg:size-15">
        <SunIcon className="hidden dark:block" />
        <MoonIcon className="dark:hidden" />
      </DockAction>
    </Dock>
  )
}
