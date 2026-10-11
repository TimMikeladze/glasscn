import { BellIcon, FlameIcon, InboxIcon } from "lucide-react"

import { Badge, BadgeCount } from "@/components/glass/badge"
import { Button } from "@/components/glass/button"

export default function BadgeDemo() {
  return (
    <div className="flex flex-col items-center gap-6">
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
      <div className="flex items-center gap-4">
        <Button variant="glass" size="icon" aria-label="Inbox" className="relative">
          <InboxIcon />
          <BadgeCount count={3} label="unread" />
        </Button>
        <Button variant="glass" size="icon" aria-label="Notifications" className="relative">
          <BellIcon />
          <BadgeCount label="new" />
        </Button>
      </div>
    </div>
  )
}
