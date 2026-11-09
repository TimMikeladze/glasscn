import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react-native"
import * as RN from "react-native"
import { useSharedValue } from "react-native-reanimated"

import { ScrollEdge, ScrollEdgeProvider, type ScrollEdges } from "@/components/glass/native/scroll-edge"
import { Sidebar, SidebarMenuButton, SidebarProvider } from "@/components/glass/native/sidebar"
import { Toolbar, ToolbarGroup, ToolbarItem } from "@/components/glass/native/toolbar"
import { GlassThemeProvider } from "@/components/glass/native/tokens"
import { GlassTabs } from "@/components/glass/native/tabs-layout"
import { Dock, DockAccessory, DockAction, DockBar, DockItem, DockSearch } from "@/components/glass/native/dock"

jest.mock("expo-router/unstable-native-tabs", () => {
  const React = require("react")
  const { View } = require("react-native")
  const Tabs = (props: object) => React.createElement(View, { ...props, testID: "system-tabs" })
  return { NativeTabs: Object.assign(Tabs, { Trigger: View, BottomAccessory: Object.assign(View, { usePlacement: () => "regular" }) }) }
})

afterEach(() => jest.restoreAllMocks())

it("leaves native application-tab minimization to the OS by default", async () => {
  await render(<GlassTabs />)
  expect(screen.getByTestId("system-tabs").props.minimizeBehavior).toBe("automatic")
  expect(screen.getByTestId("system-tabs").props.tintColor).toBeUndefined()
  expect(screen.getByTestId("system-tabs").props.iconColor).toBeUndefined()
})

it("uses one uniform automatic edge instead of a stepped soft veil", async () => {
  await render(<ScrollEdge testID="edge" />)
  expect(screen.getByTestId("edge", { includeHiddenElements: true }).children).toHaveLength(1)
})

it("attaches wide sidebars to window edges", async () => {
  jest.spyOn(RN.Dimensions, "get").mockReturnValue({ width: 1024, height: 768, scale: 1, fontScale: 1 })
  await render(<SidebarProvider defaultOpen><Sidebar testID="sidebar"><RN.Text>Inbox</RN.Text></Sidebar></SidebarProvider>)
  const surface = screen.getByTestId("sidebar")
  expect(RN.StyleSheet.flatten(surface.props.style).borderRadius).toBe(0)
  let positioned = surface.parent
  while (positioned && RN.StyleSheet.flatten(positioned.props.style)?.position !== "absolute") positioned = positioned.parent
  expect(RN.StyleSheet.flatten(positioned?.props.style)).toMatchObject({ top: 0, bottom: 0, start: 0 })
})

it("joins top toolbar controls onto one uniform region while content scrolls beneath", async () => {
  function Scrolled() {
    const scrollY = useSharedValue(100)
    const edges = { overTop: true, overBottom: true, minimized: false, scrollY, onScroll: jest.fn(), scrollHandler: jest.fn() } as unknown as ScrollEdges
    return <ScrollEdgeProvider value={edges}><Toolbar><ToolbarGroup><ToolbarItem>Back</ToolbarItem></ToolbarGroup></Toolbar></ScrollEdgeProvider>
  }
  await render(<Scrolled />)
  expect(screen.queryByTestId("GlassView")).toBeNull()
  expect(screen.getByRole("button", { name: "Back" })).toBeTruthy()
})

it("keeps sidebar labels neutral while symbols carry the accent", async () => {
  const Symbol = (props: { color?: string; size?: number }) => <RN.View testID="symbol" {...props} />
  await render(<GlassThemeProvider><SidebarMenuButton isActive><Symbol />Inbox</SidebarMenuButton></GlassThemeProvider>)
  const text = RN.StyleSheet.flatten(screen.getByText("Inbox").props.style)
  expect(text.color).not.toBe(screen.getByTestId("symbol").props.color)
})

it("orders a minimized Dock as folded tab, accessory, search", async () => {
  await render(<Dock position="static" minimized>
    <DockAccessory><RN.Text>Now playing</RN.Text></DockAccessory>
    <DockBar defaultValue="home"><DockItem value="home">Home</DockItem></DockBar>
    <DockSearch placeholder="Search music" />
  </Dock>)
  // Yoga has no CSS order, so the Dock reorders its children itself
  type Node = { props?: Record<string, unknown>; children?: (Node | string)[] | null }
  const order: string[] = []
  const walk = (node: Node | string | null) => {
    if (!node || typeof node === "string") return
    const p = node.props ?? {}
    if (p.accessibilityRole === "tab" || p.accessibilityRole === "search") order.push(String(p.accessibilityLabel))
    if (node.children?.includes("Now playing")) order.push("Now playing")
    node.children?.forEach(walk)
  }
  const tree = screen.toJSON() as Node | Node[]
  ;(Array.isArray(tree) ? tree : [tree]).forEach(walk)
  expect(order.filter((label, i) => order.indexOf(label) === i)).toEqual(["Home", "Now playing", "Search music"])
})

it("gives expanded Dock search the row and restores companions after cancellation", async () => {
  const expanded = jest.fn()
  const cancelled = jest.fn()
  await render(<Dock position="static" minimized>
    <DockAccessory><RN.Text>Now playing</RN.Text></DockAccessory>
    <DockBar defaultValue="home"><DockItem value="home">Home</DockItem></DockBar>
    <DockSearch placeholder="Search music" onExpandedChange={expanded} onCancel={cancelled} />
    <DockAction accessibilityLabel="Compose" />
  </Dock>)
  await fireEvent.press(screen.getByRole("search", { name: "Search music" }))
  expect(expanded).toHaveBeenLastCalledWith(true)
  expect(screen.queryByText("Now playing")).toBeNull()
  expect(screen.queryByRole("tab", { name: "Home" })).toBeNull()
  expect(screen.queryByRole("button", { name: "Compose" })).toBeNull()
  expect(screen.getByRole("search", { name: "Search music" })).toBeTruthy()
  await fireEvent.press(screen.getByText("Cancel"))
  expect(expanded).toHaveBeenLastCalledWith(false)
  expect(cancelled).toHaveBeenCalledTimes(1)
  expect(screen.getByText("Now playing")).toBeTruthy()
  expect(screen.getByRole("tab", { name: "Home" })).toBeTruthy()
  expect(screen.getByRole("button", { name: "Compose" })).toBeTruthy()
})

it("preserves a controlled Dock search that rejects collapse", async () => {
  const changed = jest.fn()
  await render(<Dock position="static">
    <DockAccessory><RN.Text>Now playing</RN.Text></DockAccessory>
    <DockBar defaultValue="home"><DockItem value="home">Home</DockItem></DockBar>
    <DockSearch expanded placeholder="Search music" onExpandedChange={changed} />
  </Dock>)
  expect(screen.queryByText("Now playing")).toBeNull()
  await fireEvent.press(screen.getByText("Cancel"))
  expect(changed).toHaveBeenLastCalledWith(false)
  expect(screen.queryByText("Now playing")).toBeNull()
  expect(screen.getByRole("search", { name: "Search music" })).toBeTruthy()
})
