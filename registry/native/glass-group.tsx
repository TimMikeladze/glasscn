import * as React from "react"
import { Animated, type LayoutChangeEvent, type PressableProps, type StyleProp, type ViewStyle } from "react-native"

import { Glass } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { useSlidingIndicator, withGlyphs } from "@/components/glass/native/segmented-control"
import { useUI, web } from "@/components/glass/native/ui"

type Ctx = { register: (v: string) => (e: LayoutChangeEvent) => void; radius: number }
const GroupContext = React.createContext<Ctx | null>(null)

/**
 * Apple's GlassEffectContainer: neighbouring controls share ONE Liquid Glass backdrop instead of
 * each being its own glass. Items are transparent; `selected` names the item a fill slides to.
 */
export function GlassGroup({ selected, vertical = false, style, children }: { selected?: string; vertical?: boolean; style?: StyleProp<ViewStyle>; children?: React.ReactNode }) {
  const ui = useUI()
  const { register, style: indicator } = useSlidingIndicator(selected)
  const radius = Math.min(ui.radius.button, ui.control.default / 2 + 4)
  const ctx = React.useMemo(() => ({ register, radius: Math.max(0, radius - 4) }), [register, radius])
  return (
    <GroupContext.Provider value={ctx}>
      <Glass interactive raised radius={radius} style={[{ flexDirection: vertical ? "column" : "row", alignSelf: "flex-start", padding: 4, gap: 2 }, style]}>
        {selected !== undefined && <Animated.View pointerEvents="none" style={[indicator, { borderRadius: ctx.radius, backgroundColor: ui.fillStrong }]} />}
        {children}
      </Glass>
    </GroupContext.Provider>
  )
}

/** A control inside a GlassGroup: transparent on the shared glass, concentric corners. */
export function GlassGroupItem({ value, selected, style, children, ...props }: Omit<PressableProps, "style" | "children"> & { value?: string; selected?: boolean; style?: StyleProp<ViewStyle>; children?: React.ReactNode }) {
  const ui = useUI()
  const ctx = React.useContext(GroupContext)
  if (!ctx) throw new Error("GlassGroupItem must be inside GlassGroup")
  return (
    <Press
      haptic
      accessibilityRole="button"
      aria-selected={selected}
      onLayout={value ? ctx.register(value) : undefined}
      style={[{ height: ui.control.default, minWidth: ui.control.default, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: ctx.radius }, web({ cursor: "pointer" }), style]}
      {...props}
    >
      {withGlyphs(children, { color: selected ? ui.primary : ui.foreground, size: 18, weight: "500" })}
    </Press>
  )
}
