// M3 AI + pickers: chat parts, composer, command, combobox, calendar, date picker.
import * as React from "react"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { Calendar } from "@/components/glass/calendar"
import { ChatComposer, ChatMessage, ChatMeta, ChatThread } from "@/components/glass/chat"
import { repairMarkdown } from "@/components/glass/chat-markdown"
import { renderParts, type ChatUIMessage } from "@/components/glass/chat-parts"
import { Combobox } from "@/components/glass/combobox"
import { Command, CommandDialog, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/glass/command"
import { DatePicker, minuteSlots, snapMinutes } from "@/components/glass/date-picker"

beforeAll(() => {
  // cmdk scrolls the active row into view
  Element.prototype.scrollIntoView ??= () => {}
})

describe("repairMarkdown", () => {
  it("closes an unfinished fence", () => {
    expect(repairMarkdown("Look:\n```ts\nconst a = 1")).toBe("Look:\n```ts\nconst a = 1\n```")
    expect(repairMarkdown("```ts\na\n```\ndone")).toBe("```ts\na\n```\ndone")
  })
  it("closes inline code, bold, strike and italic; leaves complete text alone", () => {
    expect(repairMarkdown("run `pnpm")).toBe("run `pnpm`")
    expect(repairMarkdown("a **bold")).toBe("a **bold**")
    expect(repairMarkdown("a ~~gone")).toBe("a ~~gone~~")
    expect(repairMarkdown("an *aside")).toBe("an *aside*")
    expect(repairMarkdown("all **done** and *fine*")).toBe("all **done** and *fine*")
    expect(repairMarkdown("- a list\n* another")).toBe("- a list\n* another")
  })
  it("drops a link whose URL is still arriving", () => {
    expect(repairMarkdown("see [the docs](https://exa")).toBe("see the docs")
    expect(repairMarkdown("see [the do")).toBe("see the do")
  })
})

describe("date picker maths", () => {
  it("minute steps must divide 60", () => {
    expect(minuteSlots(15)).toEqual([0, 15, 30, 45])
    expect(minuteSlots(1)).toHaveLength(60)
    expect(() => minuteSlots(7)).toThrow(RangeError)
    expect(() => minuteSlots(0)).toThrow(RangeError)
  })
  it("snaps minutes down to the step", () => {
    expect(snapMinutes(new Date(2026, 0, 1, 9, 44), 15).getMinutes()).toBe(30)
  })
})

describe("ChatThread and ChatMessage", () => {
  it("messages are articles named for their speaker; ChatMeta writes a machine-readable time", () => {
    const at = new Date("2026-10-11T09:41:00Z")
    render(
      <ChatThread>
        <ChatMessage from="assistant" name="Kai">
          Hello
        </ChatMessage>
        <ChatMessage from="user">
          Hi
          <ChatMeta time={at}>Read</ChatMeta>
        </ChatMessage>
      </ChatThread>
    )
    expect(screen.getByRole("article", { name: "Kai" })).toBeTruthy()
    const mine = screen.getByRole("article", { name: "You" })
    expect(mine.querySelector("time")?.getAttribute("datetime")).toBe(at.toISOString())
  })
  it("a failed message offers Retry", () => {
    const onRetry = vi.fn()
    render(
      <ChatMessage from="user" status="failed" onRetry={onRetry}>
        Hi
      </ChatMessage>
    )
    fireEvent.click(screen.getByRole("button", { name: "Retry" }))
    expect(onRetry).toHaveBeenCalled()
  })
  it("document layout drops the assistant bubble but keeps the user's", () => {
    render(
      <ChatThread layout="document">
        <ChatMessage from="assistant">
          <div data-testid="a" />
        </ChatMessage>
      </ChatThread>
    )
    expect(screen.getByRole("article").getAttribute("data-layout")).toBe("document")
  })
})

describe("ChatComposer", () => {
  it("while streaming, send becomes Stop", () => {
    const onStop = vi.fn()
    const onSubmit = vi.fn()
    render(<ChatComposer status="streaming" onStop={onStop} onSubmit={onSubmit} defaultValue="hi" />)
    expect(screen.queryByRole("button", { name: "Send" })).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Stop" }))
    expect(onStop).toHaveBeenCalled()
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" })
    expect(onSubmit).not.toHaveBeenCalled()
  })
  it("refuses to send past maxLength and shows the count", () => {
    const onSubmit = vi.fn()
    render(<ChatComposer maxLength={5} defaultValue="toolong" onSubmit={onSubmit} />)
    expect(screen.getByRole("textbox").getAttribute("aria-invalid")).toBe("true")
    expect(screen.getByText("-2")).toBeTruthy()
    expect((screen.getByRole("button", { name: "Send" }) as HTMLButtonElement).disabled).toBe(true)
  })
  it("submitOnEnter=false: Enter breaks a line, ⌘Enter sends", () => {
    const onSubmit = vi.fn()
    render(<ChatComposer submitOnEnter={false} defaultValue="note" onSubmit={onSubmit} />)
    const box = screen.getByRole("textbox")
    fireEvent.keyDown(box, { key: "Enter" })
    expect(onSubmit).not.toHaveBeenCalled()
    fireEvent.keyDown(box, { key: "Enter", metaKey: true })
    expect(onSubmit).toHaveBeenCalledWith("note")
  })
  it("merges textareaProps.ref with its own", () => {
    const ref = React.createRef<HTMLTextAreaElement>()
    render(<ChatComposer textareaProps={{ ref }} />)
    expect(ref.current).toBe(screen.getByRole("textbox"))
  })
  it("pasted files go to onAttach", () => {
    const onAttach = vi.fn()
    render(<ChatComposer onAttach={onAttach} />)
    const file = new File(["x"], "a.png", { type: "image/png" })
    fireEvent.paste(screen.getByRole("textbox"), { clipboardData: { files: [file], types: ["Files"] } })
    expect(onAttach).toHaveBeenCalledWith([file])
  })
})

describe("renderParts", () => {
  const message: ChatUIMessage = {
    id: "m1",
    role: "assistant",
    parts: [
      { type: "reasoning", text: "Thinking it over", state: "done" },
      { type: "tool-setReminder", toolCallId: "t1", state: "approval-requested", input: { at: "21:30" }, approval: { id: "ap1" } },
      { type: "text", text: "Here's **the plan**." },
      { type: "source-url", sourceId: "s1", url: "https://example.com/a", title: "A" },
      { type: "source-url", sourceId: "s2", url: "https://example.com/b" },
    ],
  }
  it("maps reasoning, tools (with approval), Markdown and sources", () => {
    const onToolApproval = vi.fn()
    render(<ChatMessage>{renderParts(message, { reasoningDuration: 12, onToolApproval })}</ChatMessage>)
    expect(screen.getByRole("button", { name: /Thought for 12s/ })).toBeTruthy()
    expect(screen.getByText("setReminder")).toBeTruthy()
    expect(screen.getByText("the plan").tagName).toBe("STRONG")
    expect(screen.getByRole("button", { name: /2 sources/ })).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Approve" }))
    expect(onToolApproval).toHaveBeenCalledWith({ id: "ap1", approved: true, toolCallId: "t1" })
  })
})

describe("Command", () => {
  it("filters as you type and shows Empty when nothing matches", () => {
    const onSelect = vi.fn()
    render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandEmpty>Nothing</CommandEmpty>
          <CommandItem onSelect={onSelect}>New entry</CommandItem>
          <CommandItem>Show streak</CommandItem>
        </CommandList>
      </Command>
    )
    const input = screen.getByPlaceholderText("Search")
    fireEvent.change(input, { target: { value: "streak" } })
    expect(screen.queryByText("New entry")).toBeNull()
    expect(screen.getByText("Show streak")).toBeTruthy()
    fireEvent.change(input, { target: { value: "zzz" } })
    expect(screen.getByText("Nothing")).toBeTruthy()
  })
  it("CommandDialog is a liquid panel with a title, and holds no glass", () => {
    render(
      <CommandDialog open title="Palette">
        <CommandInput />
        <CommandList>
          <CommandItem>One</CommandItem>
        </CommandList>
      </CommandDialog>
    )
    const dialog = screen.getByRole("dialog", { name: "Palette" })
    expect(dialog.className).toMatch(/glass-liquid/)
    expect(dialog.querySelectorAll(".glass, .glass-liquid, .glass-strong").length).toBe(0)
  })
})

describe("Combobox", () => {
  const options = [
    { value: "calm", label: "Calm" },
    { value: "tired", label: "Tired" },
  ]
  it("single: picks a value and closes", () => {
    const onValueChange = vi.fn()
    render(<Combobox options={options} onValueChange={onValueChange} aria-label="Mood" />)
    const trigger = screen.getByRole("combobox", { name: "Mood" })
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole("option", { name: "Tired" }))
    expect(onValueChange).toHaveBeenCalledWith("tired")
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
  })
  it("multiple: chips can be removed, and Backspace removes the last", () => {
    const onValueChange = vi.fn()
    render(<Combobox multiple options={options} defaultValue={["calm", "tired"]} onValueChange={onValueChange} aria-label="Tags" />)
    fireEvent.click(screen.getByRole("button", { name: "Remove Calm" }))
    expect(onValueChange).toHaveBeenLastCalledWith(["tired"])
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Tags" }), { key: "Backspace" })
    expect(onValueChange).toHaveBeenLastCalledWith([])
  })
})

describe("Calendar and DatePicker", () => {
  it("Calendar selects a day", () => {
    const onSelect = vi.fn()
    render(<Calendar mode="single" defaultMonth={new Date(2026, 9, 1)} onSelect={onSelect} />)
    const grid = screen.getByRole("grid")
    fireEvent.click(within(grid).getByRole("button", { name: /October 14/ }))
    expect(onSelect.mock.calls[0][0].getDate()).toBe(14)
  })
  it("DatePicker opens a calendar in a liquid popover and writes the value on its button", () => {
    const onValueChange = vi.fn()
    render(<DatePicker defaultValue={new Date(2026, 9, 11)} onValueChange={onValueChange} locale="en-US" aria-label="Entry date" />)
    const trigger = screen.getByRole("button", { name: /Entry date, Oct 11, 2026/ })
    fireEvent.click(trigger)
    const panel = document.querySelector("[data-slot=date-picker-content]")!
    expect(panel.className).toMatch(/glass-liquid/)
    fireEvent.click(within(screen.getByRole("grid")).getByRole("button", { name: /October 12/ }))
    expect(onValueChange.mock.calls[0][0].getDate()).toBe(12)
  })
  it("time adds hour and minute pickers on the step", () => {
    render(<DatePicker time minuteStep={15} defaultValue={new Date(2026, 9, 11, 21, 30)} />)
    fireEvent.click(screen.getByRole("button"))
    const minutes = screen.getByRole("combobox", { name: "Minute" })
    expect(within(minutes).getAllByRole("option").map((o) => o.textContent)).toEqual(["00", "15", "30", "45"])
  })
})
