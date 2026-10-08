import { BookOpenIcon, CheckIcon, FlameIcon } from "lucide-react"

import { Stat, StatIcon, StatLabel, StatTrend, StatValue } from "@/components/glass/stat"

export default function StatDemo() {
  return (
    <div className="grid w-full max-w-lg grid-cols-3 gap-3">
      <Stat>
        <StatIcon className="text-primary">
          <FlameIcon />
        </StatIcon>
        <StatValue className="text-primary">12</StatValue>
        <StatLabel>Chain</StatLabel>
      </Stat>
      <Stat>
        <StatIcon>
          <BookOpenIcon />
        </StatIcon>
        <StatValue>311</StatValue>
        <StatLabel>Nights</StatLabel>
        <StatTrend>12%</StatTrend>
      </Stat>
      <Stat>
        <StatIcon>
          <CheckIcon />
        </StatIcon>
        <StatValue>71%</StatValue>
        <StatLabel>Kept</StatLabel>
        <StatTrend direction="down">3%</StatTrend>
      </Stat>
    </div>
  )
}
