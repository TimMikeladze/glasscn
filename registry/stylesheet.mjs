/**
 * The CSS the `glass-style` foundation ships: Tailwind theme tokens and utilities.
 *
 * Every value here is DERIVED from primitives (see src/lib/glass-theme.ts) and is
 * evaluated on the element that uses it — never stored on :root — so overriding a
 * primitive on any element re-themes that subtree. Keep it that way.
 */

const mixed = (colour, amount) => `color-mix(in oklch, ${colour} ${amount}, transparent)`
// --glass-tinted is the tint variant's hook (a colour mixed into the frost); it must not be
// --glass-tint itself — a custom property that references itself is invalid and turns the pane clear.
// --glass-clarity (0 ultra clear … 0.5 as designed … 1 fully tinted) scales every frost, like iOS 27's slider
const clarity = (o) => `calc(var(${o}) * min(1, var(--glass-clarity) * 2) + (100% - var(${o})) * max(0, var(--glass-clarity) * 2 - 1))`
const frost = (opacity) => mixed("var(--glass-tinted, var(--glass-tint))", clarity(opacity))
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
  display: "var(--glass-font-display, --theme(--font-display, var(--glass-font-heading, --theme(--font-heading, --theme(--font-sans, ui-sans-serif, system-ui, sans-serif)))))",
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
  "color-glass-knob": "var(--glass-knob)",
  "color-glass-label": "var(--glass-label)",
  "color-glass-label-secondary": "var(--glass-label-secondary)",
  "color-glass-label-tertiary": "var(--glass-label-tertiary)",
  "color-glass-label-quaternary": "var(--glass-label-quaternary)",
  "color-separator": mixed("var(--glass-label)", "var(--glass-separator-opacity)"),
  "color-fill-subtle": mixed("var(--glass-fill-tint)", "calc(var(--glass-fill-opacity) * 0.66)"),
  "color-fill-faint": mixed("var(--glass-fill-tint)", "calc(var(--glass-fill-opacity) * 0.4)"),
  "color-success": "var(--success)",
  "color-success-foreground": "var(--success-foreground)",
  "color-success-ink": "color-mix(in oklch, var(--success) 68%, var(--glass-label))",
  "color-warning": "var(--warning)",
  "color-warning-foreground": "var(--warning-foreground)",
  "color-warning-ink": "color-mix(in oklch, var(--warning) 55%, var(--glass-label))",
  "color-info": "var(--info)",
  "color-info-foreground": "var(--info-foreground)",
  "color-info-ink": "color-mix(in oklch, var(--info) 68%, var(--glass-label))",
  // accent-coloured text on a tint of itself (tinted badges and buttons, links): the accent pulled
  // toward the label colour, so it stays readable on its own 16–22% fill in both schemes
  "color-primary-ink": "color-mix(in oklch, var(--primary) 68%, var(--glass-label))",
  "color-destructive-ink": "color-mix(in oklch, var(--destructive) 68%, var(--glass-label))",
  "color-glass-dim": mixed("oklch(0 0 0)", "var(--glass-dim)"),
  "shadow-glass-knob": `0 3px 8px ${mixed("var(--glass-shadow-color)", "calc(var(--glass-shadow-opacity) + 8%)")}, 0 1px 2px ${mixed("var(--glass-shadow-color)", "calc(var(--glass-shadow-opacity) + 4%)")}`,
  "shadow-glass-accent": `0 8px 22px ${mixed("var(--primary)", "32%")}, inset 0 1px 0 ${mixed("oklch(1 0 0)", "30%")}`,
  "color-aurora-base": "var(--aurora-base)",
  "color-aurora-1": "var(--aurora-1)",
  "color-aurora-2": "var(--aurora-2)",
  "color-aurora-3": "var(--aurora-3)",
  "radius-surface": "var(--glass-radius-surface)",
  "radius-surface-sm": "calc(var(--glass-radius-surface) * 0.75)",
  "radius-control": "var(--glass-radius-control)",
  "radius-control-sm": "calc(var(--glass-radius-control) * 0.7)",
  "radius-control-xs": "calc(var(--glass-radius-control) * 0.5)",
  "radius-button": "var(--glass-radius-button)",
  "radius-badge": "var(--glass-radius-badge)",
  "spacing-control-2xs": d(1.5),
  "spacing-knob": d(1.5),
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
  ...Object.fromEntries(
    [0.3, 0.6, 1, 1.6].map((k, i) => [`shadow-glass-${i + 1}`, `0 calc(var(--glass-shadow-y) * ${k}) calc(var(--glass-shadow-blur) * ${k}) ${shadow}`])
  ),
  "font-weight-title": "var(--glass-heading-weight)",
  "tracking-title": "var(--glass-heading-tracking)",
}

