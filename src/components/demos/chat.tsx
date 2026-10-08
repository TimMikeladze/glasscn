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

export default function ChatDemo() {
  const [sent, setSent] = React.useState<string[]>([])
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
        <ChatMessage from="assistant" avatar={coach}>
          <ChatTyping name="Kai" />
        </ChatMessage>
      </ChatThread>
      <div className="flex flex-col gap-2 pb-3">
        <ChatSuggestions onSelect={(s) => setSent((m) => [...m, s])}>
          <ChatSuggestion>Keep the same time</ChatSuggestion>
          <ChatSuggestion>Try mornings</ChatSuggestion>
          <ChatSuggestion>Skip tomorrow</ChatSuggestion>
        </ChatSuggestions>
        <ChatComposer className="mx-3 w-auto" placeholder="Reply to Kai" onSubmit={(text) => setSent((m) => [...m, text])} />
      </div>
    </div>
  )
}
