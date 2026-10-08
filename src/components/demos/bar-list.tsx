import { BookOpenIcon, BrainIcon, DumbbellIcon, FootprintsIcon, MoonIcon } from "lucide-react"

import { BarList } from "@/components/glass/bar-list"

const habits = [
  { name: "Walk 8k steps", value: 26, icon: <FootprintsIcon /> },
  { name: "Read 20 pages", value: 22, icon: <BookOpenIcon /> },
  { name: "Lights out by 11", value: 19, icon: <MoonIcon /> },
  { name: "Strength session", value: 12, icon: <DumbbellIcon /> },
  { name: "Meditate", value: 8, icon: <BrainIcon /> },
]

export default function BarListDemo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <div className="flex items-baseline justify-between text-sm text-muted-foreground">
        <span>Habit</span>
        <span>Days this month</span>
      </div>
      <BarList data={habits} max={30} valueFormat={(v) => `${v}/30`} />
    </div>
  )
}
