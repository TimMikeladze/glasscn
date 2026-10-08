# glasscn

**Glass, for shadcn.** A shadcn-compatible registry of glassmorphic components — frosted surfaces over a living aurora, iOS-grade controls and data pieces — installed as source with the shadcn CLI and themed entirely with CSS variables. Born in the [Kaizen](../kaizen) app; React Native versions included.

```bash
pnpm dlx shadcn@latest add https://<your-host>/r/glass-style.json https://<your-host>/r/theme-dusk.json
pnpm dlx shadcn@latest add https://<your-host>/r/card.json https://<your-host>/r/button.json
```

Or set the namespace once in `components.json` — `"registries": { "@glasscn": "https://<your-host>/r/{name}.json" }` — and `shadcn add @glasscn/dock`.

## What's in it

| | Items |
|---|---|
| Foundation | `glass-style` — tokens, `glass` / `glass-strong` / `glass-subtle` utilities, keyframes, fallbacks, `glassVariants`; `use-sliding-indicator`; `glass-charts` |
| Palettes | `theme-dusk` `theme-ocean` `theme-rose` `theme-sage` `theme-amber` `theme-graphite` |
| Surfaces | `aurora` `glass` `card` |
| Controls | `button` `badge` `input` `textarea` `label` `switch` `segmented-control` `tabs` `slider` `progress` `kbd` `separator` |
| Overlays | `dialog` `sheet` `popover` `tooltip` `dropdown-menu` `toaster` |
| Navigation | `dock` `grouped-list` |
| Data | `activity-rings` `progress-ring` `sparkline` `stat` `heatmap` |
| Blocks | `dashboard-01` `settings-01` `auth-01` |
| React Native | `native-tokens` `native-glass` `native-aurora` `native-press` |

- **shadcn's APIs, in glass.** Button, Card, Dialog, Tabs… keep their props and parts — swapping is `@/components/ui/x` → `@/components/glass/x`. Files land in `components/glass/`, beside shadcn's, never over them.
- **Tokens all the way down.** `--glass`, `--glass-border`, `--glass-blur`, `--glass-saturate`, `--aurora-1..3`… Two hooks restyle any surface from a class: `--glass-bg` (fill) and `--glass-elevation` (shadow).
- **Standards.** `data-slot` on every part, `cva` variants, `cn`, unified `radix-ui`, `asChild`, Tailwind v4, `prefers-reduced-motion`, a no-`backdrop-filter` fallback.

## Develop

```bash
pnpm install
pnpm dev                 # generate + docs site on :3000 (registry served from /r)
```

- `registry/items.mjs` — every item (edit this, not registry.json)
- `registry/tokens.mjs` — every token and palette; generates the foundation's CSS vars, the themes, and the site's CSS
- `src/components/glass/*` — web components · `src/components/blocks/*` — blocks · `registry/native/*` — React Native
- `src/components/demos/*` — one live example per item (shown as "Code" in the docs)

## Check

```bash
pnpm typecheck
pnpm lint
pnpm test                # chart maths + registry integrity (files exist, deps resolve, unique file names)
pnpm verify:install      # fresh Next app → shadcn init → shadcn add every web item → tsc → next build
node scripts/verify-native.mjs ../kaizen   # native items into a copy of an Expo app → tsc
```

## Build & deploy

`pnpm build` generates, builds the registry into `public/r` (stamping `NEXT_PUBLIC_REGISTRY_URL`, or the Vercel production URL), and builds the docs site. Spec: [`docs/spec.md`](docs/spec.md).
