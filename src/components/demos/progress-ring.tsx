import { CheckIcon } from "lucide-react"

import { ProgressRing } from "@/components/glass/progress-ring"

export default function ProgressRingDemo() {
  return (
    <div className="flex items-center gap-6">
      <ProgressRing value={1} size={88}>
        <CheckIcon className="size-8" strokeWidth={2.5} />
      </ProgressRing>
      <ProgressRing value={0.64} size={72} color="var(--chart-2)">
        <span className="text-lg">64%</span>
      </ProgressRing>
      <ProgressRing value={0.3} size={56} color="var(--chart-3)">
        <span className="text-xs">3/10</span>
      </ProgressRing>
    </div>
  )
}
