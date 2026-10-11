import * as React from "react"
import { AccessibilityInfo, Platform, StyleSheet, View, useWindowDimensions, type ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { Easing, cancelAnimation, runOnJS, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from "react-native-reanimated"
import { FullWindowOverlay } from "react-native-screens"
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react-native"

import { announce, useReducedMotion } from "@/components/glass/native/a11y"
import { useInsets } from "@/components/glass/native/dialog"
import { Glass, canFade } from "@/components/glass/native/glass"
import { Press, haptics } from "@/components/glass/native/press"
import { toastDuration, toastStore, type Toast, type ToastOptions, type ToastType } from "@/components/glass/native/toast-store"
import { GText, useUI, web } from "@/components/glass/native/ui"

export type { Toast, ToastOptions, ToastType }

/**
 * Show a toast (sonner's API, no sonner): `toast("Copied")`,
 * `toast.success("Saved", { description, action })`, `toast.dismiss(id)`.
 */
export const toast = Object.assign((title: React.ReactNode, options?: ToastOptions) => toastStore.show("default", title, options), {
  success: (title: React.ReactNode, options?: ToastOptions) => toastStore.show("success", title, options),
  info: (title: React.ReactNode, options?: ToastOptions) => toastStore.show("info", title, options),
  warning: (title: React.ReactNode, options?: ToastOptions) => toastStore.show("warning", title, options),
  error: (title: React.ReactNode, options?: ToastOptions) => toastStore.show("error", title, options),
  loading: (title: React.ReactNode, options?: ToastOptions) => toastStore.show("loading", title, options),
  /** Dismiss one toast, or all of them. */
  dismiss: (id?: string | number) => toastStore.dismiss(id),
})

export type ToasterProps = {
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"
  /** Default ms before a toast leaves (Android stretches it to the user's accessibility timeout). */
  duration?: number
  /** How many show in the stack. */
  visibleToasts?: number
  /** Start expanded instead of a collapsed stack. */
  expand?: boolean
  offset?: number
  style?: ViewStyle
}

/** iOS: a window above every Modal and formSheet (NAT-58); a plain layer elsewhere. */
function Overlay({ children }: { children: React.ReactNode }) {
  if (Platform.OS === "ios") return <FullWindowOverlay>{children}</FullWindowOverlay>
  return <>{children}</>
}

/**
 * The host for toast(): liquid-glass capsules with accent icons, stacked like
 * sonner (tap the stack to fan it out), swipe or wait to dismiss, clear of the
 * safe area. Spoken by the screen reader; success/warning/error buzz. Mount once,
 * last, at your app root — on iOS it floats above modals and sheets too.
 */
function Toaster({ position: positionProp, duration = 4000, visibleToasts = 3, expand = false, offset = 16, style }: ToasterProps) {
  const list = React.useSyncExternalStore(toastStore.subscribe, toastStore.get, toastStore.get)
  const insets = useInsets()
  const [expanded, setExpanded] = React.useState(expand)
  const [heights, setHeights] = React.useState<Record<string, number>>({})
  // Android: honour "Time to take action" (accessibility timeout)
  const [recommended, setStay] = React.useState<number | null>(null)
  const stay = Platform.OS === "android" ? (recommended ?? duration) : duration
  React.useEffect(() => {
    if (Platform.OS !== "android") return
    let live = true
    AccessibilityInfo.getRecommendedTimeoutMillis(duration)
      .then((ms) => live && setStay(ms))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [duration])
  // phones: from the top centre, clear of the thumb and the Dock
  const { width } = useWindowDimensions()
  const position = positionProp ?? (width <= 600 ? "top-center" : "bottom-center")
  const top = position.startsWith("top")
  const horizontal = position.endsWith("left") ? "flex-start" : position.endsWith("right") ? "flex-end" : "center"
  const shown = list.slice(0, visibleToasts)
  const open = expanded || expand
  if (!list.length && open && !expand) setExpanded(false)
  if (!list.length) return null
  const lifts = shown.map((_, i) => shown.slice(0, i).reduce((sum, t) => sum + (heights[String(t.id)] ?? 64) + 8, 0))
  return (
    <Overlay>
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
                duration={toastDuration(t, stay)}
                onPress={() => setExpanded(!open)}
                onHeight={(h) => {
                  if (heights[key] !== h) setHeights((prev) => ({ ...prev, [key]: h }))
                }}
              />
            )
          })}
        </View>
      </View>
    </Overlay>
  )
}

