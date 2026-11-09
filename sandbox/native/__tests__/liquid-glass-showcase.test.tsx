import * as React from "react"
import { fireEvent, screen } from "@testing-library/react-native"

import { LiquidGlass01, type LiquidGlassScene } from "@/components/glass/native/liquid-glass-01"
import { demos } from "@/sandbox/demos/liquid-glass"

import { fadedLiquidGlass, renderThemed } from "./helpers/render"

describe.each<LiquidGlassScene>(["photos", "music", "maps", "safari", "mail", "controls"])("%s recreation", (scene) => {
  it("renders with no fading ancestor over native glass", async () => {
    const warn = jest.spyOn(console, "warn")
    try {
      const { root } = await renderThemed(<LiquidGlass01 scene={scene} />)
      expect(fadedLiquidGlass(root!)).toEqual([])
      expect(warn.mock.calls.filter(([message]) => String(message).includes("Invalid `viewBox`"))).toEqual([])
    } finally {
      warn.mockRestore()
    }
  })
})

it("favorites a photo, advances the collection, and opens system details", async () => {
  await renderThemed(<LiquidGlass01 scene="photos" />)
  await fireEvent.press(screen.getByLabelText("Favorite photo"))
  expect(screen.getByLabelText("Remove favorite").props.accessibilityState?.selected).toBe(true)
  // photos page by swipe; VoiceOver pages through the adjustable pager's increment action
  await fireEvent(screen.getByRole("adjustable"), "accessibilityAction", { nativeEvent: { actionName: "increment" } })
  expect(screen.getAllByText("The Highlands").length).toBeGreaterThan(0)
  expect(screen.getByLabelText("Favorite photo")).toBeTruthy()
  await fireEvent.press(screen.getByLabelText("Show photo details"))
  expect(screen.getByTestId("expo-ui-BottomSheet").props.isPresented).toBe(true)
})

it("chooses a music track and pauses playback", async () => {
  await renderThemed(<LiquidGlass01 scene="music" />)
  await fireEvent.press(screen.getByLabelText("Play Wide open by The Long Way"))
  expect(screen.getAllByText("Wide open").length).toBeGreaterThan(1)
  await fireEvent.press(screen.getByLabelText("Pause music"))
  expect(screen.getByLabelText("Play music")).toBeTruthy()
  await fireEvent.press(screen.getByLabelText("Search music"))
  await fireEvent.changeText(screen.getByLabelText("Search music"), "wide")
  await fireEvent.press(screen.getByLabelText("Play Wide open by The Long Way"))
  await fireEvent.press(screen.getByText("Cancel"))
  expect(screen.getByLabelText("Pause music")).toBeTruthy()
})

it("filters map pins and opens a native sheet from a place", async () => {
  await renderThemed(<LiquidGlass01 scene="maps" />)
  await fireEvent.changeText(screen.getByLabelText("Search nearby places"), "coffee")
  expect(screen.queryByLabelText("Show Ocean Beach")).toBeNull()
  await fireEvent.press(screen.getByLabelText("Show Sunset Coffee"))
  const sheet = screen.getByTestId("expo-ui-BottomSheet")
  expect(sheet.props.isPresented).toBe(true)
  expect(sheet.props.fitToContents).toBe(false)
  await fireEvent.changeText(screen.getByLabelText("Search nearby places"), "nowhere")
  expect(screen.getByText("No places found")).toBeTruthy()
})

it("navigates the browser articles through its address field", async () => {
  await renderThemed(<LiquidGlass01 scene="safari" />)
  // at rest the capsule is one line of text (UX3-N04); tapping it opens the field
  await fireEvent.press(screen.getByLabelText("Website address, fieldnotes.example"))
  const address = screen.getByLabelText("Website address")
  expect(address.props.multiline).toBe(false)
  await fireEvent.changeText(address, "fieldnotes.example/coast")
  await fireEvent(address, "submitEditing")
  expect(screen.getAllByText("An open afternoon").length).toBeGreaterThan(0)
  await fireEvent.press(screen.getByLabelText("Previous article"))
  expect(screen.getAllByText("Take the slower road").length).toBeGreaterThan(0)
  // at rest the capsule shows the domain only, as Safari does
  expect(screen.getByLabelText("Website address, fieldnotes.example")).toBeTruthy()
  expect(screen.queryByLabelText("Website address")).toBeNull()
})

it("archives a message and saves a composed draft", async () => {
  await renderThemed(<LiquidGlass01 scene="mail" />)
  await fireEvent.press(screen.getByLabelText("Read Sunday by the coast from Sam Rivera, flagged"))
  await fireEvent.press(screen.getByLabelText("Archive message"))
  expect(screen.queryByLabelText(/Read Sunday by the coast from Sam Rivera/)).toBeNull()
  await fireEvent.press(screen.getByLabelText("Compose message"))
  await fireEvent.changeText(screen.getByLabelText("Message subject"), "Friday by the lake")
  await fireEvent.changeText(screen.getByLabelText("Message body"), "Bring a notebook.")
  await fireEvent.press(screen.getByText("Save Draft"))
  expect(screen.getByText("Friday by the lake")).toBeTruthy()
  await fireEvent.press(screen.getByLabelText("Edit draft Friday by the lake"))
  expect(screen.getByLabelText("Message body").props.value).toBe("Bring a notebook.")
})

it("expands sibling glass tools and adjusts the native slider", async () => {
  await renderThemed(<LiquidGlass01 scene="controls" />)
  await fireEvent.press(screen.getByLabelText("Open photo tools"))
  expect(screen.getByLabelText("Close photo tools").props.accessibilityState?.expanded).toBe(true)
  await fireEvent.press(screen.getByLabelText("Adjust warmth"))
  expect(screen.getByLabelText("Open photo tools")).toBeTruthy()
  const slider = screen.getByTestId("expo-ui-Slider")
  await fireEvent(slider, "valueChange", 35)
  expect(screen.getByTestId("expo-ui-Slider").props.value).toBe(35)
  await fireEvent.press(screen.getByLabelText("Open photo tools"))
  await fireEvent.press(screen.getByLabelText("Reset photo edits"))
  // 50 is the unedited photo
  expect(screen.getByTestId("expo-ui-Slider").props.value).toBe(50)
})

it("keeps cluster actions independent when surfaces move apart", async () => {
  await renderThemed(<>{demos["glass-cluster"].render()}</>)
  await fireEvent.press(screen.getByLabelText("Favorite collection"))
  await fireEvent.press(screen.getByLabelText("Add photo to collection"))
  expect(screen.getByText("2 photos · Favorite")).toBeTruthy()
  await fireEvent.press(screen.getByText("Separate controls"))
  await fireEvent.press(screen.getByLabelText("Save collection"))
  expect(screen.getByText("2 photos · Favorite · Saved")).toBeTruthy()
  expect(screen.getByText("Bring controls together")).toBeTruthy()
})
