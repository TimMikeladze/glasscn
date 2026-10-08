# Token rules

1. **Primitives are plain values.** A primitive (`TOKENS` in `src/lib/glass-theme.ts`) never references another variable. Enforced by `registry.test.mjs`.
2. **Derived values are computed where used.** Colour mixes, radii scales, density calcs live in `registry/stylesheet.mjs` (`themeTokens` / utilities) or inline in a component class — never on `:root`. This is what makes every primitive overridable on any subtree.
3. **Every primitive has both schemes.** `light` and `dark` defaults, even when equal. Only `optional` primitives (the `glass-font-*` overrides) default to empty, and the generator never writes an empty value — `--x: ;` would block the `var()` fallback.
4. **Every primitive has a control.** `range` (with min, max, step, unit), `colour` (OKLCH), or `select` (named options). The studio and docs are generated from it.
5. **Names:** `glass-*` for material, rim, depth, shape, density, motion and type; `aurora-*` for the ground; shadcn's own names (`primary`, `ring`, `chart-N`) for the accent. Kebab-case, no scheme in the name.
6. **Colours are OKLCH.** So `legibility()` and the studio's colour editor can read them.
7. **Units are explicit** (`28px`, `52%`, `200ms`, `-0.015em`); multipliers are bare numbers (`--glass-density: 1`).
8. **Font fallbacks are baked at build.** Font chains are `var(--glass-font-heading, --theme(--font-heading, …))`: Tailwind resolves `--theme()` at build, because `@theme inline` font tokens don't exist at runtime.
9. **Values are inert.** `sanitizeValue` allows only characters that can't end a declaration; textures are base64 SVG `url(data:…)`. Anything written into CSS at runtime (ThemeScope, the studio, share links) goes through it.
10. **Groups own presets.** A new preset sets only tokens in its group(s), and the generator emits the whole group so presets replace each other cleanly.
11. **Adding a primitive is four edits:** `TOKENS` entry → used in `stylesheet.mjs` or a component → tests (`pnpm test`) → docs regenerate themselves. See the `extend-theme` skill.
