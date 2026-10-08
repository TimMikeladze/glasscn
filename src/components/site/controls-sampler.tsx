"use client"

import * as React from "react"
import { BellIcon } from "lucide-react"
import { toast } from "sonner"

import { ActivityRings } from "@/components/glass/activity-rings"
import { Badge } from "@/components/glass/badge"
import { Button } from "@/components/glass/button"
import { Card, CardContent } from "@/components/glass/card"
import { Input } from "@/components/glass/input"
import { Kbd } from "@/components/glass/kbd"
import { Progress } from "@/components/glass/progress"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/segmented-control"
import { Slider } from "@/components/glass/slider"
import { Switch } from "@/components/glass/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/glass/tabs"

export function ControlsSampler() {
  const [level, setLevel] = React.useState([62])
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="flex flex-col gap-5">
          <SegmentedControl defaultValue="yes" className="w-full" aria-label="Verdict">
            <SegmentedControlItem value="yes">Did it</SegmentedControlItem>
            <SegmentedControlItem value="partly">Partly</SegmentedControlItem>
            <SegmentedControlItem value="no">Didn’t</SegmentedControlItem>
          </SegmentedControl>
          <Tabs defaultValue="week">
            <TabsList className="w-full">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <BellIcon className="size-4 text-primary" /> Evening reminder
            </span>
            <Switch defaultChecked aria-label="Evening reminder" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col gap-5">
          <Input placeholder="Search your nights" aria-label="Search" />
          <div className="grid gap-3">
            <div className="flex justify-between text-sm">
              Intensity <span className="text-muted-foreground tabular-nums">{level[0]}%</span>
            </div>
            <Slider value={level} onValueChange={setLevel} aria-label="Intensity" />
          </div>
          <Progress value={level[0]} aria-label="Intensity" />
          <div className="flex flex-wrap gap-2">
            <Badge>Kept</Badge>
            <Badge variant="tinted">Work</Badge>
            <Badge variant="glass">Draft</Badge>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col items-center gap-5">
          <ActivityRings size={132} stroke={14} rings={[{ value: level[0] / 100 }, { value: 0.45 }, { value: 0.8 }]} />
          <div className="flex gap-2">
            <Button onClick={() => toast.success("Sealed", { description: "Day 401 · a 3-night chain" })}>Seal</Button>
            <Button variant="glass" onClick={() => toast("Copied")}>
              Copy <Kbd>⌘C</Kbd>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
