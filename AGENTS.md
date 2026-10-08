# glasscn — agent notes

A shadcn registry of glass components, the theme engine behind it, and its docs site (Next 16, Tailwind v4, `radix-ui`, pnpm).

**Start here:** [`docs/architecture.md`](docs/architecture.md) (how it works) · [`docs/rules/`](docs/rules/README.md) (what you must follow) · [`docs/theming.md`](docs/theming.md) (the token model) · [`docs/spec.md`](docs/spec.md) (what's in it).

## Skills (in `skills/`, mirrored to `.claude/skills` and `.agents/skills` on install)

| Task | Skill |
|---|---|
| Add or rebuild a component or block | `build-glass-component` |
| New token, palette, material, shape, motion or density | `extend-theme` |
| Release / deploy | `ship-registry` |
| React Native item or token sync | `port-to-native` |
| Building an app *with* glasscn | `use-glasscn` |

## The five rules that break things if ignored

1. **Never edit generated files** — `registry.json`, `src/app/glass.generated.css`, `src/lib/sources.generated.ts`. Edit `registry/items.mjs`, `registry/stylesheet.mjs`, `src/lib/glass-theme.ts`; run `pnpm generate`.
2. **Primitives are plain values; derived values are computed where used** (utilities, `@theme inline`, component classes) — never on `:root`. Otherwise per-element and `ThemeScope` theming silently stop working. Tested.
3. **Tokens only in components** — `rounded-surface|control|button|badge`, `h-control*`, `px-pad*`, `bg-fill`, `border-glass-border`, `ease-glass`, `font-title`. No hex, no fixed radii/heights on themed parts.
4. **Shipped file base names are unique** — the shadcn CLI rewrites imports by file name. Tested.
5. **Liquid Glass (native) never sits under a fading ancestor.**

## Before you're done

```bash
pnpm typecheck && pnpm lint && pnpm test
pnpm verify:install          # when items, files, deps or the stylesheet change (~3 min)
```

Then look at it: `pnpm dev` → the item's `/docs/<name>` page and `/themes` (a few palettes, both schemes, `shape-square`, `density-compact`, `matte`).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
