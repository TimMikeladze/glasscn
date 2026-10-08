"use client"

import * as React from "react"

import { Checkbox } from "@/components/glass/checkbox"
import { Label } from "@/components/glass/label"

const habits = [
  { id: "pages", label: "Morning pages" },
  { id: "walk", label: "A walk outside" },
  { id: "reflect", label: "Evening reflection" },
]

export default function CheckboxDemo() {
  const [done, setDone] = React.useState<Record<string, boolean>>({ pages: true })
  const count = habits.filter((h) => done[h.id]).length
  const all = count === habits.length ? true : count > 0 ? "indeterminate" : false

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3">
        <Checkbox
          id="habit-all"
          checked={all}
          onCheckedChange={(value) => setDone(Object.fromEntries(habits.map((h) => [h.id, value === true])))}
        />
        <Label htmlFor="habit-all">Today’s habits</Label>
      </div>
      <div className="grid gap-3 pl-7">
        {habits.map((h) => (
          <div key={h.id} className="flex items-center gap-3">
            <Checkbox id={`habit-${h.id}`} checked={!!done[h.id]} onCheckedChange={(value) => setDone((d) => ({ ...d, [h.id]: value === true }))} />
            <Label htmlFor={`habit-${h.id}`}>{h.label}</Label>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="habit-disabled" disabled />
        <Label htmlFor="habit-disabled">Rest day (locked)</Label>
      </div>
    </div>
  )
}
