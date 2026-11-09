# Native track notes (independent UI/UX review 3)

Session log from the native pass. Only captures linked from [the review](../../independent-ui-ux-review-3.md) or named exactly here are kept in this folder; shorthand variants such as `-dark` or `-ax5-b` were pruned to keep the folder small.

## Environment

- Simulator: iPhone 18 Pro, iOS 27.0 (runtime 27.0 - 24A434), UDID 980F1928-1320-4C63-8540-2F5B7BB16651.
- Expo Go 57.0.9 (`glasscn-expo-go-57.0.9.app`, CFBundleShortVersionString 57.0.9), SDK 57.0.0 shown in the dev menu.
- Metro reused at exp://127.0.0.1:8083 (not restarted). Next server untouched.
- Start state recorded: appearance light, content_size large, portrait. Restored at the end: appearance light, content_size large, portrait (never rotated). Expo Go relaunched to the sandbox root so forced a11y state from deep links is cleared.
- Tools: idb `ui describe-all/tap/swipe/text/key`, `simctl io screenshot/recordVideo`. Evidence in `docs/research/evidence/independent-ui-ux-3/native-*` (700px, 128-colour). Raw captures and full-rate frames in `/tmp/uxr3/native-raw/`.
- Environment quirk: Expo Go's floating Tools (gear) button sits over the top-right of every screen at (330-382, 58-110 pt). Twice my taps on scene controls under it opened the Expo dev menu. Not a glasscn defect, but it hides sheet Close buttons at large detents in screenshots.
- Scenes are embedded in a scrolling sandbox page under a native-stack header. Controls scrolled under the header are not tappable (normal UIKit hit testing), so scene chips were switched by deep link.

## Per-scene table

| Scene | Light/dark | Tasks done | Result | Evidence |
| --- | --- | --- | --- | --- |
| Photos | light, dark (scheme), forced RT+HC | swipe next, favorite per photo, system menu (Show Info, Next), info sheet open/close, delete dialog passive dismiss, delete 3->2 | All tasks work; one action per activation; system menu + popover-anchored ConfirmationDialog | native-photos-light(-controls,-swiped), -menu, -info-sheet, -delete-dialog, -after-delete, -dark, -forced-rt-hc, -forced-rt-sheet |
| Music | light, dark | scroll down/up, minimize/expand dock, play/pause, Library tab, Search open, query, empty query, Clear, Cancel; AX5 | Minimize/accessory inline works; search is a floating panel over Home, not a destination; AX5 chrome covers the scene (N-3) | native-music-light(-top,-scrolldown,-scrollup), -search-open/-results/-empty, -after-cancel, -dark, -dark-tabbar-crop, -ax5, -ax5-b, -forced-rt-hc |
| Maps | light, dark | pin select, Directions/Hide route, sheet half->large->half->dismiss, search with keyboard, Cancel, empty results + submit | Sheet geometry is system; keyboard covers search card and results (N-2); place sheet is modal over a second persistent card (N-11) | native-maps-light, -place-sheet, -directions, -sheet-large, -after-dismiss, -search, -after-cancel, -empty, -dark |
| Safari | light, dark | scroll collapse/expand, edit address + Go, Open Tabs sheet + switch article | Address wraps at default size (N-4); editing does not expand or select-all (N-10); no Reader (N-9) | native-safari-light, -address-wrap-crop, -collapsed, -editing, -tabs-sheet, -dark |
| Mail | light, dark | open message, flag/unflag, archive, Mailboxes sheet, Archive mailbox, compose, swipe away -> Drafts; AX5 | All tasks work; "Updated Just Now" overlaps list rows (N-6), worse at AX5 | native-mail-light, -status-overlap-crop, -message, -flagged, -mailboxes-sheet, -compose(-typing), -drafts, -dark, -ax5 |
| Controls | light, dark, OS dark, still=1 | slider drag/release (system), held thumb, tools expand/collapse recorded at 30 fps x3 conditions | System slider + glass lens thumb convincing; expand/collapse shows glyph pile-up and unmerged discs (N-8). No switch or segment in this scene | native-controls-light, -slider-held(-crop), -slider-released, -expanded, -expand-frames, -expand-frames-osdark, -expand-still-frames, -expand.mp4, -dark |
| Landmarks | light, dark | select place, favorite, add to collection, add/reverse/remove Summit badge (recorded), tap badge | All work; GlassMorph merges convincingly; selected card barely distinguishable (N-17); no extension at phone width (N-14) | native-landmarks-light, -toolbar, -badges-frames, -badges-after, -dark |
| Notes | light, OS dark, OS live switch, AX5 | open Format (system button), type behind it, Heading, Undo/Redo, More > Word count, Pin, Share, close/reopen, medium detent | Nonmodal system sheet works; Word count/Pin/Saved give no visible feedback (N-5); closing Format pops keyboard over Aa (N-7); per-keystroke undo (N-12) | native-notes-light, -format-open, -edit-behind, -after-typing-behind, -format-heading, -more-menu, -wordcount-feedback, -pinned, -share, -keyboard-hides-aa, -format-reopen, -format-medium, -os-*, -ax5-* |
| Search | dark, light (OS dark), AX5 | Browse vs Search now, predictions, suggestion pick, Places token, token remove, empty results, Clear filters, recents remove + Clear, Cancel | All work; suggestions push the field down (N-13); "Search now" clipped at AX5 (N-15) | native-search-dark, -now, -predictions, -suggestion-picked, -token, -empty, -after-cancel, -light-osdark, -ax5 |
| Materials | light (OS dark), dark | four tiers, regular small/large, Dark/Bright content toggle, three media cases, balance slider held, progress, inset | Tiers render as system materials and follow forced scheme; progress slider absent from AX (N-1) | native-materials-light-osdark, -media, -sliders, -balance-held(-crop), -dark-darkcontent |

Standalone routes: /native-contracts (+?part=custom), /action-sheet-contracts, /c/action-sheet, /c/sheet at AX5, /tokens, /tabs-layout, /c/toolbar-commands, /c/glass-morph, /c/background-extension, /c/switch. Evidence: native-contracts-*, native-asc-*, native-actionsheet-*, native-sheet-ax5-*, native-tokens, native-tabs-*, native-toolbar-commands*, native-background-extension, native-switch-demo, native-switch-ax.json, native-contracts-buttons-ax.json.

## Findings

Severity: P0 unusable task, P1 major access/usability/fidelity, P2 limited reproducible, P3 polish. "Apple" = documented Apple behaviour; "judgment" = mine.

### N-1 Progress slider is invisible to VoiceOver (P1, judgment + WCAG)
- Repro: `exp://127.0.0.1:8083/--/c/liquid-glass-02?scene=materials&scheme=light`, scroll to "Progress · 35%". `idb ui describe-all` lists "Neutral balance" and "Control inset" sliders but no "Playback progress" element at all.
- Cause: `variant="progress"` sizes the accessible Knob to 0x0 (`registry/native/slider.tsx:332`, `hidden ? 0 : KNOB`); iOS drops zero-size accessibility elements. The comment says it avoids opacity, but the result is the same.
- Evidence: native-materials-sliders.png (AX list in notes above).

### N-2 Maps: keyboard covers the search card and its results (P1, judgment)
- Repro: `.../c/liquid-glass-01?scene=maps&scheme=light`, scroll page so the card is visible, tap "Search Maps", type "gold". The field is half under the keyboard and the result list is fully under it; Cancel is half covered. Results are only visible after Return.
- Cause: bottom-anchored `Glass` card with no keyboard avoidance (`registry/native/liquid-glass-01.tsx:303`). Music and Safari bars ride the keyboard; Maps doesn't.
- Evidence: native-maps-search.png.

### N-3 Music at largest accessibility text: chrome covers the whole scene (P1, judgment)
- Repro: `xcrun simctl ui <udid> content_size accessibility-extra-extra-extra-large`, `.../c/liquid-glass-01?scene=music&scheme=light`. Mini player (title truncated "A little..."), the vertical AccessibleMusicNavigation list and the Search button fill ~90% of the 620 pt scene. The song list shows only "without a plan" between the list and Search. Swipes on the scene scroll the outer page, so the content can't be reached.
- Cause: fixed `height = 620` (`liquid-glass-01.tsx:47`) plus expanded-only AX navigation (`:242`) inside `Dock` (`:229`); the dock doesn't minimize because the inner list can't be scrolled.
- Evidence: native-music-ax5.png, native-music-ax5-b.png.

