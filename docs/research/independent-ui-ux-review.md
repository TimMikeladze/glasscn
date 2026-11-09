# Independent UI/UX review: glasscn against Apple's iOS 27 Liquid Glass

Reviewed November 8, 2026 on branch `liquid-glass-27-rebuild` (HEAD `d896a3d`, plus the uncommitted Liquid Glass 27 rebuild in the working tree). The criteria come from Apple's own pages, opened fresh for this review and recorded per case in [apple-criteria.md](evidence/independent-ui-ux/apple-criteria.md). I formed the findings below from the running site and the iOS 27 simulator before reading the parity matrix, the coverage verification or the earlier standards/spec reports.

The owner asked for the fixes to follow in the same session, with no backwards compatibility. Every finding marked **Fixed** was corrected after its "before" evidence was captured; the [fix spec](../specs/apple-liquid-glass-ui-review-fixes.md) lists the changes. Before captures are under [`evidence/independent-ui-ux/web/`](evidence/independent-ui-ux/web/) and [`native/`](evidence/independent-ui-ux/native/); after captures under [`web-after/`](evidence/independent-ui-ux/web-after/) and [`native-after/`](evidence/independent-ui-ux/native-after/).

## Verdict

**Web visual fidelity:** close for materials and controls, uneven for compositions. The Materials lab, slider variants, control thumbs, Maps controls and Safari's bottom bar read as iOS 27. Before the fixes, Notes and Mail read as web forms with glass on top, Music placed its minimized tab on the wrong side, and Photos dimmed the whole photo. After the fixes the ten scenes follow the layouts of Apple's Photos, Music, Mail, Notes and Landmarks sample. Optics stay a CSS/SVG approximation; nothing here proves pixel equivalence with Apple's shader.

**Web task usability:** blocked approval before the fixes. `/themes` opened 7,500–14,000 px down the page, and two scenes presented sheets over the docs page outside their own frame. Both are fixed and covered by Playwright. Search could show a detail for a result its own filter had removed (fixed).

**Native visual fidelity:** system glass, buttons, menus, confirmation dialogs and sheets are delegated to iOS and look right. The compositions around them did not: a 1.25 type scale instead of iOS text styles, Android/web glyph meanings, a hard 96% scroll-edge band, phone layouts that put search and toolbars where Apple doesn't, and the same Notes/Photos problems as the web. After the fixes the scenes follow the iOS 27 apps on the simulator; motion and VoiceOver gestures remain untested.

**Native task usability:** two blockers for VoiceOver users before the fixes (unnamed system menu triggers) and one for large-text users (scenes grew to three screens). Both fixed. One open defect: a nonmodal system sheet stays presented over a screen pushed after it (UX-N18).

**Not tested:** physical iPhone/iPad, VoiceOver gestures, Full Keyboard Access on device, AppKit/tvOS/visionOS (no target exists), the rebuilt scenes in WebKit and Firefox (the browser matrix runs only the liquid-surfaces specs there; those passed), 200% browser zoom.

## Environment

| Item | Value |
| --- | --- |
| Host | macOS (Darwin 27.2), Node 26.12.1, pnpm 11.24.0 from `/tmp/glasscn-tooling` (the global launcher is broken) |
| Web | Next 16.4.5, React 19.3.0, dev server `http://localhost:3027` started for this review. Playwright 1.64.0 Chromium, isolated contexts |
| Viewports | 1440×1000 and 390×844 for scenes; width sweep 320, 390, 768, 900, 1024, 1200, 1280, 1440 for `/`, `/themes`, `/showcase`; light and dark; `reducedMotion: reduce` for static captures, `no-preference` for interaction runs |
| Native | Expo 57.0.26, React Native 0.86.3, `@expo/ui` 57.0.21, `expo-glass-effect` 57.0.4, Expo Router 57.0.24. Metro on 8083. iPhone 18 Pro simulator, iOS 27.0, UDID `980F1928-…6651` |
| Simulator settings | Recorded light / `large` before testing; content size raised to accessibility-extra-extra-extra-large for the largest-text pass and restored |

## Findings

Severity: P0 unusable or unsafe, P1 major access/usability/fidelity defect, P2 reproducible limited defect, P3 polish. "Source" names the Apple reference; "judgment" marks my own design call.

### Web findings

| ID | Sev | Scene / state | Expected (source) | Actual before fix | Evidence | Location | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UX-W01 | P1 | `/themes`, every width | Page opens at the top | Opened at y=14,102 (390), 8,343 (1024), 7,498 (1440); at 390 a demo row was also scrolled 249 px sideways. cmdk calls `Element.scrollIntoView` on its selected row at mount, which scrolls the window. Judgment | [themes-390](evidence/independent-ui-ux/web/themes-390.png), [themes-1024](evidence/independent-ui-ux/web/themes-1024.png) | `src/components/glass/command.tsx` | **Fixed**: rows scroll only their list; scrollY 0 at 390/1024/1440 |
| UX-W02 | P1 | Maps place card, Notes Format | A sheet presents inside its window ([HIG Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)) | Sheets were `fixed` to the browser viewport: Maps' card covered the scene description column and its close button sat outside the scene; Notes' sheet clipped Done at 390 | [maps 1440](evidence/independent-ui-ux/web/int-maps-sheet-viewport-1440.png), [notes 390](evidence/independent-ui-ux/web/int-notes-format-viewport-390.png) | `sheet.tsx`, both blocks | **Fixed**: `SheetContent container` |
| UX-W03 | P2 | `/` load | No console errors | Hydration mismatch: `GlassEffects` wrote `data-glass-refracting` and `--glass-optical-filter` onto server HTML before React hydrated it | dev log, [console probe](#commands-run) | `glass-effects.tsx` | **Fixed** |
| UX-W04 | P1 | Music, scrolled and Search | N01: on scroll the tab bar collapses to the current tab at the bottom leading corner, the MiniPlayer moves inline, Search stays a separate trailing tab ([SwiftUI25 4:58](https://developer.apple.com/videos/play/wwdc2025/323/?time=298), [Search26](https://developer.apple.com/videos/play/wwdc2026/292/)) | Search sat inside the tab capsule; minimized, the MiniPlayer took the leading side and the collapsed tab (with text label) the trailing side | [scrolled](evidence/independent-ui-ux/web/int-music-scrolled-down.png), [rest](evidence/independent-ui-ux/web/web-music-light-1440.png) | `liquid-glass-01.tsx` MusicScene | **Fixed** |
| UX-W05 | P2 | Notes | M06/T03: symbol bar items, Undo/Redo high priority, tinted Done with a checkmark; plain document ([HIG Color](https://developer.apple.com/design/human-interface-guidelines/color), [SwiftUI26 5:40](https://developer.apple.com/videos/play/wwdc2026/269/?time=340)) | Text-labelled Undo/Redo/Checklist, textarea inside a bordered grey card with a resize grip, orange "Save note" with coloured glow, explanatory demo sentence under the form | [rest](evidence/independent-ui-ux/web/web-notes-light-1440.png), [format](evidence/independent-ui-ux/web/int-notes-format-open.png) | `liquid-glass-02.tsx` Notes, `toolbar.tsx` | **Fixed** |
| UX-W06 | P2 | Notes Share | Pinned item renders as one capsule | A grey square sat behind the Share capsule: the pinned group's `overflow-x-auto` box clipped its shadow | [format](evidence/independent-ui-ux/web/int-notes-format-open.png) | `toolbar.tsx` ToolbarCommands | **Fixed** |
| UX-W07 | P2 | Mail, 808 px scene | S05/N04: list and message side by side in a split view; compose as a modal sheet with Cancel leading and Send trailing (P06) | List stacked above the message; no compose, no archive; flag was a lone star | [mail](evidence/independent-ui-ux/web/web-mail-light-1440.png) | MailScene | **Fixed** |
| UX-W08 | P2 | Search, no results | S08: no-results state replaces results | "No results for zzz" next to a detail column still showing Alpine lake | [empty](evidence/independent-ui-ux/web/int-search-empty.png) | Search | **Fixed** |
| UX-W09 | P3 | Photos | M02: dim bright media behind clear glass ([HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials)). Judgment: the dim belongs where the controls are | The whole photo was dimmed 35%, muting it; Share/Favorite/Info shared one capsule and Delete was missing | [photos](evidence/independent-ui-ux/web/web-photos-light-1440.png) | PhotosScene | **Fixed**: dim bands under top/bottom controls, Share and Delete alone, Favorite+Info grouped, Delete confirms from a source-anchored menu (P04) |
| UX-W10 | P3 | Every filled / prominent button | Neutral glass shadow on tinted glass. Judgment from Apple captures | Coloured accent glow under `default` and `prominent` buttons ("Save note", "Get started") | [notes](evidence/independent-ui-ux/web/web-notes-light-1440.png) | `button.tsx`, `stylesheet.mjs` | **Fixed** |
| UX-W11 | P2 | Landmarks | T01: Share alone, Favorite + Collections shared, Inspector alone ([toolbar sample](https://developer.apple.com/documentation/swiftui/landmarks-refining-the-system-provided-glass-effect-in-toolbars)) | No toolbar; inspector couldn't be hidden | [landmarks](evidence/independent-ui-ux/web/web-landmarks-light-1440.png) | Landmarks | **Fixed** |
| UX-W12 | P3 | Controls | Bar capsule hugs its control. Judgment | Segmented control centered in a capsule three times its width | [controls](evidence/independent-ui-ux/web/web-controls-light-1440.png) | ControlsScene | **Fixed** |
| UX-W13 | P3 | Safari | Reader uses a page/text symbol | Reader used a sidebar glyph; a redundant search button duplicated tapping the field | [safari](evidence/independent-ui-ux/web/web-safari-light-1440.png) | SafariScene | **Fixed** |
| UX-W14 | P3 | Landmarks sidebar | N05: the mirrored, blurred hero visibly continues under the sidebar | The regular web glass is light enough that the extension shows as a faint grey band, not the image's colour | [landmarks](evidence/independent-ui-ux/web/web-landmarks-light-1440.png) | `--glass-liquid-opacity` calibration | Open: material calibration, affects every regular surface |
| UX-W15 | P3 | Music in RTL | Mirrored tab order | Radix Tabs defaults to `dir="ltr"` without a `DirectionProvider`, so Music doesn't mirror while Photos, Mail and Notes do | [rtl music](evidence/independent-ui-ux/web-after/rtl-music-390.png) | site root | Open: the site has no RTL mode; an RTL app wraps Radix in `DirectionProvider` |
| UX-W16 | P3 | Site header, trailing controls | One target size, one glyph size, even pitch. Owner report during the review | Palette/Glass/Theme were 32 px with 14 px glyphs in full foreground; GitHub/X/LinkedIn were 36 px with 16 px glyphs at 70% tone, plus a 2 px gap, so the row read as two spacings | [after](evidence/independent-ui-ux/web-after/header-trailing-1440.png) | `site-header.tsx` | **Fixed**: every control 32 px, 16 px glyphs, 70% tone, no gap; GitHub keeps its star count |
| UX-W17 | P3 | Maps at iPad width | iPad Maps floats its search/place card at the top leading corner. Judgment from Apple Maps on iPadOS 27 | Centered card at the bottom of an 808 px canvas, phone placement on a tablet canvas | [maps](evidence/independent-ui-ux/web/web-maps-light-1440.png) | MapsScene | **Fixed**: leading column at regular width, bottom card when compact; the place card uses the same column |
| UX-W18 | P2 | Every liquid surface, light scheme | Liquid Glass has no uniform stroke; its edge is lensing plus a highlight that brightens on the lit side and darkens opposite (NF01, [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/)) | Liquid surfaces inherited the content panes' 1 px border in white at 85%, so clear controls over photos wore a white ring. Owner report during the review | [after, default and Increase Contrast](evidence/independent-ui-ux/web-after/liquid-rim-contrast.png) | `registry/stylesheet.mjs` liquidSurface, native RN-web fallback | **Fixed**: border transparent on liquid surfaces; Increase Contrast, Show control borders and forced colours add it back |

Reported issue not reproduced: header and page overflow at narrow desktop widths. At all eight widths `/`, `/themes` and `/showcase` had `scrollWidth == clientWidth` and every visible header control inside the viewport. The `/themes` probe listed off-screen header elements, which belong to the Studio's clipped preview header, not the site header. The compact Menu test (`site-width.spec.ts`) passed: Showcase, Docs, Components, Studio, Theming and Native are reachable.

### Native findings

The simulator pass ran on iPhone 18 Pro / iOS 27.0 / Expo Go 57.0.9 with `idb` for taps, swipes and the accessibility tree. Its full notes, with per-scene screenshots in light, dark, three extra palettes, accessibility-extra-extra-extra-large text and forced Reduce Transparency + Increase Contrast, are in [native-review-notes.md](evidence/independent-ui-ux/native/native-review-notes.md). Every capture used `still=1`, so motion was not observed.

| ID | Sev | Scene / state | Expected (source) | Actual before fix | Evidence | Location | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UX-N01 | P1 | Music, Safari: bottom edge | T07: a diffuse edge behind floating bars ([UIKit26 10:52](https://developer.apple.com/videos/play/wwdc2026/278/?time=652)) | `ScrollEdge automatic` was one 96% band with a hard top edge that cut lines of text in half | [safari](evidence/independent-ui-ux/native/native-safari-dusk-light.png) | `registry/native/scroll-edge.tsx` | **Fixed**: SVG gradients that fade to zero at the inner end; near-uniform at the top, shorter at the bottom |
| UX-N02 | P1 | Photos "…", Notes More | C05: every icon-only control has a VoiceOver name ([HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)) | `AXLabel: null` on system menu triggers: the SwiftUI Menu's label is an RN host view | idb tree in the notes | `registry/native/dropdown-menu.tsx` | **Fixed**: one accessible button element around the menu carries the label; test added |
| UX-N03 | P2 | Every scene | iOS text styles: Body 17, Subheadline 15, Title 2 22, Large Title 34 ([HIG Typography](https://developer.apple.com/design/human-interface-guidelines/typography)) | 1.25 modular scale from 16: body 16, titles 31/39 | captures | `registry/native/ui.tsx` | **Fixed** on iOS: Apple default sizes for each ramp, scaled by the type preset |
| UX-N04 | P2 | Photos, Notes, Mail, Safari, Controls, Maps | Platform glyph meanings | Android share, back arrow, hamburger, counter-clockwise reload, palette for warmth, pin inside a pin | captures | scene files | **Fixed** for each named glyph. Lucide remains the icon set; SF Symbols are used only where a system menu takes `systemImage` |
| UX-N05 | P2 | Mail | iPhone Mail: back chevron, compose in the bottom toolbar, unread dots, inset separators | Hamburger, compose at top, "Mailboxes" twice in the sheet, flat rows | [mail](evidence/independent-ui-ux/native/native-mail-dusk-light.png) | MailScene | **Fixed**; Flag now works |
| UX-N06 | P2 | Music dock | N01: minimized order tab → accessory → search; accessory aligned with the bar | Accessory first when minimized (Yoga ignores CSS `order`), accessory wider than the bar row, uneven circle sizes | [minimized](evidence/independent-ui-ux/native/native-int-music-scrolled-minimized.png) | `registry/native/dock.tsx` | **Fixed**: Dock orders its children; `DockSearch` matches the bar's diameter; test added |
| UX-N07 | P2 | Mail, Music in forced dark | Glass follows the app's scheme | Glass in a `GlassEffectGroup` stayed light on black: `GlassContainer` takes no `colorScheme` | [mail dark](evidence/independent-ui-ux/native/native-mail-dusk-dark.png) | `registry/native/glass.tsx` | **Fixed**: separate effects under a forced other scheme, `merge` opt-out for media controls; test added |
| UX-N08 | P2 | Every scene at AX5 | The window stays fixed; chrome reflows | Scene height was `620 × fontScale` (three screens tall); map art stretched | [maps ax5](evidence/independent-ui-ux/native/native-maps-ax5-p1.png) | LiquidGlass01 | **Fixed**: fixed 620 pt viewport, map art `slice` |
| UX-N09 | P2 | Info sheets | One dismiss control; header aligned with body | System close plus a bottom "Done"; header 20 pt right of the body | [photos info](evidence/independent-ui-ux/native/native-int-photos-info-sheet.png) | InfoSheet | **Fixed** |
| UX-N10 | P2 | Notes | Same as UX-W05 | Same as UX-W05 | [notes](evidence/independent-ui-ux/native/native-notes-dusk-light.png) | `liquid-glass-02.tsx` | **Fixed** |
| UX-N11 | P2 | Search | One field with a scope bar ([Search26](https://developer.apple.com/videos/play/wwdc2026/292/)) | Three inputs and two identical scope rows on one iPhone screen | [search](evidence/independent-ui-ux/native/native-search-dusk-light.png) | Search | **Fixed** on both tracks; folder/library filters only at regular width |
| UX-N12 | P2 | Maps | iPhone Maps: search in the bottom card, controls stacked top-right, category markers | Search and segmented control on top, identical pins, "Show all nearby places" on the location arrow | [maps](evidence/independent-ui-ux/native/native-maps-dusk-light.png) | MapsScene | **Fixed** |
| UX-N13 | P2 | Photos, Controls | M02: dim only behind clear controls over bright media; an editor never scrims its asset | Whole photo dimmed; a 39 pt title over the photo; the editor's brightness was a scrim | [photos](evidence/independent-ui-ux/native/native-photos-dusk-light.png), [controls](evidence/independent-ui-ux/native/native-controls-dusk-light.png) | PhotosScene, ControlsScene | **Fixed**: band dim, swipe paging with an adjustable VoiceOver action, Share/Favorite·Info/Delete, editor shows its own edit |
| UX-N14 | P3 | Materials at AX5 | Words never break mid-word | Two-column tiles broke "ultraThin" and "material" mid-word | [ax5](evidence/independent-ui-ux/native/native-materials-ax5-p2.png) | Materials | **Fixed**: one column at fontScale ≥ 1.35. Label vibrancy on thin tiers is still open |
| UX-N15 | P3 | Safari | iOS 27 Safari: domain only, centered; collapsed pill | Full path left-aligned, four separate circles, full-width collapsed bar | [safari](evidence/independent-ui-ux/native/native-safari-dusk-light.png) | SafariScene | **Fixed** |
| UX-N16 | P3 | Search at AX5 | Field text scales with Dynamic Type | The glass SearchField's text stayed near default size beside a scaled Input. Cause not confirmed | [ax5](evidence/independent-ui-ux/native/native-search-ax5-p1.png) | `search-field.tsx` | Open |
| UX-N18 | P2 | Notes Format sheet, then navigating | A nonmodal sheet goes away with its screen | The system Format sheet stayed over the next pushed screen (Photos); its close button did not respond there and it blocked the Delete button until swiped down. Reached through a deep link; a nonmodal sheet allows the same through any link behind it | [stuck sheet](evidence/independent-ui-ux/native-after/native-sheet-persists-over-next-screen.png) | `registry/native/sheet.tsx` system path | Open: close nonmodal system sheets when their screen loses focus (an app-level hook, since the block can't see the router) |
| UX-N17 | P3 | Standalone `/c/glass-morph`, `/c/background-extension` | An isolated demo of each contract | Both routes render the Landmarks scene | notes | `sandbox/native/src/sandbox/demos/advanced-glass.tsx` | Open |

## Comparison matrix

Status values: **verified** (seen working at runtime in this review), **partial** (custom approximation or part of the behavior), **missing**, **unavailable** (no bridge or platform target), **unverified** (not exercised here). "System" means iOS renders it; "custom" means React Native composes it, possibly with system glass inside. Criteria per ID: [apple-criteria.md](evidence/independent-ui-ux/apple-criteria.md).

| ID | Behavior | Web | Native (iOS 27 sim) | Observed example and evidence |
| --- | --- | --- | --- | --- |
| M01 | Regular glass shifts luminosity over light/dark backdrops | partial: CSS diffusion + depth; no backdrop analysis | verified (system): untinted system glass | Materials study both schemes ([web](evidence/independent-ui-ux/web-after/web-materials-dark-1440.png), [native](evidence/independent-ui-ux/native/native-materials-dusk-light.png)) |
| M02 | Clear over bright media with ~35% dim; none over dark/already dimmed | partial: Materials three cases; Photos now dims only the bands under controls | partial: system clear glass, composed dim | [web materials](evidence/independent-ui-ux/web-after/web-materials-light-1440.png); AVKit dim not exercised |
| M03 | Four standard materials for content | verified (custom tiers) | verified (system materials) | Materials cells ultraThin/thin/regular/thick |
| M04 | Growing glass reads thicker (shadow, lensing) | partial: geometry-derived depth token | unverified: system-owned, not animated here | Regular small vs large cells |
| M05 | Small bars flip light/dark, large surfaces don't | partial: semantic labels, no backdrop sampling | unverified | No moving-backdrop sweep run |
| M06 | One tinted primary action; tint on the glass | verified after fix: Notes Done is tinted glass with a checkmark | verified after fix: tinted system glass `ToolbarItem prominent` with a checkmark | [web notes after](evidence/independent-ui-ux/web-after/web-notes-light-1440.png) |
| M07 | Vibrant semantic labels inside glass | partial: fixed label tokens | verified (custom GText semantic foreground) | Materials secondary/tertiary labels |
| M08 | Touch press stronger than trackpad | partial: one press scale | unverified on device | Pointer only on web |
| G01 | Container spacing blends sibling shapes | partial: union mask approximation | verified (system container) | Merging lab, `/docs/glass-cluster` |
| G02 | Landmarks badges insert/remove with identities | verified (custom morph) | verified (system glassEffectID) | Landmarks Add Summit / Reverse |
| G03 | Shared identity morphs between shapes | partial: View Transitions/WAAPI | verified for GlassMorph items | `/docs/glass-morph` |
| G04 | Named unions render as one shape at rest | missing | unavailable: no Expo bridge | none |
| G05 | Materialize vs matched vs identity transitions | partial: fade fallback | partial: `materialized` only | Sheet/menu entrances |
| G06 | Glass button style for interactive buttons | n/a (browser) | verified for plain system buttons; custom path for RN events | `/native-contracts` |
| N01 | Music MiniPlayer accessory and minimize order | verified after fix | verified after fix (custom Dock with system glass; order unit-tested) | [web after](evidence/independent-ui-ux/web-after/web-music-light-390.png); compact state checked in `glass-showcase.spec.ts` |
| N02 | Tab bar minimizes on scroll down, returns on reverse | verified (e2e) | partial: custom Dock minimizes; `/tabs-layout` system tabs did not minimize on two slow drags (unconfirmed) | `glass-showcase.spec.ts` |
| N03 | Tab bar adapts to sidebar keeping section state | missing | missing | No adaptable tab/sidebar example |
| N04 | Sidebar in glass, accent icons, content beneath | verified (Mail, Landmarks after fix) | partial | Mail sidebar icons, Landmarks rows |
| N05 | Image-only extension under sidebar/inspector | partial: extension present but faint under light web glass (UX-W14) | partial | Landmarks hero |
| N06 | Horizontal rows scroll under both panels | verified: third card visible blurred beneath the inspector | partial: wide layout only ≥760 pt | Landmarks row |
| N07 | Inspector linked to selection | verified; toggle added | verified (narrow inline) | Landmarks inspector |
| N08 | Inactive window dims bar glyphs, not glass | partial: window focus quiets rim (e2e) | unavailable: no appearsActive bridge | `liquid-surfaces.coverage.spec.ts` |
| N09 | Reflow with scene size, state kept | partial: container queries; Mail split ↔ push after fix | unverified: no resizable iPhone window | 390 vs 1440 captures |
| T01 | Landmarks toolbar grouping | verified after fix | verified after fix (Share alone, Favorite + Collections shared) | [web landmarks after](evidence/independent-ui-ux/web-after/web-landmarks-light-1440.png) |
| T02 | Avatar group without shared glass | missing | missing | none |
| T03 | Undo/Redo priority keeps them visible | verified (allocator + Notes) | verified (allocator tests) | Notes at 320 px moves Pin into More while Undo/Redo and Share stay ([capture](evidence/independent-ui-ux/web-after/notes-320.png)) |
| T04 | Overflow-only actions | verified (Word count) | verified | Notes More menu |
| T05 | Pinned trailing Share | verified; square artifact fixed (UX-W06) | verified | Notes |
| T06 | Navigation-bar minimization with insets | partial: Safari/Music compositions | unverified | none system |
| T07 | 27 automatic scroll edge | partial: uniform CSS band | partial: custom ScrollEdge | Mail/Music under bars |
| T08 | Dense hard edge, registered custom groups | partial | partial | none dense |
| S01 | Standard search tab opens a landing page | verified after fix (Music browse categories, unfocused field) | partial: Dock search opens the field without a browse page | [music search after](evidence/independent-ui-ux/web-after/web-music-light-1440.png) |
| S02 | Prominent search focuses immediately | verified (Search now) | verified (autoFocus) | liquid-glass-02 tests |
| S03 | Mail toolbar search adapts to neighbours | missing | missing | none |
| S04 | Inline local search with scoped placeholder | verified ("Filter this library") | verified | Search scene |
| S05 | Split-view toolbar search, detail kept | partial: Search scene detail column; detail now follows results | partial | Search scene |
| S06 | Sidebar-local search | partial: "Find a folder" | partial | Search scene |
| S07 | Recents removable, completions styled, scopes/tokens | verified | verified | Search scene |
| S08 | No-results view with query, clear, Cancel | verified after fix | verified | [empty before](evidence/independent-ui-ux/web/int-search-empty.png) |
| P01 | Menus/popovers grow from source | partial: source transitions (e2e) | verified for system menus | `liquid-surfaces.behavior.spec.ts` |
| P02 | Inset partial sheet, opaque anchored full height | verified after fix inside scene (Maps) | verified (system detents) | Maps place card |
| P03 | Nonmodal format sheet, parent stays editable | partial: whole-note formatting, not selection | partial: same limit | Notes |
| P04 | Source-anchored action sheet without Cancel | verified (Photos Delete menu after fix) | verified for plain ConfirmationDialog | `/action-sheet-contracts` |
| P05 | Sparse, consistent menu icons | verified: Photos menus text-only, Delete has its icon | partial | Photos menus |
| P06 | Modal sheet with Cancel leading, Done trailing | verified after fix (Mail compose) | partial: Mail compose is a system sheet with the close X and a Save Draft action | Mail compose |
| C01 | Thumb lifts into glass while held | verified (custom lens) | verified (system controls) | Controls, Materials sliders |
| C02 | Ticks and neutral origin | verified | verified (custom path) | Materials Balance |
| C03 | Thumbless slider | verified (progress variant) | partial | Materials Progress |
| C04 | Concentric nested shapes | verified (Control inset) | verified | Materials Reset inset |
| C05 | Keyboard/VoiceOver reachability | verified for keyboard and axe on all ten scenes | unverified: VoiceOver not run | `glass-showcase.spec.ts` axe ×2 schemes |
| A01 | Reduce Transparency / Increase Contrast keep legibility | verified (e2e) | partial: forced library preference | `glass-showcase.spec.ts` |
| A02 | Show Borders | verified (viewer preference) | unavailable: no macOS target | showcase preferences |
| A03 | Reduce Bright Effects | verified (viewer preference) | unavailable bridge | showcase preferences |
| A04 | Reduce Motion | verified (default in Playwright) | partial: `still=1` forced | captures |
| A05 | User Liquid Glass slider | partial: clarity slider is glasscn's, not Apple's coefficients | verified (system owns it) | showcase preferences |
| X01 | One prominent tab | missing | missing | none |
| X02 | iPhone Duo vertical bars | unavailable | unavailable | iOS 27.1 API |
| X03 | tvOS focus glass | unavailable | unavailable | no target |
| X04 | visionOS spatial glass | unavailable | unavailable | no target |

## Fix order

These were the five highest-value corrections at the time of the review. All five are applied; the acceptance check is the one used to confirm each.

1. **Stop `/themes` jumping on load (UX-W01).** Check: `window.scrollY === 0` after load at 390, 1024 and 1440 px, and no ancestor with a non-zero `scrollLeft`.
2. **Keep scene presentations inside their scene (UX-W02).** Check: the Maps place card and Notes Format sheet bounds sit inside the scene's `getBoundingClientRect()` at 390 and 1440 px.
3. **Rebuild the five scene compositions that read as web forms or put chrome in the wrong place (UX-W04/05/07, UX-N05/06/10/11/12/13).** Check: side-by-side captures against the Apple layout described in each finding, on both tracks; axe clean on all ten web scenes in both schemes.
4. **Remove the hard native scroll-edge band (UX-N01).** Check: no visible horizontal edge behind the Music and Safari bars while text scrolls under them.
5. **Name every native control for VoiceOver (UX-N02).** Check: `idb ui describe-all` reports the menu triggers' labels; Jest asserts the accessible wrapper.

Still open after this pass, in order of value: material calibration for regular web glass over imagery (UX-W14), the glass SearchField's Dynamic Type scaling (UX-N16), vibrancy for labels on thin native materials (UX-N14), isolated native demos for `GlassMorph` and `BackgroundExtension` (UX-N17), and RTL for Radix-based scenes without a `DirectionProvider` (UX-W15).

## Commands run

All from the repository root with `PATH=/tmp/glasscn-tooling/node_modules/.bin:$PATH`, after the fixes:

| Command | Result |
| --- | --- |
| `pnpm typecheck` | Pass |
| `pnpm lint` | 0 errors, 1 warning (pre-existing `data-table.tsx` React Compiler skip) |
| `pnpm test` | 339 passed |
| `E2E_BASE_URL=http://localhost:3027 pnpm exec playwright test` (Chromium, WebKit, Firefox projects) | 289 passed, 2 intentional skips. The showcase spec now runs axe on all ten scenes in both schemes |
| `npm --prefix sandbox/native test -- --runInBand` | 325 passed (322 before; three new tests: menu trigger name, forced-scheme group, minimized Dock order) |
| `pnpm verify:install` | 111 items installed, type-checked and built in a fresh Next app |
| `pnpm verify:native` | 101 native items installed, type-checked, 325 component tests passed. The first run failed: react-native-svg rejected `viewBox="0 0 1 1"` in the new gradients; fixed to `0,0,100,100` |
| `NEXT_PUBLIC_REGISTRY_URL=http://localhost:3027 pnpm registry:build` | Run after each verifier to restore local registry URLs |

Probes written for this review (Playwright scripts in the session scratchpad, not committed): a width sweep that records `scrollWidth`, header control bounds and unclipped overflow on `/`, `/themes` and `/showcase`; a scroll tracer that wraps `scrollIntoView`/`scrollTo` to find what moved `/themes`; a console collector for `/`, `/showcase`, `/themes`; a sheet-bounds probe comparing dialog and scene rectangles. Native interaction used `idb ui tap|swipe|text|describe-all`.

## Coverage and limits

Web scenes were captured at 1440×1000 and 390×844 in light and dark, before and after the fixes, plus 320 px for Notes' toolbar allocation and 390 px RTL for Photos, Music, Mail and Notes. Interactions exercised: Photos favorite/next/delete, Music scroll down/up and Search, Maps search/select/detent, Notes Format with editing behind it, Mail open/flag/archive/compose, Search now/no results/recents/scope, Landmarks select/inspector toggle/badges.

Native scenes were captured in light and dark (sandbox `scheme`), ocean/rose/sage on Music and Maps, accessibility-extra-extra-extra-large text on all ten, and forced Reduce Transparency + Increase Contrast on Photos, Controls and Notes; settings were restored to light / `large`. After the fixes: Photos (Delete confirmation, deletion), Notes (Format, Title style, editing behind the sheet, AX labels), Music, Maps, Mail, Safari, Controls, Search and Landmarks at rest.

Not established here: motion (every native capture used `still=1`; web captures used reduced motion except the interaction runs), VoiceOver and Full Keyboard Access on a device, OS-level dark/Reduce Transparency/Increase Contrast/Bold Text on native (only library-forced settings), iPad and landscape layouts, physical devices, AppKit/tvOS/visionOS, 200% browser zoom, and a pixel comparison against Apple's own iOS 27 apps. "Matches Apple's layout" in this review means the arrangement, grouping, glyph meaning and type sizes of the named app as documented in the cited sources, not pixel equivalence of the material.
