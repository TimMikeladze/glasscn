import { NotebookPenIcon, SearchXIcon } from "lucide-react"

import { Button } from "@/components/glass/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/glass/empty"

export default function EmptyDemo() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <Empty className="bg-fill">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <NotebookPenIcon />
          </EmptyMedia>
          <EmptyTitle>No entries yet</EmptyTitle>
          <EmptyDescription>Your first entry starts the streak.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>Write today’s entry</Button>
        </EmptyContent>
      </Empty>
      <Empty className="bg-fill">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle query="lighthouse" />
          <EmptyDescription>Check the spelling or search all years.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
