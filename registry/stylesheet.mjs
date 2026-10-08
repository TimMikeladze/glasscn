/**
 * The CSS the `glass-style` foundation ships: Tailwind theme tokens and utilities.
 *
 * Every value here is DERIVED from primitives (see src/lib/glass-theme.ts) and is
 * evaluated on the element that uses it — never stored on :root — so overriding a
 * primitive on any element re-themes that subtree. Keep it that way.
 */

const mixed = (colour, amount) => `color-mix(in oklch, ${colour} ${amount}, transparent)`
const frost = (opacity) => mixed("var(--glass-tint)", `var(${opacity})`)
const rim = mixed("var(--glass-border-color)", "var(--glass-border-opacity)")
const highlight = mixed("oklch(1 0 0)", "var(--glass-highlight-opacity)")
const shadow = mixed("var(--glass-shadow-color)", "var(--glass-shadow-opacity)")
const glow = mixed("var(--primary)", "var(--glass-glow)")
const d = (rem) => `calc(${rem}rem * var(--glass-density))`

/** `@theme inline` tokens → Tailwind utilities (bg-glass, rounded-surface, h-control, ease-glass, font-title…). */
export const themeTokens = {
  "color-glass": frost("--glass-opacity"),
  "color-glass-strong": frost("--glass-opacity-strong"),
  "color-glass-subtle": frost("--glass-opacity-subtle"),
  "color-glass-border": rim,
  "color-glass-highlight": highlight,
  "color-glass-shadow": shadow,
  "color-fill": mixed("var(--glass-fill-tint)", "var(--glass-fill-opacity)"),
  "color-fill-strong": mixed("var(--glass-fill-tint)", "var(--glass-fill-opacity-strong)"),
  "color-glass-thumb": "var(--glass-thumb)",
  "color-aurora-base": "var(--aurora-base)",
  "color-aurora-1": "var(--aurora-1)",
  "color-aurora-2": "var(--aurora-2)",
  "color-aurora-3": "var(--aurora-3)",
  "radius-surface": "var(--glass-radius-surface)",
  "radius-surface-sm": "calc(var(--glass-radius-surface) * 0.75)",
  "radius-control": "var(--glass-radius-control)",
  "radius-control-sm": "calc(var(--glass-radius-control) * 0.7)",
  "radius-button": "var(--glass-radius-button)",
  "radius-badge": "var(--glass-radius-badge)",
  "spacing-control-xs": d(1.75),
  "spacing-control-sm": d(2),
  "spacing-control": d(2.5),
  "spacing-control-lg": d(3),
  "spacing-pad-xs": d(0.625),
  "spacing-pad-sm": d(0.875),
  "spacing-pad": d(1.25),
  "spacing-pad-lg": d(1.75),
  "spacing-card": d(1.25),
  "spacing-card-sm": d(1),
  "ease-glass": "var(--glass-ease)",
  "font-weight-title": "var(--glass-heading-weight)",
  "tracking-title": "var(--glass-heading-tracking)",
}

const surface = (opacity) => ({
  "background-color": `var(--glass-bg, ${frost(opacity)})`,
  "background-image": `linear-gradient(var(--glass-sheen-angle), ${mixed("oklch(1 0 0)", "var(--glass-sheen)")}, transparent 55%), var(--glass-texture)`,
  "border-width": "var(--glass-border-width)",
  "border-style": "solid",
  "border-color": rim,
  "-webkit-backdrop-filter": "blur(var(--glass-blur)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness))",
  "backdrop-filter": "blur(var(--glass-blur)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness))",
  "box-shadow": `var(--glass-elevation, 0 var(--glass-shadow-y) var(--glass-shadow-blur) ${shadow}), inset 0 1px 0 ${highlight}, inset 0 0 calc(var(--glass-shadow-blur) * 0.8) ${glow}`,
})

/** Utilities, keyframes and fallbacks. */
export const stylesheet = {
  "@utility glass": surface("--glass-opacity"),
  "@utility glass-strong": surface("--glass-opacity-strong"),
  "@utility glass-subtle": surface("--glass-opacity-subtle"),
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
  // No backdrop-filter (old browsers, some WebViews): panes become nearly opaque.
  "@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))": {
    ".glass, .glass-strong, .glass-subtle": { "--glass-bg": mixed("var(--glass-tint)", "92%") },
  },
  "@media (prefers-reduced-motion: reduce)": {
    "[data-slot=aurora-blob], [data-glass-motion]": { animation: "none !important", transition: "none !important" },
  },
}
