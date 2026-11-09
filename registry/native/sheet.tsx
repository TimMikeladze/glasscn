import * as React from "react"
import { Platform, ScrollView, StyleSheet, View, useWindowDimensions, type ViewProps } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { BottomSheet, Host, type SnapPoint } from "@expo/ui"
import { FullWindowOverlay } from "react-native-screens"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { Button, type ButtonProps } from "@/components/glass/native/button"
import { Backdrop, CloseButton, Dialog, DialogClose, DialogDescription, DialogPortal, DialogTitle, DialogTrigger, KeyboardAvoid, textChildren, useDialog, useEntrance, useInitialFocus, useInsets, usePresence } from "@/components/glass/native/dialog"
import { Glass } from "@/components/glass/native/glass"
import { haptics } from "@/components/glass/native/press"
import { GlassThemeProvider, NativeGlassLabelsContext, nativeControlTheme, nativeGlassLabels, useGlassThemeOptions } from "@/components/glass/native/tokens"
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
  /** The current detent (index), controlled. */
  detent?: number
  defaultDetent?: number
  onDetentChange?: (index: number) => void
  /** The capsule at the top: tap cycles detents, drag resizes or dismisses. On by default for bottom sheets. */
  grabber?: boolean
  /** Asked before a drag-to-dismiss; return false to keep the sheet. Forces the React Native sheet. */
  onBeforeDismiss?: () => boolean | Promise<boolean>
  /** false: an inspector with background interaction. Android/web custom inspectors belong at the screen root. */
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
  /** iOS presenter anchor, kept mounted. Library Button anchors use their RN renderer inside the native slot. */
  anchor?: React.ReactNode
} & DetentProps

/**
 * Native bottom sheets use the system presentation. Custom side/guarded sheets slide
 * from an inset edge; a full bottom detent attaches to the screen and becomes opaque.
 */
function SheetContent({ side: sideProp, native = true, ...props }: SheetContentProps) {
  const { width } = useWindowDimensions()
  const side = sideProp ?? (width < 600 ? "bottom" : "right")
  const system = native && side === "bottom" && !props.onBeforeDismiss && (Platform.OS === "ios" || (Platform.OS === "android" && props.modal !== false && props.detent === undefined && props.defaultDetent === undefined && !props.onDetentChange))
  return system ? <SystemSheet {...props} /> : <GlassSheet side={side} {...props} />
}

