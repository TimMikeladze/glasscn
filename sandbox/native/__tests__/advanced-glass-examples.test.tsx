import * as React from "react"
import { act, fireEvent, render, screen, within } from "@testing-library/react-native"
import { LiquidGlass02 } from "@/components/glass/native/liquid-glass-02"
import { ToolbarCommands, type ToolbarCommand } from "@/components/glass/native/toolbar"
import { fadedLiquidGlass } from "./helpers/render"

const layout = (width: number) => ({ nativeEvent: { layout: { x: 0, y: 0, width, height: 40 } } })

it("measures prioritized commands and keeps the pinned action while overflowing", async () => {
  const action = jest.fn()
  const commands: ToolbarCommand[] = [{ id: "low", label: "Format", onSelect: action }, { id: "undo", label: "Undo", priority: 10, onSelect: action }, { id: "share", label: "Share", pinned: true, onSelect: action }]
  await render(<ToolbarCommands testID="commands" commands={commands} />)
  await fireEvent(screen.getByTestId("commands"), "layout", layout(190))
  for (const command of commands) await fireEvent(screen.getByTestId(`toolbar-measure-${command.id}`, { includeHiddenElements: true }), "layout", layout(60))
  await fireEvent(screen.getByTestId("toolbar-measure-overflow", { includeHiddenElements: true }), "layout", layout(40))
  expect(screen.queryByTestId("toolbar-command-low")).toBeNull()
  expect(screen.getByTestId("toolbar-command-undo")).toBeTruthy()
  await fireEvent.press(screen.getByTestId("toolbar-command-share"))
  expect(action).toHaveBeenCalledTimes(1)
})

it("uses fresh action identities and disabled guards for system overflow actions", async () => {
  const previous = jest.fn(), updated = jest.fn(), disabled = jest.fn()
  const commands = (onSelect: () => void): ToolbarCommand[] => [{ id: "export", label: "Export", overflow: "always", onSelect }, { id: "locked", label: "Locked", overflow: "always", disabled: true, onSelect: disabled }]
  const { rerender } = await render(<ToolbarCommands commands={commands(previous)} />)
  const priorNativeCallback = screen.getByTestId("expo-ui-MenuView").props.onPressAction
  await rerender(<ToolbarCommands commands={commands(updated)} />)
  await act(() => priorNativeCallback({ nativeEvent: { event: "0" } }))
  await act(() => priorNativeCallback({ nativeEvent: { event: "1" } }))
  expect(previous).not.toHaveBeenCalled()
  expect(updated).toHaveBeenCalledTimes(1)
  expect(disabled).not.toHaveBeenCalled()
})

it("keeps landmark selection across containing-width changes and badge insertion", async () => {
  await render(<LiquidGlass02 scene="landmarks" />)
  await fireEvent.press(screen.getByLabelText("Select Open coast"))
  await fireEvent(screen.getByTestId("liquid-glass-02-landmarks"), "layout", layout(900))
  expect(within(screen.getByTestId("landmark-inspector")).getByText("Open coast")).toBeTruthy()
  await fireEvent.press(screen.getByLabelText("Add summit badge"))
  const summit = screen.getAllByTestId("expo-ui-Button").find(node => node.props.modifiers?.some((modifier: { $type: string; label?: string }) => modifier.$type === "accessibilityLabel" && modifier.label === "Summit badge"))!
  expect(summit).toBeTruthy()
  await fireEvent(summit, "press")
  expect(screen.getByText("Summit activity selected.")).toBeTruthy()
})

it("lets the parent note change under its system nonmodal formatter and saves on Done", async () => {
  await render(<LiquidGlass02 scene="notes" />)
  await act(() => screen.getByTestId("expo-ui-BottomSheet").props.anchor.props.children.props.children.props.onAction())
  const modifiers = screen.getByTestId("expo-ui-Group").props.modifiers
  expect(modifiers).toContainEqual(expect.objectContaining({ $type: "presentationBackgroundInteraction", interactionType: "enabled" }))
  await fireEvent.changeText(screen.getByLabelText("Note text"), "Bring the field guide.")
  expect(screen.getByText("Draft")).toBeTruthy()
  await fireEvent.press(screen.getByLabelText("Done"))
  expect(screen.getByText("Saved")).toBeTruthy()
  expect(screen.getByLabelText("Note text").props.value).toBe("Bring the field guide.")
})

