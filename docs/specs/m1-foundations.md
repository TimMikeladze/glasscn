# M1 — foundations for Liquid Glass

Roadmap milestone M1 ([`../roadmap.md`](../roadmap.md)). Everything later (the liquid layer, new components, native parity) consumes these tokens and utilities, so they land first. Design background: [`../liquid-glass.md`](../liquid-glass.md) Part 3.

## Tokens (primitives in `glass-theme.ts`; derived in `stylesheet.mjs`)

| Area | Primitives (light / dark) | Derived (Tailwind) |
|---|---|---|
| Liquid surface | `glass-liquid-opacity` 46% / 40%, `glass-liquid-blur` 12px, `glass-liquid-saturate` 200%, `glass-liquid-clear-opacity` 10% / 8% | `glass-liquid`, `glass-liquid-clear` utilities |
| Clarity (iOS 27 slider) | `glass-clarity` 0.5 (0 = ultra clear, 1 = fully tinted) | every frost opacity: `o·min(1, 2c) + (100% − o)·max(0, 2c − 1)` — 0.5 reproduces today |
| Labels | `glass-label-tertiary` (disabled, placeholder), `glass-label-quaternary` (watermark) | `text-glass-label-*`; panes remap `--muted-foreground` already |
| Status | `success`, `warning`, `info` + `-foreground`, per palette, hue-avoiding the accent | `*-ink` text tokens like `primary-ink` |
| Fills / separator | `glass-separator-opacity` 12% / 16% | `bg-fill-subtle` (×0.66), `bg-fill-faint` (×0.4), `border-separator`, `bg-separator` |
| Elevation | — | `shadow-glass-1..4` from the shadow primitives |
| Focus | `glass-ring-width` min 2px | `glass-focus` / `glass-focus-inset`: an **outline** in `--ring` (survives forced colours, follows radius, no box-shadow clash with panes) |
| Hit targets | `glass-hit-min` 44px | `hit-area`: a transparent `::after` ≥ 24px (fine pointer) / `--glass-hit-min` (coarse) |
| Sizes | — | `control-2xs` (1.5rem×density), `knob` (1.5rem×density), `radius-control-xs` |
| Concentric | containers set `--glass-container-radius` / `--glass-container-pad` | `rounded-concentric` = `max(--glass-concentric-min, radius − pad)` |
| Type | — | Apple text styles `type-large-title … type-caption-2` (size, leading, weight × `--glass-text-scale`) |
| Motion | `glass-ease` presets become `linear()` springs from `spring({stiffness, damping, mass})` | — |

Rename the material preset `liquid` → **`vivid`** (ENG-34) so "liquid" means the surface.

## Accessibility (override primitives, `!important`, on `:root, [data-glass-scope]`)

- `prefers-reduced-transparency: reduce` → frost 90 / 96 / 84%, liquid 90%, clarity 1, blur 40px, sheen 0, texture none.
- `prefers-contrast: more` → frost 94 / 97 / 90%, liquid 94%, rim 1.5px at 100% in a contrasting colour (dark in light, white in dark), sheen / glow / texture / highlight 0, darker secondary labels.
- `forced-colors: active` → panes `Canvas` + `CanvasText` border, no backdrop, no shadows.
- `prefers-reduced-motion: reduce` → `--glass-duration: 0ms`, `--glass-press-scale: 1`, `--glass-ease: linear`.

## Engine

- Gamut mapping (CSS Color 4 chroma reduction) on every generated and hand-tuned palette colour; `legibilityReport` reads mapped colours, adds sheen (worst of with/without), the liquid tier and a `clarity` option.
- Unknown preset keys warn in development and are ignored; types list the known names.
- `ThemeScope`: forced scheme isolates `dark:` (new `@custom-variant dark` that stops at a `.light` scope), forces the full shadcn neutral set and `color-scheme`; partial props emit only the named groups; CSS emitted is the diff against defaults.

## Components (agents, disjoint files)

- Control-layer parts move to `glass-liquid`: Dock, DockAction, tooltip, popover, dropdown, sheet, dialog, alert-dialog, floating chat composer + jump button, `Button variant="glass"`.
- Every component: `glass-focus` instead of ring combos, logical properties (RTL), token durations / sizes / radii, `hit-area` on small targets, concentric thumbs, reduced-motion tags.
- `use-sliding-indicator`: observes children, SSR/no-JS fallback for the selected item, overshoot on transform only.

## New items

- `glass-preferences` (`registry:ui`): clarity slider + reduce-transparency switch writing `:root`, persisted; in the site header.

## Tests

Legibility matrix gains liquid tier + clarity default; tokens / variants / at-rules present in `glass-style`; ThemeScope CSS (partial, forced scheme); decode back-compat fixtures; gamut; generated CSS parses (lightningcss); component tests (jsdom + Testing Library) for roles, refs, providers, links; CI diff check on generated files.

## Done when

`pnpm typecheck && pnpm lint && pnpm test`, `verify:install`, `verify:native` green; browser check of `/docs/*` and `/themes` in light/dark, with macOS Reduce transparency and Increase contrast emulated, phone width, RTL.
