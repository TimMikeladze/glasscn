---
name: extend-theme
description: Extend glasscn's theme system — add a primitive token, a palette, a material, shape or motion preset, or a new density — through the engine, the stylesheet, the generator and the tests. Use when asked for a new theming option, a new look, more customisation, or a new palette in glasscn.
---

# Extend the theme

Everything visual is a primitive in `TOKENS` (`src/lib/glass-theme.ts`). Presets are partial themes. Derived values are computed where they're used. Read `docs/rules/tokens.md` first — rule 2 (derived values never on `:root`) is the one that breaks scoping if ignored.

## Add a primitive

1. **Schema.** Add a `TokenDef` to `TOKENS` in the right group: `name` (`glass-*` / `aurora-*`), `label`, one-line `description`, `light` and `dark` defaults, and a `control` (`range(min, max, step, unit)`, `colour`, or `select` options).
2. **Use it.** Either in `registry/stylesheet.mjs` (a utility or a `themeTokens` entry — e.g. `"radius-thing": "var(--glass-thing)"` gives Tailwind `rounded-thing`) or directly in components (`[prop:var(--glass-thing)]`). Never derive it on `:root`.
3. **Presets.** If a material/shape/motion should change it, add it to that preset's `tokens` / `light` / `dark`.
4. **Generate and test.** `pnpm test` — it checks the default is sanitary, both schemes exist, select defaults are options, the foundation ships it, and nothing references an unknown variable.
5. **See it.** `/themes` shows it automatically under its group; `/docs/theming` lists it. Turn it to both extremes in light and dark.

## Add a palette

- **From a hue** (preferred): `mypalette: { title, description, theme: paletteFromHue({ hue, harmony, chroma }) }` in `PALETTES`.
- **Hand-tuned**: use `tuned(hue, light, dark)` like Dusk; give exact `primary`, three `aurora` and two `rings` colours per scheme, in OKLCH.
- Check `legibility(createGlassTheme({ palette: "mypalette" }), scheme)` isn't `low` in either scheme (add an assertion if you're unsure), and look at it in `/themes` in both schemes.
- `native-tokens` (`registry/native/tokens.tsx`) has its own palette table — add the hex equivalents there too.

## Add a material, shape or motion preset

Add to `MATERIALS` / `SHAPES` / `MOTIONS` with a one-line description. Only set tokens in that preset's groups (Material+Rim+Depth / Shape / Motion + `aurora-speed`). The generator publishes it as `material-<name>` etc. with the whole group filled, so it replaces the previous preset cleanly.

## Add a density

Add to `DENSITIES` (a multiplier). Everything density-aware reads `--glass-density`.

## Done means

- [ ] `pnpm test`, `pnpm typecheck`, `pnpm lint` green; `pnpm verify:install` if registry output changed.
- [ ] Looks right in `/themes` in both schemes, with the matte and neon materials.
- [ ] `docs/theming.md` updated if the model (not just a value) changed.
