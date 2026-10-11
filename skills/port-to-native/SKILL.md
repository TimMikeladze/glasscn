---
name: port-to-native
description: Bring a glasscn component or token change to the React Native (Expo) track — registry/native — with Liquid Glass on iOS 26, blur on older iOS and fills on Android. Use when asked for a native version of a glass component, when palettes change, or when debugging glass that vanishes on iOS.
---

# Port to React Native

The native track lives in `registry/native/*.tsx`, ships as `native-*` items into `components/glass/native/`, and is excluded from the site's tsconfig. Read `docs/rules/native.md` first.

## Steps

1. **Tokens first.** `native-tokens` holds the palettes as hex and the theme as plain values (`useGlassTheme()`). If a web palette changed, change it here too.
2. **Build on `Glass` and `Press`.** Surfaces are `<Glass>` — pick the layer: `material` (default) for content, `liquid` for floating controls; inline controls are fills, and liquid never nests in liquid. Tappables are `<Press>` (`haptic`, `liquid` grows, `dim` only away from Liquid Glass). Don't reach for `BlurView` or `GlassView` directly.
   - **System control first:** if `@expo/ui` has it (Switch, Slider, segmented control, date picker, menu, bottom sheet), render it on iOS/Android behind the web's prop names, with the RN version on the web and under `native={false}`.
   - **Gestures and motion:** gesture-handler `Gesture.Pan/Tap` (horizontal drags: `activeOffsetX([-8, 8]).failOffsetY([-8, 8])`), Reanimated with `useUI().motion.springConfig`, shared values via `.get()/.set()`. Sliding selections use `useSlidingSelection` from `native-segmented-control`.
   - **A11y from `native-a11y`:** reduced motion / transparency / contrast hooks, `announce()`, `hitSlop()` to 44pt, `minHeight` not `height`.
3. **Motion without fades on iOS 26.** Liquid Glass doesn't render under an ancestor whose opacity starts below 1. Entrances translate/scale; check `canFade()` before any opacity animation, tab transition or screen fade.
4. **One file, every platform.** A component twin is `registry/native/<web-name>.tsx`: the web file's exports, parts and variant props, built on `Glass`/`Press`, with tokens from `useUI()` and type from `GText` (`native-ui`). It's plain React Native, so react-native-web renders it on the web. No Tailwind, Radix or DOM. Overlays use `Modal`, sliding thumbs use `onLayout`, and charts use `react-native-svg` on `chart-math`.
5. **Register** a twin by adding its name to `NATIVE_NAMES` in `registry/items.mjs`. Its npm deps and `native-*` registry deps are read from its imports, so it installs standalone. Foundation items use `native(name, title, description, deps, reg)` directly.
6. **Add a sandbox demo.** Add an entry under the item's name in `sandbox/native/src/sandbox/demos/<group>.tsx` exercising every prop. The index and `/c/<name>` list it. The sandbox imports `registry/native` live — see `docs/sandbox.md`.
7. **Verify:** `pnpm verify:native` (installs from the registry into a copy of the sandbox and type-checks). Then `cd sandbox/native && npm run ios` on the iOS 26 simulator, and `npm run web` — type-checking can't see a vanished pane.

## Debugging "the glass is invisible on iOS"

- An ancestor fades in (Reveal, tab `animation: 'fade'`, a modal fade). Make it transform-only.
- Untinted Liquid Glass on a pale ground — keep `glassTint`.
- It's a fading header — use `bar`.
