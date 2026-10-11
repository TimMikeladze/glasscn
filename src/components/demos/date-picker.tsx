"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"

import { DatePicker } from "@/components/glass/date-picker"
import { Label } from "@/components/glass/label"

/** iOS's compact date button, a form field with a range, and a date and time on 15-minute steps. */
export default function DatePickerDemo() {
  const [day, setDay] = React.useState<Date | undefined>(() => new Date())
  const [trip, setTrip] = React.useState<DateRange | undefined>()
  const [reminder, setReminder] = React.useState<Date | undefined>(() => {
    const d = new Date()
    d.setHours(21, 30, 0, 0)
    return d
  })
  return (
    <div className="glass flex w-full max-w-sm flex-col gap-4 rounded-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm">Entry date</span>
        <DatePicker value={day} onValueChange={setDay} aria-label="Entry date" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="trip">Trip</Label>
        <DatePicker id="trip" mode="range" variant="field" value={trip} onValueChange={setTrip} placeholder="Pick dates" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm">Remind me</span>
        <DatePicker time minuteStep={15} value={reminder} onValueChange={setReminder} aria-label="Reminder" />
      </div>
    </div>
  )
}
