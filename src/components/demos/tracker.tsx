import { Tracker, type TrackerBlock } from "@/components/glass/tracker"

// a deterministic month so the server and client render the same blocks
const pattern = "dddpdmddrddddpdddmdrdddddpdddd"
const STATUS: Record<string, string> = { d: "done", p: "partial", m: "missed", r: "rest" }
const LABEL: Record<string, string> = { done: "Done", partial: "Partly", missed: "Missed", rest: "Rest day" }
const days: TrackerBlock[] = [...pattern].map((c, i) => ({ title: `Sep ${i + 1} · ${LABEL[STATUS[c]]}`, status: STATUS[c] }))

export default function TrackerDemo() {
  return (
    <div className="grid w-full max-w-md gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">Morning run</span>
        <span className="text-sm text-muted-foreground numeric-glass">22 of 30 days</span>
      </div>
      <Tracker data={days} />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Sep 1</span>
        <span>Sep 30</span>
      </div>
    </div>
  )
}
