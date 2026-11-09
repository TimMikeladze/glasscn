# Native public contracts implementation

Implemented the native contracts from task-native-brief.md. No commits, registry generation, install verifiers, unrelated services or device appearance/text settings were changed by this task.

## Interfaces and behavior

| API | Implemented contract |
| --- | --- |
| `SheetContent` | iOS bottom sheets use SwiftUI `presentationDetents(detents, { selection, onSelectionChange })` for controlled/default indices and callbacks, plus `presentationBackgroundInteraction` for `modal={false}`. Optional `anchor?: ReactNode` remains mounted through the native anchor slot and is also rendered on fallback paths. Android retains its basic uncontrolled/modal system path. `onBeforeDismiss` selects the custom path. |
| Controlled sheet rejection | A native request is published as the modifier selection for one render transaction, then two animation frames later the accepted controlled selection is restored. This changes Expo's `initialSelection` twice instead of resending an equal rejected prop. It preserves mounted RN sheet content, filters the restoration notification, and handles repeated requests. Accepted parent updates remain selected. |
| Custom sheets | Controlled drags restore the accepted height; cancelled gestures restore geometry without notifying a new detent. Large/1.0 detents reach the screen edges with square corners, opaque frost and safe-area padding. Custom nonmodal iOS sheets use a touch-passthrough `FullWindowOverlay` with modal accessibility disabled; Android/web custom nonmodal sheets remain inline and belong at the screen root. |
| `Button` | Adds `native?: boolean`, default true, and event-free `onAction?: () => void`. Plain iOS glass/prominent text buttons use SwiftUI `Button` with glass/glassProminent style, native control size, border shape, disabled state, label and appearance. Every supplied RN `onPress` callback selects Press/Glass so its event survives, including default/rest-parameter callbacks. Press-in/out/long-press, custom content, active loading or custom style also select Press/Glass; `native={false}` forces that path. Both paths deliver onAction; the custom path can deliver both callbacks. Matte/forced Reduce Transparency uses the custom material path. |
| `GlassMorph` / `GlassMorphItem` | Public props match the brief. A stable `Namespace` contains a `GlassEffectContainer` and animated SwiftUI HStack; stable item IDs use `glassEffectId`. Value changes increment a render revision so different strings cannot lose animation through a hash collision. RN content is inside `RNHostView matchContents` beneath the SwiftUI effect owner. Optional onPress uses SwiftUI Button. Other platforms/solid accessibility settings render separate Glass siblings and preserve static item labels. |

`GlassMorph` accepts `value?: string | number | boolean`, `spacing?: number`, `style`, and children. `GlassMorphItem` accepts required stable `id: string`, children, optional `onPress`, `accessibilityLabel`, `style`, `variant: regular | clear`, `tint`, and `interactive`. Keep both React keys and IDs stable while inserting, removing or reordering items.

SwiftUI self-sizing must not depend on a stretched Yoga dimension. Runtime exposed a geometry update loop missed by the mocks. System Button hosts now align themselves to flex-start. Morph bounds the parent width and measures only the Host's vertical dimension; each RN item self-sizes. Both render and respond in the combined screen.

## Other corrections

- `Glass.intensity` accepts ultraThin, thin, regular and thick. Existing subtle/default/strong remain aliases for ultraThin/thin/regular. iOS maps the four names to the four standard BlurTint materials; thick fallbacks read `glassThick`. Added the authorized `NativeScheme.glassThick` type field; root owns generation and token derivation.
- `LiquidGlass` no longer exposes ignored native `optics` / `followLight` props. Its optics belong to the system effect. `Slider.formatValue` selects the custom slider so the spoken accessibility value uses the formatter.
- SegmentedControl and Dock exclude disabled items from gesture hit-test frames even when the native host delivers layout. Disabled-state changes also guard JS selection. Dock cancels its pending preview without selecting when a scrub ends unsuccessfully. Existing persistent controlled-gesture regressions remain green. Explicit segmented shape or accent selects the custom path because the installed community wrapper cannot honor those choices.
- SidebarProvider measures its containing View. Compact sidebar presentation uses RN Modal for native modal/back/focus behavior; the navigation's children stay independently accessible. The old duplicated-background-subtree implementation was removed and Sidebar re-exports root's standalone image-only BackgroundExtension.

## Files

Component files: `registry/native/{sheet,button,slider,glass,liquid-glass,sidebar,segmented-control,dock,tokens}.tsx` and new `registry/native/glass-morph.tsx`. The tokens edit is only the authorized source type field. Both toolbars, registry/items, generators, BackgroundExtension and advanced scenes remain root-owned.

Focused sandbox: new `sandbox/native/src/app/native-contracts.tsx`, plus updated material labels in `src/app/glass.tsx` and sheet-path explanations/examples in `src/sandbox/demos/overlays.tsx`. `/native-contracts` combines the contracts; `?part=buttons`, `?part=morph`, `?part=sheet` isolate them and `?part=custom` selects the custom inspector. The route is separate from the DEMOS catalog.

Tests: new `sandbox/native/__tests__/native-contracts.test.tsx`, updated `controlled-gestures.test.tsx`, `liquid-material.test.tsx`, and `jest.expo-ui-modifiers.js`. Modifier mocks reproduce Expo57's detent eventListener payload and supported modifier fields. Disabled layout regressions invoke host onLayout directly because RNTL fireEvent skips disabled views.

## Verification

Initial regressions failed on the intended defects: 12 of the first 13 public-contract tests failed; both disabled gesture tests selected the disabled item; both explicit segmented shape/accent tests selected the unsupported system path. Persistent cancellation tests for custom sheets and Dock additionally exposed onEnd firing with success=false and now verify cleanup without committing those requests. Independent review added failing Dock cancellation, colliding Morph value and static fallback-label regressions. Additional checks preserve RN event payloads under the explicit onAction policy and prevent Sheet spring animation under forced Reduce Motion.

Final checks:

```text
cd sandbox/native && ./node_modules/.bin/tsc --noEmit
11 Jest suites passed; 283 tests passed
ESLint passed for all changed native component, test, mock and sandbox demo files
```

Root retains broad registry/install/web gates. No broad registry verifier was run here.

## iOS27 runtime evidence

Device: iPhone18Pro simulator `980F1928-1320-4C63-8540-2F5B7BB16651`, iOS27.0, ExpoGo57.0.9. Metro8083 was absent at the start of this runtime check; started the sandbox Metro there and left it running. The first local-only startup bound IPv6 while the old Expo URL used IPv4; only that task-owned Metro instance was restarted with the normal host. Only the task app on the designated simulator was relaunched during sizing isolation. Other simulators/processes were untouched.

Evidence is in `native-runtime/` beside this report:

| Check | Observed result / evidence |
| --- | --- |
| System glass Button | Action changed `System presses: 0` to1. Native disabled prominent button has NotEnabled trait. `glass-native-system-button.png`. |
| Morph insertion/reorder | Two native identities rendered, Toggle extra inserted third, Reorder moved three/two/one and each remained accessible/pressable. Native RN content/effects rendered together. `glass-native-morph.png`, `glass-morph-reordered.json`. The image catches a frame during the spring; combined-final is the settled combined screen. |
| Repeated rejected system detents | Two upward drags each notified index1 while accepted index remained0 and the grabber returned to the identical small-detent y590.4229. `glass-sheet-reject-1.json`, `glass-sheet-reject-2.json`. |
| Accepted controlled detent | Turning rejection off and dragging again produced accepted1 / requests1,1,1, moved the grabber to y58, and displayed the opaque full system sheet. `glass-sheet-accepted.json`, `glass-native-sheet-accepted.png`. |
| Nonmodal background editing | Background TextInput accepted text with the inspector still presented. Keyboard covered the small sheet; Return removed the keyboard and the same sheet/requests reappeared. Combined screen repeated rejection and background editing after final component changes. `combined-final.json`, `combined-final.png`. |
| Custom large detent | Parent-selected full detent reached the device edges with opaque square surface, content-safe-area padding and accessible controls. `glass-native-custom-full.png`. |

The combined screen also ran system action, Morph insertion/reorder, system-sheet opening and two rejected drags in one mounted hierarchy after the sizing corrections.

## SDK/runtime limits

Installed Expo does not expose glassEffectUnion or glassEffectTransition. No no-op public parameters pretend to implement them. Identity morphing uses the available Namespace/ID/container/animation APIs; explicit union membership and a selectable transition policy still need bridge work. BottomSheet anchor is an anchor, not proof of a zoom/source transition.

The controlled-detent acknowledgement adds two animation frames before rejection rollback; runtime verified repeated gestures on this SDK/OS. RN event objects are unavailable from SwiftUI Button, so all RN onPress callbacks stay custom; use onAction for an event-free system action. Android sheet detent notifications/background interaction remain custom; this task performed iOS runtime checks, not Android runtime checks. Custom native sheets approximate the system's material/geometry transition.

