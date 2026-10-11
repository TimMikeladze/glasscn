"use client"

import * as React from "react"

import { ChatMarkdown } from "@/components/glass/chat-markdown"

const REPLY = `Here's a gentle plan for the week:

1. **Monday** — one line before bed
2. **Wednesday** — a *longer* entry, ten minutes
3. **Friday** — read the week back

| Day | Minutes |
| --- | ---: |
| Mon | 2 |
| Wed | 10 |
| Fri | 5 |

\`\`\`ts
const streak = entries.filter((e) => e.written).length
\`\`\`

- [x] Pick a time
- [ ] Tell a friend`

/** Markdown streaming in token by token — fences and bold close themselves until the rest arrives. */
export default function ChatMarkdownDemo() {
  const [n, setN] = React.useState(0)
  React.useEffect(() => {
    if (n >= REPLY.length) return
    const t = window.setTimeout(() => setN((x) => Math.min(REPLY.length, x + 6)), 30)
    return () => window.clearTimeout(t)
  }, [n])
  return (
    <div className="glass flex w-full max-w-lg flex-col gap-3 rounded-surface p-5">
      <ChatMarkdown className="text-sm">{REPLY.slice(0, n)}</ChatMarkdown>
      <button type="button" className="glass-focus self-start rounded-button bg-fill px-3 py-1 text-xs text-muted-foreground hover:bg-fill-strong" onClick={() => setN(0)}>
        Replay stream
      </button>
    </div>
  )
}
