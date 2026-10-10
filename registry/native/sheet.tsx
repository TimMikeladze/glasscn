import * as React from "react"
import { Animated, StyleSheet, View, useWindowDimensions, type ViewProps } from "react-native"
import { SafeAreaInsetsContext } from "react-native-safe-area-context"

import { Backdrop, CloseButton, Dialog, DialogClose, DialogDescription, DialogPortal, DialogTitle, DialogTrigger, glassOpacity, textChildren, useDialog, usePresence } from "@/components/glass/native/dialog"
import { Glass } from "@/components/glass/native/glass"
import { useUI } from "@/components/glass/native/ui"

/** Root: the same open state as Dialog (controlled or `defaultOpen`). */
const Sheet = Dialog
/** Opens the sheet. */
const SheetTrigger = DialogTrigger
/** Closes the sheet. */
const SheetClose = DialogClose

type Side = "top" | "right" | "bottom" | "left"

/**
 * A floating glass panel that slides from an edge — inset from the screen
 * edges like an iPad sheet, not glued to them. Clears the safe area.
 */
function SheetContent({ style, children, side = "right", showCloseButton = true, ...props }: ViewProps & { side?: Side; showCloseButton?: boolean }) {
  const ui = useUI()
  const { open, setOpen } = useDialog()
  const { mounted, progress } = usePresence(open, 300)
  const { width, height } = useWindowDimensions()
  const insets = React.useContext(SafeAreaInsetsContext) ?? { top: 0, right: 0, bottom: 0, left: 0 }
  const close = () => setOpen(false)
  const gap = 12
  const edge = {
    top: insets.top + gap,
    bottom: insets.bottom + gap,
    left: insets.left + gap,
    right: insets.right + gap,
  }
  const vertical = side === "left" || side === "right"
  const panelWidth = Math.min(width - edge.left - edge.right, 384)
  const position = vertical
    ? { top: edge.top, bottom: edge.bottom, [side]: edge[side], width: panelWidth }
    : { left: edge.left, right: edge.right, [side]: edge[side], maxHeight: height - edge.top - edge.bottom }
  const distance = (vertical ? panelWidth + edge[side] : height / 2) * (side === "right" || side === "bottom" ? 1 : -1)
  const travel = progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] })
  return (
    <DialogPortal visible={mounted} onRequestClose={close}>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Backdrop progress={progress} onPress={close} />
        <Animated.View style={[{ position: "absolute", opacity: glassOpacity(progress), transform: [vertical ? { translateX: travel } : { translateY: travel }] }, position]}>
          <Glass radius={ui.radius.surface} tint={ui.glassStrong} accessibilityViewIsModal role="dialog" aria-modal style={[{ flexGrow: vertical ? 1 : 0, gap: 16 }, style]} {...props}>
            {textChildren(children)}
            {showCloseButton ? <CloseButton onPress={close} /> : null}
          </Glass>
        </Animated.View>
      </View>
    </DialogPortal>
  )
}

/** Title + description, clear of the close button. */
function SheetHeader({ style, ...props }: ViewProps) {
  return <View style={[{ gap: 4, padding: 20, paddingRight: 56 }, style]} {...props} />
}

/** Actions pinned to the bottom of a side sheet. */
function SheetFooter({ style, ...props }: ViewProps) {
  return <View style={[{ marginTop: "auto", gap: 8, padding: 20 }, style]} {...props} />
}

/** Heading type, text-lg. */
const SheetTitle = DialogTitle
/** Muted supporting text. */
const SheetDescription = DialogDescription

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription }
