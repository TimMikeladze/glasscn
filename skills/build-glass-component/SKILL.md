---
name: build-glass-component
description: Add a new component or block to the glasscn registry end to end — the component file, its registry entry, a live demo, docs props, tests and the install check. Use when asked to add, port or rebuild a UI component in glasscn (src/components/glass), or to turn an existing shadcn component into a glass one.
---

# Build a glass component

A glasscn component is a shadcn component that wears the theme: same API as shadcn's where one exists, every visual decision read from a token, installed into a stranger's project by URL.

Read `docs/rules/components.md` and `docs/rules/design.md` once before starting. They are the contract; this file is the procedure.

## The loop

1. **Find the shadcn original, if there is one.** `pnpm dlx shadcn@latest view <name>` (or add it to a scratch project) and keep its parts, prop names and `data-slot`s. glasscn adds; it does not rename.
2. **Write `src/components/glass/<name>.tsx`.** Start from the closest exemplar below. Tokens only — see `references/tokens-cheatsheet.md`.
3. **Register it in `registry/items.mjs`** with `ui(name, title, description, { deps, reg, categories })`. `deps` = every npm package you import (`cn` is implied); `reg` = every other glasscn item you import (`at("button")`, `hook`, `charts`, `at("glass-theme")`).
4. **Demo:** `src/components/demos/<name>.tsx` (default export, realistic content — a Kaizen-like journal app is the house style) and add it to `src/components/demos/index.ts`.
5. **Docs:** props and notes in `PROPS` in `src/lib/docs.ts` for anything not obvious from shadcn.
6. **Pure logic?** Put it in `src/lib/glass-charts.ts` (or a new lib item) with tests in `src/lib/__tests__/`. Components render; libraries compute.
7. **Check:** `pnpm typecheck && pnpm lint && pnpm test`. The registry test tells you about undeclared imports, missing files and colliding file names.
8. **Install it for real:** `pnpm verify:install` (about 3 minutes) — a fresh Next app adds every item and builds.
9. **Look at it.** `pnpm dev`, open `/docs/<name>`, switch palette (header), light/dark, and try it in `/themes` with a sharp shape, compact density and the `matte` and `neon` materials. If it ignores any of those, a value is hard-coded.

## Exemplars — read one, not all

| You're building | Read |
|---|---|
| A surface with parts (header/content/footer) | `card.tsx` |
| A control with variants and sizes | `button.tsx` |
| A Radix primitive restyled | `switch.tsx`, `slider.tsx` |
| Something with a sliding selection | `segmented-control.tsx` + `hooks/use-sliding-indicator.ts` |
| A floating layer (portal) | `dialog.tsx`, `dropdown-menu.tsx` |
| A data visual | `activity-rings.tsx` + `lib/glass-charts.ts` |
| A compound list | `grouped-list.tsx` |
| A block (composition of items) | `src/components/blocks/settings-01.tsx` (register with `block()` in items.mjs) |

## Done means

- [ ] Every part has `data-slot`; `className` merges last through `cn`.
- [ ] No hex, no `bg-white/…`, no fixed radius/height on themed parts — `rounded-surface|control|button|badge`, `h-control*`, `px-pad*`, `ease-glass`, `ring-(length:--glass-ring-width)`.
- [ ] Reads correctly in all 12 palettes, both schemes, `shape-square` and `density-compact`.
- [ ] Keyboard: focus ring visible, Radix handles roles.
- [ ] Demo + docs entry + registry entry + `pnpm verify:install` green.
