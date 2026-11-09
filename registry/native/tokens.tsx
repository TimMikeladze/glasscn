import * as React from "react"
import { Platform, useColorScheme } from "react-native"

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
  glassThick: string
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
  clearBlur: number
  saturate: number
  liquidSaturate: number
  brightness: number
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
/** Clear media controls use bright labels independently of the app's scheme. */
export const CLEAR_MEDIA_LABELS: Partial<NativeScheme> = { label: "#fafafa", labelSecondary: "#e5e5e5", labelTertiary: "#d4d4d4", foreground: "#fafafa" }
export const NativeGlassLabelsContext = React.createContext<GlassTheme | null>(null)
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
  /** Frost color for content fills and outlines. Native Liquid Glass has no default tint. */
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

// System on iOS is the OS's own appearance: the iOS 27 system colours (HIG Color,
// Specifications). systemBlue carries white at 3.5:1, which the HIG allows for bold text, so
// labels on it are semibold. The web's System palette uses Apple's web blue (#0071E3) instead.
const IOS_SYSTEM: Record<"light" | "dark" | "lightHC" | "darkHC", Partial<NativeScheme>> = {
  light: { primary: "#0088ff", primaryForeground: "#ffffff", ring: "#0088ff", destructive: "#ff383c", destructiveForeground: "#ffffff", chart: ["#0088ff", "#34c759", "#ff8d28", "#cb30e0", "#ff2d55", "#6155f5", "#00c3d0", "#8e8e93"] },
  dark: { primary: "#0091ff", primaryForeground: "#ffffff", ring: "#0091ff", destructive: "#ff4245", destructiveForeground: "#ffffff", chart: ["#0091ff", "#30d158", "#ff9230", "#db34f2", "#ff375f", "#6d7cff", "#00d2e0", "#98989d"] },
  lightHC: { primary: "#1e6ef4", ring: "#1e6ef4", destructive: "#e9152d" },
  darkHC: { primary: "#5cb8ff", ring: "#5cb8ff", destructive: "#ff6165" },
}

/** The theme for a scheme and presets, as the web's createGlassTheme would make it. Pure. */
export function buildGlassTheme(scheme: Scheme, palette: PaletteName = "system", options: Omit<ThemeOptions, "palette"> = {}): GlassTheme {
  const p = PALETTES[palette] ?? PALETTES.dusk
  const s: NativeScheme = { ...p[scheme] }
  for (const group of ["material", "shape", "motion", "density", "type"] as const) {
    const key = options[group]
    const diff = key ? (PRESETS[group] as Record<string, { light: Partial<NativeScheme>; dark: Partial<NativeScheme> }>)[key]?.[scheme] : undefined
    if (diff) Object.assign(s, diff)
  }
  if (options.highContrast) Object.assign(s, p.highContrast[scheme])
  if (palette === "system" && Platform.OS === "ios") Object.assign(s, IOS_SYSTEM[scheme], options.highContrast ? IOS_SYSTEM[`${scheme}HC`] : null)
  Object.assign(s, options.tokens)
  return {
    ...s,
    scheme,
    palette: PALETTES[palette] ? palette : "system",
    highContrast: !!options.highContrast,
    // text on glass: the label tier, so `foreground` reads inside panes as on the web
    foreground: s.label,
    mutedForeground: s.labelSecondary,
    glassTint: s.glassLiquid,
  }
}

/** Labels for untinted system surfaces must not inherit a content-material tint's label color. */
export function nativeGlassLabels(theme: GlassTheme, overrides?: Partial<NativeScheme>): Partial<NativeScheme> {
  const base = buildGlassTheme(theme.scheme, theme.palette, { highContrast: theme.highContrast })
  const keys = ["label", "labelSecondary", "labelTertiary", "labelQuaternary", "foreground"] as const
  return Object.fromEntries(keys.map((key) => [key, overrides?.[key] ?? base[key]]))
}

/** Omitted provider options leave system controls at their platform defaults. */
export function nativeControlTheme(theme: GlassTheme, options: ThemeOptions & { scheme?: Scheme }) {
  return {
    colorScheme: options.scheme,
    // the System palette is the OS's own appearance: system controls keep their native tints
    // (a green iOS switch, the user's accent), unless a raw accent is set
    seedColor: (options.palette !== undefined && options.palette !== "system") || options.tokens?.primary !== undefined ? theme.primary : undefined,
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

/** The current tokens: the provider's palette, presets and scheme, else System and the system scheme; Increase Contrast from the OS. */
export function useGlassTheme(): GlassTheme {
  const ctx = React.useContext(GlassThemeContext)
  const system = useColorScheme()
  const osContrast = useHighContrast()
  const scheme: Scheme = ctx?.scheme ?? (system === "dark" ? "dark" : "light")
  const highContrast = ctx?.highContrast ?? osContrast
  return React.useMemo(
    () => buildGlassTheme(scheme, ctx?.palette ?? "system", { ...ctx, highContrast }),
    [scheme, ctx, highContrast]
  )
}
