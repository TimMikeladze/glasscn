"use client"

import { CopyButton } from "./copy-button"

/** Plain (unhighlighted) code for values computed in the browser. */
export function CodeBlockClient({ code, title }: { code: string; title?: string }) {
  return (
    <div className="glass-subtle overflow-hidden rounded-2xl [--glass-elevation:0_0_#0000]">
      <div className="flex items-center justify-between border-b border-glass-border px-4 py-1.5 text-xs text-muted-foreground">
        <span className="font-mono">{title}</span>
        <CopyButton value={code} />
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[0.8rem] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}
