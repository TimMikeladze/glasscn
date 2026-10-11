import * as React from "react"
import { Platform, StyleSheet, View, useWindowDimensions, type ViewProps } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { BottomSheet, Host, type SnapPoint } from "@expo/ui"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { Backdrop, CloseButton, Dialog, DialogClose, DialogDescription, DialogPortal, DialogTitle, DialogTrigger, KeyboardAvoid, textChildren, useDialog, useEntrance, useInitialFocus, useInsets, usePresence } from "@/components/glass/native/dialog"
import { Glass } from "@/components/glass/native/glass"
import { haptics } from "@/components/glass/native/press"
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
  "worklet"
  const projected = height - velocity * 150
  const smallest = Math.min(...heights)
  if (projected < smallest / 2 || (velocity > 1 && height <= smallest)) return -1
  let best = 0
  for (let i = 1; i < heights.length; i++) if (Math.abs(heights[i] - projected) < Math.abs(heights[best] - projected)) best = i
  return best
}

/** Our detents as @expo/ui BottomSheet snap points. */
export function toSnapPoint(detent: SheetDetent): SnapPoint {
  if (detent === "large") return "full"
  if (detent === "medium") return "half"
  if (typeof detent === "number") return { fraction: detent }
  return { height: parseFloat(detent) }
}

/** Past the last detent the sheet follows the finger at a third of the distance. */
const rubber = (v: number, max: number) => {
  "worklet"
  return v > max ? max + (v - max) / 3 : v
}

type DetentProps = {
  /** Bottom sheets: heights it rests at, smallest first. */
  detents?: SheetDetent[]
  /** The current detent (index), controlled. Forces the React Native sheet. */
  detent?: number
  defaultDetent?: number
  onDetentChange?: (index: number) => void
  /** The capsule at the top: tap cycles detents, drag resizes or dismisses. On by default for bottom sheets. */
  grabber?: boolean
  /** Asked before a drag-to-dismiss; return false to keep the sheet. Forces the React Native sheet. */
  onBeforeDismiss?: () => boolean | Promise<boolean>
  /** false: an inspector — no dimmed backdrop, the content behind stays usable. */
  modal?: boolean
  /**
   * Bottom sheets on iOS and Android present the system sheet (@expo/ui `BottomSheet`:
   * Liquid Glass on iOS 26, Material on Android). false keeps the React Native one.
   */
  native?: boolean
}

export type SheetContentProps = ViewProps & {
  /** The edge it slides from. Default: bottom on phones (< 600pt wide), right elsewhere. */
  side?: Side
  showCloseButton?: boolean
} & DetentProps

/**
 * A floating liquid-glass panel that slides from an edge — inset from the screen
 * edges like an iPad sheet, not glued to them. Clears the safe area and the keyboard.
 * Bottom sheets rest at `detents`, drag between them and down to dismiss.
 */
function SheetContent({ side: sideProp, native = true, ...props }: SheetContentProps) {
  const { width } = useWindowDimensions()
  const side = sideProp ?? (width < 600 ? "bottom" : "right")
  const system = native && side === "bottom" && Platform.OS !== "web" && props.modal !== false && props.detent === undefined && !props.onBeforeDismiss
  return system ? <SystemSheet {...props} /> : <GlassSheet side={side} {...props} />
}

/** iOS / Android: the system sheet, with our content inside (fills, never more glass). */
function SystemSheet({ style, children, showCloseButton = true, detents, grabber = true, ...rest }: Omit<SheetContentProps, "side" | "native">) {
  // the system sheet reports no detent changes and is always modal
  const { onDetentChange, defaultDetent, modal, ...props } = rest
  void onDetentChange
  void defaultDetent
  void modal
  const ui = useUI()
  const { open, setOpen, titleRef } = useDialog()
  useInitialFocus(open, titleRef)
  return (
    <Host matchContents colorScheme={ui.scheme} style={{ position: "absolute" }}>
      <BottomSheet isPresented={open} onDismiss={() => setOpen(false)} snapPoints={detents?.map(toSnapPoint)} showDragIndicator={grabber} contentPadding={0}>
        <View accessibilityViewIsModal style={[{ gap: 16, paddingTop: 8, paddingBottom: 16 }, style]} {...props}>
          {textChildren(children)}
          {showCloseButton ? <CloseButton onPress={() => setOpen(false)} /> : null}
        </View>
      </BottomSheet>
    </Host>
  )
}

