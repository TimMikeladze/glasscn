import * as React from "react"
import { View } from "react-native"
import { useFocusEffect, useLocalSearchParams } from "expo-router"
import Animated, { LinearTransition } from "react-native-reanimated"
import { BookmarkIcon, HeartIcon, PlusIcon } from "lucide-react-native"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { Backdrop } from "@/components/glass/native/backdrop"
import { Button } from "@/components/glass/native/button"
import { GlassCluster, GlassClusterItem } from "@/components/glass/native/glass-cluster"
import { LiquidGlass } from "@/components/glass/native/liquid-glass"
import { LiquidGlass01, type LiquidGlassScene } from "@/components/glass/native/liquid-glass-01"
import { GlassThemeProvider } from "@/components/glass/native/tokens"
import { GText, useUI } from "@/components/glass/native/ui"
import type { Demo } from "@/sandbox/demos/types"
import { Chip, Section } from "@/sandbox/ui"

const SCENES: LiquidGlassScene[] = ["photos", "music", "maps", "safari", "mail", "controls"]

function LiquidGlassDemo() {
  const { scene: requested } = useLocalSearchParams<{ scene?: string }>()
  const initial = SCENES.find((value) => value === requested) ?? "photos"
  const [scene, setScene] = React.useState<LiquidGlassScene>(initial)
  React.useEffect(() => { if (SCENES.some((value) => value === requested)) setScene(requested as LiquidGlassScene) }, [requested])
  // leaving the screen remounts the scene, so its system sheets don't stay over the next screen
  const [visits, setVisits] = React.useState(0)
  useFocusEffect(React.useCallback(() => () => setVisits((v) => v + 1), []))
  return (
    <Section title="Apple-inspired experiences" note="Photos: next, favorite, details, system menu. Music/Safari: scroll down and back up. Maps: tap a pin and drag the system sheet. Mail: choose a mailbox or save a draft. Controls: expand the tools and edit the image.">
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{SCENES.map((value) => <Chip key={value} label={value} active={scene === value} onPress={() => setScene(value)} />)}</View>
      <LiquidGlass01 key={`${scene}-${visits}`} scene={scene} />
    </Section>
  )
}

const LAKE = "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=85"

function LiquidGlassMaterialsDemo() {
  const ui = useUI()
  return (
    <>
      <Section title="Regular" note="Untinted system material adapts to the content behind it.">
        <View style={{ height: 260, borderRadius: ui.radius.surface, overflow: "hidden", backgroundColor: ui.auroraBase }}>
          <Backdrop variant="image" src={LAKE} />
          <LiquidGlass style={{ position: "absolute", left: 16, right: 16, bottom: 16, padding: 20, gap: 4 }}>
            <GText size="lg" weight="600">Weekend Away</GText><GText size="sm" tone="muted">A few places to take your time.</GText>
          </LiquidGlass>
        </View>
      </Section>
      <Section title="Clear over bright media" note="The dim sits on the image behind the controls.">
        <GlassThemeProvider scheme="dark">
          <View style={{ height: 260, borderRadius: ui.radius.surface, overflow: "hidden" }}>
            <Backdrop variant="image" src={LAKE} dim={0.35} />
            <LiquidGlass variant="clear" style={{ position: "absolute", left: 16, bottom: 16, paddingHorizontal: 20, paddingVertical: 14 }}><GText weight="600">By the lake</GText></LiquidGlass>
          </View>
        </GlassThemeProvider>
      </Section>
    </>
  )
}

function GlassClusterDemo() {
  const ui = useUI()
  const reduced = useReducedMotion()
  const [apart, setApart] = React.useState(false)
  const [favorite, setFavorite] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [count, setCount] = React.useState(1)
  const transition = reduced ? undefined : LinearTransition.duration(ui.motion.duration)
  return (
    <Section title="Separate sibling glass" note="12 pt spacing merges nearby surfaces; 36 pt separates them. Each action keeps its own target.">
      <View style={{ height: 260, borderRadius: ui.radius.surface, overflow: "hidden", justifyContent: "flex-end", alignItems: "center", padding: 24, gap: 16 }}>
        <Backdrop variant="image" src={LAKE} />
        <GlassCluster spacing={apart ? 36 : 12} mergeDistance={24}>
          <Animated.View layout={transition}><GlassClusterItem accessibilityLabel={favorite ? "Remove favorite" : "Favorite collection"} accessibilityState={{ selected: favorite }} onPress={() => setFavorite((v) => !v)}><HeartIcon color={favorite ? ui.primary : ui.foreground} /></GlassClusterItem></Animated.View>
          <Animated.View layout={transition}><GlassClusterItem accessibilityLabel={saved ? "Unsave collection" : "Save collection"} accessibilityState={{ selected: saved }} onPress={() => setSaved((v) => !v)}><BookmarkIcon color={saved ? ui.primary : ui.foreground} /></GlassClusterItem></Animated.View>
          <Animated.View layout={transition}><GlassClusterItem accessibilityLabel="Add photo to collection" onPress={() => setCount((v) => v + 1)}><PlusIcon /></GlassClusterItem></Animated.View>
        </GlassCluster>
      </View>
      <GText size="sm">{count} {count === 1 ? "photo" : "photos"}{favorite ? " · Favorite" : ""}{saved ? " · Saved" : ""}</GText>
      <Button onPress={() => setApart((v) => !v)}>{apart ? "Bring controls together" : "Separate controls"}</Button>
    </Section>
  )
}

export const demos: Record<string, Demo> = {
  "liquid-glass-01": { title: "Liquid Glass experiences", render: () => <LiquidGlassDemo /> },
  "liquid-glass": { title: "Liquid Glass", render: () => <LiquidGlassMaterialsDemo /> },
  "glass-cluster": { title: "Glass cluster", render: () => <GlassClusterDemo /> },
}
