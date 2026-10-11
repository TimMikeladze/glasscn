// Native modules the component tests can't load, replaced with plain views. Glass and
// Press stay real — the structural test reads their props.
/* eslint-disable @typescript-eslint/no-require-imports */
require("react-native-gesture-handler/jestSetup")

jest.mock("react-native-worklets", () => require("react-native-worklets/src/mock"))
jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"))
jest.mock("react-native-keyboard-controller", () => require("react-native-keyboard-controller/jest"))

const passthrough = (name) => {
  const React = require("react")
  const { View } = require("react-native")
  const C = React.forwardRef((props, ref) => React.createElement(View, { ...props, ref, testID: props.testID ?? name }))
  C.displayName = name
  return C
}

jest.mock("expo-blur", () => ({ BlurView: passthrough("BlurView"), BlurTargetView: passthrough("BlurTargetView") }))
jest.mock("expo-glass-effect", () => ({
  GlassView: passthrough("GlassView"),
  GlassContainer: passthrough("GlassContainer"),
  isLiquidGlassAvailable: () => true,
  isGlassEffectAPIAvailable: () => true,
}))
jest.mock("expo-haptics", () => ({
  selectionAsync: () => Promise.resolve(),
  impactAsync: () => Promise.resolve(),
  notificationAsync: () => Promise.resolve(),
  ImpactFeedbackStyle: {},
  NotificationFeedbackType: {},
}))
jest.mock("expo-video", () => ({
  useVideoPlayer: () => ({ play() {}, pause() {}, loop: false, muted: false, addListener: () => ({ remove() {} }) }),
  VideoView: passthrough("VideoView"),
}))
// icons: any name → a plain view (the package ships ESM .mjs)
jest.mock("lucide-react-native", () => new Proxy({}, { get: (_, k) => (k === "__esModule" ? true : passthrough(`icon-${String(k)}`)) }))
// FlashList v2 measures native layout; a FlatList renders the same items (its own jestSetup targets v1)
jest.mock("@shopify/flash-list", () => {
  const React = require("react")
  const { FlatList } = require("react-native")
  const FlashList = React.forwardRef((props, ref) => React.createElement(FlatList, { ...props, ref }))
  FlashList.displayName = "FlashList"
  return { FlashList, AnimatedFlashList: FlashList }
})

// Animated timers settle outside act() after a render; that noise isn't a failure
const error = console.error
console.error = (...args) => {
  if (typeof args[0] === "string" && args[0].includes("not wrapped in act(")) return
  error(...args)
}
