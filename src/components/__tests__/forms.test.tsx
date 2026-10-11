// M3 forms: roles, wiring and keyboard of the form items.
import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/glass/accordion"
import { Alert, AlertTitle } from "@/components/glass/alert"
import { BadgeCount } from "@/components/glass/badge"
import { ConfirmationPopover, ConfirmationPopoverContent, ConfirmationPopoverTrigger } from "@/components/glass/confirmation-popover"
import { EmptyTitle } from "@/components/glass/empty"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/glass/field"
import { Input } from "@/components/glass/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/glass/input-group"
import { RadioGroup, RadioGroupItem } from "@/components/glass/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/glass/select"
import { Spinner } from "@/components/glass/spinner"
import { Stepper } from "@/components/glass/stepper"
import { ToggleGroup, ToggleGroupItem } from "@/components/glass/toggle-group"

describe("Field", () => {
  it("wires the control: label, description, error and aria-invalid", () => {
    const { rerender } = render(
      <Field>
        <FieldLabel>Title</FieldLabel>
        <Input />
        <FieldDescription>Shown in your timeline.</FieldDescription>
      </Field>
    )
    const input = screen.getByRole("textbox", { name: "Title" })
    expect(input.getAttribute("aria-describedby")).toBe(screen.getByText("Shown in your timeline.").id)
    expect(input.getAttribute("aria-invalid")).toBeNull()
    rerender(
      <Field>
        <FieldLabel>Title</FieldLabel>
        <Input />
        <FieldError errors={[{ message: "Too short" }, { message: "Too short" }]} />
      </Field>
    )
    expect(input.getAttribute("aria-invalid")).toBe("true")
    expect(input.getAttribute("aria-describedby")).toBe(screen.getByRole("alert").id)
    expect(screen.getByRole("alert").textContent).toBe("Too short")
    rerender(
      <Field>
        <FieldLabel>Title</FieldLabel>
        <Input />
        <FieldError errors={[]} />
      </Field>
    )
    expect(input.getAttribute("aria-invalid")).toBeNull()
    expect(screen.queryByRole("alert")).toBeNull()
  })
  it("keeps an id the control already has", () => {
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <Input id="email" />
      </Field>
    )
    expect(screen.getByRole("textbox", { name: "Email" }).id).toBe("email")
  })
})

describe("Stepper", () => {
  it("is a spinbutton: arrows step, Shift ×10, Home/End clamp to the ends", () => {
    const onValueChange = vi.fn()
    render(<Stepper aria-label="Cups" defaultValue={3} max={20} onValueChange={onValueChange} />)
    const s = screen.getByRole("spinbutton", { name: "Cups" })
    fireEvent.keyDown(s, { key: "ArrowUp" })
    expect(s.getAttribute("aria-valuenow")).toBe("4")
    fireEvent.keyDown(s, { key: "ArrowUp", shiftKey: true })
    expect(s.getAttribute("aria-valuenow")).toBe("14")
    fireEvent.keyDown(s, { key: "End" })
    expect(s.getAttribute("aria-valuenow")).toBe("20")
    fireEvent.keyDown(s, { key: "ArrowUp" })
    expect(onValueChange).toHaveBeenLastCalledWith(20)
    fireEvent.keyDown(s, { key: "Home" })
    expect(s.getAttribute("aria-valuenow")).toBe("0")
    expect((screen.getByLabelText("Decrement") as HTMLButtonElement).disabled).toBe(true)
  })
  it("its buttons step on press and stay out of the tab order", () => {
    render(<Stepper aria-label="Cups" defaultValue={1} />)
    const plus = screen.getByLabelText("Increment")
    expect(plus.tabIndex).toBe(-1)
    fireEvent.pointerDown(plus, { button: 0 })
    fireEvent.pointerUp(plus)
    expect(screen.getByRole("spinbutton").getAttribute("aria-valuenow")).toBe("2")
  })
})

describe("Select", () => {
  it("renders a combobox trigger showing the value", () => {
    render(
      <Select defaultValue="calm">
        <SelectTrigger aria-label="Mood">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="calm">Calm</SelectItem>
          <SelectItem value="tired">Tired</SelectItem>
        </SelectContent>
      </Select>
    )
    const trigger = screen.getByRole("combobox", { name: "Mood" })
    expect(trigger.textContent).toContain("Calm")
  })
})

describe("RadioGroup", () => {
  it("renders radios in a radiogroup and checks on click", () => {
    render(
      <RadioGroup aria-label="Time" defaultValue="a">
        <RadioGroupItem value="a" aria-label="Morning" />
        <RadioGroupItem value="b" aria-label="Evening" />
      </RadioGroup>
    )
    expect(screen.getByRole("radiogroup", { name: "Time" })).toBeTruthy()
    fireEvent.click(screen.getByRole("radio", { name: "Evening" }))
    expect(screen.getByRole("radio", { name: "Evening" }).getAttribute("aria-checked")).toBe("true")
  })
})

describe("ToggleGroup", () => {
  it("multiple keeps several pressed", () => {
    render(
      <ToggleGroup type="multiple" aria-label="Habits">
        <ToggleGroupItem value="walk">Walk</ToggleGroupItem>
        <ToggleGroupItem value="read">Read</ToggleGroupItem>
      </ToggleGroup>
    )
    fireEvent.click(screen.getByRole("button", { name: "Walk" }))
    fireEvent.click(screen.getByRole("button", { name: "Read" }))
    expect(screen.getByRole("button", { name: "Walk" }).getAttribute("aria-pressed")).toBe("true")
    expect(screen.getByRole("button", { name: "Read" }).getAttribute("aria-pressed")).toBe("true")
  })
})

describe("Accordion", () => {
  it("expands a row from its trigger", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="sync">
          <AccordionTrigger>Does it sync?</AccordionTrigger>
          <AccordionContent>Yes.</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    const trigger = screen.getByRole("button", { name: "Does it sync?" })
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
    fireEvent.click(trigger)
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    expect(screen.getByRole("region").textContent).toBe("Yes.")
  })
})

describe("ConfirmationPopover", () => {
  it("is an alertdialog named by its title, focusing Cancel; Confirm calls back and closes", () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmationPopover defaultOpen>
        <ConfirmationPopoverTrigger>Delete</ConfirmationPopoverTrigger>
        <ConfirmationPopoverContent title="Delete this entry?" confirmLabel="Delete entry" onConfirm={onConfirm} />
      </ConfirmationPopover>
    )
    const dialog = screen.getByRole("alertdialog", { name: "Delete this entry?" })
    expect(dialog).toBeTruthy()
    expect(document.activeElement?.textContent).toBe("Cancel")
    fireEvent.click(screen.getByRole("button", { name: "Delete entry" }))
    expect(onConfirm).toHaveBeenCalled()
    expect(screen.queryByRole("alertdialog")).toBeNull()
  })
})

describe("small parts", () => {
  it("Alert: destructive is an alert, others a status", () => {
    render(
      <>
        <Alert variant="destructive">
          <AlertTitle>Sync paused</AlertTitle>
        </Alert>
        <Alert variant="success">
          <AlertTitle>Saved</AlertTitle>
        </Alert>
      </>
    )
    expect(screen.getByRole("alert").textContent).toBe("Sync paused")
    expect(screen.getByRole("status").textContent).toBe("Saved")
  })
  it("BadgeCount caps at max, hides at zero, is a dot without a count", () => {
    const { container, rerender } = render(<BadgeCount count={120} label="unread" />)
    expect(container.textContent).toBe("99+ unread")
    rerender(<BadgeCount count={0} />)
    expect(container.textContent).toBe("")
    rerender(<BadgeCount />)
    expect(container.querySelector("[data-dot]")).toBeTruthy()
  })
  it("Spinner is a labelled status unless hidden", () => {
    const { rerender } = render(<Spinner aria-label="Syncing" />)
    expect(screen.getByRole("status", { name: "Syncing" })).toBeTruthy()
    rerender(<Spinner aria-hidden />)
    expect(screen.queryByRole("status")).toBeNull()
  })
  it("EmptyTitle shows the query", () => {
    render(<EmptyTitle query="lighthouse" />)
    expect(screen.getByText(/No results for/).textContent).toBe("No results for “lighthouse”")
  })
  it("InputGroup: clicking an addon focuses the input", () => {
    render(
      <InputGroup>
        <InputGroupAddon>Find</InputGroupAddon>
        <InputGroupInput aria-label="Search" />
      </InputGroup>
    )
    fireEvent.click(screen.getByText("Find"))
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Search" }))
  })
})
