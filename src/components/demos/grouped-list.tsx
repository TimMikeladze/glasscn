import { BellIcon, ClockIcon, DropletIcon } from "lucide-react"

import { Badge } from "@/components/glass/badge"
import {
  GroupedList,
  GroupedListChevron,
  GroupedListContent,
  GroupedListFooter,
  GroupedListHeader,
  GroupedListIcon,
  GroupedListItem,
  GroupedListTitle,
  GroupedListValue,
} from "@/components/glass/grouped-list"

export default function GroupedListDemo() {
  return (
    <GroupedList className="w-full max-w-sm">
      <GroupedListHeader>Time</GroupedListHeader>
      <GroupedListContent>
        <GroupedListItem asChild>
          <button type="button">
            <GroupedListIcon className="bg-chart-2">
              <ClockIcon />
            </GroupedListIcon>
            <GroupedListTitle>Rhythm</GroupedListTitle>
            <GroupedListValue>5 years</GroupedListValue>
            <GroupedListChevron />
          </button>
        </GroupedListItem>
        <GroupedListItem asChild>
          <button type="button">
            <GroupedListIcon className="bg-chart-3">
              <BellIcon />
            </GroupedListIcon>
            <GroupedListTitle>Evening reminder</GroupedListTitle>
            <GroupedListValue>9:00 PM</GroupedListValue>
            <GroupedListChevron />
          </button>
        </GroupedListItem>
        <GroupedListItem>
          <GroupedListIcon>
            <DropletIcon />
          </GroupedListIcon>
          <GroupedListTitle>Palette</GroupedListTitle>
          <Badge variant="tinted">Dusk</Badge>
        </GroupedListItem>
      </GroupedListContent>
      <GroupedListFooter>Changes save instantly.</GroupedListFooter>
    </GroupedList>
  )
}
