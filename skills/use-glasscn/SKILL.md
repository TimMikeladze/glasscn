---
name: use-glasscn
description: Build UI with glasscn, the glassmorphic shadcn registry — install it, compose screens from its components and blocks, theme it (palettes, materials, shapes, density, motion, per-subtree ThemeScope), and follow its design rules. Use in any app that has or wants glasscn components (components/glass, glass-style in globals.css), or when asked for glassmorphism, frosted/iOS-style UI on shadcn.
---

# Use glasscn

glasscn = shadcn components in glass, on Apple's Liquid Glass model. Same APIs as shadcn; every visual is a CSS variable.

**Two layers — get this right first.** Content (cards, lists, stats, charts, articles) uses the frosted **material** (`glass-subtle` / `glass` / `glass-strong`) or plain fills. Only the **control layer** floating over content — dock, toolbars, floating buttons, menus, popovers, tooltips, sheets, dialogs — is **liquid glass** (`glass-liquid`, `Button variant="glass"`). Never make a card liquid; never put liquid inside liquid.

## Install

```bash
npx shadcn@latest add https://glasscn.app/r/glass-style.json https://glasscn.app/r/theme-dusk.json   # foundation + a palette
npx shadcn@latest add https://glasscn.app/r/aurora.json https://glasscn.app/r/card.json https://glasscn.app/r/button.json
```

Or add `"registries": { "@glasscn-app": "https://glasscn.app/r/{name}.json" }` to `components.json` and `npx shadcn add @glasscn-app/dock`. Components land in `components/glass/`, blocks in `components/glass-blocks/`.

Put `<Aurora />` once in the root layout — glass needs something beneath it: the aurora behind content panes, your content under liquid controls.

### React Native (Expo) — iOS, Android and web in one

Every component and block has a `native-<name>` twin (except `glass-preferences`: iOS applies its own Liquid Glass setting): same parts and props, one React Native file that renders natively and on the web through react-native-web. Each installs on its own and brings what it needs:

```bash
npx shadcn@latest add https://glasscn.app/r/native-button.json https://glasscn.app/r/native-dialog.json
```

Files land in `components/glass/native/`. Wrap the app in `GlassThemeProvider` (palette, scheme) from `native-tokens`, put `<Aurora />` behind screens, mount `<Toaster />` once at the root if you use toasts. `className` becomes `style`; there's no `asChild` (triggers wrap their children). Never fade an ancestor of glass on iOS 26 — check `canFade()`.

## Compose

- Swap shadcn imports: `@/components/ui/card` → `@/components/glass/card`. Same parts and props.
- The overlay components (dialog, sheet, popover, dropdown, tooltip) and the `Dock` already wear the right layer — don't restyle them. In-flow cards are `glass`; quiet panes `<Glass intensity="subtle">`.
- Your own floating controls: `glass-liquid` on the capsule (`<div className="glass-liquid flex rounded-full p-0.5">` around ghost icon buttons), or `Button variant="glass"` for a lone floating button. One capsule per group of related controls.
- Over photos or video only: `glass-liquid-clear` (it dims what's behind it; glyphs are bright). Never mix clear and regular in one view.
- Inside a pane or a liquid bar, use fills (`bg-fill`) and ghost/secondary buttons, not another pane. Two levels of material at most; liquid on liquid never.
- Destructive or irreversible confirmations: `AlertDialog` (never a plain `Dialog`). Never put a `variant="glass"` button inside a glass panel — use `secondary` there.
- Viewer settings: `GlassPreferences` (Clarity slider + Reduce transparency) in a popover or settings page, and `<GlassPreferencesScript />` in `<head>`.
- iOS-style pieces with no shadcn equivalent: `SegmentedControl`, `Dock` (floating tab bar + action — `DockNav` + `DockLink active` for routes, `DockBar` + `DockItem` for in-page views), `GroupedList` (Settings rows), `ActivityRings`, `ProgressRing`, `Sparkline`, `Stat`, `Heatmap`, `BarList`, `Gauge`, `Tracker`, `CategoryBar`.
- Charts: `AreaChart`, `BarChart`, `LineChart`, `DonutChart` (TanStack Charts) take your rows unmodified plus typed accessors — `x={(d) => d.day}`, `series={[{ id, label, value: (d) => d.minutes }]}` — and a required `ariaLabel`. For anything else, build a TanStack `defineChart` and render it in `ChartContainer` from `chart`: series colours come from `--chart-1..5`, the tooltip is glass.
- Tables: `Table` is shadcn's markup; `DataTable` (TanStack Table v9) adds sort, search, pagination, selection — build columns with `createDataTableColumnHelper<Row>()`.
- Chat: `ChatThread` › `ChatMessage from="user|assistant"` › `ChatBubble`, plus `ChatTyping`, `ChatSuggestions`, `ChatComposer onSubmit`. It renders state; wire it to AI SDK `useChat` (`status === "submitted"` → `ChatTyping`).
- Blocks to start from: `dashboard-01`, `analytics-01`, `chat-01`, `settings-01`, `auth-01`.

See `references/recipes.md` for screen recipes.

## Theme

- **Presets compose** (each replaces only its own group): `theme-<palette>` (dusk ocean rose sage amber graphite lavender mint cherry lagoon sand midnight), `material-<frosted|vivid|crystal|smoked|matte|vapor|neon>`, `shape-<round|soft|sharp|square>`, `motion-<spring|smooth|snappy|still>`, `density-<compact|default|comfortable>`, `type-<default|system|modern|editorial|friendly|technical|classic|grotesk>`.
- **Any primitive, any element:** `<Card className="[--glass-blur:8px] [--glass-opacity:70%]">`, `<section className="[--glass-density:0.85]">`.
- **At runtime / per subtree:** `<ThemeScope palette="ocean" material="vivid" scheme="dark">…</ThemeScope>`, or `theme={createGlassTheme({ palette: { hue: 200, harmony: "triadic" }, shape: "soft", tokens: {...} })}` from `@/lib/glass-theme`.
- **Fonts:** app fonts are shadcn `registry:font` items — `font-inter`, `font-heading-fraunces`, `font-mono-jetbrains-mono` (the CLI wires next/font). Theme fonts are optional overrides: `<ThemeScope fonts={{ heading: "fraunces" }} loadFonts>` or `[--glass-font-heading:…]`.
- **Type:** put `type-glass` on `<body>`; use `Heading`/`Text`/`Display` from `typography`, or `type-glass-heading` + `type-step-3` in your own components; `Prose` for Markdown/MDX. A type preset then restyles all of it.
- **Visually:** the Theme Studio at `https://glasscn.app/themes` exports CSS, a shadcn theme item (`npx shadcn add ./my-theme.json`) or a share link.

## Rules (full set: docs/rules/design.md)

1. **Glass needs content beneath it** — an `Aurora` behind material panes, or real content (photos, text, lists) scrolling under liquid controls.
2. **Liquid only for the control layer** (bars, dock, floating buttons, menus, popovers, sheets); content uses the material or fills.
3. **Never liquid on liquid**; related liquid controls share one capsule.
4. **Regular by default; clear only over media, with its dim; never both in one view.**
5. **One prominent action per bar**; colour the glass (or the accent fill), not the label; monochrome glyphs in bars.
6. **One accent** (`primary`); data uses `chart-1..5`; status uses `success` / `warning` / `info`.
7. **Text on panes or content, not on the aurora.**
8. **Tokens, not values:** `rounded-surface|control|button|badge|concentric`, `h-control*`, `px-pad*` in your own components so presets reach them.
9. Few large panes beat many small ones (backdrop-filter cost); offer `material-matte` on low-end.
10. Keep `legibilityReport()` ≥ AA on every tier (liquid included) when you change frost or palette — and design for the viewer turning clarity all the way up.
