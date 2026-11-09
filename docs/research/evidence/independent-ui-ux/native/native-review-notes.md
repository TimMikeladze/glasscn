# Native review notes: glasscn vs iOS 27 Liquid Glass

Independent native track. Branch `liquid-glass-27-rebuild`, working tree as found on 2026-11-08. No repo source, generated files, tests or baselines were edited. Only the screenshots in this folder and this file were written.

## Environment

- Simulator: iPhone 18 Pro, iOS 27.0, UDID `980F1928-1320-4C63-8540-2F5B7BB16651`. Screenshots are 1206 x 2622 px (402 x 874 pt at 3x).
- Expo Go 57.0.9 (`glasscn-expo-go-57.0.9.app`, bundle `host.exp.Exponent`), app "glasscn sandbox", SDK 57.0.0.
- Metro: `sandbox/native` on port 8083 (`exp://127.0.0.1:8083`). A second Metro for another project (`otto`) runs on 8081.
- Interaction: `idb` (tap, swipe, accessibility tree) was available and used. `cliclick` was present but not needed.
- Settings recorded at start: appearance `light`, content_size `large`.
- Settings applied: content_size `accessibility-extra-extra-extra-large` for the AX5 set, then back to `large`. Appearance was never changed (dark captures use the sandbox `scheme=dark` query, not the OS setting).
- Settings at end, verified with `xcrun simctl ui <UDID> appearance` / `content_size`: `light` / `large`.
- Every capture except the final reset used `still=1`, which force-enables Reduce Motion inside the app (sticky for the JS session). Glass effect animation and springs were therefore off in every screenshot.
- `force=reduceTransparency,highContrast` is also sticky per JS session. After those captures I opened a URL without `force` and reloaded the bundle from the Expo Go tools menu; the final state renders translucent again.
- Start-up note: Expo Go on this simulator was showing the `otto` project with a sheet ("New area") presented, and the first deep link did not switch projects. I dismissed that sheet with a swipe, after which glasscn loaded. The blue gear at top right in every screenshot is the Expo Go tools button, not part of the library.
- The scenes render inside the sandbox screen (`/c/[name]`), below the palette picker, inside a rounded 24 pt card. The Expo Router header ("Liquid Glass experiences") sits above. This framing is the sandbox's, not the component's, and I did not count it against the library.

## Reference baseline used for judging

I judged against iOS 26 system apps (which I know well) plus the iOS 27 refinements the repo itself cites in `docs/liquid-glass.md` (darker edges, brighter highlights, uniform toolbar top). I did not capture reference screenshots of iOS 27 system apps on this simulator before the coordinator asked me to wrap up, so iOS 27 specific claims are not first-hand verified here.

## Systemic findings (apply to most scenes)

