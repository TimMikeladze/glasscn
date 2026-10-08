"use client"

import * as React from "react"

import { SegmentedControl, SegmentedControlItem } from "@/components/glass/segmented-control"
import { CopyButton } from "./copy-button"

const RUNNERS = { pnpm: "pnpm dlx", npm: "npx", bun: "bunx --bun", yarn: "yarn dlx" } as const
type Runner = keyof typeof RUNNERS

/** `shadcn add <url>` for the chosen package runner. */
export function InstallCommand({ args, className }: { args: string; className?: string }) {
  const [runner, setRunner] = React.useState<Runner>("pnpm")
  const command = `${RUNNERS[runner]} shadcn@latest ${args}`
  return (
    <div className={className}>
      <div className="glass-subtle overflow-hidden rounded-2xl [--glass-elevation:0_0_#0000]">
        <div className="flex items-center justify-between gap-2 border-b border-glass-border px-2 py-1.5">
          <SegmentedControl size="sm" value={runner} onValueChange={(v) => setRunner(v as Runner)} aria-label="Package runner">
            {Object.keys(RUNNERS).map((r) => (
              <SegmentedControlItem key={r} value={r}>
                {r}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
          <CopyButton value={command} label="Copy command" />
        </div>
        <pre className="overflow-x-auto px-4 py-3 font-mono text-[0.8rem]">
          <code>
            <span className="text-primary">{RUNNERS[runner]}</span> shadcn@latest {args}
          </code>
        </pre>
      </div>
    </div>
  )
}
