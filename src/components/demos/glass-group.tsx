"use client"

import * as React from "react"
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react"

import { GlassGroup, GlassGroupItem } from "@/components/glass/glass-group"

export default function GlassGroupDemo() {
  const [align, setAlign] = React.useState("left")
  const [marks, setMarks] = React.useState<string[]>(["bold"])
  const toggle = (m: string) => setMarks((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]))
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <GlassGroup aria-label="Text style">
        <GlassGroupItem aria-label="Bold" selected={marks.includes("bold")} onClick={() => toggle("bold")}>
          <BoldIcon />
        </GlassGroupItem>
        <GlassGroupItem aria-label="Italic" selected={marks.includes("italic")} onClick={() => toggle("italic")}>
          <ItalicIcon />
        </GlassGroupItem>
        <GlassGroupItem aria-label="Underline" selected={marks.includes("underline")} onClick={() => toggle("underline")}>
          <UnderlineIcon />
        </GlassGroupItem>
      </GlassGroup>
      <GlassGroup indicator aria-label="Alignment">
        {[
          ["left", AlignLeftIcon],
          ["center", AlignCenterIcon],
          ["right", AlignRightIcon],
        ].map(([value, Icon]) => {
          const I = Icon as typeof AlignLeftIcon
          return (
            <GlassGroupItem key={value as string} aria-label={`Align ${value}`} selected={align === value} onClick={() => setAlign(value as string)}>
              <I />
            </GlassGroupItem>
          )
        })}
      </GlassGroup>
    </div>
  )
}
