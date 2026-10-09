# glasscn

**Glass, for shadcn.** A shadcn-compatible registry of glassmorphic components — frosted surfaces over a living aurora, iOS-grade controls and data pieces — installed as source with the shadcn CLI and themed entirely with CSS variables. React Native versions included.

```bash
pnpm dlx shadcn@latest add https://glasscn.app/r/glass-style.json https://glasscn.app/r/theme-dusk.json
pnpm dlx shadcn@latest add https://glasscn.app/r/card.json https://glasscn.app/r/button.json
```

Or set the namespace once in `components.json` — `"registries": { "@glasscn": "https://glasscn.app/r/{name}.json" }` — and `shadcn add @glasscn/dock`.

## What's in it

| | Items |
|---|---|
| Foundation | `glass-style` — 50 primitives, `glass` / `glass-strong` / `glass-subtle` utilities, theme tokens, keyframes, fallbacks, `glassVariants`; `glass-theme` (the theme engine); `glass-charts`; `use-sliding-indicator` |
| Palettes (12) | `theme-dusk` `-ocean` `-rose` `-sage` `-amber` `-graphite` `-lavender` `-mint` `-cherry` `-lagoon` `-sand` `-midnight` |
| Materials (7) | `material-frosted` `-liquid` `-crystal` `-smoked` `-matte` `-vapor` `-neon` |
| Shape · Motion · Density | `shape-round` `-soft` `-sharp` `-square` · `motion-spring` `-smooth` `-snappy` `-still` · `density-compact` `-default` `-comfortable` |
| Surfaces | `aurora` `glass` `card` `theme-scope` |
| Controls | `button` `badge` `input` `textarea` `label` `checkbox` `switch` `segmented-control` `tabs` `slider` `progress` `kbd` `separator` `avatar` |
| Overlays | `dialog` `sheet` `popover` `tooltip` `dropdown-menu` `toaster` |
| Navigation | `dock` `grouped-list` |
| Data | `activity-rings` `progress-ring` `sparkline` `stat` `heatmap` `bar-list` `gauge` `tracker` `category-bar` |
| Charts | `chart` `area-chart` `bar-chart` `line-chart` `donut-chart` (TanStack Charts) |
| Tables | `table` `data-table` (TanStack Table v9) |
| Chat | `chat` |
| Blocks | `dashboard-01` `analytics-01` `settings-01` `auth-01` `chat-01` |
| React Native | `native-tokens` `native-glass` `native-aurora` `native-press` |

- **shadcn's APIs, in glass.** Button, Card, Dialog, Tabs… keep their props and parts — swapping is `@/components/ui/x` → `@/components/glass/x`. Files land in `components/glass/`, beside shadcn's, never over them.
- **68 primitives in eleven groups** — colour, material (frost, blur, saturation, brightness, sheen, grain), rim, depth (shadow, inner glow), shape, density, motion, aurora, fonts, type. Presets compose; any primitive can be overridden on any element (`[--glass-blur:8px]`); `ThemeScope` re-themes a subtree at runtime.
- **Theme Studio** at `/themes` — every primitive as a control, a hue-harmony palette generator, randomise, a scoped live preview with its own scheme, a legibility estimate, export to CSS / a shadcn theme item / TypeScript / a share link, and "apply to the whole site".
- **Standards.** `data-slot` on every part, `cva` variants, `cn`, unified `radix-ui`, `asChild`, Tailwind v4, `prefers-reduced-motion`, a no-`backdrop-filter` fallback.

## For agents and contributors

- [`docs/architecture.md`](docs/architecture.md) — how the pipeline, tokens and registry fit together
- [`docs/rules/`](docs/rules/README.md) — design, components, tokens, registry, accessibility, performance, native
- [`skills/`](skills) — `build-glass-component`, `extend-theme`, `ship-registry`, `port-to-native`, `use-glasscn` (mirrored into `.claude/skills` and `.agents/skills` on `pnpm install`)

## Develop

```bash
pnpm install
pnpm dev                 # generate + docs site on :3000 (registry served from /r)
```

- `registry/items.mjs` — every item (edit this, not registry.json)
- `src/lib/glass-theme.ts` — the theme engine: the schema of every primitive, palettes and presets, generator, exports (ships as `glass-theme`)
- `registry/stylesheet.mjs` — utilities and Tailwind tokens, all derived from primitives
- `src/components/glass/*` — web components · `src/components/blocks/*` — blocks · `registry/native/*` — React Native
- `src/components/demos/*` — one live example per item (shown as "Code" in the docs)

## Check

```bash
pnpm typecheck
pnpm lint
pnpm test                # theme engine, chart maths, registry integrity (files, deps, unique names, no derived primitives)
pnpm verify:install      # fresh Next app → shadcn init → add every web item, presets and a local exported theme → tsc → next build
pnpm verify:native      # native items from the registry into a copy of the sandbox → tsc
pnpm sandbox:native     # the Expo sandbox (sandbox/native): every native item live — i for iOS, w for web
```

CI (`.github/workflows/ci.yml`) runs typecheck, lint and test on every push and PR, then `verify:install` and the native sandbox checks (`npm run typecheck` in `sandbox/native`, `verify:native`).

## Build & deploy

`pnpm build` generates, builds the registry into `public/r` (stamping `NEXT_PUBLIC_REGISTRY_URL`, else `https://glasscn.app` on Vercel, else localhost), and builds the docs site. Spec: [`docs/spec.md`](docs/spec.md).

## License

[MIT](LICENSE)
