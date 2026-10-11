import * as React from "react"
import { I18nManager, Platform, Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { Host, Switch as NativeSwitch } from "@expo/ui"

import { hitSlop, useReducedMotion } from "@/components/glass/native/a11y"
import { haptics } from "@/components/glass/native/press"
import { useUI, web } from "@/components/glass/native/ui"

type SwitchProps = Omit<PressableProps, "style" | "children" | "onPress"> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  size?: "sm" | "default"
  /** iOS/Android render the system switch (`@expo/ui`) at the default size. `false` forces the glass one. */
  native?: boolean
  style?: StyleProp<ViewStyle>
}

/**
 * The iOS 27 switch: a wide capsule that fills with the accent and a capsule knob that springs
 * across, swelling into a lens while held (NAT-30). Drag the knob to either side to set it.
 * NAT-80: the system switch on iOS/Android (`@expo/ui`) unless `size="sm"` or `native={false}`.
 */
export function Switch({ native = true, ...props }: SwitchProps) {
  if (native && Platform.OS !== "web" && (props.size ?? "default") === "default") return <SystemSwitch {...props} />
  return <GlassSwitch {...props} />
}

function useChecked({ checked, defaultChecked = false, onCheckedChange }: SwitchProps) {
  const [inner, setInner] = React.useState(defaultChecked)
  const on = checked ?? inner
  const set = (next: boolean) => {
    if (next === on) return
    setInner(next)
    onCheckedChange?.(next)
  }
  return [on, set] as const
}

function SystemSwitch({ checked, defaultChecked, onCheckedChange, disabled, style, testID, accessibilityLabel, ...props }: SwitchProps) {
  const ui = useUI()
  const [on, set] = useChecked({ checked, defaultChecked, onCheckedChange })
  return (
    <Host matchContents colorScheme={ui.scheme} seedColor={ui.primary} accessibilityLabel={accessibilityLabel ?? props["aria-label"]} style={[{ alignSelf: "flex-start" }, style]}>
      <NativeSwitch value={on} onValueChange={set} disabled={!!disabled} testID={testID} />
    </Host>
  )
}

function GlassSwitch({ checked, defaultChecked, onCheckedChange, size = "default", disabled, style, ...props }: SwitchProps) {
  const ui = useUI()
  const reduced = useReducedMotion() || ui.motion.duration === 0
  const [on, set] = useChecked({ checked, defaultChecked, onCheckedChange })
  const [w, h, knobW, knob, travel] = size === "sm" ? [44, 20, 26, 16, 14] : [63, 28, 38, 24, 21]
  const spring = ui.motion.springConfig
  const pos = useSharedValue(on ? 1 : 0)
  const held = useSharedValue(0)
  // gesture scratch: shared values, read from the gesture callbacks (not render)
  const dragged = useSharedValue(false)

  React.useEffect(() => {
    pos.set(reduced ? (on ? 1 : 0) : withSpring(on ? 1 : 0, spring))
  }, [on, pos, reduced, spring])

  const hold = (to: number) => {
    held.set(reduced ? 0 : withSpring(to, spring))
  }
  const toggle = (next: boolean) => {
    if (next !== on) haptics.selection()
    set(next)
  }

  // drag-to-toggle: horizontal only, so a switch inside a ScrollView still scrolls (NAT-30)
  const dir = I18nManager.isRTL ? -1 : 1
  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(!disabled)
    .activeOffsetX([-6, 6])
    .failOffsetY([-8, 8])
    .onStart(() => {
      dragged.set(true)
      hold(1)
    })
    .onUpdate((e) => {
      pos.set(Math.min(1, Math.max(0, (on ? 1 : 0) + (dir * e.translationX) / travel)))
    })
    .onEnd(() => {
      const next = pos.get() > 0.5
      if (next === on) pos.set(reduced ? (on ? 1 : 0) : withSpring(on ? 1 : 0, spring))
      toggle(next)
    })
    .onFinalize(() => {
      hold(0)
      // the Pressable's onPress follows the release; let it see the drag first
      setTimeout(() => dragged.set(false), 0)
    })

  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(pos.value, [0, 1], [ui.fillStrong, ui.primary]) }))
  const lens = ui.motion.knobLensScale
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dir * pos.value * travel }, { scaleX: 1 + held.value * (lens - 1) * 1.3 }, { scaleY: 1 + held.value * (lens - 1) * 0.6 }],
    // while held the knob is a lens: it clears towards the glass knob colour
    backgroundColor: interpolateColor(held.value, [0, 1], ["#FFFFFF", ui.knob]),
  }))

  return (
    <GestureDetector gesture={pan}>
      <Pressable
        accessibilityRole="switch"
        aria-checked={on}
        aria-disabled={!!disabled}
        accessibilityState={{ checked: on, disabled: !!disabled }}
        disabled={disabled}
        hitSlop={hitSlop(h, w)}
        onPressIn={() => hold(1)}
        onPressOut={() => hold(0)}
        onPress={() => {
          if (!dragged.get()) toggle(!on)
        }}
        style={[{ width: w, height: h, opacity: disabled ? 0.5 : 1 }, web({ cursor: disabled ? "not-allowed" : "pointer", touchAction: "pan-y" }), style]}
        {...props}
      >
        <Animated.View style={[{ flex: 1, padding: 2, borderRadius: h / 2, justifyContent: "center", alignItems: "flex-start" }, track]}>
          <View style={{ width: knobW, height: knob }} pointerEvents="none">
            <Animated.View
              style={[
                { width: knobW, height: knob, borderRadius: knob / 2, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
                knobStyle,
              ]}
            />
          </View>
        </Animated.View>
      </Pressable>
    </GestureDetector>
  )
}