const materialFilter = "blur(var(--glass-blur)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness))"
const liquidFilter = "blur(var(--glass-liquid-blur)) saturate(var(--glass-liquid-saturate)) brightness(var(--glass-brightness))"
const surface = (opacity, filter = materialFilter) => ({
  // text inside a pane uses the material's own label colours (a smoked pane in a light theme
  // needs light text), remapping shadcn's foreground tokens for everything inside it
  color: "var(--glass-label)",
  "--foreground": "var(--glass-label)",
  "--card-foreground": "var(--glass-label)",
  "--popover-foreground": "var(--glass-label)",
  "--muted-foreground": "var(--glass-label-secondary)",
  "background-color": `var(--glass-bg, ${frost(opacity)})`,
  "background-image": `linear-gradient(var(--glass-sheen-angle), ${mixed("oklch(1 0 0)", "var(--glass-sheen)")}, transparent 55%), var(--glass-texture)`,
  "border-width": "var(--glass-border-width)",
  "border-style": "solid",
  "border-color": rim,
  "-webkit-backdrop-filter": filter,
  "backdrop-filter": filter,
  "box-shadow": `var(--glass-elevation, 0 var(--glass-shadow-y) var(--glass-shadow-blur) ${shadow}), inset 0 1px 0 ${highlight}, inset 0 0 calc(var(--glass-shadow-blur) * 0.8) ${glow}`,
})

/**
 * The data-* variants components use (data-open:, data-checked:…). shadcn's own
 * `shadcn/tailwind.css` defines the same ones; repeating a @custom-variant is harmless,
 * and shipping them here means components work in apps that never imported it.
 */
const dataVariant = (name, state) => [
  `@custom-variant data-${name} (&:where([data-state="${state}"]), &:where([data-${name}]:not([data-${name}="false"])))`,
  {},
]
/**
 * `dark:` that respects a forced-light ThemeScope inside a dark page (and a forced-dark one inside a
 * light page), exact to three nesting levels. Must match DARK_SCHEME in theme-scope.tsx (tested).
 * Ships after shadcn's own `dark` variant in globals.css, and Tailwind uses the last definition.
 */
export const DARK = ":is(.dark, .dark *):not(:where(.dark .light, .dark .light *):not(:where(.dark .light .dark, .dark .light .dark *)))"

export const customVariants = Object.fromEntries([
  [`@custom-variant dark (&${DARK})`, {}],
  dataVariant("open", "open"),
  dataVariant("closed", "closed"),
  dataVariant("checked", "checked"),
  dataVariant("unchecked", "unchecked"),
  dataVariant("selected", "selected"),
  dataVariant("active", "active"),
  [`@custom-variant data-disabled (&:where([data-disabled]:not([data-disabled="false"])))`, {}],
  [`@custom-variant data-horizontal (&:where([data-orientation="horizontal"]))`, {}],
  [`@custom-variant data-vertical (&:where([data-orientation="vertical"]))`, {}],
])

