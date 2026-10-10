import * as React from "react"
import { AccessibilityInfo, Animated, Easing, Modal, Pressable, StyleSheet, View, useWindowDimensions, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { XIcon } from "lucide-react-native"

import { Glass, canFade } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { GText, useUI, web, type GTextProps } from "@/components/glass/native/ui"

let reduced = false
AccessibilityInfo.isReduceMotionEnabled?.()
  .then((v) => (reduced = v))
  .catch(() => {})
AccessibilityInfo.addEventListener?.("reduceMotionChanged", (v) => (reduced = v))
/** The OS "reduce motion" setting, kept current. Overlays snap instead of animating when it's on. */
export const reduceMotion = () => reduced

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
 * Keeps an overlay mounted through its exit animation. `progress` runs 0 → 1 on
 * open and back on close; `mounted` drops once the exit finishes.
 */
export function usePresence(open: boolean, duration = 220) {
  const [mounted, setMounted] = React.useState(open)
  if (open && !mounted) setMounted(true)
  const [progress] = React.useState(() => new Animated.Value(open ? 1 : 0))
  React.useEffect(() => {
    const anim = reduceMotion()
      ? Animated.timing(progress, { toValue: open ? 1 : 0, duration: 0, useNativeDriver: true })
      : open
        ? Animated.spring(progress, { toValue: 1, friction: 9, tension: 120, useNativeDriver: true })
        : Animated.timing(progress, { toValue: 0, duration: Math.round(duration * 0.75), easing: Easing.in(Easing.quad), useNativeDriver: true })
    anim.start(({ finished }) => {
      if (finished && !open) setMounted(false)
    })
    return () => anim.stop()
  }, [open, progress, duration])
  return { mounted: mounted || open, progress }
}

/** Opacity for a glass surface: only where fading glass is safe (never on iOS 26 Liquid Glass). */
export const glassOpacity = (progress: Animated.Value) => (canFade() ? progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) : 1)

/** Wraps bare strings/numbers in GText so they're legal React Native children. */
export function textChildren(children: React.ReactNode, props?: GTextProps) {
  return React.Children.map(children, (c) => (typeof c === "string" || typeof c === "number" ? <GText {...props}>{c}</GText> : c))
}

/** The dimmed backdrop — a sibling of the glass, so fading it is safe everywhere. Tapping it dismisses. */
export function Backdrop({ progress, onPress, dim = true }: { progress: Animated.Value; onPress?: () => void; dim?: boolean }) {
  const ui = useUI()
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: progress }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        onPress={onPress}
        style={[StyleSheet.absoluteFill, dim ? { backgroundColor: ui.scheme === "dark" ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.15)" } : null, dim ? web({ backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", cursor: "default" }) : web({ cursor: "default" })]}
      />
    </Animated.View>
  )
}

/** The round "×" in a dialog or sheet corner (web: Button variant="secondary" size="icon-sm"). */
export function CloseButton({ onPress, style }: { onPress: () => void; style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  return (
    <Press
      onPress={onPress}
      haptic
      accessibilityRole="button"
      accessibilityLabel="Close"
      hitSlop={8}
      style={[{ position: "absolute", top: 14, right: 14, width: ui.control.sm, height: ui.control.sm, borderRadius: ui.radius.button, alignItems: "center", justifyContent: "center", backgroundColor: ui.fillStrong }, web({ cursor: "pointer" }), style]}
    >
      <XIcon size={16} color={ui.foreground} />
    </Press>
  )
}

type DialogCtx = { open: boolean; setOpen: (open: boolean) => void }
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
  const ctx = React.useMemo(() => ({ open: value, setOpen }), [value, setOpen])
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
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent navigationBarTranslucent supportedOrientations={["portrait", "landscape"]} onRequestClose={onRequestClose}>
      {children}
    </Modal>
  )
}

/** The page dims and softens behind the glass. */
function DialogOverlay({ progress, onPress }: { progress: Animated.Value; onPress?: () => void }) {
  return <Backdrop progress={progress} onPress={onPress} />
}

/** Centred strong-glass card: rises and scales in (fades only where glass may fade). */
function DialogContent({ style, children, showCloseButton = true, ...props }: ViewProps & { showCloseButton?: boolean }) {
  const ui = useUI()
  const { open, setOpen } = useDialog()
  const { mounted, progress } = usePresence(open)
  const { width } = useWindowDimensions()
  const close = () => setOpen(false)
  return (
    <DialogPortal visible={mounted} onRequestClose={close}>
      <View style={styles.center} pointerEvents="box-none">
        <DialogOverlay progress={progress} onPress={close} />
        <Animated.View
          style={{
            width: Math.min(width - 32, 448),
            opacity: glassOpacity(progress),
            transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }, { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
          }}
        >
          <Glass radius={ui.radius.surface} tint={ui.glassStrong} accessibilityViewIsModal role="dialog" aria-modal style={[{ padding: 24, gap: 16 }, style]} {...props}>
            {textChildren(children)}
            {showCloseButton ? <CloseButton onPress={close} /> : null}
          </Glass>
        </Animated.View>
      </View>
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

/** Heading type, text-lg. */
function DialogTitle({ style, ...props }: GTextProps) {
  return <GText font="heading" size="lg" accessibilityRole="header" style={style} {...props} />
}

/** Muted supporting text, text-sm. */
function DialogDescription(props: GTextProps) {
  return <GText size="sm" tone="muted" {...props} />
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
})

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger }
