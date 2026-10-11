import { ArrowRightIcon, ChevronsRightIcon, ChevronsUpIcon } from "lucide-react"

import { ActivityRings } from "@/components/glass/activity-rings"

export default function ActivityRingsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <ActivityRings
        rings={[
          { value: 0.72, label: "Move", icon: <ArrowRightIcon /> },
          { value: 1.43, label: "Exercise", icon: <ChevronsRightIcon /> },
          { value: 2.18, label: "Stand", icon: <ChevronsUpIcon /> },
        ]}
      />
      <ActivityRings size={88} stroke={10} gap={3} rings={[{ value: 0.9 }, { value: 0.6 }]} />
    </div>
  )
}
