# Apple Liquid Glass 27 implementation plan

**Goal:** research, audit, rebuild and demonstrate Apple's current Liquid Glass behavior across glasscn web and native.

**Spec:** `docs/specs/apple-liquid-glass-27.md`. **Stack:** Next 16, React 19, Tailwind 4, Radix, Expo 57, React Native 0.86, native system controls and Reanimated.

## Constraints

Edit generator sources, never generated outputs. Keep primitives plain and derived CSS local. Components use tokens. Native Liquid Glass never has a fading ancestor. Apple facts require primary-source citations; web shader/metric choices must be labeled. No backward compatibility requirement. Work in the current checkout; no publishing or deployment is requested.

## Tasks

- [x] **1. Evidence and inventory.** Write the Apple source study and complete web/native family audits under `docs/research`. Inspect actual APIs and current rendered baseline. Derive fixes from those reports and update stale rules/reference prose.
- [x] **2. Web optical material.** Root owns `src/lib/glass-optics.ts`, `src/components/glass/glass-effects.tsx`, `liquid-glass.tsx`, `registry/stylesheet.mjs`, theme primitives and registry integration. Add failing tests for map symmetry/neutral center/clamping before implementation; verify Chromium pixels, CSS fallback and preference changes. Public interface: `GlassEffects` enhances descendant/new portaled control surfaces; `LiquidGlass` composes a local liquid surface. All numeric optics settings are glasscn choices.
- [x] **3. Behavioral parity.** Fix verified web/native sidebar, toolbar/scroll edge, sheet, glass material/tint/visibility, group and custom-control issues. Native and web implementation tasks can run on disjoint source files after their audits. Add regression tests for behavior, not snapshots of code. Root integrates shared registry/schema files. Each task gets an independent review.
- [x] **4. Apple recreation showcase.** Build installable example compositions and a source-linked `/showcase` page; integrate an entry into the home/site navigation. Add matching native sandbox experiences. Test the interactions, theme variants, keyboard/focus and both schemes. Avoid displaying implementation internals inside the example apps.
- [x] **5. Completion audit.** Run required checks and real installs, inspect browser and simulator artifacts, independently review all changes and close findings. Update the studies, component docs, changelog and this work record with evidence. Keep the goal active while any explicit requirement lacks proof.

## Review focus

Preference changes while overlays are open; source controls inside scoped themes but portaled content outside them; keyboard/mobile sidebar focus; sheet path selection for controlled detents and initial detent; optics resize/cache cleanup and fallback pixels in non-Chromium engines.

## Progress

All five steps are complete within the documented platform and renderer boundaries. The [Apple study](../research/apple-liquid-glass-2026-11.md) contains 20 sourced recreation references. The [web audit](../research/web-liquid-glass-audit.md) inventories all 83 original component entries and five blocks; the [native audit](../research/native-liquid-glass-audit.md) inventories all 92 original TSX files. Confirmed important review findings were fixed, including interrupted web source transitions and repeated parent-rejected native scrubs.

Verified web evidence on November 8, 2026: 26 unit-test files / 314 tests, 254 browser checks across Chromium/WebKit/Firefox, production build, and all 107 web registry items installed/type-checked/built in a fresh Next app. The browser suite includes actual displaced-pixel comparisons, portal allocation/release, fixed-width merging geometry, source transitions, keyboard/focus, axe, the unchanged visual baselines and blur budgets. Phone previews were inspected across Dusk light, Ocean dark compact and Rose light square/matte.

The native implementation uses actual Expo 57 system-effect/control APIs. The final fresh CLI install passed for all **97 native items**, with TypeScript and **10 suites / 258 tests**, after the controlled-gesture, comma-separated SVG viewBox and largest-Dynamic-Type fixes, including the final Music surface radius. The [runtime appendix](../research/apple-liquid-glass-2026-11.md#observed-glasscn-runtime) records 36 default/reduced-motion/reduced-transparency coverage captures plus targeted corrected states and interactions. Custom horizontal slider dragging changed 40→100; vertical dragging scrolled without changing 100. Custom sheets expanded from the small detent to large and drag-dismissed. The largest-text Music screenshot shows all three labels within bounds and Radio selected; the simulator was restored to normal text size/light appearance and the preview overrides cleared. Unit mocks do not prove compositor output. No Android, physical-device, native macOS or manual screen-reader runtime claim is made.

### Final gate evidence

| Gate | Result on November 8, 2026 |
|---|---|
| `pnpm typecheck && pnpm lint && pnpm test` | Pass: 26 files / 314 tests. Zero lint errors; one existing TanStack Virtual / React Compiler warning. |
| `pnpm test:e2e` | Pass: 254 browser checks; unchanged visual baselines, axe, behavior, actual optical pixels and blur budgets. |
| `pnpm verify:install` | Pass: 107 items installed, type-checked and production-built in a fresh Next app. |
| `pnpm verify:native` | Pass: 97 items installed into a fresh sandbox copy, type-checked and tested against installed files; 10 suites / 258 tests. |
| `pnpm build` and preview | Pass: production output includes `/showcase`; local showcase and registry item endpoints return 200. |

Curated, unedited captures are kept in the repository: [web showcase](../research/evidence/web-showcase.png), [web material/merge labs](../research/evidence/web-optics-and-merge.png), [iOS 27 Music search above keyboard](../research/evidence/ios27-music-search.png), [largest Dynamic Type Photos controls](../research/evidence/ios27-photos-largest-type.png), and [largest Dynamic Type Music navigation](../research/evidence/ios27-music-largest-type.png). The full scene/preference matrix is described in the research report; these images prove only their named states.

The task-local pnpm executable in `/tmp/glasscn-tooling` restores the repository's pinned tool without changing global settings. Next and its ESLint config were patched together to 16.4.5 after the fresh consumer's mandatory security check rejected 16.4.0. No security check was bypassed. Work remains on `liquid-glass-27-rebuild`; publication is outside this task.
