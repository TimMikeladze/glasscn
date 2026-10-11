import * as React from "react"
import { I18nManager, StyleSheet, View, type PressableProps, type StyleProp, type TextProps, type ViewProps, type ViewStyle } from "react-native"
import { ChevronRightIcon } from "lucide-react-native"

import { MAX_FONT_SCALE } from "@/components/glass/native/a11y"
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

/** iOS 26 section header: sentence case, not the old all-caps caption (NAT-73). */
export function GroupedListHeader({ style, ...props }: TextProps) {
  return <GText accessibilityRole="header" size="sm" weight="600" tone="muted" style={[{ paddingHorizontal: 16, marginStart: 4 }, style]} {...props} />
}

export function GroupedListFooter({ style, ...props }: TextProps) {
  return <GText size="xs" tone="muted" style={[{ paddingHorizontal: 16, marginStart: 4 }, style]} {...props} />
}

const ICON = 30
const GAP = 14
const PAD = 16
/** Whether a row leads with a GroupedListIcon — its separator then starts at the text. */
const hasIcon = (row: React.ReactNode) =>
  React.isValidElement<{ children?: React.ReactNode }>(row) && React.Children.toArray(row.props.children).some((c) => React.isValidElement(c) && c.type === GroupedListIcon)

/** The glass card (the content layer: material, never liquid); hairlines separate its rows, inset to the text. */
export function GroupedListContent({ style, children, ...props }: ViewProps) {
  const ui = useUI()
  const rows = React.Children.toArray(children)
  return (
    <Glass variant="material" radius={ui.radius.surface - 6} accessibilityRole="list" style={[{ overflow: "hidden" }, style]} {...props}>
      {rows.map((row, i) => (
        <React.Fragment key={React.isValidElement(row) && row.key != null ? row.key : i}>
          {i > 0 ? <View style={{ height: StyleSheet.hairlineWidth, marginStart: PAD + (hasIcon(row) ? ICON + GAP : 0), backgroundColor: ui.separator }} /> : null}
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
    { flexDirection: "row", alignItems: "center", gap: GAP, minHeight: 52, paddingHorizontal: PAD, paddingVertical: 10, width: "100%" },
    selected && { backgroundColor: ui.fill },
    style,
  ]
  return (
    <ItemContext.Provider value={ctx}>
      {onPress ? (
        <Press squash={1} dim onPress={onPress} accessibilityRole="button" aria-selected={selected} accessibilityState={{ selected }} style={[base, web({ cursor: "pointer" })]} {...props}>
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
      style={[{ width: ICON, height: ICON, borderRadius: ui.radius.control * 0.75, borderCurve: "continuous", alignItems: "center", justifyContent: "center", backgroundColor: color ?? ui.primary }, style]}
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
          // iOS body: 17pt
          <GText style={{ fontSize: 17, lineHeight: 22 }} maxFontSizeMultiplier={MAX_FONT_SCALE.body} color={destructive ? ui.destructive : ui.foreground} numberOfLines={1}>
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
  return <ChevronRightIcon size={size} color={color ?? alpha(ui.mutedForeground, 0.7)} style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined} aria-hidden />
}
