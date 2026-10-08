import { ArrowRightIcon, PenIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/glass/button"

export default function ButtonDemo() {
  return (
    <div className="flex max-w-xl flex-wrap items-center justify-center gap-3">
      <Button>
        <PenIcon data-icon="inline-start" /> Write tonight
      </Button>
      <Button variant="glass">Glass</Button>
      <Button variant="tinted">Tinted</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">
        <Trash2Icon data-icon="inline-start" /> Delete
      </Button>
      <Button variant="link">
        Learn more <ArrowRightIcon data-icon="inline-end" />
      </Button>
      <Button size="icon" aria-label="Add">
        <PlusIcon />
      </Button>
      <Button shape="rounded" variant="glass">
        Rounded
      </Button>
    </div>
  )
}