/** Clear liquid glass: over media only, a dim beneath, bright text on top. */
const clearSurface = () => {
  const base = surface("--glass-liquid-clear-opacity", liquidFilter)
  return {
    ...base,
    color: "oklch(0.985 0 0)",
    "--foreground": "oklch(0.985 0 0)",
    "--card-foreground": "oklch(0.985 0 0)",
    "--popover-foreground": "oklch(0.985 0 0)",
    "--muted-foreground": "oklch(0.9 0 0)",
    "background-image": `linear-gradient(${mixed("oklch(0 0 0)", "var(--glass-liquid-clear-dim)")}, ${mixed("oklch(0 0 0)", "var(--glass-liquid-clear-dim)")}), ${base["background-image"]}`,
  }
}

/** Apple's text styles (iOS Dynamic Type at the default size), scaled by --glass-text-scale. */
const textStyle = (px, leading, weight, heading = false) => ({
  "font-family": heading ? fontChain.heading : fontChain.sans,
  "font-size": `calc(${px / 16}rem * var(--glass-text-scale))`,
  "line-height": String(Math.round((leading / px) * 1000) / 1000),
  "font-weight": String(weight),
})
const TEXT_STYLES = {
  "large-title": [34, 41, 400, true],
  "title-1": [28, 34, 400, true],
  "title-2": [22, 28, 400, true],
  "title-3": [20, 25, 400, true],
  headline: [17, 22, 600],
  body: [17, 22, 400],
  callout: [16, 21, 400],
  subheadline: [15, 20, 400],
  footnote: [13, 18, 400],
  "caption-1": [12, 16, 400],
  "caption-2": [11, 13, 400],
}

const focusOutline = { outline: "var(--glass-ring-width) solid var(--ring)" }
const panes = ".glass, .glass-strong, .glass-subtle, .glass-liquid, .glass-liquid-clear"
const scopes = ":root, [data-glass-scope]"
const darkScopes = `:is(:root, [data-glass-scope])${DARK}`
const important = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, `${v} !important`]))