/** Web, custom and side sheets: Reanimated + gesture-handler. */
function GlassSheet({ style, children, side, showCloseButton = true, detents, detent, defaultDetent = 0, onDetentChange, grabber, onBeforeDismiss, modal = true, ...props }: Omit<SheetContentProps, "native"> & { side: Side }) {
  const ui = useUI()
  const reduced = useReducedMotion()
  const { open, setOpen, titleRef } = useDialog()
  const { mounted, progress } = usePresence(open, 300)
  const { width, height } = useWindowDimensions()
  const insets = useInsets()
  const close = () => setOpen(false)
  useInitialFocus(open && mounted, titleRef)
  const gap = 12
  const edge = { top: insets.top + gap, bottom: insets.bottom + gap, left: insets.left + gap, right: insets.right + gap }
  const vertical = side === "left" || side === "right"
  const panelWidth = Math.min(width - edge.left - edge.right, 384)
  const position = vertical
    ? { top: edge.top, bottom: edge.bottom, [side]: edge[side], width: panelWidth }
    : { left: Math.max(edge.left, (width - 640) / 2), right: Math.max(edge.right, (width - 640) / 2), [side]: edge[side], maxHeight: height - edge.top - edge.bottom }
  const sized = side === "bottom" && !!detents?.length
  const heights = (detents ?? []).map((d) => detentHeight(d, height, edge.top + edge.bottom))
  const [inner, setInner] = React.useState(defaultDetent)
  const index = Math.min(detent ?? inner, Math.max(0, heights.length - 1))
  const setDetent = React.useCallback(
    (i: number) => {
      haptics.selection()
      setInner(i)
      onDetentChange?.(i)
    },
    [onDetentChange]
  )
  // the resting height (sized) and the finger's offset from it
  const rest = useSharedValue(heights[index] ?? 0)
  const drag = useSharedValue(0)
  const dismiss = React.useCallback(async () => {
    if ((await onBeforeDismiss?.()) !== false) setOpen(false)
    else drag.set(withSpring(0, ui.motion.springConfig))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onBeforeDismiss, setOpen])

  const target = heights[index] ?? 0
  React.useEffect(() => {
    rest.set(reduced ? target : withSpring(target, ui.motion.springConfig))
  }, [target, reduced, rest, ui.motion.springConfig])

  const heightsKey = heights.join(",")
  const draggable = side === "bottom" && (grabber ?? true)
  const gesture = React.useMemo(() => {
    const max = heights.length ? Math.max(...heights) : 0
    const pan = Gesture.Pan()
      .enabled(draggable)
      .activeOffsetY([-6, 6])
      .onUpdate((e) => {
        // sized: grow/shrink the height (rubber-banded past the largest); otherwise only down
        drag.set(sized ? rubber(rest.value - e.translationY, max) - rest.value : -(e.translationY > 0 ? e.translationY : e.translationY / 6))
      })
      .onEnd((e) => {
        const v = e.velocityY / 1000
        if (sized) {
          const to = settleDetent(heights, rest.value + drag.value, v)
          if (to < 0) runOnJS(dismiss)()
          else {
            if (to !== index) runOnJS(setDetent)(to)
            rest.set(withSpring(heights[to], ui.motion.springConfig))
          }
          drag.set(withSpring(0, ui.motion.springConfig))
          return
        }
        if (-drag.value > 120 || v > 1) runOnJS(dismiss)()
        else drag.set(withSpring(0, ui.motion.springConfig))
      })
    const tap = Gesture.Tap()
      .enabled(sized && heights.length > 1)
      .onEnd(() => runOnJS(setDetent)((index + 1) % heights.length))
    return Gesture.Race(pan, tap)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heightsKey, index, sized, draggable, dismiss, setDetent, ui.motion.springConfig])

  const distance = (vertical ? panelWidth + edge[side] : height / 2) * (side === "right" || side === "bottom" ? 1 : -1)
  const entrance = useEntrance(progress, vertical ? { x: distance } : { y: distance })
  const sizing = useAnimatedStyle(() => (sized ? { height: rest.value + drag.value } : { transform: [{ translateY: -drag.value }] }))
  const large = sized && detents?.[index] === "large"
  return (
    <DialogPortal visible={mounted} onRequestClose={close}>
      <KeyboardAvoid style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {modal ? <Backdrop progress={progress} onPress={close} /> : null}
        <Animated.View style={[{ position: "absolute" }, position, entrance]}>
          <Animated.View style={[{ flexGrow: vertical ? 1 : 0 }, sizing]}>
            <Glass
              variant="liquid"
              visible={open}
              radius={ui.radius.surface}
              accessibilityViewIsModal={modal}
              role="dialog"
              aria-modal={modal}
              style={[{ flexGrow: vertical || sized ? 1 : 0, flexShrink: 1, gap: 16, overflow: "hidden" }, style]}
              {...props}
            >
              {draggable ? (
                <GestureDetector gesture={gesture}>
                  <View
                    accessibilityRole="button"
                    accessibilityLabel={large ? "Shrink sheet" : sized ? "Expand sheet" : "Dismiss sheet"}
                    accessibilityActions={[{ name: "activate" }]}
                    onAccessibilityAction={() => (sized && heights.length > 1 ? setDetent((index + 1) % heights.length) : close())}
                    style={{ height: 24, alignItems: "center", justifyContent: "center", marginBottom: -16 }}
                  >
                    <View style={{ width: 36, height: 5, borderRadius: 3, backgroundColor: ui.fillStrong }} />
                  </View>
                </GestureDetector>
              ) : null}
              {textChildren(children)}
              {showCloseButton ? <CloseButton onPress={close} /> : null}
            </Glass>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoid>
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

/** Heading type, text-lg; takes the screen reader's focus when the sheet opens. */
const SheetTitle = DialogTitle
/** Muted supporting text. */
const SheetDescription = DialogDescription

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription }
