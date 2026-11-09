"use client"

import * as React from "react"
import { LiquidGlass02, type LiquidGlass02Scene } from "@/components/blocks/liquid-glass-02"
import { Button } from "@/components/glass/button"

export default function LiquidGlass02Demo() {
  const [scene, setScene] = React.useState<LiquidGlass02Scene>("landmarks")
  return <div className="w-full space-y-4">
    <div role="group" aria-label="Example scene" className="flex flex-wrap gap-2">{(["landmarks", "notes", "search", "materials"] as const).map(value => <Button key={value} size="sm" variant={scene === value ? "secondary" : "ghost"} aria-pressed={scene === value} onClick={() => setScene(value)}>{value[0].toUpperCase()}{value.slice(1)}</Button>)}</div>
    <LiquidGlass02 scene={scene} photoBase="/showcase" />
  </div>
}
