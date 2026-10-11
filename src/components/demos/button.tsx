"use client"

import * as React from "react"
import { ArrowRightIcon, PenIcon, PlusIcon, SendIcon, Trash2Icon } from "lucide-react"

import { Button, PullDownButton, SplitButton } from "@/components/glass/button"

export default function ButtonDemo() {
  const [sending, setSending] = React.useState(false)
  return (
    <div className="flex max-w-xl flex-wrap items-center justify-center gap-3">
      <Button>
        <PenIcon data-icon="inline-start" /> Write tonight
      </Button>
      <Button variant="glass">Glass</Button>
      <Button variant="prominent">Prominent</Button>
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
      <Button size="icon" variant="glass" aria-label="Add">
        <PlusIcon />
      </Button>
      <Button
        loading={sending}
        onClick={() => {
          setSending(true)
          setTimeout(() => setSending(false), 1600)
        }}
      >
        <SendIcon data-icon="inline-start" /> Send
      </Button>
      <PullDownButton variant="secondary">Sort by</PullDownButton>
      <SplitButton>
        <Button variant="tinted">Save</Button>
        <PullDownButton variant="tinted" size="icon" aria-label="More save options" />
      </SplitButton>
      <Button shape="rounded" variant="glass">
        Rounded
      </Button>
      <Button variant="glass" disabled>
        Disabled
      </Button>
    </div>
  )
}
