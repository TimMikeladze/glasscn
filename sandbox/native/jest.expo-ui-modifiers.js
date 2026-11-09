// Match Expo57's JSON protocol and modifier event payloads without loading native managers.
const modifier = ($type, props) => ({ $type, ...props })
const supported = {
  presentationDetents: (detents, options) => modifier("presentationDetents", {
    detents,
    selection: options?.selection,
    eventListener: options?.onSelectionChange ? ({ detent }) => options.onSelectionChange(detent) : undefined,
  }),
  presentationBackgroundInteraction: (interaction) => modifier("presentationBackgroundInteraction", { interactionType: interaction }),
  presentationDragIndicator: (visibility) => modifier("presentationDragIndicator", { visibility }),
  buttonStyle: (style) => modifier("buttonStyle", { style }),
  buttonBorderShape: (shape, cornerRadius) => modifier("buttonBorderShape", { shape, cornerRadius }),
  controlSize: (size) => modifier("controlSize", { size }),
  disabled: (disabled = true) => modifier("disabled", { disabled }),
  accessibilityLabel: (label) => modifier("accessibilityLabel", { label }),
  glassEffectId: (id, namespaceId) => modifier("glassEffectId", { id, namespaceId }),
  animation: (animation, animatedValue) => modifier("animation", { animation, animatedValue }),
  Animation: { spring: (params) => ({ type: "spring", ...params }) },
}
module.exports = new Proxy({}, {
  get: (_, name) => name === "__esModule" ? true : supported[name] ?? ((value, second) => modifier(name, typeof value === "object" && value !== null ? value : { value, second })),
})
