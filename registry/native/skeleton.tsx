import * as React from "react"
import { AccessibilityInfo, Animated, type ViewProps } from "react-native"

import { useUI } from "@/components/glass/native/ui"

/** A loading placeholder: a fill that breathes softly; still under reduce motion. Hidden from assistive tech. */
function Skeleton({ style, ...props }: ViewProps) {
  const ui = useUI()
  const [pulse] = React.useState(() => new Animated.Value(1))
  React.useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((reduced) => {
        if (reduced) return
        loop = Animated.loop(Animated.sequence([Animated.timing(pulse, { toValue: 0.55, duration: 800, useNativeDriver: true }), Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true })]))
        loop.start()
      })
      .catch(() => {})
    return () => loop?.stop()
  }, [pulse])
  return <Animated.View aria-hidden importantForAccessibility="no-hide-descendants" style={[{ backgroundColor: ui.fill, borderRadius: ui.radius.control - 4, opacity: pulse }, style]} {...props} />
}

export { Skeleton }
