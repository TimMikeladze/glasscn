import * as React from "react"
import { View, type ViewProps } from "react-native"

import { alpha, useUI } from "@/components/glass/native/ui"

/** A hairline that reads on glass: the foreground at 10%, not the page border. */
function Separator({ orientation = "horizontal", decorative = true, style, ...props }: ViewProps & { orientation?: "horizontal" | "vertical"; decorative?: boolean }) {
  const ui = useUI()
  const horizontal = orientation === "horizontal"
  return (
    <View
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      accessible={!decorative}
      style={[{ flexShrink: 0, backgroundColor: alpha(ui.foreground, 0.1) }, horizontal ? { height: 1, width: "100%" } : { width: 1, alignSelf: "stretch" }, style]}
      {...props}
    />
  )
}

export { Separator }
