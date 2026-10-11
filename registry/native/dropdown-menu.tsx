import * as React from "react"
import { Platform, ScrollView, StyleSheet, View, type ViewProps } from "react-native"
import { MenuView, type MenuAction } from "@expo/ui/community/menu"
import { CheckIcon, ChevronRightIcon } from "lucide-react-native"

import { textChildren, useControllableOpen } from "@/components/glass/native/dialog"
import { Floating, useAnchorRect, type Align, type Side } from "@/components/glass/native/popover"
import { Press, haptics } from "@/components/glass/native/press"
import { GText, alpha, useUI, web, type GTextProps, type UI } from "@/components/glass/native/ui"

type MenuCtx = { open: boolean; setOpen: (open: boolean) => void; triggerRef: React.RefObject<View | null> }
const MenuContext = React.createContext<MenuCtx | null>(null)
function useMenu() {
  const ctx = React.useContext(MenuContext)
  if (!ctx) throw new Error("DropdownMenu parts must be inside <DropdownMenu>")
  return ctx
}

export type DropdownMenuProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * iOS / Android: a menu of plain items (text, `systemImage`, destructive, checkbox,
   * radio, labels, separators, sub-menus) opens as the system menu (@expo/ui — SwiftUI
   * `Menu`, Compose `DropdownMenu`). Custom content, a controlled `open`, and
   * `native={false}` use the glass menu. The web always uses the glass menu.
   */
  native?: boolean
  children?: React.ReactNode
}

/** Root: open state, controlled (`open`/`onOpenChange`) or not (`defaultOpen`). */
function DropdownMenu({ open, defaultOpen, onOpenChange, native = true, children, longPress = false }: DropdownMenuProps & { /** @internal context-menu */ longPress?: boolean }) {
  const [value, setOpen] = useControllableOpen(open, defaultOpen, onOpenChange)
  const triggerRef = React.useRef<View>(null)
  const ctx = React.useMemo(() => ({ open: value, setOpen, triggerRef }), [value, setOpen])
  const plan = Platform.OS !== "web" && native && (longPress || (open === undefined && !defaultOpen)) ? nativePlan(children) : null
  if (plan) return <SystemMenu plan={plan} longPress={longPress} onOpenChange={onOpenChange} />
  return <MenuContext.Provider value={ctx}>{children}</MenuContext.Provider>
}

// ---- the system menu: the same parts, read as data ----

type Plan = { trigger: React.ReactElement<PressProps>; actions: MenuAction[]; handlers: Map<string, () => void> }

/** Text of a part's children, skipping shortcuts and icons. */
const textOf = (node: React.ReactNode): string =>
  typeof node === "string" || typeof node === "number"
    ? String(node)
    : Array.isArray(node)
      ? node.map(textOf).filter(Boolean).join(" ").replace(/\s+/g, " ").trim()
      : React.isValidElement<{ children?: React.ReactNode }>(node) && node.type !== DropdownMenuShortcut && node.type !== React.Fragment
        ? textOf(node.props.children)
        : React.isValidElement<{ children?: React.ReactNode }>(node) && node.type === React.Fragment
          ? textOf(node.props.children)
          : ""

const flat = (children: React.ReactNode): React.ReactElement[] =>
  React.Children.toArray(children).flatMap((c) => (React.isValidElement<{ children?: React.ReactNode }>(c) && c.type === React.Fragment ? flat(c.props.children) : React.isValidElement(c) ? [c] : []))

const kind = (el: React.ReactElement) => (el.type as { menuPart?: string }).menuPart

const event = () => ({ defaultPrevented: false, preventDefault() {} })

