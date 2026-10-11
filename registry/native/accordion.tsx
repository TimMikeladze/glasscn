import * as React from "react"
import { type ViewProps } from "react-native"
import Animated, { FadeIn, FadeOut, LinearTransition, useAnimatedStyle, useDerivedValue, withSpring } from "react-native-reanimated"
import { ChevronRightIcon } from "lucide-react-native"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { Press, haptics } from "@/components/glass/native/press"
import { GText, useUI } from "@/components/glass/native/ui"

type Ctx = { open: string[]; toggle: (v: string) => void; variant: "default" | "grouped" }
const AccordionContext = React.createContext<Ctx | null>(null)
const ItemContext = React.createContext<{ value: string; last: boolean }>({ value: "", last: false })

type Single = { type?: "single"; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; collapsible?: boolean }
type Multiple = { type: "multiple"; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void }

/** Apple's disclosure rows: a trailing chevron that turns down as the row opens. `variant="grouped"` sets them on an inset fill. */
function Accordion({ variant = "default", style, children, ...rest }: ViewProps & (Single | Multiple) & { variant?: "default" | "grouped" }) {
  const ui = useUI()
  const { type = "single", value, defaultValue, onValueChange, ...props } = rest as ViewProps & (Single | Multiple)
  const arr = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : v ? [v] : [])
  const [inner, setInner] = React.useState(arr(defaultValue))
  const open = value !== undefined ? arr(value) : inner
  const toggle = (v: string) => {
    haptics.selection()
    const next = type === "multiple" ? (open.includes(v) ? open.filter((x) => x !== v) : [...open, v]) : open.includes(v) ? [] : [v]
    setInner(next)
    if (type === "multiple") (onValueChange as Multiple["onValueChange"])?.(next)
    else (onValueChange as Single["onValueChange"])?.(next[0] ?? "")
  }
  const items = React.Children.toArray(children)
  return (
    <AccordionContext.Provider value={{ open, toggle, variant }}>
      <Animated.View layout={LinearTransition.duration(ui.motion.duration)} style={[{ width: "100%" }, variant === "grouped" ? { backgroundColor: ui.fill, borderRadius: ui.radius.surface - 6, overflow: "hidden" } : null, style]} {...props}>
        {items.map((c, i) => (
          <ItemContext.Provider key={i} value={{ value: React.isValidElement<{ value?: string }>(c) ? (c.props.value ?? String(i)) : String(i), last: i === items.length - 1 }}>
            {c}
          </ItemContext.Provider>
        ))}
      </Animated.View>
    </AccordionContext.Provider>
  )
}

function AccordionItem({ value, style, ...props }: ViewProps & { value: string }) {
  const ui = useUI()
  const { last } = React.useContext(ItemContext)
  const a = React.useContext(AccordionContext)
  return (
    <ItemContext.Provider value={{ value, last }}>
      <Animated.View layout={LinearTransition.duration(ui.motion.duration)} style={[{ borderBottomWidth: last ? 0 : 1, borderBottomColor: ui.separator, overflow: "hidden" }, a?.variant === "grouped" ? { marginLeft: ui.pad.sm } : null, style]} {...props} />
    </ItemContext.Provider>
  )
}

function AccordionTrigger({ children, disabled }: { children?: React.ReactNode; disabled?: boolean }) {
  const ui = useUI()
  const a = React.useContext(AccordionContext)
  const { value } = React.useContext(ItemContext)
  const open = !!a?.open.includes(value)
  const reduced = useReducedMotion()
  const turn = useDerivedValue(() => (reduced ? (open ? 90 : 0) : withSpring(open ? 90 : 0, ui.motion.springConfig)), [open, reduced])
  const chevron = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value}deg` }] }))
  return (
    <Press
      accessibilityRole="button"
      aria-expanded={open}
      disabled={disabled}
      onPress={() => a?.toggle(value)}
      style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16, paddingVertical: 14, minHeight: 44, paddingRight: a?.variant === "grouped" ? ui.pad.sm : 0, opacity: disabled ? 0.5 : 1 }}
    >
      {typeof children === "string" ? (
        <GText size="sm" weight="500" style={{ flex: 1 }}>
          {children}
        </GText>
      ) : (
        children
      )}
      <Animated.View style={chevron}>
        <ChevronRightIcon size={16} color={ui.mutedForeground} />
      </Animated.View>
    </Press>
  )
}

function AccordionContent({ style, children, ...props }: ViewProps) {
  const ui = useUI()
  const a = React.useContext(AccordionContext)
  const { value } = React.useContext(ItemContext)
  if (!a?.open.includes(value)) return null
  return (
    <Animated.View entering={FadeIn.duration(ui.motion.duration)} exiting={FadeOut.duration(ui.motion.duration / 2)} style={[{ paddingBottom: 14, paddingRight: a.variant === "grouped" ? ui.pad.sm : 0 }, style]} {...props}>
      {typeof children === "string" ? (
        <GText size="sm" tone="muted">
          {children}
        </GText>
      ) : (
        children
      )}
    </Animated.View>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
