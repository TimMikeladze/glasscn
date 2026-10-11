"use client"

import * as React from "react"
import { CopyIcon, EllipsisIcon, PlusIcon, RotateCwIcon, SproutIcon, ThumbsUpIcon } from "lucide-react"

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
import { ChatAction, ChatActions, ChatReactions } from "@/components/glass/chat-parts"

interface Message {
  id: number
  from: "user" | "assistant"
  text: string
  time: Date
}

const seed = (): Message[] => [
  { id: 1, from: "assistant", text: "Morning, Sam. Three evenings in a row — your longest run since March.", time: at(8, 2) },
  { id: 2, from: "assistant", text: "Want to set tonight's intention while it's fresh?", time: at(8, 2) },
  { id: 3, from: "user", text: "Yes — something small.", time: at(8, 13) },
  { id: 4, from: "user", text: "Last week I aimed too big and skipped two nights.", time: at(8, 14) },
  { id: 5, from: "assistant", text: "Small is the point. One line before bed: what went well today?", time: at(8, 14) },
]

const SUGGESTIONS = ["Remind me at 9", "Make it even smaller", "How's my streak?"]

const REPLIES = [
  "Done. I'll nudge you once at 9:00 PM — and stay quiet if you've already written.",
  "Then just a word. One word about today still counts as showing up.",
  "Three days, 41 entries this year. Tonight makes it four.",
  "Noted. Small steps, every evening — that's the whole method.",
]

const at = (h: number, m: number) => {
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}
const clock = (d: Date) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })

const coach = (
  <Avatar>
    <AvatarFallback className="bg-primary/16 text-primary">
      <SproutIcon />
    </AvatarFallback>
  </Avatar>
)

/** A conversation: day divider, grouped turns, read receipt, typing that streams into a reply you can stop, actions and a reaction, quick replies above a floating composer. */
export function Chat01() {
  const [messages, setMessages] = React.useState(seed)
  const [streaming, setStreaming] = React.useState(false)
  const [liked, setLiked] = React.useState<number | null>(null)
  const [suggestions, setSuggestions] = React.useState(SUGGESTIONS)
  const [typing, setTyping] = React.useState(false)
  const [read, setRead] = React.useState(true)
  const timers = React.useRef<number[]>([])
  const replies = React.useRef(0)

  React.useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms))

  const send = (text: string) => {
    setMessages((m) => [...m, { id: Date.now(), from: "user", text, time: new Date() }])
    setSuggestions((s) => s.filter((x) => x !== text))
    setRead(false)
    later(500, () => {
      setRead(true)
      setTyping(true)
    })
    later(1900, () => {
      const i = SUGGESTIONS.indexOf(text)
      const reply = REPLIES[i >= 0 ? i : 3 + (replies.current++ % (REPLIES.length - 3))]
      const id = Date.now()
      setTyping(false)
      setStreaming(true)
      // the reply streams in word by word; Stop cuts it short
      const words = reply.split(" ")
      words.forEach((_, n) =>
        later(60 * n, () => {
          setMessages((m) => {
            const rest = m.filter((x) => x.id !== id)
            return [...rest, { id, from: "assistant", text: words.slice(0, n + 1).join(" "), time: new Date() }]
          })
          if (n === words.length - 1) setStreaming(false)
        })
      )
    })
  }

  const stop = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setTyping(false)
    setStreaming(false)
  }

  const lastUser = messages.findLastIndex((m) => m.from === "user")
  const lastAssistant = messages.findLastIndex((m) => m.from === "assistant")

  return (
    <Card className="mx-auto h-[min(600px,80svh)] w-full max-w-md gap-0 py-0">
      <CardHeader className="flex items-center gap-3 border-b border-separator py-3">
        <Avatar size="lg">
          <AvatarFallback className="bg-primary/16 text-primary">
            <SproutIcon />
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <CardTitle>Kai</CardTitle>
          <CardDescription className="text-xs">{typing || streaming ? "typing…" : "Your evening coach"}</CardDescription>
        </div>
        <CardAction className="self-center">
          <Button variant="ghost" size="icon-sm" aria-label="Conversation options">
            <EllipsisIcon />
          </Button>
        </CardAction>
      </CardHeader>

      <div className="relative min-h-0 flex-1">
        <ChatThread className="h-full [--chat-thread-inset:6.5rem]" aria-label="Conversation with Kai">
          <ChatDivider>Today</ChatDivider>
          {messages.map((m, i) => {
            const grouped = messages[i - 1]?.from === m.from
            return (
              <ChatMessage
                key={m.id}
                from={m.from}
                name={m.from === "assistant" ? "Kai" : undefined}
                grouped={grouped}
                streaming={streaming && i === messages.length - 1}
                avatar={m.from === "assistant" ? coach : undefined}
              >
                <ChatBubble>{m.text}</ChatBubble>
                {liked === m.id ? <ChatReactions reactions={[{ emoji: "👍", mine: true, label: "Thumbs up" }]} onToggle={() => setLiked(null)} /> : null}
                {i === lastUser ? <ChatMeta time={m.time}>{read ? `Read ${clock(m.time)}` : "Delivered"}</ChatMeta> : null}
                {i === lastAssistant && !streaming && !typing ? (
                  <ChatActions>
                    <ChatAction label="Copy" onClick={() => void navigator.clipboard?.writeText(m.text)}>
                      <CopyIcon />
                    </ChatAction>
                    <ChatAction label="Good reply" active={liked === m.id} onClick={() => setLiked(liked === m.id ? null : m.id)}>
                      <ThumbsUpIcon />
                    </ChatAction>
                    <ChatAction label="Regenerate">
                      <RotateCwIcon />
                    </ChatAction>
                  </ChatActions>
                ) : null}
              </ChatMessage>
            )
          })}
          {typing ? (
            <ChatMessage from="assistant" name="Kai" grouped={messages.at(-1)?.from === "assistant"} avatar={coach}>
              <ChatTyping name="Kai" />
            </ChatMessage>
          ) : null}
        </ChatThread>
        {!typing && !streaming && suggestions.length ? (
          <ChatSuggestions onSelect={send} className="absolute inset-x-0 bottom-17" aria-label="Quick replies">
            {suggestions.map((s) => (
              <ChatSuggestion key={s}>{s}</ChatSuggestion>
            ))}
          </ChatSuggestions>
        ) : null}
        <ChatComposer
          variant="floating"
          status={typing ? "submitted" : streaming ? "streaming" : "ready"}
          onStop={stop}
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
