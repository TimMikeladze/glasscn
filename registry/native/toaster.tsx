import * as React from "react"
import { Animated, Easing, PanResponder, StyleSheet, View, type ViewStyle } from "react-native"
import { SafeAreaInsetsContext } from "react-native-safe-area-context"
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react-native"

import { reduceMotion } from "@/components/glass/native/dialog"
import { Glass, canFade } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { GText, useUI, web } from "@/components/glass/native/ui"

export type ToastType = "default" | "success" | "info" | "warning" | "error" | "loading"
export type ToastOptions = {
  id?: string | number
  description?: React.ReactNode
  /** One button on the toast; pressing it dismisses the toast. */
  action?: { label: string; onClick: () => void }
  /** ms before it leaves on its own; Infinity keeps it. Loading toasts stay until updated. */
  duration?: number
  onDismiss?: () => void
}
type Toast = ToastOptions & { id: string | number; title: React.ReactNode; type: ToastType; closing: boolean }

let toasts: Toast[] = []
let seq = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
const snapshot = () => toasts

function show(type: ToastType, title: React.ReactNode, options: ToastOptions = {}) {
  const id = options.id ?? ++seq
  const next: Toast = { ...options, id, title, type, closing: false }
  // same id → update in place (e.g. a loading toast turning into success)
  toasts = toasts.some((t) => t.id === id) ? toasts.map((t) => (t.id === id ? next : t)) : [next, ...toasts]
  emit()
  return id
}

function remove(id: string | number) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

/**
 * Show a toast (sonner's API, no sonner): `toast("Copied")`,
 * `toast.success("Saved", { description, action })`, `toast.dismiss(id)`.
 */
export const toast = Object.assign((title: React.ReactNode, options?: ToastOptions) => show("default", title, options), {
  success: (title: React.ReactNode, options?: ToastOptions) => show("success", title, options),
  info: (title: React.ReactNode, options?: ToastOptions) => show("info", title, options),
  warning: (title: React.ReactNode, options?: ToastOptions) => show("warning", title, options),
  error: (title: React.ReactNode, options?: ToastOptions) => show("error", title, options),
  loading: (title: React.ReactNode, options?: ToastOptions) => show("loading", title, options),
  /** Dismiss one toast, or all of them. */
  dismiss: (id?: string | number) => {
    toasts = toasts.map((t) => (id === undefined || t.id === id ? { ...t, closing: true } : t))
    emit()
  },
})

export type ToasterProps = {
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"
  /** Default ms before a toast leaves. */
  duration?: number
  /** How many show in the stack. */
  visibleToasts?: number
  /** Start expanded instead of a collapsed stack. */
  expand?: boolean
  offset?: number
  style?: ViewStyle
}

/**
 * The host for toast(): frosted glass capsules with accent icons, stacked like
 * sonner (tap the stack to fan it out), swipe or wait to dismiss, clear of the
 * safe area. Mount once, last, at your app root so it overlays every screen.
 */
function Toaster({ position = "bottom-center", duration = 4000, visibleToasts = 3, expand = false, offset = 16, style }: ToasterProps) {
  const list = React.useSyncExternalStore(subscribe, snapshot, snapshot)
  const insets = React.useContext(SafeAreaInsetsContext) ?? { top: 0, right: 0, bottom: 0, left: 0 }
  const [expanded, setExpanded] = React.useState(expand)
  const [heights, setHeights] = React.useState<Record<string, number>>({})
  const top = position.startsWith("top")
  const horizontal = position.endsWith("left") ? "flex-start" : position.endsWith("right") ? "flex-end" : "center"
  const shown = list.slice(0, visibleToasts)
  const open = expanded || expand
  if (!list.length && open && !expand) setExpanded(false)
  const lifts = shown.map((_, i) => shown.slice(0, i).reduce((sum, t) => sum + (heights[String(t.id)] ?? 64) + 8, 0))
  return (
    <View
      pointerEvents="box-none"
      style={[
        StyleSheet.absoluteFill,
        { zIndex: 9999, alignItems: horizontal, justifyContent: top ? "flex-start" : "flex-end", paddingTop: insets.top + offset, paddingBottom: insets.bottom + offset, paddingLeft: insets.left + offset, paddingRight: insets.right + offset },
        web({ position: "fixed" }),
        style,
      ]}
    >
      <View pointerEvents="box-none" style={{ width: "100%", maxWidth: 356 }}>
        {shown.map((t, i) => {
          const key = String(t.id)
          return (
            <ToastItem
              key={key}
              toast={t}
              index={i}
              top={top}
              offset={open ? lifts[i] : i * 10}
              expanded={open}
              duration={t.duration ?? (t.type === "loading" ? Infinity : duration)}
              onPress={() => setExpanded(!open)}
              onHeight={(h) => {
                if (heights[key] !== h) setHeights((prev) => ({ ...prev, [key]: h }))
              }}
            />
          )
        })}
      </View>
    </View>
  )
}

function ToastIcon({ type }: { type: ToastType }) {
  const ui = useUI()
  const [spin] = React.useState(() => new Animated.Value(0))
  React.useEffect(() => {
    if (type !== "loading") return
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true }))
    loop.start()
    return () => loop.stop()
  }, [type, spin])
  switch (type) {
    case "success":
      return <CircleCheckIcon size={16} color={ui.primary} />
    case "info":
      return <InfoIcon size={16} color={ui.primary} />
    case "warning":
      return <TriangleAlertIcon size={16} color={ui.foreground} />
    case "error":
      return <OctagonXIcon size={16} color={ui.destructive} />
    case "loading":
      return (
        <Animated.View style={{ transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }}>
          <Loader2Icon size={16} color={ui.mutedForeground} />
        </Animated.View>
      )
    default:
      return null
  }
}

function ToastItem({ toast: t, index, top, offset, expanded, duration, onPress, onHeight }: { toast: Toast; index: number; top: boolean; offset: number; expanded: boolean; duration: number; onPress: () => void; onHeight: (h: number) => void }) {
  const ui = useUI()
  const [enter] = React.useState(() => new Animated.Value(0))
  const [drag] = React.useState(() => new Animated.Value(0))
  const [place] = React.useState(() => new Animated.Value(offset))
  const [leaving, setLeaving] = React.useState(false)
  const closing = t.closing || leaving

  // enter, or leave (dismiss / timer / swipe), then drop from the store
  React.useEffect(() => {
    const anim = closing
      ? Animated.timing(enter, { toValue: 0, duration: reduceMotion() ? 0 : 200, easing: Easing.in(Easing.quad), useNativeDriver: true })
      : Animated.spring(enter, { toValue: 1, friction: 9, tension: 110, useNativeDriver: true })
    anim.start(({ finished }) => {
      if (finished && closing) {
        t.onDismiss?.()
        remove(t.id)
      }
    })
    return () => anim.stop()
  }, [closing, enter, t])

  React.useEffect(() => {
    Animated.spring(place, { toValue: offset, friction: 10, tension: 140, useNativeDriver: true }).start()
  }, [offset, place])

  // auto-dismiss, paused while the stack is fanned out
  React.useEffect(() => {
    if (closing || expanded || !Number.isFinite(duration)) return
    const timer = setTimeout(() => setLeaving(true), duration)
    return () => clearTimeout(timer)
  }, [closing, expanded, duration])

  const [pan] = React.useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: Animated.event([null, { dx: drag }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > 80 || Math.abs(g.vx) > 0.8) {
          Animated.timing(drag, { toValue: Math.sign(g.dx) * 480, duration: 180, useNativeDriver: false }).start(() => setLeaving(true))
        } else {
          Animated.spring(drag, { toValue: 0, friction: 7, useNativeDriver: false }).start()
        }
      },
      onPanResponderTerminate: () => Animated.spring(drag, { toValue: 0, useNativeDriver: false }).start(),
    })
  )

  const dir = top ? -1 : 1
  const fade = canFade()
  return (
    <Animated.View
      {...pan.panHandlers}
      onLayout={(e) => onHeight(Math.round(e.nativeEvent.layout.height))}
      style={{
        position: index === 0 ? "relative" : "absolute",
        left: 0,
        right: 0,
        [top ? "top" : "bottom"]: 0,
        zIndex: 100 - index,
        opacity: fade ? enter : 1,
        transform: [
          { translateX: drag },
          { translateY: Animated.add(Animated.multiply(place, -dir), enter.interpolate({ inputRange: [0, 1], outputRange: [dir * 80, 0] })) },
          { scale: expanded ? 1 : 1 - index * 0.05 },
        ],
      }}
    >
      <Press onPress={onPress} squash={0.99} accessibilityRole="alert" accessibilityLiveRegion="polite">
        <Glass radius={ui.radius.surface} tint={ui.glassStrong} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 14 }}>
          <ToastIcon type={t.type} />
          <View style={{ flex: 1, gap: 2 }}>
            {typeof t.title === "string" ? (
              <GText size="sm" weight="600">
                {t.title}
              </GText>
            ) : (
              t.title
            )}
            {t.description ? (
              typeof t.description === "string" ? (
                <GText size="xs" tone="muted">
                  {t.description}
                </GText>
              ) : (
                t.description
              )
            ) : null}
          </View>
          {t.action ? (
            <Press
              accessibilityRole="button"
              onPress={() => {
                t.action?.onClick()
                setLeaving(true)
              }}
              style={[{ height: ui.control.xs, paddingHorizontal: 10, borderRadius: ui.radius.button, backgroundColor: ui.primary, alignItems: "center", justifyContent: "center" }, web({ cursor: "pointer" })]}
            >
              <GText size="xs" weight="600" tone="onPrimary">
                {t.action.label}
              </GText>
            </Press>
          ) : null}
        </Glass>
      </Press>
    </Animated.View>
  )
}

export { Toaster }
