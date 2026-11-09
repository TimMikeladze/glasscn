import * as React from "react"
import { Image, I18nManager, View, type ViewProps } from "react-native"

import { useGlassTheme } from "@/components/glass/native/tokens"

export type BackgroundExtensionProps = ViewProps & {
  src: string
  alt?: string
  start?: number
  end?: number
}

/** Image-only mirrored/softened extension; native system chrome remains separate. */
export function BackgroundExtension({ src, alt = "", start = 0, end = 0, children, style, onLayout, ...props }: BackgroundExtensionProps) {
  const t = useGlassTheme()
  const [width, setWidth] = React.useState(0)
  const extent = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0
  const mirror = (side: "start" | "end", size: number) => {
    const leading = (side === "start") !== I18nManager.isRTL
    return size > 0 && width > 0 ? <View key={side} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: "absolute", top: 0, bottom: 0, width: size, [leading ? "right" : "left"]: "100%", overflow: "hidden" }}>
      <Image source={{ uri: src }} alt="" blurRadius={t.blur} accessible={false} style={{ position: "absolute", top: 0, bottom: 0, width, height: "100%", [leading ? "right" : "left"]: 0, transform: [{ scaleX: -1 }] }} />
    </View> : null
  }
  return <View onLayout={(event) => { setWidth(event.nativeEvent.layout.width); onLayout?.(event) }} style={[{ position: "relative", width: "100%", aspectRatio: 16 / 9 }, style]} {...props}>
    {mirror("start", extent(start))}{mirror("end", extent(end))}
    <Image source={{ uri: src }} alt={alt} accessibilityLabel={alt || undefined} accessible={!!alt} style={{ position: "absolute", width: "100%", height: "100%" }} />
    {children}
  </View>
}
