# Independent UI/UX review 2: glasscn against Apple's Liquid Glass (iOS 27)

Reviewed November 8, 2026, 20:10 to 21:00 PST, on branch `liquid-glass-27-rebuild` (HEAD `d896a3d` plus the uncommitted rebuild: 212 modified tracked files and 66 untracked entries, the same count at the start and the end). I opened Apple's sources, then used the running site and the iOS 27 simulator, before reading [the first independent review](independent-ui-ux-review.md), [the fix spec](../specs/apple-liquid-glass-ui-review-fixes.md), [the system-defaults spec](../specs/apple-system-defaults.md), the parity matrix and the verification record. Those are challenged in [Previous conclusions, rechecked](#previous-conclusions-rechecked).

Per-case Apple criteria, with URLs, sections, timestamps and availability, are in [apple-criteria.md](evidence/independent-ui-ux-2/apple-criteria.md). Fresh evidence is under [`evidence/independent-ui-ux-2/`](evidence/independent-ui-ux-2/): `web/`, `native/` and `probes/` (the Playwright and `idb` scripts used for the measurements). The PNGs are downscaled and reduced to 256 dithered colours; every contrast number below was measured on the live page or a full-resolution simulator capture, not on the stored PNG.

## Verdict

**Web visual fidelity: close at rest, with three legibility failures.** The ten scenes now have Apple's arrangements: Photos' clear controls, Music's leading tab capsule with a trailing Search tab, Mail's edge sidebar and split view, Notes' symbol bar with a tinted Done, Landmarks' three toolbar groups. Regular and clear materials render as an approximation in Chromium, WebKit and Firefox. What fails: the viewer's Clarity slider at its Clear end makes regular-glass labels unreadable (1.3:1), Landmarks' inspector text sits at 1.7 to 2.7:1 over the background extension, and secondary labels on thin materials and unselected segments are below 4.5:1 at the default setting.

**Web task usability: most tasks complete; focus handling does not.** Every scene's main task worked with pointer and keyboard. Keyboard focus falls back to `<body>` after at least eight routine actions (Escape on a sheet, archive, compose Cancel/Send, Search Cancel, removing a recent, arrowing onto the Search tab). Two scene controls do the wrong thing: Maps' layers button opens a place sheet titled "Map layers", and Notes' Title and Heading formats render identically. Mail's compose says Cancel discards the draft and then keeps it.

**Native visual fidelity: system pieces look like iOS 27, one system presentation does not.** System glass, sheets, sliders and the confirmation dialog on `/action-sheet-contracts` render as the OS draws them. The Photos Delete confirmation, which is the same system dialog presented from a trigger inside a glass container, shows its only action at 1.24:1 and away from its source. Under the System palette, system controls use iOS 27's systemBlue while custom controls on the same screen use a darker blue.

**Native task usability: works at default size, breaks in specific states.** Swiping away a compose sheet loses typed text without confirmation. A nonmodal Format sheet is covered by the keyboard while you edit behind it, then reappears over the next screen. At the largest accessibility size, Search's scope labels break mid-word and its Clear button is off-screen. Safari's address wraps onto two lines at the default size.

**The new System default:** the structure is right (grouped greys, no aurora, San Francisco), but the values are not iOS 27's. The accent and destructive colours use pre-iOS 26 or Tailwind values, and dark-scheme filled buttons get a near-black label where Apple uses white. The spec lists two deliberate departures; the dark label and the destructive colour are not among them.

**Blocks approval:** UX2-W01 (Clear end of the clarity slider), UX2-N01 (illegible destructive confirmation), UX2-W02 (inspector text contrast). The P2 items should follow before claiming one-to-one coverage of the System appearance or P03/P06.

## Environment

| Item | Value |
| --- | --- |
| Host | macOS 27.2 (26B123), Node 26.12.1, pnpm from `/tmp/glasscn-tooling/node_modules/.bin` |
| Web server | Existing `next-server` 16.4.5 on `:3027` (pid 92822, cwd the repo), reused. React 19.3.0, Tailwind 4.3.3 |
| Browsers | Playwright 1.64.0 isolated contexts: Chromium 156.0.8078.4, WebKit 27.2, Firefox 157.0 |
| Web viewports | 1440×900 (scenes, docs), 390×844 mobile + touch (compact scenes, menu), width sweep 320/390/768/900/1024/1200/1280/1440, 640×450 at DPR 2 for 200% zoom, light and dark, `reducedMotion: reduce` for static captures, `no-preference` for motion and interaction runs |
| Web settings exercised | Clarity 0 / 0.5 / 0.65 / 0.7 / 0.74 / 1, Reduce transparency (light, dark), Show control borders, `prefers-contrast: more` (light, dark), forced colours, `dir="rtl"` set after load |
| Native | Existing Metro on `:8083` (pid 92604, cwd `sandbox/native`), reused. Expo 57.0.26, React Native 0.86.3, `@expo/ui` 57.0.21, `expo-glass-effect` 57.0.4, Expo Router 57.0.24, Reanimated 4.5.1, Expo Go 57.0.9 |
| Device | iPhone 18 Pro simulator, iOS 27.0 (24A434), UDID `980F1928-1320-4C63-8540-2F5B7BB16651`, portrait, `idb` for taps, swipes, text and the accessibility tree. The booted iOS 26.5 simulator was not touched |
| Simulator settings | Recorded at start: appearance light, content size `large`, Increase Contrast disabled, OS Reduce Motion off. Changed during the review to dark, `accessibility-extra-extra-extra-large` and Increase Contrast enabled. Restored and re-read at the end: light, `large`, disabled |
| Sandbox state | Found: palette System, scheme light, **library-forced Reduce Motion on** (left by an earlier session). I switched the forced Reduce Motion off for the motion pass and switched it back on at the end; forced Reduce Transparency and Increase Contrast were set by deep link and cleared |

Not tested: physical devices, VoiceOver gestures and Full Keyboard Access (only the accessibility tree), iPad or any regular-width native layout, landscape, OS Reduce Transparency and the OS Liquid Glass look slider on native (no `simctl` control), a real RTL locale (RTL was `dir` set on the page), AppKit, tvOS and visionOS (no target exists).

## Findings

P0 unusable or unsafe, P1 major access/usability/fidelity defect, P2 reproducible limited defect, P3 polish. "Basis" says whether the expectation comes from an Apple source, a project rule or my judgment.

### UX2-W01 (P1, web) The Clear end of the Clarity slider makes regular-glass labels unreadable

- **Where:** every scene with regular `LiquidGlass`, viewer Clarity 0%, both schemes.
- **Expected:** Apple's Liquid Glass look runs from ultra clear to fully tinted; apps get it automatically and should test custom elements under it (A05: [WWDC26 269 at 2:28](https://developer.apple.com/videos/play/wwdc2026/269/?time=148), [WWDC26 102 at 22:57](https://developer.apple.com/videos/play/wwdc2026/102/?time=1377)). Regular glass adjusts luminosity so text stays legible ([HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials#Liquid-Glass)). Project rule: viewer clarity overrides authored effects and "must remain usable" ([design rules](../rules/design.md)).
- **Actual:** `clarity()` multiplies every frost opacity by `min(1, 2 × clarity)` ([registry/stylesheet.mjs:13](../../registry/stylesheet.mjs)), so at 0 the frost is gone and labels keep the scheme colour. Effective contrast at 0 versus 0.5: Controls' unselected segment "Erase" 1.27:1 (3.70 at 0.5), Music MiniPlayer title 2.29:1 with a worst decile of 1.76 (9.94 at 0.5), Controls title pill worst decile 2.85. Labels pass again from 0.65 up.
- **Reproduce:** `/showcase`, Your glass settings, drag Clarity to 0%, open Controls or Music.
- **Evidence:** [clarity 0 / 0.5 / 1](evidence/independent-ui-ux-2/web/clarity-0-vs-0.5-vs-1.png), [controls at 0](evidence/independent-ui-ux-2/web/stress-clarity0-controls.png), [music at 0](evidence/independent-ui-ux-2/web/stress-clarity0-music.png); [probes/t15.mjs](evidence/independent-ui-ux-2/probes/t15.mjs).
- **Impact:** a viewer who picks the clearest look loses segment and MiniPlayer labels over photos.
- **Correction:** keep a floor of frost (or a label-matched scrim) for regular glass at clarity 0, or switch regular labels to the media label palette below a threshold, as clear glass already does near opaque. Add clarity 0 to the legibility tests.
- **Basis:** Apple source (test custom elements under the look setting) and project rule.

### UX2-N01 (P1, native) The Photos Delete confirmation is illegible and not at its source

