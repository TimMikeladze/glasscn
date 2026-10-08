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

/**
 * Font chains: a theme font if one is set, else the app's own font — baked in at build
 * by Tailwind's --theme(), which falls back to a system stack if the app has none.
 */
export const fontChain = {
  sans: "var(--glass-font-sans, --theme(--font-sans, ui-sans-serif, system-ui, sans-serif))",
  heading: "var(--glass-font-heading, --theme(--font-heading, --theme(--font-sans, ui-sans-serif, system-ui, sans-serif)))",
  display: "var(--glass-font-display, var(--glass-font-heading, --theme(--font-heading, --theme(--font-sans, ui-sans-serif, system-ui, sans-serif))))",
  mono: "var(--glass-font-mono, --theme(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace))",
}

/** A step on the modular scale: 1rem × scale × ratio^n. */
export const step = (n) => `calc(1rem * var(--glass-text-scale) * pow(var(--glass-type-ratio), ${n}))`
const STEPS = [-2, -1, 0, 1, 2, 3, 4, 5, 6]
const stepName = (n) => (n < 0 ? `n${-n}` : String(n))

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
  "@utility font-glass-sans": { "font-family": fontChain.sans },
  "@utility font-glass-heading": { "font-family": fontChain.heading },
  "@utility font-glass-display": { "font-family": fontChain.display },
  "@utility font-glass-mono": { "font-family": fontChain.mono },
  /** Body text: put it on <body> (ThemeScope applies it to its subtree). */
  "@utility type-glass": {
    "font-family": fontChain.sans,
    "line-height": "var(--glass-leading)",
    "letter-spacing": "var(--glass-tracking)",
    "font-weight": "var(--glass-body-weight)",
    "font-feature-settings": "var(--glass-font-features)",
  },
  /** Titles and headings. Pair with a size (type-step-*, text-lg…). */
  "@utility type-glass-heading": {
    "font-family": fontChain.heading,
    "font-weight": "var(--glass-heading-weight)",
    "letter-spacing": "var(--glass-heading-tracking)",
    "line-height": "var(--glass-heading-leading)",
    "text-transform": "var(--glass-heading-case)",
    "text-wrap": "var(--glass-heading-wrap)",
    "font-feature-settings": "var(--glass-font-features)",
  },
  /** Big figures: stats, rings, Display. */
  "@utility type-glass-display": {
    "font-family": fontChain.display,
    "font-weight": "var(--glass-display-weight)",
    "letter-spacing": "var(--glass-display-tracking)",
    "font-variant-numeric": "var(--glass-numeric)",
    "line-height": "1",
  },
  "@utility numeric-glass": { "font-variant-numeric": "var(--glass-numeric)" },
  // The scale. Named type-step-*, not text-step-*: tailwind-merge (cn) reads text-<unknown> as a
  // colour and would silently drop it beside text-muted-foreground.
  ...Object.fromEntries(STEPS.map((n) => [`@utility type-step-${stepName(n)}`, { "font-size": step(n) }])),
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

/** Rich text — shipped by the `prose` item, not the foundation. */
const rim10 = mixed("var(--foreground)", "10%")
export const proseStylesheet = {
  "@utility glass-prose": {
    "font-family": fontChain.sans,
    "font-size": step(0),
    "line-height": "var(--glass-leading)",
    "letter-spacing": "var(--glass-tracking)",
    "font-weight": "var(--glass-body-weight)",
    "font-feature-settings": "var(--glass-font-features)",
    "max-width": "var(--glass-measure)",
    // fill the container up to the measure, never wider — so a long <pre> scrolls instead of widening the column
    width: "100%",
    "min-width": "0",
    "overflow-wrap": "break-word",
    color: "var(--foreground)",
    "& :where(h1, h2, h3, h4, h5, h6)": {
      "font-family": fontChain.heading,
      "font-weight": "var(--glass-heading-weight)",
      "letter-spacing": "var(--glass-heading-tracking)",
      "line-height": "var(--glass-heading-leading)",
      "text-transform": "var(--glass-heading-case)",
      "text-wrap": "var(--glass-heading-wrap)",
      "margin-top": "1.7em",
      "margin-bottom": "0.55em",
    },
    "& :where(h1)": { "font-size": step(4) },
    "& :where(h2)": { "font-size": step(3) },
    "& :where(h3)": { "font-size": step(2) },
    "& :where(h4)": { "font-size": step(1) },
    "& :where(h5, h6)": { "font-size": step(0) },
    "& :where(p, ul, ol, blockquote, pre, table, figure)": { "margin-block": "0.9em" },
    "& :where(a)": {
      color: "var(--primary)",
      "text-decoration-line": "underline",
      "text-underline-offset": "var(--glass-underline-offset)",
      "text-decoration-color": mixed("var(--primary)", "40%"),
    },
    "& :where(a:hover)": { "text-decoration-color": "var(--primary)" },
    "& :where(strong)": { "font-weight": "650" },
    "& :where(ul)": { "list-style-type": "disc", "padding-left": "1.4em" },
    "& :where(ol)": { "list-style-type": "decimal", "padding-left": "1.4em", "font-variant-numeric": "var(--glass-numeric)" },
    "& :where(li)": { "margin-block": "0.3em" },
    "& :where(li)::marker": { color: "var(--primary)" },
    "& :where(blockquote)": {
      "border-left": "3px solid var(--primary)",
      "padding-left": "1em",
      "font-family": fontChain.heading,
      "font-size": step(1),
      "line-height": "var(--glass-heading-leading)",
      color: "var(--muted-foreground)",
    },
    "& :where(code)": {
      "font-family": fontChain.mono,
      "font-size": "0.88em",
      "background-color": mixed("var(--glass-fill-tint)", "var(--glass-fill-opacity)"),
      "border-radius": "calc(var(--glass-radius-control) * 0.5)",
      padding: "0.15em 0.4em",
    },
    "& :where(pre)": {
      "font-family": fontChain.mono,
      "font-size": step(-1),
      "line-height": "1.6",
      "background-color": frost("--glass-opacity-subtle"),
      border: `var(--glass-border-width) solid ${rim}`,
      "border-radius": "var(--glass-radius-control)",
      padding: "1em 1.2em",
      "overflow-x": "auto",
    },
    "& :where(pre code)": { "background-color": "transparent", padding: "0", "font-size": "inherit" },
    "& :where(hr)": { border: "0", "border-top": `1px solid ${rim10}`, "margin-block": "2em" },
    "& :where(table)": { width: "100%", "border-collapse": "collapse", "font-size": step(-1), "font-variant-numeric": "var(--glass-numeric)" },
    "& :where(th, td)": { padding: "0.55em 0.75em", "border-bottom": `1px solid ${rim10}`, "text-align": "left" },
    "& :where(th)": { "font-weight": "600" },
    "& :where(img, video)": { "border-radius": "var(--glass-radius-control)" },
    "& :where(figcaption)": { "font-size": step(-1), color: "var(--muted-foreground)", "margin-top": "0.5em" },
    "& > :first-child": { "margin-top": "0" },
    "& > :last-child": { "margin-bottom": "0" },
  },
}