- Type scale is not Apple's. `ui.tsx:49` builds sizes from a 1.25 modular scale off 16 pt: `sm` 14, `base` 16, `lg` 20, `xl` 25, `2xl` 31, `3xl` 39, heading weight 650. iOS text styles are Body 17, Subheadline 15, Headline 17 semibold, Title2 22, Large Title 34 bold. So body copy everywhere is 1 pt small, subheads 1 pt small, list headings (Mail sender/subject, `weight 600` at 16) are not Headline, and `3xl` titles ("Listen Now", "By the lake", "Take the slower road") are 39 pt, 5 pt over Large Title. `2xl` page titles ("Inbox", "Collections", "Material study", "Edit Photo") are 31 pt, 3 pt under Large Title.
- Glyphs are Lucide outline icons (`liquid-glass-01.tsx:4`, `liquid-glass-02.tsx:3`), not SF Symbols. Several carry the wrong platform meaning: `Share2Icon` (three-node Android share) in Notes, `ArrowLeftIcon` for back in Mail, `MenuIcon` hamburger in Mail, `RotateCcwIcon` (counter-clockwise) for reload in Safari, `PaletteIcon` for warmth in Controls, `MapPinIcon` drawn inside a round pin in Maps. Only system menu items use `systemImage`.
- Content cards use web styling: fills plus 1 px `glassBorder` borders and 12 to 24 pt radii (`liquid-glass-02.tsx:58`, `:92`, `:124`, `:125`). Apple uses inset grouped lists, separators or borderless image tiles here.
- Sheets (`InfoSheet`, `liquid-glass-01.tsx:78-88`) show the system close button and also a filled accent "Done" pill at bottom left. The header (`sheet.tsx:302`, `padding: 20`) stacks on top of the content's `paddingHorizontal: 24` (`liquid-glass-01.tsx:81`), so titles sit about 20 pt to the right of the body text.
- `ScrollEdge variant="automatic"` (`scroll-edge.tsx:115`, steps `[0.96]`) draws one uniform 96 percent opaque band with a hard top edge. At the bottom of Music and Safari it slices through text lines. iOS draws a soft progressive edge behind floating bars; the 27 "uniform" treatment the repo cites is a top-toolbar behavior.
- System menu triggers have no accessible name. `SystemMenu` (`dropdown-menu.tsx:149-171`) puts `accessibilityLabel` on an inner `View` with `pointerEvents="none"`, but the exposed element is the native `MenuView` PopUpButton, which `idb ui describe-all` reports with `AXLabel: null` for both the Photos "Photo options" button and the Notes toolbar overflow ("More note actions", `toolbar.tsx:162`).

## Per-scene findings

### Photos (`liquid-glass-01.tsx:90-134`)

Screens: `native-photos-dusk-light.png`, `native-photos-dusk-dark.png`, `native-photos-ax5-p1..p3.png`, `native-photos-forced-rt-hc.png`, `native-int-photos-menu.png`, `native-int-photos-info-sheet.png`.

- The photo is dimmed 35 percent (`:104`, `dim={0.35}`). Photos shows the asset undimmed; the dim reads as a scrim over the user's own photo.
- A 39 pt display title "By the lake" plus "Weekend Away" is painted over the lower third of the image (`:118`). Photos puts the location and date as a two-line centered title in the top bar and never overlays a large title on the asset.
- Bottom bar: Share, Favorite, Info grouped in one clear capsule and a separate "next" chevron (`:119-126`). Photos uses swipe for next; the bar is Share (alone), Favorite / Info / Edit (grouped), Delete (alone). The chevron button has no Photos equivalent.
- The group capsule renders lighter than the separate chevron circle over the same water (different sampling), so the bar reads as two materials.
- The "..." menu opens the real system menu anchored to the button. Good. It appears in light appearance over a dark-forced scene.
- Info sheet: system medium detent, glass, with close X. Header indented about 20 pt past the body; a second "Done" accent pill at bottom left (`:84`).
- AX5: the scene height is `620 * fontScale` (`:45`), so the photo becomes about 1935 pt tall and the bottom bar is three screens down. In an app the viewport would stay fixed and the chrome would adapt.
- Forced reduce transparency + high contrast: bar becomes an opaque near-black capsule with white glyphs, "..." becomes solid. Legible and correct direction.

### Music (`liquid-glass-01.tsx:142-208`, `dock.tsx`)

Screens: `native-music-dusk-light.png`, `native-music-dusk-dark.png`, `native-music-ocean-light.png`, `native-music-rose-light.png`, `native-music-sage-light.png`, `native-music-ax5-p1..p3.png`, `native-int-music-scrolled-minimized.png`.

- Overall composition is close: mini player accessory above a floating tab bar with a separate search circle. Selected tab gets a tinted glyph and label on a lens. Palette accent follows correctly (orange, blue, pink, green).
- The accessory is wider than the tab-bar row (`dock.tsx:88`, `width: "100%", maxWidth: 448`), so its ends overhang the bar and show bright edge artifacts at both caps. iOS aligns the accessory's edges with the tab bar group.
- Minimized (after scrolling): order is mini player, Home, Search. iOS puts the collapsed tab button first, the accessory in the middle, search last. Cause: `MiniPlayer` is the first child (`liquid-glass-01.tsx:187`) and only the expanded placement sets `order: -1`. The Home and Search circles are also different diameters (about 59 pt vs 49 pt).
- The hard opaque bottom band (`:178`, `size={148}`) cuts "Find your own pace" mid-line when scrolled.
- Title "Listen Now" is 39 pt; current Music calls this tab Home. Artwork corners use the 24 pt surface radius (`:173`); Music artwork is about 8 to 12 pt.
- Dark: the dock (accessory, tab bar, search) stays light-appearance glass with dark labels over a black scene. See "Dark scheme glass" below.
- AX5: tab bar is replaced by a vertical list (`AccessibleMusicNavigation`, `:199-208`), which is a reasonable choice, but the mini player grows into a tall oval (999 radius at about 200 pt height) with "A little f..." truncated, and the 22 pt tab glyphs sit beside 50 pt labels.

### Maps (`liquid-glass-01.tsx:210-269`)

Screens: `native-maps-dusk-light.png`, `native-maps-dusk-dark.png`, `native-maps-ocean-light.png`, `native-maps-rose-light.png`, `native-maps-sage-light.png`, `native-maps-ax5-p1..p3.png`, `native-int-maps-pin-sheet.png`.

- Search field and a segmented control sit at the top (`:245-250`). Maps on iPhone puts search in the bottom sheet, with map controls as a vertical glass stack at top right. The bottom "A day by the coast" card (`:258`) is custom glass that looks like a sheet but is not one and contains no search.
- The segmented control track is nearly transparent over map art, so "Food" and "Outdoors" sit on top of road strokes.
- All pins are identical accent circles containing a pin glyph, with labels in white pills (`:252-254`). Maps uses category-colored balloon markers with category glyphs and haloed text labels.
- The location-arrow button is labeled "Show all nearby places" (`:257`). That glyph means current location.
- Map art uses `preserveAspectRatio="none"` (`:220`). At AX5 the frame is about 3x taller, so the user-location dot becomes a tall ellipse and the label pills (fixed 160 pt wide, `:252`) wrap to three lines and clip the first and last letters ("Golden Gate Park").
- Pin tap opens the system sheet. Two stacked filled accent buttons ("Preview walking route", "Done") plus the system X. Maps place cards use one prominent Directions action and a row of secondary actions.
- Dark: map land is near-black (`auroraBase` `#050507`) with darker roads; Maps dark uses blue-gray land with lighter roads.

### Safari (`liquid-glass-01.tsx:271-320`)

Screens: `native-safari-dusk-light.png`, `native-safari-dusk-dark.png`, `native-safari-ax5-p1..p3.png`, `native-int-safari-scrolled-collapsed.png`, `native-int-safari-scrolled-back-up.png`.

- The opaque bottom band (`:306`) has a hard top edge that cuts the subtitle "destinations" in half at rest. This is the most visible artifact in the set.
- Address field shows `fieldnotes.example/alpine` left-aligned beside the lock (`:310`). Safari shows the domain only, centered.
- Back, forward, bookmark and tabs are four separate 48 pt glass circles spread edge to edge (`:313`). Safari's bottom layout puts them in one bar; the compact layout folds them into the address capsule. A disabled Back still draws a full circle.
- Reload uses a counter-clockwise arrow (`:311`).
- Collapsed on scroll: the field drops to 44 pt but stays full width at the same text size, with the lock pinned left and the URL centered. Safari's collapsed bar is a small, narrow pill with smaller text.

### Mail (`liquid-glass-01.tsx:322-372`)

Screens: `native-mail-dusk-light.png`, `native-mail-dusk-dark.png`, `native-mail-ax5-p1..p3.png`, `native-int-mail-mailboxes-sheet.png`, `native-int-mail-message.png`.

- Hamburger button top left (`:356`) and compose top right. iOS Mail uses "< Mailboxes" back, Edit/Select top right, and filter, status and compose in the bottom toolbar.
- Message view back button is `ArrowLeftIcon` (Android arrow). iOS uses a chevron with the previous title.
- Mailboxes sheet shows "Mailboxes" twice: the sheet title (`:364`) and the heading inside `sidebarContent` (`:345`). At the medium detent the "Done" pill is cut off at the bottom.
- Rows: sender and subject both 16 pt semibold, preview one line, no unread indicator, no avatar, generous 18 pt vertical padding. Separators run full bleed across the 24 pt row padding (`:352`, border on the row itself). Mail insets separators to the text edge.
- Compose glass is 52 pt (44 pt icon in a padded capsule) beside a 48 pt menu circle.
- Dark: both top glass buttons sample as rgb(133,133,135) over a #050507 background, i.e. light-appearance glass on black.

### Controls (`liquid-glass-01.tsx:374-416`)

Screens: `native-controls-dusk-light.png`, `native-controls-dusk-dark.png`, `native-controls-ax5-p1..p3.png`, `native-controls-forced-rt-hc.png`, `native-int-controls-expanded.png`, `native-int-controls-warmth.png`.

- The photo being edited is dimmed (`:401`, `dim={0.6 - brightness * 0.0045}`), so at the default 65 the editor shows a darker image than the edit. An editor never scrims the asset.
- "Edit Photo" plus a "Brightness" subtitle (`:402`) duplicates the "Brightness" label above the slider (`:404`).
- Expanded tools morph out of the center button as five glass circles (good GlassEffectContainer demo), but the active tool has no selected state and the center close is a solid accent-tinted X that reads as destructive. Photos shows the active adjustment highlighted and uses a dial with the value in the icon.
- Slider thumb is the iOS 26 capsule. Value "65" is a 14 pt caption at the far right with low emphasis.
- Forced RT + HC: tool button becomes an opaque dark circle; slider fill lightens on the dark-forced scene. Legible.

### Landmarks (`liquid-glass-02.tsx:41-68`)

Screens: `native-landmarks-dusk-light.png`, `native-landmarks-dusk-light-lower.png`, `native-landmarks-dusk-dark.png`, `native-landmarks-dusk-dark-lower.png`, `native-landmarks-ax5-p1..p4.png`, `native-standalone-glass-morph-p1..p2.png`, `native-standalone-background-extension-p1.png`.

- On iPhone width there is no Liquid Glass chrome at all apart from the badges; the hero is a plain image in a card. The background extension and sidebars only appear at `width >= 760` (`:43`), which I could not reach on this device.
- "Field collection" sits on bright cloud and lake with only a 15 percent `ui.dim` band (`:54`); legibility is marginal in light.
- Place cards: fill plus 1 px border plus 12 pt radius (`:58`). Selected state is a slightly darker fill. Landmarks uses borderless rounded image tiles.
- Badges are centered (`:63`) while everything else is left-aligned, and both use the same mountain glyph.
- "Reverse badges" is a ghost button in foreground color with no boundary; it reads as a label. iOS borderless buttons use the tint color.

### Notes (`liquid-glass-02.tsx:71-100`)

Screens: `native-notes-dusk-light.png`, `native-notes-dusk-light-lower.png`, `native-notes-dusk-dark.png`, `native-notes-dusk-dark-lower.png`, `native-notes-ax5-p1..p4.png`, `native-notes-forced-rt-hc.png`, `native-int-notes-format-sheet.png`.

- The editor is a gray filled box with a border and 24 pt radius (`:92`); Notes text sits directly on the page.
- "Save note" accent CTA (`:93`); Notes autosaves. Instruction text "Select or edit the note while formatting is open." is visible copy.
- Toolbar commands sit in the content as labeled capsules "Undo", "Redo", "...", "Share" (`:85-91`). On iPhone, Notes uses icon-only glass buttons in the top bar and the bottom toolbar. Share uses the three-node glyph.
- "Aa Format" is a full-width glass button at the end of the content (`:94`), not a toolbar item.
- Format sheet (nonmodal, 0.3 detent): background stays interactive and undimmed, which is right. Style choices are plain text buttons with a gray selected fill and a bottom-left accent "Done" (`:96`); Notes uses a close X and style chips.
- AX5: Undo/Redo move into overflow, leaving a small "..." circle and "Share". "Aa Format" text nearly touches the capsule edges.

### Search (`liquid-glass-02.tsx:102-129`)

Screens: `native-search-dusk-light.png`, `native-search-dusk-light-lower.png`, `native-search-dusk-dark.png`, `native-search-dusk-dark-lower.png`, `native-search-ax5-p1..p5.png`, `native-int-search-prominent-focused.png`.

- Three search-like inputs in one view: the glass SearchField, "Find a folder" and "Filter this library" (`:118-121`), and two identical All/Places/Notes scope rows (`:120` and `:123`). iOS uses one field with a scope bar under it.
- Search is at the top of the content; on iPhone 26/27 search sits at the bottom within reach (toolbar or search tab).
- "Search" (gray fill) and "Search now" (accent text in a glass capsule) are two different button styles side by side for the same concept.
- Recents are chips with a "×" text glyph (`:122`); iOS shows a list with a clock glyph and a Clear action.
- Results are gray filled cards with a darker selected fill; the selected-result panel has a 1 px border (`:124-125`).
- "Search now" focuses the inline field mid-page with Cancel beside it. The field does not move to the keyboard edge.
- AX5: the glass SearchField text and glyph stay at roughly default size while "Find a folder" scales to AX5 beside it. Both use `fontSize: ui.text.base` (`search-field.tsx:160`, `input.tsx:65`), so I suspect the TextInput inside the `GlassView` is not receiving the font-scale update; I did not confirm the cause.

### Materials (`liquid-glass-02.tsx:131-156`)

Screens: `native-materials-dusk-light.png`, `native-materials-dusk-light-lower.png`, `native-materials-dusk-light-lower2.png`, `native-materials-dusk-dark.png`, `native-materials-dusk-dark-lower.png`, `native-materials-ax5-p1..p5.png`.

- "Tertiary foreground" on regular glass over the light sky is pale gray on near-white; "Standard material" on the ultraThin/thin tiles is brown-gray on brown blur. Labels use plain colors (`:142-143`), not vibrancy, so legibility drops exactly where materials are thinnest.
- AX5: the two-column tiles (`flexBasis: "40%"`, `:143`) break words mid-word ("ultraT / hin", "Stand / ard mater / ial", "regul / ar"). They should collapse to one column at accessibility sizes.
- "Dark media" is an empty black card (no media, `:154`), so the case demonstrates nothing.
- Slider thumbs differ within the screen: circle on the tick slider, capsule on the inset slider, none on progress. The progress fill shows a stray white dot just inside its end.
- "Dark content" toggle labels the action, not the state.

### Standalone routes (light only)

Screens: `native-standalone-toolbar-commands-p1.png`, `native-standalone-glass-morph-p1..p2.png`, `native-standalone-background-extension-p1.png`, `native-standalone-action-sheet-p1.png`, `native-standalone-action-sheet-contracts-p1.png`, `native-standalone-sheet-p1.png`, `native-standalone-native-contracts-p1.png`, `native-standalone-native-contracts-custom-p1..p2.png`, `native-standalone-tokens-p1..p3.png`, `native-standalone-tabs-layout-p1..p3.png`.

- `/c/glass-morph` and `/c/background-extension` both render the Landmarks scene unchanged (`sandbox/native/src/sandbox/demos/advanced-glass.tsx:34-35`), so there is no isolated demo of either contract on iPhone.
- `/tabs-layout`: system tab bar with badge, accessory above, separate search. After two slow 650 pt downward drags the bar did not minimize and the accessory stayed above it. I only used slow drags, so this is not a confirmed defect.
- `/c/sheet`, `/c/action-sheet`, `/action-sheet-contracts`, `/native-contracts`: captured at rest only (buttons). I did not open the sheets or dialogs on these routes.

## Dark scheme glass

Glass inside a `GlassEffectGroup` / dock follows the OS appearance (light) instead of the app's forced `scheme=dark`: Mail buttons sample rgb(133,133,135) and the Music dock stays light with dark labels on a black scene, while the Notes toolbar (not in a group) renders dark at rgb(36,36,39). `GlassSurface` passes `colorScheme={colorScheme ?? options.scheme ?? "auto"}` to each `GlassView` (`glass.tsx:197`), but `GlassEffectGroup` (`glass.tsx:287-301`) does not pass a scheme to `GlassContainer`. I suspect the container's environment overrides the children. I did not test OS-level dark appearance, where the two would agree.

## What I could not test, and why

- OS-level Dark appearance, Reduce Transparency, Increase Contrast and Bold Text: only the sandbox `scheme` query and library `force` were used, as instructed.
- Motion: every capture had Reduce Motion forced through `still=1`, so glass materialize/morph animation, spring presses and the minimize transition were not observed.
- VoiceOver: not run. Accessibility findings come from `idb ui describe-all` only.
- Typing: `idb ui type` does not exist in this idb build and I did not switch to `idb ui text`, so Search suggestions and tokens are untested (`native-int-search-typed-suggestions.png` is the focused state with keyboard, no text).
- Wide layouts (Mail sidebar at `>= 640`, Landmarks sidebars and background extension at `>= 760`, Search two-column at `>= 700`): not reachable on iPhone portrait; landscape and iPad not run.
- Palettes ocean/rose/sage: only Music and Maps, light scheme. Other scenes and dark variants skipped at the coordinator's request.
- Standalone routes: light only, at rest. Sheet detents, action sheet system and custom presentations, native-contracts inspector, glass-morph Add Summit transition and tabs-layout fling were not exercised. Skipped at the coordinator's request.
- AX5 on standalone routes and forced settings in dark: not run.
- Reference screenshots of iOS 27 system apps (Safari, Maps, Photos exist on the simulator): not captured, so the comparison relies on iOS 26 knowledge plus the repo's documented 27 changes.
- Android and web: out of scope for this track.

## Ranked native defects

Rank reflects how much each one breaks the "this is the Apple app" read or blocks a user.

1. Hard-edged opaque scroll-edge band slices content. `registry/native/scroll-edge.tsx:115` (automatic = one 0.96 band), used at `liquid-glass-01.tsx:178` and `:306`. Correction: make `automatic` a progressive blur/fade (several steps easing to 0, or a native scroll-edge effect where available) for bottom edges; keep the uniform band for top toolbars only if 27 really does that.
2. System menu triggers have no accessible name. `registry/native/dropdown-menu.tsx:149-171` (affects `liquid-glass-01.tsx:109` and `toolbar.tsx:162`). Correction: put `accessibilityLabel` (and `accessible`) on the `MenuView` element itself, and add a test that reads the native element's label.
3. Type scale is a 1.25 modular ramp from 16 pt, not iOS text styles. `registry/native/ui.tsx:49` plus `type` tokens (`ratio 1.25`, `headingWeight 650`). Correction: on iOS map `base` 17, `sm` 15, `xs` 13/12, `lg` 20, `xl` 22, `2xl`/`3xl` 28/34 with Large Title bold, and use `dynamicTypeRamp` for each.
4. Lucide glyphs with Android or wrong meanings instead of SF Symbols. `liquid-glass-01.tsx:4`, `liquid-glass-02.tsx:3` (Share2, ArrowLeft, Menu, RotateCcw, Palette, MapPin in pin). Correction: render SF Symbols on iOS (expo-symbols or `@expo/ui` Image systemName) with filled variants in bars; at minimum swap to `square.and.arrow.up`, `chevron.backward`, `arrow.clockwise`, `thermometer.medium`.
5. Mail chrome is not iOS Mail. `liquid-glass-01.tsx:345`, `:356`, `:359`, `:364`. Correction: back chevron "Mailboxes" top left, compose in a bottom toolbar, remove the duplicate "Mailboxes" heading from the sheet content, inset separators to the text edge.
6. Music dock: minimized order wrong, accessory wider than the bar, uneven circle sizes. `liquid-glass-01.tsx:187`, `registry/native/dock.tsx:88`. Correction: in minimized placement order collapsed tab, accessory, search; in expanded placement size the accessory to the bar group's width; give minimized tab and search the same diameter.
7. Glass in `GlassEffectGroup` ignores the forced dark scheme (light glass on black). `registry/native/glass.tsx:287-301` with `:197`. Correction: pass the theme's scheme to `GlassContainer` (or set the environment color scheme on the container) and add a dark-forced screenshot check.
8. Scenes stretch with font scale and map art distorts. `liquid-glass-01.tsx:45` (`620 * fontScale`), `:220` (`preserveAspectRatio="none"`), `:252` (fixed 160 pt label pills). Correction: keep the viewport height fixed and let chrome reflow; use `xMidYMid slice` for the map; size pin labels to content with a max width and `numberOfLines`.
9. Sheets carry two dismiss controls and misaligned headers. `liquid-glass-01.tsx:84`, `liquid-glass-02.tsx:96`, `registry/native/sheet.tsx:302`. Correction: drop the bottom-left "Done" (or put a single Done in the sheet's top bar), and remove `SheetHeader` horizontal padding when the content already pads.
10. Notes reads as a web form. `liquid-glass-02.tsx:84-96`. Correction: unboxed editor on the page, no Save button, icon-only Undo/Redo/Share in the top bar, "Aa" and checklist in a bottom glass toolbar, Format sheet with a close X.
11. Search scene duplicates fields and scopes and places search at the top. `liquid-glass-02.tsx:117-125`. Correction: one SearchField at the bottom (`placement="bottom"`) with a scope bar, recents as a list with a clock glyph and Clear, results as an inset grouped list.
12. Maps layout inverts the app: search and segmented control on top, custom card at the bottom, uniform pins, mislabeled location button. `liquid-glass-01.tsx:245-262`. Correction: search inside a bottom system sheet with detents, map controls as a top-right glass stack, category-colored markers, label the arrow "Current location".
13. Photos and Controls scrim the user's photo and overlay a 39 pt title. `liquid-glass-01.tsx:104`, `:118`, `:401`. Correction: no dim on the asset (dim only behind clear controls if needed, via a local gradient), move location and date into the top bar, match the Photos bar grouping and drop the next chevron; never dim the image in the editor.
14. Materials tiles break words at AX5 and labels lack vibrancy. `liquid-glass-02.tsx:142-143`. Correction: one column when `fontScale >= 1.35`; use vibrant secondary/tertiary label colors on materials (or raise their contrast to 4.5:1 on the thin tiers).
15. Safari bar does not behave like Safari. `liquid-glass-01.tsx:308-313`. Correction: domain only and centered, toolbar actions in one bar (or folded into the address capsule), clockwise reload glyph, and a narrow small-text pill when collapsed.

Also observed but below the cut: SearchField text did not scale at AX5 next to inputs that did (`search-field.tsx:160`, cause unconfirmed); web-style bordered cards in Landmarks and Search (`liquid-glass-02.tsx:58`, `:125`); `/c/glass-morph` and `/c/background-extension` render the same Landmarks scene (`advanced-glass.tsx:34-35`).
