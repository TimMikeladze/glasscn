import * as React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { DynamicColorIOS, Platform, PlatformColor, StyleSheet, Text, View } from "react-native"

import { forceA11y } from "@/components/glass/native/a11y"
import { Glass } from "@/components/glass/native/glass"
import { LiquidGlass } from "@/components/glass/native/liquid-glass"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/glass/native/dropdown-menu"
import { Sheet, SheetContent, SheetTitle } from "@/components/glass/native/sheet"
import { Switch } from "@/components/glass/native/switch"
import { Slider } from "@/components/glass/native/slider"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/native/segmented-control"
import { Input } from "@/components/glass/native/input"
import { SearchField } from "@/components/glass/native/search-field"
import { Command, CommandInput } from "@/components/glass/native/command"
import { buildGlassTheme, GlassThemeProvider } from "@/components/glass/native/tokens"
import { GIcon, GText, useUI } from "@/components/glass/native/ui"
import { demos as overlayDemos } from "@/sandbox/demos/overlays"

afterEach(() => {
  for (const setting of ["reduceMotion", "reduceTransparency", "highContrast", "boldText"] as const) forceA11y(setting, null)
  jest.restoreAllMocks()
})

describe("native liquid material", () => {
  it("uses the untinted automatic system appearance by default", async () => {
    await render(<Glass variant="liquid"><Text>Control</Text></Glass>)
    const effect = screen.getByTestId("GlassView")
    expect(effect.props.tintColor).toBeUndefined()
    expect(effect.props.colorScheme).toBe("auto")
  })

  it("keeps explicit tint and a provider's forced scheme", async () => {
    await render(<GlassThemeProvider scheme="dark"><Glass variant="liquid" tint="#1144aa"><Text>Control</Text></Glass></GlassThemeProvider>)
    const effect = screen.getByTestId("GlassView")
    expect(effect.props.tintColor).toBe("#1144aa")
    expect(effect.props.colorScheme).toBe("dark")
  })

  it("maps the shared clear surface API to native clear glass", async () => {
    await render(<LiquidGlass variant="clear" interactive><Text>Pause</Text></LiquidGlass>)
    const effect = screen.getByTestId("GlassView")
    expect(effect.props.glassEffectStyle.style).toBe("clear")
    expect(effect.props.isInteractive).toBe(true)
    expect(effect.props.optics).toBeUndefined()
    expect(effect.props.followLight).toBeUndefined()
  })

  it("does not paint a second scrim above clear glass", async () => {
    await render(<Glass variant="liquid-clear"><Text>Pause</Text></Glass>)
    const effect = screen.getByTestId("GlassView")
    expect(effect.children).toHaveLength(1)
    expect(effect.props.tintColor).toBeUndefined()
  })

  it("keeps clear media labels bright even in a light app", async () => {
    await render(<GlassThemeProvider scheme="light"><Glass variant="liquid-clear"><GText>Play</GText></Glass></GlassThemeProvider>)
    expect(StyleSheet.flatten(screen.getByText("Play").props.style).color).toBe("#fafafa")
  })

  it("keeps untinted native controls legible when content uses smoked material", async () => {
    await render(<GlassThemeProvider scheme="light" material="smoked"><Glass variant="liquid"><GText>Share</GText></Glass></GlassThemeProvider>)
    expect(StyleSheet.flatten(screen.getByText("Share").props.style).color).toEqual(PlatformColor("label"))
  })

  it("uses semantic system colors for glyphs on untinted glass", async () => {
    await render(<Glass variant="liquid"><GIcon color={buildGlassTheme("light").foreground}><View testID="glyph" /></GIcon></Glass>)
    expect(screen.getByTestId("glyph").props.color).toEqual(PlatformColor("label"))
  })

  it("normalizes glyph colors read before a smoked glass provider", async () => {
    function Control() {
      const ui = useUI()
      return <Glass variant="liquid"><GIcon color={ui.foreground}><View testID="glyph" /></GIcon></Glass>
    }
    await render(<GlassThemeProvider scheme="light" material="smoked"><Control /></GlassThemeProvider>)
    expect(screen.getByTestId("glyph").props.color).toEqual(PlatformColor("label"))
  })

  it("adapts palette accents with the glass's effective appearance", async () => {
    await render(<GlassThemeProvider scheme="dark" palette="dusk"><Glass variant="liquid"><GText tone="primary">Selected</GText></Glass></GlassThemeProvider>)
    expect(StyleSheet.flatten(screen.getByText("Selected").props.style).color).toEqual(DynamicColorIOS({
      light: buildGlassTheme("light", "dusk").primary,
      dark: buildGlassTheme("dark", "dusk").primary,
      highContrastLight: buildGlassTheme("light", "dusk", { highContrast: true }).primary,
      highContrastDark: buildGlassTheme("dark", "dusk", { highContrast: true }).primary,
    }))
  })

  it("keeps an explicit raw accent on untinted glass", async () => {
    await render(<GlassThemeProvider tokens={{ primary: "#ff00ff" }}><Glass variant="liquid"><GText tone="primary">Selected</GText></Glass></GlassThemeProvider>)
    expect(StyleSheet.flatten(screen.getByText("Selected").props.style).color).toBe("#ff00ff")
  })

  it.each(["input", "search", "command"])("uses semantic text and placeholders inside a glass %s", async (control) => {
    await render(control === "input" ? <Glass variant="liquid"><Input accessibilityLabel="Address" /></Glass> : control === "search" ? <SearchField accessibilityLabel="Address" /> : <Glass variant="liquid"><Command><CommandInput accessibilityLabel="Address" /></Command></Glass>)
    const input = screen.getByLabelText("Address")
    expect(StyleSheet.flatten(input.props.style).color).toEqual(PlatformColor("label"))
    expect(input.props.placeholderTextColor).toEqual(PlatformColor("secondaryLabel"))
  })

  it("does not start another material effect inside a liquid surface", async () => {
    await render(<Glass variant="liquid"><Glass variant="material"><Text>Content</Text></Glass></Glass>)
    expect(screen.getAllByTestId("GlassView")).toHaveLength(1)
    expect(screen.queryByTestId("BlurView")).toBeNull()
  })

  it("disables native effects for the matte preset", async () => {
    await render(<GlassThemeProvider material="matte"><Glass variant="liquid"><Text>Control</Text></Glass></GlassThemeProvider>)
    expect(screen.queryByTestId("GlassView")).toBeNull()
    expect(screen.queryByTestId("BlurView")).toBeNull()
  })

  it("disables system effect animation under Reduce Motion", async () => {
    forceA11y("reduceMotion", true)
    await render(<Glass variant="liquid"><Text>Control</Text></Glass>)
    expect(screen.getByTestId("GlassView").props.glassEffectStyle.animate).toBe(false)
  })

  it("replaces the effect live when Reduce Transparency is forced", async () => {
    await render(<Glass variant="liquid" testID="surface"><Text>Control</Text></Glass>)
    expect(screen.getByTestId("surface").props.glassEffectStyle.style).toBe("regular")
    await act(() => forceA11y("reduceTransparency", true))
    expect(screen.getByTestId("surface").props.glassEffectStyle).toBeUndefined()
    expect(screen.getByText("Control")).toBeTruthy()
    expect(StyleSheet.flatten(screen.getByTestId("surface").props.style).backgroundColor).toBe("#ffffff")
  })

  it("hides content, hit testing and accessibility when invisible", async () => {
    await render(<Glass variant="liquid" visible={false} testID="hidden-surface"><Text>Jump to latest</Text></Glass>)
    expect(screen.queryByText("Jump to latest")).toBeNull()
    const hidden = screen.getByTestId("hidden-surface", { includeHiddenElements: true })
    expect(StyleSheet.flatten(hidden.props.style).display).toBe("none")
    expect(hidden.props.pointerEvents).toBe("none")
    expect(hidden.props.accessibilityElementsHidden).toBe(true)
  })

  it("dematerializes an exiting overlay without hiding its content geometry", async () => {
    await render(<Glass variant="liquid" materialized={false}><Text>Exiting panel</Text></Glass>)
    expect(screen.getByTestId("GlassView").props.glassEffectStyle.style).toBe("none")
    expect(screen.getByText("Exiting panel")).toBeTruthy()
  })
})

describe("system presentation preserves requested behavior", () => {
  it.each(["switch", "slider"])("does not force a palette or scheme onto an isolated native %s", async (control) => {
    await render(control === "switch" ? <Switch /> : <Slider />)
    const host = screen.getByTestId("expo-ui-Host")
    expect(host.props.seedColor).toBeUndefined()
    expect(host.props.colorScheme).toBeUndefined()
  })

  it("keeps native tints for the System palette, the OS's own appearance", async () => {
    await render(<GlassThemeProvider palette="system" scheme="dark"><Switch /></GlassThemeProvider>)
    const host = screen.getByTestId("expo-ui-Host")
    expect(host.props.seedColor).toBeUndefined()
    expect(host.props.colorScheme).toBe("dark")
  })

  it("preserves explicitly themed system controls", async () => {
    await render(<GlassThemeProvider palette="ocean" scheme="dark"><Switch /></GlassThemeProvider>)
    const host = screen.getByTestId("expo-ui-Host")
    expect(host.props.seedColor).toBeDefined()
    expect(host.props.colorScheme).toBe("dark")
  })

  it("hosts a themed iOS sheet with content constrained by the native presentation", async () => {
    await render(<GlassThemeProvider scheme="dark"><Sheet defaultOpen><SheetContent side="bottom"><SheetTitle>Photo details</SheetTitle></SheetContent></Sheet></GlassThemeProvider>)
    expect(screen.getByTestId("expo-ui-Host").props.colorScheme).toBe("dark")
    expect(screen.getByTestId("expo-ui-BottomSheet").props.fitToContents).toBe(false)
    expect(screen.getByTestId("expo-ui-RNHostView").props.matchContents).not.toBe(true)
    expect(StyleSheet.flatten(screen.getByText("Photo details").props.style).color).toEqual(PlatformColor("label"))
  })

  it("uses the system sheet when an initial detent is requested", async () => {
    await render(<Sheet defaultOpen><SheetContent side="bottom" detents={["medium", "large"]} defaultDetent={1}><SheetTitle>Place details</SheetTitle></SheetContent></Sheet>)
    expect(screen.getByTestId("expo-ui-BottomSheet")).toBeTruthy()
    expect(screen.getByText("Place details")).toBeTruthy()
  })

  it("opens the sandbox's system sheet example through the system path", async () => {
    await render(<>{overlayDemos.sheet.render()}</>)
    await fireEvent.press(screen.getByText("Detents (system sheet)"))
    expect(screen.getAllByTestId("expo-ui-BottomSheet").filter((sheet) => sheet.props.isPresented)).toHaveLength(1)
  })

  it("uses the system sheet for detent notifications", async () => {
    const changed = jest.fn()
    await render(<Sheet defaultOpen><SheetContent side="bottom" detents={["medium", "large"]} onDetentChange={changed}><SheetTitle>Place details</SheetTitle></SheetContent></Sheet>)
    expect(screen.getByTestId("expo-ui-BottomSheet")).toBeTruthy()
    const selection = screen.getByTestId("expo-ui-Group").props.modifiers.find((modifier: { $type: string }) => modifier.$type === "presentationDetents")
    await act(() => selection.eventListener({ detent: "large" }))
    expect(changed).toHaveBeenCalledWith(1)
  })

  it("delivers requested open changes instead of using an unobservable iOS system menu", async () => {
    const changed = jest.fn()
    await render(<DropdownMenu onOpenChange={changed}><DropdownMenuTrigger>Options</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Rename</DropdownMenuItem></DropdownMenuContent></DropdownMenu>)
    await fireEvent.press(screen.getByText("Options"))
    expect(changed).toHaveBeenCalledWith(true)
  })

  it("names the system menu trigger for VoiceOver", async () => {
    // the SwiftUI menu's label is an RN host view, which gives iOS no name of its own
    await render(<DropdownMenu><DropdownMenuTrigger accessibilityLabel="Photo options"><Text>…</Text></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Show Info</DropdownMenuItem></DropdownMenuContent></DropdownMenu>)
    const trigger = screen.getByLabelText("Photo options")
    expect(trigger.props.accessible).toBe(true)
    expect(trigger.props.accessibilityRole).toBe("button")
    expect(screen.getByTestId("expo-ui-MenuView")).toBeTruthy()
  })

  it("keeps Android's observable native menu path", async () => {
    jest.replaceProperty(Platform, "OS", "android")
    const changed = jest.fn()
    await render(<DropdownMenu onOpenChange={changed}><DropdownMenuTrigger>Options</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Rename</DropdownMenuItem></DropdownMenuContent></DropdownMenu>)
    await fireEvent(screen.getByTestId("expo-ui-MenuView"), "openMenu")
    expect(changed).toHaveBeenCalledWith(true)
  })
})

