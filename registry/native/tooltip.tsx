import * as React from "react"
import { Platform, View, useWindowDimensions, type LayoutChangeEvent, type ViewProps } from "react-native"
import Animated from "react-native-reanimated"

import { textChildren, useControllableOpen, useEntrance, usePresence } from "@/components/glass/native/dialog"
import { Glass } from "@/components/glass/native/glass"
import { Floating, placeFloating, useAnchorRect, type Align, type Side } from "@/components/glass/native/popover"
import { Press } from "@/components/glass/native/press"
import { useUI, web } from "@/components/glass/native/ui"

const ProviderContext = React.createContext({ delayDuration: 120 })

/** Shared hover delay for the tooltips inside it. */
function TooltipProvider({ delayDuration = 120, children }: { delayDuration?: number; children?: React.ReactNode }) {
  const value = React.useMemo(() => ({ delayDuration }), [delayDuration])
  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>
}

type TooltipCtx = { open: boolean; setOpen: (open: boolean) => void; triggerRef: React.RefObject<View | null>; delay: number; hint: string; setHint: (hint: string) => void }
const TooltipContext = React.createContext<TooltipCtx | null>(null)
function useTooltip() {
  const ctx = React.useContext(TooltipContext)
  if (!ctx) throw new Error("Tooltip parts must be inside <Tooltip>")
  return ctx
}

/** Root: open state, controlled (`open`/`onOpenChange`) or not (`defaultOpen`). */
function Tooltip({ open, defaultOpen, onOpenChange, delayDuration, children }: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; delayDuration?: number; children?: React.ReactNode }) {
  const provider = React.useContext(ProviderContext)
  const [value, setOpen] = useControllableOpen(open, defaultOpen, onOpenChange)
  const triggerRef = React.useRef<View>(null)
  const delay = delayDuration ?? provider.delayDuration
  const [hint, setHint] = React.useState("")
  const ctx = React.useMemo(() => ({ open: value, setOpen, triggerRef, delay, hint, setHint }), [value, setOpen, delay, hint])
  return <TooltipContext.Provider value={ctx}>{children}</TooltipContext.Provider>
}

/**
 * Hover (web, iPad pointer — after the delay) or long-press (Android only, the platform's
 * idiom) shows the tip; it hides on leave, or 1.5s after release. On every platform the
 * tip's text is the trigger's `accessibilityHint` (NAT-57), so VoiceOver/TalkBack read it.
 */
function TooltipTrigger({ children, onLongPress, onPressOut, onHoverIn, onHoverOut, style, ...props }: Omit<React.ComponentProps<typeof Press>, "children"> & { children?: React.ReactNode }) {
  const { setOpen, triggerRef, delay, hint } = useTooltip()
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const later = (fn: () => void, ms: number) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(fn, ms)
  }
  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])
  return (
    <View ref={triggerRef} collapsable={false} style={{ alignSelf: "flex-start" }}>
      <Press
        style={style}
        delayLongPress={350}
        accessibilityHint={hint || undefined}
        {...props}
        onLongPress={(e) => {
          onLongPress?.(e)
          if (Platform.OS !== "android") return
          if (timer.current) clearTimeout(timer.current)
          setOpen(true)
        }}
        onPressOut={(e) => {
          onPressOut?.(e)
          if (Platform.OS === "android") later(() => setOpen(false), 1500)
        }}
        onHoverIn={(e) => {
          onHoverIn?.(e)
          later(() => setOpen(true), delay)
        }}
        onHoverOut={(e) => {
          onHoverOut?.(e)
          if (timer.current) clearTimeout(timer.current)
          setOpen(false)
        }}
      >
        {textChildren(children)}
      </Press>
    </View>
  )
}

/** A small glass capsule above the trigger (flips below when there's no room). */
function TooltipContent({ style, children, side = "top", align = "center", sideOffset = 6, ...props }: ViewProps & { side?: Side; align?: Align; sideOffset?: number }) {
  const ui = useUI()
  const { open, setOpen, triggerRef, setHint } = useTooltip()
  const text = textOf(children)
  React.useEffect(() => setHint(text), [text, setHint])
  const target = React.useCallback(() => triggerRef.current, [triggerRef])
  const rect = useAnchorRect(open, target)
  const body = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>{textChildren(children, { size: "xs", weight: "500" })}</View>
  )
  const capsule = [{ paddingHorizontal: 12, paddingVertical: 6, maxWidth: 320 }, style]
  if (Platform.OS === "web") {
    return (
      <WebTip open={open} rect={rect} side={side} align={align} sideOffset={sideOffset}>
        <Glass variant="liquid" visible={open} radius={ui.radius.button} role="tooltip" style={capsule} {...props}>
          {body}
        </Glass>
      </WebTip>
    )
  }
  return (
    <Floating open={open} anchor={rect} onClose={() => setOpen(false)} side={side} align={align} sideOffset={sideOffset} radius={ui.radius.button} accessibilityLiveRegion="polite" style={capsule} {...props}>
      {body}
    </Floating>
  )
}

const textOf = (node: React.ReactNode): string =>
  typeof node === "string" || typeof node === "number" ? String(node) : Array.isArray(node) ? node.map(textOf).filter(Boolean).join(" ") : React.isValidElement<{ children?: React.ReactNode }>(node) ? textOf(node.props.children) : ""

/** Web: a fixed-position layer that never takes the pointer (a Modal would steal hover and flicker). */
function WebTip({ open, rect, side, align, sideOffset, children }: { open: boolean; rect: ReturnType<typeof useAnchorRect>; side: Side; align: Align; sideOffset: number; children: React.ReactNode }) {
  const win = useWindowDimensions()
  const { mounted, progress } = usePresence(open && rect !== null, 120)
  const [size, setSize] = React.useState<{ width: number; height: number } | null>(null)
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    if (!size || size.width !== width || size.height !== height) setSize({ width, height })
  }
  const spot = rect && size ? placeFloating(rect, size, win, side, align, sideOffset) : null
  const dir = spot?.side ?? side
  const slide = dir === "top" || dir === "left" ? 4 : -4
  const entrance = useEntrance(progress, dir === "top" || dir === "bottom" ? { y: slide, scale: 0.95 } : { x: slide, scale: 0.95 })
  if (!mounted) return null
  return (
    <Animated.View
      onLayout={onLayout}
      pointerEvents="none"
      style={[{ left: spot ? spot.left : -10000, top: spot ? spot.top : 0, zIndex: 1000 }, web({ position: "fixed" }), entrance]}
    >
      {children}
    </Animated.View>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
