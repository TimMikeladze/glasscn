import * as React from "react"
import { Animated, Platform, View, useWindowDimensions, type LayoutChangeEvent, type ViewProps } from "react-native"

import { glassOpacity, textChildren, useControllableOpen, usePresence } from "@/components/glass/native/dialog"
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

type TooltipCtx = { open: boolean; setOpen: (open: boolean) => void; triggerRef: React.RefObject<View | null>; delay: number }
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
  const ctx = React.useMemo(() => ({ open: value, setOpen, triggerRef, delay }), [value, setOpen, delay])
  return <TooltipContext.Provider value={ctx}>{children}</TooltipContext.Provider>
}

/** Hover (web, after the delay) or long-press (touch) shows the tip; it hides on leave, or 1.5s after release. */
function TooltipTrigger({ children, onLongPress, onPressOut, onHoverIn, onHoverOut, style, ...props }: Omit<React.ComponentProps<typeof Press>, "children"> & { children?: React.ReactNode }) {
  const { setOpen, triggerRef, delay } = useTooltip()
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
        {...props}
        onLongPress={(e) => {
          onLongPress?.(e)
          if (timer.current) clearTimeout(timer.current)
          setOpen(true)
        }}
        onPressOut={(e) => {
          onPressOut?.(e)
          if (Platform.OS !== "web") later(() => setOpen(false), 1500)
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
  const { open, setOpen, triggerRef } = useTooltip()
  const target = React.useCallback(() => triggerRef.current, [triggerRef])
  const rect = useAnchorRect(open, target)
  const body = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>{textChildren(children, { size: "xs", weight: "500" })}</View>
  )
  const capsule = [{ paddingHorizontal: 12, paddingVertical: 6, maxWidth: 320 }, style]
  if (Platform.OS === "web") {
    return (
      <WebTip open={open} rect={rect} side={side} align={align} sideOffset={sideOffset}>
        <Glass radius={ui.radius.button} tint={ui.glassStrong} role="tooltip" style={capsule} {...props}>
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

/** Web: a fixed-position layer that never takes the pointer (a Modal would steal hover and flicker). */
function WebTip({ open, rect, side, align, sideOffset, children }: { open: boolean; rect: ReturnType<typeof useAnchorRect>; side: Side; align: Align; sideOffset: number; children: React.ReactNode }) {
  const win = useWindowDimensions()
  const { mounted, progress } = usePresence(open && rect !== null, 120)
  const [size, setSize] = React.useState<{ width: number; height: number } | null>(null)
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    if (!size || size.width !== width || size.height !== height) setSize({ width, height })
  }
  if (!mounted) return null
  const spot = rect && size ? placeFloating(rect, size, win, side, align, sideOffset) : null
  const dir = spot?.side ?? side
  const slide = progress.interpolate({ inputRange: [0, 1], outputRange: [dir === "top" || dir === "left" ? 4 : -4, 0] })
  return (
    <Animated.View
      onLayout={onLayout}
      pointerEvents="none"
      style={[
        {
          left: spot ? spot.left : -10000,
          top: spot ? spot.top : 0,
          zIndex: 1000,
          opacity: glassOpacity(progress),
          transform: [dir === "top" || dir === "bottom" ? { translateY: slide } : { translateX: slide }, { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
        },
        web({ position: "fixed" }),
      ]}
    >
      {children}
    </Animated.View>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
