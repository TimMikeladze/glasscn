import * as React from "react"
import { Animated, StyleSheet, View, useWindowDimensions, type LayoutChangeEvent, type StyleProp, type ViewProps, type ViewStyle } from "react-native"

import { Backdrop, DialogPortal, glassOpacity, textChildren, useControllableOpen, usePresence } from "@/components/glass/native/dialog"
import { Glass } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { useUI } from "@/components/glass/native/ui"

export type Side = "top" | "right" | "bottom" | "left"
export type Align = "start" | "center" | "end"
export type Rect = { x: number; y: number; width: number; height: number }

/**
 * Where a floating panel of `size` goes beside `anchor` inside a `win`-sized window:
 * on `side`, flipped to the opposite side when it doesn't fit, then clamped inside the margins.
 */
export function placeFloating(anchor: Rect, size: { width: number; height: number }, win: { width: number; height: number }, side: Side, align: Align, offset: number, margin = 8) {
  const fits = (s: Side) =>
    s === "bottom"
      ? anchor.y + anchor.height + offset + size.height <= win.height - margin
      : s === "top"
        ? anchor.y - offset - size.height >= margin
        : s === "right"
          ? anchor.x + anchor.width + offset + size.width <= win.width - margin
          : anchor.x - offset - size.width >= margin
  const opposite: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" }
  const placed = fits(side) || !fits(opposite[side]) ? side : opposite[side]
  const along = (start: number, length: number, extent: number) => (align === "start" ? start : align === "end" ? start + length - extent : start + (length - extent) / 2)
  const clamp = (v: number, max: number) => Math.max(margin, Math.min(v, max - margin))
  if (placed === "top" || placed === "bottom") {
    const top = placed === "bottom" ? anchor.y + anchor.height + offset : anchor.y - offset - size.height
    return { side: placed, left: clamp(along(anchor.x, anchor.width, size.width), win.width - size.width), top: clamp(top, win.height - size.height) }
  }
  const left = placed === "right" ? anchor.x + anchor.width + offset : anchor.x - offset - size.width
  return { side: placed, left: clamp(left, win.width - size.width), top: clamp(along(anchor.y, anchor.height, size.height), win.height - size.height) }
}

/** Measures `target()` in window coordinates (measureInWindow) each time `open` turns on or the window resizes. */
export function useAnchorRect(open: boolean, target: () => View | null) {
  const [rect, setRect] = React.useState<Rect | null>(null)
  const { width, height } = useWindowDimensions()
  React.useEffect(() => {
    if (!open) return
    target()?.measureInWindow((x, y, w, h) => setRect({ x, y, width: w, height: h }))
  }, [open, target, width, height])
  return rect
}

export type FloatingProps = ViewProps & {
  open: boolean
  anchor: Rect | null
  onClose: () => void
  side?: Side
  align?: Align
  sideOffset?: number
  /** Strong-glass panel radius; defaults to rounded-surface-sm. */
  radius?: number
  /** Leave false to keep the page bright (popovers and menus don't dim). */
  dim?: boolean
}

/**
 * A glass panel anchored to a measured rect in its own transparent Modal: lands on
 * `side`, flips when off-screen, slides 8pt from the anchor and scales from 95%.
 * Tapping outside, Escape (web) and hardware back (Android) close it.
 */
