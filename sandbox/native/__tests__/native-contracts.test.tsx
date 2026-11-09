import * as React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { StyleSheet, Text } from "react-native"

import { Button } from "@/components/glass/native/button"
import { Glass } from "@/components/glass/native/glass"
import { GlassMorph, GlassMorphItem } from "@/components/glass/native/glass-morph"
import { Sheet, SheetContent, SheetTitle } from "@/components/glass/native/sheet"
import { Sidebar, SidebarProvider } from "@/components/glass/native/sidebar"
import { Slider } from "@/components/glass/native/slider"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/native/segmented-control"
import { GlassThemeProvider } from "@/components/glass/native/tokens"

type Modifier = { $type: string; detents?: unknown[]; selection?: unknown; eventListener?: (value: { detent: unknown }) => void; [key: string]: unknown }
function detents() {
  return (screen.getByTestId("expo-ui-Group").props.modifiers as Modifier[]).find((m) => m.$type === "presentationDetents")!
}

it("keeps initial and controlled detents on the iOS system sheet", async () => {
  const changed = jest.fn()
  await render(<Sheet defaultOpen><SheetContent side="bottom" detents={["medium", "large"]} defaultDetent={1} onDetentChange={changed}><SheetTitle>Details</SheetTitle></SheetContent></Sheet>)
  expect(detents().selection).toBe("large")
  await act(() => detents().eventListener?.({ detent: "medium" }))
  expect(changed).toHaveBeenLastCalledWith(0)
  expect(detents().selection).toBe("medium")
})

it("acknowledges then restores repeated rejected system detents without remounting content", async () => {
  jest.useFakeTimers()
  try {
    const changed = jest.fn()
    const mounted = jest.fn()
    function Content() { React.useEffect(mounted, []); return <SheetTitle>Details</SheetTitle> }
    await render(<Sheet defaultOpen><SheetContent side="bottom" detents={["medium", "large"]} detent={0} onDetentChange={changed}><Content /></SheetContent></Sheet>)
    for (let i = 0; i < 2; i++) {
      await act(() => detents().eventListener?.({ detent: "large" }))
      expect(detents().selection).toBe("large")
      await act(() => jest.advanceTimersByTime(50))
      expect(detents().selection).toBe("medium")
      await act(() => detents().eventListener?.({ detent: "medium" }))
    }
    expect(changed.mock.calls).toEqual([[1], [1]])
    expect(mounted).toHaveBeenCalledTimes(1)
  } finally { jest.useRealTimers() }
})

it("enables system background interaction for a nonmodal inspector", async () => {
  await render(<Sheet defaultOpen><SheetContent side="bottom" modal={false} detents={[0.3, "large"]}><SheetTitle>Inspector</SheetTitle></SheetContent></Sheet>)
  const modifiers = screen.getByTestId("expo-ui-Group").props.modifiers as Modifier[]
  expect(modifiers).toContainEqual(expect.objectContaining({ $type: "presentationBackgroundInteraction", interactionType: "enabled" }))
  expect(JSON.stringify(screen.toJSON())).not.toContain('"type":"Modal"')
})

it("keeps library glass Button anchors in the sheet's RN host and preserves both callbacks", async () => {
  const pressed = jest.fn()
  const action = jest.fn()
  function Inspector() {
    const [open, setOpen] = React.useState(false)
    return <Sheet open={open} onOpenChange={setOpen}><SheetContent side="bottom" anchor={<Button variant="glass" onPress={pressed} onAction={() => { action(); setOpen(true) }} accessibilityLabel="Format note">Format</Button>}><SheetTitle>Formatting</SheetTitle></SheetContent></Sheet>
  }
  await render(<Inspector />)
  expect(screen.getAllByTestId("expo-ui-Host")).toHaveLength(1)
  await fireEvent.press(screen.getByRole("button", { name: "Format note" }), { nativeEvent: { pageX: 12 } })
  expect(pressed).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.objectContaining({ pageX: 12 }) }))
  expect(action).toHaveBeenCalledTimes(1)
  expect(screen.getByTestId("expo-ui-BottomSheet").props.isPresented).toBe(true)
  expect(screen.getByRole("button", { name: "Format note" })).toBeTruthy()
})

