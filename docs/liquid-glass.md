# Liquid Glass alignment

Target: iOS 27, iPadOS 27 and macOS 27 Golden Gate. Research checked November 8, 2026. The [expanded official catalogue](research/apple-liquid-glass-official-examples-review-2026-11.md) covers 55 baseline behaviors and four provisional/platform cases. The [parity matrix](research/apple-liquid-glass-parity-matrix.md) maps each to source, examples, evidence and remaining limits. The [original study](research/apple-liquid-glass-2026-11.md), [web audit](research/web-liquid-glass-audit.md) and [native audit](research/native-liquid-glass-audit.md) preserve the initial investigation. The [coverage spec](specs/apple-liquid-glass-coverage-review.md) defines this review's contract. The [independent UI/UX review](research/independent-ui-ux-review.md) re-checked both tracks against Apple's sources and the running product; its findings and fixes supersede the matrix where they differ.

## Run the examples

```bash
pnpm dev --port 3027
# Open /showcase
```

Install the compositions with `shadcn add @glasscn-app/liquid-glass-01`, or `@glasscn-app/native-liquid-glass-01` for Expo. Choose `scene="photos" | "music" | "maps" | "safari" | "mail" | "controls"`. The native sandbox has the same six scenes under `liquid-glass-01`.

Install `liquid-glass-02` / `native-liquid-glass-02` for `scene="landmarks" | "notes" | "search" | "materials"`. Landmarks extends imagery beneath chrome and animates identified badges. Notes combines icon-only priority/pinned bar items and a tinted Done with a nonmodal Format sheet and an editable document. Search compares destination and immediate-input entry, local scope, recents, predictions and removable field tokens. Materials compares four content tiers, size depth, label hierarchy and prepared clear-media cases. Notes applies formatting to the whole note; it is not a selected-range rich text editor.

Photos uses clear controls over a photo dimmed only in the bands under them; Delete confirms from a menu anchored to its button. Music keeps the tabs at the leading edge and Search as its own trailing tab; scrolling collapses the tabs and moves the MiniPlayer between them. Maps filters places and opens a medium/large sheet. Safari collapses an address field while reading. Mail puts the sidebar at the window edge, shows list and message side by side when there's room, and composes in a modal sheet. Controls demonstrates filled tracks and held glass thumbs. On the web, the scenes present their sheets inside the scene frame through `SheetContent container`. The standalone material lab changes refraction and clarity; the merging lab joins and separates sibling contours.

## What Apple documents

Liquid Glass is the floating control/navigation layer. Content uses standard materials or ordinary fills. Regular glass diffuses complex content and adjusts its luminosity. Clear belongs over photos/video. Apple's current guidance suggests a 35% dim **behind bright media**; dark media and players that already dim need no extra scrim. [HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials)

