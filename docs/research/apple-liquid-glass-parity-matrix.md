# Apple Liquid Glass parity matrix

The implementation covers more of Apple's public behavior, but **exact parity across all 55 baseline cases is not established**. Native system surfaces, custom React Native compositions, and browser approximations have different evidence. This matrix retains every ID from the [official examples review](apple-liquid-glass-official-examples-review-2026-11.md), including four cases outside the stable baseline.

Updated November 8, 2026 against the frozen native/examples/actions reports, the final targeted standards disposition, and root's reported regression results. The new `liquid-glass-02` examples are Landmarks, Notes, Search, and Materials. The targeted web morph findings are resolved, and P04 now has a bounded system path with runtime evidence. The referenced evidence is retained in the repository. The final browser run passed 289 checks with two intentional engine-specific skips; the production/fresh-install gates are recorded separately in the [verification record](apple-liquid-glass-coverage-verification-2026-11.md). A source file or passing component test establishes a contract, not an observed OS animation, optical match, or physical-device result.

## Reading a status

| Status | Meaning |
| --- | --- |
| **OS** | Source calls the identified system renderer or control. This delegates that part of behavior to the OS; it does not prove the surrounding composition is a system navigation/presentation component. |
| **Custom** | React Native or React owns state, layout, gestures, geometry, or presentation. A native custom composition may contain OS-rendered glass. |
| **Browser** | DOM/CSS/SVG/WAAPI approximation. The browser implementation does not use Apple's compositor. |
| **Unavailable** | A confirmed installed-SDK bridge is absent, or the named platform has no implementation target. This is narrower than saying Apple has no public API. |
| **Unverified** | The exact runtime condition has no evidence identified here. It can coexist with source-supported behavior and passing tests. |

The baseline targets current iOS/iPadOS/macOS design. Native implementation evidence is **iOS only**. There is no AppKit target, so none of the iOS entries establishes native macOS parity. Android and React Native Web use their documented fallback/custom paths.

## Runtime evidence used

The [native implementation report][NR] records the 309-test checkpoint after core text correction. Root's later integrated totals are **339 root tests and 322 native tests in 13 suites**; these supersede earlier totals. The [examples report][ER] and [actions report][AR] contain focused subsets, which must not be added to those totals. Root reports five passing [browser morph regressions][BM], including the three earlier cases observed failing before correction. TypeScript and lint passed, with one existing TanStack warning. The final full E2E run subsequently passed 289 checks, with two intentional engine-specific skips; see the [verification record](apple-liquid-glass-coverage-verification-2026-11.md). This matrix review did not rerun those checks or final broad gates.

**Evidence is retained in the repository.** Referenced implementation reports, accessibility hierarchies and runtime captures are copied into `docs/research/evidence/coverage-review/`; selected final captures also have direct `review-*` links. Historical failure/partial captures retain their explicit labels and do not establish a final pass.