describe("glass groups under a forced scheme", () => {
  it("keeps separate effects when the theme forces the other scheme, unless merging is asked for", async () => {
    jest.spyOn(require("react-native"), "useColorScheme").mockReturnValue("light")
    const { GlassEffectGroup } = require("@/components/glass/native/glass")
    await render(<GlassThemeProvider scheme="dark"><GlassEffectGroup><Glass variant="liquid" /></GlassEffectGroup></GlassThemeProvider>)
    expect(screen.queryByTestId("GlassContainer")).toBeNull()
    expect(screen.getByTestId("GlassView").props.colorScheme).toBe("dark")
    await render(<GlassThemeProvider scheme="dark"><GlassEffectGroup merge><Glass variant="liquid" /></GlassEffectGroup></GlassThemeProvider>)
    expect(screen.getByTestId("GlassContainer")).toBeTruthy()
  })
})

describe("custom native lenses", () => {
  it("materializes a system glass switch knob only while held", async () => {
    await render(<Switch native={false} accessibilityLabel="Wi-Fi" />)
    expect(screen.queryByTestId("GlassView")).toBeNull()
    await fireEvent(screen.getByRole("switch"), "pressIn")
    expect(screen.getByTestId("GlassView")).toBeTruthy()
    await fireEvent(screen.getByRole("switch"), "pressOut")
    expect(screen.queryByTestId("GlassView")).toBeNull()
  })

  it("removes a held switch lens before applying disabled opacity", async () => {
    const { rerender } = await render(<Switch native={false} accessibilityLabel="Wi-Fi" />)
    await fireEvent(screen.getByRole("switch"), "pressIn")
    expect(screen.getByTestId("GlassView")).toBeTruthy()
    await rerender(<Switch native={false} disabled accessibilityLabel="Wi-Fi" />)
    expect(screen.queryByTestId("GlassView")).toBeNull()
  })

  it("disables custom segmented children and removes their held lens", async () => {
    const items = <><SegmentedControlItem value="a">A</SegmentedControlItem><SegmentedControlItem value="b">B</SegmentedControlItem></>
    const { rerender } = await render(<SegmentedControl native={false} defaultValue="a">{items}</SegmentedControl>)
    await fireEvent(screen.getAllByRole("radio")[0], "pressIn")
    expect(screen.getByTestId("GlassView")).toBeTruthy()
    await rerender(<SegmentedControl native={false} defaultValue="a" disabled>{items}</SegmentedControl>)
    expect(screen.queryByTestId("GlassView")).toBeNull()
    expect(screen.getAllByRole("radio")[0].props.accessibilityState.disabled).toBe(true)
  })

  it("ignores accessibility adjustments on a disabled custom slider", async () => {
    const changed = jest.fn()
    const committed = jest.fn()
    await render(<Slider native={false} disabled defaultValue={[50]} onValueChange={changed} onValueCommit={committed} />)
    await fireEvent(screen.getByRole("adjustable"), "accessibilityAction", { nativeEvent: { actionName: "increment" } })
    expect(screen.getByRole("adjustable").props.accessibilityValue.now).toBe(50)
    expect(changed).not.toHaveBeenCalled()
    expect(committed).not.toHaveBeenCalled()
  })
})

describe("native readable text", () => {
  it.each([["base", "body"], ["sm", "subheadline"], ["lg", "title3"], ["xs", "caption1"], ["5xl", "largeTitle"]] as const)("gives iOS %s text the semantic %s ramp", async (size, ramp) => {
    await render(<GText size={size}>Scaled copy</GText>)
    expect(screen.getByText("Scaled copy").props.dynamicTypeRamp).toBe(ramp)
    expect(screen.getByText("Scaled copy").props.maxFontSizeMultiplier).toBe(0)
  })

  it("preserves an explicit caller text ramp", async () => {
    await render(<GText size="lg" dynamicTypeRamp="caption2">Scaled copy</GText>)
    expect(screen.getByText("Scaled copy").props.dynamicTypeRamp).toBe("caption2")
  })

  it("allows the OS accessibility text size without an implicit cap", async () => {
    await render(<GText>Body copy</GText>)
    expect(screen.getByText("Body copy").props.maxFontSizeMultiplier).toBe(0)
  })

  it("responds to Bold Text changes for custom labels", async () => {
    await render(<GText>Body copy</GText>)
    const before = Number(StyleSheet.flatten(screen.getByText("Body copy").props.style).fontWeight)
    await act(() => forceA11y("boldText", true))
    expect(Number(StyleSheet.flatten(screen.getByText("Body copy").props.style).fontWeight)).toBeGreaterThan(before)
  })
})