SwiftUI Host.colorScheme does not expose preferredColorScheme for presentation chrome. Simulator screenshots use the existing device appearance and sandbox theme; no independent OS appearance/text matrix was run. FullWindowOverlay's accessibility-container option is marked unstable by react-native-screens; installed source implements the passthrough hit-testing used here.

## Read-only follow-up: P04 ActionSheet feasibility

Inspected current `registry/native/action-sheet.tsx` and installed Expo57 ConfirmationDialog source. No implementation, simulator interaction or tests were performed for this follow-up.

**A source-attached iOS system path is available.** `@expo/ui/src/swift-ui/ConfirmationDialog/index.tsx:11–33` exposes title, isPresented, state-change callback and title visibility; Trigger/Actions/Message are actual named native slots (`:46–61`). Native `ios/ConfirmationDialog/ConfirmationDialog.swift:9–18` applies SwiftUI `.confirmationDialog(...)` directly to triggerContent. It uses the actual trigger slot at `:33–40`; omitting the trigger produces EmptyView plus a warning. A proxy zero-size/offscreen presenter would discard the useful source geometry.

Minimal proposed API additions:

- `ActionSheet.native?: boolean` as the system/custom policy, following the other native controls.
- `ActionSheetAction.onAction?: () => void` and `ActionSheetCancel.onAction?: () => void`. Keep existing RN onPress unchanged; **any** supplied action/cancel onPress selects the custom path, including default/rest/pre-bound callbacks. Do not infer behavior from Function.length. The custom Row can deliver its existing RN onPress event and the optional event-free onAction before requesting close.

The first supported system subset should be iOS, uncontrolled open state (defaultOpen/onOpenChange remain supported), exactly one mounted ActionSheetTrigger, and declarative plain title/message/action labels. Allow ordinary/destructive actions, disabled state and one cancel role. Keep preferred styling, icons/custom action content, custom action styling/events, an absent/unusable trigger, controlled open and native=false on the custom path. This provides a concrete supported path without promising that the installed bridge honors all existing combinations.

Render the system Host **at the trigger's location**, not where ActionSheetContent happens to sit. Under ConfirmationDialog.Trigger, use RNHostView matchContents containing the existing RN ActionSheetTrigger/Press. That preserves trigger onPress/onPressIn/etc. RN event semantics and keeps a native source view with the trigger's bounds. Parse Content/Header/Title/Description/Action/Cancel as data and render SwiftUI Button actions in Actions plus SwiftUI Text in Message. Guard the iOS require and keep a bounded/self-sized host to avoid the sizing loop already found in this task. Trigger React children must render once. Disabled-trigger programmatic-open behavior should remain possible if the source is still mounted.

The action adapter should deliver haptics and onAction, request close once, and suppress the matching native false notification so onOpenChange(false) does not fire twice. A passive native dismissal should request close once and **must not** invent an ActionSheetCancel callback: the current custom backdrop also closes without invoking the cancel row's callback. Map an explicit cancel row to SwiftUI Button role=cancel; system presentation owns where/when that role is displayed. If callers require the existing always-visible Cancel capsule or custom cancel press events, retain the custom path. Add focused regressions for action, explicit cancel, passive dismissal, callback ordering and duplicate-close suppression before implementation.

Controlled open deserves an explicit boundary. ConfirmationDialog stores local `@State isPresented` and only resets it when props.isPresented changes (`ConfirmationDialog.swift:19–29`). A rejected native close with a parent retaining true therefore has the same equal-prop resync issue as the sheet. This bridge has no onDismiss completion callback or pre-dismiss veto. Excluding controlled open from the first system subset preserves current behavior; future native controlled support needs a verified acknowledgement/re-presentation policy or bridge change. Do not silently forward controlled=true and call it supported.

The current custom ActionSheet is a bottom overlay independent of the trigger: left/right12, bottom safe-area+12, maxWidth420. It is neither an attached native popover nor a source transition. A centered wide-screen custom fallback could improve that layout, but centering alone does not satisfy source linkage. The native modifier's attachment to the visible Trigger establishes source ownership in source; iPhone sheet versus iPad anchored-popover adaptation is delegated to SwiftUI and still needs device-class runtime verification. It does not establish an explicit zoom/morph transition.

