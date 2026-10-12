# glasscn

A shadcn-compatible registry of glass components: frosted surfaces over an animated aurora, iOS-style controls and data pieces. You install them as source with the shadcn CLI and theme them with CSS variables. Every component and block also has a React Native version.

```bash
pnpm dlx shadcn@latest add https://glasscn.app/r/glass-style.json https://glasscn.app/r/theme-dusk.json
pnpm dlx shadcn@latest add https://glasscn.app/r/card.json https://glasscn.app/r/button.json
```

Or set the namespace once in `components.json` and add items by name:

```json
"registries": { "@glasscn-app": "https://glasscn.app/r/{name}.json" }
```

```bash
pnpm dlx shadcn@latest add @glasscn-app/dock
```

## What's in it

| | Items |
|---|---|
| Foundation | `glass-style` (101 primitives, `glass` / `glass-strong` / `glass-subtle` and the liquid-layer utilities, theme tokens, keyframes, fallbacks, `glassVariants`); `glass-theme` (the theme engine); `glass-charts`; `use-sliding-indicator`; `use-glass-pointer` |
| Palettes (12) | `theme-dusk` `-ocean` `-rose` `-sage` `-amber` `-graphite` `-lavender` `-mint` `-cherry` `-lagoon` `-sand` `-midnight` |
| Materials (7) | `material-frosted` `-vivid` `-crystal` `-smoked` `-matte` `-vapor` `-neon` |
| Shape · Motion · Density | `shape-round` `-soft` `-sharp` `-square` · `motion-spring` `-smooth` `-snappy` `-still` · `density-compact` `-default` `-comfortable` |
| Surfaces | `aurora` `glass` `card` `theme-scope` |
| Controls | `button` `badge` `input` `textarea` `label` `checkbox` `switch` `segmented-control` `tabs` `slider` `progress` `kbd` `separator` `avatar` `glass-preferences` |
| Overlays | `dialog` `sheet` `popover` `tooltip` `dropdown-menu` `toaster` |
| Navigation | `dock` `grouped-list` |
| Data | `activity-rings` `progress-ring` `sparkline` `stat` `heatmap` `bar-list` `gauge` `tracker` `category-bar` |
| Charts | `chart` `area-chart` `bar-chart` `line-chart` `donut-chart` (TanStack Charts) |
| Tables | `table` `data-table` (TanStack Table v9) |
| Chat | `chat` |
| Blocks | `dashboard-01` `analytics-01` `settings-01` `auth-01` `chat-01` |
| React Native | `native-tokens` `native-glass` `native-aurora` `native-press` `native-ui`, plus a `native-<name>` twin of every component and block (iOS, Android and web through react-native-web) |

Components that shadcn also has (Button, Card, Dialog, Tabs and so on) keep shadcn's props and parts, so switching is an import change from `@/components/ui/x` to `@/components/glass/x`. Files land in `components/glass/`, next to shadcn's, and never overwrite them.

The theme is 101 primitives in eleven groups: colour, material (frost, blur, saturation, brightness, sheen, grain), rim, depth (shadow, inner glow), shape, density, motion, aurora, fonts and type. Presets compose. You can override any primitive on any element (`[--glass-blur:8px]`), and `ThemeScope` re-themes a subtree at runtime.

The Theme Studio at `/themes` has a control for every primitive, a hue-harmony palette generator, randomise, a scoped live preview with its own scheme and a legibility estimate. It exports a one-line `npx shadcn add` command, CSS, a shadcn theme item, TypeScript or a share link, and can apply the theme to the whole site.

Every part has `data-slot`. Components use `cva` variants, `cn`, the unified `radix-ui` package, `asChild` and Tailwind v4, respect `prefers-reduced-motion`, and fall back to a 92% opaque tint where `backdrop-filter` isn't supported.

## For agents and contributors

- [`docs/architecture.md`](docs/architecture.md): how the pipeline, tokens and registry fit together
- [`docs/rules/`](docs/rules/README.md): design, components, tokens, registry, accessibility, performance, native
- [`skills/`](skills): `build-glass-component`, `extend-theme`, `ship-registry`, `port-to-native`, `use-glasscn` (mirrored into `.claude/skills` and `.agents/skills` on `pnpm install`)

## Develop

```bash
pnpm install
pnpm dev                 # generate + docs site (registry served from /r; install commands follow the dev port)
```

- `registry/items.mjs`: every item (edit this, not registry.json)
- `src/lib/glass-theme.ts`: the theme engine, with the schema of every primitive, palettes and presets, the generator and exports (ships as `glass-theme`)
- `registry/stylesheet.mjs`: utilities and Tailwind tokens, all derived from primitives
- `src/components/glass/*`: web components
- `src/components/blocks/*`: blocks
- `registry/native/*`: React Native
- `src/components/demos/*`: one live example per item (shown as "Code" in the docs)

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

## Build and deploy

`pnpm build` generates, builds the registry into `public/r` and builds the docs site. Registry URLs are stamped from `NEXT_PUBLIC_REGISTRY_URL`, else `https://glasscn.app` on Vercel, else localhost. Spec: [`docs/spec.md`](docs/spec.md).

## License

[MIT](LICENSE)
