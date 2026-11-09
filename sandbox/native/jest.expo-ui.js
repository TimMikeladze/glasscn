// @expo/ui (every entry point) renders SwiftUI/Compose: plain views that keep their props readable.
/* eslint-disable @typescript-eslint/no-require-imports */
const React = require("react")
const { View, Text } = require("react-native")

const cache = {}
const stub = (name) =>
  (cache[name] ??= Object.assign(
    React.forwardRef(function ExpoUIStub(props, ref) { return React.createElement(name === "Text" ? Text : View, { ...props, ref, testID: props.testID ?? `expo-ui-${name}` }, ...(name === "BottomSheet" && props.anchor ? [props.anchor, props.children] : [props.children])) }),
    { displayName: `expo-ui-${name}` }
  ))

stub("ConfirmationDialog").Trigger = stub("ConfirmationDialogTrigger")
stub("ConfirmationDialog").Actions = stub("ConfirmationDialogActions")
stub("ConfirmationDialog").Message = stub("ConfirmationDialogMessage")

module.exports = new Proxy({}, { get: (_, k) => (k === "__esModule" ? true : typeof k === "string" ? stub(k) : undefined) })
