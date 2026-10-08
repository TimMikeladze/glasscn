---
name: port-to-native
description: Bring a glasscn component or token change to the React Native (Expo) track — registry/native — with Liquid Glass on iOS 26, blur on older iOS and fills on Android. Use when asked for a native version of a glass component, when palettes change, or when debugging glass that vanishes on iOS.
---

# Port to React Native

The native track lives in `registry/native/*.tsx`, ships as `native-*` items into `components/glass/native/`, and is excluded from the site's tsconfig. Read `docs/rules/native.md` first.

## Steps

1. **Tokens first.** `native-tokens` holds the palettes as hex and the theme as plain values (`useGlassTheme()`). If a web palette changed, change it here too.
2. **Build on `Glass` and `Press`.** Surfaces are `<Glass>` (it picks Liquid Glass / blur / backdrop-filter / fill); tappables are `<Press>`. Don't reach for `BlurView` or `GlassView` directly.
3. **Motion without fades on iOS 26.** Liquid Glass doesn't render under an ancestor whose opacity starts below 1. Entrances translate/scale; check `canFade()` before any opacity animation, tab transition or screen fade.
4. **Register** with `native(name, title, description, deps, reg)` in `registry/items.mjs`; deps are Expo packages (`expo-blur`, `expo-glass-effect`, `expo-haptics`, `react-native-svg`).
5. **Verify:** `node scripts/verify-native.mjs ../kaizen` (installs into a copy of the Kaizen app and type-checks). Then run it on the iOS 26 simulator — type-checking can't see a vanished pane.

## Debugging "the glass is invisible on iOS"

- An ancestor fades in (Reveal, tab `animation: 'fade'`, a modal fade). Make it transform-only.
- Untinted Liquid Glass on a pale ground — keep `glassTint`.
- It's a fading header — use `bar`.
