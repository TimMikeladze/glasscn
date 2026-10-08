"use client"

import * as React from "react"
import { ThemeProvider } from "next-themes"

import { TooltipProvider } from "@/components/glass/tooltip"
import { Toaster } from "@/components/glass/toaster"
import { PALETTES as PALETTE_DEFS } from "@/lib/glass-theme"

export const PALETTES = Object.keys(PALETTE_DEFS)
export type Palette = string
const KEY = "glasscn-palette"

const PaletteContext = React.createContext<{ palette: Palette; setPalette: (p: Palette) => void }>({ palette: "dusk", setPalette: () => {} })

function readPalette(): Palette {
  try {
    const v = localStorage.getItem(KEY)
    return v && PALETTES.includes(v) ? v : "dusk"
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
  const palette = React.useSyncExternalStore(subscribe, readPalette, () => "dusk")
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