/** iOS / Android: the system sheet, with our content inside (fills, never more glass). */
function SystemSheet({ style, children, showCloseButton = true, detents, detent, defaultDetent = 0, onDetentChange, modal = true, grabber = true, anchor, onBeforeDismiss, ...props }: Omit<SheetContentProps, "side" | "native">) {
  void onBeforeDismiss
  const [inner, setInner] = React.useState(defaultDetent)
  const [acknowledged, acknowledge] = React.useState<number | null>(null)
  const accepted = Math.max(0, Math.min(detent ?? inner, (detents?.length ?? 1) - 1))
  // Expo observes initialSelection changes, not repeated equal props. Publish the native request
  // for one transaction before restoring the controlled value; this preserves the RN content.
  React.useEffect(() => {
    if (acknowledged === null) return
    let restore: number | undefined
    const frame = requestAnimationFrame(() => { restore = requestAnimationFrame(() => acknowledge(null)) })
    return () => { cancelAnimationFrame(frame); if (restore !== undefined) cancelAnimationFrame(restore) }
  }, [acknowledged])
  const ui = useUI()
  const options = useGlassThemeOptions()
  const appearance = nativeControlTheme(ui, options)
  const { open, setOpen, titleRef } = useDialog()
  useInitialFocus(open, titleRef)
  const content = (
    <GlassThemeProvider tokens={nativeGlassLabels(ui, options.tokens)}>
      <NativeGlassLabelsContext.Provider value={Platform.OS === "ios" ? ui : null}>
      <View accessibilityViewIsModal={modal} style={{ flex: 1, width: "100%" }} {...props}>
        <ScrollView style={{ flex: 1, width: "100%" }} contentContainerStyle={[{ gap: 16, paddingTop: 8, paddingBottom: 16, width: "100%" }, style]} keyboardShouldPersistTaps="handled">
          {textChildren(children)}
        </ScrollView>
        {showCloseButton ? <CloseButton onPress={() => setOpen(false)} /> : null}
      </View>
      </NativeGlassLabelsContext.Provider>
    </GlassThemeProvider>
  )
  if (Platform.OS === "ios") {
    // A system Button owns a SwiftUI Host, which cannot nest inside this RNHostView anchor.
    const hostedAnchor = React.isValidElement<ButtonProps>(anchor) && anchor.type === Button ? React.cloneElement(anchor, { native: false }) : anchor
    // The universal sheet creates an unthemed inner Host. Keep the presenter and content in one native environment.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SwiftUI = require("@expo/ui/swift-ui") as typeof import("@expo/ui/swift-ui")
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const modifiers = require("@expo/ui/swift-ui/modifiers") as typeof import("@expo/ui/swift-ui/modifiers")
    const presentation = [modifiers.frame({ maxWidth: Infinity, maxHeight: Infinity, alignment: "topLeading" }), modifiers.presentationDragIndicator(grabber ? "visible" : "hidden"), modifiers.presentationBackgroundInteraction(modal ? "disabled" : "enabled")]
    if (detents?.length) {
      const nativeDetents = detents.map((value) => value === "medium" ? "medium" as const : value === "large" ? "large" as const : typeof value === "number" ? { fraction: value } : { height: parseFloat(value) })
      presentation.push(modifiers.presentationDetents(nativeDetents, {
        selection: nativeDetents[acknowledged ?? accepted],
        onSelectionChange: (next) => {
          const index = nativeDetents.findIndex((value) => JSON.stringify(value) === JSON.stringify(next))
          if (index < 0 || index === accepted) return
          if (detent === undefined) setInner(index)
          else acknowledge(index)
          onDetentChange?.(index)
        },
      }))
    }
    return (
      <SwiftUI.Host matchContents {...appearance} style={anchor ? undefined : { position: "absolute" }}>
        <SwiftUI.BottomSheet anchor={hostedAnchor ? <SwiftUI.RNHostView matchContents><View>{hostedAnchor}</View></SwiftUI.RNHostView> : undefined} isPresented={open} onIsPresentedChange={(presented) => { if (!presented) setOpen(false) }} fitToContents={false}>
          <SwiftUI.Group modifiers={presentation}>
            <SwiftUI.RNHostView>{content}</SwiftUI.RNHostView>
          </SwiftUI.Group>
        </SwiftUI.BottomSheet>
      </SwiftUI.Host>
    )
  }
  return <>{anchor}
    <Host matchContents {...appearance} style={{ position: "absolute" }}>
      <BottomSheet isPresented={open} onDismiss={() => setOpen(false)} snapPoints={detents?.map(toSnapPoint)} showDragIndicator={grabber} contentPadding={0} containerColor={ui.frost}>
        {content}
      </BottomSheet>
    </Host>
  </>
}

