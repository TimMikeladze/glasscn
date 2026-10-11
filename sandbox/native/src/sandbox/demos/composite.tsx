import * as React from "react"
import { View } from "react-native"
import { CircleCheck, Copy, Info, Paperclip, RotateCw, Search, Sprout, ThumbsUp, TriangleAlert } from "lucide-react-native"

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/glass/native/alert"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/glass/native/empty"
import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle } from "@/components/glass/native/item"
import { ScrollArea, ScrollBar } from "@/components/glass/native/scroll-area"
import { Skeleton } from "@/components/glass/native/skeleton"
import { Spinner } from "@/components/glass/native/spinner"

import { Analytics01 } from "@/components/glass/native/analytics-01"
import { Auth01 } from "@/components/glass/native/auth-01"
import { Avatar, AvatarFallback } from "@/components/glass/native/avatar"
import { Backdrop } from "@/components/glass/native/backdrop"
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
import { ChatCodeBlock, ChatMarkdown } from "@/components/glass/native/chat-markdown"
import {
  ChatAction,
  ChatActions,
  ChatAttachment,
  ChatCitation,
  ChatError,
  ChatFile,
  ChatReactions,
  ChatReasoning,
  ChatSources,
  ChatTool,
  renderParts,
  type ChatReaction,
  type ChatUIMessage,
} from "@/components/glass/native/chat-parts"
import { Dashboard01 } from "@/components/glass/native/dashboard-01"
import { createDataTableColumnHelper, DataTable, DataTableColumnHeader, DataTableRowActions, selectColumn, type DataTableState } from "@/components/glass/native/data-table"
import { DropdownMenuItem } from "@/components/glass/native/dropdown-menu"
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
    filterFn: "arrIncludesSome",
    meta: { label: "Activity" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Activity" />,
    cell: (info) => (
      <GText size="sm" weight="500">
        {info.getValue()}
      </GText>
    ),
  }),
  col.accessor("minutes", {
    meta: { numeric: true, label: "Duration" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" align="right" />,
    cell: (info) => (
      <GText size="sm" align="right" style={{ flex: 1 }}>
        {info.getValue()} min
      </GText>
    ),
  }),
  col.accessor("km", {
    sortUndefined: "last",
    meta: { numeric: true, label: "Distance" },
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
  col.display({
    id: "actions",
    enableHiding: false,
    header: () => null,
    cell: ({ row }) => (
      <DataTableRowActions>
        <DropdownMenuItem>Edit {row.original.activity.toLowerCase()}</DropdownMenuItem>
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DataTableRowActions>
    ),
  }),
])

const activityOptions = (["Run", "Ride", "Swim", "Yoga", "Strength", "Walk"] as const).map((a) => ({ label: a, value: a }))
const ACTIVITIES = activityOptions.map((o) => o.value)
// 2,000 generated sessions for the virtual body
const manyWorkouts: Workout[] = Array.from({ length: 2000 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 9, 7) - i * 86400000)
  return w(d.toISOString().slice(0, 10) + `#${i}`, ACTIVITIES[i % 6], 20 + ((i * 37) % 90), i % 3 ? ((i * 13) % 200) / 10 : undefined, 1 + ((i * 7) % 10))
}).map((x) => ({ ...x, date: x.date.slice(0, 10) }))

const plainColumns = col.columns([col.accessor("date", { header: "Day" }), col.accessor("activity", { header: "Activity" }), col.accessor("minutes", { header: "Minutes" })])

