import { cn } from "cn"

import { CopyButton } from "./copy-button"

/** Pre-highlighted code (shiki, generated at build) on a subtle glass pane. */
export function CodeBlock({ html, code, title, className, maxHeight = 520 }: { html: string; code: string; title?: string; className?: string; maxHeight?: number }) {
  return (
    <div className={cn("glass-subtle overflow-hidden rounded-2xl [--glass-elevation:0_0_#0000]", className)}>
      {title ? (
        <div className="flex items-center justify-between border-b border-glass-border px-4 py-1.5 text-xs text-muted-foreground">
          <span className="font-mono">{title}</span>
          <CopyButton value={code} />
        </div>
      ) : (
        <CopyButton value={code} className="float-right m-1.5" />
      )}
      <div
        className="overflow-auto px-4 py-3 font-mono text-[0.8rem] leading-relaxed [&_pre]:outline-none"
        style={{ maxHeight }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
