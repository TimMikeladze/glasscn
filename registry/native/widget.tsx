import * as React from "react"
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"

import { Glass } from "@/components/glass/native/glass"
import { GText, useUI, type GTextProps } from "@/components/glass/native/ui"

const SIZES = {
  small: { width: 170, height: 170 },
  medium: { width: 364, height: 170 },
  large: { width: 364, height: 382 },
  extraLarge: { width: 768, height: 382 },
  circular: { width: 76, height: 76 },
  rectangular: { width: 172, height: 76 },
  inline: { height: 24 },
} as const

type WidgetSize = keyof typeof SIZES
const WidgetContext = React.createContext<{ size: WidgetSize; accented: boolean }>({ size: "small", accented: false })

/** A glanceable widget at Apple's sizes — the web's Widget. Home-screen sizes are glass; lock-screen accessories sit on the ground. */
export function Widget({ size = "small", accented = false, style, children, ...props }: Omit<ViewProps, "style"> & { size?: WidgetSize; accented?: boolean; style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  const value = React.useMemo(() => ({ size, accented }), [size, accented])
  const accessory = size === "circular" || size === "rectangular" || size === "inline"
  const box = { ...SIZES[size], maxWidth: "100%" as const, overflow: "hidden" as const }
  return (
    <WidgetContext.Provider value={value}>
      {accessory ? (
        <View
          style={[box, { alignItems: size === "rectangular" ? "flex-start" : "center", justifyContent: "center", flexDirection: size === "inline" ? "row" : "column", gap: 4 }, size === "circular" && { borderRadius: 38, backgroundColor: ui.fill }, style]}
          {...props}
        >
          {children}
        </View>
      ) : (
        <Glass radius={ui.radius.surface} style={[box, { padding: 16, gap: 8 }, style]} {...props}>
          {children}
        </Glass>
      )}
    </WidgetContext.Provider>
  )
}

export function WidgetHeader({ style, ...props }: ViewProps) {
  return <View style={[{ flexDirection: "row", alignItems: "center", gap: 6 }, style]} {...props} />
}

export function WidgetTitle(props: GTextProps) {
  const { accented } = React.useContext(WidgetContext)
  return <GText size="xs" weight="600" tone={accented ? "primary" : "muted"} numberOfLines={1} {...props} style={[{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4 }, props.style]} />
}

export function WidgetValue(props: GTextProps) {
  const { size, accented } = React.useContext(WidgetContext)
  return <GText font="display" size={size === "circular" || size === "inline" ? "base" : size === "rectangular" ? "xl" : "3xl"} tone={accented ? "primary" : "default"} numberOfLines={1} {...props} />
}

export function WidgetDescription(props: GTextProps) {
  return <GText tone="muted" numberOfLines={1} {...props} style={[{ fontSize: 11 }, props.style]} />
}

export function WidgetContent({ style, ...props }: ViewProps) {
  return <View style={[{ flex: 1, minHeight: 0, gap: 8 }, style]} {...props} />
}