Genuine installed bridge limits: no explicit attachmentAnchor/arrowEdge/source-rect parameter on ConfirmationDialog; no selectable source transition; no RN event payload from SwiftUI Button; no dismissal-completion/veto callback; Button roles are default/cancel/destructive/close, with no preferred/default-action role or exposed keyboardShortcut modifier found. These limits do **not** block the supported anchored, plain-action, uncontrolled iOS path. Android/web can retain the existing custom implementation. The existing sandbox ActionSheet example (preferred action, icons and RN onPress callbacks) should remain custom and a separate plain onAction example should demonstrate the new system path.

## Sheet/Button anchor interoperability correction

Advanced Notes runtime exposed a library composition bug: `SheetContent.anchor={<Button variant="glass" onAction={...}>Format</Button>}` placed the Button's SwiftUI Host inside the sheet anchor's RNHostView. It rendered without an accessible action; activation removed the anchor without presenting the sheet. A plain RN button worked, isolating the unsupported nested host.

`registry/native/sheet.tsx` now recognizes a direct library Button anchor and clones it with native=false inside the iOS anchor slot. All callback/disabled/loading/style props survive, and the source element stays mounted. This is automatic at the library boundary; clients can retain glass/onAction and do not need to know the hosting hierarchy. Other custom anchor nodes and non-iOS/custom sheet paths retain their existing behavior. The new Button import adds a native-button registry dependency for root's generation pass.

The Expo UI test stub now renders BottomSheet's anchor slot, matching installed source rather than keeping an unrendered React prop. An event-free glass anchor regression failed before the fix with two SwiftUI Hosts; it now finds one Host and an accessible RN button. A second regression delivers both a normalized RN press event and onAction, opens the native sheet and keeps the anchor mounted. The focused sandbox anchor uses glass/onAction without a native=false workaround.

Verification after this correction: native TypeScript passed, focused contract/material tests passed, full current native Jest passed (12 suites, 303 tests, including the advanced worker's new tests), and targeted ESLint passed for the changed sheet/mock/test/demo files. P04 ActionSheet remains read-only feasibility work.

iOS27 proof used the advanced worker's restored Notes glass/onAction anchor, without a sample-specific workaround, at `/c/liquid-glass-02?scene=notes`. Before presentation, AX exposes Format note at x38/y672.67/w326/h40. A coordinate tap presents native Text style with a system Sheet Grabber; the source remains represented in AX while the sheet is open. Done saves and dismisses, then focuses the editor (the keyboard temporarily covers the source). After dismissing the keyboard with a header tap, Format note is accessible again at x38/y704.67 and a second coordinate tap presents Text style again. Evidence files `native-runtime/glass-notes-anchor-{before,open,dismissed,restored,reopened}.json` and `glass-notes-anchor-open.png` record the sequence. No device appearance/text settings changed.

## Global GText Dynamic Type correction

Advanced iOS27 runtime established that core GText without dynamicTypeRamp clips at accessibility-extra-extra-extra-large, including SheetTitle, SheetDescription and Button strings. Move the semantic size ramps from the local block wrappers into GText's iOS defaults, preserve explicit caller ramps, uncapped scaling and Bold Text, then verify core text on the already enlarged simulator. This correction owns only ui.tsx, focused tests and this report; root coordinates removal of the local block wrappers.

Implemented iOS defaults: xs→caption1, sm→subheadline, base→body, lg→title3, xl→title2, 2xl→title1, 3xl–5xl→largeTitle. An explicit caller dynamicTypeRamp wins on every platform. Font scaling remains uncapped and the existing Bold Text weight logic is unchanged. The explicit lineHeight calculation remains in place.

The five default-ramp regressions failed before the change and now pass; explicit override, uncapped scale and Bold Text regressions pass. Native TypeScript, targeted ESLint and full native Jest pass (12 suites, 309 tests). At accessibility-extra-extra-extra-large, the core glass Button anchor wraps to two readable lines (about101pt high) and the core SheetTitle uses a readable two-line heading (about115pt high). A separate core Sheet page displays New area at60pt high and SheetDescription at122pt across two readable lines. This replaces the strip-shaped labels observed before the correction. Captures/AX JSON are `native-runtime/glass-gtext-largest-{core,sheet,title-description}.{png,json}`. The original simulator content-size setting, large, was restored and read back after verification.

The sandbox SideSheet's Add area face still has a fixed40pt height; it is a demo-specific wrapper rather than Button and clips enlarged text. No unrelated demo layout was changed in this core correction. The actual Button proof uses the core min-height glass anchor, which grows with its label. A pre-existing Notes presentation was dismissed by relaunching only the task ExpoGo app before the focused check; no unrelated app/device/process was touched.
