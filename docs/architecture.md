# How glasscn works

The repo holds three things: a shadcn registry (the source code users install), a theme engine (plain TypeScript that runs both in the build and in users' apps), and a Next 16 docs site that renders the registry using the registry's own components.

## The pipeline

```
src/lib/glass-theme.ts ──┐  TOKENS schema, PALETTES/MATERIALS/SHAPES/MOTIONS/DENSITIES/TYPE_PRESETS, FONTS, createGlassTheme
registry/stylesheet.mjs ─┤  @theme tokens + utilities, all DERIVED from primitives
registry/items.mjs ──────┤  every item: files, npm deps, registry deps
                         ▼
              scripts/generate.mjs
                         │
     ┌───────────────────┼──────────────────────────────┐
     ▼                   ▼                              ▼
registry.json   src/app/glass.generated.css   src/lib/sources.generated.ts
     │           (the site's tokens — the same     (shiki-highlighted source
     ▼            CSS users get, + palette presets)  of every item and demo)
scripts/build-registry.mjs  →  public/r/*.json  (stamped with the deploy URL)
```

Generated files are never edited by hand. `registry.json` is committed so the CLI can read it; `public/r` and the site's two `*.generated.*` files are not. The same generator writes native palette/preset values to `registry/native/tokens.generated.ts` and copies the pure `src/lib/glass-toolbar-layout.ts` allocator into `registry/native/toolbar-layout.ts`.

## Primitives and derived values

- **Primitives** (`--glass-blur`, `--glass-opacity`, `--aurora-1`, `--glass-radius-surface`, `--glass-density`…) are plain values. They live on `:root` / `.dark`, or on any element.
- **Derived values** (the frost colour, rim colour, shadow, `rounded-surface`, `h-control`…) are computed inside utilities and `@theme inline` tokens, so the browser evaluates them on the element that uses them.

Everything else depends on this. `<Card className="[--glass-blur:6px]">`, `ThemeScope`, the studio's scoped preview and per-section density all work because overriding a primitive anywhere re-themes that subtree. A derived value stored on `:root` would be computed once there and ignore overrides below it. `registry/registry.test.mjs` fails the build if one gets in.

## Registry items

| Kind | Type | Examples |
|---|---|---|
| Foundation | `registry:lib` / `registry:hook` | `glass-style` (all primitives except accent/charts + stylesheet), `glass-theme`, `glass-charts`, `use-sliding-indicator` |
| Presets | `registry:theme` | `theme-*` (Colour group), `material-*` (Material+Rim+Depth+Liquid), `shape-*`, `motion-*`, `density-*`, `type-*` (Type + font deps) |
| Fonts | `registry:font` | `font-*`, `font-heading-*`, `font-display-*`, `font-mono-*`, generated from `FONTS`, installed by the CLI via next/font or fontsource |
| Components | `registry:ui` | `components/glass/*` |
| Blocks | `registry:block` | `components/glass-blocks/*` |
| Native | `registry:ui` | `components/glass/native/*` (Expo): the foundation (`native-tokens/glass/aurora/press/ui/chart-math`) and a `native-<name>` twin of every component and block. One React Native file per item renders on iOS, Android and the web (through react-native-web) |

Each preset sets every token in its group, so adding one replaces the previous choice in that group and leaves no stale values behind.

## The engine at runtime

`createGlassTheme()` layers defaults → palette (named or `{ hue, harmony, chroma }`) → material → shape → motion → density → type → fonts → your overrides. The result feeds `themeToCss`, `themeVars`, `themeToRegistryItem`, `encodeTheme`/`decodeTheme`, `legibility`. Every value passes `sanitizeValue` before it becomes CSS. `ThemeScope` writes one scoped `<style>` per subtree.

Components use the foundation's configured `glass-cn` helper. It extends Tailwind class merging with the registry's radius and spacing tokens, so consumer classes replace defaults predictably. Body-level overlay portals use `glass-portal` to carry live resolved scope primitives and scheme beyond the original DOM subtree.

## Liquid Glass runtime

`GlassEffects` is an optional shared browser runtime. `LiquidGlass` installs it locally; the site mounts it at the root to enhance existing floating controls and newly opened portals. A pure bounded lens model in `glass-optics` supplies cached geometry textures. The runtime limits active surfaces by size and viewport, observes resize/removal, and releases filters when no owner remains. Chromium gets an edge-displacement backdrop filter; Safari/Firefox retain the CSS material. Accessibility and matte/tinted settings can remove the enhancement without removing the surface.

`GlassGroup` shares one bar surface. `GlassCluster` draws a shared smooth-union mask from separate sibling positions, including animated and departing shapes, while keeping controls and labels sharp. It observes CSS geometry motion; imperative Web Animations call `trackGlassAnimation`. `GlassMorph` preserves stable sibling identities and animates insertion/removal/reordering using document geometry. Live Reduce Motion cancels only its own animations. The separate `glass-transitions` foundation coordinates source/destination overlay View Transitions with interruption cleanup and a reduced-motion/unsupported-browser fallback.

Native uses `expo-glass-effect` and supported Expo system controls instead of the browser model. Untinted automatic material preserves OS optics/vibrancy and future refinements. Its cluster has actual sibling system effects. Android and React Native Web use platform fallbacks; the repository has no AppKit target. See [the 27 study](research/apple-liquid-glass-2026-11.md) for verified Apple behavior and approximation boundaries.

## The site

- `/` landing, `/showcase` (ten Apple-inspired scenes and optical/merge labs), `/docs/*` per item (live demo from `src/components/demos`, install, props from `src/lib/docs.ts`, source from `sources.generated.ts`), `/docs/theming`, `/docs/fonts`, `/docs/native`, `/themes` (Theme Studio).
- The site's palette switcher sets `data-palette` on `<html>`; "apply to site" in the studio writes sanitised CSS under `:root[data-glass-custom]`; both are applied before paint.
- `src/lib/site-settings.ts` versions the site's saved settings. A version change clears the palette, custom CSS, color scheme and glass preferences before those scripts run, once per browser. New choices survive subsequent loads. Bump `SITE_SETTINGS_VERSION` for another reset; installed registry components are unaffected.

## Verification

- `pnpm test`: engine, chart maths, registry integrity (files exist, deps declared, unique file names, no derived primitives, every var reference known).
- `pnpm verify:install`: a fresh Next app installs every web item, presets and a local exported theme, then type-checks and builds.
- `pnpm verify:native`: native items installed into a copy of the Expo sandbox, type-checked against its screens and component-tested against the installed files.
- `sandbox/native`: an Expo app rendering every native item live from `registry/native` (iOS simulator, Expo Go, web). See [`sandbox.md`](sandbox.md).
