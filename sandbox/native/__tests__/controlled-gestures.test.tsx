import * as React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { Dimensions, StyleSheet } from "react-native"
import * as Reanimated from "react-native-reanimated"
import { Gesture, State, type PanGesture } from "react-native-gesture-handler"
import { fireGestureHandler } from "react-native-gesture-handler/jest-utils"

import { SegmentedControl, SegmentedControlItem } from "@/components/glass/native/segmented-control"
import { Slider } from "@/components/glass/native/slider"
import { Switch } from "@/components/glass/native/switch"
import { Dock, DockBar, DockItem } from "@/components/glass/native/dock"
import { Sheet, SheetContent, SheetTitle } from "@/components/glass/native/sheet"
import { forceA11y } from "@/components/glass/native/a11y"

jest.mock("react-native-reanimated", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react")
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mock = require("react-native-reanimated/mock")
  return {
    ...mock,
    useSharedValue(initial: unknown) {
      // Device shared values survive rerenders; the stock mock creates a new one each time.
      const shared = React.useRef(null)
      if (shared.current === null) shared.current = mock.useSharedValue(initial)
      return shared.current
    },
  }
})

const createPan = Gesture.Pan
let pans: PanGesture[] = []
beforeEach(() => {
  pans = []
  jest.spyOn(Gesture, "Pan").mockImplementation(() => {
    const pan = createPan()
    pans.push(pan)
    return pan
  })
})
afterEach(() => { forceA11y("reduceMotion", null); jest.restoreAllMocks() })

async function drag(start: number, end: number, finalState: typeof State.END | typeof State.CANCELLED = State.END) {
  const mountedPan = [...pans].reverse().find((pan) => pan.handlerTag >= 0)
  if (!mountedPan) throw new Error("Expected a mounted pan gesture")
  await act(() => fireGestureHandler<PanGesture>(mountedPan, [
    { state: State.BEGAN, x: start, y: 18, translationX: 0, translationY: 0 },
    { state: State.ACTIVE, x: start, y: 18, translationX: 0, translationY: 0 },
    { state: State.ACTIVE, x: end, y: 18, translationX: end - start, translationY: 0 },
    { state: finalState, x: end, y: 18, translationX: end - start, translationY: 0 },
  ]))
}

