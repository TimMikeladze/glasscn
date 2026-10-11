import * as React from "react"
import { View, type ViewProps, type ViewStyle } from "react-native"

import { Glass } from "@/components/glass/native/glass"
import { Separator } from "@/components/glass/native/separator"
import { GText, useUI, type GTextProps } from "@/components/glass/native/ui"

/** Buttons joined into one control (inner corners squared); `variant="glass"` floats them on one liquid capsule. */
function ButtonGroup({ orientation = "horizontal", variant = "default", style, children, ...props }: ViewProps & { orientation?: "horizontal" | "vertical"; variant?: "default" | "glass" }) {
  const ui = useUI()
  const row = orientation === "horizontal"
  const kids = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<{ style?: ViewStyle }>[]
  const joined = kids.map((c, i) => {
    if (variant === "glass") return React.cloneElement(c, { key: i, style: [c.props.style, { backgroundColor: "transparent" }] as unknown as ViewStyle })
    const first = i === 0
    const last = i === kids.length - 1
    const square: ViewStyle = row
      ? { ...(first ? {} : { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }), ...(last ? {} : { borderTopRightRadius: 0, borderBottomRightRadius: 0 }) }
      : { ...(first ? {} : { borderTopLeftRadius: 0, borderTopRightRadius: 0 }), ...(last ? {} : { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }) }
    return React.cloneElement(c, { key: i, style: [c.props.style, square] as unknown as ViewStyle })
  })
  const layout: ViewStyle = { flexDirection: row ? "row" : "column", alignItems: "stretch", alignSelf: "flex-start" }
  if (variant === "glass")
    return (
      <Glass role="group" radius={ui.radius.button} raised={false} style={[layout, { padding: 4 }, style]} {...props}>
        {joined}
      </Glass>
    )
  return (
    <View role="group" style={[layout, style]} {...props}>
      {joined}
    </View>
  )
}

function ButtonGroupText({ style, ...props }: GTextProps) {
  const ui = useUI()
  return <GText size="sm" weight="500" style={[{ backgroundColor: ui.fill, paddingHorizontal: ui.pad.sm, textAlignVertical: "center", borderRadius: ui.radius.control }, style]} {...props} />
}

function ButtonGroupSeparator({ orientation = "vertical", ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator orientation={orientation} {...props} />
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText }
