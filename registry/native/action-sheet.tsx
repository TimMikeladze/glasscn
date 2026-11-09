import * as React from "react"
import { Platform, StyleSheet, View, useWindowDimensions, type PressableProps, type StyleProp, type ViewStyle } from "react-native"
import Animated from "react-native-reanimated"

import { Backdrop, DialogPortal, useControllableOpen, useEntrance, useInsets, usePresence } from "@/components/glass/native/dialog"
import { Glass } from "@/components/glass/native/glass"
import { Floating, useAnchorRect } from "@/components/glass/native/popover"
import { Press, haptics } from "@/components/glass/native/press"
import { withGlyphs } from "@/components/glass/native/segmented-control"
import { GText, useUI, type GTextProps } from "@/components/glass/native/ui"
import { Button } from "@/components/glass/native/button"
import { nativeControlTheme, useGlassThemeOptions } from "@/components/glass/native/tokens"

type SystemAction = { label: string; role: "default" | "destructive" | "cancel"; disabled?: boolean; onAction?: () => void; accessibilityLabel?: string; testID?: string }
type SystemSheet = { title: string; message?: string; actions: SystemAction[] }
type Ctx = { open: boolean; setOpen: (open: boolean) => void; system: SystemSheet | null; source: React.RefObject<View | null>; anchored: boolean }
const SheetCtx = React.createContext<Ctx | null>(null)
function useActionSheet() {
  const ctx = React.useContext(SheetCtx)
  if (!ctx) throw new Error("ActionSheet parts must be inside <ActionSheet>")
  return ctx
}

type ActionSheetProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Plain, uncontrolled, enabled iOS choices use the source-attached system dialog. Controlled state, disabled choices, rich content, styling, RN action events and Cancel callbacks use the custom sheet. false always selects custom. */
  native?: boolean
  children?: React.ReactNode
}

function ActionSheet({ open, defaultOpen, onOpenChange, native = true, children }: ActionSheetProps) {
  const [value, updateOpen] = useControllableOpen(open, defaultOpen, onOpenChange)
  const current = React.useRef(value)
  React.useLayoutEffect(() => { current.current = value }, [value])
  const setOpen = React.useCallback((next: boolean) => {
    if (open !== undefined) { updateOpen(next); return }
    if (current.current === next) return
    // A selected system action and SwiftUI's state event report the same close.
    current.current = next
    updateOpen(next)
  }, [open, updateOpen])
  const system = native && Platform.OS === "ios" && open === undefined ? systemSheet(children) : null
  // the custom sheet attaches to its trigger, as the system one does (iOS 26+); with no trigger
  // it rises from the bottom edge with its Cancel capsule
  const source = React.useRef<View>(null)
  const anchored = parts(children).some((node) => React.isValidElement(node) && node.type === ActionSheetTrigger)
  const ctx = { open: value, setOpen, system, source, anchored }
  return <SheetCtx.Provider value={ctx}>{children}</SheetCtx.Provider>
}

type PressLike = Omit<PressableProps, "style" | "children"> & { style?: StyleProp<ViewStyle>; children?: React.ReactNode }
type ActionProps = PressLike & {
  /** Event-free selection; RN onPress retains its event on the custom path. Cancel callbacks also select custom because SwiftUI runs its cancel closure on passive dismissal. */
  onAction?: () => void
}

function parts(children: React.ReactNode): React.ReactNode[] {
  return React.Children.toArray(children).flatMap((child) => React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === React.Fragment ? parts(child.props.children) : [child])
}

function hasOnly(props: object, names: string[]) {
  return Object.entries(props).every(([key, value]) => value === undefined || names.includes(key))
}

function plain(children: React.ReactNode): string | null {
  const nodes = parts(children)
  return nodes.length && nodes.every((node) => typeof node === "string" || typeof node === "number") ? nodes.join("") : null
}

