import * as React from "react"
import { useColorScheme } from "react-native"

import { GlassThemeProvider, type PaletteName, type Scheme } from "@/components/glass/native/tokens"

export const PALETTES: PaletteName[] = ["dusk", "ocean", "rose", "sage", "amber", "graphite"]

type SandboxTheme = {
  palette: PaletteName
  scheme: Scheme
  setPalette: (p: PaletteName) => void
  setScheme: (s: Scheme) => void
}

const Ctx = React.createContext<SandboxTheme | null>(null)

/** The palette + scheme every screen renders in; starts on the system scheme. */
export function SandboxThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme()
  const [palette, setPalette] = React.useState<PaletteName>("dusk")
  const [scheme, setScheme] = React.useState<Scheme>(system === "dark" ? "dark" : "light")
  const value = React.useMemo(() => ({ palette, scheme, setPalette, setScheme }), [palette, scheme])
  return (
    <Ctx.Provider value={value}>
      <GlassThemeProvider palette={palette} scheme={scheme}>
        {children}
      </GlassThemeProvider>
    </Ctx.Provider>
  )
}

export function useSandboxTheme() {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("useSandboxTheme needs <SandboxThemeProvider>")
  return ctx
}
