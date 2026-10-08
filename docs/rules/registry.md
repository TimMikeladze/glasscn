# Registry rules

1. **`registry/items.mjs` is the source.** Never edit `registry.json`; run `pnpm generate`.
2. **Declare what you import.** Every npm import in a shipped file is in `dependencies`; every `@/…` import of another item is in `registryDependencies` as `{REGISTRY_URL}/r/<name>.json`. `pnpm test` checks both.
3. **Unique base names.** The shadcn CLI rewrites imports by file name — two shipped files may never share one (`lib/glass.ts` beside `components/glass/glass.tsx` broke installs). Tested.
4. **Targets:** components → `@components/glass/<name>.tsx`, blocks → `@components/glass-blocks/<name>.tsx`, libs → `@lib/<name>.ts`, hooks → `@hooks/<name>.ts`, native → `@components/glass/native/<name>.tsx`. Never into `components/ui` — glasscn installs beside shadcn, not over it.
5. **The foundation never sets the user's accent.** `glass-style` ships every primitive except `primary`, `primary-foreground`, `ring` and `chart-*`; palettes set those.
6. **Presets are `registry:theme` items carrying their whole group** (`theme-*`, `material-*`, `shape-*`, `motion-*`, `density-*`).
7. **URLs are stamped at build.** `{REGISTRY_URL}` → `NEXT_PUBLIC_REGISTRY_URL`, else the Vercel production URL, else localhost.
8. **An item isn't done until it installs.** `pnpm verify:install` adds every web item to a fresh Next app and builds it; run it whenever items, files or dependencies change.
