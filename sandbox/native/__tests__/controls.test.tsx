import * as React from "react"
import { act, fireEvent, screen } from "@testing-library/react-native"
import { StyleSheet } from "react-native"
import { State, type PanGesture } from "react-native-gesture-handler"
import { fireGestureHandler, getByGestureTestId } from "react-native-gesture-handler/jest-utils"

import { Checkbox } from "@/components/glass/native/checkbox"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/native/segmented-control"
import { Slider } from "@/components/glass/native/slider"
import { Switch } from "@/components/glass/native/switch"

import { renderThemed } from "./helpers/render"

// NAT-51: roles, state (aria-* → accessibilityState on native) and value on the glass (RN) versions — what VoiceOver and the web read —
// controlled and uncontrolled. The @expo/ui system versions are SwiftUI and covered by Maestro.

describe("Switch", () => {
  it("uncontrolled: toggles and reports through aria-checked", async () => {
    const onChange = jest.fn()
    await renderThemed(<Switch native={false} aria-label="Wi-Fi" onCheckedChange={onChange} />)
    const sw = screen.getByRole("switch")
    expect(sw.props.accessibilityState?.checked).toBe(false)
    await fireEvent.press(sw)
    expect(onChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole("switch").props.accessibilityState?.checked).toBe(true)
  })

  it("controlled: stays put until the parent changes it", async () => {
    const onChange = jest.fn()
    await renderThemed(<Switch native={false} checked={false} onCheckedChange={onChange} />)
    await fireEvent.press(screen.getByRole("switch"))
    expect(onChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole("switch").props.accessibilityState?.checked).toBe(false)
  })

  it("disabled: announces it and ignores presses", async () => {
    const onChange = jest.fn()
    await renderThemed(<Switch native={false} disabled onCheckedChange={onChange} />)
    expect(screen.getByRole("switch").props.accessibilityState?.disabled).toBe(true)
    await fireEvent.press(screen.getByRole("switch"))
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe("Checkbox", () => {
  it("uncontrolled toggle, indeterminate reads mixed", async () => {
    const onChange = jest.fn()
    await renderThemed(<Checkbox onCheckedChange={onChange} />)
    await fireEvent.press(screen.getByRole("checkbox"))
    expect(onChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole("checkbox").props.accessibilityState?.checked).toBe(true)
  })

  it("controlled indeterminate", async () => {
    await renderThemed(<Checkbox checked="indeterminate" />)
    expect(screen.getByRole("checkbox").props.accessibilityState?.checked).toBe("mixed")
  })
})

describe("Slider", () => {
  it("commits the clamped live value when a custom drag is cancelled", async () => {
    const commit = jest.fn()
    await renderThemed(<Slider native={false} testID="volume" defaultValue={[50]} onValueCommit={commit} />)
    await fireEvent(screen.getByTestId("volume"), "layout", { nativeEvent: { layout: { x: 0, y: 0, width: 224, height: 44 } } })
    await act(() => fireGestureHandler<PanGesture>(getByGestureTestId("volume-drag"), [
      { state: State.BEGAN, x: 112, translationX: 0 },
      { state: State.ACTIVE, x: 400, translationX: 288 },
      { state: State.CANCELLED, x: 400, translationX: 288 },
    ]))
    expect(commit).toHaveBeenLastCalledWith([100])
    expect(screen.getByRole("adjustable").props.accessibilityValue.now).toBe(100)
  })

  it("is adjustable with a value, and steps on increment/decrement", async () => {
    const onChange = jest.fn()
    await renderThemed(<Slider native={false} aria-label="Volume" defaultValue={[50]} step={10} onValueChange={onChange} />)
    const s = screen.getByRole("adjustable")
    expect(s.props.accessibilityValue).toMatchObject({ min: 0, max: 100, now: 50 })
    await fireEvent(s, "accessibilityAction", { nativeEvent: { actionName: "increment" } })
    expect(onChange).toHaveBeenLastCalledWith([60])
    expect(screen.getByRole("adjustable").props.accessibilityValue.now).toBe(60)
  })

  it("controlled: clamps at max and doesn't move without the parent", async () => {
    const onChange = jest.fn()
    await renderThemed(<Slider native={false} value={[100]} onValueChange={onChange} />)
    await fireEvent(screen.getByRole("adjustable"), "accessibilityAction", { nativeEvent: { actionName: "increment" } })
    expect(screen.getByRole("adjustable").props.accessibilityValue.now).toBe(100)
  })
})

describe("SegmentedControl", () => {
  it("uses a native lens while the custom selection is held", async () => {
    await renderThemed(<SegmentedControl native={false} defaultValue="a"><SegmentedControlItem value="a">A</SegmentedControlItem><SegmentedControlItem value="b">B</SegmentedControlItem></SegmentedControl>)
    expect(screen.queryByTestId("GlassView")).toBeNull()
    await fireEvent(screen.getAllByRole("radio")[0], "pressIn")
    expect(screen.getByTestId("GlassView")).toBeTruthy()
    await fireEvent(screen.getAllByRole("radio")[0], "pressOut")
    expect(screen.queryByTestId("GlassView")).toBeNull()
  })

  function Controlled() {
    const [v, setV] = React.useState("day")
    return (
      <SegmentedControl native={false} value={v} onValueChange={setV}>
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
      </SegmentedControl>
    )
  }

  it("is a radiogroup of radios; selection moves", async () => {
    await renderThemed(<Controlled />)
    expect(screen.getAllByRole("radio")[0].parent?.props.accessibilityRole).toBe("radiogroup")
    const [day, week] = screen.getAllByRole("radio")
    expect(day.props.accessibilityState?.checked).toBe(true)
    await fireEvent.press(week)
    expect(screen.getAllByRole("radio")[1].props.accessibilityState?.checked).toBe(true)
    expect(screen.getAllByRole("radio")[0].props.accessibilityState?.checked).toBe(false)
  })

  it("uncontrolled from defaultValue", async () => {
    const onChange = jest.fn()
    await renderThemed(
      <SegmentedControl native={false} defaultValue="b" onValueChange={onChange}>
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b">B</SegmentedControlItem>
      </SegmentedControl>
    )
    expect(screen.getAllByRole("radio")[1].props.accessibilityState?.checked).toBe(true)
    await fireEvent.press(screen.getAllByRole("radio")[0])
    expect(onChange).toHaveBeenCalledWith("a")
  })
})

void act

describe("system controls name the element VoiceOver reads (UX3-N01, UX3-N16)", () => {
  it("puts a system switch's label on the SwiftUI toggle", async () => {
    await renderThemed(<Switch accessibilityLabel="Reminders" />)
    expect(screen.getByTestId("expo-ui-Switch").props.modifiers).toContainEqual({ $type: "accessibilityLabel", label: "Reminders" })
  })
  it("names the system segmented control through its Picker", async () => {
    await renderThemed(
      <SegmentedControl accessibilityLabel="Place categories" defaultValue="food">
        <SegmentedControlItem value="food">Food</SegmentedControlItem>
        <SegmentedControlItem value="parks">Parks</SegmentedControlItem>
      </SegmentedControl>
    )
    const picker = screen.getByTestId("expo-ui-Picker")
    expect(picker.props.label).toBe("Place categories")
    expect(picker.props.modifiers).toContainEqual({ $type: "accessibilityLabel", label: "Place categories" })
  })
  it("keeps a thumbless progress slider adjustable and full width", async () => {
    await renderThemed(<Slider native={false} variant="progress" aria-label="Playback progress" defaultValue={[35]} />)
    const slider = screen.getByRole("adjustable")
    expect(slider.props.accessibilityLabel).toBe("Playback progress")
    expect(StyleSheet.flatten(slider.props.style)).toMatchObject({ left: 0, right: 0, top: 0, bottom: 0 })
  })
})
