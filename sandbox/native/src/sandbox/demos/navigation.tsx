import * as React from "react"
import { ScrollView, View } from "react-native"
import { Link } from "expo-router"
import { BellIcon, BookIcon, ChevronLeftIcon, HouseIcon, MoonIcon, PenIcon, PlusIcon, SearchIcon, SettingsIcon, ShareIcon, StarIcon, Trash2Icon } from "lucide-react-native"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/glass/native/accordion"
import { ActionSheet, ActionSheetAction, ActionSheetCancel, ActionSheetContent, ActionSheetDescription, ActionSheetHeader, ActionSheetTitle, ActionSheetTrigger } from "@/components/glass/native/action-sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/glass/native/collapsible"
import { Combobox } from "@/components/glass/native/combobox"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/glass/native/command"
import { ConfirmationPopover, ConfirmationPopoverContent, ConfirmationPopoverTrigger } from "@/components/glass/native/confirmation-popover"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/glass/native/context-menu"
import { Dock, DockAccessory, DockAction, DockBar, DockItem, DockSearch, usePlacement } from "@/components/glass/native/dock"
import { Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/glass/native/drawer"
import { DropdownMenuItem } from "@/components/glass/native/dropdown-menu"
import { Glass } from "@/components/glass/native/glass"
import { NavigationBar, NavigationBarLargeTitle, NavigationBarLeading, NavigationBarTrailing } from "@/components/glass/native/navigation-bar"
import { Press } from "@/components/glass/native/press"
import { ScrollEdge, ScrollEdgeProvider, useScrollEdges } from "@/components/glass/native/scroll-edge"
import { SearchField } from "@/components/glass/native/search-field"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarTrigger } from "@/components/glass/native/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/glass/native/tabs"
import { toast } from "@/components/glass/native/toaster"
import { Toolbar, ToolbarGroup, ToolbarItem, ToolbarOverflow, ToolbarSpacer, ToolbarTitle } from "@/components/glass/native/toolbar"
import { GText, useUI } from "@/components/glass/native/ui"
import type { Demo } from "@/sandbox/demos/types"
import { Body, Section } from "@/sandbox/ui"

const Row = ({ children }: { children: React.ReactNode }) => <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, alignItems: "center" }}>{children}</View>

function Face({ children, variant = "glass" }: { children?: React.ReactNode; variant?: "glass" | "primary" | "destructive" }) {
  const ui = useUI()
  const bg = variant === "primary" ? ui.primary : variant === "destructive" ? ui.destructive : ui.fillStrong
  const color = variant === "primary" ? ui.primaryForeground : variant === "destructive" ? ui.destructiveForeground : ui.foreground
  return (
    <View style={{ height: ui.control.default, paddingHorizontal: ui.pad.default, borderRadius: ui.radius.button, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <GText size="sm" weight="600" color={color}>
        {children}
      </GText>
    </View>
  )
}

/** A short scrolling "screen" with bars floating over it, sharing its scroll through ScrollEdgeProvider. */
function Stage({ children, bars, height = 420 }: { children?: React.ReactNode; bars: React.ReactNode; height?: number }) {
  const ui = useUI()
  const edges = useScrollEdges()
  return (
    <ScrollEdgeProvider value={edges}>
      <View style={{ height, borderRadius: ui.radius.surface, overflow: "hidden", backgroundColor: ui.auroraBase }}>
        <ScrollView onScroll={edges.onScroll} scrollEventThrottle={16} nestedScrollEnabled contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 10 }}>
          {children ??
            Array.from({ length: 16 }, (_, i) => (
              <Glass key={i} style={{ padding: 14 }}>
                <GText size="sm">Night {311 - i}</GText>
              </Glass>
            ))}
        </ScrollView>
        {bars}
        <View pointerEvents="none" style={{ position: "absolute", right: 10, top: 10 }}>
          <GText size="xs" tone="muted">
            {edges.minimized ? "minimized" : "expanded"} · overTop {String(edges.overTop)}
          </GText>
        </View>
      </View>
    </ScrollEdgeProvider>
  )
}

function NowPlaying() {
  const placement = usePlacement()
  return (
    <DockAccessory>
      <MoonIcon size={18} />
      <GText size="sm" weight="600" numberOfLines={1} style={{ flex: 1 }}>
        {placement === "inline" ? "Rain" : "Rain on a tin roof · 42 min"}
      </GText>
    </DockAccessory>
  )
}

function DockDemo() {
  const ui = useUI()
  const [tab, setTab] = React.useState("today")
  const [compactTab, setCompactTab] = React.useState("home")
  return (
    <>
      <Section title="minimizeBehavior onScrollDown · accessory · search · action" note="Scroll down: the bar folds to the current item and the accessory moves inline. Drag across the bar to scrub. The action is tinted interactive Liquid Glass.">
        <Stage
          bars={
            <Dock minimizeBehavior="onScrollDown" position="fixed">
              <NowPlaying />
              <DockBar value={tab} onValueChange={setTab}>
                <DockItem value="today">
                  <MoonIcon />
                  Today
                </DockItem>
                <DockItem value="journal" badge={3}>
                  <BookIcon />
                  Journal
                </DockItem>
                <DockItem value="alerts" badge={12} prominent>
                  <BellIcon />
                  Alerts
                </DockItem>
                <DockItem value="settings" disabled>
                  <SettingsIcon />
                  Settings
                </DockItem>
              </DockBar>
              <DockSearch placeholder="Search nights" />
              <DockAction accessibilityLabel="Write" onPress={() => toast("New entry")}>
                <PenIcon />
              </DockAction>
            </Dock>
          }
        />
      </Section>
      <Section title="layout compact · static · minimized" note="Icon and label side by side; `minimized` drives it by hand.">
        <View style={{ gap: 12 }}>
          <Dock position="static" layout="compact">
            <DockBar value={compactTab} onValueChange={setCompactTab} accessibilityLabel="Sections">
              <DockItem value="home">
                <HouseIcon />
                Home
              </DockItem>
              <DockItem value="starred">
                <StarIcon />
                Starred
              </DockItem>
            </DockBar>
          </Dock>
          <Dock position="static" minimized>
            <DockBar defaultValue="journal">
              <DockItem value="today">
                <MoonIcon />
                Today
              </DockItem>
              <DockItem value="journal" badge="new">
                <BookIcon />
                Journal
              </DockItem>
            </DockBar>
            <DockAction accessibilityLabel="Add">
              <PlusIcon color={ui.primaryForeground} />
            </DockAction>
          </Dock>
        </View>
      </Section>
    </>
  )
}

function TabsDemo() {
  return (
    <>
      <Section title="default · plain · line" note="Reanimated pill / underline slides to the current tab; string panels are GText.">
        {(["default", "plain", "line"] as const).map((variant) => (
          <Tabs key={variant} defaultValue="week">
            <TabsList variant={variant}>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year" disabled>
                Year
              </TabsTrigger>
            </TabsList>
            <TabsContent value="week">Five nights written this week.</TabsContent>
            <TabsContent value="month">22 of 31 nights.</TabsContent>
          </Tabs>
        ))}
      </Section>
      <Section title="vertical · icons">
        <Tabs defaultValue="home" orientation="vertical">
          <TabsList>
            <TabsTrigger value="home">
              <HouseIcon />
              Home
            </TabsTrigger>
            <TabsTrigger value="settings">
              <SettingsIcon />
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="home">Home panel</TabsContent>
          <TabsContent value="settings">Settings panel</TabsContent>
        </Tabs>
      </Section>
    </>
  )
}

function ToolbarDemo() {
  return (
    <>
      <Section title="minimize onScrollDown · groups · title · overflow · prominent" note="Groups share one liquid capsule; the title hides while minimized; overflow is a menu (system menu on iOS/Android).">
        <Stage
          bars={
            <Toolbar placement="bottom" minimize="onScrollDown" style={{ bottom: 12 }}>
              <ToolbarGroup>
                <ToolbarItem accessibilityLabel="Back">
                  <ChevronLeftIcon />
                </ToolbarItem>
              </ToolbarGroup>
              <ToolbarSpacer />
              <ToolbarTitle>Tonight</ToolbarTitle>
              <ToolbarSpacer />
              <ToolbarGroup>
                <ToolbarItem accessibilityLabel="Share" onPress={() => toast("Shared")}>
                  <ShareIcon />
                </ToolbarItem>
                <ToolbarOverflow>
                  <DropdownMenuItem onSelect={() => toast("Starred")}>Star</DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onSelect={() => toast.error("Deleted")}>
                    Delete
                  </DropdownMenuItem>
                </ToolbarOverflow>
              </ToolbarGroup>
              <ToolbarSpacer variant="fixed" />
              <ToolbarItem prominent onPress={() => toast.success("Done")}>
                Done
              </ToolbarItem>
            </Toolbar>
          }
        />
      </Section>
      <Section title="static · minimized by hand">
        <Toolbar placement="static" minimized>
          <ToolbarGroup>
            <ToolbarItem accessibilityLabel="Search">
              <SearchIcon />
            </ToolbarItem>
            <ToolbarOverflow align="start" label="Options">
              <DropdownMenuItem>Rename</DropdownMenuItem>
            </ToolbarOverflow>
          </ToolbarGroup>
          <ToolbarTitle>Hidden while minimized</ToolbarTitle>
        </Toolbar>
      </Section>
    </>
  )
}

function ScrollEdgeDemo() {
  const edges = useScrollEdges()
  const ui = useUI()
  return (
    <Section title="soft · hard · progress" note="Top: soft veil when content is under it (visible = overTop). Bottom: hard strip while more is below. Fading the veil is safe — it's never a parent of glass.">
      <View style={{ height: 320, borderRadius: ui.radius.surface, overflow: "hidden", backgroundColor: ui.auroraBase }}>
        <ScrollView onScroll={edges.onScroll} scrollEventThrottle={16} nestedScrollEnabled contentContainerStyle={{ padding: 16, gap: 10 }}>
          {Array.from({ length: 14 }, (_, i) => (
            <Glass key={i} style={{ padding: 14 }}>
              <GText size="sm">Row {i + 1}</GText>
            </Glass>
          ))}
        </ScrollView>
        <ScrollEdge edge="top" variant="soft" visible={edges.overTop} size={64} />
        <ScrollEdge edge="bottom" variant="hard" visible={edges.overBottom} size={24} />
      </View>
    </Section>
  )
}

function NavigationBarDemo() {
  const ui = useUI()
  const edges = useScrollEdges()
  const [manual, setManual] = React.useState(false)
  return (
    <>
      <Section title="Tracks the scroll (scrollY)" note="The large title hands over to the inline one on the UI thread as you scroll; the veil fades in with it.">
        <View style={{ height: 420, borderRadius: ui.radius.surface, overflow: "hidden", backgroundColor: ui.auroraBase }}>
          <ScrollView onScroll={edges.onScroll} scrollEventThrottle={16} nestedScrollEnabled contentContainerStyle={{ paddingBottom: 40 }}>
            <NavigationBarLargeTitle title="Journal" subtitle="311 nights" />
            <View style={{ padding: 16, gap: 10 }}>
              {Array.from({ length: 14 }, (_, i) => (
                <Glass key={i} style={{ padding: 14 }}>
                  <GText size="sm">Night {311 - i}</GText>
                </Glass>
              ))}
            </View>
          </ScrollView>
          <NavigationBar title="Journal" scrollY={edges.scrollY} style={{ paddingTop: 0 }}>
            <NavigationBarLeading>
              <Press accessibilityRole="button" accessibilityLabel="Back" hitSlop={8}>
                <ChevronLeftIcon color={ui.primary} />
              </Press>
            </NavigationBarLeading>
            <NavigationBarTrailing>
              <Press accessibilityRole="button" accessibilityLabel="Add" hitSlop={8} onPress={() => toast("New entry")}>
                <PlusIcon color={ui.primary} />
              </Press>
            </NavigationBarTrailing>
          </NavigationBar>
        </View>
      </Section>
      <Section title="collapsed by hand · titleDisplayMode inline">
        <Row>
          <Press accessibilityRole="button" onPress={() => setManual((m) => !m)}>
            <Face>{manual ? "Expand" : "Collapse"}</Face>
          </Press>
        </Row>
        <View style={{ height: 72, borderRadius: ui.radius.surface, overflow: "hidden", backgroundColor: ui.auroraBase }}>
          <NavigationBar title="Settings" collapsed={manual} style={{ paddingTop: 0 }} leading={<GText tone="primary">Edit</GText>} />
        </View>
        <View style={{ height: 72, borderRadius: ui.radius.surface, overflow: "hidden", backgroundColor: ui.auroraBase }}>
          <NavigationBar title="Inline title" titleDisplayMode="inline" style={{ paddingTop: 0 }} trailing={<GText tone="primary">Done</GText>} />
        </View>
      </Section>
    </>
  )
}

