// @expo/ui (every entry point) renders SwiftUI/Compose: plain views that keep their props readable.
const React = require("react")
const { View } = require("react-native")

const cache = {}
const stub = (name) =>
  (cache[name] ??= Object.assign(
    React.forwardRef((props, ref) => React.createElement(View, { ...props, ref, testID: props.testID ?? `expo-ui-${name}` })),
    { displayName: `expo-ui-${name}` }
  ))

module.exports = new Proxy({}, { get: (_, k) => (k === "__esModule" ? true : typeof k === "string" ? stub(k) : undefined) })
