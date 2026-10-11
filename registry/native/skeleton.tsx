import * as React from "react"
import { type ViewProps } from "react-native"
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { useUI } from "@/components/glass/native/ui"

/**
 * A loading placeholder: a fill that breathes softly (Reanimated, on the UI
 * thread); still under Reduce Motion. Hidden from assistive tech — announce the
 * loading state on the container. Never wrap glass in one: it fades.
 */
function Skeleton({ style, ...props }: ViewProps) {
  const ui = useUI()
  const still = useReducedMotion() || ui.motion.duration === 0
  const pulse = useSharedValue(1)
  React.useEffect(() => {
    if (still) {
      cancelAnimation(pulse)
      pulse.set(1)
      return
    }
    pulse.set(withRepeat(withTiming(0.55, { duration: 800, easing: Easing.inOut(Easing.quad) }), -1, true))
    return () => cancelAnimation(pulse)
  }, [pulse, still])
  const breathe = useAnimatedStyle(() => ({ opacity: pulse.value }))
  return <Animated.View aria-hidden importantForAccessibility="no-hide-descendants" style={[{ backgroundColor: ui.fill, borderRadius: ui.radius.control - 4 }, style, breathe]} {...props} />
}

export { Skeleton }
