# Adaptive toolbar and advanced examples

The adaptive toolbar and four advanced scenes are implemented on both tracks. Shared registry/site integration belongs to root. The owned implementation has passed focused tests and rendered checks; the largest-text run exposed a separate core text-ramp issue described below.

## Files and interfaces

- `src/lib/glass-toolbar-layout.ts`: pure `allocateToolbarCommands(commands, availableWidth, geometry)`. Returns source-ordered `visible`, `overflow`, `pinned` ID arrays and `scrollPinned`. Higher priorities are admitted first; pinned commands win over `overflow="always"`. Measured control widths include text. Web also measures CSS padding/gaps and accounts for a scaled preview; native supplies its layout spacing. Root generates the native helper; no second algorithm is maintained.
- Both `toolbar.tsx` files export `ToolbarCommands` and `ToolbarCommand`. Commands carry `id`, `label`, optional `icon`, `priority`, `pinned`, `disabled`, `overflow`, and `onSelect`. IDs must be unique. `overflowLabel` names More. Pinned controls have a separate trailing capsule and bounded horizontal scrolling when necessary. Web arrow/Home/End navigation skips measurement copies; a command moving into More transfers focus there without stealing editor focus. Native retains current callbacks and disabled guards even when the OS holds an earlier menu plan.
- Both `liquid-glass-02.tsx` files export `LiquidGlass02`, `LiquidGlass02Props`, `LiquidGlass02Scene`: `landmarks | notes | search | materials`. `photoBase` overrides `alpine.jpg`, `coast.jpg`, `summit.jpg`. Both tracks default to the existing Unsplash images so a fresh install needs no unpublished assets. Site/demo callers pass `/showcase` explicitly. Normal container props remain available.
- Web standalone demos: `src/components/demos/liquid-glass-02.tsx`, `toolbar-commands.tsx`. Native standalone map: `sandbox/native/src/sandbox/demos/advanced-glass.tsx`, export `advancedGlass`. It has `liquid-glass-02`, `toolbar-commands`, `glass-morph`, `background-extension` keys. The scene picker honors `?scene=landmarks|notes|search|materials`.

## Scenes

Landmarks uses one hero foreground, image-only leading/trailing extension, an inset horizontal collection beneath the structural sidebar/inspector, selection-linked details and stable badge IDs. Badge insertion/removal/reorder and independent actions update state. Native wide/compact layout reads the containing block width and preserves selection. This is a saved-place collection, not a live map or travel service.

Notes has Undo/Redo history, Checklist, overflow-only Word count, pinned Share, draft/saved text and formatting state. The Format source opens a nonmodal inspector. Done saves and returns editing focus; closing the formatter retains draft changes. The iOS source uses a mounted system-sheet anchor, supported detents and background interaction. No async veto is requested. The web avatar sits outside the shared toolbar glass.

Search compares a browseable destination without autofocus against an explicit Search now action with autofocus. A toolbar SearchField searches across collections while the selected detail remains visible; filled inputs filter folders and the current library. Recents can be removed/reused, completion labels distinguish the remaining suffix, scope choices filter results, and an empty result offers Clear filters. Both SearchField files now accept `tokens?: readonly {id:string;label:string}[]` and `onTokenRemove?: (id:string)=>void`; the scope becomes a removable field token, removal resets All and restores input focus. Empty Backspace removes the last token unless the caller prevents the keyboard event. Read-only tokens render without a removal button. This is custom composition, not a claimed NativeTabs prominent-role bridge.

Materials compares small/large regular glass, four standard materials and semantic label hierarchy over switchable bright/dark grounds. Clear cases use one dim behind bright media, no dim on dark content and one existing media dim with no second scrim. Details controls act independently. Neutral/tick-only, progress and changing inset examples consume public Slider/Button APIs. The native advanced slider paths are custom library controls; the example does not claim an exposed system thumbless modifier.

## Focused verification

Executed with installed binaries because the global `pnpm` wrapper points to a missing executable:

```sh
./node_modules/.bin/vitest run src/components/__tests__/toolbar-commands.test.tsx src/components/__tests__/liquid-glass-02.test.tsx src/lib/__tests__/glass-toolbar-layout.test.ts src/lib/__tests__/navigation.test.tsx
sandbox/native/node_modules/.bin/jest --config sandbox/native/jest.config.js --runInBand advanced-glass-examples.test.tsx liquid-material.test.tsx --silent
./node_modules/.bin/tsc --noEmit --pretty false
sandbox/native/node_modules/.bin/tsc --noEmit --pretty false -p sandbox/native/tsconfig.json
```

