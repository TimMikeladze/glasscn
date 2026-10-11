import * as React from "react"
import { ActivityIndicator, type ActivityIndicatorProps } from "react-native"

import { useUI } from "@/components/glass/native/ui"

/** The platform activity indicator (iOS's radial ticks), announced as "Loading" unless labelled. */
function Spinner({ variant = "ring", color, accessibilityLabel = "Loading", ...props }: ActivityIndicatorProps & { variant?: "ring" | "ticks" }) {
  const ui = useUI()
  return <ActivityIndicator data-variant={variant} accessibilityRole="progressbar" accessibilityLabel={accessibilityLabel} color={color ?? ui.mutedForeground} {...props} />
}

export { Spinner }
