import * as React from "react"
import { View } from "react-native"
import { BellIcon, DropletIcon, LockIcon, MoonIcon, UserIcon } from "lucide-react-native"

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
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/native/segmented-control"
import { Slider } from "@/components/glass/native/slider"
import { Switch } from "@/components/glass/native/switch"
import { GText, alpha, useUI } from "@/components/glass/native/ui"

/** iOS Settings in glass: grouped rows with icon tiles, switches, a segmented control and a slider. */
export function Settings01({ onNavigate }: { onNavigate?: (row: "profile" | "privacy") => void }) {
  const ui = useUI()
  const [reminders, setReminders] = React.useState(true)
  const [theme, setTheme] = React.useState("auto")
  const [blur, setBlur] = React.useState([28])
  return (
    <View style={{ width: "100%", maxWidth: 448, alignSelf: "center", gap: 24 }}>
      <GroupedList>
        <GroupedListHeader>Account</GroupedListHeader>
        <GroupedListContent>
          <GroupedListItem onPress={() => onNavigate?.("profile")}>
            <GroupedListIcon color={ui.charts[1]}>
              <UserIcon />
            </GroupedListIcon>
            <GroupedListTitle>
              Profile
              <GroupedListDescription>Name, photo, sign-in</GroupedListDescription>
            </GroupedListTitle>
            <GroupedListChevron />
          </GroupedListItem>
          <GroupedListItem onPress={() => onNavigate?.("privacy")}>
            <GroupedListIcon color={alpha(ui.foreground, 0.6)}>
              <LockIcon />
            </GroupedListIcon>
            <GroupedListTitle>Privacy</GroupedListTitle>
            <GroupedListValue>On device</GroupedListValue>
            <GroupedListChevron />
          </GroupedListItem>
        </GroupedListContent>
      </GroupedList>

      <GroupedList>
        <GroupedListHeader>Evening</GroupedListHeader>
        <GroupedListContent>
          <GroupedListItem>
            <GroupedListIcon color={ui.charts[2]}>
              <BellIcon />
            </GroupedListIcon>
            <GroupedListTitle>Remind me to write</GroupedListTitle>
            <Switch checked={reminders} onCheckedChange={setReminders} accessibilityLabel="Remind me to write" />
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
          <GroupedListItem style={{ paddingVertical: 12 }}>
            <SegmentedControl value={theme} onValueChange={setTheme} accessibilityLabel="Theme" style={{ flex: 1 }}>
              <SegmentedControlItem value="auto">Auto</SegmentedControlItem>
              <SegmentedControlItem value="light">Light</SegmentedControlItem>
              <SegmentedControlItem value="dark">Dark</SegmentedControlItem>
            </SegmentedControl>
          </GroupedListItem>
          <GroupedListItem style={{ paddingVertical: 16 }}>
            <GroupedListIcon color={ui.charts[1]}>
              <DropletIcon />
            </GroupedListIcon>
            <View style={{ flex: 1, gap: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <GText style={{ fontSize: 15.2 }}>Frost</GText>
                <GText tone="muted" style={{ fontSize: 15.2, fontVariant: ["tabular-nums"] }}>
                  {blur[0]}px
                </GText>
              </View>
              <Slider value={blur} onValueChange={setBlur} min={0} max={48} accessibilityLabel="Frost" />
            </View>
          </GroupedListItem>
        </GroupedListContent>
      </GroupedList>
    </View>
  )
}
