import * as React from "react"
import { Platform, Text as RNText, type TextProps, type TextStyle } from "react-native"

import { MAX_FONT_SCALE } from "@/components/glass/native/a11y"
import { useGlassTheme, type GlassTheme } from "@/components/glass/native/tokens"

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
    text: { xs: Math.round(12 * t.type.scale), sm: step(-1) < 14 ? Math.round(14 * t.type.scale) : step(-1), base: step(0), lg: step(1), xl: step(2), "2xl": step(3), "3xl": step(4), "4xl": step(5), "5xl": step(6) },
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


export type TextSize = keyof UI["text"]
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
export function GText({ size = "base", tone = "default", font = "sans", weight, color, align, style, maxFontSizeMultiplier, ...rest }: GTextProps) {
  const ui = useUI()
  const fontSize = ui.text[size]
  const fontWeight = weight ?? (font === "heading" ? ui.weight.heading : font === "display" ? ui.weight.display : ui.weight.body)
  return (
    <RNText
      // big type grows less under large Dynamic Type (NAT-23)
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
      ]}
      {...rest}
    />
  )
}
