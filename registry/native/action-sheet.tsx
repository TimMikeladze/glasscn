import * as React from "react"
import { StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native"
import Animated from "react-native-reanimated"

import { Backdrop, DialogPortal, useControllableOpen, useEntrance, useInsets, usePresence } from "@/components/glass/native/dialog"
import { Glass } from "@/components/glass/native/glass"
import { Press, haptics } from "@/components/glass/native/press"
import { withGlyphs } from "@/components/glass/native/segmented-control"
import { GText, useUI, type GTextProps } from "@/components/glass/native/ui"

type Ctx = { open: boolean; setOpen: (open: boolean) => void }
const SheetCtx = React.createContext<Ctx | null>(null)
function useActionSheet() {
  const ctx = React.useContext(SheetCtx)
  if (!ctx) throw new Error("ActionSheet parts must be inside <ActionSheet>")
  return ctx
}

/** Root: open state, controlled or not. */
function ActionSheet({ open, defaultOpen, onOpenChange, children }: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode }) {
  const [value, setOpen] = useControllableOpen(open, defaultOpen, onOpenChange)
  const ctx = React.useMemo(() => ({ open: value, setOpen }), [value, setOpen])
  return <SheetCtx.Provider value={ctx}>{children}</SheetCtx.Provider>
}

type PressLike = Omit<PressableProps, "style" | "children"> & { style?: StyleProp<ViewStyle>; children?: React.ReactNode }

function ActionSheetTrigger({ children, onPress, ...props }: PressLike) {
  const { setOpen } = useActionSheet()
  return (
    <Press accessibilityRole="button" aria-haspopup="dialog" {...props} onPress={(e) => (onPress?.(e), setOpen(true))}>
      {children}
    </Press>
  )
}

/**
 * The iOS action sheet: the choices share one glass group rising from the bottom;
 * ActionSheetCancel sits in its own capsule below. Tapping outside cancels.
 */
function ActionSheetContent({ children }: { children?: React.ReactNode }) {
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
          <Glass variant="liquid" visible={open} radius={ui.radius.surface} style={{ overflow: "hidden" }}>
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

function ActionSheetHeader({ children }: { children?: React.ReactNode }) {
  return <View style={{ alignItems: "center", gap: 2, paddingVertical: 12, paddingHorizontal: 16 }}>{children}</View>
}

function ActionSheetTitle(props: GTextProps) {
  return <GText size="sm" weight="600" tone="muted" align="center" role="heading" {...props} />
}

function ActionSheetDescription(props: GTextProps) {
  return <GText size="xs" tone="muted" align="center" {...props} />
}

function Row({ children, onPress, color, bold, destructive, ...props }: PressLike & { color: string; bold?: boolean; destructive?: boolean }) {
  const ui = useUI()
  const { setOpen } = useActionSheet()
  return (
    <Press
      accessibilityRole="button"
      onPress={(e) => {
        if (destructive) haptics.notify("warning")
        else haptics.selection()
        onPress?.(e)
        setOpen(false)
      }}
      style={{ height: ui.control.lg + 8, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" }}
      {...props}
    >
      {withGlyphs(children, { color, size: 20, text: "base", weight: bold ? "600" : "400" })}
    </Press>
  )
}

/** A choice; closes the sheet. */
function ActionSheetAction({ variant = "default", ...props }: PressLike & { variant?: "default" | "destructive" | "preferred" }) {
  const ui = useUI()
  return <Row color={variant === "destructive" ? ui.destructive : ui.primary} bold={variant === "preferred"} destructive={variant === "destructive"} {...props} />
}

/** Cancel, in its own capsule. */
function ActionSheetCancel({ children = "Cancel", ...props }: PressLike) {
  const ui = useUI()
  const { open } = useActionSheet()
  return (
    <Glass variant="liquid" visible={open} radius={ui.radius.surface}>
      <Row color={ui.primary} bold {...props}>
        {children}
      </Row>
    </Glass>
  )
}

export { ActionSheet, ActionSheetAction, ActionSheetCancel, ActionSheetContent, ActionSheetDescription, ActionSheetHeader, ActionSheetTitle, ActionSheetTrigger }