/** Read only supported declarative parts; every other prop stays on the custom path. */
function systemSheet(children: React.ReactNode): SystemSheet | null {
  const nodes = parts(children)
  const triggers = nodes.filter((node) => React.isValidElement(node) && node.type === ActionSheetTrigger)
  const contents = nodes.filter((node) => React.isValidElement(node) && node.type === ActionSheetContent)
  if (nodes.length !== 2 || triggers.length !== 1 || contents.length !== 1) return null
  const content = contents[0] as React.ReactElement<{ children?: React.ReactNode }>
  if (!hasOnly(content.props, ["children"])) return null
  const result: SystemSheet = { title: "", actions: [] }
  let titles = 0, messages = 0, cancels = 0
  const read = (children: React.ReactNode): boolean => parts(children).every((node) => {
    if (!React.isValidElement<Record<string, unknown>>(node)) return false
    const props = node.props
    if (node.type === ActionSheetHeader) return hasOnly(props, ["children"]) && read(props.children as React.ReactNode)
    if (node.type === ActionSheetTitle || node.type === ActionSheetDescription) {
      const text = plain(props.children as React.ReactNode)
      if (text === null || !hasOnly(props, ["children"])) return false
      if (node.type === ActionSheetTitle) { result.title = text; return ++titles === 1 }
      result.message = text; return ++messages === 1
    }
    if (node.type !== ActionSheetAction && node.type !== ActionSheetCancel) return false
    const cancel = node.type === ActionSheetCancel
    const label = plain(props.children as React.ReactNode ?? (cancel ? "Cancel" : undefined))
    // SwiftUI also runs cancel-role actions on outside dismissal, without a reason.
    if (label === null || props.variant === "preferred" || (cancel && props.onAction !== undefined) || !hasOnly(props, ["children", "variant", "disabled", "onAction", "accessibilityLabel", "aria-label", "testID"]) || (cancel && ++cancels > 1)) return false
    result.actions.push({ label, role: cancel ? "cancel" : props.variant === "destructive" ? "destructive" : "default", disabled: props.disabled as boolean | undefined, onAction: props.onAction as (() => void) | undefined, accessibilityLabel: (props.accessibilityLabel ?? props["aria-label"]) as string | undefined, testID: props.testID as string | undefined })
    return true
  })
  if (!read(content.props.children) || !result.actions.some((action) => action.role !== "cancel")) return null
  // SwiftUI's confirmationDialog leaves disabled actions out; the custom sheet shows them dimmed
  return result.actions.some((action) => action.disabled) ? null : result
}

function ActionSheetTrigger({ children, onPress, asChild, ...props }: PressLike & { asChild?: boolean }) {
  const { setOpen, system, source: anchor } = useActionSheet()
  // A library Button inside RNHostView must stay RN rather than nesting SwiftUI Hosts.
  const button = React.isValidElement<React.ComponentProps<typeof Button>>(children) && children.type === Button
  const source = system && button ? React.cloneElement(children, { native: false }) : children
  const trigger = (
    <Press asChild={asChild || button} accessibilityRole="button" aria-haspopup="dialog" {...props} onPress={(e) => (onPress?.(e), setOpen(true))}>
      {source}
    </Press>
  )
  return system ? <SystemPresentation>{trigger}</SystemPresentation> : <View ref={anchor} collapsable={false}>{trigger}</View>
}

function SystemPresentation({ children }: { children: React.ReactElement }) {
  const { open, setOpen, system } = useActionSheet()
  const ui = useUI()
  const appearance = nativeControlTheme(ui, useGlassThemeOptions())
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SwiftUI = require("@expo/ui/swift-ui") as typeof import("@expo/ui/swift-ui")
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const modifiers = require("@expo/ui/swift-ui/modifiers") as typeof import("@expo/ui/swift-ui/modifiers")
  if (!system) return children
  return <SwiftUI.Host matchContents {...appearance} style={{ alignSelf: "flex-start" }}>
    <SwiftUI.ConfirmationDialog title={system.title} titleVisibility={system.title ? "visible" : "hidden"} isPresented={open} onIsPresentedChange={setOpen}>
      <SwiftUI.ConfirmationDialog.Trigger><SwiftUI.RNHostView matchContents>{children}</SwiftUI.RNHostView></SwiftUI.ConfirmationDialog.Trigger>
      <SwiftUI.ConfirmationDialog.Actions>{system.actions.map((action, index) => <SwiftUI.Button key={index} label={action.label} role={action.role} testID={action.testID} modifiers={[modifiers.disabled(!!action.disabled), modifiers.accessibilityLabel(action.accessibilityLabel ?? action.label)]} onPress={() => {
        if (action.disabled) return
        if (action.role === "destructive") haptics.notify("warning")
        else haptics.selection()
        action.onAction?.()
        setOpen(false)
      }} />)}</SwiftUI.ConfirmationDialog.Actions>
      {system.message ? <SwiftUI.ConfirmationDialog.Message><SwiftUI.Text>{system.message}</SwiftUI.Text></SwiftUI.ConfirmationDialog.Message> : null}
    </SwiftUI.ConfirmationDialog>
  </SwiftUI.Host>
}

/** System source presentation where supported; otherwise the custom sheet, attached to its trigger (no Cancel) or at the bottom edge. */
function ActionSheetContent({ children }: { children?: React.ReactNode }) {
  const { system } = useActionSheet()
  return system ? null : <CustomContent>{children}</CustomContent>
}

function CustomContent({ children }: { children?: React.ReactNode }) {
  const { anchored } = useActionSheet()
  return anchored ? <AnchoredContent>{children}</AnchoredContent> : <BottomContent>{children}</BottomContent>
}

/** Beside its trigger like the system dialog: choices as capsules, no Cancel; tapping outside closes it (P04). */
function AnchoredContent({ children }: { children?: React.ReactNode }) {
  const { open, setOpen, source } = useActionSheet()
  const { width } = useWindowDimensions()
  // one stable reader of the trigger's ref, so the measuring effect runs on open, not every render
  const [target] = React.useState(() => () => source.current)
  const rect = useAnchorRect(open, target)
  const choices = React.Children.toArray(children).filter((c) => !(React.isValidElement(c) && c.type === ActionSheetCancel))
  return (
    <Floating open={open} anchor={rect} onClose={() => setOpen(false)} role="dialog" aria-modal accessibilityViewIsModal style={{ width: Math.min(320, width - 32), padding: 10, gap: 8 }}>
      {choices}
    </Floating>
  )
}

function BottomContent({ children }: { children?: React.ReactNode }) {
  const ui = useUI()
  const { open, setOpen } = useActionSheet()
  const { mounted, progress } = usePresence(open, 280)
  const insets = useInsets()
  const entrance = useEntrance(progress, { y: 320 })
  const items = React.Children.toArray(children)
  const cancel = items.filter((c) => React.isValidElement(c) && c.type === ActionSheetCancel)
  const rest = items.filter((c) => !cancel.includes(c))
  return (
    <DialogPortal visible={mounted} onRequestClose={() => setOpen(false)}>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Backdrop progress={progress} onPress={() => setOpen(false)} />
        <Animated.View role="dialog" aria-modal accessibilityViewIsModal style={[{ position: "absolute", left: 12, right: 12, bottom: insets.bottom + 12, gap: 8, alignSelf: "center", maxWidth: 420 }, entrance]}>
          <Glass variant="liquid" materialized={open} radius={ui.radius.surface} style={{ overflow: "hidden" }}>
            {rest.map((c, i) => (
              <View key={i} style={i ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: ui.separator } : null}>
                {c}
              </View>
            ))}
          </Glass>
          {cancel}
        </Animated.View>
      </View>
    </DialogPortal>
  )
}

const useAnchored = () => React.useContext(SheetCtx)?.anchored ?? false

function ActionSheetHeader({ children }: { children?: React.ReactNode }) {
  const anchored = useAnchored()
  return <View style={anchored ? { gap: 4, paddingTop: 8, paddingBottom: 4, paddingHorizontal: 10 } : { alignItems: "center", gap: 2, paddingVertical: 12, paddingHorizontal: 16 }}>{children}</View>
}

function ActionSheetTitle(props: GTextProps) {
  return useAnchored() ? <GText weight="600" role="heading" {...props} /> : <GText size="sm" weight="600" tone="muted" align="center" role="heading" {...props} />
}

function ActionSheetDescription(props: GTextProps) {
  return useAnchored() ? <GText size="sm" tone="muted" {...props} /> : <GText size="xs" tone="muted" align="center" {...props} />
}

function Row({ children, onPress, onAction, color, bold, destructive, style, disabled, ...props }: ActionProps & { color: string; bold?: boolean; destructive?: boolean }) {
  const ui = useUI()
  const { setOpen, anchored } = useActionSheet()
  return (
    <Press
      accessibilityRole="button"
      disabled={disabled}
      onPress={(e) => {
        if (disabled) return
        if (destructive) haptics.notify("warning")
        else haptics.selection()
        onPress?.(e)
        onAction?.()
        setOpen(false)
      }}
      aria-disabled={disabled || undefined}
      style={[{ minHeight: ui.control.lg + 8, paddingVertical: 8, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" }, anchored ? { borderRadius: ui.radius.button, backgroundColor: ui.fill } : null, style]}
      {...props}
    >
      {withGlyphs(children, { color: disabled ? ui.labelTertiary : color, size: 20, text: "base", weight: bold ? "600" : "400" })}
    </Press>
  )
}

/** A choice; closes the sheet. */
function ActionSheetAction({ variant = "default", ...props }: ActionProps & { variant?: "default" | "destructive" | "preferred" }) {
  const ui = useUI()
  // attached, choices are labels on capsules as in the system dialog; at the bottom, accent rows
  const plainColor = useAnchored() ? ui.foreground : ui.primary
  return <Row color={variant === "destructive" ? ui.destructive : plainColor} bold={variant === "preferred"} destructive={variant === "destructive"} {...props} />
}

/** System Cancel placement belongs to iOS; custom Cancel has a separate capsule. A callback selects custom to distinguish explicit selection from passive dismissal. */
function ActionSheetCancel({ children = "Cancel", ...props }: ActionProps) {
  const ui = useUI()
  const { open } = useActionSheet()
  return (
    <Glass variant="liquid" materialized={open} radius={ui.radius.surface}>
      <Row color={ui.primary} bold {...props}>
        {children}
      </Row>
    </Glass>
  )
}

export { ActionSheet, ActionSheetAction, ActionSheetCancel, ActionSheetContent, ActionSheetDescription, ActionSheetHeader, ActionSheetTitle, ActionSheetTrigger }
