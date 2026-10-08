# React Native rules

1. **Same names, same palettes.** `native-tokens` mirrors the web palettes and token names as plain values; keep them in step when a palette changes.
2. **Best surface available:** Liquid Glass (`expo-glass-effect`) on iOS 26 → `expo-blur` on older iOS → `backdrop-filter` under react-native-web → a translucent fill on Android.
3. **Never fade Liquid Glass.** It won't render under an ancestor whose opacity starts below 1. Entrances, tab transitions and screen animations on iOS 26 translate or scale instead — check `canFade()`.
4. **Tint Liquid Glass.** Untinted it nearly vanishes on a pale aurora; `Glass` lays in `glassTint` by default.
5. **Bars never use Liquid Glass.** Chrome that fades with scroll uses `bar` (UIVisualEffect blur).
6. **`Press` takes a plain style.** Animated drops Pressable's function-style form.
7. **Verify on a device class.** `pnpm verify:native` type-checks the install; behaviour needs the sandbox (`sandbox/native`, [`../sandbox.md`](../sandbox.md)) on the iOS 26 simulator.