it("prevents nested SwiftUI hosts for event-free library Button anchors", async () => {
  await render(<Sheet><SheetContent side="bottom" anchor={<Button variant="glass" onAction={() => {}} accessibilityLabel="Format note">Format</Button>}><SheetTitle>Formatting</SheetTitle></SheetContent></Sheet>)
  expect(screen.getAllByTestId("expo-ui-Host")).toHaveLength(1)
  expect(screen.getByRole("button", { name: "Format note" })).toBeTruthy()
})

it("keeps custom nonmodal inspectors in the presenting hierarchy", async () => {
  await render(<Sheet defaultOpen><SheetContent native={false} side="bottom" modal={false}><SheetTitle>Inspector</SheetTitle></SheetContent></Sheet>)
  expect(screen.getByText("Inspector")).toBeTruthy()
  expect(JSON.stringify(screen.toJSON())).not.toContain('"type":"Modal"')
})

it("anchors a custom full detent to screen edges with an opaque square surface", async () => {
  await render(<Sheet defaultOpen><SheetContent testID="full-sheet" native={false} side="bottom" detents={["medium", "large"]} detent={1}><SheetTitle>Full details</SheetTitle></SheetContent></Sheet>)
  const surface = screen.getByTestId("full-sheet")
  expect(StyleSheet.flatten(surface.props.style)).toMatchObject({ borderRadius: 0, backgroundColor: expect.any(String) })
  expect(surface.props.glassEffectStyle).toBeUndefined()
  let node = surface.parent
  while (node && StyleSheet.flatten(node.props.style)?.position !== "absolute") node = node.parent
  expect(StyleSheet.flatten(node?.props.style)).toMatchObject({ left: 0, right: 0, bottom: 0 })
})

it("delegates plain iOS glass buttons to system button styles", async () => {
  const pressed = jest.fn()
  await render(<Button variant="prominent" size="lg" loading={false} onAction={pressed} accessibilityLabel="Save changes">Save</Button>)
  const button = screen.getByTestId("expo-ui-Button")
  expect(button.props.modifiers).toContainEqual(expect.objectContaining({ $type: "buttonStyle", style: "glassProminent" }))
  expect(button.props.modifiers).toContainEqual(expect.objectContaining({ $type: "controlSize", size: "large" }))
  expect(StyleSheet.flatten(screen.getByTestId("expo-ui-Host").props.style).alignSelf).toBe("flex-start")
  await fireEvent(button, "press")
  expect(pressed).toHaveBeenCalledTimes(1)
})

it("preserves press-in and loading semantics on explicit custom buttons", async () => {
  const pressed = jest.fn()
  const pressIn = jest.fn()
  const { rerender } = await render(<Button variant="glass" onPress={pressed} onPressIn={pressIn}>Save</Button>)
  expect(screen.queryByTestId("expo-ui-Button")).toBeNull()
  await fireEvent(screen.getByRole("button"), "pressIn")
  expect(pressIn).toHaveBeenCalledTimes(1)
  await rerender(<Button variant="glass" loading onPress={pressed}>Save</Button>)
  await fireEvent.press(screen.getByRole("button"))
  expect(pressed).not.toHaveBeenCalled()
})

it("preserves RN events for default-parameter press callbacks and also delivers onAction", async () => {
  const received = jest.fn()
  const action = jest.fn()
  const fallback = { nativeEvent: { pageX: -1 } }
  const event = { nativeEvent: { pageX: 12 } }
  await render(<Button variant="glass" onPress={(value = fallback as never) => received(value)} onAction={action}>Save</Button>)
  expect(screen.queryByTestId("expo-ui-Button")).toBeNull()
  await fireEvent.press(screen.getByRole("button"), event)
  expect(received).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.objectContaining({ pageX: 12 }) }))
  expect(action).toHaveBeenCalledTimes(1)
})

it("preserves formatted spoken slider values", async () => {
  await render(<Slider value={[40]} formatValue={(v) => `${v} percent`} />)
  expect(screen.getByRole("adjustable").props.accessibilityValue.text).toBe("40 percent")
})

it.each(["shape", "accent"])("preserves an explicit segmented %s on the custom path", async (choice) => {
  const control = <SegmentedControl defaultValue="a" shape={choice === "shape" ? "rounded" : undefined}><SegmentedControlItem value="a">A</SegmentedControlItem><SegmentedControlItem value="b">B</SegmentedControlItem></SegmentedControl>
  await render(choice === "accent" ? <GlassThemeProvider palette="ocean">{control}</GlassThemeProvider> : control)
  expect(screen.queryByTestId("expo-ui-SegmentedControl")).toBeNull()
  expect(screen.getAllByRole("radio")).toHaveLength(2)
})

it.each([["ultraThin", "systemUltraThinMaterialLight"], ["thin", "systemThinMaterialLight"], ["regular", "systemMaterialLight"], ["thick", "systemThickMaterialLight"]] as const)("maps material %s to the iOS standard material", async (intensity, tint) => {
  await render(<Glass intensity={intensity}><Text>Content</Text></Glass>)
  expect(screen.getByTestId("BlurView").props.tint).toBe(tint)
})

it("uses containing width for compact modal sidebar presentation", async () => {
  await render(<SidebarProvider testID="pane" defaultOpen><Sidebar><Text>Inbox</Text></Sidebar></SidebarProvider>)
  await act(() => screen.getByTestId("pane").props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 540, height: 768 } } }))
  let modal = screen.getByText("Inbox").parent
  while (modal && modal.type !== "Modal") modal = modal.parent
  expect(modal).not.toBeNull()
  expect(modal!.props.visible).toBe(true)
  await act(() => modal!.props.onRequestClose())
  expect(screen.queryByText("Inbox")).toBeNull()
})

it("keeps namespace and effect IDs stable through insertion and reordering", async () => {
  const pressed = jest.fn()
  const items = (values: string[]) => <GlassMorph value={values.join(",")} spacing={18}>{values.map((id) => <GlassMorphItem key={id} id={id} onPress={pressed} accessibilityLabel={id}>{id}</GlassMorphItem>)}</GlassMorph>
  const { rerender } = await render(items(["a", "b"]))
  const namespace = screen.getByTestId("expo-ui-Namespace").props.id
  await rerender(items(["b", "c", "a"]))
  expect(screen.getByTestId("expo-ui-Namespace").props.id).toBe(namespace)
  expect(screen.getByTestId("expo-ui-GlassEffectContainer").props.spacing).toBe(18)
  expect(screen.getByTestId("expo-ui-Host").props.matchContents).toEqual({ vertical: true })
  expect(StyleSheet.flatten(screen.getByTestId("expo-ui-Host").props.style).width).toBe("100%")
  expect(screen.getAllByTestId("expo-ui-Button").map((node) => node.props.modifiers.find((m: Modifier) => m.$type === "glassEffectId"))).toEqual(["b", "c", "a"].map((id) => ({ $type: "glassEffectId", id, namespaceId: namespace })))
  expect(screen.getAllByTestId("expo-ui-RNHostView").every((node) => node.props.matchContents)).toBe(true)
  await fireEvent(screen.getAllByTestId("expo-ui-Button")[0], "press")
  expect(pressed).toHaveBeenCalledTimes(1)
})

it("animates distinct string values even when their polynomial hashes collide", async () => {
  const content = <GlassMorphItem id="one">One</GlassMorphItem>
  const { rerender } = await render(<GlassMorph value="Aa">{content}</GlassMorph>)
  const before = screen.getByTestId("expo-ui-HStack").props.modifiers.find((modifier: Modifier) => modifier.$type === "animation").animatedValue
  await rerender(<GlassMorph value="BB">{content}</GlassMorph>)
  const after = screen.getByTestId("expo-ui-HStack").props.modifiers.find((modifier: Modifier) => modifier.$type === "animation").animatedValue
  expect(after).not.toBe(before)
})

it("preserves static Morph item labels when solid preferences select fallback glass", async () => {
  await render(<GlassThemeProvider material="matte"><GlassMorph><GlassMorphItem id="recording" accessibilityLabel="Recording status">Recording</GlassMorphItem></GlassMorph></GlassThemeProvider>)
  expect(screen.getByLabelText("Recording status").props.accessible).toBe(true)
})