| Evidence | Recorded observation and boundary |
| --- | --- |
| **R1: system button** | On iPhone 18 Pro simulator, iOS 27.0, Expo Go 57.0.9, an event-free system action changed its count and a disabled prominent button exposed the NotEnabled trait. [Button capture][RB]. No physical-device, pointer, or complete appearance matrix. |
| **R2: identified morph** | Two SwiftUI-owned identities rendered; inserting a third and reordering preserved accessible/pressable content. [Morph capture][RM], [reordered hierarchy][RMR]. This confirms hierarchy/actions and visible effects, not a measured optical contour match throughout the animation. |
| **R3: system detents** | Two rejected upward requests rolled back to the same small-detent position; a subsequent accepted request reached the opaque full sheet. [First rejection][RR1], [second rejection][RR2], [accepted hierarchy][RA], [full-sheet capture][RAP]. |
| **R4: nonmodal editing** | A background TextInput accepted text while the system inspector remained presented; the combined screen repeated the flow after sizing corrections. [Combined hierarchy][RC], [combined capture][RCP]. This is the native-contracts screen, not a rich-text Notes selection-formatting test. |
| **R5: custom full detent** | A parent-selected custom full detent reached screen edges with an opaque square surface and safe-area padding. [Custom-sheet capture][RF]. This is a custom presentation, not a system-sheet renderer claim. |
| **R6: advanced Chromium scenes** | All four scenes were inspected; Notes/Search/Materials also ran at 390 px. Browser Notes accepted edits while the formatter remained open, Done saved and restored editor focus, Search now focused input, and removing a scope token restored all results. An impossible 120 px toolbar kept document overflow bounded and scrolled its pinned viewport. A Sage/light/square/compact/matte Notes capture had zero radius/blur. [Report][ER], [Landmarks][EWL], [open Notes][EWN], [token search][EWS], [Materials][EWM], [matte Notes][EWV]. This is Chromium development-page evidence, not the complete browser matrix. |
| **R7: advanced iOS Materials** | Four standard-material cells and material controls rendered on the designated iOS 27 simulator. [Capture][ENM], [hierarchy][ENMJ]. This establishes rendered examples, not measured diffusion/refraction, contrast, or every control interaction. |
| **R8: advanced iOS Landmarks** | Changing a place updated the inspector. After fixing the zero-width host, the final three badges had positive bounds inside the viewport. [Selected hierarchy][ENL], [badge capture][ENB], [badge hierarchy][ENBJ]. Wide iPad panels/scrolling and animated optical contours were not exercised by this phone evidence. |
| **R9: advanced iOS Notes/Search** | Notes accepted “Added under open formatter.” while the system nonmodal sheet remained open; Done saved the edit. Native search landing/focused states were inspected, and entering “no such landmark” produced a query-aware empty state. [Edited Notes][ENN], [saved hierarchy][ENNS], [landing][ENSL], [focused search][ENSF], [no results][ENSE]. Native token-removal runtime is not recorded. |
| **R10: Notes anchor reopening** | The public glass/onAction anchor opened, dismissed and reopened the native Notes sheet. The source remained represented while open; after Done and keyboard dismissal it was accessible again. [Before][ANB], [open][ANO], [dismissed][AND], [restored][ANR], [reopened][ANRO]. Sheet internally converts a direct library Button anchor to its custom RN path to avoid nested SwiftUI hosts; this proves the public composition, not a second system-Button-style path. |
| **R11: core largest text** | At accessibility-extra-extra-extra-large, the core glass anchor wrapped readably and core SheetTitle/SheetDescription used readable multiline layouts. [Core][LGC], [sheet][LGS], [title/description][LGT]. [NU] now owns default semantic iOS ramps; root removed identical scene-local wrappers. This resolves the named core clipping defect, not every advanced scene at largest text. The earlier [Notes failure][LNF] and [partly corrected scene][LNP] remain historical failure/partial evidence, not final pass captures. |
| **R12: source-attached ActionSheet** | The frozen [actions report][AR] verifies the plain uncontrolled iOS ConfirmationDialog subset at the actual mounted source. Archive produced actions 1/source presses 1 and changes `true, false`; reopening then tapping outside kept actions at 1 with source presses 2 and changes `true, false, true, false`. The source retained its bounds and reopened through AX activation. [System capture][ACP], [selected hierarchy][ACS], [passive hierarchy][ACD]. Chromium also passed outside/Escape dismissal, focus return and source View Transition identity. Cancel callbacks deliberately select custom because SwiftUI invokes its cancel-role closure on outside dismissal. iPad adaptation, explicit source zoom and VoiceOver navigation were not exercised. |
| **R13: largest-text SideSheet demo** | After the demo Face/TextInput geometry correction, the actual iOS accessibility-extra-extra-extra-large run showed the Add area face fully visible and the enlarged input placeholder fitting. Core title/description remained readable. [Final capture][LSD], [hierarchy][LSDJ], [report][AR]. Content size was restored to `large` and confirmed. This is the named SideSheet demo, not every advanced scene. |
| **B1: five morph regressions** | Root reports five passing cases covering centered/scaled continuity, glass under departing ghosts, live Reduce Motion and paint-only consumer animation behavior in the [spec][BM]. The first three were reproduced red before correction. The [final standards disposition][SR] independently accepts the targeted fixes in Chromium, WebKit and Firefox. Optical pixel parity is not established. |
| **B2: final targeted three-engine checks** | [Independent review][SR] accepts both remaining residuals: initial jump at `scale(0.8)` is zero, local surface bounds cover departing ghosts, and settled opacity-only animation produces zero rect reads over 350 ms. Live Reduce Motion removes owned transforms/ghosts while the consumer animation remains running. Earlier clarity, invalidation, depth, mirror, tracked-motion, pause/resume and cleanup checks remain accepted. No important finding remains from the targeted web Morph/Cluster reproductions; unannounced WAAPI motion remains outside the helper contract. |

These are reported observations with existing artifacts, not interactions replayed by this matrix review. **Physical-device runtime is unverified for all rows.** R6–R10 provide the named advanced-scene browser/iOS evidence; R1–R5 are not automatically inherited by those scenes. The complete largest-text advanced catalogue, physical OS appearance/accessibility matrix and final broad integration gates are not established. Earlier six-scene observations are recorded separately in the [27 study](apple-liquid-glass-2026-11.md); they are not a fresh run of every changed component.

## Material and foreground

Apple references: [Materials](https://developer.apple.com/design/human-interface-guidelines/materials), [Color](https://developer.apple.com/design/human-interface-guidelines/color), [size-dependent optics at 7:02](https://developer.apple.com/videos/play/wwdc2025/219/?time=422), [UIKit semantic foreground at 21:49](https://developer.apple.com/videos/play/wwdc2025/284/?time=1309), and [input-specific motion](https://developer.apple.com/design/human-interface-guidelines/motion).

| ID and behavior | Web source / example | Native source / example | Runtime and remaining gap |
| --- | --- | --- | --- |
| **M01** Regular luminosity/diffusion adaptation | **Browser:** [WG]/[WE]/[CSS]; W2 Materials and optical lab. | **OS:** [NG] uses regular system glass; N2 Materials. Layout/backdrop choices remain **Custom**. | R6/R7 render the material study. B2 verifies browser depth/diffusion changes, not Apple's backdrop analysis or a native optical match. |
| **M02** Clear over bright/dark/already-dimmed media | **Browser + Custom:** [W2] Materials supplies three dimming cases through Backdrop and LiquidGlass. | **OS + Custom:** [N2] Materials uses clear system glass with composed media/dimming. | R6/R7 render the cases; B2 verifies selected web clarity/contrast states. Live AVKit dimming remains **Unverified**; the existing-dim case is composed media. |
| **M03** Four standard content materials | **Browser:** [WG] canonical `ultraThin`, `thin`, `regular`, `thick`; W2 Materials. | **OS:** [NG] maps four names to four system BlurTint materials; N2 Materials. Old names remain aliases. | R6/R7 render four cells; B2 verifies distinct web utility opacity tiers. All-background contrast and complete OS appearance matrix remain **Unverified**. |
| **M04** Small-to-large material depth | **Browser:** [WE]/[CSS] derive `--glass-surface-depth` from geometry; W2 Materials. | **OS:** [NG] system glass owns thickness adaptation; N2 small/large surfaces. | B2 verifies geometry-driven browser depth/blur; R7 renders static native sizes. Animated menu/optical equivalence remains **Unverified**. Web coefficients are library tuning. |
| **M05** Small-bar inversion versus stable large surfaces | **Browser:** [CSS] semantic labels, size treatment, fixed fills; W2 Materials. | **OS + Custom:** [NG] renderer plus [NU] semantic foreground; N2 Materials. | **Partial:** no new moving-backdrop sweep proves the size-specific inversion distinction. Web has no equivalent system analysis. |
| **M06** Meaningful tint and colored selected labels | **Browser:** [WB], [WT], W1 Music/controls, W2 Notes. | **OS** for eligible [NB] `variant="prominent"`/`onAction`; **Custom + OS surface** for RN-content/eventful buttons and N1/N2 layouts. | R1 covers a disabled prominent system button, not Notes' full light/dark/increased-contrast color matrix. |
| **M07** Vibrant semantic foreground hierarchy | **Browser:** [CSS] label tokens; W2 secondary/tertiary labels. | **OS + Custom:** [NU] dynamic semantic foreground inside [NG]; N2 Materials. | R6/R7 render label hierarchy. Changing-backdrop contrast and identical UIKit label compositing remain **Unverified**. R11 separately verifies readable core text scaling. |
| **M08** Touch response stronger than trackpad | **Browser:** pointer/press handling in [WE], [WB], [CSS]. | **OS** for [NB] system styles; **Custom + OS surface** for Press/Glass paths. | **Unverified:** matched touch/trackpad/keyboard comparison. No universal spring/scale can be called Apple's input-specific implementation. |

## Combining and transitioning glass

Apple references: [custom SwiftUI glass](https://developer.apple.com/documentation/swiftui/applying-liquid-glass-to-custom-views), [GlassEffectContainer](https://developer.apple.com/documentation/swiftui/glasseffectcontainer), [Landmarks badges](https://developer.apple.com/documentation/swiftui/landmarks-displaying-custom-activity-badges), [effect identity](https://developer.apple.com/documentation/swiftui/view/glasseffectid(_:in:)), [union membership](https://developer.apple.com/documentation/swiftui/view/glasseffectunion(id:namespace:)), [transition policy](https://developer.apple.com/documentation/swiftui/glasseffecttransition), and [glass button guidance](https://developer.apple.com/videos/play/wwdc2026/8120/?time=441).

| ID and behavior | Web source / example | Native source / example | Runtime and remaining gap |
| --- | --- | --- | --- |
| **G01** Shared container, proximity blending | **Browser:** [WC] smooth union mask; merging lab and [WM]. | **OS:** [NC]/[NG] GlassContainer and [NM] SwiftUI GlassEffectContainer. | R2/R8 show native groups; B2 verifies supported mask tracking, local units under scale and no settled paint-only polling. Exact optical merge fidelity remains **Unverified**. |
| **G02** Badge insertion/removal with stable identities | **Browser:** [WM] measures stable IDs and animates geometry; W2 Landmarks. | **OS + Custom:** [NM] Namespace/container/`glassEffectId`, RNHostView content and animated hierarchy; N2 Landmarks. | R2 verifies contracts-screen actions; R8 advanced badge layout. B1/B2 verify centered/scaled start continuity and departing-ghost coverage. Native removal contour and optical match remain **Unverified**. |
| **G03** Identity continuity independent of position | **Browser:** [WM] IDs survive reorder; old overlay helper is separate [WTR]. | **OS:** [NM] stable namespace/IDs with revision-driven animation. | R2 verifies native reorder/actions. B1/B2 accept continuity, scaled local geometry, interruption cleanup and consumer-animation preservation without settled polling. No web/native optical equality claim. |
| **G04** Multiple named unions within one container | **Partial Browser:** [WC] proximity mask is one group, with no named union-membership API. | **Unavailable bridge:** installed Expo does not expose `glassEffectUnion`; [NM] does not pretend to implement it. | **Capability gap.** Proximity merging is not named-union parity. Apple's public API exists. |
| **G05** Selectable matched/materialize/identity policy | **Partial Browser:** [WM]/[WTR] geometry, entry/exit and fallback policies are custom. | **OS effect toggle** in [NG] `materialized`; **Unavailable bridge** for explicit `GlassEffectTransition` in [NM]. | **Capability gap:** effect-to-none animation is not selectable SwiftUI transition parity. No explicit distant-materialize/identity runtime evidence. |
| **G06** Native glass button style, shape and action | **Browser:** [WB] styles and normal DOM action semantics. | **OS:** [NB] eligible plain text glass/prominent buttons use SwiftUI Button/styles/border shape with `onAction`. RN `onPress`, custom content/style/loading select **Custom + OS surface**. | R1 verifies action and disabled trait on the OS path. Eventful/icon/custom-content buttons are deliberately not claimed as system Button style. |

## Navigation, windows, and extended content

Apple references: [adoption guide](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass), [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars), [Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars), [Landmarks](https://developer.apple.com/documentation/swiftui/landmarks-building-an-app-with-liquid-glass), [horizontal scrolling](https://developer.apple.com/documentation/swiftui/landmarks-extending-horizontal-scrolling-under-a-sidebar-or-inspector), [backgroundExtensionEffect](https://developer.apple.com/documentation/swiftui/view/backgroundextensioneffect()), [inactive-window example](https://developer.apple.com/videos/play/wwdc2026/269/?time=171), and [resizable apps](https://developer.apple.com/videos/play/wwdc2026/278/?time=34).

| ID and behavior | Web source / example | Native source / example | Runtime and remaining gap |
| --- | --- | --- | --- |
| **N01** MiniPlayer above/inline with tabs | **Browser + Custom:** W1 Music and Dock layout. | **Custom + OS surface:** N1 Music; **OS** alternative in [NTABS] BottomAccessory/usePlacement. | Changed worktree and native router accessory runtime **Unverified**. The in-screen MiniPlayer is not the router's native accessory. |
| **N02** Tabs minimize/restore on scroll | **Browser + Custom:** W1 Music and scroll hooks. | **Custom:** N1/Dock; **OS** [NTABS] `minimizeBehavior` passthrough. | Native system path is source-supported; no fresh native-tabs scroll run or top-level router evidence here. |
| **N03** Tabs adapt to sidebar, preserve section state | **Partial Browser:** web sidebar and tabs are separate compositions. | **OS:** [NTABS] `sidebarAdaptable` maps to native tabSidebar mode. N1 Mail is a separate **Custom** example. | **Unverified:** iPad resizing and state preservation. No claim of a native macOS app target. |
| **N04** Edge sidebar, accent navigation symbols | **Browser + Custom:** W1 Mail/[WSIDE]; W2 Landmarks uses liquid sidebar/inspector surfaces. | **Custom + OS surface:** N1 Mail/[NSIDE]; N2 wide Landmarks uses liquid surfaces. | R6 captures browser Landmarks; R8 exercises phone selection. Native wide panels/live resizing remain **Unverified**; compact phone evidence does not establish iPad geometry. |
| **N05** Image-only mirrored extension, foreground once | **Browser:** [WBG] measured mirrored images; W2 Landmarks. | **Custom:** [NBG] mirrored Image/blurRadius; N2 Landmarks. | B2 observes decorative mirrors and one foreground heading in the standalone demo; R6 captures Landmarks. Native wide extension is **Unverified**. Both tracks own extents and do not call Apple's extension API. |
| **N06** Horizontal content scrolls under both panels | **Browser + Custom:** W2 Landmarks edge-spanning row and inset content. | **Custom + OS scrolling:** N2 horizontal ScrollView with wide-panel insets. | R6 captures browser layout; no recorded two-panel horizontal gesture/overlap or native wide-layout run. Clipping/accessibility during those gestures remain **Unverified**. |
| **N07** Inspector follows current selection | **Browser + Custom:** W2 Landmarks selection updates an aside. | **Custom + OS surface:** N2 selection updates a wide inspector/compact content. | R8 verifies native selection changes the inspector. This remains custom association; wide iPad geometry and SwiftUI `inspector` delegation are not established. |
| **N08** Inactive window dims custom foreground | **Browser:** [WE] focus/visibility activity tracking plus [CSS] label colors and scoped preview attribute. | **Partial OS:** system views may adapt. No `appearsActive` bridge/custom-foreground policy was found in [NA]/[NU]. | B2 verifies controlled browser focus/shadow event handling, not physical OS window behavior. Custom native inactive foreground, iPad multiwindow and AppKit remain gaps. Never fade glass ancestors. |
| **N09** Continuous resizing, geometry-based adaptation | **Browser + Custom:** W2 container queries; measured [WT] allocation. | **Custom:** N2 measured width/[NSIDE]; **OS** NativeTabs routing structure. | R6 verifies selected 390 px scenes and a bounded impossible-width toolbar. Continuous native window resizing, state retention and iPhone Mirroring remain **Unverified**. |

## Toolbars and scrolling

Apple references: [Landmarks toolbar grouping](https://developer.apple.com/documentation/swiftui/landmarks-refining-the-system-provided-glass-effect-in-toolbars), [shared background visibility](https://developer.apple.com/documentation/swiftui/toolbarcontent/sharedbackgroundvisibility(_:)), [priority/overflow/pinned Share at 6:15](https://developer.apple.com/videos/play/wwdc2026/269/?time=375), [current minimization API](https://developer.apple.com/documentation/swiftui/view/toolbarminimizationbehavior(_:for:)), and [27 automatic edge](https://developer.apple.com/videos/play/wwdc2026/278/?time=652).

| ID and behavior | Web source / example | Native source / example | Runtime and remaining gap |
| --- | --- | --- | --- |
| **T01** Logical shared groups and spacers | **Browser:** [WT] ToolbarGroup/Spacer; toolbar demo and W2 Notes. | **Custom + OS surface:** [NT] groups/spacers; N2 Notes. | R6/R9 render the Notes toolbar with working editing/save flows. These are composed groups, not framework ToolbarItemGroup delegation; each command's runtime is not established. |
| **T02** Avatar without shared background | **Browser + Custom:** W2 Notes places an avatar outside the glass command group. [WT] permits ungrouped content. | **Custom:** [NT] permits ordinary siblings outside ToolbarGroup; N2 has no corresponding avatar. | R6 captures web Notes. **Partial:** no explicit sharedBackgroundVisibility API/native avatar example. |
| **T03** Important actions admitted before secondary ones | **Browser + Custom:** [WT]/[WALLOC] measured `priority`; W2 Notes Undo/Redo. | **Custom:** [NT]/[NALLOC] measured `priority`; N2 Notes. | Focused tests verify allocation; R6 verifies extreme-width overflow. Native largest-text evidence shows Share preserved while others overflow, not every priority ordering. No SwiftUI visibilityPriority delegation. |
| **T04** Explicit overflow-only commands | **Browser + Custom:** `overflow="always"` in [WT]; W2 Word count. | **Custom layout + OS menu when eligible:** [NT]/[NMENU]; N2 Word count. | Focused tests verify placement/actions; R6 observes bounded More/pinned layout. Full live menu activation/disabled-action resize matrix remains **Unverified**. |
| **T05** Pinned trailing Share | **Browser + Custom:** [WT]/[WALLOC] `pinned`; W2 Share. | **Custom:** [NT]/[NALLOC] pinned group; N2 Share. | R6 verifies a 62 px pinned viewport for 90 px content at 120 px toolbar width. Examples' large-text run preserves a grown Share control. No `.topBarPinnedTrailing` delegation or complete resizing matrix. |
| **T06** Navigation minimization updates tabs/safe area | **Partial Browser:** [WT] minimizes composed toolbar; [WSCROLL] tracks scroll. | **Partial Custom:** [NT]/[NNAV]/[NSCROLL] animate bars/titles. | **Capability gap:** composed bars do not implement full system navigation-bar + integrated-top-tabs + automatic-safe-area contract. Native tab-bar minimization is separately delegated in N02. |
| **T07** Automatic edge has its own 27 appearance | **Browser:** [WSCROLL]/[CSS] automatic treatment. | **Custom:** [NSCROLL] automatic strip; NativeTabs system bars retain OS behavior. | **Unverified:** optical equivalence of custom edges. A matching variant name does not establish the system effect. |
| **T08** Dense edge/custom overlapping controls | **Browser:** [WSCROLL] explicit hard/soft/automatic styles. | **Custom:** [NSCROLL] explicit styles and ScrollEdgeProvider. | **Partial:** custom composition exists; no Calendar-equivalent runtime or UIKit scroll-edge interaction bridge is established. |

The current Apple reference spells the API `toolbarMinimizationBehavior`, while the WWDC26 code examples use `toolbarMinimizeBehavior`. Neither spelling is used to imply that the custom allocator or bar composition calls SwiftUI's toolbar system.

## Search

Apple references: [search design](https://developer.apple.com/videos/play/wwdc2026/292/), [field/material placement at 1:39](https://developer.apple.com/videos/play/wwdc2026/292/?time=99), and [Searching](https://developer.apple.com/design/human-interface-guidelines/searching). Prominent *behavior* is separated from the provisional native tab role in X01.

| ID and behavior | Web source / example | Native source / example | Runtime and remaining gap |
| --- | --- | --- | --- |
| **S01** Destination search permits browsing first | **Browser + Custom:** W2 Search destination mode, folders, recents and results. W1 Music has a Search tab. | **Custom:** N2 destination mode; [NTABS] exposes ordinary/search-role route structure separately. | R6/R9 inspect the landing experience. **Partial:** the mode switch is not a routed TV-style search tab; native router behavior is separate. |
| **S02** Immediate search focuses input/keyboard | **Browser + Custom:** W2 Search now remounts [WSEARCH] with autoFocus. | **Custom input + OS keyboard:** N2 uses [NSEARCH] autoFocus and [NB] onAction entry. | R6 verifies browser input focus; R9 records native focused search and entered text. Complete keyboard/reachability/repeated-activation matrix remains **Unverified**. No TabRole.prominent claim. |
| **S03** Toolbar field/button adapts, rides keyboard | **Browser:** [WSEARCH] minimized/bottom placement and visualViewport inset. | **Custom + OS keyboard:** [NSEARCH] minimized state and KeyboardStickyView. | **Partial:** manual contracts exist; one/two/many neighboring actions do not automatically choose system toolbar search placement. |
| **S04** Inline library search has local scope/content styling | **Browser + Custom:** W2 local Input filters the library and names its scope. | **Custom:** N2 local Input filters current library. | R6/R9 render scoped inputs; focused tests verify filtering. Actual native scoped-filter interaction is **Unverified**. Generic SearchField itself remains a glass control. |
| **S05** Search preserves selected split-view detail | **Browser + Custom:** W2 result selection and adjacent detail. | **Custom:** N2 result selection/detail, width-dependent overall arrangement. | R6/R9 render the composed experience. **Partial:** no system trailing-toolbar cross-column search or fresh iPad split-view runtime. |
| **S06** Sidebar-local search and toolbar expansion/overflow | **Browser + Custom:** W2 folder filter and [WT] are available separately. | **Custom:** N2 folder filter and [NT] separately. | **Partial:** sidebar-local filtering exists; integrating expanded toolbar search with displaced commands remains a gap. |
| **S07** Removable recents, predictions, scope/tokens | **Browser + Custom:** W2 recents/removal/completion styling/scope; [WSEARCH] renders removable field tokens with empty-query Backspace removal. | **Custom:** N2 equivalent state; [NSEARCH] renders removable field tokens and handles Backspace. Scope supplies the example token. | R6 verifies browser scope-token removal restores all results; focused tests cover token/keyboard contracts. Native token removal, complete keyboard/accessibility and every suggestion/history interaction remain **Unverified**. |
| **S08** Clear, Cancel and query-aware no-results | **Browser + Custom:** [WSEARCH]/W2 clear/cancel/no-results and filter reset. | **Custom:** [NSEARCH]/N2 equivalents; keyboard uses OS input. | R9 verifies native query-aware no-results; R6 verifies selected browser input/filter behavior. Complete Clear/Cancel/dismissal/focus-return matrix remains **Unverified**. |

## Presentations and controls

Apple references: [source-linked presentations](https://developer.apple.com/videos/play/wwdc2025/284/?time=811), [Landmarks partial/full sheet](https://developer.apple.com/videos/play/wwdc2025/323/?time=397), [Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets), [Menus](https://developer.apple.com/design/human-interface-guidelines/menus), [transient glass thumbs](https://developer.apple.com/design/human-interface-guidelines/materials), [neutral/tick slider](https://developer.apple.com/videos/play/wwdc2025/284/?time=1096), [thumbless slider](https://developer.apple.com/videos/play/wwdc2025/284/?time=1139), [concentricity](https://developer.apple.com/videos/play/wwdc2025/323/?time=1047), and [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility).

| ID and behavior | Web source / example | Native source / example | Runtime and remaining gap |
| --- | --- | --- | --- |
| **P01** Menu/popover/sheet preserves source relation | **Browser:** [WTR] and overlay components use source geometry/View Transitions. | **OS** eligible [NMENU]/[NACTION] presentations; **Custom** generic [NPOP]; [NSHEET] accepts an anchor. | R10 verifies Notes' source lifecycle; R12 verifies actual ActionSheet source attachment and browser transition identity. **Partial:** no explicit native source-linked zoom or exact morph is established. |
| **P02** Partial inset glass becomes full opaque sheet | **Browser + Custom:** [WSHEET] detents; W1 Maps/Photos. | **OS:** [NSHEET] eligible bottom sheet uses controlled SwiftUI presentationDetents; **Custom** fallback supports square opaque full geometry. | R3 verifies controlled small/full system positions and opacity; R5 verifies custom full geometry. Does not measure every intermediate material frame. |
| **P03** Nonmodal inspector allows parent editing | **Browser + Custom:** W2 Notes `modal={false}` and [WSHEET]. | **OS + Custom:** N2 Notes/[NSHEET] enables presentationBackgroundInteraction; custom iOS fallback uses passthrough overlay. | R6 verifies browser editing/save/focus; R4/R9 verify native background editing and saved text; R10 verifies the public anchor lifecycle. **Partial Notes fidelity:** formatting affects the whole note, not the selected range. |
| **P04** Anchored inline versus centered action sheet | **Browser:** [WACTION] Radix Dialog choice semantics, outside/Escape dismissal, focus return and source identity. | **OS:** [NACTION] plain declarative uncontrolled iOS subset uses source-mounted Expo ConfirmationDialog. Controlled state, RN action events, rich/preferred/styled content, absent/multiple sources, `native={false}` and any Cancel callback select **Custom + OS surface**. | R12 verifies source-attached iOS popover, Archive once, passive dismissal without invented Cancel and source return/reopen. The independent [spec review](apple-liquid-glass-spec-review.md) additionally accepts the frozen supported subset after 13 native/three web tests and normal/reduced-motion browser checks in all three engines. **Partial:** iPad adaptation/centered system layout and explicit native zoom are unverified. SwiftUI owns Cancel visibility; callback-bearing Cancel remains custom. |
| **P05** Sparse purposeful menu icons/group consistency | **Browser + Custom:** menus permit textual groups and optional icons. | **OS** eligible [NMENU] action model includes optional systemImage; controlled/custom menus use **Custom + OS surface**. | API can express sparse groups. No new platform menu-bar/context icon-policy or complete menu audit runtime is established. |
| **P06** Modal isolation, save/discard, focus return | **Browser:** [WSHEET]/dialogs/[WACTION] and W1 Mail/W2 Notes state flows. | **OS** eligible [NSHEET]/[NACTION]; custom dialog/fallback paths otherwise. | R6 verifies browser Done/save/editor focus; R9/R10 native save/dismiss/reopen; R12 browser outside/Escape focus return and native passive-dismissal callbacks. Full modal discard/back/VoiceOver matrix remains **Unverified**. |
| **C01** Interactive slider/switch/segment thumb | **Browser:** [WSLIDER]/control styles; W1 Controls. | **OS** eligible plain slider/switch/segment; richer options select **Custom + OS surface**. | System behavior is delegated only on eligible paths. Full held/cancel/release/pointer matrix **Unverified** here. |
| **C02** Tick-only slider and neutral origin | **Browser + Custom:** [WSLIDER]; W2 Materials neutral balance. | **Custom:** [NSLIDER] ticks/neutral force SliderTrack, not SystemSlider; N2 Materials. | R6/R7 render the controls. Exact drag/tick/neutral interaction matrix remains **Unverified**; no UIKit trackConfiguration delegation claim. |
| **C03** Thumbless scrubber | **Browser + Custom:** [WSLIDER] progress style hides its visual thumb except keyboard focus. | **Custom:** [NSLIDER] progress uses SliderTrack, not the system thumbless API; N2 Materials. | R6/R7 render the approximation. Native UISlider thumbless rendering, drag momentum/stretch and full keyboard behavior are not established. |
| **C04** Inset/concentric nested geometry | **Browser:** [CSS] rounded-concentric and W2 inset control. | **Custom:** N2 calculates radius from surface radius minus inset. | R6/R7 render the inset example; R6 also verifies one square/matte Notes variant. No native containerConcentric delegation or moving-window geometry proof. |
| **C05** Focus, disabled and alternate input access | **Browser:** native DOM/Radix semantics and focus styles in controls/[WT]. | **OS** eligible [NB]/controls; **Custom** RN accessibility and [NU] global semantic iOS type ramps. | R1 verifies disabled trait; R2 actions; R6 focus; R11 core largest text; R13 corrected largest-text SideSheet face/input. Whole advanced catalogue, VoiceOver order and all alternate-input paths remain **Unverified**. |

## Accessibility and viewer appearance

Apple references: [system adoption/accessibility](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass), [Show Borders](https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityshowborders), [Reduce Bright Effects](https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducehighlightingeffects), [Motion](https://developer.apple.com/design/human-interface-guidelines/motion), and [27 clarity setting](https://developer.apple.com/videos/play/wwdc2026/269/?time=132).

| ID and behavior | Web source / example | Native source / example | Runtime and remaining gap |
| --- | --- | --- | --- |
| **A01** Reduced transparency/increased contrast | **Browser + Custom:** [WP]/[CSS]/[WE] preferences/media queries and solid fallback. | **OS + Custom:** [NA] live AccessibilityInfo plus [NG]/controls fallback and semantic colors. | Source/tests cover contracts. R1–R5 did not run an independent OS appearance/accessibility matrix; current runtime coverage remains **Unverified**. |
| **A02** Clearly visible interactive borders | **Browser + Custom:** [WP] Show control borders and [CSS] border treatment. | **Unavailable target** for native macOS Show Borders; [NA] has no dedicated Show Borders bridge. | Source-supported web setting; native custom-control setting propagation and macOS runtime remain gaps. High contrast is not automatically the dedicated macOS 27 setting. |
| **A03** Reduced bright highlights/flashes | **Browser + Custom:** [WP]/[CSS] reduceHighlights removes rims/illumination. | **OS** system effects can own their response; [NA] does not expose Reduce Bright Effects to custom RN UI. | **Partial:** native custom setting response and live changes **Unverified**. Do not infer them from Reduce Motion. |
| **A04** Reduced motion, including transitions | **Browser:** CSS media queries/[WM]/[WTR] reduced-motion paths. | **OS + Custom:** [NA], [NM], [NSHEET] suppress custom animation as appropriate. | B1/B2 verify live cancellation, preserved consumer animation and zero settled geometry reads from opacity-only motion. Native new-component OS-setting matrix remains **Unverified**. |
| **A05** System clarity and custom viewer preference | **Browser + Custom:** [WP] persistent clarity slider/[CSS]. | **OS** [NG]/[NB] preserve system glass; custom fallback materials use library tokens. | B2 verifies selected full/intermediate web clarity contrast states across three engines. Native endpoints/live settings and full palette/backdrop matrix remain **Unverified**. Web coefficients are library tuning. |

## Provisional roles and additional platforms

| ID and official capability | Web/native mapping | Strict status |
| --- | --- | --- |
| **X01** [`TabRole.prominent`](https://developer.apple.com/documentation/swiftui/tabrole/prominent), one prominent tab, optional default search prominence | W2/N2 demonstrate immediate-search *behavior*. [NTABS] exposes installed NativeTabs roles, including search. | **Provisional + Unavailable bridge:** returned Apple reference is Beta; the [installed router role union](../../sandbox/native/node_modules/expo-router/build/native-tabs/types.d.ts) has no prominent role. A blur style named `prominent` is unrelated. No role runtime claim. |
| **X02** [iPhone Duo vertical bars/fold layouts](https://developer.apple.com/documentation/technologyoverviews/preparing-your-app-for-iphone-duo), [September 2026 SwiftUI updates](https://developer.apple.com/documentation/updates/swiftui) | [WT]/[NT] remain horizontal; no fold-region/axis behavior implementation identified. | **Outside baseline / Unavailable implementation.** Per-symbol deployment availability, bridge support and device runtime need separate work. |
| **X03** [tvOS focused glass](https://developer.apple.com/design/human-interface-guidelines/materials) in Destination Video/Top Shelf/Control Center | No tvOS target or remote-focus example inspected. | **Outside baseline / Unavailable target.** Browser/RN focus styles do not establish tvOS focus rendering. |
| **X04** [visionOS spatial glass](https://developer.apple.com/design/human-interface-guidelines/materials), environment adaptation and no separate Dark Mode | No spatial target; iOS Liquid Glass and web lenses are different integration paths. | **Separate material family / Unavailable target.** No spatial renderer parity claim. |

## Capability gaps that remain

1. **Public APIs beyond the installed bridge:** named unions and explicit glass transition policy remain unavailable. Native `appearsActive` integration and dedicated custom-UI borders/highlight settings are not implemented by the inspected RN accessibility layer. There is no AppKit target.
2. **System navigation/presentation ownership:** toolbars, background extension, inspector layout, search placement and custom scroll edges are compositions. They do not acquire native ToolbarItem, backgroundExtensionEffect, inspector, searchable or navigation-safe-area semantics merely by containing a system glass surface.
3. **Presentation fidelity:** P04's bounded uncontrolled declarative iOS path and browser passive dismissal are verified in R12. Controlled/eventful/rich cases and Cancel callbacks retain custom presentation. Native iPad adaptation, centered system comparison and explicit source-linked zoom remain unverified; generic popovers remain custom. Notes deliberately styles the whole note rather than selected rich text.
4. **Search integration:** R6/R9 verify named browser/native entry and result states; R6 verifies web token removal. System toolbar-search allocation is separate from ToolbarCommands, and native token removal, complete keyboard/accessibility and routed search-role behavior require further evidence.
5. **Rendering/evidence:** B2 resolves the targeted scale/paint-only findings; CSS optics still approximate Apple's renderer. R11/R13 resolve named core and SideSheet largest-text defects, while the complete advanced catalogue rerun remains outstanding. iPad/multiwindow, complete preferences/clarity, physical-device performance and optical equivalence remain unverified. The final full E2E run passed 289 checks with two intentional skips, and all referenced proof is retained under docs/research/evidence. The production build and fresh web 111/native 101 installs also passed; the native installed copy passed 322 tests. See the verification record for exact commands and boundaries.

This review changed only this document. It ran no broad tests and changed no simulator/process state. Matrix dispositions are frozen for root's durable evidence-link migration. Fresh installs and completion of the full E2E/broad gates belong to root's integration run; focused tests/captures are not release/install proof.

## Source keys

The matrix's source keys resolve to implementation files or evidence records. `W1/N1` are the first six scenes; `W2/N2` are the four new scenes. [NR] records native path gates and limits; [ER] the advanced examples; [AR] ActionSheet and final SideSheet proof; [SR] the independent browser disposition. Workspace targets remain provisional until root moves the selected evidence into the documentation tree.

[W1]: ../../src/components/blocks/liquid-glass-01.tsx
[N1]: ../../registry/native/liquid-glass-01.tsx
[W2]: ../../src/components/blocks/liquid-glass-02.tsx
[N2]: ../../registry/native/liquid-glass-02.tsx
[WG]: ../../src/components/glass/glass.tsx
[NG]: ../../registry/native/glass.tsx
[WE]: ../../src/components/glass/glass-effects.tsx
[CSS]: ../../registry/stylesheet.mjs
[NU]: ../../registry/native/ui.tsx
[WB]: ../../src/components/glass/button.tsx
[NB]: ../../registry/native/button.tsx
[WC]: ../../src/components/glass/glass-cluster.tsx
[NC]: ../../registry/native/glass-cluster.tsx
[WM]: ../../src/components/glass/glass-morph.tsx
[NM]: ../../registry/native/glass-morph.tsx
[WTR]: ../../src/lib/glass-transitions.ts
[WBG]: ../../src/components/glass/background-extension.tsx
[NBG]: ../../registry/native/background-extension.tsx
[WSIDE]: ../../src/components/glass/sidebar.tsx
[NSIDE]: ../../registry/native/sidebar.tsx
[NTABS]: ../../registry/native/tabs-layout.tsx
[WT]: ../../src/components/glass/toolbar.tsx
[NT]: ../../registry/native/toolbar.tsx
[WALLOC]: ../../src/lib/glass-toolbar-layout.ts
[NALLOC]: ../../registry/native/toolbar-layout.ts
[WSCROLL]: ../../src/components/glass/scroll-edge.tsx
[NSCROLL]: ../../registry/native/scroll-edge.tsx
[NNAV]: ../../registry/native/navigation-bar.tsx
[WSEARCH]: ../../src/components/glass/search-field.tsx
[NSEARCH]: ../../registry/native/search-field.tsx
[WSHEET]: ../../src/components/glass/sheet.tsx
[NSHEET]: ../../registry/native/sheet.tsx
[WACTION]: ../../src/components/glass/action-sheet.tsx
[NACTION]: ../../registry/native/action-sheet.tsx
[NMENU]: ../../registry/native/dropdown-menu.tsx
[NPOP]: ../../registry/native/popover.tsx
[WSLIDER]: ../../src/components/glass/slider.tsx
[NSLIDER]: ../../registry/native/slider.tsx
[WP]: ../../src/components/glass/glass-preferences.tsx
[NA]: ../../registry/native/a11y.tsx
[NR]: evidence/coverage-review/task-native-report.md
[RB]: evidence/coverage-review/native-runtime/glass-native-system-button.png
[RM]: evidence/coverage-review/native-runtime/glass-native-morph.png
[RMR]: evidence/coverage-review/native-runtime/glass-morph-reordered.json
[RR1]: evidence/coverage-review/native-runtime/glass-sheet-reject-1.json
[RR2]: evidence/coverage-review/native-runtime/glass-sheet-reject-2.json
[RA]: evidence/coverage-review/native-runtime/glass-sheet-accepted.json
[RAP]: evidence/coverage-review/native-runtime/glass-native-sheet-accepted.png
[RC]: evidence/coverage-review/native-runtime/combined-final.json
[RCP]: evidence/coverage-review/native-runtime/combined-final.png
[RF]: evidence/coverage-review/native-runtime/glass-native-custom-full.png
[ER]: evidence/coverage-review/task-examples-report.md
[SR]: apple-liquid-glass-standards-review.md
[BM]: ../../e2e/glass-morph.coverage.spec.ts
[EWL]: evidence/coverage-review/examples-runtime/web-landmarks.png
[EWN]: evidence/coverage-review/examples-runtime/web-notes-edit-open.png
[EWS]: evidence/coverage-review/examples-runtime/web-search-token-compact.png
[EWM]: evidence/coverage-review/examples-runtime/web-materials.png
[EWV]: evidence/coverage-review/examples-runtime/web-notes-sage-light-square-compact-matte.png
[ENM]: evidence/coverage-review/examples-runtime/native-materials.png
[ENMJ]: evidence/coverage-review/examples-runtime/native-materials.json
[ENL]: evidence/coverage-review/examples-runtime/native-landmarks-selected.json
[ENB]: evidence/coverage-review/examples-runtime/native-badges-fixed.png
[ENBJ]: evidence/coverage-review/examples-runtime/native-badges-fixed.json
[ENN]: evidence/coverage-review/examples-runtime/native-notes-edited-sheet.png
[ENNS]: evidence/coverage-review/examples-runtime/native-notes-saved.json
[ENSL]: evidence/coverage-review/examples-runtime/native-search-landing.json
[ENSF]: evidence/coverage-review/examples-runtime/native-search-focused.json
[ENSE]: evidence/coverage-review/examples-runtime/native-search-no-results.png
[ANB]: evidence/coverage-review/native-runtime/glass-notes-anchor-before.json
[ANO]: evidence/coverage-review/native-runtime/glass-notes-anchor-open.json
[AND]: evidence/coverage-review/native-runtime/glass-notes-anchor-dismissed.json
[ANR]: evidence/coverage-review/native-runtime/glass-notes-anchor-restored.json
[ANRO]: evidence/coverage-review/native-runtime/glass-notes-anchor-reopened.json
[LGC]: evidence/coverage-review/native-runtime/glass-gtext-largest-core.png
[LGS]: evidence/coverage-review/native-runtime/glass-gtext-largest-sheet.png
[LGT]: evidence/coverage-review/native-runtime/glass-gtext-largest-title-description.png
[LNF]: evidence/coverage-review/examples-runtime/native-notes-largest-text.png
[LNP]: evidence/coverage-review/examples-runtime/native-notes-largest-ramps.png
[AR]: evidence/coverage-review/task-actions-report.md
[ACP]: evidence/review-native-action-sheet.png
[ACS]: evidence/coverage-review/native-runtime/actions/glasscn-actions-selected-final.json
[ACD]: evidence/coverage-review/native-runtime/actions/glasscn-actions-passive-final.json
[LSD]: evidence/review-native-largest-sheet.png
[LSDJ]: evidence/coverage-review/native-runtime/actions/glasscn-actions-largest-sheet-final.json
