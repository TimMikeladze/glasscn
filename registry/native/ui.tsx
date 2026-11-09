import * as React from "react"
import { DynamicColorIOS, Platform, PlatformColor, StyleSheet, Text as RNText, type ColorValue, type TextProps, type TextStyle } from "react-native"

import { MAX_FONT_SCALE, useBoldText } from "@/components/glass/native/a11y"
import { buildGlassTheme, NativeGlassLabelsContext, useGlassTheme, useGlassThemeOptions, type GlassTheme } from "@/components/glass/native/tokens"

/**
 * The React Native port of glasscn's CSS variables (glass-theme.ts TOKENS) as plain
 * numbers and colours. Every ported component reads this through useUI() — no
 * Tailwind, no CSS variables, so it runs the same on iOS, Android and web.
 */

export interface UI extends Omit<GlassTheme, "motion"> {
  /** Eight chart series — the web's --chart-1..8. */
  charts: [string, string, string, string, string, string, string, string]
  /** Quiet text: placeholders, unavailable items (label-tertiary). */
  muted: string
  /** Control heights (h-control*) × density. Tappable controls also get hitSlop to 44pt. */
  control: { xs: number; sm: number; default: number; lg: number }
  pad: { xs: number; sm: number; default: number; lg: number }
  /** Type steps in pt: the theme's ratio and base scale, like the web's type-step-*. */
  text: { xs: number; sm: number; base: number; lg: number; xl: number; "2xl": number; "3xl": number; "4xl": number; "5xl": number }
  weight: { body: TextStyle["fontWeight"]; heading: TextStyle["fontWeight"]; display: TextStyle["fontWeight"] }
  motion: GlassTheme["motion"] & {
    /** Reanimated `withSpring` config from the motion tokens (duration-based, so it matches the web's linear() spring). */
    springConfig: { duration: number; dampingRatio: number }
    /** Legacy RN Animated spring, for the few parts still on Animated. */
    spring: { friction: number; tension: number }
  }
}

const SYSTEM_FONTS = {
  display: Platform.select({ ios: "ui-rounded", web: 'ui-rounded, "SF Pro Rounded", -apple-system, system-ui, sans-serif', default: undefined }),
  mono: Platform.select({ ios: "Menlo", web: "ui-monospace, Menlo, monospace", default: "monospace" }),
}

const weight = (n: number) => String(Math.round(n / 100) * 100) as TextStyle["fontWeight"]

export function buildUI(t: GlassTheme): UI {
  const d = t.density
  const step = (n: number) => Math.round(16 * t.type.scale * t.type.ratio ** n)
  const still = t.motion.duration === 0
  return {
    ...t,
    charts: t.chart,
    muted: t.labelTertiary,
    control: { xs: Math.round(28 * d), sm: Math.round(32 * d), default: Math.round(40 * d), lg: Math.round(48 * d) },
    pad: { xs: Math.round(10 * d), sm: Math.round(12 * d), default: Math.round(16 * d), lg: Math.round(22 * d) },
    // iOS sizes are Apple's default text-style sizes for the ramp each step maps to (Caption 1,
    // Subheadline, Body, Title 3, Title 2, Title 1, Large Title); other platforms keep the web's
    // modular scale. Both follow the type preset's scale.
    text: Platform.OS === "ios"
      ? { xs: Math.round(12 * t.type.scale), sm: Math.round(15 * t.type.scale), base: Math.round(17 * t.type.scale), lg: Math.round(20 * t.type.scale), xl: Math.round(22 * t.type.scale), "2xl": Math.round(28 * t.type.scale), "3xl": Math.round(34 * t.type.scale), "4xl": Math.max(Math.round(40 * t.type.scale), step(5)), "5xl": Math.max(Math.round(48 * t.type.scale), step(6)) }
      : { xs: Math.round(12 * t.type.scale), sm: step(-1) < 14 ? Math.round(14 * t.type.scale) : step(-1), base: step(0), lg: step(1), xl: step(2), "2xl": step(3), "3xl": step(4), "4xl": step(5), "5xl": step(6) },
    fonts: { sans: t.fonts.sans, heading: t.fonts.heading ?? t.fonts.sans, display: t.fonts.display ?? t.fonts.heading ?? SYSTEM_FONTS.display, mono: t.fonts.mono ?? SYSTEM_FONTS.mono },
    weight: { body: weight(t.type.bodyWeight), heading: weight(t.type.headingWeight), display: weight(t.type.displayWeight) },
    motion: {
      ...t.motion,
      springConfig: { duration: Math.max(1, t.motion.duration * 2.2), dampingRatio: still ? 1 : 0.78 },
      spring: { friction: 8, tension: still ? 1000 : 380 },
    },
  }
}

/** glasscn tokens for the ported components. */
export function useUI(): UI {
  const t = useGlassTheme()
  return React.useMemo(() => buildUI(t), [t])
}

