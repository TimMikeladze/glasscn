import { BookmarkIcon, StarIcon } from "lucide-react"

import { Toggle } from "@/components/glass/toggle"

export default function ToggleDemo() {
  return (
    <div className="flex items-center gap-3">
      <Toggle aria-label="Favourite" defaultPressed>
        <StarIcon />
      </Toggle>
      <Toggle variant="outline">
        <BookmarkIcon /> Bookmark
      </Toggle>
      <Toggle size="sm" disabled>
        Archived
      </Toggle>
    </div>
  )
}
