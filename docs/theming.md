# Theming design (v2)

Everything visual in glasscn is a primitive CSS variable, grouped into eleven dimensions. A theme is a set of values for those primitives and nothing else.

## Why derived values never sit on `:root`

Primitives live on `:root` / `.dark` (or any element). **Derived values never do.** Colours like the frost, rim and shadow are computed from the primitives inside the utilities and `@theme inline` tokens, so they're evaluated on the element that uses them. That's what lets you override a primitive on any subtree and re-theme just that subtree. A `--glass: color-mix(…var(--glass-opacity)…)` declared on `:root` would be computed once at `:root` and ignore overrides on children.

## Dimensions (101 primitives)

| Group | Primitives |
|---|---|
| Colour | `primary` `primary-foreground` `ring` `chart-1..5` `success` `warning` `info` (+ `-foreground`) `aurora-1..3` `aurora-base` |
| Material | `glass-tint` `glass-opacity` `-strong` `-subtle` `glass-blur` `glass-saturate` `glass-brightness` `glass-sheen` `glass-sheen-angle` `glass-texture` `glass-fill-tint` `glass-fill-opacity` `-strong` `glass-thumb` `glass-knob` `glass-clarity` `glass-label` `glass-label-secondary` `-tertiary` `-quaternary` `glass-separator-opacity` |
| Liquid | `glass-liquid-opacity` `glass-liquid-clear-opacity` `glass-liquid-clear-dim` `glass-liquid-blur` `glass-liquid-saturate` |
| Rim | `glass-border-color` `glass-border-opacity` `glass-border-width` `glass-highlight-opacity` `glass-highlight-color` `glass-light-angle` `glass-specular` `glass-edge-shade` `glass-illumination` |
| Depth | `glass-shadow-color` `glass-shadow-opacity` `glass-shadow-y` `glass-shadow-blur` `glass-shadow-over-content` `glass-glow` `glass-dim` |
| Shape | `glass-radius-surface` `glass-radius-control` `glass-radius-button` `glass-radius-badge` `glass-ring-width` |
| Density | `glass-density` (a multiplier on control heights, paddings, card spacing) `glass-hit-min` (touch target) |
| Motion | `glass-duration` `glass-ease` `glass-press-scale` `glass-press-stretch` `glass-press-grow` `glass-knob-lens-scale` |
| Aurora | `aurora-opacity` `aurora-scale` `aurora-speed` `aurora-blur` |
| Fonts | `glass-font-sans` `-heading` `-display` `-mono`, optional; unset means your app's `--font-*` |
| Type | `glass-text-scale` `glass-type-ratio` `glass-leading` `glass-tracking` `glass-body-weight` `glass-heading-weight` `-tracking` `-leading` `-case` `-wrap` `glass-hyphens` `glass-display-weight` `-tracking` `glass-numeric` `glass-font-features` `glass-measure` `glass-underline-offset` |

Fonts and type in depth: [`typography.md`](typography.md).

Tailwind gets named tokens over them: `bg-glass`, `border-glass-border`, `bg-fill`, `rounded-surface`, `rounded-control`, `rounded-button`, `rounded-badge`, `h-control`, `px-pad`, `ease-glass`, and for type `type-glass`, `type-glass-heading`, `type-glass-display`, `font-glass-heading`, `type-step-n2…6`…

### Material and liquid

There are two kinds of glass, following Apple's design. Material glass (`glass`, `glass-strong`, `glass-subtle`) is for content: cards, panes, anything in flow. Liquid glass (`glass-liquid`, `glass-liquid-clear`) is for the control layer floating over content: the dock, toolbars, floating buttons, menus, popovers and sheets. Liquid uses less blur and more saturation. Clear liquid is only for media, and it dims what's behind it. `--glass-clarity` (0 ultra clear → 1 fully tinted, default 0.5) scales every frost at once, like iOS 27's Liquid Glass slider. The `glass-preferences` item lets viewers set it themselves: a Clarity slider and a Reduce transparency switch, persisted and applied before paint by `<GlassPreferencesScript />`. A viewer's choice beats every theme and `ThemeScope`. The OS settings below beat the viewer's choice.

### Accessibility settings

