import { BoldIcon, ChevronLeftIcon, ChevronRightIcon, ItalicIcon, ShareIcon, UnderlineIcon } from "lucide-react"

import { Button } from "@/components/glass/button"
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/glass/button-group"

export default function ButtonGroupDemo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <ButtonGroup aria-label="Day">
        <Button variant="secondary" size="icon" aria-label="Previous day">
          <ChevronLeftIcon className="rtl:rotate-180" />
        </Button>
        <ButtonGroupText>Sun, 11 Oct</ButtonGroupText>
        <Button variant="secondary" size="icon" aria-label="Next day">
          <ChevronRightIcon className="rtl:rotate-180" />
        </Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Format">
        <Button variant="outline" shape="rounded" size="icon" aria-label="Bold">
          <BoldIcon />
        </Button>
        <Button variant="outline" shape="rounded" size="icon" aria-label="Italic">
          <ItalicIcon />
        </Button>
        <Button variant="outline" shape="rounded" size="icon" aria-label="Underline">
          <UnderlineIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup variant="glass" aria-label="Entry actions">
        <Button variant="ghost">Edit</Button>
        <ButtonGroupSeparator className="my-2" />
        <Button variant="ghost" size="icon" aria-label="Share">
          <ShareIcon />
        </Button>
      </ButtonGroup>
    </div>
  )
}