function DataTableDemo() {
  const [opened, setOpened] = React.useState<Workout | null>(null)
  const [state, setState] = React.useState<Partial<Pick<DataTableState, "sorting" | "pagination">>>({ sorting: [{ id: "minutes", desc: true }], pagination: { pageIndex: 0, pageSize: 5 } })
  const [failed, setFailed] = React.useState(true)
  return (
    <>
      <Section title="Full" note="Search, faceted filter, view menu, sort, select, row actions, rows per page, first/last.">
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
              filters={[{ column: "activity", title: "Activity", options: activityOptions }]}
              toolbar={(table) => (
                <Button variant="ghost" size="sm" onPress={() => table.resetRowSelection()}>
                  Clear selection
                </Button>
              )}
              initialSorting={[{ id: "date", desc: true }]}
              onRowClick={setOpened}
              empty="No sessions match."
              pageSize={8}
              pageSizes={[4, 8, 20]}
              minColumnWidth={96}
            />
          </CardContent>
        </Card>
      </Section>
      <Section title="Controlled" note={`state + onStateChange: sorting ${state.sorting?.[0]?.id ?? "none"}, page ${(state.pagination?.pageIndex ?? 0) + 1}.`}>
        <Card>
          <CardContent>
            <DataTable columns={plainColumns} data={workouts} getRowId={getRowId} state={state} onStateChange={(c) => setState((s) => ({ ...s, ...c }))} viewOptions labels={{ rowsPerPage: "Per page" }} />
          </CardContent>
        </Card>
      </Section>
      <Section title="Virtual" note="2,000 rows in a FlashList body; no pagination.">
        <Card>
          <CardContent>
            <DataTable columns={plainColumns} data={manyWorkouts} virtual={{ height: 360 }} searchPlaceholder="Search 2,000 sessions…" />
          </CardContent>
        </Card>
      </Section>
      <Section title="Plain" note="String headers, default cells, five per page, no toolbar.">
        <Card>
          <CardContent>
            <DataTable columns={plainColumns} data={workouts} getRowId={getRowId} pageSize={5} />
          </CardContent>
        </Card>
      </Section>
      <Section title="Loading, error, empty">
        <Card>
          <CardContent style={{ gap: 16 }}>
            <DataTable columns={plainColumns} data={[]} loading pageSize={3} />
            <DataTable columns={plainColumns} data={workouts.slice(0, 3)} error={failed ? "Couldn’t load sessions." : undefined} onRetry={() => setFailed(false)} />
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

const OLDER = ["Monday: wrote two lines.", "Tuesday: skipped.", "Wednesday: wrote after the walk."]

function ChatDemo() {
  const ui = useUI()
  const [sent, setSent] = React.useState<string[]>([])
  const [replies, setReplies] = React.useState<string[]>([])
  const [older, setOlder] = React.useState<string[]>([])
  const [draft, setDraft] = React.useState("")
  const [status, setStatus] = React.useState<"ready" | "streaming">("ready")
  const [files, setFiles] = React.useState(["notes.txt", "photo.jpg"])
  const [layout, setLayout] = React.useState<"bubble" | "document">("bubble")
  const reply = (text: string) => {
    setSent((m) => [...m, text])
    setTimeout(() => setReplies((r) => [...r, `Noted: “${text}”.`]), 800)
  }
  return (
    <>
      <Section title="Thread" note="Divider, grouped turns, meta, system bubble, typing, status, suggestions above an inset composer. Scroll up for the liquid “jump to latest” (with unread count); scroll to the top to load older.">
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button size="sm" variant={layout === "bubble" ? "default" : "secondary"} onPress={() => setLayout("bubble")}>
            Bubble
          </Button>
          <Button size="sm" variant={layout === "document" ? "default" : "secondary"} onPress={() => setLayout("document")}>
            Document
          </Button>
        </View>
        <Glass radius={ui.radius.surface} style={{ height: 480, overflow: "hidden" }}>
          <ChatThread layout={layout} hasOlder={older.length < OLDER.length} onLoadOlder={() => setOlder(OLDER)} accessibilityLabel="Conversation with Kai">
            {older.map((text, i) => (
              <ChatMessage key={`o${i}`} from="assistant" avatar={<Coach />} grouped={i > 0}>
                <ChatBubble>{text}</ChatBubble>
              </ChatMessage>
            ))}
            <ChatDivider key="today">Today</ChatDivider>
            <ChatMessage key="a1" from="assistant" avatar={<Coach />} name="Kai">
              <ChatBubble>You wrote every evening this week.</ChatBubble>
            </ChatMessage>
            <ChatMessage key="a2" from="assistant" avatar={<Coach />} grouped>
              <ChatBubble>What made it easier?</ChatBubble>
            </ChatMessage>
            <ChatMessage key="u1" from="user" status="edited">
              <ChatBubble>Writing right after dinner, before the phone.</ChatBubble>
              <ChatMeta time={new Date(2026, 9, 7, 21, 41)} />
            </ChatMessage>
            <ChatMessage key="u2" from="user" grouped status="failed" onRetry={() => setSent((m) => [...m, "Retried"])}>
              <ChatBubble>And no news.</ChatBubble>
            </ChatMessage>
            <ChatMessage key="s1" from="system">
              <ChatBubble>Streak saved · 7 days</ChatBubble>
            </ChatMessage>
            {sent.map((text, i) => (
              <ChatMessage key={`s${i}`} from="user" grouped={i > 0} status={i === sent.length - 1 && replies.length < sent.length ? "sending" : undefined}>
                <ChatBubble>{text}</ChatBubble>
              </ChatMessage>
            ))}
            {replies.map((text, i) => (
              <ChatMessage key={`r${i}`} from="assistant" avatar={<Coach />}>
                <ChatBubble>{text}</ChatBubble>
              </ChatMessage>
            ))}
            <ChatMessage key="typing" from="assistant" avatar={<Coach />}>
              <ChatTyping name="Kai" />
            </ChatMessage>
          </ChatThread>
          <View style={{ gap: 8, paddingBottom: 12 }}>
            <ChatSuggestions onSelect={reply} accessibilityLabel="Quick replies">
              <ChatSuggestion>Keep the same time</ChatSuggestion>
              <ChatSuggestion>Try mornings</ChatSuggestion>
              <ChatSuggestion value="skip">Skip tomorrow</ChatSuggestion>
            </ChatSuggestions>
            <ChatComposer style={{ marginHorizontal: 12, width: "auto" }} placeholder="Reply to Kai" onSubmit={reply} textInputProps={{ testID: "composer" }} />
          </View>
        </Glass>
      </Section>
      <Section title="Bubble variants" note="variant overrides the turn's look.">
        <ChatMessage from="assistant">
          <ChatBubble variant="user">A user-styled bubble on the start side</ChatBubble>
          <ChatBubble variant="system">A system line</ChatBubble>
          <ChatBubble variant="document">A document-layout reply: full width, no bubble.</ChatBubble>
        </ChatMessage>
      </Section>
      <Section title="Floating composer" note="Liquid capsule; controlled value, leading/trailing, attachments, maxLength counter, status → Stop. sticky={false} here (it isn't at the screen's foot).">
        <ChatComposer
          variant="floating"
          sticky={false}
          value={draft}
          onValueChange={setDraft}
          maxLength={80}
          status={status}
          onStop={() => setStatus("ready")}
          onSubmit={(t) => {
            setSent((m) => [...m, t])
            setStatus("streaming")
          }}
          attachments={files.map((f) => (
            <ChatAttachment key={f} name={f} onRemove={() => setFiles((x) => x.filter((y) => y !== f))} uploading={f === "photo.jpg"} />
          ))}
          leading={
            <Button variant="ghost" size="icon-sm" accessibilityLabel="Attach">
              <Paperclip />
            </Button>
          }
          trailing={
            <Badge variant="secondary" style={{ alignSelf: "center" }}>
              Fast
            </Badge>
          }
        />
        <Body>
          Draft: {draft || "—"} · status: {status}
        </Body>
      </Section>
      <Section title="Return sends" note="submitOnEnter: Return submits instead of breaking a line.">
        <ChatComposer submitOnEnter placeholder="Return sends" onSubmit={reply} textInputProps={{ autoCapitalize: "sentences" }} />
      </Section>
      <Section title="Disabled composer">
        <ChatComposer disabled placeholder="Read only" defaultValue="Can't edit this" />
      </Section>
    </>
  )
}

// ── chat parts / markdown ────────────────────────────────────────────────────

const MD = `## Tonight's prompt

Name **one thing** that mattered and _one_ you'd change. Try \`carry\` from [the method](https://example.com).

- Keep it to a line
- Write before the phone
1. Notice
2. Name

> Small is the point.

\`\`\`ts
const entry = { mood: 4, words: 12 }
\`\`\`

An unclosed **bold and a fence
\`\`\`js
streaming()`

const MESSAGE: ChatUIMessage = {
  id: "m1",
  role: "assistant",
  parts: [
    { type: "reasoning", text: "Looked at the last seven evenings.", state: "done" },
    { type: "tool-getStreak", toolCallId: "t1", state: "output-available", input: { days: 7 }, output: { streak: 7 } },
    { type: "text", text: "You're on a **7-day** streak." },
    { type: "source-url", sourceId: "s1", url: "https://example.com/habits", title: "On small habits" },
    { type: "file", mediaType: "image/png", url: "https://picsum.photos/seed/glasscn/240", filename: "chart.png" },
  ],
}

function ChatMarkdownDemo() {
  const [copied, setCopied] = React.useState("")
  return (
    <>
      <Section title="Markdown" note="Headings, lists, quote, inline marks, links, code; repair closes an unfinished stream.">
        <Card>
          <CardContent>
            <ChatMarkdown onCopy={setCopied}>{MD}</ChatMarkdown>
          </CardContent>
        </Card>
        <Body>Copied: {copied ? `${copied.length} chars` : "—"}</Body>
      </Section>
      <Section title="repair={false}">
        <ChatMarkdown repair={false}>{"Unclosed **bold stays raw"}</ChatMarkdown>
      </Section>
      <Section title="Code block" note="language, copy, horizontal scroll.">
        <ChatCodeBlock language="sh" code={"npx shadcn add @glasscn-app/native-chat --overwrite # a long line that scrolls sideways"} onCopy={setCopied} />
        <ChatCodeBlock code="no language, no copy" />
      </Section>
    </>
  )
}

function ChatPartsDemo() {
  const [liked, setLiked] = React.useState(false)
  const [reactions, setReactions] = React.useState<ChatReaction[]>([
    { emoji: "❤️", count: 2, mine: true, label: "Heart" },
    { emoji: "👍", count: 1 },
  ])
  const [approval, setApproval] = React.useState("pending")
  return (
    <>
      <Section title="renderParts" note="An AI SDK UIMessage: reasoning, tool, text, sources, file.">
        <ChatMessage from="assistant">{renderParts(MESSAGE, { reasoningDuration: 4, onToolApproval: (a) => setApproval(a.approved ? "approved" : "denied") })}</ChatMessage>
      </Section>
      <Section title="Reasoning" note="streaming auto-opens; duration labels it when done.">
        <ChatReasoning streaming>Comparing tonight with last week…</ChatReasoning>
        <ChatReasoning duration={12} defaultOpen>
          Seven entries, two short.
        </ChatReasoning>
      </Section>
      <Section title="Tool" note={`Every state; approval: ${approval}.`}>
        <ChatTool name="getWeather" state="input-streaming" input={{ city: "Ber" }} />
        <ChatTool name="getWeather" state="approval-requested" input={{ city: "Berlin" }} onApprove={() => setApproval("approved")} onDeny={() => setApproval("denied")} />
        <ChatTool name="getWeather" state="output-available" input={{ city: "Berlin" }} output={{ temp: 14 }} defaultOpen />
        <ChatTool name="getWeather" state="output-error" errorText="Timed out" />
        <ChatTool name="sendEmail" state="output-denied" />
      </Section>
      <Section title="Sources and citations">
        <ChatSources sources={[{ id: "1", url: "https://example.com/a", title: "On small habits" }, { id: "2", title: "Your journal" }]} defaultOpen />
        <View style={{ flexDirection: "row", gap: 6 }}>
          <ChatCitation index={1} href="https://example.com/a">
            On small habits
          </ChatCitation>
          <ChatCitation index={2} />
        </View>
      </Section>
      <Section title="Files and attachments">
        <ChatFile url="https://picsum.photos/seed/glasscn/240" mediaType="image/jpeg" filename="photo.jpg" />
        <ChatFile url="https://example.com/r.pdf" mediaType="application/pdf" filename="report.pdf" />
        <View style={{ flexDirection: "row", gap: 6 }}>
          <ChatAttachment name="notes.txt" onRemove={() => {}} />
          <ChatAttachment name="photo.jpg" previewUrl="https://picsum.photos/seed/glasscn/96" uploading />
        </View>
      </Section>
      <Section title="Error">
        <ChatError onRetry={() => {}} />
        <ChatError>Rate limited — try again in a minute.</ChatError>
      </Section>
      <Section title="Actions and reactions" note="Reactions are a liquid capsule; actions are ghost icon buttons.">
        <ChatMessage from="assistant">
          <ChatBubble>Seven evenings. That's a habit.</ChatBubble>
          <ChatReactions reactions={reactions} onToggle={(e) => setReactions((rs) => rs.map((r) => (r.emoji === e ? { ...r, mine: !r.mine, count: (r.count ?? 1) + (r.mine ? -1 : 1) } : r)))} />
          <ChatActions>
            <ChatAction label="Copy">
              <Copy />
            </ChatAction>
            <ChatAction label="Regenerate">
              <RotateCw />
            </ChatAction>
            <ChatAction label="Good response" active={liked} onPress={() => setLiked((l) => !l)}>
              <ThumbsUp />
            </ChatAction>
          </ChatActions>
        </ChatMessage>
      </Section>
    </>
  )
}

// ── backdrop ─────────────────────────────────────────────────────────────────

const VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
const PHOTO = "https://picsum.photos/seed/glasscn-backdrop/800/600"

function BackdropFrame({ children, label }: { children: React.ReactNode; label: string }) {
  const ui = useUI()
  return (
    <View style={{ height: 180, borderRadius: ui.radius.surface, overflow: "hidden", justifyContent: "center", alignItems: "center" }}>
      {children}
      <Glass style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <GText weight="600">{label}</GText>
      </Glass>
    </View>
  )
}

function BackdropDemo() {
  return (
    <>
      <Section title="mesh" note="Four chart colours blended.">
        <BackdropFrame label="Mesh">
          <Backdrop />
        </BackdropFrame>
      </Section>
      <Section title="noise" note="The plain ground.">
        <BackdropFrame label="Noise">
          <Backdrop variant="noise" />
        </BackdropFrame>
      </Section>
      <Section title="image + dim" note="Photo cover with a 0.3 scrim; position is web-only.">
        <BackdropFrame label="Image">
          <Backdrop variant="image" src={PHOTO} dim={0.3} position="center top" />
        </BackdropFrame>
      </Section>
      <Section title="video" note="expo-video: muted loop; poster until the first frame; paused under Reduce Motion.">
        <BackdropFrame label="Video">
          <Backdrop variant="video" src={VIDEO} poster={PHOTO} dim={0.2} />
        </BackdropFrame>
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

// ── content ──────────────────────────────────────────────────────────────────

function SpinnerDemo() {
  const ui = useUI()
  return (
    <Section title="Ring, ticks, size, colour, label">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
        <Spinner />
        <Spinner variant="ticks" size="large" />
        <Spinner color={ui.primary} accessibilityLabel="Syncing nights" />
      </View>
    </Section>
  )
}

function SkeletonDemo() {
  return (
    <Section title="A loading row" note="Breathes; still under Reduce Motion.">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }} accessible accessibilityLabel="Loading entry" aria-busy>
        <Skeleton style={{ width: 40, height: 40, borderRadius: 20 }} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton style={{ height: 14, width: "60%" }} />
          <Skeleton style={{ height: 12, width: "90%" }} />
        </View>
      </View>
    </Section>
  )
}

function ScrollAreaDemo() {
  const ui = useUI()
  return (
    <>
      <Section title="Vertical, fixed height">
        <ScrollArea style={{ height: 140, borderRadius: ui.radius.control, backgroundColor: ui.fill }} contentContainerStyle={{ padding: 12, gap: 8 }} nestedScrollEnabled>
          {Array.from({ length: 20 }, (_, i) => (
            <GText key={i} size="sm">{`Night ${i + 1}`}</GText>
          ))}
        </ScrollArea>
      </Section>
      <Section title="Horizontal, edges, ScrollBar for parity">
        <ScrollArea horizontal edges contentContainerStyle={{ gap: 8 }}>
          {Array.from({ length: 12 }, (_, i) => (
            <Badge key={i} variant="secondary">{`Tag ${i + 1}`}</Badge>
          ))}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Section>
    </>
  )
}

function AlertDemo() {
  return (
    <Section title="Variants, with and without icon and action">
      <View style={{ gap: 10 }}>
        <Alert>
          <Info />
          <AlertTitle>Default</AlertTitle>
          <AlertDescription>Your journal syncs every night.</AlertDescription>
        </Alert>
        <Alert variant="info">
          <Info />
          <AlertTitle>Info</AlertTitle>
          <AlertDescription>Reminders are on for 22:30.</AlertDescription>
        </Alert>
        <Alert variant="success">
          <CircleCheck />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Twelve nights in a row.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Couldn't sync</AlertTitle>
          <AlertDescription>Check your connection and try again.</AlertDescription>
          <AlertAction>
            <Button size="sm" variant="outline">
              Retry
            </Button>
          </AlertAction>
        </Alert>
        <Alert>
          <AlertTitle>No icon</AlertTitle>
        </Alert>
      </View>
    </Section>
  )
}

function ItemDemo() {
  const ui = useUI()
  const [pressed, setPressed] = React.useState(0)
  return (
    <>
      <Section title="Variants and sizes">
        <ItemGroup>
          <Item>
            <ItemMedia variant="icon">
              <Sprout size={16} color={ui.foreground} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Default</ItemTitle>
              <ItemDescription>Plain row with icon media.</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Badge>New</Badge>
            </ItemActions>
          </Item>
          <ItemSeparator />
          <Item variant="outline" size="sm">
            <ItemContent>
              <ItemTitle>Outline, small</ItemTitle>
            </ItemContent>
          </Item>
          <Item variant="muted">
            <ItemMedia variant="image">
              <Avatar>
                <AvatarFallback>TM</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Muted with image media</ItemTitle>
              <ItemDescription>A long description that wraps onto a second line and then truncates after two lines so rows stay even.</ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>
      </Section>
      <Section title="Pressable, header and footer" note={`Pressed ${pressed}×`}>
        <Item variant="outline" onPress={() => setPressed((n) => n + 1)}>
          <ItemHeader>
            <GText size="xs" tone="muted">Header</GText>
          </ItemHeader>
          <ItemContent>
            <ItemTitle>Tap the row</ItemTitle>
          </ItemContent>
          <ItemFooter>
            <GText size="xs" tone="muted">Footer</GText>
          </ItemFooter>
        </Item>
      </Section>
    </>
  )
}

function EmptyDemo() {
  return (
    <>
      <Section title="Icon, title, description, action">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Sprout />
            </EmptyMedia>
            <EmptyTitle>No entries yet</EmptyTitle>
            <EmptyDescription>Write tonight's first reflection.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>New entry</Button>
          </EmptyContent>
        </Empty>
      </Section>
      <Section title="Search with no results">
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <Search size={28} />
            </EmptyMedia>
            <EmptyTitle query="sleep paralysis" />
          </EmptyHeader>
        </Empty>
      </Section>
    </>
  )
}

export const demos: Record<string, Demo> = {
  spinner: { title: "Spinner", render: () => <SpinnerDemo /> },
  skeleton: { title: "Skeleton", render: () => <SkeletonDemo /> },
  "scroll-area": { title: "Scroll area", render: () => <ScrollAreaDemo /> },
  alert: { title: "Alert", render: () => <AlertDemo /> },
  item: { title: "Item", render: () => <ItemDemo /> },
  empty: { title: "Empty", render: () => <EmptyDemo /> },
  table: { title: "Table", render: () => <TableDemo /> },
  "data-table": { title: "Data table", render: () => <DataTableDemo /> },
  chat: { title: "Chat", render: () => <ChatDemo /> },
  "chat-markdown": { title: "Chat markdown", render: () => <ChatMarkdownDemo /> },
  "chat-parts": { title: "Chat parts", render: () => <ChatPartsDemo /> },
  backdrop: { title: "Backdrop", render: () => <BackdropDemo /> },
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
