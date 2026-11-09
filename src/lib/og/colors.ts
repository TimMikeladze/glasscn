/**
 * Share-card colours from the `system` palette. Satori (next/og) has no `oklch()`,
 * so the dark-scheme tokens are converted to hex here.
 */
import { PALETTES, oklchToLinearRgb, parseOklch } from "@/lib/glass-theme"

export interface OgColors {
  /** Apple's web blue. */
  accent: string
  green: string
  orange: string
  purple: string
  pink: string
  indigo: string
  teal: string
  red: string
}

const encode = (x: number) => Math.round(255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055))

/** `oklch(…)` → `#rrggbb` (alpha dropped). Non-OKLCH values pass through. */
export function oklchToHex(value: string): string {
  const parsed = parseOklch(value)
  if (!parsed) return value
  return `#${oklchToLinearRgb(parsed)
    .map((c) => encode(Math.min(1, Math.max(0, c))).toString(16).padStart(2, "0"))
    .join("")}`
}

export function ogColors(): OgColors {
  const t = PALETTES.system.theme.dark
  return {
    accent: oklchToHex(t.primary),
    green: oklchToHex(t["chart-2"]),
    orange: oklchToHex(t["chart-3"]),
    purple: oklchToHex(t["chart-4"]),
    pink: oklchToHex(t["chart-5"]),
    indigo: oklchToHex(t["chart-6"]),
    teal: oklchToHex(t["chart-7"]),
    // palettes carry no destructive token; this is iOS systemRed (dark)
    red: "#ff453a",
  }
}
