# Registry rules

1. **`registry/items.mjs` is the source.** Never edit `registry.json`; run `pnpm generate`.
2. **Declare what you import.** Every npm import in a shipped file is in `dependencies`; every `@/…` import of another item is in `registryDependencies` as `{REGISTRY_URL}/r/<name>.json`. `pnpm test` checks both.
3. **Unique base names.** The shadcn CLI rewrites imports by file name — two shipped files may never share one (`lib/glass.ts` beside `components/glass/glass.tsx` broke installs). Tested.
4. **Targets:** components → `@components/glass/<name>.tsx`, blocks → `@components/glass-blocks/<name>.tsx`, libs → `@lib/<name>.ts`, hooks → `@hooks/<name>.ts`, native → `@components/glass/native/<name>.tsx`. Never into `components/ui` — glasscn installs beside shadcn, not over it.
5. **The foundation never sets the user's accent.** `glass-style` ships every primitive except `primary`, `primary-foreground`, `ring` and `chart-*`; palettes set those.
6. **Presets are `registry:theme` items carrying their whole group** (`theme-*`, `material-*`, `shape-*`, `motion-*`, `density-*`, `type-*`). Type presets set Google fonts through `registryDependencies` on font items, never as `--glass-font-*` (system stacks are the exception: nothing to load).
7. **Fonts are shadcn `registry:font` items** named `font-<x>` / `font-heading-<x>` / `font-mono-<x>`, `font.family` = the fontsource family (`"Inter Variable"` for variable fonts), `import` = the next/font export, `selector` = headings for heading fonts and `code, kbd, samp, pre` for mono (the CLI otherwise applies `--font-mono` to `<html>`). Generated from `FONTS`; never hand-written.
8. **URLs are stamped at build.** `{REGISTRY_URL}` → `NEXT_PUBLIC_REGISTRY_URL`, else `https://glasscn.app` on Vercel, else localhost (`scripts/build-registry.mjs`, and `next.config.ts` for the site).
9. **An item isn't done until it installs.** `pnpm verify:install` adds every web item to a fresh Next app and builds it; run it whenever items, files or dependencies change.
