import * as React from "react"
import { View, type PressableProps, type StyleProp, type TextProps, type ViewProps, type ViewStyle } from "react-native"
import { ChevronRightIcon } from "lucide-react-native"

import { Glass } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { withGlyphs } from "@/components/glass/native/segmented-control"
import { GText, alpha, useUI, web } from "@/components/glass/native/ui"

/**
 * iOS Settings-style inset grouped lists on glass.
 *
 *   <GroupedList>
 *     <GroupedListHeader>Your ritual</GroupedListHeader>
 *     <GroupedListContent>
 *       <GroupedListItem onPress={…}>
 *         <GroupedListIcon color={ui.primary}><BellIcon /></GroupedListIcon>
 *         <GroupedListTitle>Reminders</GroupedListTitle>
 *         <GroupedListValue>9:00 PM</GroupedListValue>
 *         <GroupedListChevron />
 *       </GroupedListItem>
 *     </GroupedListContent>
 *     <GroupedListFooter>Rings once each evening.</GroupedListFooter>
 *   </GroupedList>
 */
export function GroupedList({ style, ...props }: ViewProps) {
  return <View style={[{ gap: 8 }, style]} {...props} />
}

export function GroupedListHeader({ style, ...props }: TextProps) {
  return <GText accessibilityRole="header" size="xs" weight="600" tone="muted" style={[{ paddingHorizontal: 16, letterSpacing: 0.6, textTransform: "uppercase" }, style]} {...props} />
}

export function GroupedListFooter({ style, ...props }: TextProps) {
  return <GText size="xs" tone="muted" style={[{ paddingHorizontal: 16 }, style]} {...props} />
}

/** The glass card; hairlines separate its rows. */
export function GroupedListContent({ style, children, ...props }: ViewProps) {
  const ui = useUI()
  const rows = React.Children.toArray(children)
  return (
    <Glass radius={ui.radius.surface - 6} accessibilityRole="list" style={[{ overflow: "hidden" }, style]} {...props}>
      {rows.map((row, i) => (
        <React.Fragment key={React.isValidElement(row) && row.key != null ? row.key : i}>
          {i > 0 ? <View style={{ height: 1, marginLeft: 16, backgroundColor: alpha(ui.foreground, 0.09) }} /> : null}
          {row}
        </React.Fragment>
      ))}
    </Glass>
  )
}

const ItemContext = React.createContext({ destructive: false })

type GroupedListItemProps = Omit<PressableProps, "style" | "children"> & {
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
  /** A destructive action row (Delete, Sign out): the title turns red. */
  destructive?: boolean
  /** Highlighted, like aria-selected. */
  selected?: boolean
}

/** A row. Give it `onPress` to make it interactive (replaces the web `asChild` button). */
export function GroupedListItem({ style, children, destructive = false, selected, onPress, ...props }: GroupedListItemProps) {
  const ui = useUI()
  const ctx = React.useMemo(() => ({ destructive }), [destructive])
  const base: StyleProp<ViewStyle> = [
    { flexDirection: "row", alignItems: "center", gap: 14, minHeight: 52, paddingHorizontal: 16, paddingVertical: 10, width: "100%" },
    selected && { backgroundColor: ui.fill },
    style,
  ]
  return (
    <ItemContext.Provider value={ctx}>
      {onPress ? (
        <Press squash={1} onPress={onPress} accessibilityRole="button" aria-selected={selected} style={[base, web({ cursor: "pointer" })]} {...props}>
          {children}
        </Press>
      ) : (
        <View role="listitem" style={base} {...(props as ViewProps)}>
          {children}
        </View>
      )}
    </ItemContext.Provider>
  )
}

/** A coloured rounded-square glyph tile. Colour it with `color`. */
export function GroupedListIcon({ color, style, children, ...props }: ViewProps & { color?: string }) {
  const ui = useUI()
  return (
    <View
      style={[{ width: 30, height: 30, borderRadius: ui.radius.control * 0.75, borderCurve: "continuous", alignItems: "center", justifyContent: "center", backgroundColor: color ?? ui.primary }, style]}
      {...props}
    >
      {withGlyphs(children, { color: "#FFFFFF", size: 16 })}
    </View>
  )
}

export function GroupedListTitle({ style, children, ...props }: ViewProps) {
  const ui = useUI()
  const { destructive } = React.useContext(ItemContext)
  return (
    <View style={[{ flex: 1, minWidth: 0, gap: 2 }, style]} {...props}>
      {React.Children.map(children, (c) =>
        typeof c === "string" || typeof c === "number" ? (
          <GText style={{ fontSize: 15.2 }} color={destructive ? ui.destructive : ui.foreground} numberOfLines={1}>
            {c}
          </GText>
        ) : (
          c
        )
      )}
    </View>
  )
}

export function GroupedListDescription({ style, ...props }: TextProps) {
  return <GText size="xs" tone="muted" style={style} {...props} />
}

export function GroupedListValue({ style, ...props }: TextProps) {
  return <GText size="sm" tone="muted" numberOfLines={1} style={[{ maxWidth: "45%" }, style]} {...props} />
}

export function GroupedListChevron({ size = 16, color }: { size?: number; color?: string }) {
  const ui = useUI()
  return <ChevronRightIcon size={size} color={color ?? alpha(ui.mutedForeground, 0.7)} aria-hidden />
}
