# Independent UI/UX review 3: glasscn against Apple's Liquid Glass (iOS 27)

Reviewed November 8, 2026, about 21:40 to 23:30 PST. Branch `main`. The run started at HEAD `cb84c33` (the committed Liquid Glass 27 rebuild) with two untracked files from another session (`docs/plans/site-settings-reset.md`, `src/lib/site-settings.test.ts`). During the review that session committed `381656b fix(site): reset saved browser settings once (SITE-31)`; the dev server served it hot. That change prepends a localStorage reset to the site's before-paint script and touches no glass component; my scripts set the new version key so injected preferences survived it. At the end the only untracked path is this review's evidence folder. No generator or test run changed tracked files.

I formed the web and native judgments first, from Apple's pages and the running product, then read [review 1](independent-ui-ux-review.md), [review 2](independent-ui-ux-review-2.md), [the fix spec](../specs/apple-liquid-glass-ui-review-fixes.md), [the system-defaults spec](../specs/apple-system-defaults.md) and the [parity matrix](apple-liquid-glass-parity-matrix.md). They are challenged in [Previous conclusions, rechecked](#previous-conclusions-rechecked).

Evidence is in [`evidence/independent-ui-ux-3/`](evidence/independent-ui-ux-3/): `web-*` (Playwright, 1000 px desktop / 700 px phone, 256-colour PNG) and `native-*` (iOS 27 simulator, 700 px, 128-colour). Contrast numbers were measured on full-resolution captures, not the stored PNGs. The Apple source pass is in [apple-sources.md](evidence/independent-ui-ux-3/apple-sources.md) and the native session log in [native-notes.md](evidence/independent-ui-ux-3/native-notes.md).

## Verdict

**Web visual fidelity: close at rest in default conditions; two stress paths fail.** The ten scenes have Apple's arrangements and the regular/clear approximation reads well at clarity 0.5 in Chromium, WebKit and Firefox. Held thumbs become lenses, sheets go from inset glass to an anchored opaque large detent at compact width, GlassMorph bridges contours and survives interruption. What fails: forced colours erase the Switch, segmented selection and slider tracks (UX3-W01); the background extension that Landmarks is built to show is now barely visible because the previous contrast fix thickened both panels (UX3-W04); the destructive action sheet row is not red (UX3-W02).

**Web task usability: good.** Every scene task completed by pointer and keyboard with focus returned to a sensible element after Escape, Cancel, archive, delete, compose and sheet dismissal. Review 2's focus-to-body failures are fixed. Remaining defects are contained: four dead Music category tiles, Landmarks' row scrolling over the sidebar, the Notes toolbar showing through the Format sheet, and header overflow under enlarged text.

**Native visual fidelity: system pieces are convincing, custom compositions are uneven.** System menus, the source-anchored ConfirmationDialog, SwiftUI sheets, the SwiftUI slider with its glass thumb, the Aa glass button and the identified badge morph all render as iOS 27 draws them. Custom pieces fall short: the Controls tool cluster never fuses and shows a glyph pile-up (UX3-N08), Safari's address wraps at the default size (UX3-N04, reproduced; review 2 left it unverified), and the custom action sheet uses the pre-26 bottom style beside a source-anchored system one.

**Native task usability: blocked in three places.** The Maps search card has no keyboard avoidance, so results type under the keyboard (UX3-N02); Music at the largest accessibility size is covered by its own chrome and can't be scrolled (UX3-N03); the progress slider and the system Switch's label are missing from the accessibility tree (UX3-N01, UX3-N16).

**Blocks approval:** UX3-W01, UX3-N01, UX3-N02, UX3-N03, UX3-N16 (P1). One-to-one coverage is not established for N05/N06 (extension and under-panel scrolling), P04 (anchored action sheet on web and custom native), T06 and N01/N02 on native tabs (UX3-N19), or any regular-width native layout (not reachable on iPhone).

## Environment

| Item | Value |
| --- | --- |
| Host | macOS 27.2, Node 26.12.1, pnpm from `/tmp/glasscn-tooling/node_modules/.bin` |
| Web server | Existing Next 16.4.5 dev server on `:3027` (pid 98941, cwd the repo), reused. React 19.3.0, radix-ui 1.7, Tailwind 4 |
| Browsers | Playwright 1.64 isolated contexts: Chromium (main), WebKit and Firefox (Photos, Notes, Music, Landmarks) |
| Web viewports | 1280×900 scenes and docs, 390×844 at DPR 2 phone, 1440×1000 Studio, width sweep 320/390/768/900/1024/1200/1280/1440, 200% root font at 390 |
| Web settings | light, dark; `reducedMotion` reduce for stills, no-preference for Music, Controls, GlassMorph; clarity 0/0.5/0.65/0.7/0.74/1; Reduce transparency; Reduce bright effects; Show control borders; `contrast: more` light and dark; `forcedColors: active`; palettes Dusk, Ocean, Rose, Sage in both schemes (Notes); Studio Smoked + Square + Compact and Matte; `dir="rtl"` set after load |
| Native | Existing Metro `:8083` (pid 92604, cwd `sandbox/native`), reused. Expo 57.0.26, RN 0.86.3, `@expo/ui` 57.0.21, `expo-glass-effect` 57.0.4, Expo Router 57.0.24, Expo Go 57.0.9 |
| Device | iPhone 18 Pro simulator, iOS 27.0 (24A434), UDID `980F1928-1320-4C63-8540-2F5B7BB16651`, portrait, `idb` taps/swipes/text and accessibility tree. The booted iOS 26.5 simulator was not touched |
| Simulator settings | Start: light, content size `large`. Used: OS dark, live OS switch, `accessibility-extra-extra-extra-large`, sandbox `force=reduceTransparency,highContrast` and `still=1` (library-forced, not OS settings). End, re-read: light, `large`, portrait |

Not tested: physical devices; VoiceOver gestures and announcements, Full Keyboard Access (accessibility tree only); OS Reduce Transparency, Increase Contrast, Reduce Motion, Bold Text and the Liquid Glass look slider on native (no working `simctl` control, so forced library preferences were used and are labelled as such); iPad and any regular-width native layout; landscape; native RTL; native palette and preset sweep; AppKit, tvOS, visionOS (no target exists).

## Findings

P0 unusable or unsafe, P1 major access/usability/fidelity defect, P2 reproducible limited defect, P3 polish. "Basis" says whether the expectation comes from an Apple source, a project rule or my judgment.

### Web
### UX3-W01 (P1, web) Forced colours erase Switch, segmented selection and slider tracks

