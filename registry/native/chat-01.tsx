import * as React from "react"
import { View } from "react-native"
import { EllipsisIcon, PlusIcon, SproutIcon } from "lucide-react-native"

import { Avatar, AvatarFallback } from "@/components/glass/native/avatar"
import { Button } from "@/components/glass/native/button"
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/glass/native/card"
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
import { alpha, useUI } from "@/components/glass/native/ui"

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

/** Height of the floating composer plus its margin, kept clear at the thread's foot. */
const COMPOSER_INSET = 64

function Coach({ size }: { size?: "lg" }) {
  const ui = useUI()
  return (
    <Avatar size={size}>
      <AvatarFallback style={{ backgroundColor: alpha(ui.primary, 0.16) }}>
        <SproutIcon color={ui.primary} />
      </AvatarFallback>
    </Avatar>
  )
}

/** A conversation: day divider, grouped turns, read receipt, typing that resolves into a reply, quick replies and a floating composer. */
export function Chat01({ height = 600 }: { height?: number }) {
  const ui = useUI()
  const [messages, setMessages] = React.useState(SEED)
  const [suggestions, setSuggestions] = React.useState(SUGGESTIONS)
  const [typing, setTyping] = React.useState(false)
  const [read, setRead] = React.useState(true)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const replies = React.useRef(0)

  React.useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms))

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

  let lastUser = -1
  messages.forEach((m, i) => {
    if (m.from === "user") lastUser = i
  })

  return (
    <Card style={{ width: "100%", maxWidth: 448, alignSelf: "center", height, gap: 0, paddingTop: 0, paddingBottom: 0 }}>
      <CardHeader style={{ alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: ui.glassBorder }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Coach size="lg" />
          <View style={{ flex: 1, minWidth: 0 }}>
            <CardTitle>Kai</CardTitle>
            <CardDescription size="xs">{typing ? "typing…" : "Your evening coach"}</CardDescription>
          </View>
        </View>
        <CardAction style={{ alignSelf: "center" }}>
          <Button variant="ghost" size="icon-sm" accessibilityLabel="Conversation options">
            <EllipsisIcon />
          </Button>
        </CardAction>
      </CardHeader>

      <View style={{ position: "relative", flex: 1, minHeight: 0 }}>
        <ChatThread style={{ flex: 1 }} inset={COMPOSER_INSET} accessibilityLabel="Conversation with Kai">
          <ChatDivider>Today</ChatDivider>
          {messages.map((m, i) => (
            <ChatMessage key={m.id} from={m.from} grouped={messages[i - 1]?.from === m.from} avatar={m.from === "assistant" ? <Coach /> : undefined}>
              <ChatBubble>{m.text}</ChatBubble>
              {i === lastUser ? <ChatMeta>{read ? `Read ${m.time}` : "Delivered"}</ChatMeta> : null}
            </ChatMessage>
          ))}
          {typing ? (
            <ChatMessage key="typing" from="assistant" grouped={messages[messages.length - 1]?.from === "assistant"} avatar={<Coach />}>
              <ChatTyping name="Kai" />
            </ChatMessage>
          ) : null}
          {!typing && suggestions.length ? (
            <ChatSuggestions key="suggestions" onSelect={send} accessibilityLabel="Quick replies" style={{ marginHorizontal: -ui.pad.sm, marginTop: 16 }}>
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
          style={{ position: "absolute", left: 12, right: 12, bottom: 12, width: "auto" }}
          leading={
            <Button variant="ghost" size="icon-sm" accessibilityLabel="Attach">
              <PlusIcon />
            </Button>
          }
        />
      </View>
    </Card>
  )
}
