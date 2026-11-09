# Apple Liquid Glass coverage verification — November 8, 2026

Review scope: the expanded [55-case official baseline plus four provisional/platform cases](apple-liquid-glass-official-examples-review-2026-11.md), the [strict parity matrix](apple-liquid-glass-parity-matrix.md), the rebuilt web/native sources and the landing/Studio width correction. The branch remains an uncommitted local review; nothing was published.

## Integration gates

| Check | Result |
| --- | --- |
| Root TypeScript | Passed: generated registry/source, Next route types and `tsc --noEmit`. |
| ESLint | Passed with one existing `react-hooks/incompatible-library` warning for TanStack Virtual. New files introduce no warnings. |
| Root tests | 339 passing tests across 33 files. |
| Native tests | 322 passing tests across 13 Jest suites. These mock system rendering and do not measure its optical output. |
| Native TypeScript | Passed against Expo57/React Native0.86. |
| Full browser suite | 289 passed, two intentionally skipped out of 291 in the full final run (1.7minutes). Axe, 60 visual baselines, behavior, width, browser matrix and blur budget all passed. The native installation guide’s final example-copy addition also passed its targeted axe recheck. The skips are the style-text refraction case on WebKit/Firefox, which retain the CSS material. |
| Production build | Passed: registry generation/build, Next16.4.5 compilation, TypeScript and static generation. Registry stamped for http://localhost:3027. |
| Fresh web registry install | Passed: 111 web items installed through shadcn into a fresh Next app, type-checked and production-built. |
| Fresh native registry install | Passed: 101 native items installed into a fresh sandbox copy, type-checked and component-tested; all 322 tests across 13 suites passed against the installed files. Ran sequentially after the web verifier. |

Commands use the task's functioning pnpm binary via `PATH=/tmp/glasscn-tooling/node_modules/.bin:$PATH`. Browser checks reuse `E2E_BASE_URL=http://localhost:3027`; the unrelated development services remain untouched.

All required integration gates passed. No new browser golden images were accepted to hide failures. The only full-suite correction was the decorative-side-strip ARIA markup; its six failed axe cases passed individually before the complete289-pass final browser run. The final native guide copy also passed its targeted axe check.

## Reproduced and corrected

The clear-label regression failed at fully tinted light clarity before the correction. Current opaque clear labels reach 19.8:1 in the independent three-engine review; the intermediate 65/70/74% cases reach 9.34–9.44:1 over black media. Live scoped style-text changes now remove obsolete optical filters. Child-only CSS motion and explicitly registered imperative geometry animations update the union mask; paused and paint-only animations stop contour polling.

The five durable [web identity regressions](../../e2e/glass-morph.coverage.spec.ts) were observed failing before their respective fixes. They cover centered expansion (60px jump), scaled ancestors (9.6px jump), glass painting under departing identities, live Reduce Motion and idle contour measurement during an unrelated infinite opacity animation. The [standards reviewer](apple-liquid-glass-standards-review.md) independently rechecked the targeted failures in Chromium, WebKit and Firefox: zero initial jumps, both departing shapes covered, zero settled contour reads over 350ms, no remaining owned animation/ghost after Reduce Motion, and the consumer animation preserved.

The new BackgroundExtension demo initially put accessible labels on empty generic divs. The full axe suite caught this in its docs page and in the Studio's complete component gallery; the corrected side strips are decorative. This is a demo semantic correction, not an axe exclusion.

## Visible runtime proof

| Evidence | Observed behavior and limit |
| --- | --- |
| [Landing at 900px](evidence/review-landing-width-900.png) | Header controls fit. `/` and `/themes` were measured from 320–1440px with no page overflow; five browser regressions cover narrow desktop widths and the complete compact navigation. |
| [Compact Notes](evidence/review-web-notes-compact.png), [field token](evidence/review-web-search-token-compact.png) | Custom toolbar priorities/pinned actions remain bounded; the query field retains space beside its removable token. Browser editing/focus/formatting flows were inspected separately from mocked tests. |
| [Native Notes editing](evidence/review-native-notes-editing.png), [source anchor](evidence/review-native-notes-anchor.png) | Actual iOS27 system nonmodal sheet leaves the note editable; its public glass/onAction source opens, dismisses and reopens. Formatting affects the whole note rather than a selected rich text range. |
| [Native badges](evidence/review-native-badges.png) | Stable SwiftUI effect identities render and remain independently accessible after insertion/reorder. This does not measure a pixel-identical optical union at every animation frame. |
| [System action sheet](evidence/review-native-action-sheet.png) | Actual ConfirmationDialog points to the mounted RN source. Selecting Archive invokes one action and one close; outside dismissal invokes no consumer Cancel callback. The SDK calls cancel-role closures on passive dismissal, so explicit Cancel callbacks deliberately select the custom implementation. |
| [Largest-text sheet](evidence/review-native-largest-sheet.png) | At accessibility-extra-extra-extra-large the title, two-line description, input and Add area label are fully visible. Core GText owns semantic iOS ramps; the local demo uses minimum heights. Simulator content size was restored to `large`. |

Native evidence uses iPhone18Pro simulator `980F1928-1320-4C63-8540-2F5B7BB16651`, iOS27.0, ExpoGo57.0.9 and the task Metro on8083. The original simulator and unrelated browser/service sessions were left alone. Accessibility hierarchy inspection and activation do not establish a complete VoiceOver navigation audit.

## Independent review

Separate [standards](apple-liquid-glass-standards-review.md) and [spec](apple-liquid-glass-spec-review.md) reports preserve the initial findings and their corrections. The final P04 reviewer independently passed 13 native and three web ActionSheet tests, then exercised Chromium/WebKit/Firefox in normal/reduced motion. Focus containment, outside/Escape/selection dismissal, return/reopen and the normal source/group transition identities passed; reduced motion produced no source transitions. The reviewer inspected saved native source geometry and action/passive counters without changing simulator state. No important defect remains in those scoped reviewed contracts.

## Parity boundary

The public behavior mapping is complete as an inventory; exact parity is not. System delegation provides Apple's renderer only on eligible native paths. The web lens, union mask, coefficients, size depth, window activity treatment and image extension remain documented approximations. Expo lacks named effect unions and explicit glass-transition policies, and there is no dedicated custom-RN bridge for native inactive-window/Show Borders/Reduce Bright Effects values. No AppKit, tvOS or visionOS target is implemented. iPad multiwindow, physical devices and the complete native appearance/input/accessibility catalogue remain unverified. See the matrix for the per-case distinction.
