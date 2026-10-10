import * as React from "react"
import { View } from "react-native"
import { Paperclip, Sprout } from "lucide-react-native"

import { Analytics01 } from "@/components/glass/native/analytics-01"
import { Auth01 } from "@/components/glass/native/auth-01"
import { Avatar, AvatarFallback } from "@/components/glass/native/avatar"
import { Badge } from "@/components/glass/native/badge"
import { Button } from "@/components/glass/native/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/native/card"
import {
  ChatBubble,
  ChatComposer,
  ChatDivider,
  ChatMessage,
  ChatMeta,
  ChatSuggestion,
  ChatSuggestions,
  ChatThread,
  ChatTyping,
} from "@/components/glass/native/chat"
import { Chat01 } from "@/components/glass/native/chat-01"
import { Dashboard01 } from "@/components/glass/native/dashboard-01"
import { createDataTableColumnHelper, DataTable, DataTableColumnHeader, selectColumn } from "@/components/glass/native/data-table"
import { Glass } from "@/components/glass/native/glass"
import { Settings01 } from "@/components/glass/native/settings-01"
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/glass/native/table"
import { GText, alpha, useUI } from "@/components/glass/native/ui"
import { Body, Section } from "@/sandbox/ui"
import type { Demo } from "@/sandbox/demos/types"

// ── table ────────────────────────────────────────────────────────────────────

const week = [
  { day: "Monday", ritual: "Morning pages", minutes: 20, streak: 41 },
  { day: "Tuesday", ritual: "Evening reflection", minutes: 12, streak: 42 },
  { day: "Wednesday", ritual: "Morning pages", minutes: 25, streak: 43 },
  { day: "Thursday", ritual: "Gratitude list", minutes: 8, streak: 44 },
  { day: "Friday", ritual: "Evening reflection", minutes: 15, streak: 45 },
]