/** Plain items → MenuAction[], or null when anything custom is inside (then the glass menu renders it). */
function toActions(children: React.ReactNode, handlers: Map<string, () => void>, radio?: { value?: string; onValueChange?: (v: string) => void }): MenuAction[] | null {
  const sections: { title?: string; items: MenuAction[] }[] = [{ items: [] }]
  const add = (a: MenuAction) => sections[sections.length - 1].items.push(a)
  for (const el of flat(children)) {
    const p = el.props as Record<string, unknown> & { children?: React.ReactNode }
    const id = `${handlers.size}`
    switch (kind(el)) {
      case "item": {
        const title = textOf(p.children)
        if (!title) return null
        const onSelect = p.onSelect as ((e: SelectEvent) => void) | undefined
        handlers.set(id, () => onSelect?.(event()))
        add({ id, title, image: p.systemImage as MenuAction["image"], attributes: { destructive: p.variant === "destructive", disabled: !!p.disabled } })
        break
      }
      case "checkbox": {
        const title = textOf(p.children)
        if (!title) return null
        const checked = !!p.checked
        handlers.set(id, () => ((p.onCheckedChange as ((c: boolean) => void) | undefined)?.(!checked), (p.onSelect as ((e: SelectEvent) => void) | undefined)?.(event())))
        add({ id, title, image: p.systemImage as MenuAction["image"], state: checked ? "on" : "off", attributes: { disabled: !!p.disabled } })
        break
      }
      case "radio": {
        const title = textOf(p.children)
        if (!title || !radio) return null
        const value = p.value as string
        handlers.set(id, () => (radio.onValueChange?.(value), (p.onSelect as ((e: SelectEvent) => void) | undefined)?.(event())))
        add({ id, title, image: p.systemImage as MenuAction["image"], state: radio.value === value ? "on" : "off", attributes: { disabled: !!p.disabled } })
        break
      }
      case "radio-group":
      case "group": {
        const inner = toActions(p.children, handlers, kind(el) === "radio-group" ? { value: p.value as string | undefined, onValueChange: p.onValueChange as ((v: string) => void) | undefined } : radio)
        if (!inner) return null
        inner.forEach(add)
        break
      }
      case "label":
        sections.push({ title: textOf(p.children), items: [] })
        break
      case "separator":
        sections.push({ items: [] })
        break
      case "sub": {
        const parts = flat(p.children)
        const trigger = parts.find((c) => kind(c) === "sub-trigger")
        const content = parts.find((c) => kind(c) === "sub-content")
        const title = trigger ? textOf((trigger.props as { children?: React.ReactNode }).children) : ""
        const inner = content ? toActions((content.props as { children?: React.ReactNode }).children, handlers, radio) : null
        if (!title || !inner) return null
        add({ id: `${id}-sub`, title, image: (trigger?.props as { systemImage?: MenuAction["image"] }).systemImage, subactions: inner })
        break
      }
      default:
        return null
    }
  }
  const used = sections.filter((s) => s.items.length || s.title)
  if (used.length <= 1 && !used[0]?.title) return used[0]?.items ?? []
  return used.map((s, i) => (s.items.length ? { id: `section-${i}`, title: s.title ?? "", displayInline: true, subactions: s.items } : { id: `section-${i}`, title: s.title ?? "", attributes: { disabled: true } }))
}

/** The menu's parts as a system-menu plan, or null when it has custom content. */
function nativePlan(children: React.ReactNode): Plan | null {
  let trigger: React.ReactElement<PressProps> | null = null
  let actions: MenuAction[] | null = null
  const handlers = new Map<string, () => void>()
  for (const el of flat(children)) {
    if (kind(el) === "trigger") trigger = el as React.ReactElement<PressProps>
    else if (kind(el) === "content") actions = toActions((el.props as { children?: React.ReactNode }).children, handlers)
    else return null
  }
  return trigger && actions?.length ? { trigger, actions, handlers } : null
}

