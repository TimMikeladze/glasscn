# M4: native rebuild

Roadmap milestone M4 ([`../roadmap.md`](../roadmap.md) §8.7). Design: [`../liquid-glass.md`](../liquid-glass.md) §3.9. Web state: [`m2-liquid-layer.md`](m2-liquid-layer.md), [`m3-parity-forms.md`](m3-parity-forms.md). Expo SDK 57, RN 0.86, Reanimated 4.5, gesture-handler 2.32, `@expo/ui` 57.

## Foundation (landed first, shared by every item)

| Piece | Decision |
|---|---|
| **Tokens** (NAT-60, 10, 11, 12, 13, 24) | `toNativeTheme()` in `glass-theme.ts` (OKLCH → gamut-mapped sRGB, rem → pt, clarity applied, high-contrast block). `pnpm generate` writes `registry/native/tokens.generated.ts`: 12 palettes × light/dark/highContrast, and every material/shape/motion/density/type preset as a diff. `GlassThemeProvider` takes `palette material shape motion density type highContrast tokens` and merges with its parent. `useUI()` derives control heights × density, the type ratio/scale, weights, tracking, fonts, `motion.springConfig` from tokens. |
| **`native-a11y`** (NAT-27, 12, 23, 59) | One live store per OS setting: `useReducedMotion`, `useReduceTransparency`, `useHighContrast` (Darker System Colors / High Text Contrast / `prefers-contrast`), `useBoldText`; `forceA11y()` for previews/tests; `announce()`; `hitSlop(h, w)` to 44pt; `MAX_FONT_SCALE` per role. Every component reads these; there is no other reduced-motion code. |
| **`Glass`** (NAT-03, 14, 16, 17, 18, 19, 83) | `variant="material" \| "liquid" \| "liquid-clear"` (default `material`). *material*: `BlurView` system material on iOS (all versions), token `backdrop-filter` on web, Android blur tier (`BlurView` + `blurMethod="dimezisBlurViewSdk31Plus"` when `useAndroidBlur()` / `<GlassBlurTarget>` provides a target) else a fill with **no elevation**. *liquid*: `GlassView` on iOS 26+, `glassEffectStyle` `regular`/`clear`, materialise via `{style, animate}`; elsewhere the liquid frost tokens. Tint is a mix laid over the frost, never the background. Shadow on an outer wrapper (iOS < 26 keeps `raised`). Radius default `ui.radius.surface`. Reduce Transparency → `glassSolid`. `GlassGroup` = `GlassContainer` on iOS 26. |
| **`Press`** (NAT-20, 21, 22, 81) | Reanimated: scale/stretch with `withSpring(motion.springConfig)`; liquid grows `pressGrow`, solid squashes `pressScale`; no animated opacity unless `dim` (and never over glass). Default `accessibilityRole="button"`; function-style `style` accepted. Haptic fires on `onPress`, not press-in. `useHaptics()` → `selection / impact / notify(type)`, global `setHapticsEnabled(false)`, no-op on web. |
| **Gestures** | gesture-handler `Gesture.Pan/Tap` with `activeOffsetX/failOffsetY` for horizontal drags inside ScrollViews; no `PanResponder`, no RN `Animated` in rebuilt parts. App root wraps `GestureHandlerRootView` + `KeyboardProvider` (sandbox shows how; docs say so). |

## Native controls first (NAT-80)

`@expo/ui` universal components on iOS/Android, our RN implementation on web and for custom content. Split by `Platform.OS` inside the one file (the universal layer runs everywhere; `swift-ui` / `jetpack-compose` imports only in `.ios.tsx` / `.android.tsx` siblings, which ship as extra files of the same item). Prop names stay the web's (`checked/onCheckedChange`, `value/onValueChange`). A `native={false}` prop forces the RN version.

| Item | iOS / Android | Web / custom |
|---|---|---|
| switch | `@expo/ui` `Switch` | RN: drag-to-toggle, lens knob (Reanimated) |
| slider | `@expo/ui` `Slider` (single value) | RN: Pan with offsets, RTL `translateX`, ticks, `neutralValue`, glass knob while dragging, commit on end/cancel |
| segmented-control | `@expo/ui` `Picker` segmented | RN: Reanimated indicator (`translateX`, RTL), drag-to-scrub |
| dropdown-menu / context-menu | `@expo/ui` `Menu` / `ContextMenu` for plain items | RN Modal menu for custom content |
| sheet / drawer | `@expo/ui` `BottomSheet` (detents) | Reanimated + Pan, snap points, rubber-band, grabber |
| date-picker | `@expo/ui/community/datetimepicker` | calendar |

## Navigation pieces (NAT-38, 82)

`native-tabs-layout` recipe item (expo-router `unstable-native-tabs` on SDK 57: `minimizeBehavior`, bottom accessory, `role="search"`). `Dock` stays for in-screen bars (`GlassGroup`, minimise on scroll, drag-to-scrub). `NavigationBar` tracks a scroll value (`useScrollEdge()` / `scrollY` shared value), not just `collapsed`. Toaster in `FullWindowOverlay` on iOS, announces via `announce()`. Keyboard: `react-native-keyboard-controller` (`KeyboardAvoidingView` in dialog/sheet, `KeyboardStickyView` for the chat composer). Confirmation popover → action sheet on phones.

## Data and chat

Charts: Reanimated focus index + `useAnimatedProps`, `accessibilityRole="adjustable"` stepping points + `ChartDataTable` "view as table". Heatmap/tracker: plain cells + one gesture layer. Rings/gauge/progress-ring: Reanimated `useAnimatedProps` on `strokeDashoffset`; activity-rings rebuilt to the web anatomy. Chat: FlashList v2 (`maintainVisibleContentPosition`, start at end), keyboard-sticky composer, newline on Return by default. Backdrop: `expo-video` (muted loop, poster while loading, paused under Reduce Motion).

## Tests (NAT-50..54)

- **Unit** (root vitest, `registry/native/*.test.ts`, node): chart-math, `placeFloating`, slider snapping, toaster store, **token parity** (generated vs `createGlassTheme` ΔE < 2; regenerate is a no-op), `hitSlop`.
- **Component** (`sandbox/native`, jest-expo + RNTL): roles/state/value, controlled/uncontrolled, every string in `Text`, structural test that no `Press`/opacity-animated node wraps `Glass variant="liquid"`.
- **E2E** (Maestro flows in `sandbox/native/.maestro/`): toast swipe, slider in ScrollView, menu, composer + keyboard; screenshots per palette × scheme as visual baselines. Runs locally on the iOS simulator; CI job documented.
- `verify:native` runs the component tests against the shadcn-installed copy.

## Platform

NAT-77: `expo-build-properties` `ios.enableSceneSupport` in the sandbox. NAT-78: iPad + rotation on.

## Work split (3 agents, disjoint files; foundation integration is the lead's)

| Track | Files |
|---|---|
| **A: glass core + controls** | glass, press, glass-group, aurora, button, button-group, toggle, toggle-group, switch, checkbox, radio-group, slider, segmented-control, stepper, input, textarea, input-group, field, label, select, calendar, date-picker, grouped-list; demos `basics.tsx`, `controls.tsx`, `forms.tsx`; sandbox `glass`/`press`/`aurora` screens |
| **B: overlays + navigation** | dialog, alert-dialog, sheet, drawer, action-sheet, popover, tooltip, dropdown-menu, context-menu, confirmation-popover, command, combobox, toaster, dock, tabs, toolbar, navigation-bar, scroll-edge, sidebar, search-field, accordion, collapsible, new `tabs-layout`; demos `overlays.tsx`, `navigation.tsx` |
| **C: data, chat, content, tests** | every chart/data item, table, data-table, chat*, blocks, backdrop, avatar, card, typography, prose, badge, kbd, separator, skeleton, spinner, empty, alert, item, scroll-area, theme-scope, kpi, widget, range-chart; demos `data.tsx`, `composite.tsx`; all tests + jest/Maestro setup |

## Done when

`pnpm typecheck && pnpm lint && pnpm test`, `verify:install`, `verify:native`, `test:e2e` green; sandbox on the iOS 26 simulator in light/dark with Reduce Transparency; web `/docs/*` baselines unchanged; roadmap ticked; CHANGELOG; committed and pushed.
