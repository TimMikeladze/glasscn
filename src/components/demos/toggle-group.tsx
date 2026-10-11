import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react"

import { ToggleGroup, ToggleGroupItem } from "@/components/glass/toggle-group"

export default function ToggleGroupDemo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <ToggleGroup type="single" variant="outline" defaultValue="start" aria-label="Alignment">
        <ToggleGroupItem value="start" aria-label="Align start">
          <AlignLeftIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenterIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="end" aria-label="Align end">
          <AlignRightIcon />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="multiple" spacing={2} defaultValue={["walk", "read"]} aria-label="Today's habits">
        <ToggleGroupItem value="walk">Walk</ToggleGroupItem>
        <ToggleGroupItem value="read">Read</ToggleGroupItem>
        <ToggleGroupItem value="stretch">Stretch</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
