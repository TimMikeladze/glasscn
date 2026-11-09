import * as React from "react"
import * as RN from "react-native"
import { act, fireEvent, screen } from "@testing-library/react-native"

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

afterEach(() => jest.restoreAllMocks())

/** A SwiftUI button from GlassMorphItem, found by the label it carries as a modifier. */
const swiftButton = (label: string) => screen.getAllByTestId("expo-ui-Button").find((node) => node.props.modifiers?.some((m: { $type: string; label?: string }) => m.$type === "accessibilityLabel" && m.label === label))

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

it("starts the Music bar folded at accessibility sizes and opens the tabs from the one tab (UX3-N03)", async () => {
  jest.spyOn(RN.Dimensions, "get").mockReturnValue({ width: 393, height: 852, scale: 3, fontScale: 3.571 })
  await renderThemed(<LiquidGlass01 scene="music" />)
  // the current tab and Search, not a vertical tab list over the songs
  expect(screen.getAllByRole("tab")).toHaveLength(1)
  const home = screen.getByRole("tab", { name: "Home" })
  expect(home.props.accessibilityHint).toBe("Shows all sections")
  await fireEvent.press(home)
  expect(screen.getAllByRole("tab")).toHaveLength(3)
  // bar labels keep their size and show the Large Content Viewer on a long press
  const library = screen.getByRole("tab", { name: "Library" })
  expect(library.props.accessibilityShowsLargeContentViewer).toBe(true)
  expect(screen.getByText("Library").props.maxFontSizeMultiplier).toBe(1)
  await fireEvent.press(library)
  expect(screen.getAllByRole("tab")).toHaveLength(1)
  expect(screen.getByRole("tab", { name: "Library" })).toBeTruthy()
})

it("filters map pins and opens a nonmodal place sheet in place of the search card (UX3-N11)", async () => {
  await renderThemed(<LiquidGlass01 scene="maps" />)
  // at rest the card holds the field and categories, clear of the pins
  expect(screen.queryByLabelText("Open Ocean Beach")).toBeNull()
  await fireEvent.changeText(screen.getByLabelText("Search nearby places"), "coffee")
  expect(screen.queryByLabelText("Show Ocean Beach")).toBeNull()
  expect(screen.getByLabelText("Open Sunset Coffee")).toBeTruthy()
  await fireEvent.press(screen.getByLabelText("Show Sunset Coffee"))
  const sheet = screen.getByTestId("expo-ui-BottomSheet")
  expect(sheet.props.isPresented).toBe(true)
  expect(sheet.props.fitToContents).toBe(false)
  // the route stays bright and the pins stay tappable; one sheet at a time
  expect(screen.getByTestId("expo-ui-Group").props.modifiers).toContainEqual(expect.objectContaining({ $type: "presentationBackgroundInteraction", interactionType: "enabled" }))
  expect(screen.queryByLabelText("Search nearby places")).toBeNull()
  await act(() => sheet.props.onIsPresentedChange(false))
  await fireEvent.changeText(screen.getByLabelText("Search nearby places"), "nowhere")
  expect(screen.getByText("No places found")).toBeTruthy()
})

it("navigates the browser articles through its address field", async () => {
  await renderThemed(<LiquidGlass01 scene="safari" />)
  // at rest the capsule is one line of text (UX3-N04); tapping it opens the field
  await fireEvent.press(screen.getByLabelText("Website address, fieldnotes.example"))
  const address = screen.getByLabelText("Website address")
  // a URL keyboard, no autocorrection, the whole address selected, the field across the bar (UX3-N10)
  expect(address.props).toMatchObject({ multiline: false, keyboardType: "url", autoCorrect: false, selectTextOnFocus: true })
  expect(screen.queryByLabelText("Previous article")).toBeNull()
  expect(screen.queryByLabelText("More")).toBeNull()
  await fireEvent.changeText(address, "fieldnotes.example/coast")
  await fireEvent(address, "submitEditing")
  expect(screen.getAllByText("An open afternoon").length).toBeGreaterThan(0)
  await fireEvent.press(screen.getByLabelText("Previous article"))
  expect(screen.getAllByText("Take the slower road").length).toBeGreaterThan(0)
  // at rest the capsule shows the domain only, as Safari does
  expect(screen.getByLabelText("Website address, fieldnotes.example")).toBeTruthy()
  expect(screen.queryByLabelText("Website address")).toBeNull()
})

it("reads an article in Reader and keeps tabs in the More menu (UX3-N09)", async () => {
  await renderThemed(<LiquidGlass01 scene="safari" />)
  expect(screen.getByLabelText("Mountain peaks reflected in a still alpine lake")).toBeTruthy()
  await fireEvent.press(screen.getByLabelText("Show Reader"))
  expect(screen.queryByLabelText("Mountain peaks reflected in a still alpine lake")).toBeNull()
  expect(screen.getByLabelText("Hide Reader").props.accessibilityState?.selected).toBe(true)
  // More is a menu: Show Open Tabs and Reading List, not the tabs sheet itself
  expect(screen.getByLabelText("More")).toBeTruthy()
  expect(screen.queryByLabelText("Show open tabs")).toBeNull()
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

it("expands the photo tools out of one glass container and adjusts the native slider (UX3-N08)", async () => {
  await renderThemed(<LiquidGlass01 scene="controls" />)
  const identities = () => screen.getAllByTestId("expo-ui-Button").flatMap((node) => (node.props.modifiers ?? []).filter((m: { $type: string }) => m.$type === "glassEffectId").map((m: { id: string }) => m.id))
  expect(identities()).toEqual(["tools"])
  await fireEvent(swiftButton("Open photo tools")!, "press")
  // one SwiftUI container and namespace: the tools emerge from the toggle and merge back into it
  expect(identities()).toEqual(["brightness", "warmth", "tools", "crop", "reset"])
  expect(screen.getAllByTestId("expo-ui-GlassEffectContainer")).toHaveLength(1)
  expect(swiftButton("Adjust brightness")!.props.modifiers).toContainEqual({ $type: "accessibilityAddTraits", traits: ["isSelected"] })
  await fireEvent(swiftButton("Adjust warmth")!, "press")
  expect(identities()).toEqual(["tools"])
  const slider = screen.getByTestId("expo-ui-Slider")
  await fireEvent(slider, "valueChange", 35)
  expect(screen.getByTestId("expo-ui-Slider").props.value).toBe(35)
  await fireEvent(swiftButton("Open photo tools")!, "press")
  await fireEvent(swiftButton("Reset photo edits")!, "press")
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
