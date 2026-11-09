# Apple Liquid Glass standards review

Reviewed the working tree and untracked implementation against `d896a3df956c2c0ad3877b50fa1e0e69f5b09ba8` on 2026-11-08. HEAD has no intervening commits. Scope includes the web material/runtime, optics, morphs, portals, navigation, controls, overlays, new blocks, native counterparts, stylesheet, generator and registry integration. Standards come from `docs/rules/` and `docs/architecture.md`.

## Hard violations

### P2 Clear controls disappear at full tint

**Location:** `registry/stylesheet.mjs:195–204`; accessibility overrides at `:507–533`.

**Rule:** `docs/rules/design.md:28–29` requires readable labels in opaque clear states and usable fully tinted views.

**Reproduction:** Open `/showcase` in the light scheme and move viewer Clarity to 100%, leaving Reduce transparency off. Isolated Chromium measured the first clear surface as foreground `[250,250,250]`, opaque background `[255,255,255]`, contrast **1.0438:1**. `clearSurface()` retains bright labels after clarity makes its white frost opaque. The new accessible-clear overrides cover reduced transparency/contrast, but not full tint. The baseline already had the underlying contrast hole; removing the surface scrim changes its appearance further.

**Correction:** Resolve clear-surface foreground and opaque material together for viewer clarity, including inherited and per-element clarity.

### P2 Live scoped stylesheet changes leave refraction enabled

**Location:** `src/components/glass/glass-effects.tsx:151–159`, `:188`.

**Rule:** `docs/rules/tokens.md:2` and `docs/architecture.md` require live scoped primitives to affect their consumers. `glass-refraction` documents zero as disabling optics.

**Reproduction:** Enhance the `/showcase` optical lens, then change an existing `<style>` text node from `--glass-refraction:14px` to `0px` using `nodeValue`, as React updates a single text child. After 500 ms, Chromium reports computed refraction `0px` while `--glass-optical-filter:url("#glass-lens-4")` and `data-glass-refracting` remain. The observer omits `characterData`; unrelated later mutations can hide the failure.

**Correction:** Observe scoped stylesheet text changes and refresh the affected material without requiring another interaction.

### P2 Cluster masks stop following moving sibling controls

**Location:** `src/components/glass/glass-cluster.tsx:23–26`, `:37–48`.

**Rule:** `docs/rules/design.md:9` requires the union of separate sibling contours.

**Reproduction:** On `/docs/glass-cluster`, apply `transition:transform 150ms linear` and `transform:translateX(20px)` to an item. After 500 ms, its rect has moved **20 px**, while the surface's SVG mask is byte-for-byte unchanged. The transition handler rejects bubbled events from children; ResizeObserver cannot detect transforms. React-authored item transform transitions have the same gap between the initial effect measurement and their final geometry.

**Correction:** Measure through descendant geometry transitions/animations and their interruption, while keeping unrelated transitions bounded.

## Existing native violations retained by the rebuild

### P2 Scrubbing selects disabled segments

**Location:** `registry/native/segmented-control.tsx:152–156`, `:177–179`, `:201–207`.

**Rule:** `docs/rules/design.md:30` includes accessible interaction/state in the component contract; `docs/rules/native.md:8–9` preserves the web component's state contract.

**Reproduction:** Render custom segments A and disabled B, with A selected. Deliver layout for both and scrub A to B. A focused Jest harness using persistent shared values received `onValueChange("b")`. Frame lookup ignores item disability; `select()` checks only root disability. RNTL's `fireEvent` suppresses layout on disabled targets, so the harness calls the actual host `onLayout` handlers to model native layout delivery.

**Correction:** Exclude disabled values from gesture hit testing and selection, including changes during a gesture. The same frame policy in DockBar warrants a regression check; it was not separately reproduced here.

### P2 Custom large sheets remain floating translucent lenses

**Location:** `registry/native/sheet.tsx:158–166`, `:227–241`.

