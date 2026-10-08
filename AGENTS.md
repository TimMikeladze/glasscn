# glasscn — agent notes

shadcn registry of glass components + its docs site (Next 16, Tailwind v4, Radix via `radix-ui`, pnpm). Spec: `docs/spec.md`.

- **Never edit `registry.json`, `src/app/glass.generated.css` or `src/lib/sources.generated.ts`** — `scripts/generate.mjs` writes them from `registry/items.mjs` and `registry/tokens.mjs`.
- New item: component in `src/components/glass/<name>.tsx`, entry in `registry/items.mjs` (declare npm deps and `{REGISTRY_URL}` registry deps — `pnpm test` checks both), demo in `src/components/demos/<name>.tsx` + `demos/index.ts`, props in `src/lib/docs.ts`.
- Shipped file base names must be unique: the shadcn CLI rewrites imports by file name (a `lib/glass.ts` beside `components/glass/glass.tsx` broke installs). `pnpm test` guards it.
- Components: `data-slot`, `cva`, `cn` from `cn`, tokens only (no hex/palette classes), className last. Surfaces use the `glass*` utilities or `glassVariants`; customise with `--glass-bg` / `--glass-elevation`, not new variants.
- Native items (`registry/native/*`) are excluded from this tsconfig; verify with `node scripts/verify-native.mjs ../kaizen`. Liquid Glass must never sit under an ancestor that fades in.
- Dynamic docs routes wrap `await params` in `<Suspense>` (instant navigation).
- Before done: `pnpm typecheck && pnpm lint && pnpm test`, and `pnpm verify:install` when items change.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