/** iOS / Android: the trigger's face inside the system menu (the menu owns the touch). */
function SystemMenu({ plan, longPress, onOpenChange }: { plan: Plan; longPress: boolean; onOpenChange?: (open: boolean) => void }) {
  const ui = useUI()
  const { style, children, accessibilityLabel } = plan.trigger.props
  const face = typeof style === "function" ? style({ pressed: false, hovered: false }) : style
  return (
    <MenuView
      actions={plan.actions}
      shouldOpenOnLongPress={longPress}
      onOpenMenu={() => onOpenChange?.(true)}
      onCloseMenu={() => onOpenChange?.(false)}
      onPressAction={({ nativeEvent }) => {
        haptics.selection()
        plan.handlers.get(nativeEvent.event)?.()
      }}
      style={{ alignSelf: "flex-start" }}
    >
      {/* SwiftUI hosts this (matchContents) and sizes it from the outer view: keep the styled face
          one level down, or a bare string measures to zero width */}
      <View pointerEvents="none" accessibilityRole="button" accessibilityLabel={accessibilityLabel} aria-haspopup="menu">
        <View style={[{ minHeight: ui.control.default, flexDirection: "row", alignItems: "center", justifyContent: "center" }, face]}>{textChildren(children)}</View>
      </View>
    </MenuView>
  )
}

/** Content already renders in its own Modal; kept for API parity. */
function DropdownMenuPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

type PressProps = Omit<React.ComponentProps<typeof Press>, "children"> & { children?: React.ReactNode }

/** Toggles the menu; the menu anchors to it. */
function DropdownMenuTrigger({ children, onPress, style, ...props }: PressProps) {
  const { open, setOpen, triggerRef } = useMenu()
  return (
    <View ref={triggerRef} collapsable={false} style={{ alignSelf: "flex-start" }}>
      <Press
        accessibilityRole="button"
        aria-expanded={open}
        aria-haspopup="menu"
        style={style}
        {...props}
        onPress={(e) => {
          onPress?.(e)
          setOpen(!open)
        }}
      >
        {textChildren(children)}
      </Press>
    </View>
  )
}

/** The liquid-glass menu: below the trigger, start-aligned, flips up when it won't fit; scrolls past the window. */
function DropdownMenuContent({ style, children, side = "bottom", align = "start", sideOffset = 6, ...props }: ViewProps & { side?: Side; align?: Align; sideOffset?: number }) {
  const { open, setOpen, triggerRef } = useMenu()
  const target = React.useCallback(() => triggerRef.current, [triggerRef])
  const rect = useAnchorRect(open, target)
  return (
    <Floating open={open} anchor={rect} onClose={() => setOpen(false)} side={side} align={align} sideOffset={sideOffset} role="menu" style={[{ minWidth: 176, padding: 6, overflow: "hidden" }, style]} {...props}>
      <ScrollView style={{ flexGrow: 0 }} bounces={false} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </Floating>
  )
}

/** Groups related items. */
function DropdownMenuGroup(props: ViewProps) {
  return <View role="group" {...props} />
}

type SelectEvent = { defaultPrevented: boolean; preventDefault: () => void }

/** Item colours: icons take the muted label colour (destructive items: all red) unless given one. */
function itemChildren(children: React.ReactNode, ui: UI, color: string, iconColor: string) {
  return React.Children.map(children, (c) => {
    if (typeof c === "string" || typeof c === "number") return <GText size="sm" color={color}>{c}</GText>
    if (React.isValidElement<{ color?: string; size?: number }>(c) && c.type !== DropdownMenuShortcut && typeof c.type !== "string" && c.props.color === undefined) {
      return React.cloneElement(c, { color: iconColor, size: c.props.size ?? 16 })
    }
    return c
  })
}

type ItemBase = Omit<PressProps, "onPress" | "role"> & {
  inset?: boolean
  disabled?: boolean
  onSelect?: (event: SelectEvent) => void
  /** iOS system menu: an SF Symbol for the row (lucide icons only draw in the glass menu). */
  systemImage?: string
}