**Rule:** `docs/rules/design.md:8` requires full-height sheets to anchor and become opaque.

**Reproduction:** Open a bottom Sheet with `detents={["medium","large"]}` and `defaultDetent={1}` or `native={false}`. The custom path preserves 12 pt edge gaps and always renders `Glass variant="liquid"`; `large` only changes the grabber label. The rebuild's path selection routes initial-detent and callback users through this path.

**Correction:** Implement the anchored opaque large presentation on every path that preserves those props, or preserve them through system presentation. This is source-established; no simulator was changed for this review.

### P2 Compact native sidebars omit the modal layer

**Location:** `registry/native/sidebar.tsx:51–67`.

**Rule:** `docs/rules/native.md:12` requires overlays in a Modal; `docs/rules/design.md:30` requires modal-sidebar focus behavior.

**Reproduction:** At compact width, open Sidebar. Its scrim and panel remain absolute Views inside the screen, with no Modal, hardware-back dismissal or opener-focus restoration. They cannot establish the overlay layer required above a native stack presentation. `accessibilityViewIsModal` does not create that layer or install dismissal behavior.

**Correction:** Use the shared native modal presentation for the compact branch and restore its trigger on dismissal. The wide edge-attached branch can remain in the screen. Layering/focus consequences are source-established rather than simulator observations.

## Judgment calls

No Fowler smell alone warrants a change. Shared native/web behavior does require separate platform implementations here; that duplication is consistent with the registry architecture. The findings above identify observable failures or explicit repository-rule breaches.

## Validation boundary

Three isolated Chromium checks ran against the existing server at `http://localhost:3027`, confirming contrast, live refraction and cluster geometry failures. One focused native Jest regression ran outside the repository and failed with expected zero callbacks versus received `"b"`. Broad verifiers, native simulator state and application services were left to the coordinating agent. Only this report was added to the repository.

## Task2 scoped re-review

The original three browser findings are fixed in the reviewed Task2 implementation. Changing a live style text node to refraction zero removes both the URL filter and its marker. Child CSS transform transitions now update the mask to the item's measured position. Fully tinted light clear glass reaches **19.80:1**; the revised opaque-label/frost policy also gives **9.34–9.44:1** against black media at Clarity 65%, 70% and 74% in Chromium, WebKit and Firefox. An intermediate implementation switched labels too late and was corrected during this re-review.

The decorative-spinner measurement regression found during re-review is also corrected: an infinitely rotating SVG inside a stationary item now produces **zero** cluster rect reads over 350 ms in all three engines.

### P2 Late WAAPI geometry animations do not wake cluster measurement

**Location:** `src/components/glass/glass-cluster.tsx`, `measure()` / `geometryIsAnimating` and motion-event subscriptions.

**Rule:** `docs/rules/design.md:9` requires the union to follow sibling contours. The new `getAnimations()` path attempts to track running geometry animations.

**Reproduction:** After the initial cluster measurement settles, call `item.animate([{ transform: "translateX(0px)" }, { transform: "translateX(20px)" }], { duration: 150, fill: "forwards" })`. In Chromium, WebKit and Firefox, the item moves **20 px**, while its SVG mask remains unchanged after 400 ms. WAAPI does not emit the CSS start events used to schedule the first measurement; checking `getAnimations()` inside an already-running measurement cannot discover a later start.

**Correction:** Provide a supported way to invalidate measurement when imperative geometry motion starts, or detect its lifecycle without keeping stationary clusters in a permanent frame loop. Scope any WAAPI support claim to the implemented trigger contract.

### P2 performance judgment: paused animation leaves measurement running

**Location:** `src/components/glass/glass-cluster.tsx`, `moving` bookkeeping and `if (moving.size || geometryIsAnimating) schedule()`.

**Basis:** `docs/rules/performance.md` explains the cost of per-frame glass work. The unnecessary layout loop is reproduced; classifying it as P2 is review judgment because the repository sets no numeric cluster frame budget.

