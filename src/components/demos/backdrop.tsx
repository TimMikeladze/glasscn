"use client"

import * as React from "react"

import { Backdrop } from "@/components/glass/backdrop"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/segmented-control"

const variants = ["mesh", "noise", "image"] as const

export default function BackdropDemo() {
  const [variant, setVariant] = React.useState<(typeof variants)[number]>("mesh")
  return (
    <div className="grid w-full max-w-xl gap-3">
      <SegmentedControl value={variant} onValueChange={(v) => setVariant(v as (typeof variants)[number])} aria-label="Backdrop">
        {variants.map((v) => (
          <SegmentedControlItem key={v} value={v}>
            {v}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
      <div className="relative isolate grid h-72 place-items-center overflow-hidden rounded-surface">
        <Backdrop
          className="absolute z-0"
          variant={variant}
          src="/backdrop-demo.svg"
          dim={variant === "image" ? 0.2 : 0}
        />
        <Card className="relative w-64">
          <CardHeader>
            <CardTitle>Glass on a {variant}</CardTitle>
            <CardDescription>Liquid Glass reads best over real content.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
