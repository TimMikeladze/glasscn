// Just enough `react-native` for the pure helpers in registry/native to import under node (vitest).
export const Platform = { OS: "ios", select: <T,>(o: { ios?: T; default?: T }) => o.ios ?? o.default }
export const AccessibilityInfo = {
  addEventListener: () => ({ remove() {} }),
  announceForAccessibility() {},
}
export type Insets = { top?: number; bottom?: number; left?: number; right?: number }
