# Typography design

Fonts and type follow the same rule as the rest of glasscn: use shadcn's standard where there is one, primitives everywhere else.

## Two kinds of font

| | App fonts | Theme fonts |
|---|---|---|
| What | `--font-sans`, `--font-heading`, `--font-mono` (shadcn's own) | `--glass-font-sans`, `-heading`, `-display`, `-mono` (optional overrides) |
| Set by | `registry:font` items (`font-inter`, `font-heading-fraunces`, `font-mono-jetbrains-mono`…); the CLI wires next/font (Next) or fontsource (Vite…) | `createGlassTheme`, `ThemeScope`, the Theme Studio, any element |
| Loaded by | the CLI | you: `fontStylesheetUrl(theme)` gives the Google Fonts URL; `ThemeScope loadFonts` adds it |
| Scope | the whole app | any subtree, at runtime |

Glass components read `font-glass-sans | heading | display | mono` utilities: `var(--glass-font-heading, <your --font-heading, baked in at build by --theme()>)`. While the theme fonts are unset you get your app's fonts, so nothing changes until you pick one.

## Type primitives

These make up the Type group:

`glass-text-scale` (base size multiplier) · `glass-type-ratio` (modular scale: minor second … golden) · `glass-leading` · `glass-tracking` · `glass-body-weight` · `glass-heading-weight` · `-tracking` · `-leading` · `-case` · `-wrap` · `glass-display-weight` · `-tracking` · `glass-numeric` · `glass-font-features` · `glass-measure` · `glass-underline-offset`.

Sizes are steps on the scale: `type-step-n2 … type-step-6` = `1rem × scale × ratio^n` (CSS `pow()`).

## Pieces

- Utilities: `type-glass` (body font, leading, tracking, weight and features; put it on `<body>`), `type-glass-heading`, `type-glass-display`, `font-glass-*`, `numeric-glass`, `type-step-*`, `glass-prose` (rich text, shipped by `prose`).
- The size utilities are `type-step-*`, not `text-step-*`, because tailwind-merge reads an unknown `text-*` as a colour, so `cn("text-step-3", "text-muted-foreground")` would drop the size.
- Components: `typography` (`Heading`, `Text`, `Display`, `Blockquote`, `InlineCode`, `List`, `TextLink`), `prose` (`Prose` for Markdown/MDX).
- Font items (`registry:font`, 70: `font-<x>`, `font-heading-<x>`, `font-display-<x>`, `font-mono-<x>`): body, heading, display and mono roles over a curated catalogue checked against next/font by a test (Geist, Inter, Figtree, Manrope, DM Sans, Plus Jakarta Sans, Outfit, Sora, Onest, Nunito, IBM Plex Sans, IBM Plex Serif, Space Grotesk, Bricolage Grotesque, Fraunces, Instrument Serif, Newsreader, Playfair Display, Lora, Source Serif 4, JetBrains Mono, Geist Mono, IBM Plex Mono, DM Mono, Space Mono).
- Type presets (`registry:theme`): `type-default`, `type-system` (SF with SF Rounded figures, the Apple look), `type-modern`, `type-editorial`, `type-friendly`, `type-technical`, `type-classic`, `type-grotesk`. Each sets the Type group and depends on the font items it needs.

## Engine

`FONTS` catalogue · `TYPE_PRESETS` · `createGlassTheme({ type, fonts: { heading: "fraunces" } })` · `fontStylesheetUrl(theme)` · `fontDependencies(theme)` · `typeScale(theme)` (px sizes per step). Exports carry fonts: CSS gets the Google Fonts `@import`; the shadcn item swaps theme fonts for `registryDependencies` on font items.

## Studio and site

The studio has a **Fonts** tab (catalogue per role, each option set in its own face), a **Type** tab (scale, ratio, leading, weights, case, numerals, features), type preset chips, and a type specimen in the preview, which loads the fonts it shows. "Apply to site" writes the CSS with its `@import`, so fonts survive reloads. Guide at `/docs/fonts`; components at `/docs/typography` and `/docs/prose`.
