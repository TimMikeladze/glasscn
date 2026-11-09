import * as React from "react"
import { View } from "react-native"
import { useFocusEffect, useLocalSearchParams } from "expo-router"
import { BackgroundExtension } from "@/components/glass/native/background-extension"
import { Glass } from "@/components/glass/native/glass"
import { LiquidGlass02, type LiquidGlass02Scene } from "@/components/glass/native/liquid-glass-02"
import { GlassThemeProvider } from "@/components/glass/native/tokens"
import { ToolbarCommands } from "@/components/glass/native/toolbar"
import { GText, useUI } from "@/components/glass/native/ui"
import { Chip, Section } from "@/sandbox/ui"
import type { Demo } from "@/sandbox/demos/types"

const SCENES: LiquidGlass02Scene[] = ["landmarks", "notes", "search", "materials"]

function AdvancedGlassDemo() {
  const { scene: requested } = useLocalSearchParams<{ scene?: string }>()
  const [scene, setScene] = React.useState<LiquidGlass02Scene>(SCENES.find(value => value === requested) ?? "landmarks")
  // A system sheet presented from this screen would otherwise stay over the next screen pushed on
  // top of it: leaving the screen remounts the scene, which dismisses its presentations.
  const [visits, setVisits] = React.useState(0)
  useFocusEffect(React.useCallback(() => () => setVisits(v => v + 1), []))
  React.useEffect(() => { if (SCENES.includes(requested as LiquidGlass02Scene)) setScene(requested as LiquidGlass02Scene) }, [requested])
  return <Section title="Landmarks, Notes, Search and Materials" note="Select a place or badge, format and save a note, compare search entry points, or adjust the material controls.">
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{SCENES.map(value => <Chip key={value} label={value} active={scene === value} onPress={() => setScene(value)} />)}</View><LiquidGlass02 key={`${scene}-${visits}`} scene={scene} />
  </Section>
}

function AdaptiveToolbarDemo() {
  const [message, setMessage] = React.useState("Resize the containing window to change command placement.")
  return <Section title="Adaptive commands" note="Undo and Redo take priority. Share remains pinned; Export stays in More."><ToolbarCommands accessibilityLabel="Document actions" overflowLabel="More document actions" commands={[
    { id: "undo", label: "Undo", priority: 10, onSelect: () => setMessage("Undo selected.") },
    { id: "redo", label: "Redo", priority: 10, disabled: true, onSelect: () => setMessage("Redo selected.") },
    { id: "format", label: "Format", onSelect: () => setMessage("Format selected.") },
    { id: "export", label: "Export", overflow: "always", onSelect: () => setMessage("Export selected.") },
    { id: "share", label: "Share", pinned: true, onSelect: () => setMessage("Share selected.") },
  ]} /><GText accessibilityLiveRegion="polite" tone="muted">{message}</GText></Section>
}

const LAKE = "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85"

/** Chrome over the image at phone width: a sidebar of glass with the image's mirrored extension under it. */
function BackgroundExtensionDemo() {
  const ui = useUI()
  const [sidebar, setSidebar] = React.useState(true)
  const inset = sidebar ? 120 : 0
  return <Section title="Image under a sidebar" note="The photo keeps its frame beside the sidebar; a mirrored, blurred copy fills the space under the sidebar's glass. Expo has no backgroundExtensionEffect bridge, so this is an image composition.">
    <View style={{ flexDirection: "row", gap: 8 }}><Chip label="sidebar" active={sidebar} onPress={() => setSidebar(true)} /><Chip label="no sidebar" active={!sidebar} onPress={() => setSidebar(false)} /></View>
    <View style={{ height: 260, borderRadius: ui.radius.surface, overflow: "hidden", backgroundColor: ui.auroraBase }}>
      <BackgroundExtension src={LAKE} alt="Mountain peaks reflected in a still alpine lake" start={inset} style={{ position: "absolute", top: 0, bottom: 0, left: inset, right: 0, width: "auto", aspectRatio: undefined }}>
        <GlassThemeProvider scheme="dark"><View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: ui.dim }}><GText size="sm">Field collection</GText><GText font="heading" size="xl">Alpine lake</GText></View></GlassThemeProvider>
      </BackgroundExtension>
      {sidebar ? <Glass variant="liquid" radius={0} style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: inset, padding: 12, gap: 10 }}>
        <GText font="heading" size="sm">Collections</GText>
        {["Lakes", "Summits", "Coast"].map(item => <GText key={item} size="sm">{item}</GText>)}
      </Glass> : null}
    </View>
  </Section>
}

export const advancedGlass: Record<string, Demo> = {
  "liquid-glass-02": { title: "Advanced Liquid Glass examples", render: () => <AdvancedGlassDemo /> },
  "glass-morph": { title: "Identified activity badges", render: () => <LiquidGlass02 scene="landmarks" /> },
  "background-extension": { title: "Image extension under chrome", render: () => <BackgroundExtensionDemo /> },
  "toolbar-commands": { title: "Adaptive toolbar commands", render: () => <AdaptiveToolbarDemo /> },
}
