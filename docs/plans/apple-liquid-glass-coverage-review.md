# Apple Liquid Glass coverage review implementation plan

> **For agentic workers:** use subagent-driven-development for isolated implementation and review, and executing-plans for root-owned integration. Read the task brief before editing its files.

**Goal:** close verified material and interaction gaps and map all researched official examples to honest web/native support.

**Architecture:** existing web CSS/optical runtime plus actual Expo 57 system APIs. Separate component behavior from numerical browser approximations. Source-linked Landmarks/Notes compositions exercise the new contracts.

**Tech Stack:** Next 16.4.5, React 19, Tailwind 4, Radix, Expo 57 / React Native 0.86, Expo SwiftUI, Reanimated.

**Spec:** `docs/specs/apple-liquid-glass-coverage-review.md`.

## Global constraints

Edit generator sources, never generated files. Primitives are plain values; derived values are computed where used. Components use tokens. Shipped file basenames are unique. Native Liquid Glass never sits under a fading ancestor. Do not bypass real native APIs with a custom imitation when the installed SDK exposes the needed behavior. Do not claim private-renderer identity, beta availability or unavailable bridge behavior. No external publishing, destructive operation or unrelated refactor.

## Review focus

- Controlled native sheet parent rejects the same selection repeatedly, including gesture cancellation.
- Clear glass becomes opaque at either clarity endpoint while nested in forced light/dark themes.
- Child-only transforms/animations move a clustered shape without resizing its container.
- Toolbar width, text size or command state changes while its overflow menu is open.
- Background extension and portal effects retain correct layout/theme when sidebars switch sides or containing width changes.

## Tasks

### Task 1: Official evidence and independent review

**Files:** `docs/research/apple-liquid-glass-official-examples-review-2026-11.md`, `apple-liquid-glass-standards-review.md`, `apple-liquid-glass-spec-review.md`.

- [x] Independently reopen official sources and inspect exact installed SDK implementations.
- [x] Record separate Standards/Spec findings with paths, requirements, repro and severity.
- [x] Build the dated official example/API inventory; distinguish stable, beta and unavailable APIs.

### Task 2: Material, runtime and background extension

**Owner:** root. **Files:** `registry/stylesheet.mjs`, `src/lib/glass-theme.ts`, `src/lib/glass-variants.ts`, `src/components/glass/glass-effects.tsx`, `glass-cluster.tsx`, new `background-extension.tsx`, corresponding demos, focused unit/browser regressions and native background-extension twin.

**Interfaces:** four named standard intensities `ultraThin|thin|regular|thick` (existing labels may remain aliases); `BackgroundExtension` accepts imagery separately from foreground children, supports both edges and never mirrors labels. Native exposes the same composition intent with documented renderer limits. Activity/depth are optional material behavior, disabled by accessibility settings where needed.

- [x] Reproduce fully tinted clear-label failure, live style-text optics failure and child-transition mask failure.
- [x] Correct labels/runtime lifecycle/geometry and add meaningful regressions.
- [x] Implement locally derived size depth, inactive-window behavior and four material choices without breaking explicit theme overrides.
- [x] Implement image-only background extension with readable foreground and both-edge coverage; integrate a source-linked demo.

### Task 3: Native system contracts and adaptive toolbar

**Native owner:** fresh implementer. **Files:** `registry/native/sheet.tsx`, `button.tsx`, `slider.tsx`, `glass.tsx`, `liquid-glass.tsx`, `sidebar.tsx`, new `glass-morph.tsx`, native tests and focused sandbox demos. **Toolbar owner:** root, `src/components/glass/toolbar.tsx`, `registry/native/toolbar.tsx`, related demos/tests.

**Interfaces:** native `GlassMorph`/`GlassMorphItem` use actual SwiftUI namespace/effect identities and typed props; `ToolbarCommands` receives declarative commands `{ id, label, icon?, onSelect, priority?, pinned?, disabled? }` and moves lower-priority commands into accessible overflow while pinned commands remain visible. Use equivalent contract on both tracks; node/icon types can be platform-specific.

- [x] Add failing native regressions for system sheet selection/notifications/nonmodal/source routing, parent rejection and large custom geometry.
- [x] Implement actual supported SwiftUI sheet paths; keep explicit unsupported async-veto path honest and functional.
- [x] Fix Slider.formatValue routing; add four named native standard materials and actual system glass button/identity paths with no silent no-ops.
- [x] Fix containing-width sidebar adaptation and compact modal/back behavior.
- [x] Add responsive prioritized/pinned toolbar commands and prove overflow state/keyboard/action semantics across widths.

### Task 4: More official examples and strict parity matrix

**Files:** new web/native `liquid-glass-02.tsx`, web/native demos, `src/components/site/liquid-glass-showcase.tsx`, `registry/items.mjs`, `src/lib/docs.ts`, final `docs/research/apple-liquid-glass-parity-matrix.md` and updated design/native references.

**Interfaces:** `LiquidGlass02({ scene: 'landmarks'|'notes'|'search'|'materials', photoBase? })`. Landmarks uses image-only extension and independent glass badge identities; Notes uses prioritized/pinned toolbar and nonmodal formatting while document content remains editable. Root owns shared registry/docs/site integration.

- [x] Build interactive examples using the new shared components rather than locally imitating their behavior.
- [x] Register all component/block files/dependencies, demos and docs on both tracks.
- [x] Map every official inventory row to implementation, example, exact/OS-delegated/approximate/missing/unavailable status and evidence.
- [x] Inspect web layouts and actual iOS interactions; explicitly preserve unverified/beta/platform limits.

### Task 5: Final review and verification

- [x] Re-review important fixes against their original repros; close findings without conflating Standards and Spec.
- [x] Run typecheck, lint, root/native tests, full browser checks, web install, native install and production build. Install verifiers run sequentially.
- [x] Inspect final light/dark, clarity endpoints, largest-text and new example artifacts.
- [x] Update changelog, API references, matrix and this work record with exact results; leave no supported prop silently ignored.

## Progress

All five steps complete. The official inventory maps 55 baseline behaviors plus four provisional/platform cases, with strict system/custom/browser/unavailable/unverified distinctions. The width correction fits landing/Studio layouts from 320–1440px. Ten interactive scenes are registered on both tracks.

Final gates: root 339 tests/33 files; native 322 tests/13 suites; full browser 289 passing/two intentional skips; root/native TypeScript; ESLint with one existing TanStack warning; production build; fresh 111-item web installation/typecheck/build; fresh 101-item native installation/typecheck/322 tests. The two install verifiers ran sequentially. Targeted native-guide axe also passed after its final copy update. Real iOS anchored actions/nonmodal editing/controlled detents/identified badges/largest text and three-engine morph repros have named evidence.

See [the final verification record](../research/apple-liquid-glass-coverage-verification-2026-11.md), [strict matrix](../research/apple-liquid-glass-parity-matrix.md), and separate Standards/Spec reports. Unsupported bridge APIs, unavailable platforms and unverified physical-device/iPad/VoiceOver matrices remain explicitly labeled; completing this review does not claim private-renderer identity. Changes remain local and uncommitted.
