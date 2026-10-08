---
name: use-glasscn
description: Build UI with glasscn, the glassmorphic shadcn registry — install it, compose screens from its components and blocks, theme it (palettes, materials, shapes, density, motion, per-subtree ThemeScope), and follow its design rules. Use in any app that has or wants glasscn components (components/glass, glass-style in globals.css), or when asked for glassmorphism, frosted/iOS-style UI on shadcn.
---

# Use glasscn

glasscn = shadcn components in frosted glass over a drifting aurora. Same APIs as shadcn; every visual is a CSS variable.

## Install

```bash
npx shadcn@latest add https://glasscn.app/r/glass-style.json https://glasscn.app/r/theme-dusk.json   # foundation + a palette
npx shadcn@latest add https://glasscn.app/r/aurora.json https://glasscn.app/r/card.json https://glasscn.app/r/button.json
```

Or add `"registries": { "@glasscn": "https://glasscn.app/r/{name}.json" }` to `components.json` and `npx shadcn add @glasscn/dock`. Components land in `components/glass/`, blocks in `components/glass-blocks/`.

Put `<Aurora />` once in the root layout — glass needs something to frost.

## Compose

- Swap shadcn imports: `@/components/ui/card` → `@/components/glass/card`. Same parts and props.
- Floating layers (dialogs, menus, popovers, toasts) are already `glass-strong`. In-flow cards are `glass`. Quiet panes: `<Glass intensity="subtle">`.
- Inside a pane, use fills (`bg-fill`), not another pane. Two levels of glass at most.
- iOS-style pieces with no shadcn equivalent: `SegmentedControl`, `Dock` (floating tab bar + action), `GroupedList` (Settings rows), `ActivityRings`, `ProgressRing`, `Sparkline`, `Stat`, `Heatmap`, `BarList`, `Gauge`, `Tracker`, `CategoryBar`.
- Charts: `AreaChart`, `BarChart`, `LineChart`, `DonutChart` (TanStack Charts) take your rows unmodified plus typed accessors — `x={(d) => d.day}`, `series={[{ id, label, value: (d) => d.minutes }]}` — and a required `ariaLabel`. For anything else, build a TanStack `defineChart` and render it in `ChartContainer` from `chart`: series colours come from `--chart-1..5`, the tooltip is glass.
- Tables: `Table` is shadcn's markup; `DataTable` (TanStack Table v9) adds sort, search, pagination, selection — build columns with `createDataTableColumnHelper<Row>()`.
- Chat: `ChatThread` › `ChatMessage from="user|assistant"` › `ChatBubble`, plus `ChatTyping`, `ChatSuggestions`, `ChatComposer onSubmit`. It renders state; wire it to AI SDK `useChat` (`status === "submitted"` → `ChatTyping`).
- Blocks to start from: `dashboard-01`, `analytics-01`, `chat-01`, `settings-01`, `auth-01`.

See `references/recipes.md` for screen recipes.

## Theme

- **Presets compose** (each replaces only its own group): `theme-<palette>` (dusk ocean rose sage amber graphite lavender mint cherry lagoon sand midnight), `material-<frosted|liquid|crystal|smoked|matte|vapor|neon>`, `shape-<round|soft|sharp|square>`, `motion-<spring|smooth|snappy|still>`, `density-<compact|default|comfortable>`, `type-<default|system|modern|editorial|friendly|technical|classic|grotesk>`.
- **Any primitive, any element:** `<Card className="[--glass-blur:8px] [--glass-opacity:70%]">`, `<section className="[--glass-density:0.85]">`.
- **At runtime / per subtree:** `<ThemeScope palette="ocean" material="liquid" scheme="dark">…</ThemeScope>`, or `theme={createGlassTheme({ palette: { hue: 200, harmony: "triadic" }, shape: "soft", tokens: {...} })}` from `@/lib/glass-theme`.
- **Fonts:** app fonts are shadcn `registry:font` items — `font-inter`, `font-heading-fraunces`, `font-mono-jetbrains-mono` (the CLI wires next/font). Theme fonts are optional overrides: `<ThemeScope fonts={{ heading: "fraunces" }} loadFonts>` or `[--glass-font-heading:…]`.
- **Type:** put `type-glass` on `<body>`; use `Heading`/`Text`/`Display` from `typography`, or `type-glass-heading` + `type-step-3` in your own components; `Prose` for Markdown/MDX. A type preset then restyles all of it.
- **Visually:** the Theme Studio at `https://glasscn.app/themes` exports CSS, a shadcn theme item (`npx shadcn add ./my-theme.json`) or a share link.

## Rules of thumb

1. Text on panes, not on the aurora.
2. One accent (`primary`); data uses `chart-1..5`.
3. Use the radius/height tokens (`rounded-surface`, `h-control`) in your own components so presets reach them.
4. Few large panes beat many small ones (backdrop-filter cost); offer `material-matte` on low-end.
5. Keep `legibility()` ≥ AA when you change frost or palette.