/** `#RRGGBB` + alpha → rgba(). Leaves rgba()/named colours untouched. */
export function alpha(color: string, a: number): string {
  if (!color.startsWith("#") || (color.length !== 7 && color.length !== 4)) return color
  const hex = color.length === 4 ? color.replace(/^#(.)(.)(.)$/, "#$1$1$2$2$3$3") : color
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

/** Web-only style keys (boxShadow, backdropFilter, cursor…) typed loosely so RN accepts them. */
export const web = (s: Record<string, unknown>) => (Platform.OS === "web" ? (s as object) : {})

/** Dynamic colors let UIKit apply the glass contentView's contrast and vibrancy. */
export function useGlassForeground(color?: ColorValue): ColorValue {
  const theme = useGlassTheme()
  const options = useGlassThemeOptions()
  const dynamic = React.useContext(NativeGlassLabelsContext)
  const accent = React.useMemo(() => Platform.OS === "ios" ? DynamicColorIOS({
    light: buildGlassTheme("light", theme.palette).primary,
    dark: buildGlassTheme("dark", theme.palette).primary,
    highContrastLight: buildGlassTheme("light", theme.palette, { highContrast: true }).primary,
    highContrastDark: buildGlassTheme("dark", theme.palette, { highContrast: true }).primary,
  }) : theme.primary, [theme.palette, theme.primary])
  const requested = color ?? theme.foreground
  if (!dynamic || Platform.OS !== "ios") return requested
  if (requested === theme.foreground || requested === theme.label || requested === dynamic.foreground || requested === dynamic.label) return PlatformColor("label")
  if (requested === theme.labelSecondary || requested === theme.mutedForeground || requested === dynamic.labelSecondary || requested === dynamic.mutedForeground) return PlatformColor("secondaryLabel")
  if (requested === theme.labelTertiary || requested === dynamic.labelTertiary) return PlatformColor("tertiaryLabel")
  if (requested === theme.labelQuaternary || requested === dynamic.labelQuaternary) return PlatformColor("quaternaryLabel")
  if (requested === theme.primary && options.tokens?.primary === undefined) return accent
  return requested
}

export function GIcon({ children, color, size }: { children: React.ReactElement<{ color?: ColorValue; size?: number }>; color?: ColorValue; size?: number }) {
  const foreground = useGlassForeground(children.props.color ?? color)
  return React.cloneElement(children, { color: foreground, size: children.props.size ?? size })
}

export type TextSize = keyof UI["text"]
const TYPE_RAMPS: Record<TextSize, TextProps["dynamicTypeRamp"]> = {
  xs: "caption1",
  sm: "subheadline",
  base: "body",
  lg: "title3",
  xl: "title2",
  "2xl": "title1",
  "3xl": "largeTitle",
  "4xl": "largeTitle",
  "5xl": "largeTitle",
}
export type TextTone = "default" | "muted" | "subtle" | "primary" | "destructive" | "onPrimary"
export type TextFont = "sans" | "heading" | "display" | "mono"

export type GTextProps = TextProps & {
  size?: TextSize
  tone?: TextTone
  font?: TextFont
  weight?: TextStyle["fontWeight"]
  /** Raw colour, wins over tone. */
  color?: string
  align?: TextStyle["textAlign"]
}

export function toneColor(ui: UI, tone: TextTone = "default") {
  switch (tone) {
    case "muted":
      return ui.mutedForeground
    case "subtle":
      return ui.muted
    case "primary":
      return ui.primary
    case "destructive":
      return ui.destructive
    case "onPrimary":
      return ui.primaryForeground
    default:
      return ui.foreground
  }
}

/** The base text every ported glasscn component sets type with. */
export function GText({ size = "base", tone = "default", font = "sans", weight, color, align, style, maxFontSizeMultiplier, dynamicTypeRamp, ...rest }: GTextProps) {
  const ui = useUI()
  const bold = useBoldText()
  const fontSize = ui.text[size]
  const fontWeight = weight ?? (font === "heading" ? ui.weight.heading : font === "display" ? ui.weight.display : ui.weight.body)
  const restingWeight = StyleSheet.flatten(style)?.fontWeight ?? fontWeight
  const numericWeight = Number(restingWeight) || (restingWeight === "bold" ? 700 : 400)
  const accessibleWeight = String(Math.min(900, Math.max(600, numericWeight + 100))) as TextStyle["fontWeight"]
  const foreground = useGlassForeground(StyleSheet.flatten(style)?.color ?? color ?? toneColor(ui, tone))
  return (
    <RNText
      dynamicTypeRamp={dynamicTypeRamp ?? (Platform.OS === "ios" ? TYPE_RAMPS[size] : undefined)}
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? (font === "display" || fontSize >= 31 ? MAX_FONT_SCALE.display : font === "heading" ? MAX_FONT_SCALE.heading : MAX_FONT_SCALE.body)}
      style={[
        {
          color: color ?? toneColor(ui, tone),
          fontSize,
          lineHeight: Math.round(fontSize * (font === "heading" || font === "display" ? ui.type.headingLeading : Math.min(ui.type.leading, 1.5))),
          fontFamily: ui.fonts[font],
          fontWeight,
          letterSpacing: (font === "display" ? ui.type.displayTracking : font === "heading" ? ui.type.headingTracking : ui.type.tracking) * fontSize,
          fontVariant: font === "display" ? ["tabular-nums"] : undefined,
          textAlign: align,
        },
        style,
        bold ? { fontWeight: accessibleWeight } : null,
        { color: foreground },
      ]}
      {...rest}
    />
  )
}
