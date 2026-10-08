/**
 * glasscn's theme engine: the schema of every primitive, the presets, a palette
 * generator, and the ways out (CSS, a shadcn registry item, inline style, a share code).
 *
 * Pure TypeScript with erasable syntax only — no React, no DOM — so the registry's
 * build script, the docs site and your app all run the same code.
 */

export type Scheme = "light" | "dark"
export type Tokens = Record<string, string>
export interface GlassTheme {
  light: Tokens
  dark: Tokens
}

export type TokenGroup = "Colour" | "Material" | "Rim" | "Depth" | "Shape" | "Density" | "Motion" | "Aurora" | "Type"

export type TokenControl =
  | { type: "colour" }
  | { type: "range"; min: number; max: number; step: number; unit: string }
  | { type: "select"; options: { label: string; value: string }[] }

export interface TokenDef {
  name: string
  group: TokenGroup
  label: string
  description: string
  light: string
  dark: string
  control: TokenControl
}

const range = (min: number, max: number, step: number, unit: string): TokenControl => ({ type: "range", min, max, step, unit })
const colour: TokenControl = { type: "colour" }

// ---------------------------------------------------------------------------
// textures: fractal-noise grain as base64 SVG (base64 keeps the CSS value inert)
// ---------------------------------------------------------------------------

function toBase64(s: string): string {
  if (typeof btoa === "function") return btoa(s)
  return (globalThis as unknown as { Buffer: { from(s: string): { toString(e: string): string } } }).Buffer.from(s).toString("base64")
}

