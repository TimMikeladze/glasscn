# Independent UI/UX review: glasscn versus Apple's official Liquid Glass

You are an independent senior UI/UX reviewer. Review the actual glasscn experience against Apple's first-party Liquid Glass guidance, examples and public interaction contracts. Produce an evidence-backed review of visual quality, usability, accessibility and fidelity. This is a review assignment; implementation changes belong to a subsequent task.

The owner's intent is comprehensive, one-to-one coverage of the relevant Apple glass behaviors on the project's supported tracks. Determine where that intent is satisfied, approximated, missing or unverified. Make your own assessment from the official references and running product before reading previous reviewers' conclusions. A green test suite or a completed implementation plan is background information, not a design verdict.

## 1. Establish the review baseline

Work in `/Users/tim/workspace/glasscn`, currently branch `liquid-glass-27-rebuild`. The rebuilt implementation is in the **working tree, including untracked files**. Review that state. A clean checkout, `HEAD`-only diff or old release omits substantial work.

Read `/Users/tim/.claude/CLAUDE.md` and the repository's `AGENTS.md`, then [architecture](../architecture.md), [design rules](../rules/design.md), [accessibility rules](../rules/accessibility.md), [native rules](../rules/native.md) and [Liquid Glass alignment](../liquid-glass.md). Consult [theming](../theming.md) when evaluating a theme override and [native usage](../native.md) / [sandbox instructions](../sandbox.md) for platform paths. `docs/handoff.md` is an older roadmap handoff for another branch; it is not the assignment or current baseline.

Preserve the working tree and existing services. Write only your review and new evidence artifacts. Keep application source, generated files, previous review reports and screenshot baselines unchanged. Record incidental generator changes if a verification command produces them. Do not stash, reset, change branches, commit, publish or fix findings during this review.

Record the date, branch, HEAD, dirty/untracked state, dependency versions, browsers, viewport dimensions, OS/device and accessibility settings you actually inspect. This makes your conclusions reproducible even if the workspace changes later.

**Completion:** identify the actual implementation under review and establish a runnable web/native baseline, or record the exact environment limitation for each unavailable track.

## 2. Reconstruct the Apple requirements independently

Use the [official example catalogue](apple-liquid-glass-official-examples-review-2026-11.md) as an index of **55 baseline cases plus four provisional/platform cases**. Retain all 59 IDs in your eventual coverage table. Its implementation-gap observations were written before later corrections; they are historical hypotheses, not current findings.

Open the relevant official links yourself. Check current version, platform, API availability, beta status and video timestamps. The prior research targeted iOS/iPadOS 27 and macOS 27; confirm the current references rather than assuming an older design or silently changing the target. If a page requires JavaScript, use its actual rendered documentation or Apple's code/transcript resources. Distinguish an inaccessible source from an absent API.

Start with these reference families; the catalogue supplies the remaining per-case URLs and timestamps:

