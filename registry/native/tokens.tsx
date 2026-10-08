import * as React from "react"
import { useColorScheme } from "react-native"

/**
 * glasscn tokens for React Native — the same names and palettes as the web
 * registry's CSS variables, as plain values. Wrap your app in <GlassThemeProvider>
 * to pick a palette or force a scheme; read with useGlassTheme().
 */

export type PaletteName = "dusk" | "ocean" | "rose" | "sage" | "amber" | "graphite"
export type Scheme = "light" | "dark"

const PALETTES: Record<PaletteName, { light: string; dark: string; aurora: { light: [string, string, string]; dark: [string, string, string] }; rings: [string, string] }> = {
  dusk: { light: "#EE5A36", dark: "#FF7A55", aurora: { light: ["#FFB199", "#C7B2FF", "#FFD9AE"], dark: ["#9A3A2A", "#4A2F96", "#7A4A1C"] }, rings: ["#A77BFF", "#FFAA33"] },
  ocean: { light: "#1F74F0", dark: "#4DA3FF", aurora: { light: ["#9CC6FF", "#A6EEE4", "#C7BCFF"], dark: ["#14408A", "#0E5E66", "#33298A"] }, rings: ["#2CCFC2", "#8E7CFF"] },
  rose: { light: "#E0436B", dark: "#FF6B8E", aurora: { light: ["#FFB3C8", "#E2B8FF", "#FFD3DE"], dark: ["#8A2346", "#5E2C86", "#4A1F66"] }, rings: ["#B57BFF", "#FF9466"] },
  sage: { light: "#23935F", dark: "#4CD08F", aurora: { light: ["#B2EACB", "#DCF2A8", "#A9DFEA"], dark: ["#1C6644", "#466620", "#145A66"] }, rings: ["#93CC3F", "#33B2D6"] },
  amber: { light: "#C97A06", dark: "#FFB340", aurora: { light: ["#FFD898", "#FFBBA3", "#FFF0B3"], dark: ["#7A520F", "#7A321F", "#5E5612"] }, rings: ["#FF6F4F", "#E8C21C"] },
  graphite: { light: "#1C1C1E", dark: "#F2F2F7", aurora: { light: ["#D3D8E2", "#E4DEF0", "#CCDFE8"], dark: ["#30343F", "#3A3446", "#24343E"] }, rings: ["#7C7C84", "#AEAEB4"] },
}

export interface GlassTheme {
  scheme: Scheme
  palette: PaletteName
  foreground: string
  mutedForeground: string
  primary: string
  primaryForeground: string
  glass: string
  glassStrong: string
  /** Opaque-enough fill where there is no blur (Android). */
  glassSolid: string
  /** Tint laid into Liquid Glass so it reads on a pale aurora. */
  glassTint: string
  glassBorder: string
  glassShadow: string
  fill: string
  fillStrong: string
  auroraBase: string
  aurora: [string, string, string]
  chart: [string, string, string]
}

export function buildGlassTheme(scheme: Scheme, palette: PaletteName = "dusk"): GlassTheme {
  const p = PALETTES[palette] ?? PALETTES.dusk
  const dark = scheme === "dark"
  const primary = dark ? p.dark : p.light
  return {
    scheme,
    palette,
    foreground: dark ? "#FFFFFF" : "#0B0B0F",
    mutedForeground: dark ? "rgba(235,235,245,0.68)" : "rgba(60,60,67,0.74)",
    primary,
    primaryForeground: dark ? (palette === "graphite" ? "#000000" : "#1a0b05") : "#FFFFFF",
    glass: dark ? "rgba(36,36,44,0.42)" : "rgba(255,255,255,0.52)",
    glassStrong: dark ? "rgba(30,30,38,0.72)" : "rgba(255,255,255,0.74)",
    glassSolid: dark ? "rgba(28,28,34,0.9)" : "rgba(255,255,255,0.88)",
    glassTint: dark ? "rgba(30,30,38,0.4)" : "rgba(255,255,255,0.45)",
    glassBorder: dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.9)",
    glassShadow: dark ? "rgba(0,0,0,0.5)" : "rgba(31,38,64,0.12)",
    fill: dark ? "rgba(120,120,128,0.24)" : "rgba(120,120,128,0.12)",
    fillStrong: dark ? "rgba(120,120,128,0.36)" : "rgba(120,120,128,0.2)",
    auroraBase: dark ? "#050507" : "#EEF0F5",
    aurora: dark ? p.aurora.dark : p.aurora.light,
    chart: [primary, p.rings[0], p.rings[1]],
  }
}

const GlassThemeContext = React.createContext<{ palette?: PaletteName; scheme?: Scheme } | null>(null)

export function GlassThemeProvider({ palette, scheme, children }: { palette?: PaletteName; scheme?: Scheme; children: React.ReactNode }) {
  const value = React.useMemo(() => ({ palette, scheme }), [palette, scheme])
  return <GlassThemeContext.Provider value={value}>{children}</GlassThemeContext.Provider>
}

/** The current tokens: the provider's palette/scheme, else Dusk and the system scheme. */
export function useGlassTheme(): GlassTheme {
  const ctx = React.useContext(GlassThemeContext)
  const system = useColorScheme()
  const scheme: Scheme = ctx?.scheme ?? (system === "dark" ? "dark" : "light")
  const palette = ctx?.palette ?? "dusk"
  return React.useMemo(() => buildGlassTheme(scheme, palette), [scheme, palette])
}
