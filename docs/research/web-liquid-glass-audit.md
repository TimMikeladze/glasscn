# Web Liquid Glass audit

Audit date: 2026-11-08. Baseline: `d896a3d`, before the current rebuild. Scope: all 83 web component registry entries and five blocks inventoried; optical, navigation, overlay, control and theme paths inspected in detail. Content-only components received a structural surface/token scan. This is a source audit; it does not establish rendered or interaction parity. Findings need browser verification after implementation.

## Apple baseline

| Source | Verified requirement relevant to this audit |
|---|---|
| [Platforms State of the Union, WWDC26](https://developer.apple.com/videos/play/wwdc2026/102/) | Version 27 improves diffusion, specular light and edge contrast. Mac/iPad sidebars extend to window edges; sidebar glyphs regain accent color. Scrolling content produces a more uniform toolbar top. |
| [Modernize your UIKit app, WWDC26](https://developer.apple.com/videos/play/wwdc2026/278/) | Automatic scroll edges now have their own visuals rather than selecting between soft/hard. Explicit soft overrides need reevaluation. Navigation bars can minimize interactively; any tab may be designated prominent. Adapt layout to available space. Menu images may be hidden in some contexts. |
| [Modernize your AppKit app, WWDC26](https://developer.apple.com/videos/play/wwdc2026/289/) | Free-floating title text gets a hard automatic scroll edge. Sidebar selection is semibold; content remains behind edge-to-edge sidebars. Optional glass bounce belongs on controls or interactive control groups. Concentricity depends on placement near a container corner. |
| [Build a SwiftUI app with the new design, WWDC25](https://developer.apple.com/videos/play/wwdc2025/323/) | Partial sheets are inset and glassy; full sheets become opaque and anchor to the screen. Sheets, menus, alerts and popovers can emerge from their source. Tabs can minimize and relocate an accessory. Search placement adapts; the search tab replaces the tab bar with a field. Controls become glass during interaction. |
| [Materials, current HIG](https://developer.apple.com/design/human-interface-guidelines/materials) ([structured source](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json)) | Liquid Glass belongs to a functional control/navigation layer. Content uses standard material or fills. Regular is the general choice. Clear needs media and bold bright foreground; consider a 35% dim for bright content, omit additional dim for sufficiently dark or already-dimmed media. |
| [Applying Liquid Glass to custom views](https://developer.apple.com/documentation/swiftui/applying-liquid-glass-to-custom-views) | `GlassEffectContainer` coordinates multiple glass shapes. Spacing affects their merge behavior; identities support morphing. A single rounded rectangle with a selection indicator covers a different subset of behavior. |

The reports in this directory distinguish Apple behavior from glasscn choices. Apple does not publish a CSS blur radius, opacity table, lens displacement field, spring constants or pixel-perfect web shader. Repository values such as 12px, 46%, 200%, 94% and the exact clarity mapping are implementation choices, not measurements of Apple defaults.

## Findings that change implementation

| ID | Finding and source evidence | Required behavior and verification |
|---|---|---|
| W-01 | `registry/stylesheet.mjs:107–178` renders liquid with blur/saturation/brightness, a fixed frost and a conic stroke. No displacement, optical bezel or backdrop-tone analysis is implemented. `use-glass-pointer.ts` changes a highlight angle and press coordinates only. | Build the web optical enhancement and verify that recognizable backdrop features bend at the edge while text remains undistorted. Keep the full frosted rendering in engines without the enhancement. Label the optical model as glasscn's approximation. |
| W-02 | `sidebar.tsx:9–10,121–125,141–145` implements inset 26-style geometry. `menuButton` uses monochrome glyph inheritance. Registry and docs advertise the old inset model. | Default wide layout to the 27 edge-to-edge sidebar, preserve content beneath it, accent meaningful navigation glyphs and retain semibold selection. Compare wide and narrow rendered layouts. |
| W-03 | `scroll-edge.tsx:123–145` defines automatic as soft for coarse pointers and hard for fine pointers. `navigation-bar.tsx:62–63` always requests soft. `toolbar.tsx` has floating groups but no continuous scrolled backdrop. | Give automatic its own legible, uniform appearance and use it in the navigation bar. Retain explicit soft/hard as deliberate options. Test dense text, free-floating title and colorful scrolling media in touch and pointer environments. |
| W-04 | `scroll-edge.tsx:86–90` marks `[data-bar-edge]` roots, but `glass-shadow-adaptive` in `stylesheet.mjs:249–255` checks `data-over-content` on the same element. The utility lives on toolbar/dock child surfaces, which receive no marker. | Propagate the state to optical surfaces or match an ancestor state. Assert the rendered shadow changes when content enters beneath each bar; counting an attribute on the wrapper is insufficient. |
| W-05 | `glass-group.tsx:29–41` is one permanently rectangular capsule with an optional moving fill. Its API has no spacing, separate shapes or identities. Docs call it Apple's `GlassEffectContainer`. | Support actual union/split/morph behavior, or describe the current API as a shared toolbar surface. Showcase moving shapes so the claimed behavior can be judged. Keep controls and labels crisp during shape morphs. |
| W-06 | `sheet.tsx:152–165` fades/slides the panel. The large detent stays inset and rounded; only its fill turns opaque. `alert-dialog.tsx:57` materializes in place. `action-sheet.tsx:60–63` fades/slides. | Source presentation transitions need visible source-to-panel continuity. A full-height sheet must anchor to the screen while its background becomes opaque. Test open/close, intermediate detents, drag, cancellation and Reduce Motion. |
| W-07 | `glass-morph-origin` clips a panel centered on its eventual position to trigger dimensions (`stylesheet.mjs:229,313–318,474`); this is a reveal approximation, not a translation from the trigger rectangle. Only `dialog.tsx` uses a View Transition. | Measure source geometry when implementing source morphs. Treat clip reveal as a documented fallback. Check buttons near every viewport edge so morph origins and collision positioning agree. |
| W-08 | `clearSurface()` always paints a scheme-dependent dark overlay into each clear surface (`stylesheet.mjs:191–202`). It does not know whether media is already dark or dimmed. | Make the media dim policy explicit and avoid stacking a second dim when the media is already prepared. Verify white controls on both bright and dark photos/video. A single fixed alpha does not prove legibility. |
| W-09 | `sidebar.tsx:113` derives inertness from desktop `open`, while narrow-screen visibility uses `mobileOpen`. With `defaultOpen=true`, mobile-closed content remains focusable offscreen. The mobile overlay is an aside plus a clickable scrim, without modal focus management. | Use actual responsive visibility for inertness and trigger expansion. Open mobile navigation must manage focus, Escape, restoration and dismissal. Verify keyboard traversal before opening, while open and after close. |
| W-10 | `ThemeScope` only scopes DOM descendants (`theme-scope.tsx:163–175`). Overlay portals default to body in `popover.tsx`, `dropdown-menu.tsx`, `dialog.tsx`, `tooltip.tsx` and other overlays. `src/lib/docs.ts:90` discloses this limitation. | A rebuilt scope-aware API should carry scope primitives/scheme to a portal host. Test a forced-light sharp compact scope on a dark page, opening every overlay. Otherwise retain the limitation explicitly; it is not a newly undisclosed regression. |
| W-11 | `Card` takes full `GlassVariantProps` (`card.tsx:34`) and can render `variant="liquid"`, although the documented content-layer rule forbids this. `home-examples.tsx:312` nests a glass Cancel button in a liquid dialog. | Constrain content component APIs to content material and compose overlays with fill buttons. Inspect complete example trees for nested liquid surfaces; a utility-name existence check cannot find them. |
| W-12 | `dropdown-menu.tsx:117` forces uppercase group labels, unlike current sentence/title-case usage elsewhere. Sidebar submenus have a decorative `border-s` (`sidebar.tsx:256`), contrary to the shared project design instruction. | Remove forced uppercase and the decorative submenu rail. Preserve structural separators, indentation, selection and accessible focus. |

## Features with source support, not complete parity proof

| Family | What the source implements | Remaining evidence |
|---|---|---|
| Layer separation | `Glass` defaults to material; cards, grouped lists and data hosts use material/fills. Toolbar groups share a surface. Switch, slider and segmented thumbs use `glass-knob-lens`. | Nested composition scan and actual optical behavior during press/drag. `TabsList` defaults to content material, which is appropriate for an in-flow switcher, not a substitute for app tab navigation. |
| Regular glass | Frost, backdrop blur, two-sided highlight, shadow and token labels; scheme follows the theme. | Adaptation to changing backdrop luminance is absent. Fixed theme contrast estimates do not sample arbitrary text, images or video behind the surface. |
| Press motion | Liquid press grows, solid press squashes, knob stretch follows horizontal motion. Springs come from theme curves. | Values are web design choices. Parent controls and disabled/loading states must be checked in a browser. `Button` does not install `useGlassPointer`; its radial press glow is centered by default. |
| Dock and search | Minimize-on-scroll, accessory relocation, separate search, a sliding selected fill, pointer scrubbing, keyboard inset handling. | `DockItem prominent` changes text, not which tab survives minimization. Search expands alongside a minimized current item rather than reproducing the complete native dedicated-search transition. Drag cancellation, subsequent click handling and retained focus need interaction tests. |
| Accessibility | OS media queries, clarity preferences, a manual Reduce Transparency control, forced colors, focus and hit targets. | OS overrides are declared on roots/scopes; CSS inheritance lets descendant primitive overrides supersede inherited values. Recheck per-element overrides. Manual Reduce Transparency changes clarity only; it is not the identical set of blur/decoration changes as the OS media query. |
| Content and data | Chart math, tables, text, progress and settings forms are not required to become liquid. | Data accuracy, general form semantics and chart rendering are separate from Liquid Glass fidelity. The inventory below marks their optical scope without claiming a full behavioral audit. |

## Coverage that the existing tests do not establish

| Existing evidence | What it actually proves | Missing proof for this objective |
|---|---|---|
| `e2e/liquid-surfaces.spec.ts` | At least one blurred element exists in each of dock/card/dashboard previews in dark frosted mode on three engines. | Displacement, recognizable refraction, regular/clear differences, light mode, readable adaptive tones, morphs and scrolled bars. Its comment mentions a refraction fallback, but no refraction implementation is exercised. |
| `e2e/visual.spec.ts` | Five previews in 3 palettes × 2 schemes × 2 shape/density presets. | Optical motion, navigation bars, sidebar, overlay open states, glass group merges, bright/dark media and phone layouts. Reduced motion is globally enabled in Playwright config. |
| `e2e/a11y.spec.ts` | Axe on initial documentation pages, studio and selected material matrices. | Keyboard interaction, opened overlays, responsive hidden navigation, contrast against moving imagery, Reduce Transparency and forced colors runtime behavior. |
| `e2e/blur-budget.spec.ts` | At most 12 visible DOM elements with backdrop filters in selected initial viewports. | Pseudo-element filters, GPU cost, animated filters, scrolling cost, offscreen activation and the new showcase scene. |
| Registry/theme tests | Item/file/dependency contracts, token safety and assumed-color contrast calculations. | Apple fidelity, pixel optics, actual arbitrary backdrops and complete rendered behavior. A test that pins a 94% prominent fill validates that chosen constant, not Apple parity. |

## Showcase gaps

The five registry blocks are dashboard, analytics, settings, authentication and chat. They do not demonstrate the Apple 27 navigation plane in a media-led app. `src/app/page.tsx` leads with a dashboard and many material cards; the clear-glass demo lives inside an isolated `glass` documentation preview. The site needs a visible path to interactive optical scenes and installable examples.

Useful recreations grounded in the Apple references are a Photos-style media viewer with clear controls; a Maps-style floating control cluster with a partial/large detail sheet; a Music-style now-playing accessory that relocates on tab minimization; a Landmarks-style edge-to-edge sidebar and background extension; and a Mail/Notes-style long-content view with automatic scroll-edge and source menus. Each scene needs enough underlying content to make the effect visible, functional controls, light/dark and reduced effects states, and an explicit reference link. Names identify the Apple pattern, not a claim that glasscn reproduces Apple's proprietary renderer.

## Follow-up implementation evidence

The findings above preserve the initial state; this section records the behavioral fixes made during the rebuild. Optical rendering, GlassCluster and the new showcase are separate workstreams and require their own evidence.

| Findings | Implemented behavior | Evidence |
|---|---|---|
| W-02, W-09, W-12 | Sidebars meet the window edges, navigation glyphs take the accent, selected rows remain semibold, and the submenu rail is removed. Closed mobile navigation is unmounted; open navigation traps focus and Escape restores the actual trigger, including Safari's non-focusing pointer clicks. Menu group labels keep their written case. | `src/components/glass/sidebar.tsx`, `dropdown-menu.tsx`; mobile behavior tested on Chromium, WebKit and Firefox. |
| W-03, W-04 | Automatic scroll edges use their own material. Navigation title handoff uses measured bar height. Toolbar/Dock track their own scroller. Toolbar's background becomes uniform on scroll; its child surfaces deepen their shadows. Keyboard focus re-expands minimized controls. | `scroll-edge.tsx`, `navigation-bar.tsx`, `toolbar.tsx`, `dock.tsx`; browser tests assert the actual backdrop and computed child box-shadow, not only wrapper attributes. |
| W-06, W-07 | Large bottom sheets fill and anchor to the viewport, returning to inset geometry at medium. Dialog, sheet, alert, action sheet, popover, dropdown, select and confirmation use unique source/destination View Transition identities. Source refs are present before pointerdown or keyboard opening. Existing materialization/reveal remains the no-API fallback; Reduce Motion avoids spatial transitions. | `src/lib/glass-morph.ts`; all eight presentation types opened and closed with motion enabled on all three browser engines, checking the browser reached snapshot-ready state with matching source and destination identities. |
| W-10 | A client scope identity carries the server ThemeScope to body-level portal hosts. Hosts copy resolved theme primitives, preserve scheme and follow scoped/page CSS changes without clipping overlays to the original scope. | `src/lib/glass-portal.tsx`; unit and browser tests change a primitive while the popover is open and assert source palette/light scheme at the portal. The ThemeScope demo now opens these overlays. |
| W-11 | Card's API only admits content material; it no longer exposes the liquid-layer variant. | `src/components/glass/card.tsx`; source/type check. Home composition cleanup is integrated separately by the root workstream. |

Additional gesture defects found while implementing the audit: Dock scrubbing could not return to its starting segment because its event listener retained the initial value; pointer cancellation could navigate; a synthesized post-drag click could navigate twice. `dock.tsx` now reads the latest callback, distinguishes cancellation, suppresses the extra click and cleans up listeners. Both gesture sequences were reproduced failing before the fix. Repeated activation during a pending source capture is coalesced so it cannot create competing transitions or leave a stale transition name; this sequence also has a failing-before/fixed regression test.

Verification run after these source fixes:

```bash
PATH=/tmp/glasscn-tooling/node_modules/.bin:$PATH pnpm exec vitest run src/lib/__tests__/web-liquid-parity.test.tsx src/lib/__tests__/navigation.test.tsx
# 17 passed
PATH=/tmp/glasscn-tooling/node_modules/.bin:$PATH E2E_BASE_URL=http://localhost:3027 pnpm exec playwright test e2e/liquid-surfaces.behavior.spec.ts --project chromium --project webkit --project firefox --workers 2
# 39 passed
```

Fresh `tsc --noEmit` and targeted ESLint passed. Rendered dark scrolled-toolbar, mobile sidebar and forced-light scoped popover screenshots were inspected. Full registry install, production build, complete accessibility/visual suite and native checks belong to the final integration audit; these targeted results do not establish those gates.

### Optical runtime and integrated showcase

The root workstream completed W-01/W-05/W-08 and the accessibility findings after the behavioral fixes above:

| Area | Rebuilt behavior | Verification |
|---|---|---|
| Optical material | `glass-optics.ts` computes a bounded rounded-convex displacement field. `GlassEffects` shares one runtime, caches geometry, tracks resize/viewport changes, enhances new portals and releases removed filters. Chromium uses the displacement; WebKit/Firefox retain CSS blur/material. `LiquidGlass` provides local installation. | Pure symmetry/neutral-interior/bounds tests; actual browser edge-pixel differences exceed neutral-interior differences. Portal opening/closing verifies allocation/release on all three engines. Live opt-out/contrast changes remove enhancement and re-enable it correctly. |
| Grouping | `GlassGroup` remains a shared bar. New `GlassCluster` uses a smooth-union mask over sibling geometry, tracks movement even when the overall width is fixed, and leaves labels outside the filter. | Ref-composition regression and fixed-width transition test; interactive merge lab on `/showcase`. The native counterpart uses actual sibling system effects. |
| Clear and preferences | Clear has a distinct blur and foreground; bright media receives a separate dim. Reduce Transparency/Increase Contrast override the actual panes, including locally customized lenses; Reduce bright effects removes rims/illumination. | Five persisted-preference component tests, live optical/preference browser checks and showcase/material axe matrix. |
| Theme class merging | A configured `glass-cn` helper understands glasscn's radius/spacing groups. Consumer `rounded-button`/`h-control-sm` now replace defaults instead of leaving conflicting classes whose CSS order wins. The helper is shipped in the foundation. | Three focused merge regressions, theme/visual matrix and fresh CLI consumer installation/build. |
| Runtime scheduling | Internal pointer/light style mutations no longer cause a document-wide surface scan. Hydration readiness prevents the runtime from mutating streamed surfaces before React claims them. | Reviewer probe: 30 pointer moves went from 16 full scans/208 computed-style reads to 0/0. Browser console was checked after the hydration correction. |

The integrated site now leads with the media viewer and links `/showcase`. Both installable tracks have Photos, Music, Maps, Safari, Mail and expanded-control scenes. The browser showcase also exposes optical strength/clarity and sibling merging. Actions, keyboard tabs, scrolled bar minimization/re-expansion and filtering have durable browser tests.

Final root verification on November 8, 2026: **26 test files / 314 tests**, **254 browser checks**, production build and **107 web items** installed/type-checked/built in a fresh Next app. The full browser run includes axe, existing visual goldens (unchanged), three engines and blur budgets. Root lint has zero errors and one existing React Compiler warning for TanStack Virtual's incompatible memoization API. Independent review findings in cluster refs, interrupted morph ownership, pointer scheduling, hydration and theme class merging were resolved and rechecked.

The browser still does not implement Apple's private compositor, arbitrary-backdrop luminance sampling, motion-sensor lighting or AppKit window state. Its numerical lens/material/spring choices are documented approximations. These limits are separate from the corrected source/interaction defects. Native uses the OS renderer; no web image is presented as pixel-identical Apple output. See the [completion record](../plans/apple-liquid-glass-27.md) for platform/runtime scope.

## Complete registry inventory

Every baseline entry is listed below. “Structural” means the entry's declared dependencies and surface/token use were scanned, not that every behavior was executed. “Detailed” refers to the source paths discussed above. All liquid components inherit W-01/W-08 and the relevant theme/portal limitations even when their own markup is sound.

| Registry entry | Family | Review depth | Result / relevant finding |
|---|---|---|---|
| `aurora` | surfaces | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `backdrop` | surfaces | Detailed | Media/mesh/noise ground; explicit dim; fixed alpha docs need qualification. |
| `glass` | surfaces | Detailed | Material default; W-01, W-08. |
| `card` | surfaces | Detailed | Material default; unrestricted liquid variant: W-11. |
| `theme-scope` | surfaces | Detailed | DOM scope only; portals: W-10. |
| `typography` | typography | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `prose` | typography | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `button` | controls | Detailed | Glass/prominent/fill variants; fixed centered illumination; W-01. |
| `badge` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `input` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `textarea` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `label` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `switch` | controls | Detailed | Solid resting knob, liquid press; drag source reviewed. |
| `checkbox` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `segmented-control` | controls | Detailed | Sliding knob; drag-to-scrub; optical approximation. |
| `tabs` | controls | Detailed | In-flow material track, not native app-level tabs. |
| `glass-group` | controls | Detailed | One capsule and fill indicator; W-05. |
| `slider` | controls | Detailed | Capsule knob and drag state; optical approximation. |
| `progress` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `kbd` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `separator` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `avatar` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `glass-preferences` | controls | Detailed | Persisted clarity and manual reduce-transparency; behavior differs from OS query. |
| `dialog` | overlays | Detailed | View Transition source path; portal scope W-10. |
| `alert-dialog` | overlays | Detailed | Liquid materializes in place; W-06/W-10. |
| `sheet` | overlays | Detailed | Inset partial/large panel; W-06/W-10. |
| `action-sheet` | overlays | Detailed | Two glass surfaces; fade/slide instead of source flow. |
| `popover` | overlays | Detailed | Liquid reveal using trigger dimensions; W-07/W-10. |
| `tooltip` | overlays | Detailed | Liquid reveal; W-07/W-10. |
| `dropdown-menu` | overlays | Detailed | Liquid reveal, uppercase labels; W-07/W-10/W-12. |
| `toaster` | overlays | Detailed | Liquid Sonner toast style; no optical reconstruction. |
| `dock` | navigation | Detailed | Minimize/accessory/search/scrub; disconnected shadow W-04. |
| `toolbar` | navigation | Detailed | Shared groups; automatic backdrop and shadow W-03/W-04. |
| `scroll-edge` | navigation | Detailed | Pointer-based automatic; state target W-03/W-04. |
| `navigation-bar` | navigation | Detailed | Large/inline handoff; fixed soft edge W-03. |
| `sidebar` | navigation | Detailed | Old geometry and hidden-focus issue W-02/W-09/W-12. |
| `search-field` | navigation | Detailed | Liquid input and suggestions, keyboard inset, explicit placement. |
| `grouped-list` | navigation | Detailed | Content material, filled rows; liquid not required. |
| `activity-rings` | data | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `progress-ring` | data | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `sparkline` | data | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `stat` | data | Detailed | Fill default; optional standalone standard material. |
| `kpi` | data | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `widget` | data | Detailed | Standard material home widgets; accessories primarily fills. |
| `range-chart` | data | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `bar-list` | data | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `gauge` | data | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `tracker` | data | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `category-bar` | data | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `heatmap` | data | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `chart` | data | Detailed | Content chart host; tooltip manually duplicates material CSS. |
| `area-chart` | data | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `bar-chart` | data | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `line-chart` | data | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `donut-chart` | data | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `table` | data | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `data-table` | data | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `chat` | chat | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `chat-markdown` | chat | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `chat-parts` | chat | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `command` | overlays | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `combobox` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `calendar` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `date-picker` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `spinner` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `skeleton` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `select` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `radio-group` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `field` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `input-group` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `button-group` | controls | Detailed | Floating variant shares one capsule; no container merge. |
| `toggle` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `toggle-group` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `stepper` | controls | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `drawer` | overlays | Detailed | Composition alias of bottom Sheet; inherits W-06/W-10. |
| `context-menu` | overlays | Detailed | Liquid at pointer with lifted preview; scoped portal W-10. |
| `confirmation-popover` | overlays | Detailed | Anchored alertdialog; W-07/W-10. |
| `scroll-area` | surfaces | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `accordion` | surfaces | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `collapsible` | surfaces | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `alert` | surfaces | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `item` | surfaces | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `empty` | surfaces | Structural | Content, fill or composition; no standalone Liquid Glass requirement. |
| `dashboard-01` | blocks | Structural | Composition scan; inherits component findings. |
| `analytics-01` | blocks | Structural | Composition scan; inherits component findings. |
| `settings-01` | blocks | Structural | Composition scan; inherits component findings. |
| `auth-01` | blocks | Structural | Composition scan; inherits component findings. |
| `chat-01` | blocks | Structural | Composition scan; inherits component findings. |