/** Utilities, keyframes and fallbacks. */
export const stylesheet = {
  ...customVariants,
  /** The content material (Apple's standard materials): cards, panes, in-flow surfaces. */
  "@utility glass": surface("--glass-opacity"),
  "@utility glass-strong": surface("--glass-opacity-strong"),
  "@utility glass-subtle": surface("--glass-opacity-subtle"),
  /** Liquid glass (regular): the control layer — toolbars, the dock, floating buttons, menus, sheets. */
  "@utility glass-liquid": surface("--glass-liquid-opacity", liquidFilter),
  /** Liquid glass (clear): over photos and video only; dims what's behind, text on it is bright. */
  "@utility glass-liquid-clear": clearSurface(),
  /** Keyboard focus as an outline: survives forced colours, follows the corner radius, never fights a pane's shadow. */
  "@utility glass-focus": { "&:focus-visible": { ...focusOutline, "outline-offset": "2px" } },
  /** Focus drawn inside the element — rows and cells that sit flush in a list. */
  "@utility glass-focus-inset": { "&:focus-visible": { ...focusOutline, "outline-offset": "calc(var(--glass-ring-width) * -1)" } },
  /** A tap area of at least 24px (fine pointers) or --glass-hit-min (touch), without changing the layout. */
  "@utility hit-area": {
    position: "relative",
    "&::after": { content: '""', position: "absolute", top: "50%", left: "50%", width: "max(100%, 24px)", height: "max(100%, 24px)", translate: "-50% -50%" },
  },
  // top-level, not nested in the utility: the shadcn CLI mangles an @media nested inside @utility
  "@media (pointer: coarse)": { ".hit-area::after": { width: "max(100%, var(--glass-hit-min))", height: "max(100%, var(--glass-hit-min))" } },
  /** A radius concentric with its container (container radius − padding), never below a minimum. Containers set --glass-container-radius / --glass-container-pad. */
  "@utility rounded-concentric": {
    "border-radius": "max(min(var(--glass-concentric-min, 0.25rem), var(--glass-container-radius, var(--glass-radius-control))), calc(var(--glass-container-radius, var(--glass-radius-control)) - var(--glass-container-pad, 0.25rem)))",
  },
  ...Object.fromEntries(Object.entries(TEXT_STYLES).map(([name, [px, leading, weight, heading]]) => [`@utility type-${name}`, textStyle(px, leading, weight, heading)])),
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
  "@keyframes glass-grow": {
    from: { transform: "scaleX(0)" },
  },
  "@keyframes glass-pulse": {
    "0%": { transform: "scale(1)", opacity: "0.7" },
    "100%": { transform: "scale(1.7)", opacity: "0" },
  },
  // Chat's typing dots — the one looping animation besides the aurora; stilled by reduced motion.
  "@keyframes glass-typing": {
    "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.45" },
    "30%": { transform: "translateY(-0.25rem)", opacity: "1" },
  },
  // No backdrop-filter (old browsers, some WebViews): panes become nearly opaque.
  "@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))": {
    [panes]: { "--glass-bg": mixed("var(--glass-tint)", "92%") },
  },
  // Accessibility settings override primitives (so they win over themes, scopes and per-element
  // overrides) — Apple: Reduce Transparency makes glass frostier; Increase Contrast makes it
  // predominantly opaque with a contrasting border; Reduce Motion removes elasticity.
  "@media (prefers-reduced-motion: reduce)": {
    "[data-slot=aurora-blob], [data-glass-motion]": { animation: "none !important", transition: "none !important" },
    [scopes]: important({ "--glass-duration": "0ms", "--glass-press-scale": "1", "--glass-ease": "linear" }),
  },
  "@media (prefers-reduced-transparency: reduce)": {
    [scopes]: important({
      "--glass-opacity": "90%", "--glass-opacity-strong": "96%", "--glass-opacity-subtle": "84%",
      "--glass-liquid-opacity": "90%", "--glass-liquid-clear-opacity": "70%", "--glass-clarity": "0.5",
      "--glass-blur": "40px", "--glass-liquid-blur": "30px", "--glass-sheen": "0%", "--glass-texture": "none",
    }),
  },
  "@media (prefers-contrast: more)": {
    [scopes]: important({
      "--glass-opacity": "94%", "--glass-opacity-strong": "97%", "--glass-opacity-subtle": "90%",
      "--glass-liquid-opacity": "94%", "--glass-liquid-clear-opacity": "80%", "--glass-clarity": "0.5",
      "--glass-border-width": "1.5px", "--glass-border-opacity": "100%", "--glass-border-color": "oklch(0.25 0 0)",
      "--glass-highlight-opacity": "0%", "--glass-sheen": "0%", "--glass-glow": "0%", "--glass-texture": "none",
      "--glass-label-secondary": "oklch(0.36 0.01 285)",
    }),
    [darkScopes]: important({ "--glass-border-color": "oklch(1 0 0)", "--glass-label-secondary": "oklch(0.93 0.01 285)" }),
  },
  "@media (forced-colors: active)": {
    [panes]: {
      "-webkit-backdrop-filter": "none", "backdrop-filter": "none", "background-color": "Canvas", "background-image": "none",
      color: "CanvasText", "border-color": "CanvasText", "box-shadow": "none",
    },
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
    "& :where(ul)": { "list-style-type": "disc", "padding-inline-start": "1.4em" },
    "& :where(ol)": { "list-style-type": "decimal", "padding-inline-start": "1.4em", "font-variant-numeric": "var(--glass-numeric)" },
    "& :where(li)": { "margin-block": "0.3em" },
    "& :where(li)::marker": { color: "var(--primary)" },
    "& :where(blockquote)": {
      "border-inline-start": "3px solid var(--primary)",
      "padding-inline-start": "1em",
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
    "& :where(th, td)": { padding: "0.55em 0.75em", "border-bottom": `1px solid ${rim10}`, "text-align": "start" },
    "& :where(th)": { "font-weight": "600" },
    "& :where(img, video)": { "border-radius": "var(--glass-radius-control)" },
    "& :where(figcaption)": { "font-size": step(-1), color: "var(--muted-foreground)", "margin-top": "0.5em" },
    "& > :first-child": { "margin-top": "0" },
    "& > :last-child": { "margin-bottom": "0" },
  },
}