describe("controlled custom gestures with persistent shared values", () => {
  it("resets a custom sheet without spring animation when Reduce Motion is forced", async () => {
    forceA11y("reduceMotion", true)
    await render(<Sheet defaultOpen><SheetContent native={false} side="bottom" detents={[0.3, "large"]} detent={0} onBeforeDismiss={() => false}><SheetTitle>Details</SheetTitle></SheetContent></Sheet>)
    const spring = jest.spyOn(Reanimated, "withSpring")
    const pan = [...pans].reverse().find((value) => value.handlerTag >= 0)!
    await act(() => fireGestureHandler<PanGesture>(pan, [
      { state: State.BEGAN, x: 30, y: 24, translationX: 0, translationY: 0 },
      { state: State.ACTIVE, x: 30, y: 24, translationX: 0, translationY: 0 },
      { state: State.ACTIVE, x: 30, y: 574, translationX: 0, translationY: 550 },
      { state: State.END, x: 30, y: 574, translationX: 0, translationY: 550, velocityY: 0 },
    ]))
    expect(spring).not.toHaveBeenCalled()
    expect(screen.getByText("Details")).toBeTruthy()
  })
  it("cancels a Dock scrub without selecting the pending destination", async () => {
    const changed = jest.fn()
    await render(<Dock position="static"><DockBar defaultValue="a" onValueChange={changed}><DockItem value="a">A</DockItem><DockItem value="b">B</DockItem></DockBar></Dock>)
    for (const [i, item] of screen.getAllByRole("tab").entries()) {
      await act(() => item.props.onLayout({ nativeEvent: { layout: { x: i * 100, y: 0, width: 100, height: 36 } } }))
    }
    await drag(25, 150, State.CANCELLED)
    expect(changed).not.toHaveBeenCalled()
    expect(screen.getAllByRole("tab")[0].props.accessibilityState.selected).toBe(true)
  })
  it.each([State.END, State.CANCELLED])("restores a rejected custom sheet height after each drag (%s)", async (finalState) => {
    const changed = jest.fn()
    await render(<Sheet defaultOpen><SheetContent testID="custom-sheet" native={false} side="bottom" detents={[0.3, "large"]} detent={0} onDetentChange={changed}><SheetTitle>Details</SheetTitle></SheetContent></Sheet>)
    for (let i = 0; i < 2; i++) {
      const pan = [...pans].reverse().find((value) => value.handlerTag >= 0)!
      await act(() => fireGestureHandler<PanGesture>(pan, [
        { state: State.BEGAN, x: 30, y: 24, translationX: 0, translationY: 0 },
        { state: State.ACTIVE, x: 30, y: 24, translationX: 0, translationY: 0 },
        { state: State.ACTIVE, x: 30, y: -526, translationX: 0, translationY: -550 },
        { state: finalState, x: 30, y: -526, translationX: 0, translationY: -550, velocityY: 0 },
      ]))
      expect(StyleSheet.flatten(screen.getByTestId("custom-sheet").parent?.props.style).height).toBeCloseTo(Dimensions.get("window").height * 0.3)
    }
    expect(changed.mock.calls).toEqual(finalState === State.END ? [[1], [1]] : [])
  })
  it.each(["segmented", "dock"])("never scrubs into a disabled %s item even when its host delivers layout", async (kind) => {
    const changed = jest.fn()
    await render(kind === "segmented" ? <SegmentedControl native={false} defaultValue="a" onValueChange={changed}><SegmentedControlItem value="a">A</SegmentedControlItem><SegmentedControlItem value="b" disabled>B</SegmentedControlItem></SegmentedControl> : <Dock position="static"><DockBar defaultValue="a" onValueChange={changed}><DockItem value="a">A</DockItem><DockItem value="b" disabled>B</DockItem></DockBar></Dock>)
    for (const [i, item] of screen.getAllByRole(kind === "segmented" ? "radio" : "tab").entries()) {
      // Native delivers onLayout for disabled views; RNTL fireEvent intentionally skips them.
      await act(() => item.props.onLayout({ nativeEvent: { layout: { x: i * 100, y: 0, width: 100, height: 36 } } }))
    }
    await drag(25, 150)
    expect(changed).not.toHaveBeenCalled()
  })
  it.each([State.END, State.CANCELLED])("notifies a rejected segmented selection on each subsequent scrub (%s)", async (finalState) => {
    const changed = jest.fn()
    await render(<SegmentedControl native={false} value="a" onValueChange={changed}>
      <SegmentedControlItem value="a">A</SegmentedControlItem>
      <SegmentedControlItem value="b">B</SegmentedControlItem>
    </SegmentedControl>)
    for (const [i, item] of screen.getAllByRole("radio").entries()) {
      await fireEvent(item, "layout", { nativeEvent: { layout: { x: i * 100, y: 0, width: 100, height: 36 } } })
    }
    await drag(25, 150, finalState)
    expect(screen.getAllByRole("radio")[0].props.accessibilityState.checked).toBe(true)
    await drag(25, 150, finalState)
    expect(changed.mock.calls).toEqual([["b"], ["b"]])
    expect(screen.getAllByRole("radio")[0].props.accessibilityState.checked).toBe(true)
  })

  it("notifies and commits a rejected slider value on each subsequent drag", async () => {
    const changed = jest.fn()
    const committed = jest.fn()
    await render(<Slider native={false} testID="volume" value={[20]} onValueChange={changed} onValueCommit={committed} />)
    await fireEvent(screen.getByTestId("volume"), "layout", { nativeEvent: { layout: { x: 0, y: 0, width: 224, height: 44 } } })
    await drag(52, 172)
    expect(screen.getByRole("adjustable").props.accessibilityValue.now).toBe(20)
    await drag(52, 172)
    expect({ changed: changed.mock.calls, committed: committed.mock.calls }).toEqual({ changed: [[[80]], [[80]]], committed: [[[80]], [[80]]] })
    expect(screen.getByRole("adjustable").props.accessibilityValue.now).toBe(20)
  })

  it("notifies a rejected switch value on each subsequent drag", async () => {
    const changed = jest.fn()
    await render(<Switch native={false} checked={false} onCheckedChange={changed} />)
    await drag(10, 50)
    expect(screen.getByRole("switch").props.accessibilityState.checked).toBe(false)
    await drag(10, 50)
    expect(changed.mock.calls).toEqual([[true], [true]])
    expect(screen.getByRole("switch").props.accessibilityState.checked).toBe(false)
  })
})