- **Where:** `c/liquid-glass-01?scene=photos`, bottom-trailing Delete, light.
- **Expected:** an iPhone action sheet with a source anchors to it; inline presentation has no Cancel (P04: [WWDC25 284 at 14:33](https://developer.apple.com/videos/play/wwdc2025/284/?time=873)). Text reaches 4.5:1 ([HIG Accessibility, Vision](https://developer.apple.com/design/human-interface-guidelines/accessibility#Vision)).
- **Actual:** the system `ConfirmationDialog` appears full width at the bottom, its single "Delete Photo" action pale red on a nearly transparent capsule: 1.24:1 against the dimmed backdrop. The same component on `/action-sheet-contracts` renders an opaque grouped sheet with legible labels. The difference is the trigger context: the Photos trigger sits inside a merged `GlassEffectGroup` with `liquid-clear` glass ([registry/native/liquid-glass-01.tsx:140-152](../../registry/native/liquid-glass-01.tsx)); the dialog host is `SystemPresentation` in [registry/native/action-sheet.tsx:111-132](../../registry/native/action-sheet.tsx). I did not confirm the cause.
- **Reproduce:** open the route, scroll to the bottom controls, tap Delete.
- **Evidence:** [Photos dialog](evidence/independent-ui-ux-2/native/n-photos-delete-2.png), [first capture](evidence/independent-ui-ux-2/native/n-photos-delete.png), [contracts dialog for comparison](evidence/independent-ui-ux-2/native/n-as-open.png).
- **Impact:** a destructive confirmation the user can barely read.
- **Correction:** host the dialog outside the glass container (hoist `SystemPresentation` above `GlassEffectGroup`, or attach it to a plain sibling anchor), then recheck contrast and placement on the simulator.
- **Basis:** Apple source.

### UX2-W02 (P1, web) Landmarks inspector text over the background extension is below 3:1

- **Where:** `/showcase` Landmarks, inspector open, light and dark.
- **Expected:** only the image extends; foreground content is added after the extension (N05, [Landmarks sample](https://developer.apple.com/documentation/swiftui/landmarks-applying-a-background-extension-effect)); text on glass stays legible (M01) at 4.5:1.
- **Actual:** "A still morning beside the water." measures 2.71:1 median, 1.82 worst decile in light, and 2.19 / 1.67 in dark, over the mirrored and blurred hero. The inspector also shows a hard seam where the mirror ends and a blurred blob of the third card scrolling under it.
- **Reproduce:** open Landmarks.
- **Evidence:** [light](evidence/independent-ui-ux-2/web/scene-landmarks-1440-light.png), [dark](evidence/independent-ui-ux-2/web/scene-landmarks-1440-dark.png), [row scrolled](evidence/independent-ui-ux-2/web/landmarks-row-scrolled.png); [probes/t10.mjs](evidence/independent-ui-ux-2/probes/t10.mjs).
- **Location:** [liquid-glass-02.tsx:61](../../src/components/blocks/liquid-glass-02.tsx) (`BackgroundExtension end={192}`) and `:75` (inspector `Glass variant="liquid"` with `bg-fill`).
- **Correction:** give the inspector enough frost to diffuse the extension (Apple's inspector uses subtler layering than floating controls), use the material's secondary label, and assert 4.5:1 over bright and dark heroes.
- **Basis:** Apple source for contrast; my judgment on the material.

### UX2-S01 (P2, web and native) The System palette is not iOS 27's default appearance

- **Expected:** the palette is described as "Apple's default iOS and macOS appearance: systemBlue on the system greys" ([glass-theme.ts:515](../../src/lib/glass-theme.ts)). [HIG Color > Specifications](https://developer.apple.com/design/human-interface-guidelines/color#Specifications) gives iOS 27 systemBlue as 0,136,255 light and 0,145,255 dark, systemRed 255,56,60 / 255,66,69, systemOrange 255,141,40 / 255,146,48 (spot-checked in the HIG JSON alt text for `colors-unified-blue-light.png`, `-dark.png` and `colors-unified-red-light.png`). `#007AFF` is now the `link` colour. Filled and prominent buttons carry white labels in both schemes. [HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Vision) accepts 3:1 for bold text.
- **Actual (computed on `/` and in the scenes):**
  - accent `#0067D9` light and `#0B84FF` dark ([glass-theme.ts:477-510](../../src/lib/glass-theme.ts)); the spec targets `#007AFF` / `#0A84FF`, the pre-iOS 26 values ([apple-system-defaults.md](../specs/apple-system-defaults.md));
  - dark `primary-foreground` `#0C121A`: "Get started", "Explore the glass" and the Notes Done checkmark are near-black on blue. The spec lists two departures (darker light accent, legible secondary grey); this third one is undocumented;
  - destructive `#E7000B` / `#FF6467` on web and `#E30117` on native, Tailwind reds rather than systemRed; chart orange `#FF9501` is the old value;
  - neutrals mix shadcn greys (`#0A0A0A` background and foreground, `#171717` card, `#262626` secondary, `#E5E5E5` border) with Apple's (`#F2F2F7` ground, `#1C1C1E` dark glass tint).
- **Evidence:** [landing dark](evidence/independent-ui-ux-2/web/landing-1440-dark.png), [Notes dark](evidence/independent-ui-ux-2/web/scene-notes-1440-dark.png), [landing light](evidence/independent-ui-ux-2/web/landing-1440-light.png); values in [apple-criteria.md](evidence/independent-ui-ux-2/apple-criteria.md#colors).
- **Impact:** the default reads as near-iOS rather than iOS 27: a darker blue in light, black-on-blue primary buttons in dark, an orange-red destructive.
- **Correction:** move to the iOS 27 values. For labels on the accent, either adopt Apple's bold 3:1 rule for semibold button labels and use white (white on `#0091FF` is 3.2:1, on `#0088FF` 3.5:1), or keep the AA departure and document it with the other two. Take destructive and chart colours from the same table, and Apple's elevated greys for card/secondary.
- **Basis:** Apple source for values; the label choice is an owner decision between Apple fidelity and the repo's 4.5:1 rule.

### UX2-S02 (P2, native) Two blues on one screen under the System palette

- **Actual:** `nativeControlTheme` leaves `seedColor` unset for System, so system controls take iOS 27 systemBlue ([registry/native/tokens.tsx:143-149](../../registry/native/tokens.tsx)): the Controls slider fill samples `#0088F7`. Custom controls take `#0067D9` from `tokens.generated.ts`: Notes Done `#0065D5`, Maps "Directions" and the Dock's selected tab `#0067D9`.
- **Evidence:** [system slider](evidence/independent-ui-ux-2/native/n-controls-light.png), [custom Done](evidence/independent-ui-ux-2/native/n-notes-light.png), [custom Directions](evidence/independent-ui-ux-2/native/n-maps-sheet-medium.png).
- **Correction:** under System on iOS, resolve the custom accent from `PlatformColor("systemBlue")` (and `systemRed` for destructive) so both paths match the OS.
- **Basis:** Apple source (HIG Color) and consistency judgment.

### UX2-W03 (P2, web) Focus falls to `<body>` after routine actions

- **Expected:** keyboard-only navigation works throughout ([HIG Accessibility, Mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)); dismissing a presentation returns focus to its opener (project design rules, WCAG 2.4.3).
- **Actual:** after each of these, `document.activeElement` is `<body>`:
  - Music: ArrowRight from Library onto the Search tab (the Search trigger unmounts when selected, [liquid-glass-01.tsx:181](../../src/components/blocks/liquid-glass-01.tsx)); clicking the Search tab; the search field's Clear button;
  - Maps: Escape on the place sheet (opened from state, no `SheetTrigger`);
  - Mail: Archive; Cancel, Escape and Send on Compose; opening a message and Back at 390 px;
  - Search: Cancel (the field remounts through `key={mode}`), removing a recent, Clear all, Clear filters.
- **Evidence:** console traces from [probes/t6c.mjs](evidence/independent-ui-ux-2/probes/t6c.mjs), [t8.mjs](evidence/independent-ui-ux-2/probes/t8.mjs), [t14.mjs](evidence/independent-ui-ux-2/probes/t14.mjs); [mail after archive](evidence/independent-ui-ux-2/web/mail-after-archive.png).
- **Impact:** keyboard and switch users restart from the top of the page after each action.
- **Correction:** pass the opener to `onCloseAutoFocus` for state-driven sheets, keep the Search tab trigger mounted, move focus to the next row after archive or removal, and focus the message heading on a compact push.
- **Basis:** Apple source and WCAG; the target of each focus move is my judgment.

### UX2-W04 (P2, web) Maps' layers and location buttons do the wrong thing

"Map layers" opens the place sheet with the title "Map layers", "Portland, Oregon · Open today" and "Start walking route" (`setSelected("Map layers")`, [liquid-glass-01.tsx:230](../../src/components/blocks/liquid-glass-01.tsx)). "Show current location" clears the search query. Evidence: [layers](evidence/independent-ui-ux-2/web/maps-layers-button.png). Correction: open a map-mode menu or popover from the layers button, and recentre or announce from the location button. Basis: judgment on icon meaning and task outcome.

### UX2-W05 (P2, web) Notes' Title and Heading formats look the same

Both render at 17 px / 700 on the note text area; `text-[1.0625rem]` wins over `type-title-1` and `type-title-3` ([liquid-glass-02.tsx:130](../../src/components/blocks/liquid-glass-02.tsx)). Native applies Heading at a larger size. Evidence: [Title](evidence/independent-ui-ux-2/web/notes-format-title.png), [Heading](evidence/independent-ui-ux-2/web/notes-format-heading.png), [native Heading](evidence/independent-ui-ux-2/native/n-notes-heading-edit.png). Correction: drop the fixed size when a style is chosen, or let `glass-cn` merge the type groups. Basis: functional defect.

### UX2-W06 and UX2-N03 (P2, web and native) Compose drafts are kept or lost against the sheet's own wording

- **Expected:** Cancel or Close dismisses without saving; if someone swipes to dismiss with unsaved changes, confirm with an action sheet (P06, [HIG Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets), change log March 24, 2026).
- **Web:** the sheet's description says "Write a message. Cancel discards it." ([liquid-glass-01.tsx:337](../../src/components/blocks/liquid-glass-01.tsx)), but Cancel keeps the draft: reopening shows the typed recipient and body. Cancel and Escape close a non-empty draft without asking. Evidence: [compose](evidence/independent-ui-ux-2/web/mail-compose.png), trace in [probes/t8.mjs](evidence/independent-ui-ux-2/probes/t8.mjs).
- **Native:** compose is a medium-detent system sheet with Subject, body and Save Draft (no recipient or Send, unlike web). Typing "Trail plan" and swiping the sheet down discards it; reopening shows an empty Subject. Its Close control appears as a generic element in the accessibility tree. Evidence: [compose](evidence/independent-ui-ux-2/native/n-mail-compose.png), [keyboard](evidence/independent-ui-ux-2/native/n-mail-compose-keyboard.png).
- **Correction:** clear on Cancel or ask Delete Draft / Save Draft when dirty; on native, block interactive dismissal while dirty and confirm. Align the two tracks' compose contents.
- **Basis:** Apple source.

### UX2-N04 (P2, native) Nonmodal sheets hide under the keyboard and outlive their screen

- **Expected:** Notes formats text while the note is edited behind a nonmodal sheet (P03, [HIG Sheets, Anatomy](https://developer.apple.com/design/human-interface-guidelines/sheets#Anatomy)). A presentation goes away with its screen.
- **Actual:** with Format open, tapping the note raises the keyboard over the sheet; the sheet stays presented but cannot be used until the keyboard closes. The `/native-contracts` inspector behaves the same while its background field is edited (the repeated large-detent rejection itself works: "requests: 1,1", accepted 0). After deep-linking to `/native-contracts` with Format still presented, the Format sheet sits over the unrelated screen. The first review's UX-N18 is still open.
- **Evidence:** [editing behind](evidence/independent-ui-ux-2/native/n-notes-format-during-edit.png), [inspector during edit](evidence/independent-ui-ux-2/native/n-contracts-inspector-edit.png), [after keyboard](evidence/independent-ui-ux-2/native/n-contracts-after-keyboard.png), [over the next screen](evidence/independent-ui-ux-2/native/n-contracts.png), [rejection](evidence/independent-ui-ux-2/native/n-contracts-reject.png).
- **Location:** [registry/native/sheet.tsx](../../registry/native/sheet.tsx) system path; Notes in [registry/native/liquid-glass-02.tsx](../../registry/native/liquid-glass-02.tsx).
- **Correction:** dismiss when the screen loses focus (a navigation-aware prop or `useFocusEffect` in the block). For format-while-typing, keep the small detent above the keyboard or move formatting into a keyboard accessory.
- **Basis:** Apple source for P03; the keyboard treatment is my judgment.

### UX2-N05 (P2, native) Safari's expanded address wraps at the default text size

The 118 pt address field shows "fieldnotes.examp" and "le" on two lines ([registry/native/liquid-glass-01.tsx:362](../../registry/native/liquid-glass-01.tsx)). Evidence: [crop](evidence/independent-ui-ux-2/native/n-safari-address-wrap.png), [full](evidence/independent-ui-ux-2/native/n-safari-light.png). Correction: one line with middle truncation; give the field the Reading List button's width at compact sizes. Basis: judgment (Safari shows one line).

### UX2-N06 (P2, native) Search breaks at the largest accessibility size

At `accessibility-extra-extra-extra-large` the scope labels break mid-word ("Plac / es", "Not / es"), the "Clear" button's frame is x 364 to 472 on a 402 pt screen, and "Search now" is clipped ([registry/native/liquid-glass-02.tsx:146-150](../../registry/native/liquid-glass-02.tsx)). Evidence: [scope and Clear](evidence/independent-ui-ux-2/native/n-ax5-search-scope.png), [header](evidence/independent-ui-ux-2/native/n-ax5-search.png), [AX5 contact sheet](evidence/independent-ui-ux-2/native/n-ax5-contact.png). Expected: text grows without hiding essential controls ([HIG Typography](https://developer.apple.com/design/human-interface-guidelines/typography#Ensuring-legibility)). Correction: wrap the header row and stack the scope bar vertically from `fontScale ≥ 1.35`, as Materials already does. Basis: Apple source.

### UX2-N07 (P2, native) Accessibility-tree gaps

The accessibility tree shows: Controls' system Brightness slider with an empty label and a raw 0 to 1 value ([liquid-glass-01.tsx:478](../../registry/native/liquid-glass-01.tsx)); Dock tabs with inconsistent roles, Home and Radio as buttons, Library and Search as generic elements, none with a tab or selected trait in some states ([registry/native/dock.tsx:249](../../registry/native/dock.tsx), `accessibilityRole="tab"`); Mail rows that omit unread and flagged state ("Read The September journal from Field Notes" for an unread message); the Expo Go sandbox gear exposed as an image. VoiceOver itself was not run. Correction: label the slider host and give a percentage value, map Dock tabs to a button role with a selected trait (or use NativeTabs), include "Unread" and "Flagged" in row labels. Basis: [HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) and the project's "no information by colour alone" rule.

### UX2-W07 (P2, web) Secondary and unselected labels are below 4.5:1 at the default clarity

Measured at clarity 0.5, light: Controls' unselected segments 3.70:1 (worst 3.21); Materials "Standard material" on ultraThin 2.44 (worst 2.19); "Secondary foreground" on large regular glass 3.69; Photos' 12 px date 3.79 (the probe excludes its text shadow, so the real value is somewhat higher). Dark passes except ultraThin at 5.06 with a worst decile of 4.47. Apple's thin materials use vibrant labels ([HIG Materials, iOS](https://developer.apple.com/design/human-interface-guidelines/materials#iOS-iPadOS)). Evidence: [materials](evidence/independent-ui-ux-2/web/scene-materials-1440-light.png), [controls](evidence/independent-ui-ux-2/web/controls-expanded.png), [probes/t10.mjs](evidence/independent-ui-ux-2/probes/t10.mjs). Location: `text-muted-foreground` in [segmented-control.tsx](../../src/components/glass/segmented-control.tsx) and the Materials tiles. Correction: compute secondary labels against the material they sit on, or use the primary label on ultraThin and thin. Basis: Apple source and project rule.

### P3 findings

| ID | Platform, scene | Observation and evidence | Location | Correction | Basis |
| --- | --- | --- | --- | --- | --- |
| UX2-W08 | Web, Music | The selected tab label is near-black (`#000C25`); [HIG Color, Liquid Glass color](https://developer.apple.com/design/human-interface-guidelines/color#Liquid-Glass-color) shows a blue selected tab, and native already does. [scene](evidence/independent-ui-ux-2/web/scene-music-1440-light.png), [native](evidence/independent-ui-ux-2/native/n-music-light.png) | `liquid-glass-01.tsx:178` (`text-primary-ink`, 30% accent) | Use the accent for the selected tab's glyph and label | Apple source |
| UX2-W09 | Web, Music at rest | The MiniPlayer and tab bar cover the hero's "Slow mornings" title in the 808×576 frame. [scene](evidence/independent-ui-ux-2/web/scene-music-1440-light.png) | `MusicScene` | Start the list with bottom inset above the bars, or shorten the hero | Judgment |
| UX2-W10 | Web and native, Landmarks badges | Web reorder pulls all labels to the centre where they overlap (200 to 280 ms) and the glass contour detaches from them (320 ms); an interrupt overlaps again. Removal fades the label, then collapses empty glass for about 400 ms, which matches the system materialize order seen on native. Native's system morph also overlaps text mid-reorder. [web 25 fps](evidence/independent-ui-ux-2/web/motion-badges-reverse-25fps.png), [web sequence](evidence/independent-ui-ux-2/web/motion-badges-add-reverse-interrupt-remove-12fps.png), [native](evidence/independent-ui-ux-2/native/n-landmarks-badge-motion.png) | `glass-morph.tsx` | Move each badge along its own path instead of through a collapsed union; Apple's sample uses icon badges | Judgment |
| UX2-W11 | Web, RTL | Music's tabs stay left-to-right (Radix Tabs `dir`); Photos' previous/next chevrons are not mirrored. First review's UX-W15 still open. [music](evidence/independent-ui-ux-2/web/rtl-music.png), [photos](evidence/independent-ui-ux-2/web/rtl-photos.png) | `liquid-glass-01.tsx` | `DirectionProvider`, `rtl:-scale-x-100` on directional glyphs | Judgment |
| UX2-W12 | Web, `/docs/action-sheet` | Always shows Cancel and makes the page inert, even when placed by its trigger; P04 says inline sheets have no Cancel and the rest stays usable. [1440](evidence/independent-ui-ux-2/web/action-sheet-1440.png) | `action-sheet.tsx` | An anchored mode without Cancel and without `inert` | Apple source |
| UX2-W13 | Web, scenes | Safari's "Back to top" uses a back chevron (`liquid-glass-01.tsx:260`); Landmarks' "Activity badges" adds a badge instead of navigating and "Saved places" is always pressed (`liquid-glass-02.tsx:67`); Notes undo removes one keystroke at a time; Notes' date uses "10 November 2026 at 09:41" beside US times elsewhere | Both blocks | Distinct glyph; real sidebar selection; coalesced typing undo | Judgment |
| UX2-N08 | Native, several | A disabled destructive action in the system dialog draws full red while the tree reports NotEnabled ([contracts](evidence/independent-ui-ux-2/native/n-as-open.png)); the active Controls tool glyph almost disappears ([tools](evidence/independent-ui-ux-2/native/n-controls-tools.png)); Mail's "Updated Just Now" overlaps list text with no edge treatment ([mail](evidence/independent-ui-ux-2/native/n-mail-light.png)); Search's Clear is an underlined link ([search](evidence/independent-ui-ux-2/native/n-search-light.png)); Materials' "Dark media" is a flat black fill; the Maps panel covers a pin that stays in the tree ([maps](evidence/independent-ui-ux-2/native/n-maps-light.png)) | Native blocks | Omit disabled actions from system dialogs; bottom scroll edge behind Mail's toolbar; plain text button for Clear | Judgment |
| UX2-H01 | Site and docs | Social links use `outline-none` with a box-shadow ring, which forced colours remove (`site-header.tsx:33`; [accessibility rule 2](../rules/accessibility.md)); the Studio keeps a static `role="dialog"` "Example dialog" in the page; the Studio quote has a left accent rail ([studio](evidence/independent-ui-ux-2/web/themes-1440-light.png)); the installation guide installs `theme-dusk` and Aurora while System, with no aurora, is the default (`src/app/docs/installation/page.tsx`) | Site | `glass-focus`; drop the static dialog role; System in the install steps | Project rule |
| UX2-H02 | Native sandbox and tests | A forced Reduce Motion from `still=1` survives later deep links that omit it (`sandbox/native/src/sandbox/theme.tsx:57-63`), which silently stills motion checks; Expo Go's floating tools button covers the top-right of large-detent sheets and opened the dev menu twice when I tapped Close and Archive; density and type rows each show two "default" chips; `e2e/glass-morph.coverage.spec.ts:92` failed once in the parallel run and passed three times alone | Sandbox, e2e | Reset forced settings on each deep link; note the Expo Go button in `docs/sandbox.md`; dedupe chips; give the test a deterministic start | Judgment |

## Reported header issue

Not reproduced. At 320, 390, 768, 900, 1024, 1200, 1280 and 1440 px, `/` and `/themes` had `scrollWidth == clientWidth`, every visible header control inside the viewport and no overlapping controls. The install snippet scrolls inside its own box. The compact Menu (below 1280 px) lists Showcase, Docs, Components, Studio, Theming and Native; Enter on the Menu button opens it with focus on its close button, Escape and an outside click close it with focus back on Menu, and choosing Showcase navigates and closes it. At 200% zoom (640 CSS px) `/`, `/showcase` and `/themes` do not scroll sideways. Evidence: [home 320](evidence/independent-ui-ux-2/web/width-home-320.png), [themes 320](evidence/independent-ui-ux-2/web/width-themes-320.png), [home 1200](evidence/independent-ui-ux-2/web/width-home-1200.png), [themes 1280](evidence/independent-ui-ux-2/web/width-themes-1280.png), [menu 1024](evidence/independent-ui-ux-2/web/menu-open-1024.png), [zoom 200](evidence/independent-ui-ux-2/web/zoom200-showcase-mail.png).

## Comparison matrix

**verified**: seen working at runtime in this review. **partial**: custom approximation or only part of the behavior. **missing**: no demonstration. **unavailable**: no bridge or platform target. **unverified**: not exercised in this pass. On native, "system" means iOS renders it; "custom" means React Native composes it, with or without system glass inside. Criteria and sources for each ID: [apple-criteria.md](evidence/independent-ui-ux-2/apple-criteria.md#case-table).

| ID | Behavior | Web | Native (iOS 27 simulator) | Observed example and evidence |
| --- | --- | --- | --- | --- |
| M01 | Regular glass adjusts luminosity for legibility | partial: CSS diffusion, labels follow the scheme only; fails at clarity 0 (UX2-W01) | verified (system untinted glass) | [web clarity 0](evidence/independent-ui-ux-2/web/stress-clarity0-music.png), [native Music](evidence/independent-ui-ux-2/native/n-music-light.png) |
| M02 | Clear over media; 35% dim for bright, none for dark | verified (custom): bright 0.35, dark none, pre-dimmed; Photos dims bands | partial: system clear glass, composed dim; "dark media" is a flat fill | [web materials](evidence/independent-ui-ux-2/web/scene-materials-1440-light.png), [native](evidence/independent-ui-ux-2/native/n-materials-light.png) |
| M03 | Four standard content materials | partial: four custom tiers; secondary 2.4:1 on ultraThin (UX2-W07) | verified (system materials); label vibrancy not checked | Materials tiles |
| M04 | Larger glass reads thicker | partial: static small vs large only | unverified (system-owned) | Materials "Regular · small/large" |
| M05 | Small bars flip, large surfaces don't | missing: no backdrop-driven label change | unverified: no backdrop sweep | [web clarity 0](evidence/independent-ui-ux-2/web/stress-clarity0-music.png) |
| M06 | One tinted primary action, scheme and contrast variants | partial: Notes Done tinted; dark glyph near-black (UX2-S01); selected tab not tinted (UX2-W08) | partial: custom tint `#0067D9`, not the OS blue (UX2-S02) | [web Notes dark](evidence/independent-ui-ux-2/web/scene-notes-1440-dark.png), [native Notes](evidence/independent-ui-ux-2/native/n-notes-light.png) |
| M07 | Vibrant semantic labels inside glass | partial: fixed label tokens | partial (custom `GText` semantic colours, not vibrancy) | Materials secondary/tertiary |
| M08 | Touch stronger than trackpad | unverified: pointer only | unverified: simulator pointer | none |
| G01 | Container spacing blends siblings | partial: union mask; lab rendered, approach not instrumented | partial: system container in Photos' bottom bar; approach not exercised | [docs cluster](evidence/independent-ui-ux-2/web/doc-glass-cluster.png) |
| G02 | Badges insert/remove/reorder with identities | partial (custom): stable IDs, overlapping labels mid-reorder (UX2-W10) | verified (system `glassEffectID`, Reduce Motion off) | [web](evidence/independent-ui-ux-2/web/motion-badges-reverse-25fps.png), [native](evidence/independent-ui-ux-2/native/n-landmarks-badge-motion.png) |
| G03 | Identity morphs between shapes | partial (custom WAAPI/FLIP) | verified (system) | same captures |
| G04 | Named unions at rest | missing | unavailable: no Expo bridge | none |
| G05 | Materialize, matched, identity transitions | partial: removal fades content, then collapses glass | partial: system materialize seen on removal; others not bridged | native frames 5000 to 5266 ms |
| G06 | Glass button style for interactive buttons | unavailable (no browser API) | unverified this pass: system buttons present on `/native-contracts`, presses not counted | [contracts](evidence/independent-ui-ux-2/native/n-contracts.png) |
| N01 | MiniPlayer moves inline on minimize | verified (custom) | verified (custom Dock with system glass) | [web](evidence/independent-ui-ux-2/web/music-scrolled-down.png), [native](evidence/independent-ui-ux-2/native/n-music-scrolled.png) |
| N02 | Minimize on scroll down, expand on reverse | verified (custom) | verified (custom Dock) | [web up](evidence/independent-ui-ux-2/web/music-scrolled-up.png), [native back](evidence/independent-ui-ux-2/native/n-music-scrolled-back.png) |
| N03 | Tab bar adapts to sidebar, section state kept | missing | missing | none |
| N04 | Edge sidebar, accent icons, content beneath | verified: Mail, Landmarks, docs Sidebar | unverified: iPhone compact has no sidebar | [mail](evidence/independent-ui-ux-2/web/scene-mail-1440-light.png), [docs](evidence/independent-ui-ux-2/web/sidebar-doc-closeup.png) |
| N05 | Image-only extension under sidebar/inspector | partial: image extends; inspector text 1.7 to 2.7:1 (UX2-W02) | unverified: no side panels at compact width | [landmarks](evidence/independent-ui-ux-2/web/scene-landmarks-1440-light.png) |
| N06 | Rows scroll under both panels | verified: cards pass under sidebar and inspector | unverified: wide layout only | [row scrolled](evidence/independent-ui-ux-2/web/landmarks-row-scrolled.png) |
| N07 | Inspector linked to selection | verified: Open coast updates it; hide/show works | partial: inline detail at compact width | [coast](evidence/independent-ui-ux-2/web/landmarks-coast.png), [hidden](evidence/independent-ui-ux-2/web/landmarks-inspector-hidden.png) |
| N08 | Inactive window dims glyphs | unverified this pass | unavailable: no `appearsActive` bridge | none |
| N09 | Reflow with window size, state kept | partial: Notes toolbar 1100 to 320 px, Mail split/push | unverified: no resizable window | [notes 320](evidence/independent-ui-ux-2/web/notes-toolbar-320.png), [mail 390](evidence/independent-ui-ux-2/web/compact-390-mail-pushed.png) |
| T01 | Share / Favorite+Collections / Inspector groups | verified | verified | [web](evidence/independent-ui-ux-2/web/scene-landmarks-1440-light.png), [native](evidence/independent-ui-ux-2/native/n-landmarks-light.png) |
| T02 | Avatar item without shared glass | missing | missing | none |
| T03 | Undo/Redo keep priority | verified: at 288 px Pin moves to More, Undo/Redo stay | unverified: not resized | [notes 320](evidence/independent-ui-ux-2/web/notes-toolbar-320.png) |
| T04 | Overflow-only actions | verified: Word count only in More | unverified | [overflow](evidence/independent-ui-ux-2/web/notes-overflow-320.png) |
| T05 | Pinned trailing Share | verified at every width | unverified | Notes toolbar sweep |
| T06 | Navigation-bar minimization and insets | partial: Safari address collapse (512 to 256 px) | partial: Safari collapse composition | [web](evidence/independent-ui-ux-2/web/safari-compact.png), [native](evidence/independent-ui-ux-2/native/n-safari-collapsed.png) |
| T07 | 27 automatic scroll edge | partial (custom) | partial (custom); Mail status overlaps rows (UX2-N08) | [native mail](evidence/independent-ui-ux-2/native/n-mail-light.png) |
| T08 | Dense hard edge; registered control groups | partial | partial | none dense |
| S01 | Standard search tab opens a landing page | partial: browse categories, focus drops to body (UX2-W03) | partial: Dock field, no landing page | [web](evidence/independent-ui-ux-2/web/music-search-destination.png) |
| S02 | Prominent search focuses immediately | verified: Search now focuses with Cancel | unverified this pass | [search now](evidence/independent-ui-ux-2/web/search-now.png) |
| S03 | Mail toolbar search adapts to neighbours | missing | missing | none |
| S04 | Inline, visibly scoped local search | verified: "Filter this library" | partial: regular width only | [search](evidence/independent-ui-ux-2/web/scene-search-1440-light.png) |
| S05 | Split-view search keeps the detail | partial: detail column follows results | partial | same |
| S06 | Sidebar-local search | partial: "Find a folder" | unverified at compact width | same |
| S07 | Recents, completions, scopes, tokens | verified: remove recent, Clear, bold completion, scope token removal | partial: breaks at AX5 (UX2-N06) | [scope token](evidence/independent-ui-ux-2/web/search-scope-notes.png), [native AX5](evidence/independent-ui-ux-2/native/n-ax5-search-scope.png) |
| S08 | No-results view, clear, Cancel | verified: "No Results" with the query, Clear filters, Escape clears | unverified this pass | [empty](evidence/independent-ui-ux-2/web/search-empty.png) |
| P01 | Menus and popovers grow from source | partial: not instrumented this pass | unverified: system menus not opened | Photos menus |
| P02 | Inset partial sheet, opaque anchored full height | verified: medium is inset glass (alpha 0.68), large is opaque and full height | verified (system detents) | [web medium](evidence/independent-ui-ux-2/web/maps-sheet-medium.png), [web large](evidence/independent-ui-ux-2/web/maps-sheet-large.png), [native large](evidence/independent-ui-ux-2/native/n-maps-sheet-large.png) |
| P03 | Nonmodal format sheet while editing | partial: parent editable, whole-note formatting, Title equals Heading (UX2-W05) | partial: keyboard covers the sheet; it outlives the screen (UX2-N04) | [web](evidence/independent-ui-ux-2/web/notes-format-heading.png), [native](evidence/independent-ui-ux-2/native/n-notes-format-during-edit.png) |
| P04 | Anchored without Cancel; centred with Cancel | partial: Photos menu anchored without Cancel; docs ActionSheet always modal with Cancel (UX2-W12) | partial: system dialog at the bottom, not at source; Photos variant illegible (UX2-N01) | [web photos](evidence/independent-ui-ux-2/web/photos-delete-menu.png), [native](evidence/independent-ui-ux-2/native/n-photos-delete-2.png) |
| P05 | Sparse, consistent menu icons | verified: Photos menus | unverified | [menu](evidence/independent-ui-ux-2/web/photos-delete-menu.png) |
| P06 | Cancel/Done semantics; confirm unsaved swipe | partial: Cancel keeps the draft it says it discards (UX2-W06) | missing: swipe discards without confirmation (UX2-N03) | [web](evidence/independent-ui-ux-2/web/mail-compose.png), [native](evidence/independent-ui-ux-2/native/n-mail-compose.png) |
| C01 | Thumb lifts into glass while held | verified (custom lens: translucent, 36 to 41 px) | verified (system slider) | [web held](evidence/independent-ui-ux-2/web/controls-slider-held.png), [native held](evidence/independent-ui-ux-2/native/n-controls-slider-held.png) |
| C02 | Ticks and neutral origin | verified: Balance | verified visually: Balance ticks | [native materials](evidence/independent-ui-ux-2/native/n-materials-light.png) |
| C03 | Thumbless slider | verified: Progress | partial: custom track | same |
| C04 | Concentric nested shapes | verified: Control inset | unverified this pass | Materials |
| C05 | Keyboard and VoiceOver reachability | partial: all reachable; focus lost in eight flows (UX2-W03); arrow keys move but don't select segments | partial: tree gaps (UX2-N07); VoiceOver not run | probes |
| A01 | Reduce Transparency, Increase Contrast keep legibility | verified: frost 0.68 to 0.92 live with a sheet open; `prefers-contrast` raises labels | verified for OS Increase Contrast on Photos (system glass darkens); library-forced fallback opaque | [web](evidence/independent-ui-ux-2/web/maps-sheet-reduce-transparency.png), [native](evidence/independent-ui-ux-2/native/n-contrast-and-forced-contact.png) |
| A02 | Show Borders | verified (viewer preference) | unavailable: no macOS target | [borders](evidence/independent-ui-ux-2/web/stress-borders-controls.png) |
| A03 | Reduce Bright Effects | unverified this pass (preference present) | unavailable bridge | none |
| A04 | Reduce Motion | verified: reduced-motion captures still | partial: library-forced only; OS setting not toggled | static captures |
| A05 | User Liquid Glass look slider | partial: glasscn clarity; Clear end illegible (UX2-W01) | unverified: system-owned, no simulator control | [clarity](evidence/independent-ui-ux-2/web/clarity-0-vs-0.5-vs-1.png) |
| X01 | One prominent tab (no longer Beta) | missing | missing | none |
| X02 | iPhone Duo vertical bars (27.1) | unavailable | unavailable | none |
| X03 | tvOS focus glass | unavailable | unavailable | no target |
| X04 | visionOS spatial glass | unavailable | unavailable | no target |
| D01 (new) | Default system colours, iOS 27 values ([HIG Color, Specifications](https://developer.apple.com/design/human-interface-guidelines/color#Specifications)) | partial: older blue, Tailwind red, dark label on accent (UX2-S01) | partial: system controls correct, custom controls not (UX2-S02) | [landing dark](evidence/independent-ui-ux-2/web/landing-1440-dark.png) |
| L01 (new) | Selected tab uses the tint ([HIG Color, Liquid Glass color](https://developer.apple.com/design/human-interface-guidelines/color#Liquid-Glass-color)) | missing in Music (UX2-W08) | verified | [native Music](evidence/independent-ui-ux-2/native/n-music-light.png) |

## Previous conclusions, rechecked

Confirmed from the first review and its fix spec: `/themes` opens at the top at every width; scene sheets stay inside their frame; no console errors on `/showcase`; Music's minimize order on both tracks; Mail's split view and compact push; the Notes and Landmarks rebuilds; one header control size; no header overflow. The search field's text does scale at the largest size now, so UX-N16 looks resolved in [this capture](evidence/independent-ui-ux-2/native/n-ax5-search.png).

Overturned or narrowed:

- **Native confirmation dialogs "look right" and P04 native "verified".** The contracts screen's dialog does; the Photos Delete dialog is illegible, and neither is placed at its source (UX2-N01). A disabled destructive action looks enabled (UX2-N08).
- **C05 web "verified for keyboard".** Reachability holds, focus restoration does not (UX2-W03).
- **P06 web "verified after fix".** Cancel's behavior contradicts its own description and nothing confirms a dirty draft; native loses the draft on swipe (UX2-W06, UX2-N03).
- **M06 web "verified".** True in light; in dark the Done glyph is near-black, and the selected Music tab is not tinted (UX2-S01, UX2-W08).
- **A05 and the verification record's "selected full/intermediate clarity states".** Those cover clear labels at 0.65 to 1. The Clear end on regular glass was not covered and fails (UX2-W01).
- **UX-W14 "extension shows as a faint grey band".** The extension is visible now; the problem is foreground contrast on top of it (UX2-W02).
- **UX-N18** is still open and has a second symptom, keyboard occlusion while editing (UX2-N04). **UX-W15** is still open and also affects Photos' chevrons (UX2-W11).
- **"Every native capture used `still=1`".** The sandbox keeps a forced Reduce Motion across later deep links (UX2-H02). It was still on when this session started, so any motion judgment taken after a `still=1` link in that app session saw no motion. I turned it off for the motion pass and found the system morph running.
- **The first review's "not tested" list.** WebKit and Firefox now render Photos, Music and Landmarks with the CSS material and no errors ([webkit](evidence/independent-ui-ux-2/web/engine-webkit-landmarks.png), [firefox](evidence/independent-ui-ux-2/web/engine-firefox-music.png)); 200% zoom has no sideways scroll.
- **[apple-system-defaults.md](../specs/apple-system-defaults.md)** names `#007AFF` / `#0A84FF` as systemBlue. iOS 27's HIG gives `#0088FF` / `#0091FF`; `#007AFF` is the link colour (UX2-S01).
- **The catalogue.** X01's `TabRole.prominent` no longer carries a Beta flag; M05, G06, N07, T07 and A05 timestamps, and the T02, T08, C01, A01, A04 sources, are corrected in [apple-criteria.md](evidence/independent-ui-ux-2/apple-criteria.md#corrections-to-the-catalogue).

Declared limitations, judged: web optics as an approximation is a legitimate scope limit and is described that way in [liquid-glass.md](../liquid-glass.md). The missing named-union and transition-policy bridges are a missing capability, stated honestly. Whole-note formatting in Notes is a scope limit, but the scene's text ("the note stays editable behind it") overstates native, where the keyboard covers the sheet. No AppKit, tvOS or visionOS target is a scope limit. The `system` palette description ("Apple's default iOS and macOS appearance") is misleading documentation until UX2-S01 is resolved.

## Evidence and coverage

**Web scenes:** all ten at 1440 light and dark; Mail, Landmarks, Search and Music at 390; Photos, Music and Landmarks in WebKit and Firefox; Photos, Music, Mail and Notes in RTL; Music and Controls in forced colours. Tasks: Photos favorite, next, Delete menu (Escape returns focus to Delete), delete, Info, options; Music scroll down and up, pause, Search destination, no-results, Clear; Maps search, select, medium to large and back, Escape, layers; Safari scroll, expand and edit the address, Reader, Back to top; Mail open, flag, Flagged folder, archive, compose, Cancel and reopen, Escape, Send, sidebar toggle, compact push and Back; Controls expand, slider hold, drag and release outside, switch by keyboard, segments by keyboard; Landmarks select, row scroll, inspector hide/show, badge add, reverse, interrupt, remove, sidebar items; Notes Format, edit behind, Title/Heading/Body/Monostyled, Undo, Redo, Done, reopen, Escape, Share (clipboard fallback), widths 1100 to 320 with More; Search Search now, prediction pick, Cancel, Browse, Notes scope and token removal, local and folder filters, empty results, Clear filters, remove recent, Clear all, Escape. Docs: the nine requested pages captured; Action sheet (outside click and Escape restore focus), Sheet detents and inspector, Sidebar.

**Motion:** web badge motion recorded at 25 fps (uninterrupted reverse) and 12 fps (add, reverse with a second reverse 170 ms later, remove), frames in the two `motion-badges-*` grids. Native badge motion recorded with `simctl io recordVideo` after turning off the forced Reduce Motion: 473 frames, add, double reverse, remove, grid in `n-landmarks-badge-motion.png`. A first native recording under the forced setting had only seven frames (instant swaps), which is how I found the persisted preference. Slider hold captured mid-gesture on both tracks.

**Native scenes:** all ten in light and dark (dark through `scheme=dark` on an OS-dark simulator), Music, Safari, Mail, Notes, Search and the `/c/sheet` small detent at `accessibility-extra-extra-extra-large`, Photos and Music under OS Increase Contrast and under forced Reduce Transparency plus Increase Contrast, `/native-contracts` (background editing, repeated rejection) and `/action-sheet-contracts` (actions, disabled destructive, Cancel).

**Commands run** (repo root, `PATH=/tmp/glasscn-tooling/node_modules/.bin:$PATH`):

| Command | Result |
| --- | --- |
| `git rev-parse HEAD`, `git status --short` at start and end | `d896a3d`; 278 entries both times, no incidental generator changes |
| Playwright probes in [`probes/`](evidence/independent-ui-ux-2/probes/) against `http://localhost:3027` | Captures and measurements above. `contrast.mjs` hides a label, screenshots what is behind it and reports median and worst-decile contrast |
| `E2E_BASE_URL=http://localhost:3027 pnpm exec playwright test e2e/site-width.spec.ts e2e/glass-morph.coverage.spec.ts e2e/action-sheet.behavior.spec.ts --project=chromium` | 11 passed, 1 failed: `glass-morph.coverage.spec.ts:92` (no transform animation seen within 5 s) |
| Same spec, `-g "Reduce Motion stops" --repeat-each=3` | 3 passed. Flaky under four parallel workers |
| `idb ui describe-all / tap / swipe / text`, `xcrun simctl io screenshot / recordVideo`, `xcrun simctl ui appearance / content_size / increase_contrast` | Native evidence; settings restored and re-read |
| `curl` of the HIG Color JSON | Spot check of the systemBlue and systemRed values used in UX2-S01 |

The Apple source pass was delegated to a helper that fetched the documentation JSON, HIG JSON and WWDC transcripts and wrote [apple-criteria.md](evidence/independent-ui-ux-2/apple-criteria.md). It also read semantic colour values by running a small UIKit program in the booted iOS 27 simulator through `simctl spawn`; that did not change simulator settings. I spot-checked the colour values it reported.

Not run: `pnpm typecheck`, `pnpm lint`, `pnpm test`, native Jest, the liquid-surfaces specs, the full browser suite, `verify:install` and `verify:native` (excluded for this session). The earlier totals (339 root, 325 native, 289 browser) are prior results, not re-established here.

**Remaining uncertainty:** the cause of UX2-N01 (the glass container is my suspicion, not confirmed); whether the Dock's role inconsistency changes what VoiceOver announces; how the native Format sheet behaves on a device keyboard; iPad and regular-width native layouts, where N04 to N07, S05 and S06 apply.

## Fix order

1. **Keep regular-glass labels legible at every clarity (UX2-W01, UX2-W07).** Check: with the contrast probe, Controls' unselected segment, Music's MiniPlayer title and Materials' ultraThin secondary label measure at least 4.5:1 median and 3:1 worst decile at clarity 0, 0.5 and 1 in both schemes, and the legibility test covers clarity 0.
2. **Make the Photos Delete confirmation legible and attached to Delete (UX2-N01).** Check: on the iOS 27 simulator the "Delete Photo" label measures at least 4.5:1 against its own background, the dialog's frame is adjacent to the trash button's frame, and Delete still removes the photo.
3. **Bring the System palette to iOS 27 and use it on both native paths (UX2-S01, UX2-S02).** Check: computed `--primary` and `--destructive` match the HIG table (or a documented AA variant), prominent labels in dark are white or the departure is written into the spec, and on native the custom accent sampled next to a system slider is within ΔE 2 of it.
4. **Restore focus and honour draft semantics (UX2-W03, UX2-W06, UX2-N03).** Check: a Playwright script asserts `document.activeElement !== document.body` after each action listed in UX2-W03; Cancel on a non-empty web draft either clears it or asks; on native, swiping a dirty compose sheet shows a confirmation and keeps the text when cancelled.
5. **Fix the Landmarks inspector and the nonmodal sheet lifecycle (UX2-W02, UX2-N04).** Check: the inspector's secondary label measures at least 4.5:1 worst decile in both schemes; on native, the Format sheet is dismissed when its screen loses focus and stays visible above the keyboard while the note is edited at the small detent.

After these: Maps' layers and location actions (UX2-W04), Notes' Title style (UX2-W05), Safari's address wrap (UX2-N05) and Search at the largest size (UX2-N06), each a contained change.

## Dispositions after the fix pass

Applied in the same session after this review was written. Measurements use this review's own probes against the restarted dev server; native checks ran on the same iOS 27 simulator.

| ID | Status | What changed | Check |
| --- | --- | --- | --- |
| UX2-W01 | Fixed | The clear end of Clarity keeps half the frost (`registry/stylesheet.mjs` `clarity()`); unselected segments use the primary label, as iOS does | Clarity 0: MiniPlayer 4.74:1, Controls segment 5.78, title 6.76 (were 2.29, 1.27, 2.85) |
| UX2-N01 | Fixed | Delete's anchor sits outside the merged clear-glass group; the last photo has no Delete | The confirmation opens beside the trash button with a legible red action ([after](evidence/independent-ui-ux-2/after/n-photos-delete.png)) |
| UX2-W02 | Fixed | Inspector on the thick tier, sidebar on the strong tier | Inspector secondary 7.18:1 light, 10.05:1 dark (were 2.71, 2.19) |
| UX2-S01 | Fixed, with one stated departure | Native iOS uses the exact iOS 27 table (systemBlue `#0088FF`/`#0091FF`, systemRed, Increase Contrast variants) with semibold white labels under the HIG's 3:1 bold rule. The web uses Apple's web blue `#0071E3` (held at 5:1) with white labels, because axe holds every page to WCAG AA; destructive is apple.com's `#E30000`; neutrals are Apple's | [spec](../specs/apple-system-defaults.md) |
| UX2-S02 | Fixed | Custom native controls take the same iOS colours as system controls | |
| UX2-W03 | Fixed | Focus moves to the Search page heading, the field after Clear, the opener after the Maps sheet and compose, the next row after archive, the message heading on a compact push, the row on Back, Search now after Cancel, and the next recent after removal | |
| UX2-W04 | Fixed | Layers opens a map-style menu (Explore, Satellite); location toggles the located state and announces it | |
| UX2-W05 | Fixed | The chosen style sets the size; Body keeps 17 px | |
| UX2-W06 / N03 | Fixed | Web Cancel on a started draft asks Delete Draft / Save Draft; Escape keeps it. Native swipe-away saves to Drafts | |
| UX2-N04 | Fixed | With Format open the note takes focus without the keyboard (`showSoftInputOnFocus`), so the sheet stays usable; sandbox scenes remount when their screen loses focus | Cursor in the note, Format visible, no keyboard ([after](evidence/independent-ui-ux-2/after/n-notes-format-edit.png)) |
| UX2-N05 | Unverified | No change; the single-line field should not wrap and I couldn't reproduce it in this pass | |
| UX2-N06 | Fixed in source | Scope stacks and the Recents header wraps at fontScale ≥ 1.35; Clear is a text button | Not rechecked at AX5 on the simulator |
| UX2-N07 | Fixed in source | The system slider carries an accessibility label and a percentage value; Dock items are single accessible elements with a selected state; Mail rows say unread and flagged | |
| UX2-W07 | Fixed | Secondary label is Apple's `#3C3C43` held opaque; thin material tiles use the primary label | Regular-large secondary 4.97:1, ultraThin 6.59 (were 3.69, 2.44) |
| UX2-W08 | Fixed | Selected Music tab uses the accent, semibold | |
| UX2-W09 | Fixed | Shorter hero at regular width | |
| UX2-W10 | Open, partly by design | No change. Labels crossing mid-swap match the native system morph, which this review also saw overlap. The contour trailing the badges comes from the union mask: it is a data-URL SVG that the browser decodes a frame or more late. Fixing that means drawing the union inline instead of as a `mask-image` | |
| UX2-W11 | Fixed | Directional chevrons mirror in RTL; the site's providers give Radix the direction of `<html dir>` | With `dir="rtl"`, Music's tabs run Home, New, Library from the right (x 904, 738, 571; were left to right) |
| UX2-W12 | Fixed | `ActionSheet placement="source"` opens beside its trigger with no scrim, no Cancel and no `inert`; the docs demo shows both placements. Its destructive row now takes `destructive-ink`: an unlayered `text-primary-ink` rule had overridden it on every liquid surface | `e2e/action-sheet.behavior.spec.ts`: edge within 16 px of the trigger, outside tap and Escape cancel, focus returns on Escape |
| UX2-W13 | Fixed | Back-to-top uses an up arrow; Landmarks sidebar rows select a section; Notes date is US format | Typing undo still records each keystroke |
| UX2-N08 | Partly fixed | No disabled Delete in the system dialog; active tool glyph uses the accent; Mail's bottom bar always sits on its edge; Search Clear is a text button | Maps pin under the panel remains |
| UX2-H01 | Fixed | Social links use `glass-focus`; the Studio example is a group, not a dialog; quote and alert rails removed; the install guide uses `theme-system` and no Aurora | |
| UX2-H02 | Fixed | The flaky Reduce Motion morph test gets a 5 s poll. A deep link's forced settings are released by the next link that leaves them out, while chip settings stay; the reset chip is "unset"; `docs/sandbox.md` notes Expo Go's floating tools button | `sandbox/native/__tests__/sandbox-theme.test.tsx` (fails on the old provider) |
