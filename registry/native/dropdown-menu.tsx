import * as React from "react"
import { ScrollView, StyleSheet, View, type ViewProps } from "react-native"
import { CheckIcon, ChevronRightIcon } from "lucide-react-native"

import { textChildren, useControllableOpen } from "@/components/glass/native/dialog"
import { Floating, useAnchorRect, type Align, type Side } from "@/components/glass/native/popover"
import { Press } from "@/components/glass/native/press"
import { GText, alpha, useUI, web, type GTextProps, type UI } from "@/components/glass/native/ui"

type MenuCtx = { open: boolean; setOpen: (open: boolean) => void; triggerRef: React.RefObject<View | null> }
const MenuContext = React.createContext<MenuCtx | null>(null)
function useMenu() {
  const ctx = React.useContext(MenuContext)
  if (!ctx) throw new Error("DropdownMenu parts must be inside <DropdownMenu>")
  return ctx
}

/** Root: open state, controlled (`open`/`onOpenChange`) or not (`defaultOpen`). */
function DropdownMenu({ open, defaultOpen, onOpenChange, children }: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode }) {
  const [value, setOpen] = useControllableOpen(open, defaultOpen, onOpenChange)
  const triggerRef = React.useRef<View>(null)
  const ctx = React.useMemo(() => ({ open: value, setOpen, triggerRef }), [value, setOpen])
  return <MenuContext.Provider value={ctx}>{children}</MenuContext.Provider>
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

/** The glass menu: below the trigger, start-aligned, flips up when it won't fit; scrolls past the window. */
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

type ItemBase = Omit<PressProps, "onPress" | "role"> & { inset?: boolean; disabled?: boolean; onSelect?: (event: SelectEvent) => void }

/** One row of the menu: highlights on hover/press, runs `onSelect`, then closes (unless `event.preventDefault()`). */
function MenuRow({ children, inset, disabled, onSelect, style, role = "menuitem", checked, trailing, color, iconColor, highlight, ...props }: ItemBase & { role?: "menuitem" | "checkbox" | "radio"; checked?: boolean; trailing?: React.ReactNode; color?: string; iconColor?: string; highlight?: string }) {
  const ui = useUI()
  const { setOpen } = useMenu()
  const [hover, setHover] = React.useState(false)
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

/** Small caps section label. */
function DropdownMenuLabel({ inset, style, ...props }: GTextProps & { inset?: boolean }) {
  return <GText size="xs" tone="muted" weight="600" style={[{ paddingHorizontal: 10, paddingLeft: inset ? 34 : 10, paddingTop: 8, paddingBottom: 4, textTransform: "uppercase", letterSpacing: 0.6 }, style]} {...props} />
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

const styles = StyleSheet.create({
  item: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, minHeight: 36 },
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