/** Web, custom and side sheets: Reanimated + gesture-handler. */
function GlassSheet({ style, children, side, showCloseButton = true, detents, detent, defaultDetent = 0, onDetentChange, grabber, onBeforeDismiss, modal = true, anchor, ...props }: Omit<SheetContentProps, "native"> & { side: Side }) {
  const ui = useUI()
  const reduced = useReducedMotion() || ui.motion.duration === 0
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
  const heights = (detents ?? []).map((d) => detentHeight(d, height, d === "large" || d === 1 ? 0 : edge.top + edge.bottom))
  const [inner, setInner] = React.useState(defaultDetent)
  const index = Math.max(0, Math.min(detent ?? inner, Math.max(0, heights.length - 1)))
  const setDetent = React.useCallback(
    (i: number) => {
      haptics.selection()
      if (detent === undefined) setInner(i)
      onDetentChange?.(i)
    },
    [onDetentChange, detent]
  )
  // the resting height (sized) and the finger's offset from it
  const rest = useSharedValue(heights[index] ?? 0)
  const drag = useSharedValue(0)
  const dismiss = React.useCallback(async () => {
    if ((await onBeforeDismiss?.()) !== false) setOpen(false)
    else drag.set(reduced ? 0 : withSpring(0, ui.motion.springConfig))
  }, [onBeforeDismiss, setOpen, reduced, drag, ui.motion.springConfig])

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
      .onEnd((e, success) => {
        if (!success) return
        const v = e.velocityY / 1000
        if (sized) {
          const to = settleDetent(heights, rest.value + drag.value, v)
          if (to < 0) runOnJS(dismiss)()
          else {
            if (to !== index) runOnJS(setDetent)(to)
            rest.set(reduced ? heights[detent === undefined ? to : index] : withSpring(heights[detent === undefined ? to : index], ui.motion.springConfig))
          }
          drag.set(reduced ? 0 : withSpring(0, ui.motion.springConfig))
          return
        }
        if (-drag.value > 120 || v > 1) runOnJS(dismiss)()
        else drag.set(reduced ? 0 : withSpring(0, ui.motion.springConfig))
      })
      .onFinalize(() => { drag.set(reduced ? 0 : withSpring(0, ui.motion.springConfig)) })
    const tap = Gesture.Tap()
      .enabled(sized && heights.length > 1)
      .onEnd(() => runOnJS(setDetent)((index + 1) % heights.length))
    return Gesture.Race(pan, tap)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heightsKey, index, sized, draggable, dismiss, setDetent, detent, reduced, ui.motion.springConfig])

  const distance = (vertical ? panelWidth + edge[side] : height / 2) * (side === "right" || side === "bottom" ? 1 : -1)
  const entrance = useEntrance(progress, vertical ? { x: distance } : { y: distance })
  const sizing = useAnimatedStyle(() => (sized ? { height: rest.value + drag.value } : { transform: [{ translateY: -drag.value }] }))
  const large = sized && (detents?.[index] === "large" || detents?.[index] === 1)
  const Portal = modal ? DialogPortal : InlineSheetPortal
  return <>{anchor}
    <Portal visible={mounted} onRequestClose={close}>
      <KeyboardAvoid style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {modal ? <Backdrop progress={progress} onPress={close} /> : null}
        <Animated.View style={[{ position: "absolute" }, large ? { left: 0, right: 0, bottom: 0 } : position, entrance]}>
          <Animated.View style={[{ flexGrow: vertical ? 1 : 0 }, sizing]}>
            <Glass
              variant={large ? "material" : "liquid"}
              materialized={open}
              radius={large ? 0 : ui.radius.surface}
              accessibilityViewIsModal={modal}
              role="dialog"
              aria-modal={modal}
              style={[{ flexGrow: vertical || sized ? 1 : 0, flexShrink: 1, gap: 16, overflow: "hidden", ...(large ? { backgroundColor: ui.frost, paddingTop: insets.top, paddingBottom: insets.bottom } : null) }, style]}
              {...props}
            >
              {draggable ? (
                <GestureDetector gesture={gesture}>
                  <View
                    accessible
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
              {showCloseButton ? <CloseButton onPress={close} style={large ? { top: insets.top + 14 } : undefined} /> : null}
            </Glass>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoid>
    </Portal>
  </>
}

function InlineSheetPortal({ visible, children }: { visible: boolean; onRequestClose?: () => void; children?: React.ReactNode }) {
  if (!visible) return null
  const content = <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { zIndex: 50 }]}>{children}</View>
  return Platform.OS === "ios" ? <FullWindowOverlay unstable_accessibilityContainerViewIsModal={false}>{content}</FullWindowOverlay> : content
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
