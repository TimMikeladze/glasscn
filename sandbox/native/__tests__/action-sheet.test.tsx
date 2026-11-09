import * as React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { Text } from "react-native"

import { ActionSheet, ActionSheetAction, ActionSheetCancel, ActionSheetContent, ActionSheetDescription, ActionSheetHeader, ActionSheetTitle, ActionSheetTrigger } from "@/components/glass/native/action-sheet"
import { Button } from "@/components/glass/native/button"

function Choices({ change, action, cancel, ...props }: { change?: (open: boolean) => void; action?: () => void; cancel?: () => void } & React.ComponentProps<typeof ActionSheet>) {
  return <ActionSheet onOpenChange={change} {...props}><ActionSheetTrigger asChild><Button variant="glass" accessibilityLabel="Entry options">Options</Button></ActionSheetTrigger><ActionSheetContent><ActionSheetHeader><ActionSheetTitle>Entry</ActionSheetTitle><ActionSheetDescription>Choose an action</ActionSheetDescription></ActionSheetHeader><ActionSheetAction onAction={action}>Archive</ActionSheetAction><ActionSheetAction variant="destructive" disabled>Delete</ActionSheetAction><ActionSheetCancel onAction={cancel} /></ActionSheetContent></ActionSheet>
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
  expect(destructive.props.modifiers).toContainEqual(expect.objectContaining({ $type: "disabled", disabled: true }))
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

it("keeps cancel callbacks custom because native outside dismissal invokes the cancel closure", async () => {
  const cancel = jest.fn()
  const change = jest.fn()
  await render(<Choices defaultOpen change={change} cancel={cancel} />)
  expect(screen.queryByTestId("expo-ui-ConfirmationDialog")).toBeNull()
  await fireEvent.press(screen.getByRole("button", { name: "Cancel" }))
  expect(cancel).toHaveBeenCalledTimes(1)
  expect(change.mock.calls).toEqual([[false]])
})

it("does not run a custom Cancel callback for passive close", async () => {
  const cancel = jest.fn()
  const change = jest.fn()
  await render(<Choices defaultOpen change={change} cancel={cancel} />)
  let modal = screen.getByRole("button", { name: "Cancel" }).parent
  while (modal && modal.type !== "Modal") modal = modal.parent
  expect(modal).not.toBeNull()
  await act(() => modal!.props.onRequestClose())
  expect(cancel).not.toHaveBeenCalled()
  expect(change.mock.calls).toEqual([[false]])
})

it("preserves trigger events through asChild and ignores disabled system actions", async () => {
  const pressed = jest.fn()
  const action = jest.fn()
  const change = jest.fn()
  await render(<ActionSheet onOpenChange={change}><ActionSheetTrigger asChild onPress={pressed}><Button variant="glass">Options</Button></ActionSheetTrigger><ActionSheetContent><ActionSheetAction disabled onAction={action}>Archive</ActionSheetAction></ActionSheetContent></ActionSheet>)
  await fireEvent.press(screen.getByRole("button", { name: "Options" }), { nativeEvent: { pageX: 12 } })
  expect(pressed).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.objectContaining({ pageX: 12 }) }))
  await fireEvent(screen.getByTestId("expo-ui-Button"), "press")
  expect(action).not.toHaveBeenCalled()
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