| Reference family | First-party starting points | Compare |
| --- | --- | --- |
| Material and legibility | [HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials), [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/) | Regular/clear/standard materials, bright/dark media, size-dependent diffusion and foreground contrast. |
| Controls and custom effects | [UIKit design adoption](https://developer.apple.com/videos/play/wwdc2025/284/), [Custom SwiftUI glass](https://developer.apple.com/documentation/swiftui/applying-liquid-glass-to-custom-views) | Actual system controls, held thumbs, semantic content, effect identities, blending and transitions. |
| Landmarks composition | [Landmarks sample](https://developer.apple.com/documentation/swiftui/landmarks-building-an-app-with-liquid-glass), [activity badges](https://developer.apple.com/documentation/swiftui/landmarks-displaying-custom-activity-badges), [toolbar sample](https://developer.apple.com/documentation/swiftui/landmarks-refining-the-system-provided-glass-effect-in-toolbars) | Image-only extension, sidebar/inspector relationships, selection, horizontal collections, grouping and badge continuity. |
| Current navigation and search | [2026 design updates](https://developer.apple.com/videos/play/wwdc2026/102/), [search design](https://developer.apple.com/videos/play/wwdc2026/292/), [SwiftUI updates](https://developer.apple.com/videos/play/wwdc2026/269/) | Edge sidebars, uniform scroll regions, toolbar policy, destination versus immediate-input search, scope and window activity. |
| Presentations and access | [HIG Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets), [HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility), [HIG Motion](https://developer.apple.com/design/human-interface-guidelines/motion) | Source relationship, partial/full geometry, nonmodal editing, dismissal, focus, reduced effects and larger text. |

Classify each comparison as an Apple-documented requirement, an Apple example pattern, a glasscn project rule, or your own usability/design judgment. Cite the exact official page and relevant section or video timestamp. Where typography or color drives the finding, also consult Apple's HIG Typography/Color references linked in the catalogue.

Compare the same context: platform, material, size, input method, foreground hierarchy, media brightness, appearance and interaction state. Use equivalent imagery/content when assessing contrast. The sample photos, map geometry and note text are illustrative; their difference from Apple's assets is not itself a defect.

**Completion:** every catalogue ID has a concrete source-backed criterion or a precise reason the reference cannot currently be evaluated. Keep beta/additional-platform cases separate from the stable baseline.

## 3. Inspect the product through real tasks

### Web access

The site's existing development server is `http://localhost:3027`. Start at `/`, `/showcase` and `/themes`. Each component has `/docs/<name>` with a live preview, API notes and installable source. Reuse this server after checking it belongs to this workspace. Use isolated Playwright browser contexts; preserve the user's shared browser sessions and unrelated servers.

The global pnpm launcher was broken during the implementation. The working task-local binary is `/tmp/glasscn-tooling/node_modules/.bin/pnpm`. Check it exists before using this shell setup:

```sh
cd /Users/tim/workspace/glasscn
export PATH=/tmp/glasscn-tooling/node_modules/.bin:$PATH
command -v pnpm
git status --short
```

If this project's server is absent, start `pnpm dev --port 3027`. If that port belongs to another project, choose a free port and record the replacement. The Playwright config otherwise defaults to 3011, so set `E2E_BASE_URL` explicitly.

### Ten scenes and task comparisons

Use `/showcase` to select scenes; the native equivalents are listed below. Review both the initial composition and its interaction sequence.

| Scenes | Tasks to perform and judge |
| --- | --- |
| Photos / Music | Change and favorite images; compare bright/dark media and dim placement. Scroll the song list in both directions; operate playback, accessory/tab minimization and Search. Judge content priority, readable controls and destination/focus behavior. |
| Maps / Safari | Search/select a place, expand/collapse details and dismiss. Scroll the article, expand/edit its address and use Reader. Judge useful content area, reachability, partial/full sheet geometry and chrome continuity. |
| Mail / Controls | Change mailbox and message, flag/archive, compose and dismiss. Expand tools and drag/release/cancel sliders, switches and segments. Judge navigation state, meaningful tint, disabled behavior and the difference between rest/held states. |
| Landmarks / Notes | Change selection and inspector, scroll the collection, insert/remove/reorder badges. In Notes open Format, edit behind it, change format, save/close/reopen; exercise Undo/Redo, Share and More while resizing. Judge extension versus foreground ownership, toolbar priorities and nonmodal usability. |
| Search / Materials | Compare Search with Search now; use folder/local/global filters, predictions, recents, scopes/tokens, empty results, Clear and Cancel. Compare all four standard material tiers, regular sizes, clear over bright/dark/already-dimmed media, semantic labels and slider variants. |

Also inspect `/docs/glass-morph`, `/docs/glass-cluster`, `/docs/background-extension`, `/docs/toolbar`, `/docs/search-field`, `/docs/sheet`, `/docs/action-sheet`, `/docs/sidebar` and `/docs/liquid-glass-02`. ToolbarCommands is demonstrated within Toolbar, not a separate registered web docs page. Check the optical/merging labs below the showcase scenes.

The latest reported user issue was header/page overflow at narrower desktop widths. Resize **both `/` and `/themes`** through 320,390,768,900,1024,1200,1280 and1440px; inspect actual control bounds and document overflow. Check the compact Menu exposes Showcase, Docs, Components, Studio, Theming and Native, including keyboard activation, dismissal and focus return. A horizontally scrolling code snippet or collection must stay bounded without making the page scroll sideways. The prior900px [capture](evidence/review-landing-width-900.png) is comparison evidence, not a substitute for your reproduction.

### Native access

The Expo sandbox is `sandbox/native/`, using Expo57 and React Native0.86. Actual system UI requires iOS; React Native Web is a fallback track. At the last handoff Metro was running on8083 and the task's released simulator was:

```text
iPhone18 Pro / iOS27.0 / ExpoGo57.0.9
UDID: 980F1928-1320-4C63-8540-2F5B7BB16651
Metro: exp://127.0.0.1:8083
```

Verify availability rather than assuming these are still current. If needed, start `npm run start -- --port 8083` from `sandbox/native`; avoid `CI=1`, which disables the watcher. Preserve unrelated simulators/Metro sessions. Record and restore device appearance, orientation and content size after testing; the last restored content size was `large`.

| Native route | Purpose |
| --- | --- |
| `/c/liquid-glass-01?scene=photos` | First six scenes; substitute music/maps/safari/mail/controls. |
| `/c/liquid-glass-02?scene=landmarks` | Four advanced scenes; substitute notes/search/materials. Also `/c/toolbar-commands`, `/c/glass-morph` and `/c/background-extension`. |
| `/native-contracts` | System buttons, identified effects, repeated controlled-detent rejection and nonmodal parent editing. `?part=custom` selects the custom-sheet inspection. |
| `/action-sheet-contracts` and `/c/action-sheet` | Actual source-attached plain system actions and custom combinations; verify action counts, passive dismissal, source accessibility and reopening. |
| `/c/sheet`, `/tokens`, `/tabs-layout` | Largest-text sheet, palette/material/accessibility settings and actual native tabs/accessory behavior. |

Example deep link:

```sh
xcrun simctl openurl 980F1928-1320-4C63-8540-2F5B7BB16651 \
  'exp://127.0.0.1:8083/--/c/liquid-glass-02?scene=notes&palette=ocean&scheme=dark'
```

The sandbox supports `palette`, `scheme`, `still=1` and `force=reduceTransparency,highContrast` query settings; inspect `sandbox/native/src/sandbox/theme.tsx` for the actual current options. A forced library preference is distinct from a physical OS setting. Run motion checks without `still=1`, and identify which source supplied each accessibility setting. Use the actual OS largest accessibility text size, not just a larger browser font.

### Review dimensions

1. **Composition and usability:** hierarchy, spacing, typography, action priority, grouping, content/chrome separation, discoverability, icon meaning and feedback. Judge the landing, installation journey and Studio as products too.
2. **Material and motion:** blur/lensing, tint, rims/shadows, regular versus clear, clear-media preparation, stable identities and start/middle/end continuity. Interrupt/reverse/reorder while moving; check scaled containers and glass under departing shapes. Capture video or several timed frames for motion findings.
3. **Responsive and input behavior:** narrow/wide containers, toolbar overflow/pinned actions, mobile keyboard, scroll direction, safe areas, RTL, 200% zoom and enlarged text. Test pointer, keyboard and actual touch where available; report simulator-only limits.
4. **Access and legibility:** both schemes, Dusk/Ocean/Rose/Sage, square/compact/matte and smoked presets, light/dark/busy backdrops, focus/disabled/selected/pressed states, clarity 0/.5/.65/.7/.74/1, reduced motion/transparency/highlights, increased contrast and Show control borders. Cover all scenes in light/dark; apply the remaining stress combinations to representative controls/presentations and anything suspicious. Label extrapolations.
5. **Task completion:** prove one action per activation, useful search outcomes, consistent Back/Cancel/outside/Escape behavior, state retention and focus restoration. Check live preference changes during interaction and actual VoiceOver/keyboard navigation when available; accessibility-tree presence alone does not establish a screen-reader experience.

**Completion:** inspect all ten scenes and the key standalone surfaces, gather fresh screenshots/interaction evidence, and record the exact tested combinations. Mark unavailable devices/OS conditions as unverified instead of silently treating the fallback as proof.

## 4. Trace discrepancies and challenge previous claims

After your first independent visual/task pass, consult the [parity matrix](apple-liquid-glass-parity-matrix.md), [verification record](apple-liquid-glass-coverage-verification-2026-11.md) and previous [standards](apple-liquid-glass-standards-review.md) / [spec](apple-liquid-glass-spec-review.md) reports. Challenge both positive claims and declared limitations. Prior review findings describe several historical snapshots; use their final dispositions and the current source when deciding whether an issue remains.

| Implementation family | Where to inspect |
| --- | --- |
| Examples and site | `src/components/blocks/liquid-glass-01.tsx`, `liquid-glass-02.tsx`; `src/components/site/liquid-glass-showcase.tsx`, `site-header.tsx`, `studio/theme-studio.tsx`; native blocks in `registry/native/` and demo maps in `sandbox/native/src/sandbox/demos/`. |
| Materials and themes | `src/components/glass/glass-effects.tsx`, `liquid-glass.tsx`, `glass.tsx`, `glass-preferences*.tsx`; `registry/stylesheet.mjs`; `src/lib/glass-theme.ts`, `glass-optics.ts`, `glass-variants.ts`; native `glass.tsx`, `liquid-glass.tsx`, `ui.tsx`, `a11y.tsx`. |
| Geometry and toolbar policy | Web/native `glass-cluster.tsx`, `glass-morph.tsx`, `background-extension.tsx`, `toolbar.tsx`; pure allocator `src/lib/glass-toolbar-layout.ts`. The native allocator copy is generated. |
| Presentations and search | Web/native `sheet.tsx`, `action-sheet.tsx`, `sidebar.tsx`, `search-field.tsx`, `dock.tsx`, `scroll-edge.tsx`; overlay source transitions live separately in `src/lib/glass-transitions.ts`. |
| Registry and actual platform APIs | `registry/items.mjs`, `scripts/generate.mjs`; inspect installed `sandbox/native/node_modules/@expo/ui/src/swift-ui/` and `ios/`, `expo-glass-effect` and Expo Router's native-tabs types for availability claims. Use these to establish actual API routing rather than trusting names. |

On iOS, supported plain Button `onAction` uses a real SwiftUI style; supplied RN `onPress` preserves its event through the custom path. Plain uncontrolled ActionSheet choices can use ConfirmationDialog attached to the actual trigger. Controlled/eventful/rich/styled combinations and Cancel callbacks select custom: the installed dialog runs cancel-role closures on passive dismissal without exposing a dismissal reason. Verify the current eligibility rules and user-visible consequence rather than assuming every native-looking surface is a system control.

Known boundaries to independently assess: web optics/coefficients/union masks are approximations; named SwiftUI unions and explicit transition-policy modifiers lack an installed Expo bridge; no AppKit/tvOS/visionOS target exists; system navigation/search/background-extension ownership is only partial in custom compositions. Notes formats the whole note, not a selected rich text range. These boundaries can be legitimate scope limits, missing capability, misleading documentation or poor UX depending on the claim and observed consequence. Say which.

Fresh evidence goes under `docs/research/evidence/independent-ui-ux/`. Previous retained captures and AX hierarchies are under `docs/research/evidence/coverage-review/`; its `task-*-report.md` files explain the conditions. Images named `native-notes-largest-text` and `native-notes-largest-ramps` are historical failure/partial captures. The later `review-native-largest-sheet.png` demonstrates a particular corrected SideSheet; it does not prove every scene at largest text.

Use existing tests to investigate a discrepancy, after observing the UI. Useful commands from the root with the working PATH are:

```sh
E2E_BASE_URL=http://localhost:3027 pnpm exec playwright test \
  e2e/site-width.spec.ts e2e/glass-morph.coverage.spec.ts \
  e2e/action-sheet.behavior.spec.ts --project=chromium
E2E_BASE_URL=http://localhost:3027 pnpm exec playwright test \
  e2e/liquid-surfaces.behavior.spec.ts e2e/liquid-surfaces.coverage.spec.ts
npm --prefix sandbox/native test -- --runInBand
```

See [testing](../testing.md) for axe, visual and blur-budget coverage. Playwright defaults to reduced motion; explicitly select `no-preference` for a motion review. Existing visual baselines are regression references, not Apple fidelity goldens. Native Jest mocks the compositor/system views. Last reported totals were 339 root tests, 322 native tests, 289 browser passes/two intentional skips, and fresh 111-item web / 101-item native installs; treat these as prior results until rerun.

Run the broad/install gates only when your review needs them. `verify:install` and `verify:native` must run sequentially: they share `.verify` and rewrite `public/r`. They are not necessary to form a visual judgment. If you run them, restore local registry URLs afterward with `NEXT_PUBLIC_REGISTRY_URL=http://localhost:3027 pnpm registry:build`, and preserve existing source/baselines.

**Completion:** every significant discrepancy has a reproducible user-visible consequence, current implementation location and source-backed or explicitly judgment-based rationale. A source-reading suspicion without runtime evidence stays labeled as such.

## 5. Deliver an independent, actionable review

Write `docs/research/independent-ui-ux-review.md` and link its evidence. Include:

1. **Verdict and scope:** what is convincing, what blocks approval, and the exact tested versus untested environments. Give separate visual-fidelity and task-usability judgments for web and native.
2. **Prioritized findings:** P0 unusable/unsafe task failure; P1 major access/usability/fidelity defect; P2 reproducible limited defect; P3 polish. Each needs an ID, affected platform/scene/state, expected Apple behavior with source/section/timestamp, actual behavior, minimal reproduction, fresh screenshot/video, file/line, user impact and a concrete correction direction. Identify whether it is a source-backed mismatch or reviewer judgment.
3. **Complete comparison matrix:** one row per all 59 catalogue IDs, separate web/native statuses, observed example, source and evidence. Use `verified`, `partial/custom approximation`, `missing`, `unavailable bridge/platform`, or `unverified`; distinguish delegated system rendering from a custom composition using system glass. Add newly discovered official cases without dropping existing IDs.
4. **Evidence and coverage:** capture settings, viewport/device/text size, before/during/after states for motion, commands actually run and their results. Identify reproduced regressions, corrected historical claims and remaining uncertainty. Report unavailable platform access explicitly.
5. **Fix order:** the five highest-value corrections, each with a bounded acceptance check. Finish the user-facing response with the top findings and the report link. If no important issue is found, say so with the actual inspection boundary; avoid certifying untested one-to-one parity.

The review is complete when the current product has been compared to independently opened official sources, all ten scenes have been inspected, every catalogue ID is accounted for, and every material finding is supported by reproducible evidence. Stop after delivering the review; keep implementation changes for the next assignment.
