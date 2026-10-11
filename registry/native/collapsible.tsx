import * as React from "react"
import { LayoutAnimation, View, type ViewProps } from "react-native"

import { Press } from "@/components/glass/native/press"
import { reduceMotion } from "@/components/glass/native/dialog"

type Ctx = { open: boolean; toggle: () => void; disabled?: boolean }
const CollapsibleContext = React.createContext<Ctx | null>(null)
function useCollapsible() {
  const ctx = React.useContext(CollapsibleContext)
  if (!ctx) throw new Error("Collapsible parts must be inside <Collapsible>")
  return ctx
}

/** Show and hide a region from a trigger; the height animates (snaps under reduce motion). */
function Collapsible({ open, defaultOpen = false, onOpenChange, disabled, ...props }: ViewProps & { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; disabled?: boolean }) {
  const [inner, setInner] = React.useState(defaultOpen)
  const value = open ?? inner
  const toggle = () => {
    if (!reduceMotion()) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
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
  const c = useCollapsible()
  if (!c.open) return null
  return <View style={[{ overflow: "hidden" }, style]} {...props} />
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent, useCollapsible }
