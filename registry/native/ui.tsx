import * as React from "react"
import { Platform, Text as RNText, type TextProps, type TextStyle } from "react-native"

import { useGlassTheme, type GlassTheme } from "@/components/glass/native/tokens"

/**
 * The React Native port of glasscn's CSS variables (glass-theme.ts TOKENS) as plain
 * numbers and colours. Every ported component reads this through useUI() — no
 * Tailwind, no CSS variables, so it runs the same on iOS, Android and web.
 */

export interface UI extends GlassTheme {
  destructive: string
  destructiveForeground: string
  success: string
  ring: string
  /** Five chart series: accent, the two ring companions, then green and blue. */
  charts: [string, string, string, string, string]
  thumb: string
  separator: string
  muted: string
  radius: { surface: number; control: number; button: number; badge: number }
  /** Control heights (shadcn h-control*) at density 1. */
  control: { xs: number; sm: number; default: number; lg: number }
  pad: { xs: number; sm: number; default: number; lg: number }
  /** Type scale in px, major third from 16. */
  text: { xs: number; sm: number; base: number; lg: number; xl: number; "2xl": number; "3xl": number; "4xl": number; "5xl": number }
  fonts: { sans?: string; heading?: string; display?: string; mono?: string }
  weight: { body: "400"; heading: "700"; display: "700" }
  motion: { duration: number; pressScale: number; spring: { friction: number; tension: number } }
}

const fonts = {
  sans: undefined,
  heading: undefined,
  display: Platform.select({ ios: "ui-rounded", web: 'ui-rounded, "SF Pro Rounded", -apple-system, system-ui, sans-serif', default: undefined }),
  mono: Platform.select({ ios: "Menlo", web: "ui-monospace, Menlo, monospace", default: "monospace" }),
}

export function buildUI(t: GlassTheme): UI {
  const dark = t.scheme === "dark"
  return {
    ...t,
    destructive: dark ? "#FF6961" : "#E5372C",
    destructiveForeground: "#FFFFFF",
    success: dark ? "#4CD08F" : "#23935F",
    ring: t.primary,
    charts: [t.chart[0], t.chart[1], t.chart[2], dark ? "#4CC79A" : "#2E9E73", dark ? "#5AAFE6" : "#2F86C9"],
    thumb: dark ? "rgba(255,255,255,0.2)" : "#FFFFFF",
    separator: dark ? "rgba(255,255,255,0.1)" : "rgba(60,60,67,0.13)",
    muted: dark ? "rgba(235,235,245,0.42)" : "rgba(60,60,67,0.46)",
    radius: { surface: 24, control: 12, button: 999, badge: 999 },
    control: { xs: 28, sm: 32, default: 40, lg: 48 },
    pad: { xs: 10, sm: 12, default: 16, lg: 22 },
    text: { xs: 12, sm: 14, base: 16, lg: 20, xl: 25, "2xl": 31, "3xl": 39, "4xl": 49, "5xl": 61 },
    fonts,
    weight: { body: "400", heading: "700", display: "700" },
    motion: { duration: 200, pressScale: 0.97, spring: { friction: 8, tension: 380 } },
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
export function GText({ size = "base", tone = "default", font = "sans", weight, color, align, style, ...rest }: GTextProps) {
  const ui = useUI()
  const fontSize = ui.text[size]
  const fontWeight = weight ?? (font === "heading" ? ui.weight.heading : font === "display" ? ui.weight.display : ui.weight.body)
  return (
    <RNText
      style={[
        {
          color: color ?? toneColor(ui, tone),
          fontSize,
          lineHeight: Math.round(fontSize * (font === "heading" || font === "display" ? 1.18 : 1.45)),
          fontFamily: ui.fonts[font],
          fontWeight,
          letterSpacing: font === "display" ? -0.03 * fontSize : font === "heading" ? -0.015 * fontSize : 0,
          fontVariant: font === "display" ? ["tabular-nums"] : undefined,
          textAlign: align,
        },
        style,
      ]}
      {...rest}
    />
  )
}