23 web/unit tests and 44 native tests pass, including existing no-token SearchField/navigation and native liquid-material regressions. ESLint on changed web/native source and web tests passes with no warnings. Both TypeScript checks pass. Regressions cover the exact fit boundary, text growth, pinned/always-overflow behavior, priorities, disabled activation, updated menu actions, keyboard movement and focus preservation, selection, note editing/save, search entry/removal/filtering, material controls and fading-ancestor absence. Allocator and web interaction tests were observed failing before their implementations.

Native component tests mock platform rendering; they verify requested modifiers/actions, not shader output or keyboard presentation. No registry/install verifiers, commits or pushes were run by this worker. Root owns broad/final gates and shared registry/site integration.

## Runtime and limits

Chromium inspected all four scenes, then compact390px Notes/Search/Materials and a Sage/light/square/compact/matte Notes variant. Body overflow was absent. The matte variant reported0px surface radius and0px blur. Actual input editing worked while the web formatter stayed open; Done set Saved and returned editor focus. Search now focused its field; scope-token removal restored the full result set. At impossible120px toolbar width, measured root scrollWidth remained120 while the pinned viewport was62px for90px content, with all nonpinned commands in More. Invisible measurement copies are clipped in their own layer so they cannot enlarge document scrolling.

Web evidence is in `examples-runtime/`: `web-landmarks.png`, `web-notes-edit-open.png`, `web-search.png`, `web-materials.png`, `web-notes-compact.png`, `web-search-token-compact.png`, `web-materials-compact.png`, `web-notes-sage-light-square-compact-matte.png`. These are development-page captures, not a complete browser/platform matrix.

iOS27 runtime used the released iPhone18Pro simulator `980F1928-1320-4C63-8540-2F5B7BB16651` and Metro8083. Landmarks selection changed the inspector. Badge insertion/reorder initially exposed a zero-width SwiftUI host inside horizontal scrolling; the example now measures label widths and supplies a full content-plane width. Final three-badge bounds stay positive and inside the viewport (`native-badges-fixed.json/png`). The implementation keeps the larger plane scrollable at larger text sizes.

Actual native Notes text accepted “Added under open formatter.” with the system nonmodal formatter open. Tapping the parent title dismissed the keyboard and revealed the same sheet; Done saved and retained the edit (`native-notes-sheet`, `native-notes-edited`, `native-notes-edited-sheet`, `native-notes-saved`). Search landing and prominent search were inspected; entering “no such landmark” produced the useful empty state (`native-search-landing`, `native-search-focused`, `native-search-no-results`). Materials rendered the four material cells and controls (`native-materials`).

A nested system Button in Sheet.anchor initially rendered without a usable source. The native contract worker fixed this at the Sheet boundary, and independently verified the intended glass/onAction Notes anchor opens, dismisses and reopens without a caller workaround. Its final evidence is `native-runtime/glass-notes-anchor-*`. The sample uses that public glass/onAction contract.

Largest text was tested with `accessibility-extra-extra-extra-large`. Direct GText labels clipped until supplied semantic `dynamicTypeRamp`; the owned scene wrapper, toolbar labels/measurement copies and token labels now set appropriate ramps, following block01. The heading then wrapped and pinned Share grew to147.7×73 points while other commands overflowed. Core SheetTitle/SheetDescription/Button labels still clipped during that run; root received the finding for the library-level default-ramp fix. `native-notes-largest-text.png` is the failure and `native-notes-largest-ramps.png` separates the corrected owned elements from the remaining core issue. This report does not claim the complete largest-text scene passed. The original simulator content size `large` was restored and confirmed. Appearance was not changed.

Native system surfaces delegate to the installed OS where the component contract supports them. Image extension is a mirrored/softened composition on both tracks. Browser material optics and morph geometry approximate the public behavior; they do not reproduce Apple's private renderer. Explicit unions and selectable native transition policies are unavailable in the installed Expo bridge. Android background-interaction sheet behavior remains the component's custom path. Physical-device, VoiceOver, AppKit/tvOS/visionOS and complete catalogue parity are not established by these focused tests.