export function Floating({ open, anchor, onClose, side = "bottom", align = "center", sideOffset = 8, radius, dim = false, style, children, ...props }: FloatingProps) {
  const ui = useUI()
  const win = useWindowDimensions()
  const { mounted, progress } = usePresence(open && anchor !== null, 160)
  const [size, setSize] = React.useState<{ width: number; height: number } | null>(null)
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    if (!size || Math.abs(size.width - width) > 0.5 || Math.abs(size.height - height) > 0.5) setSize({ width, height })
  }
  // off-screen until measured — never an opacity-0 start (Liquid Glass wouldn't render)
  const spot = anchor && size ? placeFloating(anchor, size, win, side, align, sideOffset) : null
  const dir = spot?.side ?? side
  const slide = progress.interpolate({ inputRange: [0, 1], outputRange: [dir === "top" || dir === "left" ? 8 : -8, 0] })
  return (
    <DialogPortal visible={mounted} onRequestClose={onClose}>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Backdrop progress={progress} onPress={onClose} dim={dim} />
        <Animated.View
          onLayout={onLayout}
          style={{
            position: "absolute",
            left: spot ? spot.left : -10000,
            top: spot ? spot.top : 0,
            maxWidth: win.width - 16,
            maxHeight: win.height - 16,
            opacity: glassOpacity(progress),
            transform: [dir === "top" || dir === "bottom" ? { translateY: slide } : { translateX: slide }, { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
          }}
        >
          <Glass radius={radius ?? ui.radius.surface - 6} tint={ui.glassStrong} style={style} {...props}>
            {children}
          </Glass>
        </Animated.View>
      </View>
    </DialogPortal>
  )
}

type PopoverCtx = { open: boolean; setOpen: (open: boolean) => void; triggerRef: React.RefObject<View | null>; anchorRef: React.RefObject<View | null> }
const PopoverContext = React.createContext<PopoverCtx | null>(null)
function usePopover() {
  const ctx = React.useContext(PopoverContext)
  if (!ctx) throw new Error("Popover parts must be inside <Popover>")
  return ctx
}

/** Root: open state, controlled (`open`/`onOpenChange`) or not (`defaultOpen`). */
function Popover({ open, defaultOpen, onOpenChange, children }: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode }) {
  const [value, setOpen] = useControllableOpen(open, defaultOpen, onOpenChange)
  const triggerRef = React.useRef<View>(null)
  const anchorRef = React.useRef<View>(null)
  const ctx = React.useMemo(() => ({ open: value, setOpen, triggerRef, anchorRef }), [value, setOpen])
  return <PopoverContext.Provider value={ctx}>{children}</PopoverContext.Provider>
}

/** Toggles the popover; the panel anchors to it unless a PopoverAnchor is present. */
function PopoverTrigger({ children, onPress, style, ...props }: Omit<React.ComponentProps<typeof Press>, "children"> & { children?: React.ReactNode }) {
  const { open, setOpen, triggerRef } = usePopover()
  return (
    <View ref={triggerRef} collapsable={false} style={{ alignSelf: "flex-start" }}>
      <Press
        accessibilityRole="button"
        aria-expanded={open}
        style={style}
        {...props}
        onPress={(e) => {
          onPress?.(e)
          setOpen(!open)
        }}
      >
        {textChildren(children)}
      </Press>
    </View>
  )
}

/** Anchors the panel to something other than the trigger. */
function PopoverAnchor({ style, ...props }: ViewProps & { style?: StyleProp<ViewStyle> }) {
  const { anchorRef } = usePopover()
  return <View ref={anchorRef} collapsable={false} style={style} {...props} />
}

/** Strong-glass panel, w-72, beside the trigger (bottom by default, flips when it won't fit). */
function PopoverContent({ style, children, side = "bottom", align = "center", sideOffset = 8, ...props }: ViewProps & { side?: Side; align?: Align; sideOffset?: number }) {
  const { open, setOpen, triggerRef, anchorRef } = usePopover()
  const target = React.useCallback(() => anchorRef.current ?? triggerRef.current, [anchorRef, triggerRef])
  const rect = useAnchorRect(open, target)
  return (
    <Floating open={open} anchor={rect} onClose={() => setOpen(false)} side={side} align={align} sideOffset={sideOffset} role="dialog" style={[{ width: 288, padding: 16, gap: 12 }, style]} {...props}>
      {textChildren(children, { size: "sm" })}
    </Floating>
  )
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger }
