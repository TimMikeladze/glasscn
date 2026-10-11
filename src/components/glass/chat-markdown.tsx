"use client"

import * as React from "react"
import { cn } from "cn"
import { CheckIcon, CopyIcon, WrapTextIcon } from "lucide-react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

import { Button } from "@/components/glass/button"
import { Prose } from "@/components/glass/prose"

/**
 * Closes what a half-streamed Markdown string left open so it renders as it will once
 * complete: an unclosed ``` fence, an unclosed inline `code`, `**bold**`, `*em*` or
 * `~~strike~~`, and drops a trailing link or image whose URL hasn't arrived yet.
 */
function repairMarkdown(text: string): string {
  let out = text
  const fences = out.match(/^\s{0,3}(```|~~~)/gm) ?? []
  if (fences.length % 2 === 1) return `${out}${out.endsWith("\n") ? "" : "\n"}${fences[fences.length - 1].trim()}`
  // only the text after the last complete fence can hold open inline marks
  const tail = out.slice(out.lastIndexOf("```") + 1)
  // a link or image still arriving: [label](htt…  → label
  out = out.replace(/!?\[([^\]\n]*)\]\([^)\s]*$/, "$1").replace(/!?\[([^\]\n]*)$/, "$1")
  const count = (re: RegExp) => (tail.replace(/`[^`\n]*`/g, "").match(re) ?? []).length
  if ((tail.match(/`/g) ?? []).length % 2 === 1) out += "`"
  if (count(/\*\*/g) % 2 === 1) out += "**"
  if (count(/~~/g) % 2 === 1) out += "~~"
  if (count(/(?<![*\w])\*(?![*\s])|(?<![*\s])\*(?![*\w])/g) % 2 === 1) out += "*"
  return out
}

type ChatCodeBlockProps = Omit<React.ComponentProps<"div">, "children"> & {
  code: string
  language?: string
  /** Start with long lines wrapped instead of scrolling. */
  wrap?: boolean
  /**
   * Highlighted HTML for the code — Shiki's `codeToHtml(code, { lang, themes })`, say.
   * Until it resolves (and while streaming) the plain text shows.
   */
  highlight?: (code: string, language?: string) => string | Promise<string>
}

/** A fenced code block: language, copy, wrap, and optional highlighting (bring Shiki). */
function ChatCodeBlock({ className, code, language, wrap: wrapDefault = false, highlight, ...props }: ChatCodeBlockProps) {
  const [wrap, setWrap] = React.useState(wrapDefault)
  const [copied, setCopied] = React.useState(false)
  const [html, setHtml] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!highlight) return
    let live = true
    Promise.resolve(highlight(code, language)).then((h) => live && setHtml(h), () => {})
    return () => {
      live = false
    }
  }, [code, language, highlight])
  React.useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(t)
  }, [copied])
  return (
    <div data-slot="chat-code-block" data-language={language} className={cn("not-prose my-3 overflow-hidden rounded-control border border-glass-border bg-fill text-foreground", className)} {...props}>
      <div data-slot="chat-code-block-header" className="flex items-center gap-1 border-b border-separator ps-3 pe-1 py-1">
        <span className="type-caption-2 me-auto font-glass-mono text-muted-foreground">{language || "text"}</span>
        <Button type="button" variant="ghost" size="icon-xs" aria-label={wrap ? "Don't wrap lines" : "Wrap lines"} aria-pressed={wrap} onClick={() => setWrap((w) => !w)}>
          <WrapTextIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={copied ? "Copied" : "Copy code"}
          onClick={() => {
            void navigator.clipboard?.writeText(code)
            setCopied(true)
          }}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
      </div>
      {html ? (
        <div
          data-slot="chat-code-block-content"
          tabIndex={0}
          className={cn("glass-focus-inset overflow-x-auto type-footnote [&_pre]:bg-transparent! [&_pre]:px-3 [&_pre]:py-2.5 [&_pre]:font-glass-mono", wrap && "[&_pre]:whitespace-pre-wrap [&_pre]:break-words")}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre data-slot="chat-code-block-content" tabIndex={0} className={cn("glass-focus-inset overflow-x-auto px-3 py-2.5 font-glass-mono type-footnote", wrap && "whitespace-pre-wrap break-words")}>
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}

type ChatMarkdownProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** The Markdown — complete or still streaming. GitHub flavoured (tables, task lists, strikethrough). */
  children: string
  /** Close unfinished fences and marks so a streaming message doesn't flicker. Default true. */
  repair?: boolean
  /** Passed to every `ChatCodeBlock` — bring Shiki. */
  highlight?: ChatCodeBlockProps["highlight"]
  /** Override how elements render (react-markdown `components`). */
  components?: Components
}

/**
 * Markdown in the theme's type, safe to render while it streams: unclosed fences and
 * marks are closed first, raw HTML is not rendered, and fenced code becomes a `ChatCodeBlock`.
 */
function ChatMarkdown({ className, children, repair = true, highlight, components, ...props }: ChatMarkdownProps) {
  const source = repair ? repairMarkdown(children) : children
  const merged = React.useMemo<Components>(
    () => ({
      pre: ({ children: pre }) => {
        const code = React.Children.toArray(pre).find(React.isValidElement) as React.ReactElement<{ className?: string; children?: React.ReactNode }> | undefined
        const language = /language-([\w+#-]+)/.exec(code?.props.className ?? "")?.[1]
        const text = String(code?.props.children ?? "").replace(/\n$/, "")
        return <ChatCodeBlock code={text} language={language} highlight={highlight} />
      },
      a: ({ href, title, children: label }) => (
        <a href={href} title={title} target="_blank" rel="noreferrer noopener">
          {label}
        </a>
      ),
      ...components,
    }),
    [highlight, components]
  )
  return (
    <Prose data-slot="chat-markdown" className={cn("max-w-none text-[length:inherit] leading-[inherit] [&>:first-child]:mt-0 [&>:last-child]:mb-0", className)} {...props}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={merged}>
        {source}
      </ReactMarkdown>
    </Prose>
  )
}

export { ChatMarkdown, ChatCodeBlock, repairMarkdown }