function grain(frequency: number, alpha: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="${frequency}" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 ${alpha} 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`
  return `url(data:image/svg+xml;base64,${toBase64(svg)})`
}

export const TEXTURES: Record<string, string> = {
  none: "none",
  fine: grain(0.9, 0.18),
  coarse: grain(0.55, 0.28),
  heavy: grain(0.7, 0.45),
}

export const EASINGS: Record<string, string> = {
  spring: "cubic-bezier(0.2, 0.9, 0.3, 1.12)",
  smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
  snappy: "cubic-bezier(0.3, 1.4, 0.5, 1)",
  linear: "linear",
}

// ---------------------------------------------------------------------------
// the schema — every primitive, its defaults and how to edit it
// ---------------------------------------------------------------------------

export const TOKENS: TokenDef[] = [
  // Colour (set by palettes)
  { name: "primary", group: "Colour", label: "Accent", description: "Buttons, selection, rings, the first chart colour.", light: "oklch(0.657 0.19 34.8)", dark: "oklch(0.728 0.171 36.5)", control: colour },
  { name: "primary-foreground", group: "Colour", label: "On accent", description: "Text and icons on the accent.", light: "oklch(0.99 0 0)", dark: "oklch(0.18 0.02 30)", control: colour },
  { name: "ring", group: "Colour", label: "Focus ring", description: "Keyboard focus outlines.", light: "oklch(0.657 0.19 34.8)", dark: "oklch(0.728 0.171 36.5)", control: colour },
  { name: "chart-1", group: "Colour", label: "Chart 1", description: "First data series (rings, sparklines).", light: "oklch(0.657 0.19 34.8)", dark: "oklch(0.728 0.171 36.5)", control: colour },
  { name: "chart-2", group: "Colour", label: "Chart 2", description: "Second data series.", light: "oklch(0.685 0.189 296.4)", dark: "oklch(0.685 0.189 296.4)", control: colour },
  { name: "chart-3", group: "Colour", label: "Chart 3", description: "Third data series.", light: "oklch(0.803 0.159 69.8)", dark: "oklch(0.803 0.159 69.8)", control: colour },
  { name: "chart-4", group: "Colour", label: "Chart 4", description: "Fourth data series.", light: "oklch(0.7 0.14 160)", dark: "oklch(0.75 0.14 160)", control: colour },
  { name: "chart-5", group: "Colour", label: "Chart 5", description: "Fifth data series.", light: "oklch(0.68 0.15 230)", dark: "oklch(0.74 0.14 230)", control: colour },
  { name: "aurora-1", group: "Colour", label: "Aurora 1", description: "Top-left blob.", light: "oklch(0.829 0.098 37.8)", dark: "oklch(0.48 0.132 31.7)", control: colour },
  { name: "aurora-2", group: "Colour", label: "Aurora 2", description: "Right blob.", light: "oklch(0.809 0.109 296.4)", dark: "oklch(0.401 0.159 289.2)", control: colour },
  { name: "aurora-3", group: "Colour", label: "Aurora 3", description: "Bottom blob.", light: "oklch(0.907 0.07 70.2)", dark: "oklch(0.456 0.088 60.9)", control: colour },
  { name: "aurora-base", group: "Colour", label: "Ground", description: "The page colour under the aurora.", light: "oklch(0.955 0.007 268.5)", dark: "oklch(0.116 0.006 285.4)", control: colour },

  // Material
  { name: "glass-tint", group: "Material", label: "Frost colour", description: "The colour of the pane itself.", light: "oklch(1 0 0)", dark: "oklch(0.24 0.012 285)", control: colour },
  { name: "glass-opacity", group: "Material", label: "Frost", description: "How opaque a default pane is.", light: "52%", dark: "45%", control: range(0, 100, 1, "%") },
  { name: "glass-opacity-strong", group: "Material", label: "Frost (strong)", description: "Dialogs, menus, popovers, the header.", light: "74%", dark: "72%", control: range(0, 100, 1, "%") },
  { name: "glass-opacity-subtle", group: "Material", label: "Frost (subtle)", description: "Code blocks, previews, quiet panes.", light: "28%", dark: "24%", control: range(0, 100, 1, "%") },
  { name: "glass-blur", group: "Material", label: "Blur", description: "How much the backdrop is blurred.", light: "28px", dark: "28px", control: range(0, 80, 1, "px") },
  { name: "glass-saturate", group: "Material", label: "Saturation", description: "How vivid the colour behind stays.", light: "180%", dark: "180%", control: range(0, 300, 5, "%") },
  { name: "glass-brightness", group: "Material", label: "Brightness", description: "Lighten or darken what shows through.", light: "100%", dark: "100%", control: range(40, 160, 1, "%") },
  { name: "glass-sheen", group: "Material", label: "Sheen", description: "A specular gradient across the pane.", light: "10%", dark: "5%", control: range(0, 60, 1, "%") },
  { name: "glass-sheen-angle", group: "Material", label: "Sheen angle", description: "Where the light comes from.", light: "160deg", dark: "160deg", control: range(0, 360, 5, "deg") },
  {
    name: "glass-texture",
    group: "Material",
    label: "Grain",
    description: "A noise texture laid over the frost.",
    light: "none",
    dark: "none",
    control: { type: "select", options: Object.entries(TEXTURES).map(([label, value]) => ({ label, value })) },
  },
  { name: "glass-fill-tint", group: "Material", label: "Fill colour", description: "Inputs, tracks, idle pills on glass.", light: "oklch(0.55 0.01 285)", dark: "oklch(0.6 0.01 285)", control: colour },
  { name: "glass-fill-opacity", group: "Material", label: "Fill", description: "How strong control fills are.", light: "12%", dark: "24%", control: range(0, 60, 1, "%") },
  { name: "glass-fill-opacity-strong", group: "Material", label: "Fill (strong)", description: "Hovered and pressed fills, tracks.", light: "20%", dark: "36%", control: range(0, 80, 1, "%") },
  { name: "glass-thumb", group: "Material", label: "Thumb", description: "The raised thumb of segmented controls.", light: "oklch(1 0 0)", dark: "oklch(1 0 0 / 20%)", control: colour },

  // Rim
  { name: "glass-border-color", group: "Rim", label: "Rim colour", description: "The edge around every pane.", light: "oklch(1 0 0)", dark: "oklch(1 0 0)", control: colour },
  { name: "glass-border-opacity", group: "Rim", label: "Rim", description: "How visible the edge is.", light: "85%", dark: "12%", control: range(0, 100, 1, "%") },
  { name: "glass-border-width", group: "Rim", label: "Rim width", description: "Edge thickness.", light: "1px", dark: "1px", control: range(0, 4, 0.5, "px") },
  { name: "glass-highlight-opacity", group: "Rim", label: "Highlight", description: "The inset top edge catching light.", light: "92%", dark: "14%", control: range(0, 100, 1, "%") },

  // Depth
  { name: "glass-shadow-color", group: "Depth", label: "Shadow colour", description: "Colour of the drop shadow.", light: "oklch(0.3 0.05 270)", dark: "oklch(0 0 0)", control: colour },
  { name: "glass-shadow-opacity", group: "Depth", label: "Shadow", description: "Drop shadow strength.", light: "12%", dark: "45%", control: range(0, 80, 1, "%") },
  { name: "glass-shadow-y", group: "Depth", label: "Shadow offset", description: "How far below the pane the shadow falls.", light: "10px", dark: "10px", control: range(0, 60, 1, "px") },
  { name: "glass-shadow-blur", group: "Depth", label: "Shadow blur", description: "How soft the shadow is.", light: "30px", dark: "30px", control: range(0, 120, 1, "px") },
  { name: "glass-glow", group: "Depth", label: "Inner glow", description: "An accent glow inside every pane.", light: "0%", dark: "0%", control: range(0, 80, 1, "%") },

  // Shape
  { name: "glass-radius-surface", group: "Shape", label: "Surface corners", description: "Cards, dialogs, sheets, panes.", light: "1.5rem", dark: "1.5rem", control: range(0, 3, 0.125, "rem") },
  { name: "glass-radius-control", group: "Shape", label: "Control corners", description: "Inputs, menus, segmented controls.", light: "0.75rem", dark: "0.75rem", control: range(0, 2, 0.0625, "rem") },
  { name: "glass-radius-button", group: "Shape", label: "Button corners", description: "Buttons, tabs, the dock. 9999px is a capsule.", light: "9999px", dark: "9999px", control: { type: "select", options: [{ label: "capsule", value: "9999px" }, { label: "2rem", value: "2rem" }, { label: "1rem", value: "1rem" }, { label: "0.75rem", value: "0.75rem" }, { label: "0.5rem", value: "0.5rem" }, { label: "0.25rem", value: "0.25rem" }, { label: "square", value: "0rem" }] } },
  { name: "glass-radius-badge", group: "Shape", label: "Badge corners", description: "Badges and tags.", light: "9999px", dark: "9999px", control: { type: "select", options: [{ label: "capsule", value: "9999px" }, { label: "0.5rem", value: "0.5rem" }, { label: "0.25rem", value: "0.25rem" }, { label: "square", value: "0rem" }] } },

  // Density
  { name: "glass-density", group: "Density", label: "Density", description: "Scales control heights, paddings and card spacing.", light: "1", dark: "1", control: range(0.75, 1.3, 0.01, "") },

  // Motion
  { name: "glass-duration", group: "Motion", label: "Duration", description: "Base transition length.", light: "200ms", dark: "200ms", control: range(0, 800, 10, "ms") },
  { name: "glass-ease", group: "Motion", label: "Easing", description: "The curve every transition follows.", light: EASINGS.spring, dark: EASINGS.spring, control: { type: "select", options: Object.entries(EASINGS).map(([label, value]) => ({ label, value })) } },
  { name: "glass-press-scale", group: "Motion", label: "Press", description: "How far buttons squash when pressed.", light: "0.97", dark: "0.97", control: range(0.85, 1, 0.005, "") },

  // Aurora
  { name: "aurora-opacity", group: "Aurora", label: "Aurora strength", description: "Opacity of the blobs.", light: "100%", dark: "100%", control: range(0, 100, 1, "%") },
  { name: "aurora-scale", group: "Aurora", label: "Aurora size", description: "Blob size multiplier.", light: "1", dark: "1", control: range(0.4, 2, 0.05, "") },
  { name: "aurora-speed", group: "Aurora", label: "Aurora speed", description: "Drift speed multiplier.", light: "1", dark: "1", control: range(0.1, 4, 0.1, "") },
  { name: "aurora-blur", group: "Aurora", label: "Aurora softness", description: "Extra blur on the blobs.", light: "0px", dark: "0px", control: range(0, 120, 2, "px") },

  // Type & focus
  { name: "glass-heading-weight", group: "Type", label: "Title weight", description: "Card, dialog and sheet titles; stat values.", light: "650", dark: "650", control: range(300, 900, 50, "") },
  { name: "glass-heading-tracking", group: "Type", label: "Title tracking", description: "Letter spacing of titles.", light: "-0.015em", dark: "-0.015em", control: range(-0.06, 0.06, 0.005, "em") },
  { name: "glass-ring-width", group: "Type", label: "Focus ring", description: "Keyboard focus ring thickness.", light: "3px", dark: "3px", control: range(0, 6, 0.5, "px") },
]

export const TOKEN_NAMES = TOKENS.map((t) => t.name)
export const GROUPS: TokenGroup[] = ["Colour", "Material", "Rim", "Depth", "Shape", "Density", "Motion", "Aurora", "Type"]

export const defaultTheme = (): GlassTheme => ({
  light: Object.fromEntries(TOKENS.map((t) => [t.name, t.light])),
  dark: Object.fromEntries(TOKENS.map((t) => [t.name, t.dark])),
})

// ---------------------------------------------------------------------------
// palettes
// ---------------------------------------------------------------------------

export type Harmony = "analogous" | "complementary" | "triadic" | "split" | "monochrome"

export interface HueSpec {
  hue: number
  harmony?: Harmony
  /** 0.04 (muted) – 0.26 (vivid). */
  chroma?: number
  /** Tint the ground with the hue (true) or keep it neutral. */
  tintedGround?: boolean
}

const oklch = (l: number, c: number, h: number, a?: number) =>
  `oklch(${round(l, 3)} ${round(c, 3)} ${round(((h % 360) + 360) % 360, 1)}${a === undefined ? "" : ` / ${round(a * 100, 1)}%`})`
const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d

const HARMONY: Record<Harmony, number[]> = {
  analogous: [0, 38, -34],
  complementary: [0, 180, 24],
  triadic: [0, 120, 240],
  split: [0, 150, 210],
  monochrome: [0, 8, -8],
}

/** A whole palette — accent, ring, five chart colours, three aurora blobs and a ground — from one hue. */
export function paletteFromHue({ hue, harmony = "analogous", chroma = 0.17, tintedGround = true }: HueSpec): GlassTheme {
  const [a, b, c] = HARMONY[harmony].map((d) => hue + d)
  const mono = harmony === "monochrome"
  const scheme = (dark: boolean): Tokens => {
    const primary = dark ? oklch(0.74, chroma * 0.92, hue) : oklch(0.6, chroma, hue)
    return {
      primary,
      "primary-foreground": dark ? oklch(0.18, 0.03, hue) : oklch(0.99, 0, 0),
      ring: primary,
      "chart-1": primary,
      "chart-2": oklch(dark ? 0.72 : 0.66, chroma, b + (mono ? 0 : 0)),
      "chart-3": oklch(dark ? 0.82 : 0.78, chroma * 0.85, c),
      "chart-4": oklch(dark ? 0.66 : 0.55, chroma * 0.8, a + 60),
      "chart-5": oklch(dark ? 0.86 : 0.85, chroma * 0.6, a - 60),
      "aurora-1": dark ? oklch(0.44, chroma * 0.78, a) : oklch(mono ? 0.8 : 0.84, chroma * 0.55, a),
      "aurora-2": dark ? oklch(0.38, chroma * 0.9, b) : oklch(mono ? 0.88 : 0.83, chroma * 0.6, b),
      "aurora-3": dark ? oklch(0.42, chroma * 0.6, c) : oklch(mono ? 0.92 : 0.9, chroma * 0.42, c),
      "aurora-base": dark ? oklch(0.12, tintedGround ? 0.012 : 0.006, hue) : oklch(0.955, tintedGround ? 0.012 : 0.007, hue),
    }
  }
  return { light: scheme(false), dark: scheme(true) }
}

export interface PaletteDef {
  title: string
  description: string
  theme: GlassTheme
}

/** Hand-tuned palettes keep their exact colours; the charts they don't set come from their hue. */
function tuned(hue: number, light: { primary: string; aurora: string[]; rings: string[] }, dark: { primary: string; aurora: string[]; rings: string[] }, mono = false): GlassTheme {
  const gen = paletteFromHue({ hue, chroma: mono ? 0.02 : 0.16, tintedGround: false })
  const scheme = (s: typeof light, isDark: boolean, base: Tokens): Tokens => ({
    ...base,
    primary: s.primary,
    ring: s.primary,
    "primary-foreground": isDark ? (mono ? "oklch(0.15 0 0)" : "oklch(0.18 0.02 30)") : "oklch(0.99 0 0)",
    "chart-1": s.primary,
    "chart-2": s.rings[0],
    "chart-3": s.rings[1],
    "aurora-1": s.aurora[0],
    "aurora-2": s.aurora[1],
    "aurora-3": s.aurora[2],
    "aurora-base": isDark ? "oklch(0.116 0.006 285.4)" : "oklch(0.955 0.007 268.5)",
  })
  return { light: scheme(light, false, gen.light), dark: scheme(dark, true, gen.dark) }
}

export const PALETTES: Record<string, PaletteDef> = {
  dusk: {
    title: "Dusk",
    description: "Coral over violet and peach — the default.",
    theme: tuned(
      35,
      { primary: "oklch(0.657 0.19 34.8)", aurora: ["oklch(0.829 0.098 37.8)", "oklch(0.809 0.109 296.4)", "oklch(0.907 0.07 70.2)"], rings: ["oklch(0.685 0.189 296.4)", "oklch(0.803 0.159 69.8)"] },
      { primary: "oklch(0.728 0.171 36.5)", aurora: ["oklch(0.48 0.132 31.7)", "oklch(0.401 0.159 289.2)", "oklch(0.456 0.088 60.9)"], rings: ["oklch(0.685 0.189 296.4)", "oklch(0.803 0.159 69.8)"] }
    ),
  },
  ocean: {
    title: "Ocean",
    description: "Blue, teal and periwinkle.",
    theme: tuned(
      259,
      { primary: "oklch(0.583 0.203 259)", aurora: ["oklch(0.817 0.093 256.2)", "oklch(0.899 0.073 185.2)", "oklch(0.828 0.094 291.7)"], rings: ["oklch(0.773 0.127 186.5)", "oklch(0.665 0.187 286.4)"] },
      { primary: "oklch(0.705 0.159 252.4)", aurora: ["oklch(0.389 0.133 260.3)", "oklch(0.442 0.071 205.5)", "oklch(0.36 0.154 280)"], rings: ["oklch(0.773 0.127 186.5)", "oklch(0.665 0.187 286.4)"] }
    ),
  },
  rose: {
    title: "Rose",
    description: "Pink over lilac.",
    theme: tuned(
      10,
      { primary: "oklch(0.618 0.194 9.9)", aurora: ["oklch(0.844 0.092 1.1)", "oklch(0.843 0.106 311.1)", "oklch(0.907 0.051 1.4)"], rings: ["oklch(0.698 0.191 302)", "oklch(0.771 0.143 43.5)"] },
      { primary: "oklch(0.719 0.182 8.2)", aurora: ["oklch(0.431 0.14 4.8)", "oklch(0.407 0.146 306.5)", "oklch(0.339 0.122 309.2)"], rings: ["oklch(0.698 0.191 302)", "oklch(0.771 0.143 43.5)"] }
    ),
  },
  sage: {
    title: "Sage",
    description: "Green, lime and sea glass.",
    theme: tuned(
      158,
      { primary: "oklch(0.589 0.126 157.8)", aurora: ["oklch(0.89 0.071 160.3)", "oklch(0.927 0.098 121.8)", "oklch(0.87 0.057 211.5)"], rings: ["oklch(0.779 0.178 129)", "oklch(0.711 0.118 221.5)"] },
      { primary: "oklch(0.769 0.149 158.2)", aurora: ["oklch(0.456 0.091 159.1)", "oklch(0.47 0.105 130.5)", "oklch(0.432 0.068 211.9)"], rings: ["oklch(0.779 0.178 129)", "oklch(0.711 0.118 221.5)"] }
    ),
  },
  amber: {
    title: "Amber",
    description: "Honey, apricot and lemon.",
    theme: tuned(
      66,
      { primary: "oklch(0.65 0.144 65.8)", aurora: ["oklch(0.901 0.092 79.5)", "oklch(0.849 0.086 40.3)", "oklch(0.953 0.079 95.9)"], rings: ["oklch(0.712 0.183 34)", "oklch(0.823 0.164 94.1)"] },
      { primary: "oklch(0.82 0.152 73.2)", aurora: ["oklch(0.471 0.094 74)", "oklch(0.414 0.106 35.8)", "oklch(0.448 0.085 102.3)"], rings: ["oklch(0.712 0.183 34)", "oklch(0.823 0.164 94.1)"] }
    ),
  },
  graphite: {
    title: "Graphite",
    description: "Monochrome — ink on frost.",
    theme: tuned(
      286,
      { primary: "oklch(0.227 0.004 286.1)", aurora: ["oklch(0.881 0.015 264.5)", "oklch(0.911 0.025 301.1)", "oklch(0.892 0.024 227.8)"], rings: ["oklch(0.589 0.012 286)", "oklch(0.753 0.008 286.2)"] },
      { primary: "oklch(0.963 0.007 286.3)", aurora: ["oklch(0.326 0.02 269.5)", "oklch(0.339 0.032 300)", "oklch(0.315 0.028 236.2)"], rings: ["oklch(0.589 0.012 286)", "oklch(0.753 0.008 286.2)"] },
      true
    ),
  },
  lavender: { title: "Lavender", description: "Soft violet with lilac and periwinkle.", theme: paletteFromHue({ hue: 300, harmony: "analogous", chroma: 0.15 }) },
  mint: { title: "Mint", description: "Fresh green against blue sky.", theme: paletteFromHue({ hue: 165, harmony: "split", chroma: 0.13 }) },
  cherry: { title: "Cherry", description: "Red with a cool complement.", theme: paletteFromHue({ hue: 22, harmony: "complementary", chroma: 0.2 }) },
  lagoon: { title: "Lagoon", description: "Teal, aqua and deep blue.", theme: paletteFromHue({ hue: 200, harmony: "analogous", chroma: 0.14 }) },
  sand: { title: "Sand", description: "Warm neutrals, barely tinted.", theme: paletteFromHue({ hue: 70, harmony: "monochrome", chroma: 0.07 }) },
  midnight: { title: "Midnight", description: "Indigo, magenta and cyan — made for dark.", theme: paletteFromHue({ hue: 275, harmony: "triadic", chroma: 0.19 }) },
}

// ---------------------------------------------------------------------------
// materials, shapes, motion, density — partial themes that compose
// ---------------------------------------------------------------------------

export interface PresetDef {
  title: string
  description: string
  /** Tokens for both schemes. */
  tokens?: Tokens
  light?: Tokens
  dark?: Tokens
}

export const MATERIALS: Record<string, PresetDef> = {
  frosted: { title: "Frosted", description: "Soft frost, a light rim — the default." },
  liquid: {
    title: "Liquid",
    description: "Clear and vivid: little frost, strong saturation, a bright sheen.",
    tokens: { "glass-blur": "16px", "glass-saturate": "240%", "glass-sheen": "22%", "glass-sheen-angle": "135deg" },
    light: { "glass-opacity": "28%", "glass-opacity-strong": "55%", "glass-opacity-subtle": "14%" },
    dark: { "glass-opacity": "26%", "glass-opacity-strong": "55%", "glass-opacity-subtle": "12%", "glass-sheen": "10%" },
  },
  crystal: {
    title: "Crystal",
    description: "Little blur, a crisp double-strength rim and a hard highlight.",
    tokens: { "glass-blur": "10px", "glass-saturate": "150%", "glass-border-width": "1.5px", "glass-sheen": "16%", "glass-sheen-angle": "120deg" },
    light: { "glass-opacity": "38%", "glass-border-opacity": "100%", "glass-highlight-opacity": "100%" },
    dark: { "glass-opacity": "34%", "glass-border-opacity": "28%", "glass-highlight-opacity": "30%" },
  },
  smoked: {
    title: "Smoked",
    description: "Dark tinted glass in both schemes.",
    tokens: { "glass-tint": "oklch(0.2 0.01 270)", "glass-blur": "30px", "glass-saturate": "140%", "glass-brightness": "85%", "glass-border-color": "oklch(1 0 0)", "glass-sheen": "6%" },
    light: { "glass-opacity": "58%", "glass-opacity-strong": "82%", "glass-opacity-subtle": "40%", "glass-border-opacity": "16%", "glass-highlight-opacity": "18%", "glass-shadow-opacity": "30%" },
    dark: { "glass-opacity": "60%", "glass-opacity-strong": "84%" },
  },
  matte: {
    title: "Matte",
    description: "No blur at all — opaque panes. The fastest option on slow devices.",
    tokens: { "glass-blur": "0px", "glass-saturate": "100%", "glass-sheen": "0%" },
    light: { "glass-opacity": "90%", "glass-opacity-strong": "96%", "glass-opacity-subtle": "75%" },
    dark: { "glass-opacity": "90%", "glass-opacity-strong": "96%", "glass-opacity-subtle": "75%" },
  },
  vapor: {
    title: "Vapor",
    description: "Heavy, misty blur with almost no edge.",
    tokens: { "glass-blur": "56px", "glass-saturate": "200%", "glass-sheen": "0%", "glass-shadow-blur": "60px" },
    light: { "glass-opacity": "40%", "glass-border-opacity": "35%", "glass-highlight-opacity": "50%" },
    dark: { "glass-opacity": "35%", "glass-border-opacity": "6%", "glass-highlight-opacity": "8%" },
  },
  neon: {
    title: "Neon",
    description: "Dark frost lit from inside by the accent.",
    tokens: { "glass-glow": "38%", "glass-blur": "24px", "glass-saturate": "220%", "glass-sheen": "8%" },
    light: { "glass-opacity": "48%", "glass-border-opacity": "70%" },
    dark: { "glass-opacity": "40%", "glass-border-opacity": "22%" },
  },
}

export const SHAPES: Record<string, PresetDef> = {
  round: { title: "Round", description: "Capsule buttons, generous corners — the default." },
  soft: { title: "Soft", description: "Rounded rectangles everywhere.", tokens: { "glass-radius-surface": "1rem", "glass-radius-control": "0.625rem", "glass-radius-button": "0.75rem", "glass-radius-badge": "0.5rem" } },
  sharp: { title: "Sharp", description: "Tight corners, still not square.", tokens: { "glass-radius-surface": "0.5rem", "glass-radius-control": "0.375rem", "glass-radius-button": "0.375rem", "glass-radius-badge": "0.25rem" } },
  square: { title: "Square", description: "No rounding at all.", tokens: { "glass-radius-surface": "0rem", "glass-radius-control": "0rem", "glass-radius-button": "0rem", "glass-radius-badge": "0rem" } },
}

export const MOTIONS: Record<string, PresetDef> = {
  spring: { title: "Spring", description: "A little overshoot — the default." },
  smooth: { title: "Smooth", description: "Material-style easing, no overshoot.", tokens: { "glass-ease": EASINGS.smooth, "glass-duration": "220ms", "glass-press-scale": "0.98" } },
  snappy: { title: "Snappy", description: "Quick with a bounce.", tokens: { "glass-ease": EASINGS.snappy, "glass-duration": "160ms", "glass-press-scale": "0.94" } },
  still: { title: "Still", description: "No transitions, no press squash, a frozen aurora.", tokens: { "glass-duration": "0ms", "glass-press-scale": "1", "aurora-speed": "0.0001" } },
}

export const DENSITIES: Record<string, number> = { compact: 0.85, default: 1, comfortable: 1.15 }

// ---------------------------------------------------------------------------
// composition
// ---------------------------------------------------------------------------

export interface CreateThemeOptions {
  palette?: keyof typeof PALETTES | string | HueSpec
  material?: keyof typeof MATERIALS | string
  shape?: keyof typeof SHAPES | string
  motion?: keyof typeof MOTIONS | string
  density?: number | keyof typeof DENSITIES
  /** Overrides for both schemes. */
  tokens?: Tokens
  light?: Tokens
  dark?: Tokens
}

const applyPreset = (t: GlassTheme, p?: PresetDef) => {
  if (!p) return
  Object.assign(t.light, p.tokens, p.light)
  Object.assign(t.dark, p.tokens, p.dark)
}

/** Defaults, then palette, material, shape, motion, density, then your overrides — later wins. */
export function createGlassTheme(options: CreateThemeOptions = {}): GlassTheme {
  const theme = defaultTheme()
  const palette = typeof options.palette === "object" ? paletteFromHue(options.palette) : PALETTES[options.palette ?? "dusk"]?.theme
  if (palette) {
    Object.assign(theme.light, palette.light)
    Object.assign(theme.dark, palette.dark)
  }
  applyPreset(theme, MATERIALS[options.material ?? "frosted"])
  applyPreset(theme, SHAPES[options.shape ?? "round"])
  applyPreset(theme, MOTIONS[options.motion ?? "spring"])
  if (options.density !== undefined) {
    const d = typeof options.density === "number" ? options.density : DENSITIES[options.density] ?? 1
    theme.light["glass-density"] = theme.dark["glass-density"] = String(d)
  }
  Object.assign(theme.light, options.tokens, options.light)
  Object.assign(theme.dark, options.tokens, options.dark)
  return theme
}

// ---------------------------------------------------------------------------
// safety: every value is checked before it becomes CSS
// ---------------------------------------------------------------------------

const SAFE = /^[a-z0-9\s.%(),#/+*-]*$/i
const SAFE_URL = /^url\(data:image\/svg\+xml;base64,[a-z0-9+/=]+\)$/i

/** A token value that is safe to write into a stylesheet, or null. Blocks `;`, braces, quotes, `<`, `\` and anything but inert URLs. */
export function sanitizeValue(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null
  const v = String(value).trim()
  if (!v || v.length > 4000) return null
  if (SAFE_URL.test(v)) return v
  return SAFE.test(v) ? v : null
}

/** Keep only known tokens with safe values. */
const EXTRA_NAMES = ["foreground", "card-foreground", "popover-foreground", "muted-foreground", "background"]

export function sanitizeTokens(tokens: Record<string, unknown>): Tokens {
  const out: Tokens = {}
  for (const name of [...TOKEN_NAMES, ...EXTRA_NAMES]) {
    if (!(name in tokens)) continue
    const v = sanitizeValue(tokens[name])
    if (v !== null) out[name] = v
  }
  return out
}

// ---------------------------------------------------------------------------
// the ways out
// ---------------------------------------------------------------------------

const declarations = (tokens: Tokens, indent = "  ") =>
  Object.entries(sanitizeTokens(tokens))
    .map(([k, v]) => `${indent}--${k}: ${v};`)
    .join("\n")

/** The theme as CSS. Pass `only` to emit just the tokens that differ from another theme (e.g. the default). */
export function themeToCss(theme: GlassTheme, { selector = ":root", darkSelector = ".dark", only }: { selector?: string; darkSelector?: string; only?: GlassTheme } = {}): string {
  const diff = (s: Scheme) => (only ? Object.fromEntries(Object.entries(theme[s]).filter(([k, v]) => only[s][k] !== v)) : theme[s])
  const light = declarations(diff("light"))
  const dark = declarations(diff("dark"))
  return [light ? `${selector} {\n${light}\n}` : "", dark ? `${darkSelector} {\n${dark}\n}` : ""].filter(Boolean).join("\n\n")
}

/** CSS variables for a `style` prop. */
export function themeVars(theme: GlassTheme, scheme: Scheme): Record<string, string> {
  return Object.fromEntries(Object.entries(sanitizeTokens(theme[scheme])).map(([k, v]) => [`--${k}`, v]))
}

/** A shadcn `registry:theme` item: host it, or save it and run `shadcn add ./my-theme.json`. */
export function themeToRegistryItem(theme: GlassTheme, name = "glass-custom-theme", title = "Custom glass theme") {
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name,
    type: "registry:theme",
    title,
    description: "Made in the glasscn Theme Studio.",
    cssVars: { light: sanitizeTokens(theme.light), dark: sanitizeTokens(theme.dark) },
  }
}

/** The tokens that differ from the default, for a short share code. */
export function themeDiff(theme: GlassTheme, base: GlassTheme = defaultTheme()): { l: Tokens; d: Tokens } {
  const pick = (s: Scheme) => Object.fromEntries(Object.entries(theme[s]).filter(([k, v]) => base[s][k] !== v))
  return { l: pick("light"), d: pick("dark") }
}

const b64url = {
  encode: (s: string) => {
    let binary = ""
    for (const byte of new TextEncoder().encode(s)) binary += String.fromCharCode(byte)
    return toBase64(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  },
  decode: (s: string) => {
    const b = s.replace(/-/g, "+").replace(/_/g, "/")
    const raw = typeof atob === "function" ? atob(b) : (globalThis as unknown as { Buffer: { from(s: string, e: string): { toString(e: string): string } } }).Buffer.from(b, "base64").toString("binary")
    return new TextDecoder().decode(Uint8Array.from(raw, (ch) => ch.charCodeAt(0)))
  },
}

/** A compact, URL-safe code for a theme (only what differs from the default). */
export function encodeTheme(theme: GlassTheme): string {
  return b64url.encode(JSON.stringify(themeDiff(theme)))
}

/** The theme a share code describes — unknown tokens and unsafe values are dropped. Null if unreadable. */
export function decodeTheme(code: string): GlassTheme | null {
  try {
    const raw = JSON.parse(b64url.decode(code)) as { l?: Record<string, unknown>; d?: Record<string, unknown> }
    if (!raw || typeof raw !== "object") return null
    const base = defaultTheme()
    return { light: { ...base.light, ...sanitizeTokens(raw.l ?? {}) }, dark: { ...base.dark, ...sanitizeTokens(raw.d ?? {}) } }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// legibility: an estimate of text contrast on the frost over the aurora
// ---------------------------------------------------------------------------

/** Parse `oklch(L C H [/ A%])` → [L, C, H, A]. */
export function parseOklch(value: string): [number, number, number, number] | null {
  const m = value.trim().match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+)(%?))?\s*\)$/i)
  if (!m) return null
  const l = Number(m[1]) / (m[2] ? 100 : 1)
  const a = m[5] === undefined ? 1 : Number(m[5]) / (m[6] ? 100 : 1)
  return [l, Number(m[3]), Number(m[4]), a]
}

/** OKLCH → linear sRGB, clamped. */
export function oklchToLinearRgb([l, c, h]: [number, number, number, number]): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  const clamp = (x: number) => Math.min(1, Math.max(0, x))
  return [
    clamp(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
    clamp(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
    clamp(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
  ]
}

const luminance = ([r, g, b]: [number, number, number]) => 0.2126 * r + 0.7152 * g + 0.0722 * b
const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
const mix = (top: [number, number, number], bottom: [number, number, number], alpha: number): [number, number, number] =>
  [0, 1, 2].map((i) => top[i] * alpha + bottom[i] * (1 - alpha)) as [number, number, number]

/** shadcn's default foregrounds — what text on glass actually uses. */
const FOREGROUND: Record<Scheme, string> = { light: "oklch(0.145 0 0)", dark: "oklch(0.985 0 0)" }

/**
 * The worst-case text contrast on a default pane: the frost composited over the
 * ground and each aurora blob. A rough guide (blur averages the backdrop), not WCAG proof.
 */
export function legibility(theme: GlassTheme, scheme: Scheme): { ratio: number; level: "AAA" | "AA" | "low" } {
  const t = theme[scheme]
  const rgb = (v: string | undefined) => {
    const p = v ? parseOklch(v) : null
    return p ? { rgb: oklchToLinearRgb(p), a: p[3] } : null
  }
  const tint = rgb(t["glass-tint"]) ?? { rgb: [1, 1, 1] as [number, number, number], a: 1 }
  const opacity = (parseFloat(t["glass-opacity"] ?? "50") / 100) * tint.a
  const text = rgb(FOREGROUND[scheme])!.rgb
  const behind = ["aurora-base", "aurora-1", "aurora-2", "aurora-3"].map((k) => rgb(t[k])).filter(Boolean) as { rgb: [number, number, number]; a: number }[]
  const ratios = behind.map((b) => contrast(luminance(text), luminance(mix(tint.rgb, b.rgb, opacity))))
  const ratio = round(Math.min(...ratios, 21), 2)
  return { ratio, level: ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "low" }
}

/** A random but tasteful theme: any hue, any harmony, any material and shape. */
export function randomTheme(seed = Math.random()): GlassTheme {
  let s = Math.floor(seed * 2 ** 31) || 1
  const next = () => ((s = (s * 48271) % 2147483647) / 2147483647)
  const pick = <T,>(xs: T[]) => xs[Math.floor(next() * xs.length)]
  return createGlassTheme({
    palette: { hue: Math.round(next() * 360), harmony: pick<Harmony>(["analogous", "complementary", "triadic", "split", "monochrome"]), chroma: round(0.08 + next() * 0.16, 3) },
    material: pick(Object.keys(MATERIALS)),
    shape: pick(Object.keys(SHAPES)),
    motion: pick(["spring", "smooth", "snappy"]),
    density: round(0.85 + next() * 0.3, 2),
  })
}
