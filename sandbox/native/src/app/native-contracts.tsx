import * as React from "react"
import { Stack, useLocalSearchParams } from "expo-router"
import { TextInput, View } from "react-native"

import { Button } from "@/components/glass/native/button"
import { GlassMorph, GlassMorphItem } from "@/components/glass/native/glass-morph"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/glass/native/sheet"
import { GText, useUI } from "@/components/glass/native/ui"
import { Body, Screen, Section } from "@/sandbox/ui"

/** Focused native contracts: system controls, identity changes, rejected detents and background editing. */
export default function NativeContracts() {
  const ui = useUI()
  const { part } = useLocalSearchParams<{ part?: string }>()
  const [presses, setPresses] = React.useState(0)
  const [extra, setExtra] = React.useState(false)
  const [reversed, setReversed] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [detent, setDetent] = React.useState(0)
  const [reject, setReject] = React.useState(true)
  const [requests, setRequests] = React.useState<number[]>([])
  const [note, setNote] = React.useState("")
  const ids = extra ? ["one", "two", "three"] : ["one", "two"]
  if (reversed) ids.reverse()
  return <Screen picker={false}>
    <Stack.Screen options={{ title: "Native contracts" }} />
    <Section title="System glass buttons">
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Button variant="glass" accessibilityLabel="System glass action" onAction={() => setPresses((value) => value + 1)}>Glass action</Button>
        <Button variant="prominent" disabled>Disabled</Button>
      </View>
      <Body testID="native-button-count">System presses: {presses}</Body>
    </Section>
    <Section title="Background editor">
      <TextInput accessibilityLabel="Background note" value={note} onChangeText={setNote} placeholder="Edit while inspector is open" placeholderTextColor={ui.mutedForeground} style={{ minHeight: 44, padding: 12, borderRadius: ui.radius.control, backgroundColor: ui.fill, color: ui.foreground }} />
      <Body>Background note: {note || "empty"}</Body>
    </Section>
    {part !== "buttons" && part !== "sheet" ? <Section title="Stable morph identities">
      <GlassMorph value={`${extra}-${reversed}`} spacing={12}>
        {ids.map((id) => <GlassMorphItem key={id} id={id} accessibilityLabel={`Morph ${id}`} onPress={() => setExtra((value) => !value)}><GText>{id}</GText></GlassMorphItem>)}
      </GlassMorph>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button variant="glass" onAction={() => setExtra((value) => !value)}>Toggle extra</Button>
        <Button variant="glass" onAction={() => setReversed((value) => !value)}>Reorder</Button>
      </View>
    </Section> : null}
    {part !== "buttons" && part !== "morph" ? <Section title="Controlled system inspector" note="Drag to large twice while rejection is on; accepted index stays 0 and each request is counted. Background note remains editable at the small detent.">
      <Button onPress={() => setReject((value) => !value)}>Reject large: {String(reject)}</Button>
      <Body>Accepted detent: {detent} · requests: {requests.join(",") || "none"}</Body>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent native={part !== "custom"} side="bottom" modal={false} detents={[0.32, "large"]} detent={detent} onDetentChange={(index) => { setRequests((values) => [...values, index]); if (!reject) setDetent(index) }} anchor={<Button variant="glass" onAction={() => setOpen(true)}>Open system inspector</Button>}>
          <SheetHeader><SheetTitle>System inspector</SheetTitle></SheetHeader>
          <View style={{ paddingHorizontal: 20, gap: 12 }}>
            <Body>Accepted: {detent} · requests: {requests.join(",") || "none"}</Body>
            <Button onPress={() => setDetent((value) => value === 0 ? 1 : 0)}>Set detent from parent</Button>
            <Button onPress={() => setOpen(false)}>Close inspector</Button>
          </View>
        </SheetContent>
      </Sheet>
    </Section> : null}
  </Screen>
}
