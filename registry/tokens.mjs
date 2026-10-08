/**
 * The one source of truth for glasscn's design tokens.
 *
 * `scripts/generate.mjs` turns this into:
 *  - the `cssVars` / `css` of the `glass` foundation item and every `theme-*` item in registry.json
 *  - `src/app/glass.generated.css`, which the docs site imports — so the site always looks like what ships.
 */

/** Glass surface tokens. Light and dark. */
export const glassVars = {
  light: {
    glass: "oklch(1 0 0 / 52%)",
    "glass-strong": "oklch(1 0 0 / 74%)",
    "glass-subtle": "oklch(1 0 0 / 28%)",
    "glass-border": "oklch(1 0 0 / 85%)",
    "glass-highlight": "oklch(1 0 0 / 92%)",
    "glass-shadow": "oklch(0.3 0.05 270 / 12%)",
    "glass-fill": "oklch(0.55 0.01 285 / 12%)",
    "glass-fill-strong": "oklch(0.55 0.01 285 / 20%)",
    "glass-thumb": "oklch(1 0 0)",
    "glass-blur": "28px",
    "glass-saturate": "180%",
    "aurora-base": "oklch(0.955 0.007 268.5)",
  },
  dark: {
    glass: "oklch(0.27 0.012 285 / 42%)",
    "glass-strong": "oklch(0.22 0.012 285 / 72%)",
    "glass-subtle": "oklch(0.3 0.012 285 / 22%)",
    "glass-border": "oklch(1 0 0 / 12%)",
    "glass-highlight": "oklch(1 0 0 / 14%)",
    "glass-shadow": "oklch(0 0 0 / 45%)",
    "glass-fill": "oklch(0.6 0.01 285 / 24%)",
    "glass-fill-strong": "oklch(0.6 0.01 285 / 36%)",
    "glass-thumb": "oklch(1 0 0 / 20%)",
    "glass-blur": "28px",
    "glass-saturate": "180%",
    "aurora-base": "oklch(0.116 0.006 285.4)",
  },
  /** Tailwind colour names, so components write `bg-glass` and `border-glass-border`. */
  theme: {
    "color-glass": "var(--glass)",
    "color-glass-strong": "var(--glass-strong)",
    "color-glass-subtle": "var(--glass-subtle)",
    "color-glass-border": "var(--glass-border)",
    "color-glass-highlight": "var(--glass-highlight)",
    "color-fill": "var(--glass-fill)",
    "color-fill-strong": "var(--glass-fill-strong)",
    "color-glass-thumb": "var(--glass-thumb)",
    "color-aurora-base": "var(--aurora-base)",
    "color-aurora-1": "var(--aurora-1)",
    "color-aurora-2": "var(--aurora-2)",
    "color-aurora-3": "var(--aurora-3)",
  },
}

const backdrop = "blur(var(--glass-blur)) saturate(var(--glass-saturate))"
/**
 * A glass surface. Two hooks make every surface customisable from a class:
 *   --glass-bg         the fill (tints set it, e.g. `[--glass-bg:color-mix(...)]`)
 *   --glass-elevation  the drop shadow (`[--glass-elevation:0_0_#0000]` for a flat pane — `none` is not valid in a shadow list)
 */
const surface = (bg) => ({
  "background-color": `var(--glass-bg, ${bg})`,
  "border-width": "1px",
  "border-style": "solid",
  "border-color": "var(--glass-border)",
  "-webkit-backdrop-filter": backdrop,
  "backdrop-filter": backdrop,
  "box-shadow": "var(--glass-elevation, 0 10px 30px var(--glass-shadow)), inset 0 1px 0 var(--glass-highlight)",
})

/** Utilities, keyframes and fallbacks shipped with the foundation. */
export const glassCss = {
  "@utility glass": surface("var(--glass)"),
  "@utility glass-strong": surface("var(--glass-strong)"),
  "@utility glass-subtle": surface("var(--glass-subtle)"),
  "@keyframes glass-aurora-1": {
    "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
    "50%": { transform: "translate3d(6%, 4%, 0) scale(1.08)" },
  },
  "@keyframes glass-aurora-2": {
    "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
    "50%": { transform: "translate3d(-5%, 6%, 0) scale(1.06)" },
  },
  "@keyframes glass-aurora-3": {
    "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1.04)" },
    "50%": { transform: "translate3d(4%, -6%, 0) scale(1)" },
  },
  "@keyframes glass-draw": {
    from: { "stroke-dashoffset": "var(--glass-draw-from, 1)" },
  },
  "@keyframes glass-fade": {
    from: { opacity: "0" },
  },
  "@keyframes glass-pulse": {
    "0%": { transform: "scale(1)", opacity: "0.7" },
    "100%": { transform: "scale(1.7)", opacity: "0" },
  },
  // No backdrop-filter (old browsers, some WebViews): fall back to the opaque surface.
  "@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))": {
    ":root": { "--glass": "var(--glass-strong)", "--glass-subtle": "var(--glass-strong)" },
  },
  "@media (prefers-reduced-motion: reduce)": {
    "[data-slot=aurora-blob], [data-glass-motion]": { animation: "none !important", transition: "none !important" },
  },
}

/** The palettes. Each becomes a `theme-<name>` item and a site preset. */
export const palettes = {
  dusk: {
    title: "Dusk",
    description: "Coral over violet and peach — the default.",
    light: { primary: "oklch(0.657 0.19 34.8)", aurora: ["oklch(0.829 0.098 37.8)", "oklch(0.809 0.109 296.4)", "oklch(0.907 0.07 70.2)"], rings: ["oklch(0.685 0.189 296.4)", "oklch(0.803 0.159 69.8)"] },
    dark: { primary: "oklch(0.728 0.171 36.5)", aurora: ["oklch(0.48 0.132 31.7)", "oklch(0.401 0.159 289.2)", "oklch(0.456 0.088 60.9)"], rings: ["oklch(0.685 0.189 296.4)", "oklch(0.803 0.159 69.8)"] },
  },
  ocean: {
    title: "Ocean",
    description: "Blue, teal and periwinkle.",
    light: { primary: "oklch(0.583 0.203 259)", aurora: ["oklch(0.817 0.093 256.2)", "oklch(0.899 0.073 185.2)", "oklch(0.828 0.094 291.7)"], rings: ["oklch(0.773 0.127 186.5)", "oklch(0.665 0.187 286.4)"] },
    dark: { primary: "oklch(0.705 0.159 252.4)", aurora: ["oklch(0.389 0.133 260.3)", "oklch(0.442 0.071 205.5)", "oklch(0.36 0.154 280)"], rings: ["oklch(0.773 0.127 186.5)", "oklch(0.665 0.187 286.4)"] },
  },
  rose: {
    title: "Rose",
    description: "Pink over lilac.",
    light: { primary: "oklch(0.618 0.194 9.9)", aurora: ["oklch(0.844 0.092 1.1)", "oklch(0.843 0.106 311.1)", "oklch(0.907 0.051 1.4)"], rings: ["oklch(0.698 0.191 302)", "oklch(0.771 0.143 43.5)"] },
    dark: { primary: "oklch(0.719 0.182 8.2)", aurora: ["oklch(0.431 0.14 4.8)", "oklch(0.407 0.146 306.5)", "oklch(0.339 0.122 309.2)"], rings: ["oklch(0.698 0.191 302)", "oklch(0.771 0.143 43.5)"] },
  },
  sage: {
    title: "Sage",
    description: "Green, lime and sea glass.",
    light: { primary: "oklch(0.589 0.126 157.8)", aurora: ["oklch(0.89 0.071 160.3)", "oklch(0.927 0.098 121.8)", "oklch(0.87 0.057 211.5)"], rings: ["oklch(0.779 0.178 129)", "oklch(0.711 0.118 221.5)"] },
    dark: { primary: "oklch(0.769 0.149 158.2)", aurora: ["oklch(0.456 0.091 159.1)", "oklch(0.47 0.105 130.5)", "oklch(0.432 0.068 211.9)"], rings: ["oklch(0.779 0.178 129)", "oklch(0.711 0.118 221.5)"] },
  },
  amber: {
    title: "Amber",
    description: "Honey, apricot and lemon.",
    light: { primary: "oklch(0.65 0.144 65.8)", aurora: ["oklch(0.901 0.092 79.5)", "oklch(0.849 0.086 40.3)", "oklch(0.953 0.079 95.9)"], rings: ["oklch(0.712 0.183 34)", "oklch(0.823 0.164 94.1)"] },
    dark: { primary: "oklch(0.82 0.152 73.2)", aurora: ["oklch(0.471 0.094 74)", "oklch(0.414 0.106 35.8)", "oklch(0.448 0.085 102.3)"], rings: ["oklch(0.712 0.183 34)", "oklch(0.823 0.164 94.1)"] },
  },
  graphite: {
    title: "Graphite",
    description: "Monochrome — ink on frost.",
    light: { primary: "oklch(0.227 0.004 286.1)", aurora: ["oklch(0.881 0.015 264.5)", "oklch(0.911 0.025 301.1)", "oklch(0.892 0.024 227.8)"], rings: ["oklch(0.589 0.012 286)", "oklch(0.753 0.008 286.2)"] },
    dark: { primary: "oklch(0.963 0.007 286.3)", aurora: ["oklch(0.326 0.02 269.5)", "oklch(0.339 0.032 300)", "oklch(0.315 0.028 236.2)"], rings: ["oklch(0.589 0.012 286)", "oklch(0.753 0.008 286.2)"] },
  },
}

/** A palette as shadcn cssVars: primary, ring, the aurora blobs, and charts 1–3 (accent + the two companions). */
export function paletteVars(p) {
  const scheme = (s, dark) => ({
    primary: s.primary,
    "primary-foreground": dark ? "oklch(0.18 0.02 30)" : "oklch(0.99 0 0)",
    ring: s.primary,
    "aurora-1": s.aurora[0],
    "aurora-2": s.aurora[1],
    "aurora-3": s.aurora[2],
    "chart-1": s.primary,
    "chart-2": s.rings[0],
    "chart-3": s.rings[1],
  })
  const light = scheme(p.light, false)
  const dark = scheme(p.dark, true)
  // graphite's dark primary is near-white: its foreground must be near-black
  if (p.title === "Graphite") dark["primary-foreground"] = "oklch(0.15 0 0)"
  return { light, dark }
}
