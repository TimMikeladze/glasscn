"use client"

import * as React from "react"
import { BellIcon, DropletIcon, LockIcon, MoonIcon, UserIcon } from "lucide-react"

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
} from "@/components/glass/grouped-list"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/segmented-control"
import { Slider } from "@/components/glass/slider"
import { Switch } from "@/components/glass/switch"

/** iOS Settings in glass: grouped rows with icon tiles, switches, a segmented control and a slider. */
export function Settings01() {
  const [reminders, setReminders] = React.useState(true)
  const [theme, setTheme] = React.useState("auto")
  const [blur, setBlur] = React.useState([28])
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <GroupedList>
        <GroupedListHeader>Account</GroupedListHeader>
        <GroupedListContent>
          <GroupedListItem asChild>
            <button type="button">
              <GroupedListIcon className="bg-chart-2">
                <UserIcon />
              </GroupedListIcon>
              <GroupedListTitle>
                Profile
                <GroupedListDescription>Name, photo, sign-in</GroupedListDescription>
              </GroupedListTitle>
              <GroupedListChevron />
            </button>
          </GroupedListItem>
          <GroupedListItem asChild>
            <button type="button">
              <GroupedListIcon className="bg-foreground/60">
                <LockIcon />
              </GroupedListIcon>
              <GroupedListTitle>Privacy</GroupedListTitle>
              <GroupedListValue>On device</GroupedListValue>
              <GroupedListChevron />
            </button>
          </GroupedListItem>
        </GroupedListContent>
      </GroupedList>

      <GroupedList>
        <GroupedListHeader>Evening</GroupedListHeader>
        <GroupedListContent>
          <GroupedListItem>
            <GroupedListIcon className="bg-chart-3">
              <BellIcon />
            </GroupedListIcon>
            <GroupedListTitle>Remind me to write</GroupedListTitle>
            <Switch checked={reminders} onCheckedChange={setReminders} aria-label="Remind me to write" />
          </GroupedListItem>
          <GroupedListItem>
            <GroupedListIcon>
              <MoonIcon />
            </GroupedListIcon>
            <GroupedListTitle>Reminder time</GroupedListTitle>
            <GroupedListValue>9:00 PM</GroupedListValue>
          </GroupedListItem>
        </GroupedListContent>
        <GroupedListFooter>One quiet nudge each evening. Silent while the app is open.</GroupedListFooter>
      </GroupedList>

      <GroupedList>
        <GroupedListHeader>Appearance</GroupedListHeader>
        <GroupedListContent>
          <GroupedListItem className="py-3">
            <SegmentedControl value={theme} onValueChange={setTheme} className="w-full" aria-label="Theme">
              <SegmentedControlItem value="auto">Auto</SegmentedControlItem>
              <SegmentedControlItem value="light">Light</SegmentedControlItem>
              <SegmentedControlItem value="dark">Dark</SegmentedControlItem>
            </SegmentedControl>
          </GroupedListItem>
          <GroupedListItem className="py-4">
            <GroupedListIcon className="bg-chart-2">
              <DropletIcon />
            </GroupedListIcon>
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex justify-between text-[0.95rem]">
                Frost <span className="text-muted-foreground tabular-nums">{blur[0]}px</span>
              </div>
              <Slider value={blur} onValueChange={setBlur} min={0} max={48} aria-label="Frost" />
            </div>
          </GroupedListItem>
        </GroupedListContent>
      </GroupedList>
    </div>
  )
}
