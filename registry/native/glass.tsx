import * as React from "react"
import { Platform, StyleSheet, View, type ViewProps } from "react-native"
import { BlurView } from "expo-blur"
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect"

import { useGlassTheme } from "@/components/glass/native/tokens"

let liquid: boolean | null = null
/** Liquid Glass (iOS 26+) when the OS has it. Checked once. */
export function hasLiquidGlass() {
  if (liquid === null) {
    try {
      liquid = Platform.OS === "ios" && isLiquidGlassAvailable()
    } catch {
      liquid = false
    }
  }
  return liquid
}

/**
 * Liquid Glass won't render under an ancestor whose opacity starts below 1 —
 * entrances on iOS 26 should move (translate, scale) but not fade.
 */
export const canFade = () => !hasLiquidGlass()

export type GlassProps = ViewProps & {
  radius?: number
  /** Tint the glass (an accent wash) instead of the neutral frost. */
  tint?: string
  /** A soft shadow on web/Android; iOS glass carries its own depth. */
  raised?: boolean
  /** Liquid Glass reacts to touch — buttons, tab bars. */
  interactive?: boolean
  /** Top chrome that fades with scroll: never Liquid Glass (it must not be faded). */
  bar?: boolean
}

/**
 * Frosted glass for React Native.
 * iOS 26: native Liquid Glass. iOS < 26: UIVisualEffect blur. Web: backdrop-filter. Android: a translucent fill.
 */
export function Glass({ radius = 26, tint, raised = true, interactive, bar, style, children, ...rest }: GlassProps) {
  const t = useGlassTheme()
  const shape = { borderRadius: radius, borderCurve: "continuous" as const }

  if (!bar && hasLiquidGlass()) {
    return (
      <GlassView glassEffectStyle="regular" colorScheme={t.scheme} tintColor={tint ?? t.glassTint} isInteractive={interactive} style={[shape, style]} {...rest}>
        {children}
      </GlassView>
    )
  }

  if (Platform.OS === "web") {
    return (
      <View
        style={[
          shape,
          {
            backgroundColor: tint ?? t.glass,
            borderWidth: 1,
            borderColor: t.glassBorder,
            backdropFilter: "blur(28px) saturate(180%)",
            WebkitBackdropFilter: "blur(28px) saturate(180%)",
            boxShadow: raised ? `0 10px 30px ${t.glassShadow}, inset 0 1px 0 ${t.glassBorder}` : undefined,
          } as object,
          style,
        ]}
        {...rest}
      >
        {children}
      </View>
    )
  }

  if (Platform.OS === "android") {
    return (
      <View style={[shape, { backgroundColor: tint ?? t.glassSolid, borderWidth: StyleSheet.hairlineWidth, borderColor: t.glassBorder, elevation: raised ? 2 : 0 }, style]} {...rest}>
        {children}
      </View>
    )
  }

  return (
    <View style={[shape, { overflow: "hidden" }, style]} {...rest}>
      <BlurView
        tint={bar ? (t.scheme === "dark" ? "systemChromeMaterialDark" : "systemChromeMaterialLight") : t.scheme === "dark" ? "systemUltraThinMaterialDark" : "systemUltraThinMaterialLight"}
        intensity={80}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, shape, { pointerEvents: "none", backgroundColor: tint ?? t.glass, borderWidth: StyleSheet.hairlineWidth, borderColor: t.glassBorder }]} />
      {children}
    </View>
  )
}
