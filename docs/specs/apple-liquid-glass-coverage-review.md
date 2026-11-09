# Apple Liquid Glass coverage review

## Intent

Review the entire current rebuild against more official Apple examples and make supported public material and interaction contracts explicit, functional and testable on web and native. The user retains full creative-control authorization and asks for one-to-one coverage; a familiar-looking surface or a mocked test is insufficient proof.

The baseline is the complete working tree on `liquid-glass-27-rebuild` compared with `d896a3d`, including untracked source. Keep earlier audit findings as historical evidence, and correct claims disproven by the installed SDK or current Apple documentation.

## Approach

Use actual system APIs wherever Expo 57 exposes the behavior. Add missing browser behavior using the existing bounded optical model and token system. Build concrete Landmarks and Notes examples so background extension, overflow/pinning, native nonmodal sheets and stable glass identities can be exercised. Keep the supported stable iOS/iPadOS/macOS design separate from beta APIs and from visionOS's different spatial-window material.

Private compositor details are not public API. A one-to-one public behavior mapping must label native OS delegation, browser approximation, SDK limitations and unverified runtime states independently. Never convert a missing feature into a successful claim by documenting it as supported. Do not expose properties that silently do nothing.

## Required corrections and additions

1. **Material and accessibility.** Fully tinted clear glass must remain readable in both schemes. Live scoped token edits must actually disable/reconfigure refraction. Add four named standard-material levels, size-dependent Liquid Glass depth and inactive-window appearance. Any new numeric coefficients are glasscn tuning, derived locally from primitives.
2. **Grouping and identity.** Masks must follow sibling transforms/animations, not only root gap changes. Support stable native glass identities through the installed SwiftUI namespace/effect APIs. Expose unsupported union/transition choices as platform limits rather than ignored parameters.
3. **Native presentation and controls.** Use available system sheet selection, detent callbacks, source anchors and background-interaction APIs. Controlled selection rejection must restore the accepted state. Custom full-height sheets must anchor and become opaque, and nonmodal inspectors must allow background interaction. Custom paths must preserve requested semantics, including Slider.formatValue. Use true system glass button styles for supported native cases.
4. **Navigation and content extension.** Add responsive toolbar command priorities, pinned commands and automatic overflow without losing command semantics or keyboard reachability. Background extension must mirror/soften imagery behind both leading and trailing chrome while keeping foreground content separate. Responsive native sidebars use their containing width and compact overlays obey platform modal/back behavior.
5. **Examples and evidence.** Add source-linked Landmarks and Notes examples on both tracks, and a comprehensive official-example/API matrix. Verify normal/dense/square/matte themes, both schemes, clarity endpoints, reduced effects, real native presentation/drag and the largest text. Beta and unavailable framework APIs receive explicit rows rather than implied support.

## Review and completion

The Standards and Spec reviews remain separate reports. Fix established important findings and re-review the changed contracts. Run meaningful regressions before/after fixes, then typecheck/lint/unit tests, the complete browser suite, both real install verifiers and a production build. Inspect final rendered web and iOS artifacts. No publication or AppKit target is requested by this review; the native runtime remains Expo iOS/Android/RN Web, with supported platforms stated per row.
