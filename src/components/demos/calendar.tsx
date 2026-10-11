"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"

import { Calendar } from "@/components/glass/calendar"

/** A single day, and a trip as a range with dropdown captions. */
export default function CalendarDemo() {
  const [day, setDay] = React.useState<Date | undefined>(() => new Date())
  const [trip, setTrip] = React.useState<DateRange | undefined>(() => {
    const from = new Date()
    from.setDate(from.getDate() + 3)
    const to = new Date(from)
    to.setDate(to.getDate() + 4)
    return { from, to }
  })
  return (
    <div className="flex flex-wrap items-start justify-center gap-4">
      <div className="glass rounded-surface p-2">
        <Calendar mode="single" selected={day} onSelect={setDay} />
      </div>
      <div className="glass rounded-surface p-2">
        <Calendar mode="range" selected={trip} onSelect={setTrip} captionLayout="dropdown" defaultMonth={trip?.from} />
      </div>
    </div>
  )
}
