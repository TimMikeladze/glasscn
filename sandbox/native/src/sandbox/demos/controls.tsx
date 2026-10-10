import * as React from "react"
import { View } from "react-native"
import { BarChart3Icon, BellIcon, BookOpenIcon, CalendarIcon, ClockIcon, DropletIcon, ListIcon, LogOutIcon, MoonIcon, PenIcon, SunIcon } from "lucide-react-native"

import { Checkbox } from "@/components/glass/native/checkbox"
import { Dock, DockAction, DockBar, DockItem } from "@/components/glass/native/dock"
import {
  GroupedList,
  GroupedListChevron,
  GroupedListContent,
  GroupedListDescription,
  GroupedListFooter,
  GroupedListHeader,
  GroupedListIcon,
  GroupedListItem,
  GroupedListTitle,
  GroupedListValue,
} from "@/components/glass/native/grouped-list"
import { Progress } from "@/components/glass/native/progress"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/native/segmented-control"
import { Slider } from "@/components/glass/native/slider"
import { Switch } from "@/components/glass/native/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/glass/native/tabs"
import { useUI } from "@/components/glass/native/ui"
import type { Demo } from "@/sandbox/demos/types"
import { Body, Section } from "@/sandbox/ui"

const row = { flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" } as const

function SwitchDemo() {
  const [on, setOn] = React.useState(true)
  return (
    <>
      <Section title="Controlled" note={on ? "On" : "Off"}>
        <View style={row}>
          <Switch checked={on} onCheckedChange={setOn} accessibilityLabel="Reminders" />
          <Switch size="sm" checked={on} onCheckedChange={setOn} accessibilityLabel="Reminders small" />
        </View>
      </Section>
      <Section title="Uncontrolled">
        <View style={row}>
          <Switch defaultChecked />
          <Switch />
        </View>
      </Section>
      <Section title="Disabled">
        <View style={row}>
          <Switch disabled defaultChecked />
          <Switch disabled size="sm" />
        </View>
      </Section>
    </>
  )
}

function CheckboxDemo() {
  const [state, setState] = React.useState<boolean | "indeterminate">("indeterminate")
  return (
    <>
      <Section title="States" note={`checked = ${String(state)}`}>
        <View style={row}>
          <Checkbox checked={state} onCheckedChange={setState} accessibilityLabel="All nights" />
          <Checkbox defaultChecked />
          <Checkbox />
        </View>
      </Section>
      <Section title="Invalid · disabled">
        <View style={row}>
          <Checkbox invalid />
          <Checkbox disabled />
          <Checkbox disabled defaultChecked />
        </View>
      </Section>
    </>
  )
}

function SegmentedDemo() {
  const [v, setV] = React.useState("week")
  return (
    <>
      <Section title="Controlled" note={`value = ${v}`}>
        <SegmentedControl value={v} onValueChange={setV}>
          <SegmentedControlItem value="week">Week</SegmentedControlItem>
          <SegmentedControlItem value="month">Month</SegmentedControlItem>
          <SegmentedControlItem value="year">Year</SegmentedControlItem>
        </SegmentedControl>
      </Section>
      <Section title="Sizes · icons">
        <SegmentedControl size="sm" defaultValue="light">
          <SegmentedControlItem value="light">
            <SunIcon />
            Light
          </SegmentedControlItem>
          <SegmentedControlItem value="dark">
            <MoonIcon />
            Dark
          </SegmentedControlItem>
        </SegmentedControl>
        <SegmentedControl size="lg" defaultValue="list" style={{ alignSelf: "stretch" }}>
          <SegmentedControlItem value="list">
            <ListIcon />
          </SegmentedControlItem>
          <SegmentedControlItem value="calendar">
            <CalendarIcon />
          </SegmentedControlItem>
          <SegmentedControlItem value="off" disabled>
            Off
          </SegmentedControlItem>
        </SegmentedControl>
      </Section>
      <Section title="Disabled">
        <SegmentedControl disabled defaultValue="a">
          <SegmentedControlItem value="a">One</SegmentedControlItem>
          <SegmentedControlItem value="b">Two</SegmentedControlItem>
        </SegmentedControl>
      </Section>
    </>
  )
}

function TabsDemo() {
  return (
    <>
      <Section title="Default">
        <Tabs defaultValue="week">
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
          <TabsContent value="week">5 of 7 nights written.</TabsContent>
          <TabsContent value="month">23 of 31 nights written.</TabsContent>
          <TabsContent value="year">311 nights this year.</TabsContent>
        </Tabs>
      </Section>
      <Section title="Plain">
        <Tabs defaultValue="a">
          <TabsList variant="plain">
            <TabsTrigger value="a">
              <SunIcon />
              Morning
            </TabsTrigger>
            <TabsTrigger value="b">
              <MoonIcon />
              Evening
            </TabsTrigger>
            <TabsTrigger value="c" disabled>
              Night
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Section>
      <Section title="Line">
        <Tabs defaultValue="overview">
          <TabsList variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </Section>
      <Section title="Vertical">
        <Tabs defaultValue="general" orientation="vertical">
          <TabsList variant="plain">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          <TabsContent value="general">General settings.</TabsContent>
          <TabsContent value="privacy">Stays on this device.</TabsContent>
          <TabsContent value="about">Kaizen 1.0</TabsContent>
        </Tabs>
      </Section>
    </>
  )
}

function SliderDemo() {
  const [one, setOne] = React.useState([40])
  const [range, setRange] = React.useState([20, 80])
  const [committed, setCommitted] = React.useState<number[]>([])
  return (
    <>
      <Section title="Single" note={`value = ${one[0]}`}>
        <Slider value={one} onValueChange={setOne} accessibilityLabel="Volume" />
      </Section>
      <Section title="Range · step 5" note={`${range[0]} – ${range[1]} · committed ${committed.join(" – ") || "—"}`}>
        <Slider value={range} onValueChange={setRange} onValueCommit={setCommitted} step={5} accessibilityLabel="Hours" />
      </Section>
      <Section title="Uncontrolled · 0–10">
        <Slider defaultValue={[3]} min={0} max={10} />
      </Section>
      <Section title="Disabled">
        <Slider defaultValue={[60]} disabled />
      </Section>
    </>
  )
}

function ProgressDemo() {
  const [v, setV] = React.useState(35)
  return (
    <>
      <Section title="Animated" note={`${v}%`}>
        <Progress value={v} accessibilityLabel="Nights this month" />
        <Slider value={[v]} onValueChange={([n]) => setV(n)} />
      </Section>
      <Section title="Values">
        <Progress value={0} />
        <Progress value={66} />
        <Progress value={100} />
        <Progress value={3} max={4} style={{ height: 6 }} />
      </Section>
    </>
  )
}

function DockDemo() {
  const [tab, setTab] = React.useState("today")
  return (
    <>
      <Section title="Static" note={`On ${tab}`}>
        <Dock position="static">
          <DockBar value={tab} onValueChange={setTab} accessibilityLabel="Sections">
            <DockItem value="today">
              <MoonIcon />
              Today
            </DockItem>
            <DockItem value="journal">
              <BookOpenIcon />
              Journal
            </DockItem>
            <DockItem value="insights">
              <BarChart3Icon />
              Insights
            </DockItem>
          </DockBar>
          <DockAction accessibilityLabel="Write tonight">
            <PenIcon />
          </DockAction>
        </Dock>
      </Section>
      <Section title="Fixed (in a frame) · uncontrolled">
        <View style={{ height: 120 }}>
          <Dock>
            <DockBar defaultValue="a">
              <DockItem value="a">
                <SunIcon />
                Day
              </DockItem>
              <DockItem value="b">
                <MoonIcon />
                Night
              </DockItem>
            </DockBar>
          </Dock>
        </View>
      </Section>
    </>
  )
}

function GroupedListDemo() {
  const ui = useUI()
  const [remind, setRemind] = React.useState(true)
  const [taps, setTaps] = React.useState(0)
  return (
    <>
      <GroupedList>
        <GroupedListHeader>Time</GroupedListHeader>
        <GroupedListContent>
          <GroupedListItem onPress={() => setTaps((n) => n + 1)}>
            <GroupedListIcon color={ui.charts[1]}>
              <ClockIcon />
            </GroupedListIcon>
            <GroupedListTitle>Rhythm</GroupedListTitle>
            <GroupedListValue>5 years</GroupedListValue>
            <GroupedListChevron />
          </GroupedListItem>
          <GroupedListItem>
            <GroupedListIcon color={ui.charts[2]}>
              <BellIcon />
            </GroupedListIcon>
            <GroupedListTitle>
              Evening reminder
              <GroupedListDescription>Rings once each evening.</GroupedListDescription>
            </GroupedListTitle>
            <Switch checked={remind} onCheckedChange={setRemind} accessibilityLabel="Evening reminder" />
          </GroupedListItem>
          <GroupedListItem selected>
            <GroupedListIcon>
              <DropletIcon />
            </GroupedListIcon>
            <GroupedListTitle>Palette</GroupedListTitle>
            <GroupedListValue>Dusk</GroupedListValue>
          </GroupedListItem>
        </GroupedListContent>
        <GroupedListFooter>Changes save instantly. Tapped {taps}×.</GroupedListFooter>
      </GroupedList>
      <GroupedList>
        <GroupedListContent>
          <GroupedListItem destructive onPress={() => setTaps(0)}>
            <GroupedListIcon color={ui.destructive}>
              <LogOutIcon />
            </GroupedListIcon>
            <GroupedListTitle>Reset counter</GroupedListTitle>
          </GroupedListItem>
        </GroupedListContent>
      </GroupedList>
      <Body style={{ color: ui.mutedForeground, fontSize: 13 }}>Rows with onPress highlight; others are static.</Body>
    </>
  )
}

export const demos: Record<string, Demo> = {
  switch: { title: "Switch", render: () => <SwitchDemo /> },
  checkbox: { title: "Checkbox", render: () => <CheckboxDemo /> },
  "segmented-control": { title: "Segmented control", render: () => <SegmentedDemo /> },
  tabs: { title: "Tabs", render: () => <TabsDemo /> },
  slider: { title: "Slider", render: () => <SliderDemo /> },
  progress: { title: "Progress", render: () => <ProgressDemo /> },
  dock: { title: "Dock", render: () => <DockDemo /> },
  "grouped-list": { title: "Grouped list", render: () => <GroupedListDemo /> },
}
