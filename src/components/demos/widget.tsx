import { FlameIcon } from "lucide-react"

import { ActivityRings } from "@/components/glass/activity-rings"
import { Sparkline } from "@/components/glass/sparkline"
import { Widget, WidgetContent, WidgetDescription, WidgetHeader, WidgetTitle, WidgetValue } from "@/components/glass/widget"

const week = [3, 5, 4, 6, 8, 7, 9]

export default function WidgetDemo() {
  return (
    <div className="flex w-full max-w-3xl flex-wrap items-start gap-4">
      <Widget size="small">
        <WidgetHeader>
          <FlameIcon className="size-3.5 text-primary" aria-hidden />
          <WidgetTitle>Chain</WidgetTitle>
        </WidgetHeader>
        <WidgetValue>18 nights</WidgetValue>
        <WidgetDescription>Best this year</WidgetDescription>
        <WidgetContent className="justify-end">
          <Sparkline data={week} height={40} />
        </WidgetContent>
      </Widget>
      <Widget size="medium">
        <WidgetContent className="flex-row items-center gap-4">
          <ActivityRings size={120} stroke={14} rings={[{ value: 0.82, label: "Move" }, { value: 1.3, label: "Exercise" }, { value: 0.5, label: "Stand" }]} />
          <div className="grid gap-1">
            <WidgetTitle>Activity</WidgetTitle>
            <WidgetValue>412 kcal</WidgetValue>
            <WidgetDescription>39 of 30 exercise minutes</WidgetDescription>
          </div>
        </WidgetContent>
      </Widget>
      <div className="flex items-center gap-4">
        <Widget size="circular" aria-label="Chain: 18 nights">
          <FlameIcon className="size-4" aria-hidden />
          <WidgetValue>18</WidgetValue>
        </Widget>
        <Widget size="rectangular">
          <WidgetTitle>Next session</WidgetTitle>
          <WidgetValue>Run · 6:30</WidgetValue>
        </Widget>
        <Widget size="inline">
          <FlameIcon className="size-3.5" aria-hidden />
          <WidgetDescription className="text-foreground">18-night chain</WidgetDescription>
        </Widget>
      </div>
      <Widget size="small" accented>
        <WidgetTitle>Accented</WidgetTitle>
        <WidgetValue>7,412</WidgetValue>
        <WidgetContent className="justify-end">
          <Sparkline data={week} height={40} />
        </WidgetContent>
      </Widget>
    </div>
  )
}
