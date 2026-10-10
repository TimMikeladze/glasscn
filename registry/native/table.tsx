import * as React from "react"
import { Pressable, ScrollView, StyleSheet, View, type GestureResponderEvent, type ViewProps, type TextStyle } from "react-native"

import { GText, useUI, web, type TextTone } from "@/components/glass/native/ui"

/**
 * shadcn's Table on glass, drawn with Views. It has no pane of its own — put it
 * inside a Card: hairline rows, fill on hover and selection, muted small headers
 * and tabular numerals. Wide tables scroll sideways.
 *
 *   <Table>
 *     <TableHeader><TableRow><TableHead>Day</TableHead></TableRow></TableHeader>
 *     <TableBody><TableRow><TableCell>Monday</TableCell></TableRow></TableBody>
 *   </Table>
 *
 * Cells share a row by `colSpan` (flex weight) with a `minWidth` floor; pass
 * `style={{ flex: 0, width }}` for a fixed column. `align` replaces `text-right`.
 */
type Section = "header" | "body" | "footer"
const SectionContext = React.createContext<Section>("body")
const RowContext = React.createContext<{ last: boolean }>({ last: false })

/** A table's minimum column width before it starts to scroll sideways. */
const MIN_CELL = 88

function Table({ style, children, minWidth, ...props }: ViewProps & { minWidth?: number }) {
  const all = React.Children.toArray(children)
  const captions = all.filter((c) => React.isValidElement(c) && c.type === TableCaption)
  const rest = all.filter((c) => !(React.isValidElement(c) && c.type === TableCaption))
  return (
    <View style={{ width: "100%" }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View role="table" style={[{ flexGrow: 1, minWidth }, style]} {...props}>
          {rest}
        </View>
      </ScrollView>
      {captions}
    </View>
  )
}

function lastAware(children: React.ReactNode) {
  const rows = React.Children.toArray(children)
  return rows.map((row, i) => (
    <RowContext.Provider key={React.isValidElement(row) && row.key != null ? row.key : i} value={{ last: i === rows.length - 1 }}>
      {row}
    </RowContext.Provider>
  ))
}

function TableHeader({ children, ...props }: ViewProps) {
  return (
    <SectionContext.Provider value="header">
      <View {...props}>{children}</View>
    </SectionContext.Provider>
  )
}

function TableBody({ children, ...props }: ViewProps) {
  return (
    <SectionContext.Provider value="body">
      <View {...props}>{lastAware(children)}</View>
    </SectionContext.Provider>
  )
}

function TableFooter({ style, children, ...props }: ViewProps) {
  const ui = useUI()
  return (
    <SectionContext.Provider value="footer">
      <View style={[{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: ui.glassBorder, backgroundColor: ui.fill }, style]} {...props}>
        {lastAware(children)}
      </View>
    </SectionContext.Provider>
  )
}

type TableRowProps = ViewProps & {
  /** data-state="selected": a fill behind the row. */
  selected?: boolean
  /** Makes the row pressable (and focusable on web — Enter opens). */
  onPress?: (e: GestureResponderEvent) => void
}

function TableRow({ style, selected, onPress, ...props }: TableRowProps) {
  const ui = useUI()
  const section = React.useContext(SectionContext)
  const { last } = React.useContext(RowContext)
  const [hover, setHover] = React.useState(false)
  const border = section === "header" || !last
  const rowStyle = [
    {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      borderBottomWidth: border ? StyleSheet.hairlineWidth : 0,
      borderBottomColor: ui.glassBorder,
      backgroundColor: selected ? (hover ? ui.fillStrong : ui.fill) : hover && section === "body" ? ui.fill : "transparent",
    },
    web({ transitionProperty: "background-color", transitionDuration: `${ui.motion.duration}ms`, cursor: onPress ? "pointer" : undefined }),
    style,
  ]
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        aria-selected={selected || undefined}
        onPress={onPress}
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        onPressIn={() => setHover(true)}
        onPressOut={() => setHover(false)}
        style={rowStyle}
        {...(props as object)}
      />
    )
  }
  return (
    <View
      // Pointer hover on react-native-web; native never fires these.
      {...({ onPointerEnter: () => setHover(true), onPointerLeave: () => setHover(false) } as object)}
      style={rowStyle}
      role="row"
      aria-selected={selected || undefined}
      {...props}
    />
  )
}

type CellProps = ViewProps & {
  colSpan?: number
  align?: "left" | "center" | "right"
  minWidth?: number
  /** Overrides for the wrapped text of string children. */
  textStyle?: TextStyle
  tone?: TextTone
  weight?: TextStyle["fontWeight"]
}

function cellText(children: React.ReactNode, el: (text: React.ReactNode) => React.ReactNode) {
  const kids = React.Children.toArray(children)
  if (kids.length && kids.every((c) => typeof c === "string" || typeof c === "number")) return el(kids.join(""))
  // mixed content: wrap each bare string so native never sees text outside <Text>
  return kids.map((c, i) => (typeof c === "string" || typeof c === "number" ? <React.Fragment key={i}>{el(c)}</React.Fragment> : c))
}

function justify(align: CellProps["align"]) {
  return align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start"
}

function TableHead({ style, colSpan = 1, align = "left", minWidth = MIN_CELL, textStyle, tone = "muted", weight = "500", children, ...props }: CellProps) {
  const ui = useUI()
  return (
    <View
      role="columnheader"
      style={[
        { flex: colSpan, minWidth: minWidth * colSpan, height: ui.control.default, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: justify(align) },
        style,
      ]}
      {...props}
    >
      {cellText(children, (t) => (
        <GText size="xs" tone={tone} weight={weight} numberOfLines={1} align={align} style={textStyle}>
          {t}
        </GText>
      ))}
    </View>
  )
}

function TableCell({ style, colSpan = 1, align = "left", minWidth = MIN_CELL, textStyle, tone, weight, children, ...props }: CellProps) {
  const section = React.useContext(SectionContext)
  return (
    <View
      role="cell"
      style={[
        { flex: colSpan, minWidth: minWidth * colSpan, paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: justify(align) },
        style,
      ]}
      {...props}
    >
      {cellText(children, (t) => (
        <GText
          size="sm"
          tone={tone}
          weight={weight ?? (section === "footer" ? "500" : undefined)}
          numberOfLines={1}
          align={align}
          style={[{ fontVariant: ["tabular-nums"] }, textStyle]}
        >
          {t}
        </GText>
      ))}
    </View>
  )
}

function TableCaption({ style, children, ...props }: ViewProps) {
  return (
    <View style={[{ marginTop: 16, alignItems: "center" }, style]} {...props}>
      {cellText(children, (t) => (
        <GText size="sm" tone="muted" align="center">
          {t}
        </GText>
      ))}
    </View>
  )
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
