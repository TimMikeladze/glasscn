import * as React from "react"
import { View, type ViewProps } from "react-native"

import { GlassThemeProvider, useGlassTheme, type PaletteName, type Scheme } from "@/components/glass/native/tokens"

/**
 * Re-themes everything inside it: a nested GlassThemeProvider. Unset props
 * inherit from the enclosing theme.
 *
 *   <ThemeScope palette="ocean">…</ThemeScope>
 *   <ThemeScope palette="rose" scheme="dark">…</ThemeScope>
 */
function ThemeScope({ palette, scheme, children, ...props }: ViewProps & { palette?: PaletteName; /** Force a scheme for this subtree; omit to follow the parent. */ scheme?: Scheme }) {
  const parent = useGlassTheme()
  return (
    <GlassThemeProvider palette={palette ?? parent.palette} scheme={scheme ?? parent.scheme}>
      <View {...props}>{children}</View>
    </GlassThemeProvider>
  )
}

export { ThemeScope }