**Reproduction:** Start an infinite CSS translate animation on an item, then set `animationPlayState="paused"`. Chromium reports only a paused animation but continues **22 root rect reads in 350 ms**. Pausing does not dispatch `animationend` or `animationcancel`, so `moving` retains its entry and overrides the new running-animation check.

**Correction:** Reconcile bookkeeping with live running/pending animations, including paused or removed targets, and stop measuring when geometry stops.

### Other scoped results

Chromium, WebKit and Firefox all showed size-dependent regular diffusion: increasing the lens from 96 to 240 px high changes surface depth from 0 to 0.643 and blur from 18 to 21.858 px. Manual Reduce Transparency returns depth to zero and removes the URL enhancement. Controlled `document.hasFocus` values plus blur/focus events quiet and restore the shadow. These checks establish event handling, not physical OS window behavior.

All four standard material utilities render distinct default opacity tiers, 0.28 / 0.52 / 0.74 / 0.86. The standalone background-extension demo renders one named main image, two inert/decorative 56 px mirrors and its foreground heading once. Source review of web and native image-only implementations found no additional semantic issue in side mapping or child ownership. Native core and the original native findings await the separate implementation freeze; registry/preferences/docs integration was outside this scoped snapshot.

## Cluster lifecycle and web identity re-review

The two remaining Task2 cluster findings are resolved under the explicit helper contract. In Chromium, WebKit and Firefox, a paused geometry animation produces **zero rect reads over 350 ms**, and changing its animation play state back to running wakes measurement. A late WAAPI animation passed through the actual exported `trackGlassAnimation()` helper moves its item 20 px and updates the mask to the exact measured x coordinate. Combined root gap and child transform CSS transitions finish with zero mask-position error. Arbitrary unannounced WAAPI starts are outside that documented contract.

The new web identity component preserves its existing expand DOM node through reordering. An unrelated infinite consumer opacity animation stays running through updates. Five rapid insertion/removal interruptions settle to zero ghosts and zero owned animations. Removed ghosts are inert, hidden from accessibility, and contain no duplicate descendant IDs. Switching the docs preview to Code unmounts the component, cancels its owned animations and removes its ghosts. The renamed `glass-transitions` library and new `glass-morph` component are distinct items; the original mapping is not a current finding. Native morphology was outside this review.

### P2 Root movement is omitted from identity geometry

**Location:** `src/components/glass/glass-morph.tsx:24–30`, `:60–65`.

**Rule:** `docs/rules/design.md:24` requires source continuity; the component's stated purpose covers insertion, removal and reordering.

**Reproduction:** On `/docs/glass-morph`, expand the centered badge group. Its root grows from 72 to 192 px and recenters. The stable expand button jumps immediately from viewport x744 to x684, a **60 px** movement, with no owned animation on that button. Only the two new items animate. Old and new positions are each normalized to a different root origin, so the comparison incorrectly sees no movement.

**Correction:** Retain the old viewport origin or equivalent transform and derive both endpoints in the same coordinate system, including ghost placement and interrupted motion.

### P2 Exiting identities fall outside the glass presentation area

**Location:** `src/components/glass/glass-morph.tsx:68–78`; `src/components/glass/glass-cluster.tsx:27–37`, `:91–93`.

**Rule:** `docs/rules/design.md:9` requires a shared contour that follows separate sibling shapes.

**Reproduction:** Collapse the expanded demo with a long motion duration. The glass surface immediately contracts to viewport x732–804, width 72 px. Its two exiting ghosts occupy x804–852 and x864–912, wholly outside the surface. The SVG mask can describe their rectangles but the surface cannot paint outside its own box. Correcting the origin alone still leaves old identity positions outside a shrinking final root.

**Correction:** Keep painting bounds that include current animated and exiting shapes until they finish, then contract to the resting presentation area.

### P2 Live Reduce Motion does not stop owned identity animations