The 27 releases refine diffusion, refraction and edge contrast. They add darker edges and brighter highlights. Mac/iPad sidebars meet window edges, sidebar icons regain accent color, and scrolled content produces a uniform toolbar top. [WWDC26 design updates](https://developer.apple.com/videos/play/wwdc2026/102/)

Automatic scroll-edge appearance is its own system treatment. Choosing soft for a touch pointer and hard for a mouse does not implement it. Search also has distinct semantics: a standard search tab opens a destination; a prominent search tab requests input immediately. Inline/sidebar search scopes local content. [UIKit updates](https://developer.apple.com/videos/play/wwdc2026/278/), [search design](https://developer.apple.com/videos/play/wwdc2026/292/)

A system glass container combines sibling effects as they approach. A shared rectangular toolbar background is useful, but does not itself reproduce that union. Stable source/effect identities produce matched transitions; distant effects should materialize. [Custom SwiftUI glass](https://developer.apple.com/documentation/swiftui/applying-liquid-glass-to-custom-views)

## Web implementation

```tsx
import { GlassEffects } from "@/components/glass/glass-effects"
import { LiquidGlass } from "@/components/glass/liquid-glass"

<GlassEffects /> // Once near the app root, including for portaled overlays.
<LiquidGlass variant="regular">…controls…</LiquidGlass>
```

`GlassEffects` supplies geometry-derived displacement maps to small floating surfaces on Chromium. It caches matching geometry, observes resizing and newly inserted portals, and supplies pointer-position illumination. The map reads geometry, never the page's backdrop pixels. Complete CSS diffusion, fill and rim remain available without the runtime and on WebKit/Firefox.

`LiquidGlass` installs the shared runtime automatically. `variant="clear"` uses lighter diffusion and bright labels. Put a `Backdrop dim={0.35}` on bright media behind it. `optics={false}` disables displacement for a surface; `followLight` enables pointer-directed highlights; `interactive` enables elastic press response.

Regular glass gains locally derived depth as its geometry grows. Scoped style-text edits refresh the runtime; inactive-window treatment quiets its rim. Accessibility/matte settings remove the depth enhancement. Clear glass switches to its own readable material labels as clarity approaches opaque. Viewer preferences include Show control borders and Reduce highlights. These app-level web behaviors approximate Apple's public intent rather than observing native macOS setting values.

The web refraction, opacity percentages, blur radii, rim intensity, spring curves and union mask are **glasscn choices**. Apple does not publish its compositor shader, opacity table, blur kernels or physical constants. A CSS implementation cannot claim identical background analysis or device-motion response. Native system effects provide the platform's implementation.

| Primitive | Behavior |
| --- | --- |
| `glass-liquid-opacity`, `glass-liquid-blur`, `glass-liquid-saturate` | Regular material diffusion |
| `glass-liquid-clear-opacity`, `glass-liquid-clear-blur` | Clear media material |
| `glass-refraction`, `glass-bezel` | Maximum web displacement and rounded optical edge; 0 refraction disables optics |
| `glass-specular`, `glass-edge-shade`, `glass-illumination` | Highlight, shaded edge and press light. Liquid surfaces have no uniform stroke; this two-sided rim is their edge. `glass-border-*` adds a solid border only under Increase Contrast, Show control borders or forced colours |
| `glass-clarity` | Viewer-adjustable transparency; 1 makes the material fully tinted |

`GlassGroup` is a single shared capsule with an optional sliding selection. `GlassCluster` provides sibling contours that split and merge; the web uses a smooth union mask, native uses a system glass container. Web CSS motion is observed automatically; pass imperative animations to `trackGlassAnimation`. `GlassMorph` preserves stable sibling identities through layout changes, including container recentering and departing shapes. Source transitions carry a separate unique identity between a trigger and its presentation. Scoped themes follow portals into body-mounted hosts.

## Native implementation

`Glass variant="material"` uses a standard material for content. `variant="liquid"` or `"liquid-clear"` uses native `GlassView` for floating controls. `LiquidGlass variant="regular" | "clear"` is the convenience surface. The native effect starts untinted, follows automatic appearance, and accepts explicit tint/scheme choices. System controls inherit their OS thumb, gesture and material behavior.

Standard material intensity has four names on both tracks: `ultraThin`, `thin`, `regular`, `thick`. Native eligible buttons, sheets and identified sibling effects use the installed SwiftUI APIs. Unsupported prop combinations retain functional custom paths. There is no native `optics` or `followLight` switch: the OS owns those effects. Explicit named effect unions, selectable transition policies and a dedicated custom-RN bridge for inactive windows, Show Borders or Reduce Bright Effects are not exposed here. System-rendered effects can respond independently of those custom bridges. No AppKit, tvOS or visionOS target is shipped.

`visible={false}` hides the whole surface from layout, input and accessibility. `materialized={false}` changes the optical treatment while a presentation completes its exit; it does not erase the presentation's content. Never fade a native glass effect or an ancestor. [UIVisualEffectView](https://developer.apple.com/documentation/uikit/uivisualeffectview)

Reduce Transparency uses an opaque fallback. Reduce Motion disables elastic custom motion and native effect animation. Increased contrast changes readable labels and boundaries. The OS owns the native clarity setting and system-glass refinements. The RN-web path reads generated diffusion/saturation/brightness values rather than fixed filter constants. [Native implementation](native.md)

## Verification

The old browser matrix only established that some blur existed on three dark pages. That cannot establish refraction, transitions or fidelity. Current checks include lens geometry, changed backdrop pixels, live preference changes, independent control actions, scoped portals, full-height sheet geometry, mobile focus, source transitions and system-control prop handling. Runtime screenshots and installed-app checks remain separate evidence from mocked component tests.

See [testing.md](testing.md) for commands and [the implementation plan](plans/apple-liquid-glass-27.md) for current verification status. Do not infer completion from this description of the implementation.
