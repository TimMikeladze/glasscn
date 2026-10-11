"use client"

import * as React from "react"
import { SproutIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/glass/avatar"
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

const coach = (
  <Avatar>
    <AvatarFallback className="bg-primary/16 text-primary">
      <SproutIcon />
    </AvatarFallback>
  </Avatar>
)

const REPLY = "Then keep it. Same time tomorrow — I'll check in after dinner."

export default function ChatDemo() {
  const [sent, setSent] = React.useState<string[]>([])
  // the reply streams in word by word; `streaming` keeps screen readers from reading each word
  const [reply, setReply] = React.useState<{ text: string; streaming: boolean } | null>(null)
  const timer = React.useRef<number | undefined>(undefined)
  React.useEffect(() => () => window.clearInterval(timer.current), [])

  const send = (text: string) => {
    setSent((m) => [...m, text])
    window.clearInterval(timer.current)
    const words = REPLY.split(" ")
    let n = 0
    setReply(null)
    timer.current = window.setInterval(() => {
      n += 1
      setReply({ text: words.slice(0, n).join(" "), streaming: n < words.length })
      if (n >= words.length) window.clearInterval(timer.current)
    }, 90)
  }

  return (
    <div className="glass flex h-[30rem] w-full max-w-md flex-col overflow-hidden rounded-surface">
      <ChatThread className="flex-1">
        <ChatDivider>Today</ChatDivider>
        <ChatMessage from="assistant" avatar={coach}>
          <ChatBubble>You wrote every evening this week.</ChatBubble>
        </ChatMessage>
        <ChatMessage from="assistant" avatar={coach} grouped>
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
        <ChatMessage from="assistant" avatar={coach} streaming={reply?.streaming ?? false}>
          {reply ? <ChatBubble>{reply.text}</ChatBubble> : <ChatTyping name="Kai" />}
        </ChatMessage>
      </ChatThread>
      <div className="flex flex-col gap-2 pb-3">
        <ChatSuggestions onSelect={send}>
          <ChatSuggestion>Keep the same time</ChatSuggestion>
          <ChatSuggestion>Try mornings</ChatSuggestion>
          <ChatSuggestion>Skip tomorrow</ChatSuggestion>
        </ChatSuggestions>
        <ChatComposer className="mx-3 w-auto" placeholder="Reply to Kai" onSubmit={send} />
      </div>
    </div>
  )
}
