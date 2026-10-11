import * as React from "react"
import { useColorScheme } from "react-native"

import { useHighContrast } from "@/components/glass/native/a11y"
import { PALETTES, PRESETS, type DensityName, type MaterialName, type MotionName, type PaletteName, type ShapeName, type TypeName } from "@/components/glass/native/tokens.generated"

/**
 * glasscn tokens for React Native — generated from the web theme engine
 * (`toNativeTheme` in glass-theme.ts → tokens.generated.ts), so every palette and
 * material, shape, motion, density and type preset matches the web. Wrap your app in
 * <GlassThemeProvider> to pick them or force a scheme; read with useGlassTheme().
 */

export type { DensityName, MaterialName, MotionName, PaletteName, ShapeName, TypeName }
export type Scheme = "light" | "dark"

/** One scheme as plain values: sRGB colours, points, ms. Mirrors `NativeScheme` in glass-theme.ts. */
export interface NativeScheme {
  primary: string
  primaryForeground: string
  ring: string
  destructive: string
  destructiveForeground: string
  success: string
  successForeground: string
  warning: string
  warningForeground: string
  info: string
  infoForeground: string
  chart: [string, string, string, string, string, string, string, string]
  aurora: [string, string, string]
  auroraBase: string
  foreground: string
  label: string
  labelSecondary: string
  labelTertiary: string
  labelQuaternary: string
  frost: string
  glassSubtle: string
  glass: string
  glassStrong: string
  glassLiquid: string
  glassLiquidClear: string
  glassClearDim: string
  glassSolid: string
  glassBorder: string
  glassHighlight: string
  glassShadow: string
  shadowY: number
  shadowBlur: number
  dim: string
  fill: string
  fillStrong: string
  separator: string
  thumb: string
  knob: string
  blur: number
  liquidBlur: number
  specular: number
  edgeShade: number
  illumination: number
  clarity: number
  radius: { surface: number; control: number; button: number; badge: number }
  density: number
  hitMin: number
  ringWidth: number
  motion: { duration: number; pressScale: number; pressStretch: number; pressGrow: number; knobLensScale: number; auroraSpeed: number }
  type: { scale: number; ratio: number; leading: number; headingLeading: number; bodyWeight: number; headingWeight: number; displayWeight: number; tracking: number; headingTracking: number; displayTracking: number }
  fonts: { sans?: string; heading?: string; display?: string; mono?: string }
}
export type NativeHighContrast = Pick<NativeScheme, "glassBorder" | "separator" | "labelSecondary" | "labelTertiary" | "fill" | "fillStrong" | "primary" | "ring">
export interface NativeTheme {
  light: NativeScheme
  dark: NativeScheme
  highContrast: { light: NativeHighContrast; dark: NativeHighContrast }
}

export const PALETTE_NAMES = Object.keys(PALETTES) as PaletteName[]

export interface GlassTheme extends NativeScheme {
  scheme: Scheme
  palette: PaletteName
  /** Increase Contrast is on (OS or forced): borders, separators and secondary text are firmer. */
  highContrast: boolean
  /** Secondary text — the label-secondary tier. */
  mutedForeground: string
  /** The tint laid into Liquid Glass so it reads on a pale ground (the liquid frost). */
  glassTint: string
}

export interface ThemeOptions {
  palette?: PaletteName
  material?: MaterialName
  shape?: ShapeName
  motion?: MotionName
  density?: DensityName
  type?: TypeName
  /** Force Increase Contrast on or off; omit to follow the OS. */
  highContrast?: boolean
  /** Raw overrides, applied last. */
  tokens?: Partial<NativeScheme>
}

/** The theme for a scheme and presets, as the web's createGlassTheme would make it. Pure. */
export function buildGlassTheme(scheme: Scheme, palette: PaletteName = "dusk", options: Omit<ThemeOptions, "palette"> = {}): GlassTheme {
  const p = PALETTES[palette] ?? PALETTES.dusk
  const s: NativeScheme = { ...p[scheme] }
  for (const group of ["material", "shape", "motion", "density", "type"] as const) {
    const key = options[group]
    const diff = key ? (PRESETS[group] as Record<string, { light: Partial<NativeScheme>; dark: Partial<NativeScheme> }>)[key]?.[scheme] : undefined
    if (diff) Object.assign(s, diff)
  }
  if (options.highContrast) Object.assign(s, p.highContrast[scheme])
  Object.assign(s, options.tokens)
  return {
    ...s,
    scheme,
    palette: PALETTES[palette] ? palette : "dusk",
    highContrast: !!options.highContrast,
    // text on glass: the label tier, so `foreground` reads inside panes as on the web
    foreground: s.label,
    mutedForeground: s.labelSecondary,
    glassTint: s.glassLiquid,
  }
}

type Ctx = ThemeOptions & { scheme?: Scheme }
const GlassThemeContext = React.createContext<Ctx | null>(null)

/**
 * Pick a palette, presets or a scheme for everything inside. Nested providers merge
 * with the outer one: unset props inherit (a nested `palette` keeps an outer forced `scheme`).
 */
export function GlassThemeProvider({ children, ...props }: Ctx & { children: React.ReactNode }) {
  const parent = React.useContext(GlassThemeContext)
  const { palette, scheme, material, shape, motion, density, type, highContrast, tokens } = props
  const value = React.useMemo<Ctx>(() => {
    const own = Object.fromEntries(Object.entries({ palette, scheme, material, shape, motion, density, type, highContrast }).filter(([, v]) => v !== undefined))
    return { ...parent, ...own, tokens: parent?.tokens || tokens ? { ...parent?.tokens, ...tokens } : undefined }
  }, [parent, palette, scheme, material, shape, motion, density, type, highContrast, tokens])
  return <GlassThemeContext.Provider value={value}>{children}</GlassThemeContext.Provider>
}

/** The provider's options, merged up the tree (for scopes that re-provide). */
export const useGlassThemeOptions = () => React.useContext(GlassThemeContext) ?? {}

/** The current tokens: the provider's palette, presets and scheme, else Dusk and the system scheme; Increase Contrast from the OS. */
export function useGlassTheme(): GlassTheme {
  const ctx = React.useContext(GlassThemeContext)
  const system = useColorScheme()
  const osContrast = useHighContrast()
  const scheme: Scheme = ctx?.scheme ?? (system === "dark" ? "dark" : "light")
  const highContrast = ctx?.highContrast ?? osContrast
  return React.useMemo(
    () => buildGlassTheme(scheme, ctx?.palette ?? "dusk", { ...ctx, highContrast }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scheme, ctx, highContrast]
  )
}
