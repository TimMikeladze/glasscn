import * as React from "react"
import { AccessibilityInfo, Modal, Platform, Pressable, ScrollView, StyleSheet, View, findNodeHandle, useWindowDimensions, type StyleProp, type Text, type ViewProps, type ViewStyle } from "react-native"
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming, type SharedValue } from "react-native-reanimated"
import { KeyboardAvoidingView } from "react-native-keyboard-controller"
import { SafeAreaInsetsContext } from "react-native-safe-area-context"
import { XIcon } from "lucide-react-native"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { Glass, canFade } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { GText, useUI, web, type GTextProps } from "@/components/glass/native/ui"

/** Radix-style open state: controlled by `open`/`onOpenChange`, or uncontrolled from `defaultOpen`. */
export function useControllableOpen(open: boolean | undefined, defaultOpen: boolean | undefined, onOpenChange?: (open: boolean) => void) {
  const [inner, setInner] = React.useState(defaultOpen ?? false)
  const value = open ?? inner
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (open === undefined) setInner(next)
      onOpenChange?.(next)
    },
    [open, onOpenChange]
  )
  return [value, setOpen] as const
}

/**
 * Keeps an overlay mounted through its exit. `progress` (a Reanimated shared value)
 * springs 0 → 1 on open and eases back on close; `mounted` drops once the exit
 * finishes. Snaps under Reduce Motion.
 */
export function usePresence(open: boolean, duration = 220) {
  const ui = useUI()
  const reduced = useReducedMotion()
  const [mounted, setMounted] = React.useState(open)
  if (open && !mounted) setMounted(true)
  const progress = useSharedValue(open ? 1 : 0)
  React.useEffect(() => {
    const unmount = () => setMounted(false)
    const done = (finished?: boolean) => {
      "worklet"
      if (finished && !open) runOnJS(unmount)()
    }
    if (reduced || ui.motion.duration === 0) progress.set(withTiming(open ? 1 : 0, { duration: 0 }, done))
    else if (open) progress.set(withSpring(1, ui.motion.springConfig))
    else progress.set(withTiming(0, { duration: Math.round(duration * 0.75), easing: Easing.in(Easing.quad) }, done))
  }, [open, reduced, duration, progress, ui.motion.duration, ui.motion.springConfig])
  return { mounted: mounted || open, progress }
}

/**
 * The entrance every overlay shares: translate and scale in from `from`. Opacity
 * only where glass may fade — never on or above Liquid Glass (iOS 26), which
 * materialises through `Glass visible` instead.
 */
export function useEntrance(progress: SharedValue<number>, { x = 0, y = 0, scale = 1 }: { x?: number; y?: number; scale?: number } = {}) {
  const fade = canFade()
  return useAnimatedStyle(() => {
    const p = progress.value
    return {
      opacity: fade ? Math.min(1, Math.max(0, p)) : 1,
      transform: [{ translateX: x * (1 - p) }, { translateY: y * (1 - p) }, { scale: scale + (1 - scale) * p }],
    }
  })
}

/** Wraps bare strings/numbers in GText so they're legal React Native children. */
export function textChildren(children: React.ReactNode, props?: GTextProps) {
  return React.Children.map(children, (c) => (typeof c === "string" || typeof c === "number" ? <GText {...props}>{c}</GText> : c))
}

/** Safe-area insets, zero without a SafeAreaProvider (never throws). */
export function useInsets() {
  return React.useContext(SafeAreaInsetsContext) ?? { top: 0, right: 0, bottom: 0, left: 0 }
}

/** The dimmed backdrop — a sibling of the glass, so fading it is safe everywhere. Tapping it dismisses. */
export function Backdrop({ progress, onPress, dim = true }: { progress: SharedValue<number>; onPress?: () => void; dim?: boolean }) {
  const ui = useUI()
  const fade = useAnimatedStyle(() => ({ opacity: Math.min(1, Math.max(0, progress.value)) }))
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        // screen readers dismiss through the escape gesture / close button, not this layer
        importantForAccessibility="no"
        accessibilityElementsHidden
        onPress={onPress}
        style={[StyleSheet.absoluteFill, dim ? { backgroundColor: ui.dim } : null, dim ? web({ backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", cursor: "default" }) : web({ cursor: "default" })]}
      />
    </Animated.View>
  )
}

/** The round "×" in a dialog or sheet corner (web: Button variant="secondary" size="icon-sm"). A fill, never glass on glass. */
export function CloseButton({ onPress, style }: { onPress: () => void; style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  return (
    <Press
      onPress={onPress}
      haptic
      accessibilityRole="button"
      accessibilityLabel="Close"
      hitSlop={Math.ceil((44 - ui.control.sm) / 2)}
      style={[{ position: "absolute", top: 14, right: 14, width: ui.control.sm, height: ui.control.sm, borderRadius: ui.radius.button, alignItems: "center", justifyContent: "center", backgroundColor: ui.fillStrong }, web({ cursor: "pointer" }), style]}
    >
      <XIcon size={16} color={ui.foreground} />
    </Press>
  )
}

/** Moves the screen reader to `ref` once an overlay has presented (NAT-47). */
export function useInitialFocus(active: boolean, ref: React.RefObject<View | Text | null>) {
  React.useEffect(() => {
    if (!active || Platform.OS === "web") return
    const timer = setTimeout(() => {
      const node = ref.current ? findNodeHandle(ref.current) : null
      if (node) AccessibilityInfo.setAccessibilityFocus(node)
    }, 300)
    return () => clearTimeout(timer)
  }, [active, ref])
}

type DialogCtx = { open: boolean; setOpen: (open: boolean) => void; titleRef: React.RefObject<Text | null>; titleId: string; descriptionId: string }
const DialogContext = React.createContext<DialogCtx | null>(null)
/** The nearest Dialog/Sheet's open state (Sheet shares it). */
export function useDialog() {
  const ctx = React.useContext(DialogContext)
  if (!ctx) throw new Error("Dialog parts must be inside <Dialog>")
  return ctx
}

export type DialogProps = { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode }

/** Root: holds open state, controlled (`open`/`onOpenChange`) or not (`defaultOpen`). */
function Dialog({ open, defaultOpen, onOpenChange, children }: DialogProps) {
  const [value, setOpen] = useControllableOpen(open, defaultOpen, onOpenChange)
  const titleRef = React.useRef<Text>(null)
  const id = React.useId().replace(/:/g, "")
  const ctx = React.useMemo(() => ({ open: value, setOpen, titleRef, titleId: `dialog-title-${id}`, descriptionId: `dialog-description-${id}` }), [value, setOpen, id])
  return <DialogContext.Provider value={ctx}>{children}</DialogContext.Provider>
}

type PressProps = Omit<React.ComponentProps<typeof Press>, "children"> & { children?: React.ReactNode }

/** Opens the dialog. Wrap any non-pressable content (a styled View, text); strings become GText. */
function DialogTrigger({ children, onPress, ...props }: PressProps) {
  const { open, setOpen } = useDialog()
  return (
    <Press
      accessibilityRole="button"
      aria-expanded={open}
      aria-haspopup="dialog"
      {...props}
      onPress={(e) => {
        onPress?.(e)
        setOpen(true)
      }}
    >
      {textChildren(children)}
    </Press>
  )
}

/** Closes the dialog. */
function DialogClose({ children, onPress, ...props }: PressProps) {
  const { setOpen } = useDialog()
  return (
    <Press
      accessibilityRole="button"
      {...props}
      onPress={(e) => {
        onPress?.(e)
        setOpen(false)
      }}
    >
      {textChildren(children)}
    </Press>
  )
}

/** Renders children above everything (an RN Modal: transparent, own animation). Hardware back / Escape call `onRequestClose`. */
function DialogPortal({ visible, onRequestClose, children }: { visible: boolean; onRequestClose?: () => void; children?: React.ReactNode }) {
  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent navigationBarTranslucent supportedOrientations={["portrait", "portrait-upside-down", "landscape"]} onRequestClose={onRequestClose}>
      {children}
    </Modal>
  )
}

/** Lifts its content above the on-screen keyboard (react-native-keyboard-controller; a plain View on the web). */
export function KeyboardAvoid({ style, children, ...props }: ViewProps) {
  if (Platform.OS === "web")
    return (
      <View style={style} {...props}>
        {children}
      </View>
    )
  return (
    <KeyboardAvoidingView behavior="padding" style={style} {...props}>
      {children}
    </KeyboardAvoidingView>
  )
}

/** The page dims behind the glass (the web's --glass-dim). */
function DialogOverlay({ progress, onPress }: { progress: SharedValue<number>; onPress?: () => void }) {
  return <Backdrop progress={progress} onPress={onPress} />
}

/**
 * Centred liquid-glass panel (the control layer; what's inside is fills, never more glass).
 * Rises and scales in, materialising on iOS 26; rides above the keyboard; caps at the
 * window height and scrolls its body. The screen reader lands on the title.
 */
function DialogContent({ style, children, showCloseButton = true, ...props }: ViewProps & { showCloseButton?: boolean }) {
  const ui = useUI()
  const { open, setOpen, titleRef, titleId, descriptionId } = useDialog()
  const { mounted, progress } = usePresence(open)
  const { width, height } = useWindowDimensions()
  const insets = useInsets()
  const entrance = useEntrance(progress, { y: 16, scale: 0.95 })
  const close = () => setOpen(false)
  useInitialFocus(open && mounted, titleRef)
  const maxHeight = height - insets.top - insets.bottom - 32
  return (
    <DialogPortal visible={mounted} onRequestClose={close}>
      <KeyboardAvoid style={styles.center} pointerEvents="box-none">
        <DialogOverlay progress={progress} onPress={close} />
        <Animated.View style={[{ width: Math.min(width - 32, 448), maxHeight }, entrance]}>
          <Glass
            variant="liquid"
            visible={open}
            radius={ui.radius.surface}
            accessibilityViewIsModal
            role="dialog"
            aria-modal
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            style={{ maxHeight, overflow: "hidden" }}
            {...props}
          >
            <ScrollView bounces={false} keyboardShouldPersistTaps="handled" style={{ flexGrow: 0 }} contentContainerStyle={[{ padding: 24, gap: 16 }, style]}>
              {textChildren(children)}
            </ScrollView>
            {showCloseButton ? <CloseButton onPress={close} /> : null}
          </Glass>
        </Animated.View>
      </KeyboardAvoid>
    </DialogPortal>
  )
}

/** Title + description stack, clear of the close button. */
function DialogHeader({ style, ...props }: ViewProps) {
  return <View style={[{ gap: 6, paddingRight: 32 }, style]} {...props} />
}

/** Actions: stacked on phones (primary on top, like the web's flex-col-reverse), a right-aligned row from 640pt. */
function DialogFooter({ style, showCloseButton = false, children, ...props }: ViewProps & { showCloseButton?: boolean }) {
  const ui = useUI()
  const { width } = useWindowDimensions()
  const { setOpen } = useDialog()
  const wide = width >= 640
  return (
    <View style={[{ flexDirection: wide ? "row" : "column-reverse", justifyContent: "flex-end", gap: 8, paddingTop: 8 }, style]} {...props}>
      {textChildren(children)}
      {showCloseButton ? (
        <Press
          accessibilityRole="button"
          onPress={() => setOpen(false)}
          style={[{ height: ui.control.default, paddingHorizontal: ui.pad.default, borderRadius: ui.radius.button, alignItems: "center", justifyContent: "center", backgroundColor: ui.fill }, web({ cursor: "pointer" })]}
        >
          <GText size="sm" weight="600">
            Close
          </GText>
        </Press>
      ) : null}
    </View>
  )
}

/** Heading type, text-lg. Takes the screen reader's focus when the dialog opens. */
function DialogTitle({ style, ...props }: GTextProps) {
  const ctx = React.useContext(DialogContext)
  return <GText {...({ ref: ctx?.titleRef } as object)} nativeID={ctx?.titleId} font="heading" size="lg" accessibilityRole="header" style={style} {...props} />
}

/** Muted supporting text, text-sm. */
function DialogDescription(props: GTextProps) {
  const ctx = React.useContext(DialogContext)
  return <GText nativeID={ctx?.descriptionId} size="sm" tone="muted" {...props} />
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
})

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger }
