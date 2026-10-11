import * as React from "react"
import { AccessibilityInfo, Platform, StyleSheet, View, type ViewProps } from "react-native"
import { BlurView } from "expo-blur"
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from "expo-glass-effect"

import { useGlassTheme } from "@/components/glass/native/tokens"

let liquid: boolean | null = null
/**
 * Liquid Glass (iOS 26+) when the OS has it. Checked once. Both checks: some
 * iOS 26 betas report Liquid Glass but lack the API and crash on GlassView.
 */
export function hasLiquidGlass() {
  if (liquid === null) {
    try {
      liquid = Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()
    } catch {
      liquid = false
    }
  }
  return liquid
}

/**
 * Liquid Glass doesn't render when it, or any ancestor, has opacity 0 (Expo's
 * known issue), so never fade it: entrances on iOS 26 move (translate, scale)
 * or materialise via `glassEffectStyle.animate`; a `Press` around glass passes `dim={canFade()}`.
 */
export const canFade = () => !hasLiquidGlass()

// Reduce Transparency, shared by every Glass: one OS listener while anything is subscribed.
let reduceTransparency = false
const rtListeners = new Set<() => void>()
let rtStop: (() => void) | null = null
function setReduceTransparency(on: boolean) {
  if (on === reduceTransparency) return
  reduceTransparency = on
  rtListeners.forEach((l) => l())
}
function startReduceTransparency() {
  if (Platform.OS === "web") {
    // react-native-web has no isReduceTransparencyEnabled; the media query is the same setting
    const mq = typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-transparency: reduce)") : null
    if (!mq) return () => {}
    const onChange = (e: { matches: boolean }) => setReduceTransparency(e.matches)
    setReduceTransparency(mq.matches)
    mq.addEventListener?.("change", onChange)
    return () => mq.removeEventListener?.("change", onChange)
  }
  let live = true
  AccessibilityInfo.isReduceTransparencyEnabled()
    .then((on) => live && setReduceTransparency(on))
    .catch(() => {})
  const sub = AccessibilityInfo.addEventListener("reduceTransparencyChanged", setReduceTransparency)
  return () => {
    live = false
    sub.remove()
  }
}
function subscribeReduceTransparency(listener: () => void) {
  rtListeners.add(listener)
  if (!rtStop) rtStop = startReduceTransparency()
  return () => {
    rtListeners.delete(listener)
    if (!rtListeners.size && rtStop) {
      rtStop()
      rtStop = null
    }
  }
}

/**
 * The OS's Reduce Transparency setting (iOS; `prefers-reduced-transparency` on the
 * web; always false on Android, which has no such setting). Live: it follows the
 * switch while the app runs. `Glass` uses it to swap blur for a solid fill.
 */
export function useReduceTransparency() {
  return React.useSyncExternalStore(
    subscribeReduceTransparency,
    () => reduceTransparency,
    () => false
  )
}

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
 * With Reduce Transparency on, every non-Liquid path is a solid fill with a firmer border.
 */
export function Glass({ radius = 26, tint, raised = true, interactive, bar, style, children, ...rest }: GlassProps) {
  const t = useGlassTheme()
  const solid = useReduceTransparency()
  const shape = { borderRadius: radius, borderCurve: "continuous" as const }

  // GlassView follows Reduce Transparency by itself
  if (!bar && hasLiquidGlass()) {
    return (
      <GlassView glassEffectStyle="regular" colorScheme={t.scheme} tintColor={tint ?? t.glassTint} isInteractive={interactive} style={[shape, style]} {...rest}>
        {children}
      </GlassView>
    )
  }

  // Reduce Transparency: no blur, the solid fill with a border that holds its edge
  // (glassBorder is near-white and vanishes on the light fill; fillStrong is a neutral grey).
  if (solid) {
    return (
      <View
        style={[
          shape,
          { backgroundColor: t.glassSolid, borderWidth: 1, borderColor: t.fillStrong },
          raised ? Platform.select<object>({ web: { boxShadow: `0 10px 30px ${t.glassShadow}` }, android: { elevation: 2 }, default: { shadowColor: t.glassShadow, shadowOpacity: 1, shadowRadius: 15, shadowOffset: { width: 0, height: 10 } } }) : null,
          style,
        ]}
        {...rest}
      >
        {tint ? <View style={[StyleSheet.absoluteFill, shape, { pointerEvents: "none", backgroundColor: tint }]} /> : null}
        {children}
      </View>
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
