# Handoff — continue the glasscn roadmap at M4

Paste into a new session:

---

Continue the glasscn roadmap in /Users/tim/workspace/glasscn (branch `liquid-glass-m0-m1`, pushed to origin, last commit `93e5709`). M0–M3 are done and committed (200 roadmap items closed, 257 open).

Read first, in order: `AGENTS.md`, `docs/roadmap.md` (Decisions, Progress, Milestones — IDs are stable, cite them in commits), `docs/liquid-glass.md` §3.9 (native track), `docs/specs/m2-liquid-layer.md` and `docs/specs/m3-parity-forms.md` (what the web side now has), `docs/sandbox.md`, `skills/port-to-native/SKILL.md`, `docs/apple-hig-reference.md`, `CHANGELOG.md`. Load the `expo-overview` skill before native work and follow its routing (`expo-ui`, `expo-animation`, `expo-router`).

Do **M4 — native rebuild**, in order:
1. NAT-60: native tokens generated from the web theme (`glass-theme.ts` → native token module via `pnpm generate`; generated file, tested).
2. NAT-03, NAT-80..83: two-layer native glass (material vs liquid), real native controls via `@expo/ui` (SwiftUI / Jetpack Compose) where they exist, Reanimated + gesture-handler for press/drag/springs, NativeTabs + navigation pieces, Android blur tier.
3. Every open NAT P1: NAT-05, 10, 11, 12, 14, 17, 18, 20, 21, 23, 24, 27, 30–33, 35–39, 42, 44–46, 49, 55, 57–59, 61, 62, 66, 67, 69, 71, 73, 76, 77 (skip ticked ones).
4. NAT-50..54: native tests.
5. Native parity for every M2/M3 item. Known gaps: dock drag-to-scrub, navigation-bar scroll tracking (takes `collapsed` today), activity-rings rebuild (still old anatomy), backdrop video (poster only), chat virtualisation, confirmation-popover → action sheet on phones.

Write a short spec in `docs/specs/m4-native.md` first, then build, then verify.

Rules that bite:
- Never edit generated files (`registry.json`, `src/app/glass.generated.css`, `src/lib/sources.generated.ts`, and the new native token file); edit sources, run `pnpm generate`.
- Native and web share prop names and parts; every native item stays in `NATIVE_NAMES` and installs via `@glasscn-app/native-<name>`.
- Liquid Glass (native) never sits under a fading ancestor. Never glass on glass; liquid only on the control layer. Reduce Transparency → solid fallback. WCAG AA everywhere.
- Shipped file base names stay unique (shadcn rewrites imports by name).
- Don't touch the user's home-page work: `src/app/page.tsx`, `src/components/site/{component-gallery,home-examples,theme-strip}.tsx`, `docs/home-page.md` — stash before committing if they're dirty.
- A dev server usually runs on :3011 — never kill it. Metro/Expo: pick a free port.
- Namespace `@glasscn-app`; npm `@glasscn/*`; everything free; no PRs or public posts without asking. CI only runs on `main` and PRs.
- Minimise tokens: ≤ 3 parallel agents with disjoint files (e.g. tokens+glass core / controls / navigation+data); you own shared files' integration; no narration; one full verification at the end.

Done when: `pnpm typecheck && pnpm lint && pnpm test`, `pnpm verify:install`, `pnpm verify:native`, `pnpm test:e2e` green; sandbox/native checked on iOS simulator (and Android emulator if available) in light/dark with Reduce Transparency; web `/docs/*` unchanged (visual baselines pass); roadmap ticked with partial notes; CHANGELOG updated; committed and pushed on the branch. Then report and stop.

---

## Milestones left

| | Milestone | Scope |
|---|---|---|
| M4 | Native rebuild | generated native tokens, two-layer native glass, `@expo/ui` controls, Reanimated + gesture-handler, NativeTabs, Android blur tier, native tests, M2/M3 parity |
| M5 | Showcase and site | app-shell, photos, media viewer, AI chat blocks; home rebuild; search; per-item examples, guidance, keyboard tables; studio upgrades |
| M6 | Distribution and growth | versioning + changelog page, pinned deps, Base UI builds, framework matrix, `@glasscn/*` npm packages, directory listing, Figma kit |
| M7 | Advanced and polish | refraction (Chromium), adaptive tone, squircles, window focus, remaining P2s |
