"use client"

import * as React from "react"
import { LayoutGridIcon, ListIcon } from "lucide-react"

import { SegmentedControl, SegmentedControlItem } from "@/components/glass/segmented-control"

export default function SegmentedControlDemo() {
  const [verdict, setVerdict] = React.useState("yes")
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <SegmentedControl value={verdict} onValueChange={setVerdict} size="lg" className="w-full" aria-label="Did you follow through?">
        <SegmentedControlItem value="yes">Did it</SegmentedControlItem>
        <SegmentedControlItem value="partly">Partly</SegmentedControlItem>
        <SegmentedControlItem value="no">Didn’t</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl defaultValue="list" aria-label="View">
        <SegmentedControlItem value="list" aria-label="List">
          <ListIcon />
        </SegmentedControlItem>
        <SegmentedControlItem value="grid" aria-label="Grid">
          <LayoutGridIcon />
        </SegmentedControlItem>
      </SegmentedControl>
    </div>
  )
}
