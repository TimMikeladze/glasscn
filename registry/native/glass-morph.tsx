import * as React from "react"
import { View, type StyleProp, type ViewStyle } from "react-native"

import { useReducedMotion, useReduceTransparency } from "@/components/glass/native/a11y"
import { Glass, hasLiquidGlass } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { CLEAR_MEDIA_LABELS, GlassThemeProvider, NativeGlassLabelsContext, nativeControlTheme, nativeGlassLabels, useGlassThemeOptions } from "@/components/glass/native/tokens"
import { GText, useUI } from "@/components/glass/native/ui"

const MorphContext = React.createContext<{ namespaceId: string; system: boolean } | null>(null)

export type GlassMorphProps = {
  /** Change alongside insertion, removal or reordering to animate the SwiftUI hierarchy. */
  value?: string | number | boolean
  spacing?: number
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

/** Stable SwiftUI effect identities on iOS; separate glass siblings on other platforms. */
export function GlassMorph({ value = false, spacing = 8, style, children }: GlassMorphProps) {
  const ui = useUI()
  const options = useGlassThemeOptions()
  const reduced = useReducedMotion() || ui.motion.duration === 0
  const solid = useReduceTransparency() || (ui.blur === 0 && ui.liquidBlur === 0 && ui.clearBlur === 0)
  const namespaceId = React.useId()
  const [animationState, setAnimationState] = React.useState({ value, revision: 0 })
  if (!Object.is(animationState.value, value)) setAnimationState({ value, revision: animationState.revision + 1 })
  const system = hasLiquidGlass() && !solid
  const context = React.useMemo(() => ({ namespaceId, system }), [namespaceId, system])
  if (!system) return <MorphContext.Provider value={context}><View style={[{ flexDirection: "row", alignItems: "center", gap: spacing }, style]}>{children}</View></MorphContext.Provider>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SwiftUI = require("@expo/ui/swift-ui") as typeof import("@expo/ui/swift-ui")
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const modifiers = require("@expo/ui/swift-ui/modifiers") as typeof import("@expo/ui/swift-ui/modifiers")
  return <MorphContext.Provider value={context}>
    <View style={[{ alignSelf: "stretch" }, style]}>
    <SwiftUI.Host matchContents={{ vertical: true }} {...nativeControlTheme(ui, options)} style={{ width: "100%" }}>
      <SwiftUI.Namespace id={namespaceId}>
        <SwiftUI.GlassEffectContainer spacing={spacing}>
          <SwiftUI.HStack spacing={spacing} modifiers={reduced ? [] : [modifiers.animation(modifiers.Animation.spring({ duration: ui.motion.duration / 1000 }), animationState.revision)]}>{children}</SwiftUI.HStack>
        </SwiftUI.GlassEffectContainer>
      </SwiftUI.Namespace>
    </SwiftUI.Host>
    </View>
  </MorphContext.Provider>
}

export type GlassMorphItemProps = {
  /** Keep this ID and the React key stable across hierarchy changes. */
  id: string
  children?: React.ReactNode
  onPress?: () => void
  accessibilityLabel?: string
  style?: StyleProp<ViewStyle>
  variant?: "regular" | "clear"
  tint?: string
  interactive?: boolean
}

/** RN content enters SwiftUI through RNHostView; the outer SwiftUI view owns its glass identity. */
export function GlassMorphItem({ id, children, onPress, accessibilityLabel, style, variant = "regular", tint, interactive = !!onPress }: GlassMorphItemProps) {
  const context = React.useContext(MorphContext)
  const ui = useUI()
  const options = useGlassThemeOptions()
  if (!context) throw new Error("GlassMorphItem must be inside GlassMorph")
  const content = <View style={[{ alignSelf: "flex-start", minHeight: Math.max(44, ui.control.default), paddingHorizontal: ui.pad.default, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }, style]}>{React.Children.map(children, (child) => typeof child === "string" || typeof child === "number" ? <GText>{child}</GText> : child)}</View>
  if (!context.system) {
    const surface = <Glass variant={variant === "clear" ? "liquid-clear" : "liquid"} tint={tint} interactive={interactive} radius={ui.radius.button} accessible={!onPress && !!accessibilityLabel} accessibilityLabel={onPress ? undefined : accessibilityLabel}>{content}</Glass>
    return onPress ? <Press onPress={onPress} liquid haptic accessibilityRole="button" accessibilityLabel={accessibilityLabel}>{surface}</Press> : surface
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SwiftUI = require("@expo/ui/swift-ui") as typeof import("@expo/ui/swift-ui")
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const modifiers = require("@expo/ui/swift-ui/modifiers") as typeof import("@expo/ui/swift-ui/modifiers")
  const labels = variant === "clear" ? CLEAR_MEDIA_LABELS : nativeGlassLabels(ui, options.tokens)
  const hosted = <SwiftUI.RNHostView matchContents><GlassThemeProvider tokens={labels}><NativeGlassLabelsContext.Provider value={variant === "regular" && !tint ? ui : null}>{content}</NativeGlassLabelsContext.Provider></GlassThemeProvider></SwiftUI.RNHostView>
  const effect = [modifiers.glassEffect({ glass: { variant, tint, interactive }, shape: "capsule" }), modifiers.glassEffectId(id, context.namespaceId), ...(accessibilityLabel ? [modifiers.accessibilityLabel(accessibilityLabel)] : [])]
  return onPress ? <SwiftUI.Button onPress={onPress} modifiers={[modifiers.buttonStyle("plain"), ...effect]}>{hosted}</SwiftUI.Button> : <SwiftUI.VStack modifiers={effect}>{hosted}</SwiftUI.VStack>
}
