"use client"

import * as React from "react"
import { EllipsisIcon, PlusIcon, SproutIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/glass/avatar"
import { Button } from "@/components/glass/button"
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
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
} from "@/components/glass/chat"

interface Message {
  id: number
  from: "user" | "assistant"
  text: string
  time: string
}

const SEED: Message[] = [
  { id: 1, from: "assistant", text: "Morning, Sam. Three evenings in a row — your longest run since March.", time: "8:02 AM" },
  { id: 2, from: "assistant", text: "Want to set tonight's intention while it's fresh?", time: "8:02 AM" },
  { id: 3, from: "user", text: "Yes — something small.", time: "8:13 AM" },
  { id: 4, from: "user", text: "Last week I aimed too big and skipped two nights.", time: "8:14 AM" },
  { id: 5, from: "assistant", text: "Small is the point. One line before bed: what went well today?", time: "8:14 AM" },
]

const SUGGESTIONS = ["Remind me at 9", "Make it even smaller", "How's my streak?"]

const REPLIES = [
  "Done. I'll nudge you once at 9:00 PM — and stay quiet if you've already written.",
  "Then just a word. One word about today still counts as showing up.",
  "Three days, 41 entries this year. Tonight makes it four.",
  "Noted. Small steps, every evening — that's the whole method.",
]

const now = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })

const coach = (
  <Avatar>
    <AvatarFallback className="bg-primary/16 text-primary">
      <SproutIcon />
    </AvatarFallback>
  </Avatar>
)

/** A coach conversation: day divider, grouped turns, read receipt, typing that resolves into a reply, quick replies and a floating composer. */
export function Chat01() {
  const [messages, setMessages] = React.useState(SEED)
  const [suggestions, setSuggestions] = React.useState(SUGGESTIONS)
  const [typing, setTyping] = React.useState(false)
  const [read, setRead] = React.useState(true)
  const timers = React.useRef<number[]>([])
  const replies = React.useRef(0)

  React.useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms))

  const send = (text: string) => {
    setMessages((m) => [...m, { id: Date.now(), from: "user", text, time: now() }])
    setSuggestions((s) => s.filter((x) => x !== text))
    setRead(false)
    later(500, () => {
      setRead(true)
      setTyping(true)
    })
    later(1900, () => {
      const i = SUGGESTIONS.indexOf(text)
      const reply = REPLIES[i >= 0 ? i : 3 + (replies.current++ % (REPLIES.length - 3))]
      setTyping(false)
      setMessages((m) => [...m, { id: Date.now(), from: "assistant", text: reply, time: now() }])
    })
  }

  const lastUser = messages.findLastIndex((m) => m.from === "user")

  return (
    <Card className="mx-auto h-[min(600px,80svh)] w-full max-w-md gap-0 py-0">
      <CardHeader className="flex items-center gap-3 border-b border-glass-border py-3">
        <Avatar size="lg">
          <AvatarFallback className="bg-primary/16 text-primary">
            <SproutIcon />
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <CardTitle>Kai</CardTitle>
          <CardDescription className="text-xs">{typing ? "typing…" : "Your evening coach"}</CardDescription>
        </div>
        <CardAction className="self-center">
          <Button variant="ghost" size="icon-sm" aria-label="Conversation options">
            <EllipsisIcon />
          </Button>
        </CardAction>
      </CardHeader>

      <div className="relative min-h-0 flex-1">
        <ChatThread className="h-full [--chat-thread-inset:4rem]" aria-label="Conversation with Kai">
          <ChatDivider>Today</ChatDivider>
          {messages.map((m, i) => {
            const grouped = messages[i - 1]?.from === m.from
            return (
              <ChatMessage key={m.id} from={m.from} grouped={grouped} avatar={m.from === "assistant" ? coach : undefined}>
                <ChatBubble>{m.text}</ChatBubble>
                {i === lastUser ? <ChatMeta>{read ? `Read ${m.time}` : "Delivered"}</ChatMeta> : null}
              </ChatMessage>
            )
          })}
          {typing ? (
            <ChatMessage from="assistant" grouped={messages.at(-1)?.from === "assistant"} avatar={coach}>
              <ChatTyping name="Kai" />
            </ChatMessage>
          ) : null}
          {!typing && suggestions.length ? (
            <ChatSuggestions onSelect={send} className="-mx-pad-sm mt-4" aria-label="Quick replies">
              {suggestions.map((s) => (
                <ChatSuggestion key={s}>{s}</ChatSuggestion>
              ))}
            </ChatSuggestions>
          ) : null}
        </ChatThread>
        <ChatComposer
          variant="floating"
          onSubmit={send}
          placeholder="Message Kai"
          className="absolute inset-x-3 bottom-3 w-auto"
          leading={
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Attach">
              <PlusIcon />
            </Button>
          }
        />
      </div>
    </Card>
  )
}
