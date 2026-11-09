# Action sheet presentation contract

Source frozen after focused checks and iOS27 runtime verification. No commits, pushes, registry/install verifiers, full builds or broad e2e runs were performed here. Root owns registry/dependency generation, public docs and broad checks.

## Public behavior

- Native `ActionSheet.native?: boolean` defaults true. Plain declarative, uncontrolled iOS sheets use Expo57 SwiftUI `ConfirmationDialog`, attached to the actual mounted RN trigger inside `ConfirmationDialog.Trigger` / `RNHostView`. The Host self-sizes at the trigger rather than using an offscreen proxy. `defaultOpen` and `onOpenChange` work; explicit controlled `open` retains custom presentation.
- Native Action and Cancel accept `onAction?: () => void`. Actions with event-free callbacks can use the system path; any supplied RN `onPress` selects custom and keeps its event, regardless of callback arity. Custom rows deliver `onPress`, then `onAction`, then request close. `ActionSheetTrigger.asChild?: boolean` composes the trigger into one child; direct library Button children are composed automatically and forced onto their RN path inside RNHostView, preserving props/events without nested SwiftUI Hosts or pressables.
- The system subset supports plain title/message, ordinary/destructive actions, disabled actions and an optional Cancel. Preferred variants, rich content, extra styling/unsupported props, controlled state, missing/multiple sources or content, and `native={false}` select custom. Requested custom props are not discarded. Custom rows now use minHeight so labels grow with Dynamic Type.
- **Cancel callbacks select custom.** Runtime established that SwiftUI invokes a cancel-role Button's action closure when the user taps outside. Expo exposes neither a dismissal reason nor a distinct physical-selection event. Therefore `ActionSheetCancel.onAction` or `.onPress` must stay custom to distinguish explicit Cancel from passive dismissal. A system Cancel without callback is safe. System selection and native false notifications are deduplicated; passive dismissal never synthesizes a consumer Cancel callback.
- Web uses Radix Dialog for choice semantics, outside/Escape dismissal, focus trapping and return, retaining the existing action/cancel API, source View Transition identity and themed portal. This changes the registry dependency from alert-dialog to dialog. Native imports add button/tokens registry dependencies; no npm dependencies were added. The custom bottom group and separate Cancel capsule are described as custom. SwiftUI owns system layout and Cancel visibility.

## Regression and verification results

Initial tests: all nine native regressions failed against the original source; the web choice-dialog regression failed because AlertDialog exposed alertdialog. Additional failing regressions captured the runtime Cancel-closure problem and the direct-Button nested-Host case before their corrections.

Final checks:

```text
cd sandbox/native
./node_modules/.bin/jest --runInBand __tests__/action-sheet.test.tsx __tests__/native-contracts.test.tsx
2 suites passed, 34 tests passed (13 action-sheet, 21 native-contracts)
./node_modules/.bin/tsc --noEmit
passed

pnpm exec vitest run src/lib/__tests__/action-sheet.test.tsx
3 tests passed
pnpm exec tsc --noEmit
passed
```

Targeted ESLint passed for both action-sheet components, focused tests, Expo mock, verification route, navigation demo and focused e2e spec (`--no-ignore` for sandbox files). The Expo mock now renders ConfirmationDialog's named slots and SwiftUI Text as text, matching the installed component structure.

```text
E2E_BASE_URL=http://localhost:3027 pnpm exec playwright test e2e/action-sheet.behavior.spec.ts --project=chromium
2 passed: outside/Escape dismissal and focus return with reduce/no-preference motion

E2E_BASE_URL=http://localhost:3027 pnpm exec playwright test e2e/liquid-surfaces.behavior.spec.ts --project=chromium -g 'action-sheet flows'
1 passed: source View Transition identity opens and returns
```

Browser-use independently opened `/docs/action-sheet`, activated its AX Entry options button, observed role=dialog and matching source/portal primary tokens, then clicked outside. The panel disappeared and focus returned to Entry options. No full browser matrix was run here.

## iOS27 runtime

Device `980F1928-1320-4C63-8540-2F5B7BB16651`, iPhone18 Pro/iOS27, ExpoGo57. Metro8083 was absent; started only the task sandbox there, logging to `/tmp/glasscn-actions-metro.log`, and left it running. Relaunched only this simulator's ExpoGo to load the new route. P04 did not change device appearance/text settings.

Route: `exp://127.0.0.1:8083/--/action-sheet-contracts`. Interaction used `idb ui tap --udid …` with actual source/action coordinates and AX labels, `idb ui describe-all --udid … --json`, and `xcrun simctl io … screenshot`.

Evidence lives in `native-runtime/actions/` beside this report:

| Check | Observed |
| --- | --- |
| Actual source linkage | Entry options source x16/y155.67/w120.33/h40. System popover visibly points to its right edge; Archive action is x165.33/y198/w208/h48. `glasscn-actions-system-final.png`, `glasscn-actions-open-final.json`. No Yoga/SwiftUI size loop occurred. |
| Action selection | One coordinate tap on Archive produced Actions1/source presses1 and open changes `true, false`. Original source bounds and AX button remained. `glasscn-actions-selected-final.json`. |
| Passive dismissal | Reopened, tapped outside at200/550: Actions stayed1, source presses2, changes `true, false, true, false`. Source remained AX-accessible at identical bounds. `glasscn-actions-passive-final.json`. |
| Source return | AX activation of the returned Entry options source reopened the same system presentation. `glasscn-actions-reopened.png`. |

SwiftUI omits Cancel in this anchored presentation. It also omitted the disabled Delete choice from AX and visible controls; the native button receives the disabled modifier and action guard. Jest verifies disabled/destructive mapping and callback suppression. Explicit system Cancel callback behavior cannot be supported without the fallback described above. This run did not cover iPad adaptation, Android, a separate OS appearance matrix or VoiceOver focus navigation; AX existence/activation and source geometry were verified.

## Requested final SideSheet Dynamic Type check

After source freeze, root requested one runtime check of its corrected `overlays.tsx` demo Face/TextInput geometry. At `/c/sheet`, changed only simulator content_size from its confirmed `large` value to `accessibility-extra-extra-extra-large`, opened the bottom SideSheet and captured it. The core New area title is60pt tall; its description is122pt across two readable lines. Add area is fully visible at x20/y501.33/w362/h71, and the Jiu-jitsu placeholder fits the enlarged TextInput. Evidence: `native-runtime/actions/glasscn-actions-largest-sheet.png` and `glasscn-actions-largest-sheet-final.json`. Restored content_size to `large` and confirmed the readback. No appearance setting changed. Simulator is released; Metro8083 remains available.