- **Where:** every web Switch, SegmentedControl, Tabs and Slider; `/docs/switch`, `/docs/segmented-control`, `/docs/tabs`, `/showcase` Controls. `forced-colors: active` (Windows High Contrast, emulated in Chromium).
- **Expected:** custom controls stay distinguishable when the system removes effects; Apple asks for visible edges when Increase Contrast or Show Borders is on (A01, A02: [accessibilityShowBorders](https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityshowborders), [Adopting Liquid Glass, Visual refresh](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass)). Project rules: "Outlines survive forced colours", "Fallbacks stay readable" ([accessibility rules 2 and 8](../rules/accessibility.md)); WCAG 1.4.11.
- **Actual:** the Switch has no track, no thumb and no state: three switches on `/docs/switch` render as bare text rows. Segmented items lose the selected pill (only a weight change on text items, nothing on icon items). Slider tracks vanish; only a 1px thumb outline remains. Computed: switch `border 0px`, `background Canvas`; segmented radio `border 0px`, transparent.
- **Reproduce:** Playwright context `forcedColors: "active"`, open `/docs/switch`.
- **Evidence:** [switch](evidence/independent-ui-ux-3/web-forced-switch.png), [segmented](evidence/independent-ui-ux-3/web-forced-segmented-control.png), [Controls scene](evidence/independent-ui-ux-3/web-stress-controls-forced-colors.png); probe `forced.mjs` output in [Commands](#commands-run).
- **Location:** [registry/stylesheet.mjs:560-568](../../registry/stylesheet.mjs) only handles panes and prominent glass; [switch.tsx:58-67](../../src/components/glass/switch.tsx) draws track and thumb with backgrounds and no border; same pattern in `segmented-control.tsx`, `tabs.tsx`, `slider.tsx`. No e2e spec emulates forced colours.
- **Impact:** a High Contrast user can't see a switch exists or whether it's on, or which segment is selected.
- **Correction:** under `@media (forced-colors: active)` give tracks/thumbs a `1px solid ButtonText` border, use `Highlight` for checked tracks and selected segments, and add a forced-colours Playwright snapshot for switch, segmented, tabs and slider.
- **Basis:** project rule and WCAG; Apple source for the intent.

### UX3-W02 (P2, web) The action sheet's destructive choice looks like the others

- **Where:** `/docs/action-sheet`, both schemes; any `ActionSheetAction variant="destructive"`.
- **Expected:** "Make destructive choices visually prominent. Use the destructive style … and place these buttons at the top of the action sheet" ([HIG Action sheets, Best practices](https://developer.apple.com/design/human-interface-guidelines/action-sheets)).
- **Actual:** "Delete entry" computes `oklch(0.163 0.056 256)`, identical to Share and Archive, in light; the same match in dark. The `data-[variant=destructive]:text-destructive-ink` rule is present in the CSS but the row still resolves to `text-primary-ink`. Even when it applies, `--color-destructive-ink` is 30% red in the label colour, which a probe resolves to `oklch(0.17 0.07 29)`: a near-black maroon. The demo also puts Delete last.
- **Evidence:** [open sheet](evidence/independent-ui-ux-3/web-action-sheet-open-1280.png); computed colours in [Commands](#commands-run).
- **Location:** [action-sheet.tsx:99-109](../../src/components/glass/action-sheet.tsx), [stylesheet.mjs:72](../../registry/stylesheet.mjs), [demos/action-sheet.tsx](../../src/components/demos/action-sheet.tsx).
- **Correction:** make the destructive row win (put the variant colour in the variant class rather than layering it over `text-primary-ink`), use a red that reads as red at 4.5:1 (systemRed's AA web variant, as the system-defaults spec does for filled buttons), move the destructive action to the top in the demo.
- **Basis:** Apple source.

### UX3-W03 (P2, web) Landmarks' collection scrolls over the sidebar, under the inspector

- **Where:** `/showcase` Landmarks at regular width, scroll the Saved places row horizontally.
- **Expected:** rows reach both edges and scroll *beneath* the sidebar and inspector (N06, [Landmarks: extending horizontal scrolling under a sidebar or inspector](https://developer.apple.com/documentation/swiftui/landmarks-extending-horizontal-scrolling-under-a-sidebar-or-inspector)).
- **Actual:** after `scrollLeft = 160` the "Alpine lake" card is the top element at x 136, painted on top of the sidebar's nav; on the trailing side the inspector covers the row. The sidebar has no z-index while the row is `z-10`.
- **Evidence:** [row scrolled](evidence/independent-ui-ux-3/web-landmarks-collection-scrolled.png).
- **Location:** [liquid-glass-02.tsx:70](../../src/components/blocks/liquid-glass-02.tsx) (sidebar `Glass`) and `:73` (row `relative z-10`).
- **Correction:** give the sidebar the same stacking level as the inspector (`z-20`) so cards pass under glass on both sides.
- **Basis:** Apple source.

### UX3-W04 (P2, web) Background extension is no longer visible where it matters

- **Where:** Landmarks sidebar and inspector (light and dark), `/docs/background-extension`.
- **Expected:** the hero is mirrored and blurred under the sidebar and inspector so the image reads as continuing beneath them; only the image extends (N05, [Landmarks: applying a background extension effect](https://developer.apple.com/documentation/swiftui/landmarks-building-an-app-with-liquid-glass)). HIG Sidebars: content can extend beneath ([Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars)).
- **Actual:** the previous fix for inspector contrast (UX2-W02) moved the sidebar to the strong tier and the inspector to thick. The mirrored image now shows as a faint tint in the sidebar's lower part and not at all under the inspector; with the inspector hidden the sidebar is still near-white. The docs demo shows two flat grey bars with hard seams beside the photo.
- **Evidence:** [Landmarks light](evidence/independent-ui-ux-3/web-scene-landmarks-1280-light.png), [dark](evidence/independent-ui-ux-3/web-scene-landmarks-1280-dark.png), [inspector hidden](evidence/independent-ui-ux-3/web-landmarks-badges-reversed.png), [docs demo](evidence/independent-ui-ux-3/web-docs-background-extension.png).
- **Location:** [liquid-glass-02.tsx:64-79](../../src/components/blocks/liquid-glass-02.tsx), [background-extension.tsx:29-31](../../src/components/glass/background-extension.tsx) (mirror blurred with `--glass-blur`, then blurred again by the panel), [demos/background-extension.tsx](../../src/components/demos/background-extension.tsx).
- **Correction:** keep the panel at regular glass and solve contrast in the foreground (labels on a local fill or the vibrant label palette), or reduce the mirror's own blur so one diffusion pass remains. In the demo, put real chrome (a sidebar with labels) over the mirrored strips. Acceptance: the mirror's mean colour under the sidebar differs visibly from the ground (ΔE > 10) while the inspector's secondary label stays ≥ 4.5:1.
- **Basis:** Apple example; the trade-off judgment is mine.

### UX3-W05 (P2, web) The Notes Format sheet sits on top of the toolbar that opened it

- **Where:** `/showcase` Notes, open Aa, small detent; Chromium, WebKit, at 1280 and 390.
- **Expected:** glass doesn't sit on glass ([custom SwiftUI glass, WWDC25 323 custom effects](https://developer.apple.com/videos/play/wwdc2025/323/?time=1077); project rule "Never glass in liquid"); Apple's Notes Format sheet covers the bottom toolbar.
- **Actual:** the floating Checklist/Aa group shows through, or on top of, the lower part of the Format sheet: a ghosted pill in Chromium, a crisp pill over the sheet in WebKit.
- **Evidence:** [390 Chromium](evidence/independent-ui-ux-3/web-notes-format-open-390.png), [WebKit](evidence/independent-ui-ux-3/web-engine-webkit-notes.png).
- **Location:** [liquid-glass-02.tsx:135-140](../../src/components/blocks/liquid-glass-02.tsx) (Note tools group) and the scene-contained `SheetContent` stacking.
- **Correction:** hide the Note tools group (or move it under the sheet's stacking context and out of its bounds) while Format is open.
- **Basis:** Apple source and project rule.

### UX3-W06 (P2, web) Four of six Music "Browse categories" tiles do nothing

- **Where:** `/showcase` Music, Search tab.
- **Expected:** the search destination's landing tiles lead somewhere (S01, [HIG Search fields, Search as a tab](https://developer.apple.com/design/human-interface-guidelines/search-fields)).
- **Actual:** Chill sets the query to "morning", Ambient to "hours"; Acoustic, Focus, Jazz and Classical call `setQuery("")`, so clicking them changes nothing. Measured: after clicking Acoustic the query is `""`.
- **Evidence:** [Search landing](evidence/independent-ui-ux-3/web-music-search-390.png); `music.mjs` output.
- **Location:** [liquid-glass-01.tsx:156](../../src/components/blocks/liquid-glass-01.tsx).
- **Correction:** give every tile a result set (or show a category page), or render the inert ones as non-interactive.
- **Basis:** my judgment (dead control).

### UX3-W07 (P2, web) Materials' ultraThin labels fail over the scene's own dark content

- **Where:** `/showcase` Materials, light scheme, press "Dark content".
- **Expected:** text on thin materials stays legible; Apple pairs thin materials with vibrant labels ([HIG Materials, iOS](https://developer.apple.com/design/human-interface-guidelines/materials)); project rule 4.5:1 for both material variants.
- **Actual:** with dark content the ultraThin tile's "ultraThin" and "Standard material" labels are black on about rgb(81,85,80): 2.77:1 and 2.66:1 (sampled on a full-resolution capture). Thin is 6.8:1. The previous fix (UX2-W07, ultraThin 6.59:1) was measured over bright content only.
- **Evidence:** [dark content, light scheme](evidence/independent-ui-ux-3/web-materials-toggled-light.png).
- **Location:** [liquid-glass-02.tsx:212-217](../../src/components/blocks/liquid-glass-02.tsx) (`text-foreground` on ultraThin/thin), `Backdrop dim={0.7}`.
- **Correction:** derive the tile's label from the content behind it (media label palette when the scene is dark), or make the dark-content case use the dark scheme for the tiles.
- **Basis:** project rule; Apple source for vibrant labels.

### UX3-W08 (P2, web) Enlarged text pushes header controls off-screen

- **Where:** `/`, `/showcase`, `/themes` at 390 px with the root font at 200% (browser text-only zoom or a 32 px default font).
- **Expected:** text can be enlarged without horizontal scrolling or lost controls (WCAG 1.4.4/1.4.10; project rule "Dynamic Type … is part of the component").
- **Actual:** `scrollWidth` 524 at a 390 px viewport; Glass preferences and the scheme toggle sit beyond the right edge, the hero badge is cut. Music's Next track and Search buttons and Notes' Done also extend past the scene frame. Full-page 200% zoom (640 CSS px) does not overflow, as the previous review found; this is the text-only path.
- **Evidence:** [home](evidence/independent-ui-ux-3/web-text200-home.png), [Notes](evidence/independent-ui-ux-3/web-text200-notes.png), [Music](evidence/independent-ui-ux-3/web-text200-music.png).
- **Location:** [site-header.tsx:92](../../src/components/site/site-header.tsx) (`ml-auto flex shrink-0` trailing group); scene bars in both blocks size controls in `rem`.
- **Correction:** let the trailing header group collapse into the Menu sheet when it would overflow (container query on the header, not a viewport breakpoint), and cap or wrap scene bar controls.
- **Basis:** WCAG and project rule; my judgment on the fix.

### P3 findings (web)

| ID | Where | Observation and evidence | Location | Correction | Basis |
| --- | --- | --- | --- | --- | --- |
| UX3-W09 | Materials "Regular · small/large" | Size-dependent depth is barely there: opacity 0.58 vs 0.60, blur 18 vs 19 px, identical shadow. Apple's larger glass casts deeper shadows and lenses more (M04, [WWDC25 219 7:02](https://developer.apple.com/videos/play/wwdc2025/219/?time=422); "a larger size is more opaque", WWDC25 284 21:30). [light](evidence/independent-ui-ux-3/web-materials-toggled-light.png) | `glass-effects.tsx` depth | Scale shadow and refraction with area as well as frost | Apple example |
| UX3-W10 | Music rows | Each row ends in an ellipsis that looks like a More button but is `aria-hidden` decoration; pressing it plays the song | `liquid-glass-01.tsx:148` | Make it a real menu or drop it | Judgment |
| UX3-W11 | Mail compose | Opens with focus on Cancel; Mail puts the cursor in To | `liquid-glass-01.tsx:365` | `onOpenAutoFocus` to the To field | Judgment |
| UX3-W12 | Notes | Undo still removes one keystroke per press: 11 presses for " Bring tea." (carried from UX2-W13) | `liquid-glass-02.tsx:106` | Coalesce typing into undo groups | Judgment |
| UX3-W13 | `/docs/action-sheet` | Always shows Cancel and hides the page from AT (`aria-hidden`) even when placed by its trigger (UX2-W12, still open). P04: anchored sheets have implicit cancel and leave the rest usable | `action-sheet.tsx` | Anchored mode without Cancel or modality | Apple source |
| UX3-W14 | Site-wide | Accent text (`*-ink` = 30% accent in the label) computes to L≈0.16, so text buttons such as Search's "Clear" and "Clear filters" read as black, not tinted | `stylesheet.mjs` `INK_ACCENT` | Use the AA accent itself for text buttons on fills that allow it | Apple source ([HIG Color](https://developer.apple.com/design/human-interface-guidelines/color)), judgment on trade-off |
| UX3-W15 | Header 1024-1279 px | Primary nav collapses into Menu with about 650 px of free header space; the six links need about 490 | `site-header.tsx` breakpoint | Collapse by measured fit | Judgment |
| UX3-W16 | RTL (`dir` set after load) | Music's scene stays left-to-right (title, tabs); Controls mirrors its corners but not its segment order. UX2-W11 still partly open | Radix Tabs without `DirectionProvider` | `DirectionProvider` in the site | Judgment |
| UX3-W17 | Photos | Clarity 0.5 to 0.65 switches clear controls from 10% to 70% fill and white to black glyphs in one step ([strip](evidence/independent-ui-ux-3/web-stress-photos-clarity-strip-0.5-0.65-1.png)); Apple's look slider is continuous | `stylesheet.mjs` clear clarity | Interpolate fill and cross-fade labels over a range | Judgment |
| UX3-W18 | Photos Info | Title "Above the clouds" while Info says "Mountain summit" ([info](evidence/independent-ui-ux-3/web-photos-info.png)) | `liquid-glass-01.tsx` photo data | One name per photo | Judgment |
| UX3-W19 | Search predictions | The suggestion popover's glass lets the scope labels ghost through behind "Alpine lake" ([390](evidence/independent-ui-ux-3/web-search-predictions-390.png)) | `search-field.tsx` | Thicker tier for popovers over text | Judgment |
| UX3-W20 | Maps, regular width | The large detent is flush with the frame top and bottom but inset 16 px at the sides; the grabber touches the top edge ([large](evidence/independent-ui-ux-3/web-maps-sheet-large-1280.png)) | `sheet.tsx` container geometry | Inset on all sides at regular width | Judgment |
| UX3-H01 | e2e | `glass-morph.coverage.spec.ts:92` failed in the first parallel run, passed 4/4 alone (UX2-H02 "fixed" with a longer poll; still flaky) | `e2e/glass-morph.coverage.spec.ts:100` | Start the animation from a known state before polling | Judgment |
| UX3-H02 | Studio | Density radios are named "compact/default/comfortable" (lower case, capitalised by CSS); choosing presets leaves "0 edited" | `studio/theme-studio.tsx` | Title-case names; count preset changes or say "preset" | Judgment |

### Native

Deep links below are `exp://127.0.0.1:8083/--/<route>`. Sandbox `scheme=`, `force=` and `still=` are library settings; system chrome ignores them.

### UX3-N01 (P1, native) The progress slider is absent from the accessibility tree

- **Where:** `c/liquid-glass-02?scene=materials`, "Progress · 35%".
- **Expected:** every control exposes a role, label and value ([HIG Accessibility, VoiceOver](https://developer.apple.com/design/human-interface-guidelines/accessibility)); a thumbless slider is still a slider (C03, [WWDC25 284 18:59](https://developer.apple.com/videos/play/wwdc2025/284/?time=1139)).
- **Actual:** `idb ui describe-all` lists "Neutral balance" and "Control inset" but no "Playback progress". The `progress` variant sizes the accessible knob to 0×0 and iOS drops zero-size elements.
- **Evidence:** [sliders](evidence/independent-ui-ux-3/native-materials-sliders.png), [AX excerpts](evidence/independent-ui-ux-3/native-ax-excerpts.txt).
- **Location:** [registry/native/slider.tsx:332](../../registry/native/slider.tsx) (`width: hidden ? 0 : KNOB`).
- **Correction:** put the adjustable accessibility element on the track container (full width), keep the knob purely visual.
- **Basis:** Apple source.

### UX3-N02 (P1, native) Maps search types under the keyboard

- **Where:** `c/liquid-glass-01?scene=maps`, tap Search Maps, type "gold".
- **Expected:** search moves above the keyboard (S03, [HIG Search fields, Search in a toolbar](https://developer.apple.com/design/human-interface-guidelines/search-fields)); project rule 17 (dialogs and search ride the keyboard).
- **Actual:** the field is half covered, Cancel half covered, results fully under the keyboard until Return. Music and Safari bars do ride the keyboard.
- **Evidence:** [search](evidence/independent-ui-ux-3/native-maps-search.png).
- **Location:** [registry/native/liquid-glass-01.tsx:303](../../registry/native/liquid-glass-01.tsx) (bottom-anchored card, no `KeyboardStickyView`/`KeyboardAvoid`).
- **Correction:** wrap the card in `KeyboardStickyView` and grow results upward.
- **Basis:** Apple source and project rule.

### UX3-N03 (P1, native) Music at the largest text size is covered by its own chrome

- **Where:** content size `accessibility-extra-extra-extra-large`, `c/liquid-glass-01?scene=music`.
- **Expected:** content stays reachable at every Dynamic Type size; bars minimize so content is primary ([HIG Typography, Dynamic Type](https://developer.apple.com/design/human-interface-guidelines/typography), N01/N02).
- **Actual:** MiniPlayer, the expanded accessible tab list and Search fill about 90% of the 620 pt scene; one line of the song list shows. Swipes scroll the outer page, so the dock never minimizes.
- **Evidence:** [AX5](evidence/independent-ui-ux-3/native-music-ax5.png), [second](evidence/independent-ui-ux-3/native-music-ax5-b.png).
- **Location:** [liquid-glass-01.tsx:47](../../registry/native/liquid-glass-01.tsx) (fixed `height = 620`), `:229`, `:242` (expanded-only AX navigation inside `Dock`).
- **Correction:** at accessibility sizes start minimized (one tab glyph + Search) and use the Large Content Viewer pattern for tab labels instead of a vertical list; let the scene height follow content.
- **Basis:** Apple source.

### UX3-N16 (P1, native) The system Switch loses its accessibility label

- **Where:** `c/switch`. Also the Maps system segmented control (P2 part).
- **Expected:** every control has a name (project accessibility rule 4; WCAG 4.1.2).
- **Actual:** `<Switch accessibilityLabel="Reminders" />` on the system path reports `AXLabel: null`; custom `size="sm"` and `native={false}` keep labels. The Maps `UISegmentedControl` is an unnamed TabGroup although `accessibilityLabel="Place categories"` is passed.
- **Evidence:** [AX dump](evidence/independent-ui-ux-3/native-switch-ax.json), [demo](evidence/independent-ui-ux-3/native-switch-demo.png).
- **Location:** [registry/native/switch.tsx:49](../../registry/native/switch.tsx) (label on `Host`), [segmented-control.tsx:234-242](../../registry/native/segmented-control.tsx).
- **Correction:** pass the label to the SwiftUI control (`label`/`accessibilityLabel` modifier) rather than the host; add an AX-tree assertion to the component tests.
- **Basis:** project rule.

### UX3-N04 (P2, native) Safari's address wraps at the default size

- **Where:** `c/liquid-glass-01?scene=safari`, light and dark.
- **Expected:** the URL stays one readable line in the capsule (my judgment; Safari).
- **Actual:** "fieldnotes.examp / le". Review 2 (UX2-N05) couldn't reproduce this and left it unverified; it reproduces here at content size `large`.
- **Evidence:** [crop](evidence/independent-ui-ux-3/native-safari-address-wrap-crop.png), [dark](evidence/independent-ui-ux-3/native-safari-dark.png).
- **Location:** [liquid-glass-01.tsx:330-334, :367](../../registry/native/liquid-glass-01.tsx) (multiline-capable centred `TextInput`, `minHeight: 48`; root cause not confirmed).
- **Correction:** render the resting URL as one-line `Text` with `numberOfLines={1}` and middle truncation; switch to a single-line `TextInput` only while editing (see UX3-N10).
- **Basis:** judgment.

### UX3-N08 (P2, native) Controls' tool cluster piles glyphs and never fuses

- **Where:** `c/liquid-glass-01?scene=controls`, tap the sliders button twice, recorded at 30 fps in OS light and OS dark.
- **Expected:** siblings in a glass container merge and separate as they move (G01, [GlassEffectContainer](https://developer.apple.com/documentation/swiftui/glasseffectcontainer)); distant effects materialize (G05).
- **Actual:** the first expand frame shows all five glyphs stacked at the centre before glass appears; in OS dark the glyphs float with no glass for a frame. Collapse shows five overlapping discs with visible rims sliding together, no fusion. Landmarks' GlassMorph on the same device does fuse.
- **Evidence:** [frames](evidence/independent-ui-ux-3/native-controls-expand-frames.png), [OS dark](evidence/independent-ui-ux-3/native-controls-expand-frames-osdark.png), [still=1](evidence/independent-ui-ux-3/native-controls-expand-still-frames.png), [video](evidence/independent-ui-ux-3/native-controls-expand.mp4).
- **Location:** [liquid-glass-01.tsx:454-466](../../registry/native/liquid-glass-01.tsx) (`MergeAction`: glyph opacity switches instantly while position springs; RN-animated wrappers inside `GlassEffectGroup merge`, [glass.tsx:288-310](../../registry/native/glass.tsx)). I suspect the container doesn't merge transformed RN-wrapped children; not confirmed.
- **Correction:** build this cluster on the same Namespace/`glassEffectId` path GlassMorph uses, and fade glyphs with the material rather than before it.
- **Basis:** Apple source.

### Other P2 findings (native)

| ID | Where | Observation | Location | Correction | Basis |
| --- | --- | --- | --- | --- | --- |
| UX3-N05 | Notes | Word count, Pin and Done give no visible feedback; results go only to 1×1 live regions and the pin glyph doesn't change ([word count](evidence/independent-ui-ux-3/native-notes-wordcount-feedback.png), [pinned](evidence/independent-ui-ux-3/native-notes-pinned.png)) | `registry/native/liquid-glass-02.tsx:120-121` | Show a transient label or pinned glyph | Judgment |
| UX3-N06 | Mail | "Updated Just Now" is drawn over the last row's preview; at AX5 both are illegible and senders truncate while times stay whole ([crop](evidence/independent-ui-ux-3/native-mail-status-overlap-crop.png), [AX5](evidence/independent-ui-ux-3/native-mail-ax5.png)) | `liquid-glass-01.tsx:414-437` | Stronger bottom scroll edge (T08 hard edge) or inset the list | Apple source (T08) |
| UX3-N07 | Notes | Closing Format raises the keyboard over Aa; my next tap aimed at Aa typed "g" ([capture](evidence/independent-ui-ux-3/native-notes-keyboard-hides-aa.png)). Review 2's UX2-N04 fix (`showSoftInputOnFocus={!open}`) causes it | `liquid-glass-02.tsx:112` | Blur the editor on close or keep Aa above the keyboard | Judgment |
| UX3-N09 | Safari | No Reader entry; the ellipsis opens Open Tabs | `liquid-glass-01.tsx:361-375` | Add Reader; use the tabs glyph for tabs | Judgment (task list) |
| UX3-N10 | Safari | Editing doesn't widen the field or select the URL; autocorrect is on; typed text lands mid-URL ([editing](evidence/independent-ui-ux-3/native-safari-editing.png)) | `liquid-glass-01.tsx:367` | `keyboardType="url"`, `autoCorrect={false}`, select all, expand on focus | Judgment |
| UX3-N11 | Maps | The place sheet is modal and dims the route just requested; the persistent search card peeks above it and covers 2 of 3 pins at rest ([light](evidence/independent-ui-ux-3/native-maps-light.png), [directions](evidence/independent-ui-ux-3/native-maps-directions.png)) | `liquid-glass-01.tsx:80-88, :303, :317` | Nonmodal medium detent with background interaction; one sheet | Apple source (P02, [Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)) |
| UX3-N12 | Notes | Undo per keystroke; format changes aren't undoable | `liquid-glass-02.tsx:93` | Coalesce typing; record format | Judgment |
| UX3-N13 | Search | Suggestions render above the field and push it down 64 pt while typing ([predictions](evidence/independent-ui-ux-3/native-search-predictions.png)); Yoga ignores CSS `order` | `registry/native/search-field.tsx:113` | Reorder children by placement | Judgment |
| UX3-N14 | `c/background-extension` | No extension at iPhone width (`start/end = 0`); identical to `c/glass-morph`; the native extension is a custom mirrored RN image, not `backgroundExtensionEffect` ([capture](evidence/independent-ui-ux-3/native-background-extension.png)) | `liquid-glass-02.tsx:57`, `registry/native/background-extension.tsx:13-25` | A demo with chrome at compact width; document that no SwiftUI bridge exists | Apple example (N05, X02) |
| UX3-N15 | Search, AX5 | "Search now" clipped at the right edge; review 2 marked UX2-N06 "fixed in source" ([AX5](evidence/independent-ui-ux-3/native-search-ax5.png)) | `liquid-glass-02.tsx:163` | Wrap the row | Apple source (Dynamic Type) |
| UX3-N18 | Sandbox | Scheme is snapshotted at launch and passed explicitly; live OS appearance changes are ignored; no "system" option. Every sandbox capture is a forced scheme, and `GlassEffectGroup` falls back to unmerged views when it differs from the OS ([live switch](evidence/independent-ui-ux-3/native-notes-os-light-live-switch.png)) | `sandbox/native/src/sandbox/theme.tsx:48, 89`, `registry/native/glass.tsx:301` | Default to following the OS | Project rule (native 4) |
| UX3-N19 | `tabs-layout` | Native tabs never minimized on slow or flung scroll; on-screen copy says they do; Search tab field at top ([tabs](evidence/independent-ui-ux-3/native-tabs-minimized.png)) | `sandbox/native/src/app/tabs-layout/*`, `minimizeBehavior = "automatic"` | Set `onScrollDown` in the demo or correct the copy | Apple source (N02) |
| UX3-N20 | `action-sheet-contracts` | System ConfirmationDialog drops a disabled destructive action; only Archive shows ([open](evidence/independent-ui-ux-3/native-asc-open.png)) | `registry/native/action-sheet.tsx:123` | Route disabled actions to the custom path or omit with a note | Judgment |
| UX3-N21 | `c/action-sheet` | Custom sheet uses grouped rows plus a bottom Cancel capsule while the system path on the same screen is a popover from its trigger ([custom](evidence/independent-ui-ux-3/native-actionsheet-custom.png), [system](evidence/independent-ui-ux-3/native-actionsheet-system.png)) | `registry/native/action-sheet.tsx` | Anchor the custom sheet to its source; omit Cancel when anchored | Apple source (P04) |
| UX3-N22 | Notes, AX5 | Reaching a format needs vertical then horizontal scrolling even at medium; text passes under the grabber without an edge ([format](evidence/independent-ui-ux-3/native-notes-ax5-format.png)) | `liquid-glass-02.tsx:115-118` | Wrap chips; shorter description; larger detent at AX sizes | Apple source (Dynamic Type) |

### P3 findings (native)

UX3-N17: Landmarks' selected card is barely distinguishable (`fillStrong` vs `fill`, [toolbar](evidence/independent-ui-ux-3/native-landmarks-toolbar.png)). Photos' Share and Delete corner buttons render differently because Delete sits outside the merged group. Search's Browse and Search now look identical. Materials' "Dark media" is a flat panel. Tokens shows two "default" chips. `native-contracts` "Reject large: true" reads as "Reject large:, true". Forced Reduce Transparency leaves system sheets and the header translucent while `/tokens` says "Applies to every screen". Expo Go's floating tools button covers the top-right of every screen and twice caught taps (environment, not glasscn).

## Reported header issue

Not reproduced at the requested widths. `/` and `/themes` at 320, 390, 768, 900, 1024, 1200, 1280 and 1440 px: `scrollWidth == clientWidth`, no overlapping header controls, every control inside the viewport, the install snippet scrolls inside its own box. The compact Menu (below 1280 px) lists Showcase, Docs, Components, Studio, Theming, Native plus the docs index; Enter on Menu opens it with focus on Close, Escape returns focus to Menu. Evidence: [home 320](evidence/independent-ui-ux-3/web-width-home-320.png), [home 900](evidence/independent-ui-ux-3/web-width-home-900.png), [themes 900](evidence/independent-ui-ux-3/web-width-themes-900.png), [home 1200](evidence/independent-ui-ux-3/web-width-home-1200.png), [themes 1280](evidence/independent-ui-ux-3/web-width-themes-1280.png), [menu 390](evidence/independent-ui-ux-3/web-menu-open-390.png). The header does overflow with enlarged text (UX3-W08) and hides its nav earlier than it needs to (UX3-W15).

## Comparison matrix

Statuses: **verified** (runtime behaviour matches the criterion), **partial/custom approximation**, **missing**, **unavailable bridge/platform**, **unverified**. On native, "system" means the OS draws it; "custom + system glass" means an RN composition on `GlassView`. Criteria and URLs are in [apple-sources.md](evidence/independent-ui-ux-3/apple-sources.md); corrected timestamps are used here.

| ID | Criterion | Web | Native | Evidence / note |
| --- | --- | --- | --- | --- |
| M01 | Regular glass keeps text legible | partial/custom approximation (fails ultraThin on dark content, W07) | verified (system) | web-materials-toggled-light, native-materials-light-osdark |
| M02 | Clear over media; 35% dim on bright, none on dark | verified (custom: banded dim, Materials three cases) | partial (custom + system glass; "dark media" is a flat panel) | web-scene-photos-1280-light, native-materials-media |
| M03 | Four standard materials | partial/custom approximation | verified (system materials) | web-materials-toggled-light |
| M04 | Larger glass: deeper shadow, more lensing | partial (barely varies, W09) | verified (system) | web-materials-toggled-light |
| M05 | Small bars flip, large surfaces don't | partial/custom approximation | partial (system glass, not isolated) | |
| M06 | Tinted Done, coloured selected tab, variants | verified (Notes Done white on accent in 4 palettes × 2 schemes) | verified (system glass button) | web-stress-notes-*, native-notes-light |
| M07 | Vibrant semantic labels in glass | partial/custom approximation | partial (semantic colours, not UIKit vibrancy) | |
| M08 | Touch stronger than trackpad | unverified (no touch device) | unverified | |
| G01 | Container spacing blends siblings | partial/custom approximation (union mask) | partial: GlassMorph fuses; Controls cluster does not (N08) | native-controls-expand-frames |
| G02 | Identified badge insert/remove | verified (custom) | verified (system Namespace/glassEffectId) | web-landmarks-badges-reversed, native-landmarks-badges-frames |
| G03 | Glass identity in transitions | partial/custom approximation | verified for GlassMorph | |
| G04 | Named unions | missing | unavailable bridge | |
| G05 | Matched / materialize / identity transitions | partial/custom approximation | unavailable bridge (no policy prop) | |
| G06 | Glass button style, not glass on a button | partial/custom approximation | verified for eligible `onAction` buttons (system) | native-contracts-buttons-ax.json |
| N01 | MiniPlayer moves inline on minimize | verified (custom) | verified in scene (custom); NativeTabs accessory never minimizes (N19) | web-music-compact-390, native-music-light-scrolldown |
| N02 | Tab bar minimizes down, expands up | verified (custom) | partial: scene yes, NativeTabs no (N19) | native-tabs-minimized |
| N03 | Tabs adapt to sidebar | partial (Mail sidebar, not a tab adaptation) | unverified (iPhone only) | |
| N04 | Accent sidebar icons, content beneath | verified for icons; content beneath weak (W04) | unverified (regular width) | web-scene-mail-1280-dark |
| N05 | Image-only extension under sidebar/inspector | partial: present, barely visible (W04) | partial: custom mirror, none at compact width (N14) | web-landmarks-badges-reversed, native-background-extension |
| N06 | Rows scroll beneath both panels | partial: over the sidebar, under the inspector (W03) | unverified (regular width) | web-landmarks-collection-scrolled |
| N07 | Selection-linked inspector | verified (custom) | unverified (regular width) | |
| N08 | Inactive window dims custom foreground | partial (window focus/blur quiets rims; e2e) | missing (no `appearsActive` bridge) | e2e liquid-surfaces |
| N09 | Resizable window, size classes | partial (container queries; scenes keep state at widths tested) | unverified | |
| T01 | Toolbar groups and spacers | verified (Landmarks) | verified (custom + system glass) | native-landmarks-toolbar |
| T02 | Item without shared background | missing in scenes (the matrix's Notes avatar no longer exists) | missing | |
| T03 | Visibility priority (Undo/Redo stay) | verified (Notes at 1280/390/320) | partial (no width change on iPhone) | web-notes-more-390 |
| T04 | Always-overflow actions | verified (Word count in More) | verified | native-notes-more-menu |
| T05 | Pinned Share | verified | verified | |
| T06 | Nav-bar minimization with safe-area adjust | partial (Safari/Music compositions) | partial (custom; system bar not bridged) | |
| T07 | Automatic scroll edge visuals | partial/custom approximation | partial (custom ScrollEdge, too weak in Mail, N06) | native-mail-status-overlap-crop |
| T08 | Dense hard edge; custom overlay registers edge | partial | partial | |
| S01 | Search tab opens a browse destination | partial: 4 of 6 tiles dead (W06) | partial: search is a floating panel over Home | web-music-search-390, native-music-search-open |
| S02 | Prominent search focuses immediately | verified (Search now) | verified | native-search-now |
| S03 | Toolbar search above keyboard | n/a (no software keyboard) | partial: Music yes, Maps no (N02) | native-maps-search |
| S04 | Inline local search | verified (Filter this library) | partial (compact: scope bar only) | |
| S05 | Split-view search keeps detail visible | verified (Search scene, regular width) | unverified (regular width) | web-scene-search-1280-light |
| S06 | Sidebar-local search | verified (Find a folder) | unverified (regular width) | |
| S07 | Recents removal, predictions, scopes/tokens | verified | verified (suggestions jump, N13) | web-search-predictions-390, native-search-token |
| S08 | No-results with query; Clear and Cancel | verified | verified | web-search-empty-390, native-search-empty |
| P01 | Menu/popover grows from source | partial/custom approximation | verified (system menus, popover dialog) | native-photos-menu |
| P02 | Inset partial sheet, opaque anchored full | verified in scenes at compact width; `/docs/sheet` full-height stays inset/translucent | verified (system sheet) | web-maps-sheet-medium-390, native-maps-sheet-large |
| P03 | Nonmodal sheet while editing parent | verified (with toolbar overlap, W05) | partial: hardware keyboard only while Format is open; keyboard pops on close (N07) | web-notes-format-open-390, native-notes-after-typing-behind |
| P04 | Anchored action sheet, implicit cancel | partial: always Cancel, page inert (W13); destructive not red (W02) | verified for system dialog; custom sheet bottom-style (N21); disabled action dropped (N20) | native-photos-delete-dialog, native-actionsheet-custom |
| P05 | Menu icons all or none per group | verified (Photos, More menus) | verified | |
| P06 | Modal sheet; Done/Cancel semantics | verified (Mail compose draft prompt, focus return) | verified (swipe saves to Drafts) | web-mail-compose-390, native-mail-drafts |
| C01 | Thumb lifts into glass while held | verified (custom: rest fill, held lens) | verified (system slider; custom balance) | web-controls-slider-held, native-controls-slider-held-crop |
| C02 | Ticks and neutral origin | verified (Balance) | verified (custom) | |
| C03 | Thumbless slider | verified (custom progress) | partial: renders, absent from AX tree (N01) | native-materials-sliders |
| C04 | Concentric inset | verified (radius 12→4 as padding 12→20) | partial (custom) | inset probe |
| C05 | Keyboard, focus, selection, disabled | verified for keyboard and focus return; forced colours fail (W01) | partial: AX labels missing (N16); no VoiceOver run | |
| A01 | Reduce Transparency / Increase Contrast | verified (opaque frost, borders); forced colours fail (W01) | partial: library-forced only; OS settings untested | web-stress-controls-reduce-transparency, native-photos-forced-rt-hc |
| A02 | Show Borders | verified (web preference) | missing bridge (system controls may adapt; untested) | web-stress-controls-show-borders |
| A03 | Reduce Bright Effects | verified (web preference zeroes specular) | missing bridge | web-stress-controls-reduce-highlights |
| A04 | Reduce Motion | verified (GlassMorph cancels; e2e) | partial: `still=1` library-forced; OS untested | native-controls-expand-still-frames |
| A05 | Look slider ultra clear to tinted | partial: continuous except a step at 0.65 (W17) | unavailable (OS owns it; untested) | web-stress-photos-clarity-strip-0.5-0.65-1 |
| X01 | One prominent tab | missing | missing | not beta any more |
| X02 | iPhone Duo vertical bars | unavailable platform | unavailable platform | 27.1 |
| X03 | tvOS focus glass | unavailable platform | unavailable platform | |
| X04 | visionOS spatial glass | unavailable platform | unavailable platform | |
| NC1 | 27 edge-to-edge sidebars | verified (Mail, Landmarks) | unverified (regular width) | new case |
| NC2 | Uniform top toolbar scroll edge | partial/custom approximation | partial (custom) | new case |
| NC3 | Opt-in iPhone sidebar | missing | missing | new case |
| NC4 | Prominent tab persists when collapsed | missing | missing | new case |
| NC5 | Menu-bar icons hidden by default (iPadOS/macOS) | n/a (no menu bar) | unavailable platform | new case |

## Previous conclusions, rechecked

Confirmed: review 2's focus restoration fixes (every flow I ran returned focus to a named element); Mail's draft prompt and native swipe-to-Drafts; Maps' layers menu; Notes Title vs Heading now differ; the Music selected tab is tinted; Photos' Delete confirmation is now a legible popover beside the trash button on native; no header overflow at the swept widths; no console errors on `/showcase` or the nine docs pages.

Overturned or narrowed:

- **UX2-W02 "Fixed" (inspector contrast).** The contrast is fixed by making the sidebar strong and the inspector thick, which removed most of the visible extension (UX3-W04). N05 should not be counted as verified.
- **UX2-W07 "Fixed" (ultraThin 6.59:1).** Measured over bright content only; the scene's own Dark content toggle gives 2.77:1 (UX3-W07).
- **Review 2's forced-colours coverage** ("Music and Controls in forced colours", no finding). The Switch, segmented selection and slider track are invisible (UX3-W01).
- **UX2-N04 "Fixed".** The nonmodal sheet no longer hides under the keyboard because the keyboard is suppressed while Format is open; touch users can place the caret but not type, and closing Format raises the keyboard over Aa (UX3-N07).
- **UX2-N05 "Unverified".** Reproduced (UX3-N04).
- **UX2-N06 "Fixed in source".** "Search now" still clips at AX5 (UX3-N15).
- **UX2-W13 / UX2-W12 / UX2-W11.** Typing undo is still per keystroke on both tracks; the web action sheet still always shows Cancel and is modal; Music's scene is still left-to-right in RTL.
- **UX2-H02 flaky test "fixed with a 5 s poll".** Failed again in the first parallel run, passed 4/4 alone (UX3-H01).
- **UX2-S01 web destructive `#E30000`.** Filled destructive buttons may use it, but the action sheet's destructive row is not red at all (UX3-W02).
- **Parity matrix T02** cites a Notes avatar outside the command group; the current Notes scene has none.
- **[liquid-glass.md](../liquid-glass.md) "Landmarks extends imagery beneath chrome".** True in markup, hard to see in the product; native's `c/background-extension` shows no extension on iPhone (UX3-N14).
- **Catalogue.** `TabRole.prominent` and every 27.x symbol checked carry no beta flag; M05, G06, N02, N07, P04 and T07 timestamps are corrected in [apple-sources.md](evidence/independent-ui-ux-3/apple-sources.md); A02 `accessibilityShowBorders` exists on all platforms since iOS 14/macOS 11 (only the macOS 27 setting is new); A05 is Apple's "ultra clear to fully tinted" slider and no rule says custom glass must follow it; S01–S06 are HIG guidance (June 8, 2026), not only video examples.

Declared limitations, judged: web optics as an approximation is a legitimate scope limit, stated honestly. Missing named-union and transition-policy bridges are a missing capability, stated honestly. Whole-note formatting is a scope limit. The native background extension being a custom RN mirror is a missing capability that the docs and the `c/background-extension` route present as more than it is. No AppKit, tvOS or visionOS target is a scope limit.

## Evidence and coverage

**Web scenes:** all ten at 1280 light/dark and 390 light/dark. Tasks: Photos favorite, next, Delete menu by keyboard (Escape returns to Delete), delete to the last photo, Info, options. Music scroll down/up (minimize, expand), pause, Search tab (focus to heading), categories, no results, Clear, Escape. Maps search, select, medium→large, Escape (focus back to the result). Safari scroll, expand, type and Enter, Reader, Back to top. Mail open, flag, archive, compose, Escape (draft saved), reopen, Cancel→Delete Draft, Flagged and Archive folders, compact sidebar and Escape. Controls expand, slider hold/drag/release with computed rest vs held thumb, switch hold, segments. Landmarks row scroll, select, inspector hide, badge add/reverse/tap. Notes Format, edit behind, Heading, Escape, undo count, More, reopen, Done at 1280/390/320. Search Search now, prediction, scope token, empty, Clear filters, Cancel, remove recent, Escape. Materials tiers, Dark content, inset probe. Docs: the nine requested pages captured; action sheet outside click and Escape; sheet Open/Detents/Inspector with Escape; sidebar toggle.

**Motion:** GlassMorph insert frames at 40/120/240 ms and an interrupt (hide then reorder) at 80 ms, settled clean ([120 ms](evidence/independent-ui-ux-3/web-morph-insert-120ms.png), [interrupt](evidence/independent-ui-ux-3/web-morph-interrupt-80ms.png)). Native: Controls expand/collapse at 30 fps in three conditions, Landmarks badge frames.

**Native:** all ten scenes light and dark (scheme query; OS dark for Notes, Search, Materials, Controls); Music, Mail, Notes, Search and `c/sheet` at AX5; forced Reduce Transparency + Increase Contrast on Photos and Music; `native-contracts` (and `?part=custom`), `action-sheet-contracts`, `c/action-sheet`, `tokens`, `tabs-layout`, `c/toolbar-commands`, `c/glass-morph`, `c/background-extension`, `c/switch`. Full log and the system-vs-custom table: [native-notes.md](evidence/independent-ui-ux-3/native-notes.md).

### Commands run

Repo root, `PATH=/tmp/glasscn-tooling/node_modules/.bin:$PATH`.

| Command | Result |
| --- | --- |
| `git log`, `git status --short` at start and end | `cb84c33` → `381656b` (another session's commit); end: only `docs/research/evidence/independent-ui-ux-3/` untracked |
| Playwright probe scripts in `/tmp/uxr3/*.mjs` (widths, menu, scenes, per-scene tasks, stress, forced, docs, overlays, engines, text/RTL) against `http://localhost:3027` | Captures and numbers above. Destructive row: Share, Archive and Delete entry all `oklch(0.163 0.056 256)` light, `oklch(0.863 0.056 256)` dark; probe `text-destructive-ink` = `oklch(0.173 0.071 29)` |
| `E2E_BASE_URL=http://localhost:3027 pnpm exec playwright test e2e/site-width.spec.ts e2e/glass-morph.coverage.spec.ts e2e/action-sheet.behavior.spec.ts --project=chromium` | 11 passed, 1 failed: `glass-morph.coverage.spec.ts:92` ("Expected: > 0, Received: 0" waiting for a transform animation) |
| Same test, `--repeat-each=4` | 4 passed (flaky under parallel load) |
| `E2E_BASE_URL=… pnpm exec playwright test e2e/liquid-surfaces.behavior.spec.ts e2e/liquid-surfaces.coverage.spec.ts` | 55 passed, 2 skipped (all projects) |
| `npm --prefix sandbox/native test -- --runInBand` | 13 suites, 326 tests passed |
| `pnpm test` | 34 files, 348 tests passed |
| `idb ui describe-all/tap/swipe/text`, `xcrun simctl io screenshot/recordVideo`, `xcrun simctl ui appearance/content_size` | Native evidence; light and `large` re-read at the end |
| `curl` of the HIG Action sheets JSON | "Make destructive choices visually prominent … place these buttons at the top" |

Not run: `pnpm typecheck`, `pnpm lint`, the full browser suite, axe and visual specs, `verify:install`, `verify:native`. The Apple source pass and the native simulator pass were delegated to helper agents with written briefs; I reproduced N-1 (source), N-3 and N-4 (captures) myself and spot-checked their evidence.

**Remaining uncertainty:** root causes of UX3-W02 (rule present but not winning), UX3-N04 and UX3-N08 are not confirmed; whether VoiceOver announces the live-region feedback in UX3-N05; real OS accessibility settings on native; every regular-width native case.

## Fix order

1. **Forced colours for controls (UX3-W01).** Check: a Playwright `forcedColors: "active"` snapshot of `/docs/switch`, `/docs/segmented-control`, `/docs/tabs` and `/docs/slider` shows each track, thumb and selected segment with a visible system-colour edge, and the checked state differs from unchecked.
2. **Native accessibility tree (UX3-N01, UX3-N16).** Check: `idb ui describe-all` on `c/liquid-glass-02?scene=materials` lists "Playback progress" as an adjustable with a value, and on `c/switch` the system switch reports `AXLabel "Reminders"`; Maps' segmented control is named.
3. **Keyboard and largest text in native scenes (UX3-N02, UX3-N03, UX3-N15, UX3-N22).** Check: typing in Maps search keeps field, Cancel and the first result above the keyboard; at AX5 Music shows at least three song rows and scrolls, Search's buttons fit, and a format chip is reachable without horizontal scrolling.
4. **Landmarks composition (UX3-W03, UX3-W04, UX3-N14).** Check: scrolled cards are covered by the sidebar's glass at x < 160; the sidebar's mean colour over the extension differs from the ground by ΔE > 10 while inspector secondary text stays ≥ 4.5:1; native `c/background-extension` shows a mirror under visible chrome.
5. **Action sheets (UX3-W02, UX3-W13, UX3-N20, UX3-N21).** Check: the destructive row computes a red hue (25–35° in OKLCH) at ≥ 4.5:1 in both schemes and sits first; an anchored web sheet has no Cancel and leaves the page interactive; the native custom sheet appears beside its trigger; a disabled destructive action is either visible-disabled or documented as omitted.

After these: Notes toolbar under the Format sheet (W05), dead Music tiles (W06), ultraThin on dark content (W07), enlarged-text header (W08), Controls cluster fusion (N08), Safari address (N04, N10), Notes keyboard on close (N07).

## Changes that landed during this review

This review ran against `cb84c33` (plus `381656b`). Two later commits on `main` touch its findings; neither is rechecked here.

| Commit | Touches | What changed |
| --- | --- | --- |
| `a122309` | UX3-W02, flaky morph test | Destructive rows take `destructive-ink` instead of the accent ink: an unlayered `text-primary-ink` rule had overridden it. The ink is still 70% label, so the row reads dark red rather than system red, and Delete still sits last. `glass-morph.coverage.spec.ts` waits for `networkidle` before clicking. |
| `6e2f54e` | G02 (badge motion), every web overlay | The cluster glass is traced in script and written into inline SVG masks in the frame it is measured, so it no longer trails reordering badges. Overlays no longer replay their entry animation after the morph from their trigger finishes. |
