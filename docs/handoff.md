# Handoff — continue the glasscn roadmap at M2

Paste into a new session:

---

Continue the glasscn roadmap in /Users/tim/workspace/glasscn (branch `liquid-glass-m0-m1`, last commit `af84650`). M0 and M1 are done and committed (97 roadmap items closed, 360 open).

Read first, in order: `AGENTS.md`, `docs/roadmap.md` (Decisions, Progress, Milestones — IDs are stable, cite them in commits), `docs/liquid-glass.md` (Part 3 = design of every LG item), `docs/specs/m1-foundations.md` (what M1 built: material vs liquid surfaces, `--glass-clarity`, a11y overrides, tokens, `glass-focus`, `hit-area`, `rounded-concentric`, Apple text styles, springs), `docs/apple-hig-reference.md` (component specs), `CHANGELOG.md`.

Do **M2 — the liquid layer**: LG-04..07, LG-09..11, LG-13, LG-14, NAV-01..06, BTN-02..05, SWT-02, SLD-03, SEG-01..02, DCK-02..04, SHT-01..03, DLG-01..03, POP-01, MNU-01, TST-01..03, UX-02, UX-04, UX-06, QA-02, QA-03, QA-09 (skip any already ticked). Write a short spec in `docs/specs/m2-liquid-layer.md` first, then build, then verify.

Rules that bite:
- Never edit generated files (`registry.json`, `src/app/glass.generated.css`, `src/lib/sources.generated.ts`); edit `registry/items.mjs`, `registry/stylesheet.mjs`, `src/lib/glass-theme.ts`, then `pnpm generate`.
- Primitives are plain values; derived values live in `stylesheet.mjs` utilities / theme tokens. Never nest an `@media` inside an `@utility` (the shadcn CLI mangles it; tested).
- Tokens only in components (tested: no literal colours, `outline-none`, raw `backdrop-blur`). Never glass on glass (structural test). Liquid only on the control layer.
- Every palette × material × scheme must stay WCAG AA (`legibilityReport` test).
- Don't touch the user's uncommitted home-page work: `src/app/page.tsx`, `src/components/site/{component-gallery,home-examples,theme-strip}.tsx`, `docs/home-page.md` — stash them before committing, pop after.
- A dev server usually runs on :3011 — never kill it; use it or start another port.
- shadcn namespace is `@glasscn-app` (permanent); npm packages go under `@glasscn/*`. Everything is free (MIT). Don't open PRs or post anywhere public without asking.
- Minimise tokens: at most 2–3 parallel agents with disjoint file ownership; you own `stylesheet.mjs` and `glass-theme.ts`; no per-step narration; run the full verification once at the end.

Done when: `pnpm typecheck && pnpm lint && pnpm test`, `pnpm verify:install`, `pnpm verify:native` green; browser check of changed `/docs/*` pages light/dark/phone/RTL; roadmap items ticked with notes for partial ones; CHANGELOG updated; commit on the branch (stash the user's WIP first). Then report and stop for the next milestone.

---

## Milestones left

| | Milestone | Scope |
|---|---|---|
| M2 | The liquid layer | Light (specular rim, edge shade, illumination), prominent tinted glass, glass knobs, materialise + morph-from-source, elastic press, `GlassGroup`, toolbar, scroll edge, dock minimise/accessory/search, sheet detents, sidebar, search field, visual regression + axe |
| M3 | Parity and forms | select, radio-group, field, input-group, command, combobox, calendar, accordion, toggle-group, … ; data-table v2; chart selection/a11y/states; AI chat parts; widgets, KPI |
| M4 | Native rebuild | generated native tokens, two-layer native glass, `@expo/ui` native controls, Reanimated + gesture-handler, NativeTabs recipe, Android blur tier, native tests |
| M5 | Showcase and site | app-shell, photos, media viewer, AI chat blocks; home rebuild; search; per-item examples, guidance, keyboard tables; studio upgrades |
| M6 | Distribution and growth | versioning + changelog page, pinned deps, Base UI builds, framework matrix, `@glasscn/*` npm packages, directory listing, Figma kit |
| M7 | Advanced and polish | refraction (Chromium), adaptive tone, squircles, window focus, remaining P2s |
