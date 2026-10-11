"use client"

import * as React from "react"
import { ThemeProvider } from "next-themes"

import { TooltipProvider } from "@/components/glass/tooltip"
import { Toaster } from "@/components/glass/toaster"
export type Palette = string
const KEY = "glasscn-palette"

const PaletteContext = React.createContext<{ palette: Palette; setPalette: (p: Palette) => void; palettes: Palette[] }>({ palette: "dusk", setPalette: () => {}, palettes: ["dusk"] })

function readPalette(palettes: Palette[]): Palette {
  try {
    const v = localStorage.getItem(KEY)
    return v && palettes.includes(v) ? v : "dusk"
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

/** The palette lives on <html data-palette> (set before paint by paletteScript) and in localStorage. `palettes` lists the choices. */
export function usePalette() {
  return React.useContext(PaletteContext)
}

/**
 * `palettes` (the palette names) comes from the server layout, so the palette definitions in
 * glass-theme never ship to the browser just to list their keys.
 */
export function Providers({ palettes, children }: { palettes: Palette[]; children: React.ReactNode }) {
  const palette = React.useSyncExternalStore(subscribe, () => readPalette(palettes), () => "dusk")
  const setPalette = React.useCallback((p: Palette) => {
    try {
      localStorage.setItem(KEY, p)
    } catch {}
    document.documentElement.dataset.palette = p
    window.dispatchEvent(new Event("glasscn-palette"))
  }, [])
  const value = React.useMemo(() => ({ palette, setPalette, palettes }), [palette, setPalette, palettes])
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

const CUSTOM = "glasscn-custom-css"

/**
 * A theme from the studio, applied to the whole site: sanitised CSS (from themeToCss)
 * scoped to :root[data-glass-custom], stored so it survives reloads. null removes it.
 */
export function applySiteTheme(css: string | null) {
  const root = document.documentElement
  let el = document.getElementById("glasscn-custom") as HTMLStyleElement | null
  try {
    if (css) localStorage.setItem(CUSTOM, css)
    else localStorage.removeItem(CUSTOM)
  } catch {}
  if (!css) {
    el?.remove()
    root.removeAttribute("data-glass-custom")
    return
  }
  if (!el) {
    el = document.createElement("style")
    el.id = "glasscn-custom"
    document.head.appendChild(el)
  }
  el.textContent = css
  root.setAttribute("data-glass-custom", "")
}

export const hasSiteTheme = () => {
  try {
    return !!localStorage.getItem(CUSTOM)
  } catch {
    return false
  }
}

/** Runs before paint: no flash of the wrong palette or custom theme. */
export const paletteScript = `try{var d=document.documentElement,p=localStorage.getItem("${KEY}");if(p)d.dataset.palette=p;var c=localStorage.getItem("${CUSTOM}");if(c){var s=document.createElement("style");s.id="glasscn-custom";s.textContent=c;document.head.appendChild(s);d.setAttribute("data-glass-custom","")}}catch(e){}`
