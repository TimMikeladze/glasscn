import * as React from "react"
import { View, type ViewProps } from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"

import { Press } from "@/components/glass/native/press"
import { useUI } from "@/components/glass/native/ui"

type Ctx = { open: boolean; toggle: () => void; disabled?: boolean }
const CollapsibleContext = React.createContext<Ctx | null>(null)
function useCollapsible() {
  const ctx = React.useContext(CollapsibleContext)
  if (!ctx) throw new Error("Collapsible parts must be inside <Collapsible>")
  return ctx
}

/** Show and hide a region from a trigger; the region eases in and out (Reanimated; still under Reduce Motion). */
function Collapsible({ open, defaultOpen = false, onOpenChange, disabled, ...props }: ViewProps & { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; disabled?: boolean }) {
  const [inner, setInner] = React.useState(defaultOpen)
  const value = open ?? inner
  const toggle = () => {
    setInner(!value)
    onOpenChange?.(!value)
  }
  return (
    <CollapsibleContext.Provider value={{ open: value, toggle, disabled }}>
      <View {...props} />
    </CollapsibleContext.Provider>
  )
}

function CollapsibleTrigger({ onPress, ...props }: React.ComponentProps<typeof Press>) {
  const c = useCollapsible()
  return (
    <Press
      accessibilityRole="button"
      aria-expanded={c.open}
      disabled={c.disabled}
      onPress={(e) => {
        onPress?.(e)
        c.toggle()
      }}
      {...props}
    />
  )
}

function CollapsibleContent({ style, ...props }: ViewProps) {
  const ui = useUI()
  const c = useCollapsible()
  if (!c.open) return null
  return <Animated.View entering={FadeIn.duration(ui.motion.duration)} exiting={FadeOut.duration(ui.motion.duration / 2)} style={[{ overflow: "hidden" }, style]} {...props} />
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent, useCollapsible }
