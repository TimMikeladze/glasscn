---
name: use-glasscn
description: Build UI with glasscn, the glassmorphic shadcn registry — install it, compose screens from its components and blocks, theme it (palettes, materials, shapes, density, motion, per-subtree ThemeScope), and follow its design rules. Use in any app that has or wants glasscn components (components/glass, glass-style in globals.css), or when asked for glassmorphism, frosted/iOS-style UI on shadcn.
---

# Use glasscn

glasscn = shadcn components in frosted glass over a drifting aurora. Same APIs as shadcn; every visual is a CSS variable.

## Install

```bash
npx shadcn@latest add https://<host>/r/glass-style.json https://<host>/r/theme-dusk.json   # foundation + a palette
npx shadcn@latest add https://<host>/r/aurora.json https://<host>/r/card.json https://<host>/r/button.json
```

Or add `"registries": { "@glasscn": "https://<host>/r/{name}.json" }` to `components.json` and `npx shadcn add @glasscn/dock`. Components land in `components/glass/`, blocks in `components/glass-blocks/`.

Put `<Aurora />` once in the root layout — glass needs something to frost.

## Compose

- Swap shadcn imports: `@/components/ui/card` → `@/components/glass/card`. Same parts and props.
- Floating layers (dialogs, menus, popovers, toasts) are already `glass-strong`. In-flow cards are `glass`. Quiet panes: `<Glass intensity="subtle">`.
- Inside a pane, use fills (`bg-fill`), not another pane. Two levels of glass at most.
- iOS-style pieces with no shadcn equivalent: `SegmentedControl`, `Dock` (floating tab bar + action), `GroupedList` (Settings rows), `ActivityRings`, `ProgressRing`, `Sparkline`, `Stat`, `Heatmap`.
- Blocks to start from: `dashboard-01`, `settings-01`, `auth-01`.

See `references/recipes.md` for screen recipes.

## Theme

- **Presets compose** (each replaces only its own group): `theme-<palette>` (dusk ocean rose sage amber graphite lavender mint cherry lagoon sand midnight), `material-<frosted|liquid|crystal|smoked|matte|vapor|neon>`, `shape-<round|soft|sharp|square>`, `motion-<spring|smooth|snappy|still>`, `density-<compact|default|comfortable>`.
- **Any primitive, any element:** `<Card className="[--glass-blur:8px] [--glass-opacity:70%]">`, `<section className="[--glass-density:0.85]">`.
- **At runtime / per subtree:** `<ThemeScope palette="ocean" material="liquid" scheme="dark">…</ThemeScope>`, or `theme={createGlassTheme({ palette: { hue: 200, harmony: "triadic" }, shape: "soft", tokens: {...} })}` from `@/lib/glass-theme`.
- **Visually:** the Theme Studio at `https://<host>/themes` exports CSS, a shadcn theme item (`npx shadcn add ./my-theme.json`) or a share link.

## Rules of thumb

1. Text on panes, not on the aurora.
2. One accent (`primary`); data uses `chart-1..5`.
3. Use the radius/height tokens (`rounded-surface`, `h-control`) in your own components so presets reach them.
4. Few large panes beat many small ones (backdrop-filter cost); offer `material-matte` on low-end.
5. Keep `legibility()` ≥ AA when you change frost or palette.