| Setting | Effect |
|---|---|
| `prefers-reduced-transparency` | Every pane gets frostier |
| `prefers-contrast: more` | Panes go nearly opaque with a contrasting rim |
| `forced-colors` | Panes use system colours |
| `prefers-reduced-motion` | Zeroes durations, press squash / stretch / grow and the knob lens; overlays cross-fade |

Reduce transparency and increase contrast also zero `--glass-specular` and `--glass-illumination`. They override primitives with `!important`, so they win over themes, scopes and per-element overrides.

### Utilities

- `glass-focus` / `glass-focus-inset`: two-tone focus, a `--ring` outline with a halo in the pane colour
- `hit-area`: ≥ 24px, `--glass-hit-min` on touch
- `rounded-concentric`: container radius − padding; containers set `--glass-container-radius` / `--glass-container-pad`
- Apple text styles: `type-large-title`, `type-title-1..3`, `type-headline`, `type-body`, `type-callout`, `type-subheadline`, `type-footnote`, `type-caption-1..2`
- Tokens: `text-glass-label-*`, `border-separator`, `bg-fill-subtle` / `-faint`, `bg-success` / `-warning` / `-info` and their `-ink` text, `shadow-glass-1..4`, `h-control-2xs`, `size-knob`, `rounded-control-xs`.

The liquid layer (M2):

| Utility | What it does |
|---|---|
| `glass-light` | Two-sided rim: specular on the `--glass-light-angle` side, `--glass-edge-shade` opposite (a masked `::before`). Built into `glass-liquid` / `glass-liquid-clear`. |
| `glass-illuminate` | A glow (`--glass-illumination`, `plus-lighter`) from the pointer while pressed; `useGlassPointer()` feeds `--glass-press-x/y` (centre without it). Uses `::after`. |
| `glass-shadow-adaptive` | Shadow × `--glass-shadow-over-content` while `[data-over-content]` (set by `ScrollEdge`). |
| `glass-prominent` | Tinted liquid glass: the accent at 94% in the frost, `primary-foreground` label, rim and glow. Use instead of `glass-liquid`. |
| `glass-press` / `glass-press-liquid` | Elastic press: solid squashes wider-and-shorter (`--glass-press-scale`, `--glass-press-stretch`); liquid grows (`--glass-press-grow`). |
| `glass-knob-lens` | A knob that's solid at rest and a liquid lens (× `--glass-knob-lens-scale`, stretched by `--glass-knob-stretch-x`) as the child of a pressed `.group` or under `[data-dragging]`. |
| `glass-materialize` | Overlay enter/exit on Radix `data-state`: blur, frost and scale (0.96 → 1) together, via the registered `--glass-materialize`. |
| `glass-morph-origin` | Overlays grow out of their trigger: first frame clipped to `--glass-morph-w/-h` in a capsule, from `--glass-morph-origin`. |
| `scroll-edge-soft` / `scroll-edge-hard` | A progressive-blur band / a near-opaque strip at a scroll edge (`--glass-scroll-edge-to: top│bottom`). |

### Text on glass

Panes remap shadcn's `--foreground`, `--card-foreground`, `--popover-foreground` and `--muted-foreground` to `--glass-label` / `--glass-label-secondary` for everything inside them. A material can then carry its own text colours (a smoked pane in a light theme gets light text), and muted text stays legible on frost. If your app customises `--foreground`, set `--glass-label` to match.

### Legibility

Every shipped palette × material, in both schemes, is tested to WCAG AA with `legibilityReport()`. Text and secondary text on subtle, default and strong panes must reach 4.5:1, the accent's label 4.5:1, and the accent against the ground 3:1. Palettes move their accent's lightness (`accentFor`) until its label passes.

## Presets

Each preset is a shadcn `registry:theme` item, and they compose.

- Palettes (12): Dusk, Ocean, Rose, Sage, Amber, Graphite (hand-tuned) + Lavender, Mint, Cherry, Lagoon, Sand, Midnight (generated from a hue).
- Materials (7): frosted (default), vivid, crystal, smoked, matte, vapor, neon.
- Shapes (4): round (default), soft, sharp, square.
- Motion (4): spring (default), smooth, snappy, still. Spring and snappy are real springs: `spring({ stiffness, damping, mass })` emits a CSS `linear()` curve.
- Density: compact, default, comfortable.
- Type (8): default, system, modern, editorial, friendly, technical, classic, grotesk (each depends on its `registry:font` items).

