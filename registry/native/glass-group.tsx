import * as React from "react"
import { type LayoutChangeEvent, type LayoutRectangle, type PressableProps, type StyleProp, type ViewStyle } from "react-native"
import Animated from "react-native-reanimated"

import { hitSlop } from "@/components/glass/native/a11y"
import { Glass, GlassEffectGroup } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { useSlidingSelection, withGlyphs } from "@/components/glass/native/segmented-control"
import { useUI, web } from "@/components/glass/native/ui"

type Ctx = { register: (v: string) => (e: LayoutChangeEvent) => void; radius: number; claim: (v: string, on: boolean) => void }
const GroupContext = React.createContext<Ctx | null>(null)

type GlassGroupProps = {
  /** The item value the indicator sits on; items can instead mark themselves `selected`. */
  selected?: string
  /** Slide a fill to the selected item (on when `selected` is given). */
  indicator?: boolean
  orientation?: "horizontal" | "vertical"
  /** @deprecated use `orientation="vertical"`. */
  vertical?: boolean
  /** Distance at which neighbouring Liquid Glass merges (iOS 26). */
  spacing?: number
  accessibilityLabel?: string
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

/**
 * Apple's GlassEffectContainer: neighbouring controls share ONE Liquid Glass backdrop instead of
 * each being its own glass (never liquid in liquid — items are transparent). The indicator is a
 * fill that springs to the selected item on Reanimated: x, y, width, height and its concentric
 * radius (NAT-19). On iOS 26 the backdrop sits in a `GlassContainer` so it morphs with sibling glass.
 */
export function GlassGroup({ selected, indicator, orientation, vertical, spacing = 8, accessibilityLabel, style, children }: GlassGroupProps) {
  const ui = useUI()
  const [claimed, setClaimed] = React.useState<string | undefined>()
  const current = selected ?? claimed
  const radius = Math.min(ui.radius.button, ui.control.default / 2 + 4)
  const inner = Math.max(0, radius - 4)
  const cornerOf = React.useCallback((f: LayoutRectangle) => Math.min(inner, f.height / 2), [inner])
  const { register, style: slide } = useSlidingSelection(current, { radius: cornerOf })
  const claim = React.useCallback((v: string, on: boolean) => setClaimed((c) => (on ? v : c === v ? undefined : c)), [])
  const ctx = React.useMemo(() => ({ register, radius: inner, claim }), [register, inner, claim])
  const column = orientation === "vertical" || vertical
  const shows = (indicator ?? selected !== undefined) || claimed !== undefined
  return (
    <GroupContext.Provider value={ctx}>
      <GlassEffectGroup spacing={spacing} style={{ alignSelf: "flex-start" }}>
        <Glass variant="liquid" interactive raised radius={radius} accessibilityRole="toolbar" accessibilityLabel={accessibilityLabel} style={[{ flexDirection: column ? "column" : "row", alignSelf: "flex-start", padding: 4, gap: 2 }, style]}>
          {shows ? <Animated.View pointerEvents="none" style={[slide, { backgroundColor: ui.fillStrong }]} /> : null}
          {children}
        </Glass>
      </GlassEffectGroup>
    </GroupContext.Provider>
  )
}

/** A control inside a GlassGroup: transparent on the shared glass, concentric corners, 44pt target. */
export function GlassGroupItem({ value, selected, style, children, ...props }: Omit<PressableProps, "style" | "children"> & { value?: string; selected?: boolean; style?: StyleProp<ViewStyle>; children?: React.ReactNode }) {
  const ui = useUI()
  const ctx = React.useContext(GroupContext)
  if (!ctx) throw new Error("GlassGroupItem must be inside GlassGroup")
  const { claim } = ctx
  React.useEffect(() => {
    if (value !== undefined && selected !== undefined) claim(value, selected)
  }, [claim, value, selected])
  return (
    <Press
      haptic
      liquid
      accessibilityRole="button"
      aria-selected={selected}
      accessibilityState={{ selected }}
      hitSlop={hitSlop(ui.control.default)}
      onLayout={value ? ctx.register(value) : undefined}
      style={[{ minHeight: ui.control.default, minWidth: ui.control.default, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: ctx.radius }, web({ cursor: "pointer" }), style]}
      {...props}
    >
      {withGlyphs(children, { color: selected ? ui.primary : ui.foreground, size: 18, weight: "500" })}
    </Press>
  )
}