### N-4 Safari: address capsule wraps the domain onto two lines at default text size (P1 fidelity, judgment)
- Repro: `.../c/liquid-glass-01?scene=safari&scheme=light` (also dark). The capsule reads "fieldnotes.examp / le".
- Cause candidate: `SafariAddressInput` (`liquid-glass-01.tsx:330-334`, used at `:367`) has `minHeight: 48`, `flex: 1`, `textAlign="center"` and no `numberOfLines`/height constraint; on iOS 27 the 118 pt single-line TextInput lays out as wrapped text. Suspicion from source + runtime; not root-caused further.
- Evidence: native-safari-light.png, native-safari-address-wrap-crop.png, native-safari-dark.png.

### N-5 Notes: Word count, Pin and save give no visible feedback (P2, judgment)
- Repro: `.../c/liquid-glass-02?scene=notes&scheme=light`, tap More (…) > Word count. Nothing changes on screen. Pin changes only the accessibility label ("Unpin note"); the pin icon stays identical. Done shows nothing either.
- Cause: results go only to 1x1 `opacity: 0` live regions (`liquid-glass-02.tsx:120-121`); the Pin item has no selected visual.
- Evidence: native-notes-wordcount-feedback.png, native-notes-pinned.png.

### N-6 Mail: "Updated Just Now" overlaps message text (P2; P1 at AX5)
- Repro: `.../c/liquid-glass-01?scene=mail&scheme=light`, scroll page so the scene is in view. The status label is drawn over the last row's preview; the bottom ScrollEdge veil is too weak to separate them. At AX5 the two-line label sits over "The September..." and both are illegible; sender names truncate ("Sam...", "Fiel...") while times stay whole.
- Location: `liquid-glass-01.tsx:428-437` (bottom ScrollEdge size 104 + status label), row layout `:414-418`.
- Evidence: native-mail-light.png, native-mail-status-overlap-crop.png, native-mail-ax5.png.

### N-7 Notes: closing Format summons the keyboard over the Aa button (P2, judgment)
- Repro: open Format, tap the note (caret placed, no keyboard while Format is open by design), close Format with X. The keyboard appears immediately and covers Aa; my next tap aimed at Aa typed "g" into the note.
- Cause: editor stays focused; `showSoftInputOnFocus={!open}` (`liquid-glass-02.tsx:112`) flips to true on close. The Aa anchor doesn't ride the keyboard.
- Evidence: native-notes-keyboard-hides-aa.png.

### N-8 Controls: tools expand/collapse shows glyph pile-up and discs that never merge (P2 fidelity; Apple GlassEffectContainer morph)
- Repro: `.../c/liquid-glass-01?scene=controls&scheme=dark`, tap the sliders button twice while recording. First expand frame shows all five glyphs stacked at the centre before the glass materializes; in OS dark the glyphs float with no glass under them for a frame. Collapse shows five separate overlapping discs sliding to the centre with visible rims, no fusion. Reproduced with OS light and OS dark (so not the forced-scheme fallback in `GlassEffectGroup`). Landmarks GlassMorph (SwiftUI glassEffectId) does fuse.
- Location: `MergeAction` (`liquid-glass-01.tsx:454-466`): glyph `opacity: expanded ? 1 : 0` switches instantly while position springs; each item is an Animated.View-wrapped `Glass` inside `GlassEffectGroup merge` (`registry/native/glass.tsx:288-310`, expo `GlassContainer`). I suspect the container doesn't merge transformed RN-wrapped children.
- With still=1 the change is a single-frame jump (acceptable for Reduce Motion).
- Evidence: native-controls-expand-frames.png, native-controls-expand-frames-osdark.png, native-controls-expand-still-frames.png, native-controls-expand.mp4.

### N-9 Safari: no Reader (P2, missing capability vs the review task)
- The scene has Back, Reading List, address, Reload and an ellipsis that opens "Open Tabs". There's no Reader entry. The ellipsis icon opening tabs (instead of More) also mismatches Safari's icon meaning (P3).
- Location: `liquid-glass-01.tsx:361-375`.

### N-10 Safari: editing the address doesn't expand the field or select the URL (P2, judgment vs Safari)
- Repro: scroll to collapse, tap the pill. The field stays 118 pt between the side buttons, shows "otes.example/alpi", caret placed mid-text (selectTextOnFocus did not select all), autocorrect suggestions shown for a URL. Typing "coast" inserted text into the middle of the URL; navigation still worked only because the matcher uses `includes("coast")`.
- Location: `liquid-glass-01.tsx:367` (no `keyboardType="url"`, `autoCorrect={false}`, layout change on focus).
- Evidence: native-safari-editing.png.

