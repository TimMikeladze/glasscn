"use client"

import * as React from "react"
import { ArrowUpIcon, EyeIcon, EyeOffIcon, SearchIcon, XIcon } from "lucide-react"

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "@/components/glass/input-group"

export default function InputGroupDemo() {
  const [query, setQuery] = React.useState("sunrise")
  const [reveal, setReveal] = React.useState(false)
  return (
    <div className="grid w-full max-w-sm gap-4">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput type="search" aria-label="Search entries" placeholder="Search entries" value={query} onChange={(e) => setQuery(e.target.value)} />
        {query ? (
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => setQuery("")}>
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
      <InputGroup>
        <InputGroupInput type={reveal ? "text" : "password"} aria-label="Journal passcode" defaultValue="lavender" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label={reveal ? "Hide passcode" : "Show passcode"} aria-pressed={reveal} onClick={() => setReveal((r) => !r)}>
            {reveal ? <EyeOffIcon /> : <EyeIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput type="number" aria-label="Daily goal" defaultValue={500} />
        <InputGroupAddon align="inline-end">
          <InputGroupText>words</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea aria-label="Quick note" placeholder="Jot something down…" />
        <InputGroupAddon align="block-end" className="justify-between">
          <InputGroupText>Saved to Today</InputGroupText>
          <InputGroupButton variant="default" size="icon-sm" className="ms-auto" aria-label="Save note">
            <ArrowUpIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