function TableDemo() {
  const [selected, setSelected] = React.useState<string | null>("Wednesday")
  const total = week.reduce((sum, d) => sum + d.minutes, 0)
  return (
    <>
      <Section title="In a card" note="Caption, header, body, footer with colSpan; right-aligned numerals.">
        <Card>
          <CardHeader>
            <CardTitle>This week</CardTitle>
            <CardDescription>Five entries, one unbroken chain.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Minutes spent writing, by day.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead colSpan={1.4}>Ritual</TableHead>
                  <TableHead align="right">Minutes</TableHead>
                  <TableHead align="right">Streak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {week.map((d) => (
                  <TableRow key={d.day}>
                    <TableCell weight="500">{d.day}</TableCell>
                    <TableCell colSpan={1.4} tone="muted">
                      {d.ritual}
                    </TableCell>
                    <TableCell align="right">{d.minutes}</TableCell>
                    <TableCell align="right">{d.streak} days</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2.4}>Total</TableCell>
                  <TableCell align="right">{total}</TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      </Section>
      <Section title="Selectable rows" note="onPress makes a row pressable; selected fills it.">
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead align="right">Minutes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {week.map((d) => (
                  <TableRow key={d.day} selected={selected === d.day} onPress={() => setSelected(d.day)}>
                    <TableCell>{d.day}</TableCell>
                    <TableCell align="right">{d.minutes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Section>
      <Section title="Wide" note="minWidth past the screen: scrolls sideways.">
        <Card>
          <CardContent>
            <Table minWidth={720}>
              <TableHeader>
                <TableRow>
                  {["Day", "Ritual", "Minutes", "Streak", "Mood", "Sleep"].map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {week.map((d) => (
                  <TableRow key={d.day}>
                    <TableCell>{d.day}</TableCell>
                    <TableCell>{d.ritual}</TableCell>
                    <TableCell>{d.minutes}</TableCell>
                    <TableCell>{d.streak}</TableCell>
                    <TableCell>Calm</TableCell>
                    <TableCell>7.4 h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Section>
    </>
  )
}

// ── data-table ───────────────────────────────────────────────────────────────

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
    cell: (info) => (
      <GText size="sm" weight="500">
        {info.getValue()}
      </GText>
    ),
  }),
  col.accessor("minutes", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" align="right" />,
    cell: (info) => (
      <GText size="sm" align="right" style={{ flex: 1 }}>
        {info.getValue()} min
      </GText>
    ),
  }),
  col.accessor("km", {
    sortUndefined: "last",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Distance" align="right" />,
    cell: (info) => {
      const km = info.getValue()
      return (
        <GText size="sm" align="right" tone={km === undefined ? "muted" : "default"} style={{ flex: 1 }}>
          {km === undefined ? "—" : `${km.toFixed(1)} km`}
        </GText>
      )
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

const plainColumns = col.columns([col.accessor("date", { header: "Day" }), col.accessor("activity", { header: "Activity" }), col.accessor("minutes", { header: "Minutes" })])

function DataTableDemo() {
  const [opened, setOpened] = React.useState<Workout | null>(null)
  return (
    <>
      <Section title="Full" note="Search, sort (press a header), select, paginate, press a row.">
        <Card>
          <CardHeader>
            <CardTitle>Training log</CardTitle>
            <CardDescription>{opened ? `Opened ${opened.activity.toLowerCase()} on ${dateFormat.format(new Date(opened.date))}.` : "Four weeks of sessions. Press a row to open it."}</CardDescription>
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
              pageSize={8}
            />
          </CardContent>
        </Card>
      </Section>
      <Section title="Plain" note="String headers, default cells, five per page, no search.">
        <Card>
          <CardContent>
            <DataTable columns={plainColumns} data={workouts} getRowId={getRowId} pageSize={5} />
          </CardContent>
        </Card>
      </Section>
      <Section title="Empty">
        <Card>
          <CardContent>
            <DataTable columns={plainColumns} data={[]} empty="Nothing logged yet." />
          </CardContent>
        </Card>
      </Section>
    </>
  )
}

// ── chat ─────────────────────────────────────────────────────────────────────

function Coach() {
  const ui = useUI()
  return (
    <Avatar>
      <AvatarFallback style={{ backgroundColor: alpha(ui.primary, 0.16) }}>
        <Sprout color={ui.primary} />
      </AvatarFallback>
    </Avatar>
  )
}

function ChatDemo() {
  const ui = useUI()
  const [sent, setSent] = React.useState<string[]>([])
  const [draft, setDraft] = React.useState("")
  return (
    <>
      <Section title="Thread" note="Divider, grouped turns, meta, system bubble, typing, suggestions, inset composer. Scroll up for “jump to latest”.">
        <Glass radius={ui.radius.surface} style={{ height: 480, overflow: "hidden" }}>
          <ChatThread style={{ flex: 1 }}>
            <ChatDivider>Today</ChatDivider>
            <ChatMessage from="assistant" avatar={<Coach />}>
              <ChatBubble>You wrote every evening this week.</ChatBubble>
            </ChatMessage>
            <ChatMessage from="assistant" avatar={<Coach />} grouped>
              <ChatBubble>What made it easier?</ChatBubble>
            </ChatMessage>
            <ChatMessage from="user">
              <ChatBubble>Writing right after dinner, before the phone.</ChatBubble>
              <ChatMeta>Read 9:41 PM</ChatMeta>
            </ChatMessage>
            <ChatMessage from="system">
              <ChatBubble>Streak saved · 7 days</ChatBubble>
            </ChatMessage>
            {sent.map((text, i) => (
              <ChatMessage key={i} from="user" grouped={i > 0}>
                <ChatBubble>{text}</ChatBubble>
              </ChatMessage>
            ))}
            <ChatMessage key="typing" from="assistant" avatar={<Coach />}>
              <ChatTyping name="Kai" />
            </ChatMessage>
          </ChatThread>
          <View style={{ gap: 8, paddingBottom: 12 }}>
            <ChatSuggestions onSelect={(s) => setSent((m) => [...m, s])}>
              <ChatSuggestion>Keep the same time</ChatSuggestion>
              <ChatSuggestion>Try mornings</ChatSuggestion>
              <ChatSuggestion>Skip tomorrow</ChatSuggestion>
            </ChatSuggestions>
            <ChatComposer style={{ marginHorizontal: 12, width: "auto" }} placeholder="Reply to Kai" onSubmit={(text) => setSent((m) => [...m, text])} />
          </View>
        </Glass>
      </Section>
      <Section title="Bubble variants" note="variant overrides the turn's look.">
        <ChatMessage from="assistant">
          <ChatBubble variant="user">A user-styled bubble on the left</ChatBubble>
          <ChatBubble variant="system">A system line</ChatBubble>
        </ChatMessage>
      </Section>
      <Section title="Floating composer" note="Controlled value, a leading button.">
        <ChatComposer
          variant="floating"
          value={draft}
          onValueChange={setDraft}
          onSubmit={(t) => setSent((m) => [...m, t])}
          leading={
            <Button variant="ghost" size="icon-sm" accessibilityLabel="Attach">
              <Paperclip />
            </Button>
          }
        />
        <Body>Draft: {draft || "—"}</Body>
      </Section>
      <Section title="Disabled composer">
        <ChatComposer disabled placeholder="Read only" />
      </Section>
    </>
  )
}

// ── blocks ───────────────────────────────────────────────────────────────────

function Auth01Demo() {
  const [last, setLast] = React.useState("Nothing yet")
  return (
    <>
      <Section title="Sign in" note="Submits only with both fields filled.">
        <Auth01
          onSubmit={({ email }) => setLast(`Signed in as ${email}`)}
          onForgot={() => setLast("Forgot password")}
          onCreateAccount={() => setLast("Create account")}
          onPasskey={() => setLast("Passkey")}
        />
      </Section>
      <Body>Last action: {last}</Body>
    </>
  )
}

export const demos: Record<string, Demo> = {
  table: { title: "Table", render: () => <TableDemo /> },
  "data-table": { title: "Data table", render: () => <DataTableDemo /> },
  chat: { title: "Chat", render: () => <ChatDemo /> },
  "dashboard-01": {
    title: "Dashboard",
    render: () => (
      <Section title="Dashboard 01" note="Two columns at 768pt and up.">
        <Dashboard01 />
      </Section>
    ),
  },
  "analytics-01": {
    title: "Analytics",
    render: () => (
      <Section title="Analytics 01" note="Three columns at 1024pt and up; range drives every card.">
        <Analytics01 />
      </Section>
    ),
  },
  "settings-01": {
    title: "Settings",
    render: () => (
      <Section title="Settings 01">
        <Settings01 />
      </Section>
    ),
  },
  "auth-01": { title: "Sign in", render: () => <Auth01Demo /> },
  "chat-01": {
    title: "Chat block",
    render: () => (
      <Section title="Chat 01" note="Send or pick a quick reply: delivered → read → typing → reply.">
        <Chat01 height={560} />
      </Section>
    ),
  },
}
