import { MoreHorizontalIcon } from "lucide-react"

import { Button } from "@/components/glass/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/glass/card"

export default function CardDemo() {
  return (
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
  )
}
