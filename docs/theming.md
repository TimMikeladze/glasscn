# Theming — design (v2)

Everything visual in glasscn is a **primitive CSS variable**, grouped into nine dimensions. Themes are just values for those primitives; nothing else changes.

## The one rule that makes scoping work

Primitives live on `:root` / `.dark` (or any element). **Derived values never do.** Colours like the frost, rim and shadow are computed *inside* the utilities and `@theme inline` tokens from the primitives — so they are evaluated on the element that uses them, and overriding a primitive on any subtree re-themes that subtree. (A `--glass: color-mix(…var(--glass-opacity)…)` declared on `:root` would freeze at `:root` and ignore child overrides.)

## Dimensions (≈45 primitives)

| Group | Primitives |
|---|---|
| Colour | `primary` `primary-foreground` `ring` `chart-1..5` `aurora-1..3` `aurora-base` |
| Material | `glass-tint` `glass-opacity` `-strong` `-subtle` `glass-blur` `glass-saturate` `glass-brightness` `glass-sheen` `glass-sheen-angle` `glass-texture` `glass-fill-tint` `glass-fill-opacity` `-strong` `glass-thumb` |
| Rim | `glass-border-color` `glass-border-opacity` `glass-border-width` `glass-highlight-opacity` |
| Depth | `glass-shadow-color` `glass-shadow-opacity` `glass-shadow-y` `glass-shadow-blur` `glass-glow` |
| Shape | `glass-radius-surface` `glass-radius-control` `glass-radius-button` `glass-radius-badge` |
| Density | `glass-density` (a multiplier on control heights, paddings, card spacing) |
| Motion | `glass-duration` `glass-ease` `glass-press-scale` |
| Aurora | `aurora-opacity` `aurora-scale` `aurora-speed` `aurora-blur` |
| Type & focus | `glass-heading-weight` `glass-heading-tracking` `glass-ring-width` |

Tailwind gets named tokens over them: `bg-glass`, `border-glass-border`, `bg-fill`, `rounded-surface`, `rounded-control`, `rounded-button`, `rounded-badge`, `h-control`, `px-pad`, `ease-glass`, `font-title`, `tracking-title`…

## Presets (each a shadcn `registry:theme` item; they compose)

- **Palettes (12)** — Dusk, Ocean, Rose, Sage, Amber, Graphite (hand-tuned) + Lavender, Mint, Cherry, Lagoon, Sand, Midnight (generated from a hue).
- **Materials (7)** — frosted (default), liquid, crystal, smoked, matte, vapor, neon.
- **Shapes (4)** — round (default), soft, sharp, square.
- **Motion (4)** — spring (default), smooth, snappy, still.
- **Density** — compact, default, comfortable (via the generator / studio).

## The engine — `lib/glass-theme.ts` (registry item `glass-theme`, tested)

- `TOKENS` — the schema: name, group, label, description, light/dark default, control (range / colour / select).
- `createGlassTheme({ palette, material, shape, motion, density, tokens, light, dark })` → `{ light, dark }`.
- `paletteFromHue({ hue, harmony, chroma })` — analogous, complementary, triadic, split, monochrome.
- `themeToCss`, `themeToRegistryItem` (a ready `registry:theme` JSON you can host or `shadcn add ./file.json`), `themeVars` (inline style), `encodeTheme` / `decodeTheme` (shareable URLs).
- `sanitizeValue` — every value is checked before it is written into CSS (no `;`, braces, quotes, `<`).
- `legibility(theme, scheme)` — estimated text contrast on the frost over the aurora (AA / AAA / low).

## Runtime scoping — `ThemeScope` (registry item `theme-scope`)

`<ThemeScope theme={…} scheme="dark">` themes a subtree: it writes a scoped `<style>` with light/dark rules for its own `data-glass-scope` id, so a card, a section or a preview can wear a different theme from the page.

## Site

`/themes` — the Theme Studio: every primitive as a control, presets, hue harmony generator, randomise, a scoped live preview (with its own scheme), legibility badge, export as CSS / registry item / TypeScript / share link, and "apply to the whole site".
