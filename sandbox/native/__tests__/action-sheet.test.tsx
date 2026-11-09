import * as React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { Text, View } from "react-native"

import { ActionSheet, ActionSheetAction, ActionSheetCancel, ActionSheetContent, ActionSheetDescription, ActionSheetHeader, ActionSheetTitle, ActionSheetTrigger } from "@/components/glass/native/action-sheet"
import { Button } from "@/components/glass/native/button"

function Choices({ change, action, cancel, locked, trigger = true, ...props }: { change?: (open: boolean) => void; action?: () => void; cancel?: () => void; locked?: boolean; trigger?: boolean } & React.ComponentProps<typeof ActionSheet>) {
  return <ActionSheet onOpenChange={change} {...props}>{trigger ? <ActionSheetTrigger asChild><Button variant="glass" accessibilityLabel="Entry options">Options</Button></ActionSheetTrigger> : null}<ActionSheetContent><ActionSheetHeader><ActionSheetTitle>Entry</ActionSheetTitle><ActionSheetDescription>Choose an action</ActionSheetDescription></ActionSheetHeader><ActionSheetAction onAction={action}>Archive</ActionSheetAction><ActionSheetAction variant="destructive" disabled={locked}>Delete</ActionSheetAction><ActionSheetCancel onAction={cancel} /></ActionSheetContent></ActionSheet>
}

// the attached custom sheet places itself from its trigger's window frame; jest's views report none
beforeEach(() => {
  jest.spyOn(View.prototype as unknown as { measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => void }, "measureInWindow").mockImplementation((cb) => cb(16, 600, 140, 44))
})
afterEach(() => jest.restoreAllMocks())

const modalOf = (node: ReturnType<typeof screen.getByRole>) => {
  let modal: typeof node | null = node.parent
  while (modal && modal.type !== "Modal") modal = modal.parent
  return modal
}

it("attaches the real RN trigger to a self-sized ConfirmationDialog host", async () => {
  await render(<Choices />)
  expect(screen.getByTestId("expo-ui-ConfirmationDialog").props).toMatchObject({ title: "Entry", isPresented: false, titleVisibility: "visible" })
  expect(screen.getAllByTestId("expo-ui-Host")).toHaveLength(1)
  expect(screen.getByTestId("expo-ui-RNHostView").props.matchContents).toBe(true)
  expect(screen.getByRole("button", { name: "Entry options" })).toBeTruthy()
  expect(screen.getByTestId("expo-ui-Text").props.children).toBe("Choose an action")
  const destructive = screen.getAllByTestId("expo-ui-Button").find((node) => node.props.label === "Delete")!
  expect(destructive.props.role).toBe("destructive")
})

it("delivers one action followed by one close, suppressing duplicate native false", async () => {
  const events: string[] = []
  await render(<Choices change={(open) => events.push(String(open))} action={() => events.push("archive")} />)
  await fireEvent.press(screen.getByRole("button", { name: "Entry options" }))
  expect(screen.getByTestId("expo-ui-ConfirmationDialog").props.isPresented).toBe(true)
  await fireEvent(screen.getAllByTestId("expo-ui-Button")[0], "press")
  await act(() => screen.getByTestId("expo-ui-ConfirmationDialog").props.onIsPresentedChange(false))
  expect(events).toEqual(["true", "archive", "false"])
})

it("does not synthesize Cancel's action on passive dismissal and can reopen", async () => {
  const change = jest.fn()
  await render(<Choices defaultOpen change={change} />)
  // SwiftUI invokes a cancel-role Button even when the person taps outside.
  await fireEvent(screen.getAllByTestId("expo-ui-Button").find((node) => node.props.role === "cancel")!, "press")
  await act(() => screen.getByTestId("expo-ui-ConfirmationDialog").props.onIsPresentedChange(false))
  expect(change.mock.calls).toEqual([[false]])
  await fireEvent.press(screen.getByRole("button", { name: "Entry options" }))
  await fireEvent(screen.getAllByTestId("expo-ui-Button").find((node) => node.props.role === "cancel")!, "press")
  expect(change.mock.calls).toEqual([[false], [true], [false]])
})

it("attaches the custom sheet to its trigger and leaves Cancel out, as the system dialog does (UX3-N21)", async () => {
  const cancel = jest.fn()
  const change = jest.fn()
  // a Cancel callback selects the custom sheet: SwiftUI runs the cancel closure on outside dismissal
  await render(<Choices defaultOpen change={change} cancel={cancel} />)
  expect(screen.queryByTestId("expo-ui-ConfirmationDialog")).toBeNull()
  const archive = screen.getByRole("button", { name: "Archive" })
  expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull()
  // tapping outside closes it without running Cancel's callback
  await act(() => modalOf(archive)!.props.onRequestClose())
  expect(cancel).not.toHaveBeenCalled()
  expect(change.mock.calls).toEqual([[false]])
})

it("rises from the bottom with Cancel when there is no trigger, and runs Cancel only when chosen", async () => {
  const cancel = jest.fn()
  const change = jest.fn()
  await render(<Choices trigger={false} open change={change} cancel={cancel} />)
  await act(() => modalOf(screen.getByRole("button", { name: "Cancel" }))!.props.onRequestClose())
  expect(cancel).not.toHaveBeenCalled()
  await fireEvent.press(screen.getByRole("button", { name: "Cancel" }))
  expect(cancel).toHaveBeenCalledTimes(1)
  expect(change.mock.calls).toEqual([[false], [false]])
})

it("routes a disabled action to the custom sheet, where it stays visible and inert (UX3-N20)", async () => {
  const action = jest.fn()
  const change = jest.fn()
  await render(<Choices locked change={change} action={action} />)
  expect(screen.queryByTestId("expo-ui-ConfirmationDialog")).toBeNull()
  await fireEvent.press(screen.getByRole("button", { name: "Entry options" }))
  const remove = screen.getByRole("button", { name: "Delete" })
  expect(remove.props.accessibilityState?.disabled ?? remove.props["aria-disabled"]).toBe(true)
  await fireEvent.press(remove)
  expect(change.mock.calls).toEqual([[true]])
  await fireEvent.press(screen.getByRole("button", { name: "Archive" }))
  expect(action).toHaveBeenCalledTimes(1)
  expect(change.mock.calls).toEqual([[true], [false]])
})

it("preserves trigger events through asChild", async () => {
  const pressed = jest.fn()
  const change = jest.fn()
  await render(<ActionSheet onOpenChange={change}><ActionSheetTrigger asChild onPress={pressed}><Button variant="glass">Options</Button></ActionSheetTrigger><ActionSheetContent><ActionSheetAction onAction={() => {}}>Archive</ActionSheetAction></ActionSheetContent></ActionSheet>)
  await fireEvent.press(screen.getByRole("button", { name: "Options" }), { nativeEvent: { pageX: 12 } })
  expect(pressed).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.objectContaining({ pageX: 12 }) }))
  expect(change.mock.calls).toEqual([[true]])
})

it("keeps a direct library Button trigger in the RN source host even without asChild", async () => {
  const change = jest.fn()
  await render(<ActionSheet onOpenChange={change}><ActionSheetTrigger><Button variant="glass">Options</Button></ActionSheetTrigger><ActionSheetContent><ActionSheetAction>Archive</ActionSheetAction></ActionSheetContent></ActionSheet>)
  expect(screen.getAllByTestId("expo-ui-Host")).toHaveLength(1)
  expect(screen.getAllByRole("button", { name: "Options" })).toHaveLength(1)
  await fireEvent.press(screen.getByRole("button", { name: "Options" }))
  expect(change.mock.calls).toEqual([[true]])
})

it.each(["controlled", "forced", "preferred", "event", "style", "rich"])("keeps %s requests on the custom path", async (kind) => {
  const event = jest.fn()
  const action = jest.fn()
  await render(<ActionSheet open={kind === "controlled" ? true : undefined} defaultOpen native={kind === "forced" ? false : undefined}><ActionSheetTrigger><Text>Options</Text></ActionSheetTrigger><ActionSheetContent><ActionSheetTitle>Entry</ActionSheetTitle><ActionSheetAction variant={kind === "preferred" ? "preferred" : undefined} onPress={kind === "event" ? ((value = {} as never) => event(value)) : undefined} onAction={action} style={kind === "style" ? { minHeight: 80 } : undefined}>{kind === "rich" ? <Text>Archive</Text> : "Archive"}</ActionSheetAction><ActionSheetCancel /></ActionSheetContent></ActionSheet>)
  expect(screen.queryByTestId("expo-ui-ConfirmationDialog")).toBeNull()
  await fireEvent.press(screen.getByRole("button", { name: "Archive" }), { nativeEvent: { pageX: 12 } })
  expect(action).toHaveBeenCalledTimes(1)
  if (kind === "event") expect(event).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.objectContaining({ pageX: 12 }) }))
})
