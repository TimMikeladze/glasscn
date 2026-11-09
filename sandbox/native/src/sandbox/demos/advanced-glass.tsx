import * as React from "react"
import { View } from "react-native"
import { useFocusEffect, useLocalSearchParams } from "expo-router"
import { LiquidGlass02, type LiquidGlass02Scene } from "@/components/glass/native/liquid-glass-02"
import { ToolbarCommands } from "@/components/glass/native/toolbar"
import { GText } from "@/components/glass/native/ui"
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

export const advancedGlass: Record<string, Demo> = {
  "liquid-glass-02": { title: "Advanced Liquid Glass examples", render: () => <AdvancedGlassDemo /> },
  "glass-morph": { title: "Identified activity badges", render: () => <LiquidGlass02 scene="landmarks" /> },
  "background-extension": { title: "Landmarks image extension", render: () => <LiquidGlass02 scene="landmarks" /> },
  "toolbar-commands": { title: "Adaptive toolbar commands", render: () => <AdaptiveToolbarDemo /> },
}