### N-11 Maps: place sheet is modal and stacks over a second persistent search card (P2, judgment vs Maps)
- Repro: tap a pin. The system sheet dims the map (the route you just requested is dimmed), blocks map interaction, and the persistent search card's top edge peeks above the sheet. At rest the card covers 2 of 3 pins (Ocean Beach, Golden Gate Park are under it). The card isn't a sheet, so it can't collapse.
- Location: `InfoSheet` uses default modal `Sheet` (`liquid-glass-01.tsx:80-88`, `:317`); card at `:303`.
- Evidence: native-maps-light.png, native-maps-directions.png.

### N-12 Notes: undo is per keystroke; format changes aren't undoable (P2, judgment)
- Repro: type " Bring water." behind Format; Undo removes one character per tap. Changing Body->Heading isn't in history.
- Location: `edit` pushes every `onChangeText` (`liquid-glass-02.tsx:93`).

### N-13 Search: suggestions render above the field and push it down while typing (P2)
- Repro: `.../c/liquid-glass-02?scene=search&scheme=dark`, Search now, type "Al". The suggestion list appears above the field and the field jumps from y=237 to y=301 pt under the caret.
- Cause: `order: placement === "bottom" ? 0 : 2` (`registry/native/search-field.tsx:113`); React Native's Yoga ignores CSS `order`, so DOM order (suggestions first) wins on iOS.
- Evidence: native-search-now.png, native-search-predictions.png.

### N-14 /c/background-extension shows no extension on iPhone (P2, misleading demo)
- At compact width `Landmarks` passes `start/end = 0` (`liquid-glass-02.tsx:57`), so `BackgroundExtension` mirrors nothing. The route titled "Landmarks image extension" is identical to /c/glass-morph. The extension is a custom mirrored, blurred RN image (`registry/native/background-extension.tsx:13-25`), not SwiftUI `backgroundExtensionEffect`.
- Evidence: native-background-extension.png.

### N-15 Search at AX5: "Search now" is clipped at the right edge (P2)
- Repro: AX5, `.../c/liquid-glass-02?scene=search&scheme=light`. The Browse/Search now row doesn't wrap; "Search now" runs to x=400 of 402 and is cut ("Search now|").
- Location: inner `<View style={{ flexDirection: "row", gap: 8 }}>` at `liquid-glass-02.tsx:163`.
- Evidence: native-search-ax5.png.

### N-16 System Switch drops its accessibility label (P1, WCAG 4.1.2)
- Repro: `.../c/switch`. `<Switch accessibilityLabel="Reminders" />` (system path) is exposed as a switch with `AXLabel: null`; the `size="sm"` and `native={false}` (custom) switches keep their labels.
- Cause: label goes on `Host`, not the SwiftUI control (`registry/native/switch.tsx:49`).
- Same pattern: the system SegmentedControl in Maps is exposed as an unnamed TabGroup; `accessibilityLabel="Place categories"` isn't forwarded (`registry/native/segmented-control.tsx:234-242`). P2.
- Evidence: native-switch-ax.json, native-switch-demo.png.

### N-17 Landmarks: selected place card is barely distinguishable (P3, judgment)
- `fillStrong` vs `fill` (`liquid-glass-02.tsx:65`). Evidence: native-landmarks-toolbar.png.

### N-18 Sandbox scheme ignores live OS appearance changes (P2, sandbox; contradicts rule 4's "follows the OS")
- Repro: relaunch Expo Go with OS dark: picks dark. Then `xcrun simctl ui <udid> appearance light`: the sandbox and its native header stay dark ("system · dark"). Changing OS appearance before a deep link without `scheme` also keeps the old scheme. There's no "system" scheme chip, only light/dark.
- Cause: `useState(system === "dark" ...)` snapshot, always passed explicitly to `GlassThemeProvider` (`sandbox/native/src/sandbox/theme.tsx:48, 89`). Consequence for reviewers: every sandbox capture is a forced scheme; GlassEffectGroup falls back to unmerged views whenever that forced scheme differs from the OS (`glass.tsx:301`).
- Evidence: native-notes-os-dark-noscheme.png, native-notes-os-light-live-switch.png.

### N-19 Native tabs never minimize (P2, doc mismatch)
- Repro: `.../tabs-layout`, scroll the Tonight list down slowly and with a fling. The tab bar and the accessory stay expanded. On-screen copy says "Scroll down: on iOS 26 the tab bar minimizes"; `tabs-layout.tsx:27` documents onScrollDown folding but defaults `minimizeBehavior = "automatic"` (`:32`), which resolved to no minimization here. Possibly also affected by the tabs being pushed inside a stack; not isolated.
- The Search tab shows a top-of-content field, not the iOS 26 bottom search field (judgment).
- Evidence: native-tabs-layout.png, native-tabs-minimized.png, native-tabs-search.png.

### N-20 System ConfirmationDialog silently drops a disabled action (P2)
- Repro: `.../action-sheet-contracts`, Entry options. Source declares Archive, disabled destructive Delete, and Cancel. The popover shows only "Archive entry" (1 action). The library passes `modifiers.disabled` (`registry/native/action-sheet.tsx:123`) but iOS 27 omits it, so users never learn Delete exists. Cancel absence is documented ("system decides").
- Passive dismissal: no action ran; onOpenChange fired true/false; reopen + Archive = exactly 1 action, 2 source presses.
- Evidence: native-asc-open.png.

### N-21 Custom action sheet uses the pre-26 grouped bottom style, not source-anchored (P2 fidelity, Apple iOS 26 action sheets originate from the source)
- `/c/action-sheet` "Share night": grouped rows plus a separate Cancel capsule at the bottom, while the system path on the same screen is a popover from its trigger. Passive outside tap dismisses; Cancel dismisses.
- Evidence: native-actionsheet-custom.png vs native-actionsheet-system.png.

### N-22 Format sheet at AX5 needs vertical then horizontal scrolling to reach a style (P2)
- At AX5 the 0.3 detent shows only "Format" and two words of the description; at medium (max detent) the choices are still below the fold. Scrolling the sheet reveals Title/Heading with Body clipped and Monostyled off to the right. Scrolled text passes under the grabber/Close with no edge effect.
- Location: `liquid-glass-02.tsx:115-118` (detents [0.3, "medium"], long description first, horizontal ScrollView).
- Evidence: native-notes-ax5-format.png, -format-medium.png, -format-scroll-attempt.png.

### Smaller items (P3)
- Photos: Share and Delete corner buttons (both `liquid-clear`) render differently (Share pale, Trash dark) because Delete is outside the GlassEffectGroup (`liquid-glass-01.tsx:142-157`); judgment. Image alt is read twice in the info sheet (image + caption).
- Music: search results float in a card at the bottom under the "Home" heading with a blank area above; Search isn't a destination (judgment vs Music).
- Search: Browse/Search now look identical (aria-pressed only); "Clear filters" is left-aligned under a centred empty state; Cancel disappears after submit.
- Materials: "Dark media" case is a flat black panel, not media; the toggle's label flips to the action ("Bright content") while also reporting pressed; muted text on ultraThin over the desert image is hard to read.
- Tokens: two chips labelled "default" in density and type (unset vs a preset named default).
- native-contracts: `Reject large: true` reads as "Reject large:, true"; custom part still says "Open system inspector"/"System inspector"; the system-path sheet anchor is full width with smaller type while other system glass buttons hug.
- Toolbar commands: "Resize the containing window" isn't actionable on iPhone.
- Notes code comment promises a "bottom Checklist/Aa group"; only Aa exists (`liquid-glass-02.tsx:80`).
- Sheet description line height at AX5 is much looser than body (native-sheet-ax5-system-large.png).
- Forced reduceTransparency is a library-forced preference: glasscn surfaces go opaque but system sheets, menus and the navigation header stay translucent (native-photos-forced-rt-sheet.png). Expected for a forced flag; the /tokens copy "Applies to every screen" overstates it.

## Convincing behaviours

- Photos system menu (UIMenu via @expo/ui MenuView) and the Delete ConfirmationDialog as a popover anchored to the trash button; passive dismissal never deletes; delete runs once (native-photos-menu, -delete-dialog, -after-delete).
- System sheets with real detents, floating inset glass at partial heights, opaque at large, grabber AX values (native-photos-info-sheet, native-maps-sheet-large).
- Controls brightness slider is the SwiftUI slider; the held thumb becomes a system glass lens (native-controls-slider-held-crop). Custom balance slider also lenses while held (native-materials-balance-held-crop).
- Music dock: scroll-down minimization with the accessory moving inline between Home and Search; expands on scroll up; search rides the keyboard; Clear/Cancel (native-music-light-scrolldown, -search-open).
- Landmarks GlassMorph (SwiftUI Namespace + GlassEffectContainer + glassEffectId): badges fuse with visible necks on insert/reorder/remove (native-landmarks-badges-frames).
- Notes Format: Aa is a SwiftUI glass button; the Format sheet is nonmodal (parent stays in the AX tree and editable with a hardware keyboard), detent resize works, format persists across close/reopen (native-notes-format-open, -after-typing-behind, -format-reopen).
- native-contracts: system glass button counts exactly one per tap (3 taps = 3); disabled system button exposes NotEnabled; controlled detent rejection keeps index 0 and logs each request, both system and custom; background TextInput editable while the inspector is open (native-contracts-rejected, -bg-edit, -custom-rejected, native-contracts-buttons-ax.json).
- Mail compose: swiping a started message away saves it to Drafts (native-mail-drafts).
- Search: token for scope with remove button, recents add/remove/clear, empty state with Clear filters, suggestion selection (native-search-token, -empty).
- Forced reduceTransparency/highContrast: glasscn controls become opaque with firm borders (native-photos-forced-rt-hc, native-music-forced-rt-hc).
- NativeTabs: real system tab bar with badge, separate search tab button and bottom accessory (native-tabs-layout).

## System vs custom (AX types + source)

| Surface | Path observed |
| --- | --- |
| Photos options menu, Notes More, Toolbar More | System menu (`@expo/ui/community/menu`); AX shows "Dismiss context menu" |
| Photos Delete, action-sheet-contracts Entry options, /c/action-sheet system | SwiftUI ConfirmationDialog popover (`action-sheet.tsx:121`) |
| /c/action-sheet "Share night" | Custom RN sheet (rich/preferred/onPress) |
| InfoSheet, Notes Format, native-contracts inspector, /c/sheet system | SwiftUI sheet via @expo/ui BottomSheet/presentation (`sheet.tsx:136`); `?part=custom` = custom RN ("Expand sheet" grabber button) |
| Aa, Glass action, Toggle extra, Open system inspector | SwiftUI glass Button (`button.tsx:112`, onAction) |
| Reject large, Mail/Photos floating icons, Safari bar, Music Dock, Maps card, Controls tools | Custom RN `Press` + `Glass` (expo-glass-effect GlassView) |
| Controls slider, Control inset slider | SwiftUI Slider (AX value 0..1 fraction) |
| Balance (ticks) and Progress sliders | Custom RN slider (AX element is the 24 pt knob; progress has none) |
| Maps category control | UISegmentedControl via `@expo/ui/community/segmented-control` (AX TabGroup, unnamed) |
| Search scope bar | Custom RN pressables |
| Switch default size | @expo/ui system switch (label lost, N-16); `size="sm"`/`native={false}` custom |
| GlassMorph badges | SwiftUI Namespace/GlassEffectContainer/glassEffectId (`glass-morph.tsx:39-78`) |
| BackgroundExtension | Custom mirrored blurred RN Image, not SwiftUI backgroundExtensionEffect |
| tabs-layout | Expo Router NativeTabs (system UITabBar, AX "Tab Bar") |
| Share | System share sheet (RN Share) |

## Untested, with reasons

- VoiceOver navigation and announcements: not run (no reliable VoiceOver automation in this simulator setup); AX tree presence only. Live-region feedback in N-5 is unverified for VoiceOver users.
- Physical OS Reduce Transparency / Increase Contrast / Reduce Motion / Bold Text / Show control borders: I don't know a working `defaults write com.apple.Accessibility` key for the iOS 27 sim, so I used `force=` and `still=1`. Those are library-forced preferences, not OS settings; system chrome ignores them.
- Landscape/rotation: not tested. Rotating via the Simulator app menu would target the frontmost simulator window and could hit the iOS 26.5 sim; toolbar command overflow at other widths therefore unverified.
- RTL: not tested (needs app relaunch with forced RTL).
- Regular-width layouts (Landmarks sidebar/inspector, Mail sidebar, Search folders, BackgroundExtension): iPhone only; not reachable.
- Slider cancel (drag off and release): system slider commits on release; I didn't find a cancel gesture to test.
- Touch-only typing behind the nonmodal Format sheet: with the software keyboard suppressed, only HID (idb) text input worked. A touch-only user can place the caret but not type while Format is open; I believe that's intentional (Notes swaps keyboard for the format panel) but it means "edit behind it" is only partially true on touch devices.
- Large Content Viewer on toolbar icons at AX sizes: not tested.
- Palette sweep (dusk/ocean/rose/sage) and square/compact/matte presets on native: not covered in this pass beyond system palette; one accidental cherry tap was reverted.
