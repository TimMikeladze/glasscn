"use client"

import * as React from "react"

import { Stepper } from "@/components/glass/stepper"

export default function StepperDemo() {
  const [cups, setCups] = React.useState(3)
  return (
    <div className="flex w-full max-w-xs items-center justify-between gap-4 rounded-control bg-fill px-pad-sm py-2">
      <div className="grid text-sm">
        <span className="font-medium" id="water-label">
          Water
        </span>
        <span className="text-muted-foreground numeric-glass" aria-hidden>
          {cups} {cups === 1 ? "cup" : "cups"}
        </span>
      </div>
      <Stepper aria-labelledby="water-label" value={cups} onValueChange={setCups} min={0} max={12} formatValue={(v) => `${v} ${v === 1 ? "cup" : "cups"}`} />
    </div>
  )
}