**Location:** `src/components/glass/glass-morph.tsx:24–26`, `:46–58`, `:82–88`.

**Rule:** `docs/rules/accessibility.md:8` requires motion to respect the user; `docs/rules/design.md:29` gives OS motion preferences precedence over authored effects.

**Reproduction:** Set the demo's duration to 2000 ms, begin insertion, then enable `prefers-reduced-motion: reduce` after 50 ms. After another 200 ms, Chromium reports the media query as true while two owned morph animations remain running. The preference is read only before a React update; CSS animation suppression does not stop these WAAPI animations.

**Correction:** Observe live motion-preference changes and cancel or settle only the component's owned animations and ghosts. Preserve unrelated consumer animations, which the current interruption/unmount cleanup already does correctly.

## Frozen web morph review

The three findings immediately above are resolved in the frozen implementation. Chromium, WebKit and Firefox each show zero initial position jump during centered expansion, glass bounds covering both departing ghosts during collapse, and prompt removal of owned transforms/ghosts when Reduce Motion becomes active. The unrelated consumer animation remains running. Cluster pause/resume and explicit `trackGlassAnimation()` behavior remain correct under their supported contract.

The following two findings were established in that snapshot and resolved in the final targeted check below.

### P2 Morph and mask geometry mix viewport and local units under scaling

**Location:** `src/components/glass/glass-morph.tsx:74–75`, `:85`; `src/components/glass/glass-cluster.tsx:29–42`, `:101–102`.

**Rule:** `docs/rules/design.md:24` requires source continuity. Ancestor scaling occurs during the library's material entrances.

**Reproduction:** On `/docs/glass-morph`, set the morph's parent to `transform:scale(0.8)`, pause newly created owned animations at currentTime zero, and expand. The stable action jumps **9.6 px** in Chromium, WebKit and Firefox. `getBoundingClientRect()` returns transformed viewport distances, while WAAPI translate values and absolute surface/ghost dimensions use local CSS units. The ancestor applies the scale a second time. The normal unscaled reproduction is fixed.

**Correction:** Convert positions and dimensions into the presentation's local coordinate system before generating transforms, ghost styles and mask bounds. Verify the final mask geometry as well as the action's initial position.

### P2 performance judgment: paint-only consumer animations keep measurement alive

**Location:** `src/components/glass/glass-cluster.tsx:49–53`.

**Basis:** This is reproduced unnecessary layout work, with P2 priority assigned by review judgment; the repository specifies no numeric cluster frame budget.

**Reproduction:** Use the new Reduce Motion regression's preserved infinite `consumer-opacity` animation on the expand item. Once Reduce Motion leaves zero owned transforms and zero ghosts, the cluster still performs **21–22 root rect reads over 350 ms** in all three engines. Animation filtering checks the target but never its keyframes, so an opacity-only effect is treated as geometry indefinitely.

**Correction:** Exclude effects known to change paint only from geometry polling, while preserving those consumer animations. Keep tracking transform, size and other geometry-affecting effects.

This disposition is limited to the frozen web `GlassMorph` and `GlassCluster` sources. No product source, generator output, install verification or broad gate was changed or run for this pass.

## Final web morph disposition

Both scoped residuals are resolved. Chromium, WebKit and Firefox each preserve the action's initial position with **zero jump** under `scale(0.8)`. The surface uses 192 local CSS pixels for a 192 px root and keeps the same presentation extent during a collapse to a 72 px root, covering both departing ghosts.

An infinite opacity-only consumer animation now produces **zero rect reads over 350 ms**. After live Reduce Motion cancels the owned transforms and ghosts, the consumer keeps running and settled geometry reads remain zero in all three engines. WebKit's first short observation contained one transient read; a settled observation returned zero.

No important finding remains from the targeted web `GlassMorph` / `GlassCluster` reproductions. The hidden zero-geometry guard returns before scale conversion. This final check did not change product sources or run generation, install verification or broad gates.