/** One row of the menu: highlights on hover/press, runs `onSelect`, then closes (unless `event.preventDefault()`). */
function MenuRow({ children, inset, disabled, onSelect, style, role = "menuitem", checked, trailing, color, iconColor, highlight, systemImage, ...props }: ItemBase & { role?: "menuitem" | "checkbox" | "radio"; checked?: boolean; trailing?: React.ReactNode; color?: string; iconColor?: string; highlight?: string }) {
  const ui = useUI()
  const { setOpen } = useMenu()
  const [hover, setHover] = React.useState(false)
  void systemImage // the system menu's; the glass row draws its lucide icon
  return (
    <Press
      role={role}
      aria-checked={checked} aria-disabled={!!disabled}
      disabled={disabled}
      squash={0.99}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      onPressIn={() => setHover(true)}
      onPressOut={() => setHover(false)}
      onPress={() => {
        const event: SelectEvent = {
          defaultPrevented: false,
          preventDefault: () => {
            event.defaultPrevented = true
          },
        }
        haptics.selection()
        onSelect?.(event)
        if (!event.defaultPrevented) setOpen(false)
      }}
      style={[
        styles.item,
        { borderRadius: ui.radius.control - 4, paddingLeft: inset ? 34 : 10, paddingRight: trailing ? 32 : 10, backgroundColor: hover ? (highlight ?? ui.fillStrong) : "transparent", opacity: disabled ? 0.5 : 1 },
        web({ cursor: disabled ? "default" : "pointer", outlineStyle: "none" }),
        style,
      ]}
      {...props}
    >
      {itemChildren(children, ui, color ?? ui.foreground, iconColor ?? ui.mutedForeground)}
      {trailing ? <View style={styles.indicator}>{trailing}</View> : null}
    </Press>
  )
}

/** An action. `variant="destructive"` tints it red. */
function DropdownMenuItem({ variant = "default", ...props }: ItemBase & { variant?: "default" | "destructive" }) {
  const ui = useUI()
  const destructive = variant === "destructive"
  return <MenuRow color={destructive ? ui.destructive : undefined} iconColor={destructive ? ui.destructive : undefined} highlight={destructive ? alpha(ui.destructive, 0.12) : undefined} {...props} />
}

/** A toggle row with a check on the right. */
function DropdownMenuCheckboxItem({ checked = false, onCheckedChange, onSelect, ...props }: ItemBase & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }) {
  const ui = useUI()
  return (
    <MenuRow
      role="checkbox"
      checked={checked}
      trailing={checked ? <CheckIcon size={16} color={ui.primary} /> : null}
      onSelect={(e) => {
        onCheckedChange?.(!checked)
        onSelect?.(e)
      }}
      {...props}
    />
  )
}

const RadioContext = React.createContext<{ value?: string; onValueChange?: (value: string) => void }>({})

/** One-of-many rows; `value`/`onValueChange`. */
function DropdownMenuRadioGroup({ value, onValueChange, ...props }: ViewProps & { value?: string; onValueChange?: (value: string) => void }) {
  const ctx = React.useMemo(() => ({ value, onValueChange }), [value, onValueChange])
  return (
    <RadioContext.Provider value={ctx}>
      <View role="group" {...props} />
    </RadioContext.Provider>
  )
}

/** A radio row: checked when its `value` is the group's. */
function DropdownMenuRadioItem({ value, onSelect, ...props }: ItemBase & { value: string }) {
  const ui = useUI()
  const group = React.useContext(RadioContext)
  const checked = group.value === value
  return (
    <MenuRow
      role="radio"
      checked={checked}
      trailing={checked ? <CheckIcon size={16} color={ui.primary} /> : null}
      onSelect={(e) => {
        group.onValueChange?.(value)
        onSelect?.(e)
      }}
      {...props}
    />
  )
}

/** A section label, sentence case like Apple's menus (NAT-55). */
function DropdownMenuLabel({ inset, style, ...props }: GTextProps & { inset?: boolean }) {
  return <GText size="xs" tone="muted" weight="600" style={[{ paddingHorizontal: 10, paddingLeft: inset ? 34 : 10, paddingTop: 8, paddingBottom: 4 }, style]} {...props} />
}

/** A hairline between groups, edge to edge. */
function DropdownMenuSeparator({ style, ...props }: ViewProps) {
  const ui = useUI()
  return <View role="separator" style={[{ height: StyleSheet.hairlineWidth * 2, marginHorizontal: -6, marginVertical: 6, backgroundColor: alpha(ui.foreground, 0.1) }, style]} {...props} />
}

/** A keyboard hint at the row's end. */
function DropdownMenuShortcut({ style, ...props }: GTextProps) {
  return <GText size="xs" tone="muted" style={[{ marginLeft: "auto", letterSpacing: 1.5 }, style]} {...props} />
}

const SubContext = React.createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null)
function useSub() {
  const ctx = React.useContext(SubContext)
  if (!ctx) throw new Error("DropdownMenuSubTrigger/SubContent must be inside <DropdownMenuSub>")
  return ctx
}

/** A nested menu. Opens in place below its trigger (the iOS menu idiom) — `open`/`onOpenChange` or `defaultOpen`. */
function DropdownMenuSub({ open, defaultOpen, onOpenChange, children }: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode }) {
  const [value, setOpen] = useControllableOpen(open, defaultOpen, onOpenChange)
  const ctx = React.useMemo(() => ({ open: value, setOpen }), [value, setOpen])
  return <SubContext.Provider value={ctx}>{children}</SubContext.Provider>
}

/** Expands its sub-menu; the chevron turns down while open. */
function DropdownMenuSubTrigger({ children, onSelect, ...props }: ItemBase) {
  const ui = useUI()
  const sub = useSub()
  return (
    <MenuRow
      aria-expanded={sub.open}
      style={sub.open ? { backgroundColor: ui.fillStrong } : undefined}
      onSelect={(e) => {
        e.preventDefault()
        sub.setOpen(!sub.open)
        onSelect?.(e)
      }}
      {...props}
    >
      {children}
      <View style={{ marginLeft: "auto", transform: [{ rotate: sub.open ? "90deg" : "0deg" }] }}>
        <ChevronRightIcon size={16} color={ui.mutedForeground} />
      </View>
    </MenuRow>
  )
}

/** The nested items, indented under their trigger. */
function DropdownMenuSubContent({ style, ...props }: ViewProps) {
  const ui = useUI()
  const sub = useSub()
  if (!sub.open) return null
  return <View role="menu" style={[{ marginLeft: 12, paddingLeft: 6, borderLeftWidth: 2, borderLeftColor: alpha(ui.foreground, 0.1), marginVertical: 2 }, style]} {...props} />
}

// part markers the system-menu reader matches on
Object.assign(DropdownMenuTrigger, { menuPart: "trigger" })
Object.assign(DropdownMenuContent, { menuPart: "content" })
Object.assign(DropdownMenuItem, { menuPart: "item" })
Object.assign(DropdownMenuCheckboxItem, { menuPart: "checkbox" })
Object.assign(DropdownMenuRadioItem, { menuPart: "radio" })
Object.assign(DropdownMenuRadioGroup, { menuPart: "radio-group" })
Object.assign(DropdownMenuGroup, { menuPart: "group" })
Object.assign(DropdownMenuLabel, { menuPart: "label" })
Object.assign(DropdownMenuSeparator, { menuPart: "separator" })
Object.assign(DropdownMenuSub, { menuPart: "sub" })
Object.assign(DropdownMenuSubTrigger, { menuPart: "sub-trigger" })
Object.assign(DropdownMenuSubContent, { menuPart: "sub-content" })
Object.assign(DropdownMenuPortal, { menuPart: "group" })

const styles = StyleSheet.create({
  // Apple's 44pt minimum (NAT-55)
  item: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, minHeight: 44 },
  indicator: { position: "absolute", right: 10, top: 0, bottom: 0, justifyContent: "center", pointerEvents: "none" },
})

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
