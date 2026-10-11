import * as React from "react"
import { Animated, PanResponder, StyleSheet, View, useWindowDimensions, type ViewProps } from "react-native"
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
/** A resting height for a bottom sheet: half, full, a fraction of the window (0–1) or points. */
export type SheetDetent = "medium" | "large" | number | `${number}px`

/** A detent's height for a window `vh` tall, leaving `top` clear. */
export function detentHeight(detent: SheetDetent, vh: number, top = 0) {
  const max = vh - top
  if (detent === "large") return max
  if (detent === "medium") return Math.min(max, vh / 2)
  if (typeof detent === "number") return Math.min(max, vh * detent)
  return Math.min(max, parseFloat(detent))
}

/** The detent a drag settles on (index), or -1 to dismiss. Velocity in px/ms, positive = down. */
export function settleDetent(heights: number[], height: number, velocity = 0) {
  const projected = height - velocity * 150
  const smallest = Math.min(...heights)
  if (projected < smallest / 2 || (velocity > 1 && height <= smallest)) return -1
  let best = 0
  heights.forEach((h, i) => {
    if (Math.abs(h - projected) < Math.abs(heights[best] - projected)) best = i
  })
  return best
}

type DetentProps = {
  /** Bottom sheets: heights it rests at, smallest first. */
  detents?: SheetDetent[]
  detent?: number
  defaultDetent?: number
  onDetentChange?: (index: number) => void
  /** The capsule at the top: tap cycles detents, drag resizes or dismisses. On by default with detents. */
  grabber?: boolean
  /** Asked before a drag-to-dismiss; return false to keep the sheet. */
  onBeforeDismiss?: () => boolean | Promise<boolean>
  /** false: an inspector — no dimmed backdrop, the content behind stays usable. */
  modal?: boolean
}

/**
 * A floating glass panel that slides from an edge — inset from the screen
 * edges like an iPad sheet, not glued to them. Clears the safe area.
 */
function SheetContent({
  style,
  children,
  side = "right",
  showCloseButton = true,
  detents,
  detent,
  defaultDetent = 0,
  onDetentChange,
  grabber,
  onBeforeDismiss,
  modal = true,
  ...props
}: ViewProps & { side?: Side; showCloseButton?: boolean } & DetentProps) {
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
  const sized = side === "bottom" && !!detents?.length
  const heights = (detents ?? []).map((d) => detentHeight(d, height, edge.top + edge.bottom))
  const [inner, setInner] = React.useState(defaultDetent)
  const index = Math.min(detent ?? inner, Math.max(0, heights.length - 1))
  const setDetent = (i: number) => {
    setInner(i)
    onDetentChange?.(i)
  }
  const [drag] = React.useState(() => new Animated.Value(0))
  const heightsKey = heights.join(",")
  // rebuilt when the detents change; the handlers read this render's values
  const pan = React.useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => drag.setValue(Math.max(-40, -g.dy)),
      onPanResponderRelease: async (_, g) => {
        const l = { heights, index, setDetent, onBeforeDismiss, close }
        // a tap on the grabber steps to the next detent
        if (Math.abs(g.dy) < 4) {
          if (l.heights.length > 1) l.setDetent((l.index + 1) % l.heights.length)
          return
        }
        const target = settleDetent(l.heights, l.heights[l.index] - g.dy, g.vy)
        Animated.spring(drag, { toValue: 0, useNativeDriver: false }).start()
        if (target >= 0) l.setDetent(target)
        else if ((await l.onBeforeDismiss?.()) !== false) l.close()
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [heightsKey, index, onBeforeDismiss]
  )
  const distance = (vertical ? panelWidth + edge[side] : height / 2) * (side === "right" || side === "bottom" ? 1 : -1)
  const travel = progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] })
  return (
    <DialogPortal visible={mounted} onRequestClose={close}>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {modal ? <Backdrop progress={progress} onPress={close} /> : null}
        <Animated.View
          style={[
            { position: "absolute", opacity: glassOpacity(progress), transform: [vertical ? { translateX: travel } : { translateY: travel }] },
            position,
            sized ? { height: Animated.add(drag, heights[index] ?? 0) } : null,
          ]}
        >
          <Glass
            radius={ui.radius.surface}
            tint={sized && detents?.[index] === "large" ? ui.glassSolid : ui.glassStrong}
            accessibilityViewIsModal={modal}
            role="dialog"
            aria-modal={modal}
            style={[{ flexGrow: vertical || sized ? 1 : 0, gap: 16 }, style]}
            {...props}
          >
            {grabber ?? sized ? (
              <View
                {...pan.panHandlers}
                role="button"
                accessibilityLabel={detents?.[index] === "large" ? "Shrink sheet" : "Expand sheet"}
                onAccessibilityTap={() => setDetent((index + 1) % Math.max(1, heights.length))}
                style={{ height: 24, alignItems: "center", justifyContent: "center", marginBottom: -16 }}
              >
                <View style={{ width: 36, height: 5, borderRadius: 3, backgroundColor: ui.fillStrong }} />
              </View>
            ) : null}
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
