"use client"

import * as React from "react"

import { Badge } from "@/components/glass/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
import { createDataTableColumnHelper, DataTable, DataTableColumnHeader, selectColumn } from "@/components/glass/data-table"

type Workout = {
  id: string
  date: string
  activity: "Run" | "Ride" | "Swim" | "Yoga" | "Strength" | "Walk"
  minutes: number
  km?: number
  effort: number
}

const w = (date: string, activity: Workout["activity"], minutes: number, km: number | undefined, effort: number): Workout => ({ id: date, date, activity, minutes, km, effort })

const workouts: Workout[] = [
  w("2026-10-07", "Run", 42, 7.8, 7),
  w("2026-10-06", "Yoga", 30, undefined, 3),
  w("2026-10-05", "Ride", 95, 38.4, 6),
  w("2026-10-04", "Strength", 50, undefined, 8),
  w("2026-10-03", "Walk", 35, 3.1, 2),
  w("2026-10-02", "Swim", 40, 1.6, 6),
  w("2026-10-01", "Run", 58, 10.2, 8),
  w("2026-09-30", "Yoga", 25, undefined, 2),
  w("2026-09-29", "Strength", 45, undefined, 7),
  w("2026-09-28", "Ride", 120, 51.7, 7),
  w("2026-09-27", "Run", 36, 6.4, 5),
  w("2026-09-26", "Walk", 60, 5.2, 3),
  w("2026-09-25", "Swim", 45, 1.9, 7),
  w("2026-09-24", "Run", 75, 13.1, 9),
  w("2026-09-23", "Yoga", 40, undefined, 3),
  w("2026-09-22", "Strength", 55, undefined, 8),
  w("2026-09-21", "Ride", 80, 31.2, 6),
  w("2026-09-20", "Walk", 45, 3.9, 2),
  w("2026-09-19", "Run", 30, 5.5, 6),
  w("2026-09-18", "Swim", 35, 1.4, 5),
  w("2026-09-17", "Strength", 40, undefined, 7),
  w("2026-09-16", "Run", 48, 8.6, 7),
  w("2026-09-15", "Yoga", 60, undefined, 4),
  w("2026-09-14", "Ride", 150, 64.0, 8),
  w("2026-09-13", "Walk", 50, 4.4, 2),
  w("2026-09-12", "Run", 90, 16.0, 9),
  w("2026-09-11", "Strength", 35, undefined, 6),
  w("2026-09-10", "Swim", 50, 2.2, 7),
]

const getRowId = (workout: Workout) => workout.id

const dateFormat = new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })

const col = createDataTableColumnHelper<Workout>()
const columns = col.columns([
  selectColumn<Workout>(),
  col.accessor("date", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: (info) => dateFormat.format(new Date(info.getValue())),
  }),
  col.accessor("activity", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Activity" />,
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  col.accessor("minutes", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" className="justify-end" />,
    cell: (info) => <div className="text-right">{info.getValue()} min</div>,
  }),
  col.accessor("km", {
    sortUndefined: "last",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Distance" className="justify-end" />,
    cell: (info) => {
      const km = info.getValue()
      return <div className="text-right">{km === undefined ? <span className="text-muted-foreground">—</span> : `${km.toFixed(1)} km`}</div>
    },
  }),
  col.accessor("effort", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Effort" />,
    cell: (info) => {
      const effort = info.getValue()
      return (
        <Badge variant={effort >= 8 ? "tinted" : "secondary"}>
          {effort}/10{effort >= 8 ? " · hard" : ""}
        </Badge>
      )
    },
  }),
])

export default function DataTableDemo() {
  const [opened, setOpened] = React.useState<Workout | null>(null)
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Training log</CardTitle>
        <CardDescription>{opened ? `Opened ${opened.activity.toLowerCase()} on ${dateFormat.format(new Date(opened.date))}.` : "Four weeks of sessions. Click a row to open it."}</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={workouts}
          getRowId={getRowId}
          searchPlaceholder="Search sessions…"
          initialSorting={[{ id: "date", desc: true }]}
          onRowClick={setOpened}
          empty="No sessions match."
        />
      </CardContent>
    </Card>
  )
}
