/**
 * Share-card colours from a real palette. Satori (next/og) has no `oklch()`,
 * so the palette's dark-scheme tokens are converted to hex here.
 */
import { PALETTES, oklchToLinearRgb, parseOklch } from "@/lib/glass-theme"
import type { Group } from "@/lib/docs"

export interface OgColors {
  ground: string
  aurora: [string, string, string]
  primary: string
  ring: string
}

/** Each docs group gets its own palette, so cards are recognisable by section. */
export const GROUP_PALETTE: Record<Group, string> = {
  Surfaces: "dusk",
  Typography: "lavender",
  Controls: "ocean",
  Overlays: "rose",
  Navigation: "lagoon",
  Data: "sage",
  Chat: "amber",
  Blocks: "midnight",
}

const encode = (x: number) => Math.round(255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055))

/** `oklch(…)` → `#rrggbb` (alpha dropped). Non-OKLCH values pass through. */
export function oklchToHex(value: string): string {
  const parsed = parseOklch(value)
  if (!parsed) return value
  return `#${oklchToLinearRgb(parsed)
    .map((c) => encode(c).toString(16).padStart(2, "0"))
    .join("")}`
}

/**
 * A card's colours: the dark scheme's ground, accent and ring, with the light
 * scheme's brighter aurora — the dark one is too dim to read as a glow in a feed.
 */
export function ogColors(palette = "dusk"): OgColors {
  const { light, dark: t } = (PALETTES[palette] ?? PALETTES.dusk).theme
  return {
    ground: oklchToHex(t["aurora-base"]),
    aurora: [oklchToHex(light["aurora-1"]), oklchToHex(light["aurora-2"]), oklchToHex(light["aurora-3"])],
    primary: oklchToHex(t.primary),
    ring: oklchToHex(t["chart-2"] ?? t.primary),
  }
}
