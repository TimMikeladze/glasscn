# React Native rules

1. **Same names, same palettes.** `native-tokens` mirrors the web palettes and token names as plain values; keep them in step when a palette changes.
2. **Best surface available:** Liquid Glass (`expo-glass-effect`) on iOS 26 → `expo-blur` on older iOS → `backdrop-filter` under react-native-web → a translucent fill on Android.
3. **Never fade Liquid Glass.** It won't render under an ancestor whose opacity starts below 1. Entrances, tab transitions and screen animations on iOS 26 translate or scale instead — check `canFade()`.
4. **Tint Liquid Glass.** Untinted it nearly vanishes on a pale aurora; `Glass` lays in `glassTint` by default.
5. **Bars never use Liquid Glass.** Chrome that fades with scroll uses `bar` (UIVisualEffect blur).
6. **`Press` takes a plain style.** Animated drops Pressable's function-style form.
7. **Verify on a device class.** `pnpm verify:native` type-checks the install; behaviour needs the sandbox (`sandbox/native`, [`../sandbox.md`](../sandbox.md)) on the iOS 26 simulator.
8. **One file, every platform.** A component twin is plain React Native (no Tailwind, Radix or DOM) so react-native-web renders the same file on the web. Same exports, parts and variant props as the web file; `className` → `style`.
9. **State goes in `aria-*`, not `accessibilityState`.** React Native 0.86 reads both, but react-native-web drops `accessibilityState`, so `aria-checked`/`aria-selected`/`aria-expanded`/`aria-disabled` are the only way a switch or tab announces itself on the web.
10. **Every string inside `<Text>`.** Native throws on a bare string in a `View`; the web doesn't, so it only shows on a device. Wrap string children in `GText` (buttons, badges, cells), and render cell/header definitions yourself rather than through `flexRender` (which mounts them as components, so a returned string escapes the wrapper).
11. **Gestures outlive renders.** A `PanResponder` rebuilt on every render drops the drag on iOS — create it once and read the latest props from a box updated after render.
12. **Overlays are `Modal`s.** They float above every screen in a native stack, including screens pushed later — don't open one on mount in a screen that stays mounted under others.
13. **Strip native-only props before they reach the DOM.** `Animated` adds `collapsable={false}`; on an SVG element react-native-svg passes it to the DOM — wrap the animated SVG part and drop it.

