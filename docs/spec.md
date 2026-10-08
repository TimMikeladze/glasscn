# glasscn — spec

A shadcn-compatible registry of glassmorphic components: frosted surfaces over a living aurora, iOS-grade controls, and the data pieces (activity rings, sparklines, heatmap) from the Kaizen app — installed as source with `npx shadcn add`, themed entirely with CSS variables.

## Why a registry, and why web-first

shadcn's standard is Tailwind v4 + CSS variables + Radix + `cn`, copied into the user's repo. The Kaizen components are React Native; their *design* ports cleanly to CSS (`backdrop-filter` is what react-native-web already used). So:

- **Web track** (`registry:ui`): idiomatic shadcn components — same APIs as shadcn's where one exists (`Button`, `Card`, `Dialog`, …) so swapping is an import-path change; new glass-native pieces where none does (`Aurora`, `Glass`, `Dock`, `ActivityRings`, …).
- **Native track** (`native-*`): the Expo originals (Liquid Glass → blur → fill `Glass`, `Aurora`, `Press`) made standalone, for Expo apps with a `components.json`.
- Both read the same token names and palettes.

## Standards followed

- `registry.json` with `$schema`, `{REGISTRY_URL}` placeholders stamped at build (robocn pattern); output in `public/r`.
- Components: `data-slot` on every part, `cva` variants, `cn` from `cn`, unified `radix-ui` package, `asChild` via `Slot`, `React.ComponentProps<…>` typing, `className` merges last, no hardcoded colours — tokens only.
- Files install to `@components/glass/<name>.tsx` (import from `@/components/glass/button`) so they live beside, not over, shadcn's `components/ui`.
- Namespace-ready: `npx shadcn add @glasscn/button` once `registries.@glasscn` is set.

## Foundations

- `glass-style` (`registry:lib`): `lib/glass.ts` (`glassVariants` cva shared by every surface) + CSS variables (light/dark) + `@utility glass | glass-strong | glass-subtle` + aurora keyframes + reduced-motion + a `@supports not (backdrop-filter)` fallback.
  - `--glass`, `--glass-strong`, `--glass-subtle`, `--glass-border`, `--glass-highlight`, `--glass-shadow`, `--glass-blur`, `--glass-saturate`, `--glass-fill`, `--aurora-base`, `--aurora-1..3`; Tailwind colours `bg-glass`, `bg-fill`, `border-glass-border`, `text-aurora-1`…
- Palettes (`registry:theme`): `theme-dusk` (default), `theme-ocean`, `theme-rose`, `theme-sage`, `theme-amber`, `theme-graphite` — set `--primary`, `--ring`, `--aurora-*`, `--chart-1..3` for light and dark.

## Components (web)

| Group | Items |
|---|---|
| Surfaces | `aurora`, `glass` (`Glass`), `card` |
| Controls | `button`, `badge`, `input`, `textarea`, `label`, `switch`, `segmented-control`, `tabs`, `slider`, `progress`, `kbd`, `separator` |
| Overlays | `dialog`, `sheet`, `popover`, `tooltip`, `dropdown-menu`, `toaster` (sonner) |
| Navigation | `dock` (floating capsule bar, sliding pill, action button), `grouped-list` (Settings-style rows, icon tiles) |
| Data | `activity-rings`, `progress-ring`, `sparkline`, `stat`, `heatmap` |
| Blocks | `dashboard-01` (rings + stats + 39-week heatmap + sparkline), `settings-01` (grouped lists), `auth-01` (glass sign-in) |

Pure maths (`ring` arcs, smooth paths, heatmap grid) lives in `lib/glass-charts.ts` (tested).

## Site

Next 16 docs site in the same repo: landing (aurora hero, live dashboard, palette switcher, install), `/docs` index, `/docs/[slug]` (live demo, install command, usage, props, source), `/docs/theming` (token table + live customizer that writes CSS to copy), `/docs/installation`, `/docs/native`.

## Verification

- `pnpm typecheck`, `pnpm lint`, `pnpm test` (vitest: chart maths, registry integrity — files exist, dependencies resolve, every item documented and demoed).
- `pnpm registry:build` then `scripts/verify-install.mjs`: serve `public/r`, scaffold a fresh Next app, `shadcn init`, `shadcn add` **every** item, type-check and build it.
- Native items: installed into a copy of the Kaizen Expo app and type-checked.
- Site checked in a browser, light/dark, phone and desktop.