async function layoutNoteToolbar() {
  await fireEvent(screen.getByLabelText("Note actions"), "layout", layout(360))
  for (const id of ["undo", "redo", "pin", "word-count", "share"]) await fireEvent(screen.getByTestId(`toolbar-measure-${id}`, { includeHiddenElements: true }), "layout", layout(44))
  await fireEvent(screen.getByTestId("toolbar-measure-overflow", { includeHiddenElements: true }), "layout", layout(44))
}

it("undoes a run of typing as one step and a format change as another (UX3-N12)", async () => {
  const now = jest.spyOn(Date, "now")
  try {
    await render(<LiquidGlass02 scene="notes" />)
    await layoutNoteToolbar()
    const note = () => screen.getByLabelText("Note text")
    const original = note().props.value
    for (const [at, text] of [[10_000, "B"], [10_400, "Br"], [10_800, "Bri"], [13_000, "Bring"]] as const) {
      now.mockReturnValue(at)
      await fireEvent.changeText(note(), text)
    }
    await fireEvent.press(screen.getByRole("button", { name: "Title" }))
    expect(screen.getByRole("button", { name: "Title" }).props.accessibilityState?.selected).toBe(true)
    await fireEvent.press(screen.getByTestId("toolbar-command-undo"))
    expect(screen.getByRole("button", { name: "Body" }).props.accessibilityState?.selected).toBe(true)
    expect(note().props.value).toBe("Bring")
    // the pause before "Bring" ended the first run
    await fireEvent.press(screen.getByTestId("toolbar-command-undo"))
    expect(note().props.value).toBe("Bri")
    await fireEvent.press(screen.getByTestId("toolbar-command-undo"))
    expect(note().props.value).toBe(original)
  } finally {
    now.mockRestore()
  }
})

it("shows Pin and Done results on screen (UX3-N05)", async () => {
  await render(<LiquidGlass02 scene="notes" />)
  await layoutNoteToolbar()
  await fireEvent.press(screen.getByTestId("toolbar-command-pin"))
  expect(screen.getByTestId("note-status")).toHaveTextContent("Note pinned.")
  expect(screen.getByLabelText("Pinned")).toBeTruthy()
  expect(screen.getByTestId("toolbar-command-pin").props.accessibilityLabel).toBe("Unpin note")
  await fireEvent.press(screen.getByLabelText("Done"))
  expect(screen.getByTestId("note-status")).toHaveTextContent("Note saved.")
})

it("keeps landing search unfocused and requests focus only for immediate search", async () => {
  await render(<LiquidGlass02 scene="search" />)
  expect(screen.getByLabelText("Search all collections").props.autoFocus).toBe(false)
  expect(screen.getByLabelText("Search destination").props.accessibilityState?.selected).toBe(true)
  await fireEvent(screen.getByTestId("search-now"), "press")
  expect(screen.getByLabelText("Search all collections").props.autoFocus).toBe(true)
  // the two entry points read as a pair: the current one is selected (UX3-N17)
  expect(screen.getByLabelText("Search now").props.accessibilityState?.selected).toBe(true)
  await fireEvent.changeText(screen.getByLabelText("Search all collections"), "no such landmark")
  expect(screen.getByText(/No results for/)).toBeTruthy()
})

it("removes a search scope token and restores all collection results", async () => {
  await render(<LiquidGlass02 scene="search" />)
  await fireEvent.press(screen.getByLabelText("Show Places folder"))
  expect(screen.queryByLabelText("Open Summit journal")).toBeNull()
  await fireEvent.press(screen.getByLabelText("Remove Places filter"))
  expect(screen.getByLabelText("Open Summit journal")).toBeTruthy()
  expect(screen.queryByLabelText("Remove Places filter")).toBeNull()
})

it.each(["landmarks", "notes", "search", "materials"] as const)("adds no fading glass ancestor in %s", async scene => {
  await render(<LiquidGlass02 scene={scene} />)
  expect(fadedLiquidGlass(screen.root!)).toEqual([])
})