function Spinner() {
  const ui = useUI()
  const reduced = useReducedMotion()
  const turn = useSharedValue(0)
  React.useEffect(() => {
    if (reduced) return
    turn.set(withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1))
    return () => cancelAnimation(turn)
  }, [reduced, turn])
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value * 360}deg` }] }))
  return (
    <Animated.View style={spin}>
      <Loader2Icon size={16} color={ui.mutedForeground} />
    </Animated.View>
  )
}

function ToastIcon({ type }: { type: ToastType }) {
  const ui = useUI()
  switch (type) {
    case "success":
      return <CircleCheckIcon size={16} color={ui.success} />
    case "info":
      return <InfoIcon size={16} color={ui.primary} />
    case "warning":
      return <TriangleAlertIcon size={16} color={ui.warning} />
    case "error":
      return <OctagonXIcon size={16} color={ui.destructive} />
    case "loading":
      return <Spinner />
    default:
      return null
  }
}

const plain = (node: React.ReactNode) => (typeof node === "string" || typeof node === "number" ? String(node) : "")

function ToastItem({ toast: t, index, top, offset, expanded, duration, onPress, onHeight }: { toast: Toast; index: number; top: boolean; offset: number; expanded: boolean; duration: number; onPress: () => void; onHeight: (h: number) => void }) {
  const ui = useUI()
  const reduced = useReducedMotion()
  const enter = useSharedValue(0)
  const drag = useSharedValue(0)
  const place = useSharedValue(offset)
  const [leaving, setLeaving] = React.useState(false)
  const closing = t.closing || leaving
  const spring = ui.motion.springConfig

  // speak it, and buzz the typed ones — once per type (loading → success speaks again)
  React.useEffect(() => {
    announce([plain(t.title), plain(t.description)].filter(Boolean).join(". "))
    if (t.type === "success" || t.type === "warning" || t.type === "error") haptics.notify(t.type)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.type, t.title])

  // enter, or leave (dismiss / timer / swipe), then drop from the store
  React.useEffect(() => {
    const done = () => {
      t.onDismiss?.()
      toastStore.remove(t.id)
    }
    if (closing)
      enter.set(
        withTiming(0, { duration: reduced ? 0 : 200, easing: Easing.in(Easing.quad) }, (finished) => {
          if (finished) runOnJS(done)()
        })
      )
    else enter.set(reduced ? 1 : withSpring(1, spring))
  }, [closing, enter, t, reduced, spring])

  React.useEffect(() => {
    place.set(reduced ? offset : withSpring(offset, spring))
  }, [offset, place, reduced, spring])

  // auto-dismiss, paused while the stack is fanned out
  React.useEffect(() => {
    if (closing || expanded || !Number.isFinite(duration)) return
    const timer = setTimeout(() => setLeaving(true), duration)
    return () => clearTimeout(timer)
  }, [closing, expanded, duration])

  // a horizontal swipe dismisses; vertical drags fall through to whatever scrolls behind
  const leave = () => setLeaving(true)
  const swipe = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      drag.set(e.translationX)
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 80 || Math.abs(e.velocityX) > 800) {
        drag.set(
          withTiming(Math.sign(e.translationX || e.velocityX) * 480, { duration: 180 }, (finished) => {
            if (finished) runOnJS(leave)()
          })
        )
      } else drag.set(withSpring(0, spring))
    })

  const dir = top ? -1 : 1
  const fade = canFade()
  const scale = expanded ? 1 : 1 - index * 0.05
  const motion = useAnimatedStyle(() => ({
    // never fade Liquid Glass (iOS 26): it slides in and out instead
    opacity: fade ? Math.min(1, Math.max(0, enter.value)) : 1,
    transform: [{ translateX: drag.value }, { translateY: -place.value * dir + dir * 80 * (1 - enter.value) }, { scale }],
  }))
  return (
    <GestureDetector gesture={swipe}>
      <Animated.View
        onLayout={(e) => onHeight(Math.round(e.nativeEvent.layout.height))}
        style={[{ position: index === 0 ? "relative" : "absolute", left: 0, right: 0, [top ? "top" : "bottom"]: 0, zIndex: 100 - index }, motion]}
      >
        {/* the pane is liquid glass: it grows on press, never dims (native rule 3) */}
        <Press onPress={onPress} liquid accessibilityRole="alert" accessibilityLiveRegion="polite" accessibilityHint={expanded ? "Collapses the notifications" : "Shows all notifications"}>
          <Glass variant="liquid" visible={!closing || fade} radius={ui.radius.surface} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 14 }}>
            <ToastIcon type={t.type} />
            <View style={{ flex: 1, gap: 2 }}>
              {typeof t.title === "string" || typeof t.title === "number" ? (
                <GText size="sm" weight="600">
                  {t.title}
                </GText>
              ) : (
                t.title
              )}
              {t.description ? (
                typeof t.description === "string" || typeof t.description === "number" ? (
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
                hitSlop={8}
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
    </GestureDetector>
  )
}

export { Toaster }
