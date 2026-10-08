"use client"

import * as React from "react"
import { ThemeProvider } from "next-themes"

import { TooltipProvider } from "@/components/glass/tooltip"
import { Toaster } from "@/components/glass/toaster"

export const PALETTES = ["dusk", "ocean", "rose", "sage", "amber", "graphite"] as const
export type Palette = (typeof PALETTES)[number]
const KEY = "glasscn-palette"

const PaletteContext = React.createContext<{ palette: Palette; setPalette: (p: Palette) => void }>({ palette: "dusk", setPalette: () => {} })

function readPalette(): Palette {
  try {
    const v = localStorage.getItem(KEY)
    return PALETTES.includes(v as Palette) ? (v as Palette) : "dusk"
  } catch {
    return "dusk"
  }
}

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb)
  window.addEventListener("glasscn-palette", cb)
  return () => {
    window.removeEventListener("storage", cb)
    window.removeEventListener("glasscn-palette", cb)
  }
}

/** The palette lives on <html data-palette> (set before paint by paletteScript) and in localStorage. */
export function usePalette() {
  return React.useContext(PaletteContext)
}

export function Providers({ children }: { children: React.ReactNode }) {
  const palette = React.useSyncExternalStore(subscribe, readPalette, () => "dusk" as Palette)
  const setPalette = React.useCallback((p: Palette) => {
    try {
      localStorage.setItem(KEY, p)
    } catch {}
    document.documentElement.dataset.palette = p
    window.dispatchEvent(new Event("glasscn-palette"))
  }, [])
  const value = React.useMemo(() => ({ palette, setPalette }), [palette, setPalette])
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <PaletteContext.Provider value={value}>
        <TooltipProvider>
          {children}
          <ToasterThemed />
        </TooltipProvider>
      </PaletteContext.Provider>
    </ThemeProvider>
  )
}

function ToasterThemed() {
  return <Toaster position="bottom-center" />
}

/** Runs before paint: no flash of the wrong palette. */
export const paletteScript = `try{var p=localStorage.getItem("${KEY}");if(p)document.documentElement.dataset.palette=p}catch(e){}`
