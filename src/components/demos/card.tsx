import { MoreHorizontalIcon } from "lucide-react"

import { Button } from "@/components/glass/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardImage, CardTitle } from "@/components/glass/card"

export default function CardDemo() {
  return (
    <div className="flex w-full flex-wrap items-start gap-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Tonight’s reflection</CardTitle>
          <CardDescription>Two questions, a few minutes.</CardDescription>
          <CardAction>
            <Button variant="ghost" size="icon-sm" aria-label="More">
              <MoreHorizontalIcon />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="text-muted-foreground">What was the most significant thing that happened today?</CardContent>
        <CardFooter>
          <Button className="w-full">Begin</Button>
        </CardFooter>
      </Card>
      {/* the whole card is the link, with a press state */}
      <Card asChild material="thick" className="w-full max-w-60">
        <a href="#card-hero">
          <CardImage>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/backdrop-demo.svg" alt="" />
          </CardImage>
          <CardHeader>
            <CardTitle>Evening walk</CardTitle>
            <CardDescription>A thick pane, a hero image.</CardDescription>
          </CardHeader>
        </a>
      </Card>
      {/* solid: opaque, no blur — for dense screens */}
      <Card material="solid" size="sm" className="w-full max-w-60">
        <CardHeader>
          <CardTitle>Solid material</CardTitle>
          <CardDescription>Opaque card colour for long tables and dense dashboards.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
