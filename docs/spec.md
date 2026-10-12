# glasscn spec

A shadcn-compatible registry of glass components: frosted surfaces over an animated aurora, iOS-style controls, and data pieces (activity rings, sparklines, heatmap). They're installed as source with `npx shadcn add` and themed with CSS variables.

## Why a registry, and why web-first

shadcn's standard is Tailwind v4 + CSS variables + Radix + `cn`, copied into the user's repo. The original components were React Native. Their design ports to CSS directly, since `backdrop-filter` is what react-native-web already used. So there are two tracks:

- Web (`registry:ui`): shadcn-style components. Where shadcn has the component (`Button`, `Card`, `Dialog`, …) the API is the same, so switching is an import-path change. Where it doesn't, there are new glass pieces (`Aurora`, `Glass`, `Dock`, `ActivityRings`, …).
- Native (`native-*`): the Expo foundation (`Glass` falling back from Liquid Glass to blur to fill, `Aurora`, `Press`, tokens, `native-ui`) plus a `native-<name>` twin of every component and block. Each twin is one React Native file that renders on iOS, Android and the web (through react-native-web). Each installs standalone into an Expo app with a `components.json`. See [`native.md`](native.md).
- Both read the same token names and palettes.

## Standards followed

- `registry.json` with `$schema`, `{REGISTRY_URL}` placeholders stamped at build (robocn pattern); output in `public/r`.
- Components: `data-slot` on every part, `cva` variants, `cn` from `cn`, unified `radix-ui` package, `asChild` via `Slot`, `React.ComponentProps<…>` typing, `className` merges last, tokens only, no hardcoded colours.
- Files install to `@components/glass/<name>.tsx` (import from `@/components/glass/button`) so they sit next to shadcn's `components/ui` and never overwrite it.
- Namespace-ready: `npx shadcn add @glasscn-app/button` once `registries["@glasscn-app"]` is set (`registryNamespace` in `src/lib/site.ts`; the directory's `@glasscn` belongs to another project).

## Theming

See [`theming.md`](theming.md): 101 primitives in eleven groups, composable presets (12 palettes, 7 materials, 4 shapes, 4 motions, 3 densities, 8 type presets), 70 `registry:font` items ([`typography.md`](typography.md)), the theme engine (`glass-theme`), `ThemeScope`, and the Theme Studio at `/themes`. Agents: [`architecture.md`](architecture.md), [`rules/`](rules/README.md), `skills/`.

## Foundations (v1 notes)

- `glass-style` (`registry:lib`): `lib/glass.ts` (the `glassVariants` cva shared by every surface) + CSS variables (light/dark) + `@utility glass | glass-strong | glass-subtle` + aurora keyframes + reduced-motion + a `@supports not (backdrop-filter)` fallback.
  - `--glass`, `--glass-strong`, `--glass-subtle`, `--glass-border`, `--glass-highlight`, `--glass-shadow`, `--glass-blur`, `--glass-saturate`, `--glass-fill`, `--aurora-base`, `--aurora-1..3`; Tailwind colours `bg-glass`, `bg-fill`, `border-glass-border`, `text-aurora-1`…
- Palettes (`registry:theme`): `theme-dusk` (default), `theme-ocean`, `theme-rose`, `theme-sage`, `theme-amber`, `theme-graphite` set `--primary`, `--ring`, `--aurora-*`, `--chart-1..3` for light and dark.

## Components (web)

| Group | Items |
|---|---|
| Surfaces | `aurora`, `glass` (`Glass`), `card`, `theme-scope` |
| Typography | `typography` (`Heading`, `Text`, `Display`, `Blockquote`, `InlineCode`, `List`, `TextLink`), `prose` |
| Controls | `button`, `badge`, `input`, `textarea`, `label`, `checkbox`, `switch`, `segmented-control`, `tabs`, `slider`, `progress`, `kbd`, `separator`, `avatar`, `glass-preferences` |
| Overlays | `dialog`, `sheet`, `popover`, `tooltip`, `dropdown-menu`, `toaster` (sonner) |
| Navigation | `dock` (floating capsule bar, sliding pill, action button), `grouped-list` (Settings-style rows, icon tiles) |
| Data | `activity-rings`, `progress-ring`, `sparkline`, `stat`, `heatmap`, `bar-list`, `gauge`, `tracker`, `category-bar` |
| Charts (TanStack Charts) | `chart` (themed host + legend), `area-chart`, `bar-chart`, `line-chart`, `donut-chart` |
| Tables (TanStack Table v9) | `table`, `data-table` |
| Chat | `chat` (thread, message, bubble, meta, divider, typing, suggestions, composer) |
| Blocks | `dashboard-01` (rings + stats + 39-week heatmap + sparkline), `analytics-01` (charts + bar list + data table), `chat-01` (conversation), `settings-01` (grouped lists), `auth-01` (glass sign-in) |

Pure maths (`ring` arcs, smooth paths, heatmap grid, bar shares, gauge arcs, category segments) lives in `lib/glass-charts.ts` (tested). Charts and tables: [`data-and-chat.md`](data-and-chat.md).

## Alignment with Apple Liquid Glass

[`liquid-glass.md`](liquid-glass.md) covers where glasscn matches Apple's Liquid Glass and what it's missing (the material/liquid layer split, accessibility adaptivity, specular light, concentric shapes, the navigation layer), with a prioritised plan. Full backlog: [`roadmap.md`](roadmap.md); Apple component spec: [`apple-hig-reference.md`](apple-hig-reference.md).

## Site

Next 16 docs site in the same repo: landing (aurora hero, live dashboard, palette switcher, install), `/docs` index, `/docs/[slug]` (live demo, install command, usage, props, source), `/docs/theming` (token model, presets, ThemeScope, every primitive), `/docs/fonts` (font catalogue, type presets, scale), `/themes` (Theme Studio), `/docs/installation`, `/docs/native`.

- Machine-readable: `/sitemap.xml` and `/robots.txt` (walk `docsNav`, the same list the sidebar renders), `/llms.txt` (summary, namespace install, every page with its description) and `/llms-full.txt` (plus every item's props, notes, usage and the design rules). All four are built from source data in `src/lib/llms.ts` and prerendered.
- Docs pages ship only their own demo: `DemoPreview` loads `components/demos/<slug>` as its own chunk (a server component can't code-split the client components it imports). `/docs/kbd` ≈ 215 KB gzip of JS.
- Install commands use `NEXT_PUBLIC_REGISTRY_URL`, else glasscn.app on Vercel, else localhost. Under `next dev` the localhost URL uses the dev server's actual port.

## Verification

- `pnpm typecheck`, `pnpm lint`, `pnpm test` (vitest: chart maths, registry integrity: files exist, dependencies resolve, every item documented and demoed).
- `pnpm registry:build` then `scripts/verify-install.mjs`: serve `public/r`, scaffold a fresh Next app, `shadcn init`, `shadcn add` **every** item, type-check and build it.
- Native items: every `native-*` item installed from the registry into a copy of the `sandbox/native` Expo app and type-checked (`verify:native`); each twin has a sandbox demo at `/c/<name>`, checked on web, the iOS 26 simulator and Android.
- Site checked in a browser, light/dark, phone and desktop.
