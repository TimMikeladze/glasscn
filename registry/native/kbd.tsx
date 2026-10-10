import * as React from "react"
import { View, type ViewProps } from "react-native"

import { GText, useUI } from "@/components/glass/native/ui"

/** A keycap on glass. */
function Kbd({ style, children, ...props }: ViewProps) {
  const ui = useUI()
  return (
    <View
      style={[
        { height: 20, minWidth: 20, paddingHorizontal: 4, gap: 4, flexDirection: "row", alignItems: "center", justifyContent: "center", alignSelf: "flex-start" },
        { borderRadius: ui.radius.control * 0.5, borderWidth: 1, borderColor: ui.glassBorder, backgroundColor: ui.fill },
        style,
      ]}
      pointerEvents="none"
      {...props}
    >
      {React.Children.map(children, (c) =>
        typeof c === "string" || typeof c === "number" ? (
          <GText size="xs" tone="muted" weight="500" style={{ lineHeight: 14 }}>
            {c}
          </GText>
        ) : (
          c
        )
      )}
    </View>
  )
}

function KbdGroup({ style, ...props }: ViewProps) {
  return <View style={[{ flexDirection: "row", alignItems: "center", gap: 4 }, style]} {...props} />
}

export { Kbd, KbdGroup }
