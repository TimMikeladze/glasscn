import { BookOpenIcon, FlameIcon, TimerIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
import { Stat, StatIcon, StatLabel, StatTrend, StatValue } from "@/components/glass/stat"

export default function StatDemo() {
  return (
    <div className="grid w-full max-w-lg gap-4">
      {/* in a card, tiles are fills — not more glass */}
      <Card>
        <CardHeader>
          <CardTitle>This week</CardTitle>
          <CardDescription>Compared with last week.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
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
              <TimerIcon />
            </StatIcon>
            <StatValue>9m</StatValue>
            <StatLabel>To fall asleep</StatLabel>
            {/* went up, and that's bad */}
            <StatTrend direction="up" sentiment="negative">
              2m
            </StatTrend>
          </Stat>
        </CardContent>
      </Card>
      {/* on its own, a tile is its own pane */}
      <Stat variant="glass" className="w-40">
        <StatValue>71%</StatValue>
        <StatLabel>Kept</StatLabel>
        <StatTrend direction="flat">0%</StatTrend>
      </Stat>
    </div>
  )
}
