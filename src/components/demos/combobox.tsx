"use client"

import * as React from "react"

import { Combobox, type ComboboxOption } from "@/components/glass/combobox"
import { Label } from "@/components/glass/label"

const MOODS: ComboboxOption[] = [
  { value: "calm", label: "Calm" },
  { value: "grateful", label: "Grateful" },
  { value: "restless", label: "Restless" },
  { value: "tired", label: "Tired", keywords: ["sleepy"] },
  { value: "proud", label: "Proud" },
]

const TAGS: ComboboxOption[] = [
  { value: "family", label: "Family", group: "People" },
  { value: "friends", label: "Friends", group: "People" },
  { value: "work", label: "Work", group: "Places" },
  { value: "home", label: "Home", group: "Places" },
  { value: "outdoors", label: "Outdoors", group: "Places" },
  { value: "reading", label: "Reading", group: "Habits" },
  { value: "running", label: "Running", group: "Habits" },
]

/** A single pick and a multi-pick token field. */
export default function ComboboxDemo() {
  const [mood, setMood] = React.useState("calm")
  const [tags, setTags] = React.useState(["family", "reading"])
  return (
    <div className="glass flex w-full max-w-sm flex-col gap-4 rounded-surface p-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="mood">Mood</Label>
        <Combobox id="mood" options={MOODS} value={mood} onValueChange={setMood} placeholder="How was today?" searchPlaceholder="Search moods…" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="tags">Tags</Label>
        <Combobox id="tags" multiple options={TAGS} value={tags} onValueChange={setTags} placeholder="Add tags" searchPlaceholder="Search tags…" aria-label="Tags" />
      </div>
    </div>
  )
}