## The engine

`lib/glass-theme.ts`, shipped as the registry item `glass-theme`, with tests.

- `TOKENS`: the schema, with name, group, label, description, light/dark default, control (range / colour / select).
- `createGlassTheme({ palette, material, shape, motion, density, type, fonts, tokens, light, dark })` → `{ light, dark }`.
- `paletteFromHue({ hue, harmony, chroma })`: analogous, complementary, triadic, split, monochrome.
- `themeToCss`, `themeToRegistryItem` (a ready `registry:theme` JSON you can host or `shadcn add ./file.json`), `themeVars` (inline style), `encodeTheme` / `decodeTheme` (shareable URLs).
- Fonts: `FONTS`, `TYPE_PRESETS`, `fontStylesheetUrl`, `fontDependencies`, `typeScale`; `themeToCss(theme, { fontImport: true })` prepends the Google Fonts `@import`.
- `legibility(theme, scheme)`: estimated text contrast on a default pane over the aurora (AA / AAA / low). `legibilityReport(theme, scheme)`: the full matrix (text and secondary text per tier, accent label, accent vs ground), composited in gamma sRGB as browsers do. `accentFor(primary, label)`: moves an accent's lightness until its label reads at AA.
- `sanitizeValue` / `sanitizeTokens` / `fitsToken`: values are checked before they become CSS (no `;`, braces, comments, `var()` or fetches), and each must fit its token, as a number in the right unit, a colour, a select value.

## Runtime scoping with `ThemeScope`

Shipped as the registry item `theme-scope`.

`<ThemeScope theme={…} scheme="dark">` (or `type="editorial" loadFonts`) themes a subtree, including its body type. It writes a scoped `<style>` with light/dark rules for its own `data-glass-scope` id, so a card, a section or a preview can wear a different theme from the page.

- Preset props write only their groups. `palette` → Colour; `material` → Material, Liquid, Rim, Depth; `shape` → Shape; `motion` → Motion + aurora speed; `density`, `type`, `fonts` → their own (plus anything else the preset sets). `<ThemeScope shape="sharp">` keeps the page's palette and material. A `theme` prop writes every token.
- The output is small: one light rule, then a dark rule with only the values that differ by scheme (`themeScopeCss(selector, props)` returns it, for tests and SSR inspection).
- A forced `scheme` writes one rule: the scope's values, shadcn's full neutral set (`background`, `foreground`, `card`, `popover`, `muted`, `secondary`, `accent`, `border`, `input`, `destructive` + foregrounds), `color-scheme` and `color`. Tokens it doesn't name follow the scheme too: a dark scope matches your `.dark` rules by its class; a light one takes the default light values (your accent and charts stay).
- `dark:` inside a forced scope: shadcn's `@custom-variant dark (&:is(.dark *))` matches any `.dark` ancestor, so a light scope in a dark page would still get every `dark:` utility. glasscn's variant follows the nearest `.dark` / `.light`. It's exact three levels deep (page, scope, scope) and correct when next-themes puts `light` on `<html>`:

  ```css
  @custom-variant dark (&:is(.dark, .dark *):not(:where(.dark .light, .dark .light *):not(:where(.dark .light .dark, .dark .light .dark *))));
  ```

  It keeps shadcn's specificity. Tailwind uses the last definition, so it must come after shadcn's line in `globals.css` (glass-style's CSS is appended after it). `@scope (.dark) to (.light)` would be exact at any depth, but Tailwind nests a variant's `@scope` inside the utility rule, where it no longer matches.

## Site

`/themes` is the Theme Studio. It has every primitive as a control, presets, a hue harmony generator, randomise, a legibility badge, export as CSS / registry item / TypeScript / share link, and "apply to the whole site". The scoped live preview has its own scheme and continues into a catalogue of every registry item, components and blocks, each with its docs demo, read straight from the registry ([`studio-catalogue.md`](studio-catalogue.md)).
