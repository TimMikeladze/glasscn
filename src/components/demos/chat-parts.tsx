"use client"

import * as React from "react"
import { CopyIcon, RotateCwIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"

import { ChatMessage, ChatThread } from "@/components/glass/chat"
import { ChatAction, ChatActions, ChatAttachment, ChatError, renderParts, type ChatUIMessage } from "@/components/glass/chat-parts"

const MESSAGES: ChatUIMessage[] = [
  {
    id: "u1",
    role: "user",
    parts: [
      { type: "file", mediaType: "application/pdf", url: "#", filename: "sleep-log.pdf" },
      { type: "text", text: "Does my sleep line up with the evenings I journal?" },
    ],
  },
  {
    id: "a1",
    role: "assistant",
    parts: [
      { type: "reasoning", text: "Compare bedtimes on journaling nights against the rest. 18 of 21 nights logged.", state: "done" },
      { type: "tool-readSleepLog", toolCallId: "t1", state: "output-available", input: { from: "2026-09-20", to: "2026-10-10" }, output: { nights: 21, journaled: 14, avgBedtime: { journaled: "22:41", other: "23:37" } } },
      { type: "text", text: "Yes — on the **14 nights** you journaled you were in bed about **56 minutes earlier** on average.\n\nThat matches what sleep researchers see with *expressive writing*." },
      { type: "source-url", sourceId: "s1", url: "https://example.com/writing-and-sleep", title: "Writing before bed and sleep onset" },
      { type: "source-url", sourceId: "s2", url: "https://example.com/bedtime-routines", title: "Bedtime routines" },
    ],
  },
  {
    id: "a2",
    role: "assistant",
    parts: [{ type: "tool-setReminder", toolCallId: "t2", state: "approval-requested", input: { at: "21:30", repeat: "daily" }, approval: { id: "ap1" } }],
  },
]

/** One AI SDK conversation rendered with renderParts: a file, reasoning, a finished tool call, Markdown, sources, an approval, actions and an error with retry. */
export default function ChatPartsDemo() {
  const [approved, setApproved] = React.useState<boolean | null>(null)
  const [liked, setLiked] = React.useState<"up" | "down" | null>(null)
  return (
    <div className="glass flex h-[36rem] w-full max-w-xl flex-col overflow-hidden rounded-surface">
      <ChatThread layout="document" className="flex-1" aria-label="Conversation with Kai">
        {MESSAGES.map((m) => (
          <ChatMessage key={m.id} from={m.role} name={m.role === "assistant" ? "Kai" : undefined} grouped={m.id === "a2"}>
            {renderParts(m, {
              reasoningDuration: 4,
              onToolApproval: ({ approved }) => setApproved(approved),
            })}
            {m.id === "a1" ? (
              <ChatActions>
                <ChatAction label="Copy">
                  <CopyIcon />
                </ChatAction>
                <ChatAction label="Good reply" active={liked === "up"} onClick={() => setLiked(liked === "up" ? null : "up")}>
                  <ThumbsUpIcon />
                </ChatAction>
                <ChatAction label="Bad reply" active={liked === "down"} onClick={() => setLiked(liked === "down" ? null : "down")}>
                  <ThumbsDownIcon />
                </ChatAction>
                <ChatAction label="Regenerate">
                  <RotateCwIcon />
                </ChatAction>
              </ChatActions>
            ) : null}
          </ChatMessage>
        ))}
        {approved === false ? (
          <ChatMessage from="assistant" name="Kai" grouped>
            <ChatError onRetry={() => setApproved(null)}>Reminder not set — you declined.</ChatError>
          </ChatMessage>
        ) : null}
      </ChatThread>
      <div className="flex gap-1.5 border-t border-separator px-pad-sm py-2">
        <ChatAttachment name="sleep-log.pdf" onRemove={() => {}} />
        <ChatAttachment name="photo.heic" uploading />
      </div>
    </div>
  )
}
