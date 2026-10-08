import { FlameIcon } from "lucide-react"

import { Badge } from "@/components/glass/badge"

export default function BadgeDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Badge>Kept</Badge>
      <Badge variant="tinted">
        <FlameIcon /> 12-night chain
      </Badge>
      <Badge variant="glass">Glass</Badge>
      <Badge variant="secondary">Work</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Missed</Badge>
    </div>
  )
}
