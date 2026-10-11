import * as React from "react"
import { Platform, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { BlurTargetView, BlurView, type BlurTint } from "expo-blur"
import { GlassContainer, GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from "expo-glass-effect"

import { useReduceTransparency } from "@/components/glass/native/a11y"
import { useGlassTheme, type GlassTheme } from "@/components/glass/native/tokens"

export { useReduceTransparency }

let liquid: boolean | null = null
/**
 * Liquid Glass (iOS 26+) when the OS has it. Checked once. Both checks: some
 * iOS 26 betas report Liquid Glass but lack the API and crash on GlassView.
 */
export function hasLiquidGlass() {
  if (liquid === null) {
    try {
      liquid = Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()
    } catch {
      liquid = false
    }
  }
  return liquid
}

/**
 * Liquid Glass doesn't render when it, or any ancestor, has opacity 0 (Expo's
 * known issue), so never fade it: entrances on iOS 26 move (translate, scale)
 * or materialise (`Glass visible`); a `Press` around liquid glass passes `dim={canFade()}`.
 */
export const canFade = () => !hasLiquidGlass()

// ---- Android blur tier: BlurView needs a target view holding what it blurs ----

const BlurTargetContext = React.createContext<React.RefObject<View | null> | null>(null)

/**
 * Android blur tier (NAT-83): wrap the content that glass floats over — usually the
 * screen background and its scroll view — and every `Glass` above it inside this
 * tree blurs it (expo-blur `dimezisBlurViewSdk31Plus`, Android 12+). Without it,
 * Android glass is a translucent fill. A plain View on iOS and the web.
 */
export function GlassBlurTarget({ style, children, ...props }: ViewProps) {
  const ref = React.useRef<View | null>(null)
  if (Platform.OS !== "android") {
    return (
      <View style={style} {...props}>
        {children}
      </View>
    )
  }
  return (
    <BlurTargetContext.Provider value={ref}>
      <BlurTargetView ref={ref} style={style} {...props}>
        {children}
      </BlurTargetView>
    </BlurTargetContext.Provider>
  )
}

export type GlassVariant = "material" | "liquid" | "liquid-clear"
export type GlassIntensity = "subtle" | "default" | "strong"

export type GlassProps = ViewProps & {
  /**
   * `material` (default): the content layer — cards, panes, lists; a system material, never Liquid Glass.
   * `liquid`: the control layer — floating bars, buttons, menus, sheets; Liquid Glass on iOS 26.
   * `liquid-clear`: liquid over media, with a dim so bold content stays legible.
   * Omitted with `interactive` → `liquid`.
   */
  variant?: GlassVariant
  /** Material thickness: subtle (quiet panes), default, strong (dialogs, menus). */
  intensity?: GlassIntensity
  radius?: number
  /** An accent wash mixed into the frost (never an opaque background). */
  tint?: string
  /** A soft drop shadow (the frost carries its own depth on iOS 26 liquid). */
  raised?: boolean
  /** Liquid Glass reacts to touch — buttons, tab bars. Implies `liquid`. */
  interactive?: boolean
  /** Top chrome that fades with scroll: a chrome material, never Liquid Glass. */
  bar?: boolean
  /** Materialise in/out (liquid on iOS 26: `glassEffectStyle` animates from `none`; elsewhere a scale). Default true. */
  visible?: boolean
}

const MATERIAL_TINT: Record<GlassIntensity, [BlurTint, BlurTint]> = {
  subtle: ["systemUltraThinMaterialLight", "systemUltraThinMaterialDark"],
  default: ["systemThinMaterialLight", "systemThinMaterialDark"],
  strong: ["systemMaterialLight", "systemMaterialDark"],
}

/** Frost colour for a variant/intensity where the platform has no material of its own. */
function frostOf(t: GlassTheme, variant: GlassVariant, intensity: GlassIntensity) {
  if (variant === "liquid") return t.glassLiquid
  if (variant === "liquid-clear") return t.glassLiquidClear
  return intensity === "subtle" ? t.glassSubtle : intensity === "strong" ? t.glassStrong : t.glass
}

/** `#rrggbb` → rgba at alpha; other formats pass through. */
const wash = (c: string, a: number) => {
  if (!/^#[0-9a-f]{6}$/i.test(c)) return c
  const n = parseInt(c.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

function shadowOf(t: GlassTheme): ViewStyle {
  return Platform.select<ViewStyle>({
    web: { boxShadow: `0 ${t.shadowY}px ${t.shadowBlur}px ${t.glassShadow}` } as ViewStyle,
    // translucent fill + elevation draws a dark halo on Android (NAT-17); RN 0.76+ boxShadow doesn't
    android: { boxShadow: `0 ${Math.round(t.shadowY / 2)}px ${Math.round(t.shadowBlur / 2)}px ${t.glassShadow}` } as ViewStyle,
    default: { shadowColor: t.glassShadow.startsWith("rgba") ? t.glassShadow.replace(/,[\d.]+\)$/, ",1)") : t.glassShadow, shadowOpacity: alphaOf(t.glassShadow), shadowRadius: t.shadowBlur / 2, shadowOffset: { width: 0, height: t.shadowY } },
  }) as ViewStyle
}
const alphaOf = (c: string) => {
  const m = c.match(/,([\d.]+)\)$/)
  return m ? Number(m[1]) : 1
}

/**
 * Glass for React Native — two layers, like Apple's:
 *
 * - **material** (content): iOS → UIVisualEffect system material · web → token backdrop-filter ·
 *   Android → blur tier inside `GlassBlurTarget`, else a translucent fill.
 * - **liquid** (controls): iOS 26 → Liquid Glass (`GlassView`) · elsewhere → the liquid frost tokens.
 *
 * Reduce Transparency → a solid fill with a firm border on every path but Liquid Glass (which follows it natively).
 * Never put liquid inside liquid, and never animate opacity on or above it.
 */
export function Glass(props: GlassProps) {
  const onLiquid = React.useContext(OnLiquidContext)
  const variant: GlassVariant = props.bar ? "material" : (props.variant ?? (props.interactive ? "liquid" : "material"))
  // never liquid in liquid (NAT-18): glass can't sample glass, so a liquid child of liquid is just its shape
  if (onLiquid && variant !== "material") return <ClearGlass {...props} />
  const surface = <GlassSurface {...props} variant={variant} />
  return variant === "material" ? surface : <OnLiquidContext.Provider value={true}>{surface}</OnLiquidContext.Provider>
}

const GLASS_KEYS = new Set(["variant", "intensity", "radius", "tint", "raised", "interactive", "bar", "visible", "style", "children"])
/** The plain View props of a GlassProps. */
const viewPropsOf = (p: GlassProps) => Object.fromEntries(Object.entries(p).filter(([k]) => !GLASS_KEYS.has(k))) as ViewProps

/** True under a liquid `Glass`: controls there are fills, and nested liquid renders clear. */
const OnLiquidContext = React.createContext(false)
export const useOnLiquid = () => React.useContext(OnLiquidContext)

function ClearGlass(props: GlassProps) {
  const { radius, tint, style, children, visible = true } = props
  const rest = viewPropsOf(props)
  const t = useGlassTheme()
  const shape: ViewStyle = { borderRadius: radius ?? t.radius.surface, borderCurve: "continuous" }
  return (
    <View style={[shape, tint ? { backgroundColor: wash(tint, t.scheme === "dark" ? 0.32 : 0.22) } : null, visible ? null : { transform: [{ scale: 0.96 }], pointerEvents: "none" }, style]} {...rest}>
      {children}
    </View>
  )
}

function GlassSurface({ variant: variantProp, intensity = "default", radius, tint, raised = true, interactive, bar, visible = true, style, children, ...rest }: GlassProps) {
  const t = useGlassTheme()
  const solid = useReduceTransparency()
  const blurTarget = React.useContext(BlurTargetContext)
  const variant = variantProp as GlassVariant
  const shape: ViewStyle = { borderRadius: radius ?? t.radius.surface, borderCurve: "continuous" }
  const dark = t.scheme === "dark"
  // without native materialise, hidden glass collapses by scale (never opacity)
  const hidden: ViewStyle | null = visible ? null : { transform: [{ scale: 0.96 }], pointerEvents: "none" }

  // iOS 26 Liquid Glass — the control layer only. GlassView follows Reduce Transparency itself.
  if (variant !== "material" && hasLiquidGlass()) {
    const glassStyle = variant === "liquid-clear" ? "clear" : "regular"
    return (
      <GlassView
        glassEffectStyle={{ style: visible ? glassStyle : "none", animate: true, animationDuration: t.motion.duration / 1000 }}
        colorScheme={t.scheme}
        tintColor={tint ?? t.glassTint}
        isInteractive={interactive}
        style={[shape, style]}
        {...rest}
      >
        {variant === "liquid-clear" ? <View style={[StyleSheet.absoluteFill, shape, { backgroundColor: t.glassClearDim, pointerEvents: "none" }]} /> : null}
        {children}
      </GlassView>
    )
  }

  const tintLayer = tint ? <View style={[StyleSheet.absoluteFill, shape, { pointerEvents: "none", backgroundColor: wash(tint, dark ? 0.32 : 0.22) }]} /> : null
  const border: ViewStyle = { borderWidth: StyleSheet.hairlineWidth, borderColor: t.glassBorder }

  // Reduce Transparency: no blur — the solid fill, a border that holds its edge
  if (solid) {
    return (
      <View style={[shape, { backgroundColor: t.glassSolid, borderWidth: 1, borderColor: t.fillStrong }, raised ? shadowOf(t) : null, hidden, style]} {...rest}>
        {tintLayer}
        {children}
      </View>
    )
  }

  const frost = frostOf(t, variant, intensity)
  const liquidish = variant !== "material"

  if (Platform.OS === "web") {
    const blur = liquidish ? t.liquidBlur : t.blur
    const filter = `blur(${blur}px) saturate(${liquidish ? 200 : 180}%)`
    const rim = liquidish ? `inset 0 1px 0 ${t.glassHighlight}, inset 0 -1px 0 ${wash("#000000", t.edgeShade)}` : `inset 0 1px 0 ${t.glassHighlight}`
    return (
      <View
        style={[
          shape,
          {
            backgroundColor: frost,
            backgroundImage: tint ? `linear-gradient(${wash(tint, dark ? 0.32 : 0.22)}, ${wash(tint, dark ? 0.32 : 0.22)})` : undefined,
            borderWidth: 1,
            borderColor: t.glassBorder,
            backdropFilter: filter,
            WebkitBackdropFilter: filter,
            boxShadow: raised ? `0 ${t.shadowY}px ${t.shadowBlur}px ${t.glassShadow}, ${rim}` : rim,
            transitionProperty: "transform",
            transitionDuration: `${t.motion.duration}ms`,
          } as ViewStyle,
          variant === "liquid-clear" ? ({ backgroundImage: `linear-gradient(${t.glassClearDim}, ${t.glassClearDim})` } as ViewStyle) : null,
          hidden,
          style,
        ]}
        {...rest}
      >
        {children}
      </View>
    )
  }

  if (Platform.OS === "android") {
    // blur tier when a GlassBlurTarget holds the backdrop; a fill otherwise (stronger, since nothing blurs behind it)
    const fill = blurTarget ? frost : liquidish ? t.glassStrong : t.glassSolid
    return (
      <View style={[shape, raised ? shadowOf(t) : null, hidden, style]} {...rest}>
        <View style={[StyleSheet.absoluteFill, shape, { overflow: "hidden" }]}>
          {blurTarget ? <BlurView blurTarget={blurTarget} blurMethod="dimezisBlurViewSdk31Plus" intensity={liquidish ? 40 : 70} tint={dark ? "dark" : "light"} style={StyleSheet.absoluteFill} /> : null}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: fill }, border, shape]} />
          {tintLayer}
        </View>
        {children}
      </View>
    )
  }

  // iOS material (every version), and liquid below iOS 26: UIVisualEffect blur.
  // The shadow sits on the outer view; the blur clips in an inner one (NAT-16).
  const material = bar ? (dark ? "systemChromeMaterialDark" : "systemChromeMaterialLight") : MATERIAL_TINT[liquidish ? "subtle" : intensity][dark ? 1 : 0]
  return (
    <View style={[shape, raised ? shadowOf(t) : null, hidden, style]} {...rest}>
      <View style={[StyleSheet.absoluteFill, shape, { overflow: "hidden", pointerEvents: "none" }]}>
        <BlurView tint={material} intensity={liquidish ? 60 : 90} style={StyleSheet.absoluteFill} />
        {variant === "liquid-clear" ? <View style={[StyleSheet.absoluteFill, { backgroundColor: t.glassClearDim }]} /> : null}
        <View style={[StyleSheet.absoluteFill, shape, border]} />
        {tintLayer}
      </View>
      {children}
    </View>
  )
}

/**
 * Apple's GlassEffectContainer: Liquid Glass children within `spacing` of each other
 * merge and morph as one. iOS 26: `GlassContainer`; elsewhere a plain View.
 */
export function GlassEffectGroup({ spacing = 8, style, children, ...props }: ViewProps & { spacing?: number; style?: StyleProp<ViewStyle> }) {
  if (hasLiquidGlass())
    return (
      <GlassContainer spacing={spacing} style={style} {...props}>
        {children}
      </GlassContainer>
    )
  return (
    <View style={style} {...props}>
      {children}
    </View>
  )
}