function SidebarDemo() {
  const ui = useUI()
  const [page, setPage] = React.useState("tonight")
  return (
    <Section title="SidebarProvider · Sidebar · SidebarInset" note="Beside the content from 768pt; over it (with a scrim) on phones. A liquid panel that slides, never fades.">
      <View style={{ height: 460, borderRadius: ui.radius.surface, overflow: "hidden", backgroundColor: ui.auroraBase }}>
        <SidebarProvider defaultOpen={false} width={240}>
          <Sidebar>
            <SidebarHeader>
              <MoonIcon size={18} color={ui.primary} />
              <GText weight="600">Nightly</GText>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Journal</SidebarGroupLabel>
                <SidebarMenu>
                  {["tonight", "history", "insights"].map((p) => (
                    <SidebarMenuItem key={p}>
                      <SidebarMenuButton isActive={page === p} onPress={() => setPage(p)}>
                        <BookIcon />
                        {p[0].toUpperCase() + p.slice(1)}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton onPress={() => setPage("archive")} isActive={page === "archive"}>
                          Archive
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenuButton>
                <SettingsIcon />
                Settings
              </SidebarMenuButton>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset style={{ padding: 16, gap: 12 }}>
            <SidebarTrigger />
            <GText font="display" size="2xl">
              {page}
            </GText>
          </SidebarInset>
        </SidebarProvider>
      </View>
    </Section>
  )
}

function SearchFieldDemo() {
  const [q, setQ] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const all = ["Rain", "Reading", "Rowing", "Running", "Recovery"]
  return (
    <>
      <Section title="inline · suggestions · showCancel auto" note="Clear button; Cancel while focused; suggestions while focused.">
        <SearchField value={q} onValueChange={setQ} onSubmit={(v) => toast(`Search “${v}”`)} suggestions={all.filter((s) => q && s.toLowerCase().startsWith(q.toLowerCase()))} onSuggestionSelect={(v) => toast(v)} />
        <Body>value: {q || "—"}</Body>
      </Section>
      <Section title="minimized (morphs open) · controlled expanded" note="A round button that springs open into the field and folds back when left empty.">
        <Row>
          <SearchField minimized expanded={open} onExpandedChange={setOpen} placeholder="Search nights" showCancel="always" cancelLabel="Done" onCancel={() => toast("Cancelled")} style={{ flex: 1 }} />
        </Row>
        <Body>expanded: {String(open)}</Body>
      </Section>
      <Section title="showCancel never · placement bottom" note="placement=bottom pins it to the bottom edge, riding the keyboard (KeyboardStickyView) — see the Dock demo's search tab, or the tabs-layout search tab.">
        <SearchField showCancel="never" placeholder="No cancel" />
      </Section>
    </>
  )
}

function ActionSheetDemo() {
  return (
    <Section title="Actions · destructive · preferred · cancel" note="Liquid glass group from the bottom; Cancel in its own capsule. Selection tick; destructive buzzes a warning.">
      <ActionSheet>
        <ActionSheetTrigger>
          <Face>Share night</Face>
        </ActionSheetTrigger>
        <ActionSheetContent>
          <ActionSheetHeader>
            <ActionSheetTitle>Night 311</ActionSheetTitle>
            <ActionSheetDescription>Thursday, Oct 8</ActionSheetDescription>
          </ActionSheetHeader>
          <ActionSheetAction variant="preferred" onPress={() => toast("Copied")}>
            Copy as text
          </ActionSheetAction>
          <ActionSheetAction onPress={() => toast("Exported")}>
            <ShareIcon />
            Export
          </ActionSheetAction>
          <ActionSheetAction variant="destructive" onPress={() => toast.error("Deleted")}>
            <Trash2Icon />
            Delete
          </ActionSheetAction>
          <ActionSheetCancel />
        </ActionSheetContent>
      </ActionSheet>
    </Section>
  )
}

function DrawerDemo() {
  return (
    <Section title="medium/large detents · grabber · DrawerBody scrolls" note="The system sheet on iOS/Android; Reanimated + gesture-handler on the web.">
      <Row>
        <Drawer>
          <DrawerTrigger>
            <Face>Open drawer</Face>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Tonight</DrawerTitle>
              <DrawerDescription>Drag up for more.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              {Array.from({ length: 12 }, (_, i) => (
                <GText key={i} size="sm">
                  Line {i + 1}
                </GText>
              ))}
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose>
                <Face variant="primary">Done</Face>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <Drawer>
          <DrawerTrigger>
            <Face>native={"{false}"}</Face>
          </DrawerTrigger>
          <DrawerContent native={false} detents={["medium", "large"]} defaultDetent={1}>
            <DrawerHeader>
              <DrawerTitle>React Native drawer</DrawerTitle>
              <DrawerDescription>Starts large (defaultDetent 1).</DrawerDescription>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      </Row>
    </Section>
  )
}

function ContextMenuDemo() {
  const ui = useUI()
  return (
    <>
      <Section title="Long-press" note="iOS: SwiftUI context menu with its lifted preview; Android: Compose menu; web: right-click → glass menu.">
        <ContextMenu>
          <ContextMenuTrigger style={{ alignSelf: "flex-start" }}>
            <Glass style={{ padding: 20, width: 220 }}>
              <GText weight="600">Night 311</GText>
              <GText size="sm" tone="muted">
                Long-press me
              </GText>
            </Glass>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem systemImage="star" onSelect={() => toast("Starred")}>
              Star
            </ContextMenuItem>
            <ContextMenuItem systemImage="square.and.arrow.up" onSelect={() => toast("Shared")}>
              Share
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive" systemImage="trash" onSelect={() => toast.error("Deleted")}>
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Section>
      <Section title="native={false}" note="The liquid-glass menu everywhere.">
        <ContextMenu native={false}>
          <ContextMenuTrigger style={{ alignSelf: "flex-start" }}>
            <View style={{ padding: 20, borderRadius: ui.radius.surface, backgroundColor: ui.fill }}>
              <GText size="sm">Long-press (glass)</GText>
            </View>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onSelect={() => toast("Renamed")}>Rename</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Section>
    </>
  )
}

function ConfirmationDemo() {
  return (
    <Section title="destructive · default" note="A popover from 600pt; an action sheet on phones.">
      <Row>
        <ConfirmationPopover>
          <ConfirmationPopoverTrigger>
            <Face variant="destructive">Delete night</Face>
          </ConfirmationPopoverTrigger>
          <ConfirmationPopoverContent title="Delete this night?" description="This can’t be undone." confirmLabel="Delete" onConfirm={() => toast.error("Deleted")} onCancel={() => toast("Kept")} />
        </ConfirmationPopover>
        <ConfirmationPopover>
          <ConfirmationPopoverTrigger>
            <Face>Archive</Face>
          </ConfirmationPopoverTrigger>
          <ConfirmationPopoverContent title="Archive 12 nights?" variant="default" confirmLabel="Archive" onConfirm={() => toast.success("Archived")} />
        </ConfirmationPopover>
      </Row>
    </Section>
  )
}

function CommandDemo() {
  const [open, setOpen] = React.useState(false)
  const items = (
    <>
      <CommandInput placeholder="Type a command…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={(v) => (toast(v), setOpen(false))}>
            <PenIcon />
            New entry
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem keywords={["find"]} onSelect={(v) => (toast(v), setOpen(false))}>
            <SearchIcon />
            Search
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem onSelect={(v) => (toast(v), setOpen(false))}>
            <SettingsIcon />
            Preferences
          </CommandItem>
          <CommandItem disabled>Billing (soon)</CommandItem>
        </CommandGroup>
      </CommandList>
    </>
  )
  return (
    <>
      <Section title="Inline">
        <Glass style={{ overflow: "hidden" }}>
          <Command>{items}</Command>
        </Glass>
      </Section>
      <Section title="CommandDialog" note="The search takes the keyboard straight away.">
        <Press accessibilityRole="button" onPress={() => setOpen(true)}>
          <Face>Open palette</Face>
        </Press>
        <CommandDialog open={open} onOpenChange={setOpen}>
          {items}
        </CommandDialog>
      </Section>
    </>
  )
}

const OPTIONS = [
  { value: "rain", label: "Rain", group: "Sounds" },
  { value: "waves", label: "Waves", group: "Sounds" },
  { value: "fire", label: "Fireplace", group: "Sounds", disabled: true },
  { value: "piano", label: "Piano", group: "Music", keywords: ["keys"] },
  { value: "strings", label: "Strings", group: "Music" },
]

function ComboboxDemo() {
  const [one, setOne] = React.useState("rain")
  const [many, setMany] = React.useState<string[]>(["rain", "piano"])
  return (
    <>
      <Section title="Single">
        <Combobox options={OPTIONS} value={one} onValueChange={setOne} aria-label="Sound" />
        <Body>value: {one || "—"}</Body>
      </Section>
      <Section title="multiple (chips) · disabled">
        <Combobox multiple options={OPTIONS} value={many} onValueChange={setMany} placeholder="Pick sounds" searchPlaceholder="Filter…" emptyText="No sound." aria-label="Sounds" />
        <Combobox options={OPTIONS} disabled placeholder="Disabled" />
      </Section>
    </>
  )
}

function AccordionDemo() {
  const [value, setValue] = React.useState<string[]>(["a"])
  return (
    <>
      <Section title="single · collapsible">
        <Accordion type="single" defaultValue="a" collapsible>
          <AccordionItem value="a">
            <AccordionTrigger>What counts as a night?</AccordionTrigger>
            <AccordionContent>Anything written between 6pm and 4am.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Can I edit past nights?</AccordionTrigger>
            <AccordionContent>Yes, until the next one is sealed.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="c">
            <AccordionTrigger disabled>Locked (disabled)</AccordionTrigger>
            <AccordionContent>Hidden</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>
      <Section title="multiple · grouped · controlled">
        <Accordion type="multiple" variant="grouped" value={value} onValueChange={setValue}>
          <AccordionItem value="a">
            <AccordionTrigger>Reminders</AccordionTrigger>
            <AccordionContent>Every night at 21:30.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Sync</AccordionTrigger>
            <AccordionContent>iCloud, end-to-end encrypted.</AccordionContent>
          </AccordionItem>
        </Accordion>
        <Body>open: {value.join(", ") || "—"}</Body>
      </Section>
    </>
  )
}

function CollapsibleDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Section title="uncontrolled">
        <Collapsible>
          <CollapsibleTrigger>
            <Face>Show details</Face>
          </CollapsibleTrigger>
          <CollapsibleContent style={{ paddingTop: 8 }}>
            <Body>Three nights in a row. Longest chain: 41.</Body>
          </CollapsibleContent>
        </Collapsible>
      </Section>
      <Section title="controlled · disabled">
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger>
            <Face>{open ? "Hide" : "Show"} (controlled)</Face>
          </CollapsibleTrigger>
          <CollapsibleContent style={{ paddingTop: 8 }}>
            <Body>Controlled content.</Body>
          </CollapsibleContent>
        </Collapsible>
        <Collapsible disabled>
          <CollapsibleTrigger>
            <Face>Disabled</Face>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Body>Never shown.</Body>
          </CollapsibleContent>
        </Collapsible>
      </Section>
    </>
  )
}

function TabsLayoutDemo() {
  return (
    <Section title="NativeTabs recipe" note="A route layout, so it has its own screen: system tab bar themed from tokens, minimize on scroll, bottom accessory with placement, a role=search tab, a Material bar on Android.">
      <Link href={"/tabs-layout" as never} asChild>
        <Press accessibilityRole="link">
          <Face variant="primary">Open tabs layout</Face>
        </Press>
      </Link>
    </Section>
  )
}

/** Navigation and overlays added in M2/M3, plus the M4 rebuilds of dock and tabs (these override the controls demos). */
export const demos: Record<string, Demo> = {
  dock: { title: "Dock", render: () => <DockDemo /> },
  tabs: { title: "Tabs", render: () => <TabsDemo /> },
  "tabs-layout": { title: "Tabs layout", render: () => <TabsLayoutDemo /> },
  toolbar: { title: "Toolbar", render: () => <ToolbarDemo /> },
  "scroll-edge": { title: "Scroll edge", render: () => <ScrollEdgeDemo /> },
  "navigation-bar": { title: "Navigation bar", render: () => <NavigationBarDemo /> },
  sidebar: { title: "Sidebar", render: () => <SidebarDemo /> },
  "search-field": { title: "Search field", render: () => <SearchFieldDemo /> },
  "action-sheet": { title: "Action sheet", render: () => <ActionSheetDemo /> },
  drawer: { title: "Drawer", render: () => <DrawerDemo /> },
  "context-menu": { title: "Context menu", render: () => <ContextMenuDemo /> },
  "confirmation-popover": { title: "Confirmation popover", render: () => <ConfirmationDemo /> },
  command: { title: "Command", render: () => <CommandDemo /> },
  combobox: { title: "Combobox", render: () => <ComboboxDemo /> },
  accordion: { title: "Accordion", render: () => <AccordionDemo /> },
  collapsible: { title: "Collapsible", render: () => <CollapsibleDemo /> },
}
