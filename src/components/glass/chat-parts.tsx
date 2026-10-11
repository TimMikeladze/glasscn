"use client"

import * as React from "react"
import { cn } from "cn"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"
import { AlertCircleIcon, BrainIcon, CheckIcon, ChevronDownIcon, FileIcon, GlobeIcon, LoaderIcon, RotateCwIcon, WrenchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/glass/button"
import { ChatBubble } from "@/components/glass/chat"
import { ChatMarkdown } from "@/components/glass/chat-markdown"

/**
 * The pieces of an AI reply, shaped after AI SDK's `UIMessage.parts` — reasoning, tool
 * calls, sources, files, errors — plus the actions and reactions around a message.
 * `renderParts(message)` maps a whole `UIMessage` onto them. Types are structural:
 * no dependency on `ai`.
 */

// ---------------------------------------------------------------- AI SDK shapes (structural)

type ChatToolState = "input-streaming" | "input-available" | "approval-requested" | "approval-responded" | "output-available" | "output-error" | "output-denied"

type ChatUIPart =
  | { type: "text"; text: string; state?: "streaming" | "done" }
  | { type: "reasoning"; text: string; state?: "streaming" | "done" }
  | { type: "source-url"; sourceId: string; url: string; title?: string }
  | { type: "source-document"; sourceId: string; mediaType: string; title: string; filename?: string }
  | { type: "file"; mediaType: string; url: string; filename?: string }
  | { type: "step-start" }
  | {
      type: `tool-${string}` | "dynamic-tool"
      toolName?: string
      toolCallId: string
      state: ChatToolState
      input?: unknown
      output?: unknown
      errorText?: string
      approval?: { id: string; approved?: boolean; reason?: string }
    }
  | { type: `data-${string}`; id?: string; data: unknown }

type ChatUIMessage = { id: string; role: "user" | "assistant" | "system"; parts: ReadonlyArray<ChatUIPart | { type: string }> }

// ---------------------------------------------------------------- shared

const disclosureTrigger =
  "glass-focus group/disclosure inline-flex max-w-full items-center gap-1.5 rounded-control-sm py-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground [&_svg]:size-4 [&_svg]:shrink-0"

function Chevron() {
  return <ChevronDownIcon aria-hidden className="transition-transform duration-(--glass-duration) ease-glass group-data-[state=open]/disclosure:rotate-180" data-glass-motion />
}

const json = (value: unknown) => {
  if (value === undefined) return ""
  if (typeof value === "string") return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

// ---------------------------------------------------------------- reasoning

/**
 * The model's reasoning, collapsed behind "Thought for 12s". Opens by itself while it
 * streams ("Thinking…") and folds away when done — unless the reader opened it.
 */
function ChatReasoning({
  className,
  children,
  streaming = false,
  duration,
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root> & { streaming?: boolean; /** Seconds spent thinking. */ duration?: number }) {
  const [inner, setInner] = React.useState(defaultOpen ?? streaming)
  const [touched, setTouched] = React.useState(false)
  const [prevStreaming, setPrevStreaming] = React.useState(streaming)
  if (prevStreaming !== streaming) {
    setPrevStreaming(streaming)
    if (!touched) setInner(streaming)
  }
  const open = openProp ?? inner
  const label = streaming ? "Thinking…" : duration !== undefined ? `Thought for ${Math.max(1, Math.round(duration))}s` : "Reasoning"
  return (
    <CollapsiblePrimitive.Root
      data-slot="chat-reasoning"
      data-streaming={streaming || undefined}
      open={open}
      onOpenChange={(o) => {
        setTouched(true)
        setInner(o)
        onOpenChange?.(o)
      }}
      className={cn("w-full", className)}
      {...props}
    >
      <CollapsiblePrimitive.Trigger data-slot="chat-reasoning-trigger" className={disclosureTrigger}>
        <BrainIcon aria-hidden className={cn(streaming && "animate-pulse")} data-glass-motion />
        <span className="truncate">{label}</span>
        <Chevron />
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Content data-slot="chat-reasoning-content" className="mt-1.5 border-s-2 border-separator ps-3 text-sm text-muted-foreground">
        {typeof children === "string" ? <ChatMarkdown>{children}</ChatMarkdown> : children}
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  )
}

// ---------------------------------------------------------------- tool

const TOOL_LABEL: Record<ChatToolState, string> = {
  "input-streaming": "Preparing",
  "input-available": "Running",
  "approval-requested": "Needs approval",
  "approval-responded": "Responded",
  "output-available": "Done",
  "output-error": "Failed",
  "output-denied": "Denied",
}

function ToolStateIcon({ state }: { state: ChatToolState }) {
  if (state === "output-available") return <CheckIcon className="text-success-ink" />
  if (state === "output-error" || state === "output-denied") return <AlertCircleIcon className="text-destructive-ink" />
  if (state === "approval-requested") return <AlertCircleIcon className="text-primary-ink" />
  return <LoaderIcon className="animate-spin motion-reduce:animate-none" data-glass-motion />
}

type ChatToolProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** The tool's name (`getWeather`). */
  name: string
  state: ChatToolState
  input?: unknown
  output?: unknown
  errorText?: string
  /** Shown with Approve/Deny while `state` is `approval-requested`. */
  onApprove?: () => void
  onDeny?: () => void
  /** Render the output yourself instead of as JSON. */
  renderOutput?: (output: unknown) => React.ReactNode
  defaultOpen?: boolean
}

/** A tool call: its name and state, its input and output as JSON (or your own render), and approve/deny when it asks. */
function ChatTool({ className, name, state, input, output, errorText, onApprove, onDeny, renderOutput, defaultOpen, ...props }: ChatToolProps) {
  const asking = state === "approval-requested"
  return (
    <div data-slot="chat-tool" data-state={state} className={cn("w-full overflow-hidden rounded-control border border-glass-border bg-fill text-sm", className)} {...props}>
      <CollapsiblePrimitive.Root defaultOpen={defaultOpen ?? (asking || state === "output-error")}>
        <CollapsiblePrimitive.Trigger
          data-slot="chat-tool-trigger"
          className="glass-focus-inset group/disclosure flex w-full items-center gap-2 px-3 py-2 text-start [&_svg]:size-4 [&_svg]:shrink-0"
        >
          <WrenchIcon aria-hidden className="text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate font-glass-mono text-[length:inherit]">{name}</span>
          <span data-slot="chat-tool-state" className="type-caption-1 flex items-center gap-1 text-muted-foreground">
            <ToolStateIcon state={state} />
            {TOOL_LABEL[state]}
          </span>
          <Chevron />
        </CollapsiblePrimitive.Trigger>
        <CollapsiblePrimitive.Content data-slot="chat-tool-content" className="flex flex-col gap-2 border-t border-separator px-3 py-2.5">
          {input !== undefined ? <ToolSection label="Input" body={json(input)} /> : null}
          {state === "output-error" && errorText ? (
            <p role="alert" className="text-destructive-ink">
              {errorText}
            </p>
          ) : null}
          {state === "output-available" && output !== undefined ? renderOutput ? renderOutput(output) : <ToolSection label="Output" body={json(output)} /> : null}
        </CollapsiblePrimitive.Content>
      </CollapsiblePrimitive.Root>
      {asking && (onApprove || onDeny) ? (
        <div data-slot="chat-tool-approval" className="flex items-center justify-end gap-2 border-t border-separator px-3 py-2">
          <span className="me-auto text-muted-foreground">Allow {name} to run?</span>
          {onDeny ? (
            <Button type="button" variant="secondary" size="sm" onClick={onDeny}>
              Deny
            </Button>
          ) : null}
          {onApprove ? (
            <Button type="button" size="sm" onClick={onApprove}>
              Approve
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function ToolSection({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="type-caption-2 font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
      <pre tabIndex={0} className="glass-focus max-h-60 overflow-auto rounded-control-sm bg-fill px-2.5 py-2 font-glass-mono type-caption-1 whitespace-pre-wrap break-words">
        {body}
      </pre>
    </div>
  )
}

// ---------------------------------------------------------------- sources

type ChatSource = { url?: string; title?: string; id?: string }

const hostOf = (url?: string) => {
  try {
    return url ? new URL(url).hostname.replace(/^www\./, "") : undefined
  } catch {
    return undefined
  }
}

/** The sources behind a reply, as a row of numbered chips under "N sources". */
function ChatSources({ className, sources, defaultOpen = false, ...props }: Omit<React.ComponentProps<"div">, "children"> & { sources: ChatSource[]; defaultOpen?: boolean }) {
  if (!sources.length) return null
  return (
    <CollapsiblePrimitive.Root data-slot="chat-sources" defaultOpen={defaultOpen} className={cn("w-full", className)} {...props}>
      <CollapsiblePrimitive.Trigger className={disclosureTrigger}>
        <GlobeIcon aria-hidden />
        {sources.length === 1 ? "1 source" : `${sources.length} sources`}
        <Chevron />
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Content asChild>
        <ol data-slot="chat-sources-list" className="mt-1.5 flex flex-wrap gap-1.5">
          {sources.map((s, i) => (
            <li key={s.id ?? s.url ?? i}>
              <ChatCitation href={s.url} index={i + 1}>
                {s.title ?? hostOf(s.url) ?? s.url}
              </ChatCitation>
            </li>
          ))}
        </ol>
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  )
}

/** A numbered source chip, a link when it has `href`. Inline in text, it shows only the number. */
function ChatCitation({ className, index, href, children, ...props }: React.ComponentProps<"a"> & { index?: number }) {
  const Comp = href ? "a" : "span"
  return (
    <Comp
      data-slot="chat-citation"
      href={href}
      target={href ? "_blank" : undefined}
      rel={href ? "noreferrer noopener" : undefined}
      className={cn(
        "glass-focus inline-flex max-w-60 items-center gap-1.5 rounded-badge bg-fill px-2 py-0.5 align-baseline type-caption-1 text-foreground no-underline transition-colors hover:bg-fill-strong",
        className
      )}
      {...props}
    >
      {index !== undefined ? <span className="numeric-glass font-medium text-primary-ink">{index}</span> : null}
      {children ? <span className="truncate">{children}</span> : null}
    </Comp>
  )
}

// ---------------------------------------------------------------- files

/** A file in a message: images show as a thumbnail, anything else as a chip with its name. */
function ChatFile({ className, url, mediaType, filename, ...props }: React.ComponentProps<"div"> & { url: string; mediaType: string; filename?: string }) {
  if (mediaType.startsWith("image/"))
    return (
      <div data-slot="chat-file" data-media-type={mediaType} className={cn("overflow-hidden rounded-surface-sm", className)} {...props}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a user's file, not a static asset */}
        <img src={url} alt={filename ?? "Image"} className="block max-h-64 w-auto max-w-full object-cover" />
      </div>
    )
  return (
    <div data-slot="chat-file" data-media-type={mediaType} className={cn("flex", className)} {...props}>
      <a href={url} download={filename} className="glass-focus inline-flex max-w-64 items-center gap-2 rounded-control bg-fill px-3 py-2 text-sm hover:bg-fill-strong">
        <FileIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{filename ?? mediaType}</span>
      </a>
    </div>
  )
}

/** An attachment chip in the composer: a thumbnail or icon, the name, and remove. */
function ChatAttachment({
  className,
  name,
  previewUrl,
  onRemove,
  uploading = false,
  ...props
}: React.ComponentProps<"div"> & { name: string; previewUrl?: string; onRemove?: () => void; uploading?: boolean }) {
  return (
    <div data-slot="chat-attachment" aria-busy={uploading || undefined} className={cn("inline-flex h-control-sm max-w-48 items-center gap-1.5 rounded-control-sm bg-fill-strong ps-1 pe-0.5 text-xs", className)} {...props}>
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- a local object URL
        <img src={previewUrl} alt="" className="size-6 shrink-0 rounded-control-xs object-cover" />
      ) : uploading ? (
        <LoaderIcon aria-hidden className="ms-1 size-3.5 shrink-0 animate-spin motion-reduce:animate-none" data-glass-motion />
      ) : (
        <FileIcon aria-hidden className="ms-1 size-3.5 shrink-0 text-muted-foreground" />
      )}
      <span className="truncate">{name}</span>
      {onRemove ? (
        <Button type="button" variant="ghost" size="icon-xs" aria-label={`Remove ${name}`} onClick={onRemove}>
          <XIcon />
        </Button>
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------- error

/** A failed reply: the reason, and Retry. */
function ChatError({ className, children = "Something went wrong.", onRetry, ...props }: React.ComponentProps<"div"> & { onRetry?: () => void }) {
  return (
    <div data-slot="chat-error" role="alert" className={cn("flex w-full items-center gap-2 rounded-control bg-destructive/12 px-3 py-2 text-sm text-destructive-ink", className)} {...props}>
      <AlertCircleIcon aria-hidden className="size-4 shrink-0" />
      <span className="min-w-0 flex-1">{children}</span>
      {onRetry ? (
        <Button type="button" variant="ghost" size="sm" onClick={onRetry}>
          <RotateCwIcon />
          Retry
        </Button>
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------- actions and reactions

/** The row of actions under a message — copy, regenerate, edit, thumbs, share. Shows on hover and focus on pointer devices; always on touch. */
function ChatActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-actions"
      role="toolbar"
      aria-label={props["aria-label"] ?? "Message actions"}
      className={cn(
        "flex items-center gap-0.5 transition-opacity duration-(--glass-duration) pointer-fine:opacity-0 pointer-fine:group-hover/chat-message:opacity-100 pointer-fine:focus-within:opacity-100 pointer-fine:group-last/chat-message:opacity-100",
        className
      )}
      data-glass-motion
      {...props}
    />
  )
}

/** One action: an icon button named by `label`. `active` marks a toggle that's on (a thumbs-up given). */
function ChatAction({ className, label, active, ...props }: React.ComponentProps<typeof Button> & { label: string; active?: boolean }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      title={label}
      aria-pressed={active}
      data-slot="chat-action"
      className={cn("text-muted-foreground aria-pressed:text-primary-ink", className)}
      {...props}
    />
  )
}

type ChatReaction = { emoji: string; count?: number; mine?: boolean; label?: string }

/** Tapbacks: a capsule of reactions pinned to the bubble's corner. Pressing one toggles yours. */
function ChatReactions({ className, reactions, onToggle, ...props }: Omit<React.ComponentProps<"div">, "children"> & { reactions: ChatReaction[]; onToggle?: (emoji: string) => void }) {
  if (!reactions.length) return null
  return (
    <div
      data-slot="chat-reactions"
      role="group"
      aria-label="Reactions"
      className={cn(
        "-mt-3 flex items-center gap-0.5 rounded-badge border border-glass-border bg-popover p-0.5 shadow-sm group-data-[from=user]/chat-message:me-2 group-data-[from=user]/chat-message:self-end not-group-data-[from=user]/chat-message:ms-2",
        className
      )}
      {...props}
    >
      {reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          aria-pressed={r.mine ?? false}
          aria-label={`${r.label ?? r.emoji}${r.count && r.count > 1 ? `, ${r.count}` : ""}`}
          onClick={() => onToggle?.(r.emoji)}
          className="glass-focus inline-flex h-6 min-w-6 items-center justify-center gap-0.5 rounded-badge px-1 text-xs transition-colors hover:bg-fill aria-pressed:bg-primary/16"
        >
          <span aria-hidden>{r.emoji}</span>
          {r.count && r.count > 1 ? <span className="numeric-glass text-muted-foreground">{r.count}</span> : null}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------- renderParts

type RenderPartsOptions = {
  /** The message is still streaming (AI SDK `status === "streaming"` and it's the last message). */
  streaming?: boolean
  /** Passed to every code block — bring Shiki. */
  highlight?: React.ComponentProps<typeof ChatMarkdown>["highlight"]
  /** AI SDK `addToolApprovalResponse({ id, approved })`. */
  onToolApproval?: (approval: { id: string; approved: boolean; toolCallId: string }) => void
  /** Render a tool's output yourself, by tool name. */
  renderTool?: (part: Extract<ChatUIPart, { toolCallId: string }>, name: string) => React.ReactNode | undefined
  /** Render `data-*` parts. */
  renderData?: (part: { type: string; data: unknown }) => React.ReactNode
  /** Seconds the model reasoned, for "Thought for 12s". */
  reasoningDuration?: number
}

/**
 * Maps an AI SDK `UIMessage` onto chat parts, in order: text → a bubble (Markdown for the
 * assistant, plain for the user), reasoning, tools, files; sources gather into one
 * `ChatSources` at the end. Put the result inside a `ChatMessage`.
 */
function renderParts(message: ChatUIMessage, options: RenderPartsOptions = {}): React.ReactNode[] {
  const { streaming = false, highlight, onToolApproval, renderTool, renderData, reasoningDuration } = options
  const out: React.ReactNode[] = []
  const sources: ChatSource[] = []
  message.parts.forEach((raw, i) => {
    const part = raw as ChatUIPart
    const key = `${message.id}-${i}`
    if (part.type === "text") {
      if (!part.text) return
      out.push(<ChatBubble key={key}>{message.role === "assistant" ? <ChatMarkdown highlight={highlight}>{part.text}</ChatMarkdown> : part.text}</ChatBubble>)
    } else if (part.type === "reasoning") {
      out.push(
        <ChatReasoning key={key} streaming={streaming && part.state === "streaming"} duration={reasoningDuration}>
          {part.text}
        </ChatReasoning>
      )
    } else if (part.type === "source-url") sources.push({ id: part.sourceId, url: part.url, title: part.title })
    else if (part.type === "source-document") sources.push({ id: part.sourceId, title: part.title ?? part.filename })
    else if (part.type === "file") out.push(<ChatFile key={key} url={part.url} mediaType={part.mediaType} filename={part.filename} />)
    else if ("toolCallId" in part) {
      const name = part.type === "dynamic-tool" ? (part.toolName ?? "tool") : part.type.slice(5)
      const custom = renderTool?.(part, name)
      if (custom !== undefined) {
        out.push(<React.Fragment key={key}>{custom}</React.Fragment>)
        return
      }
      const approval = part.approval
      out.push(
        <ChatTool
          key={key}
          name={name}
          state={part.state}
          input={part.input}
          output={part.output}
          errorText={part.errorText}
          onApprove={approval && onToolApproval ? () => onToolApproval({ id: approval.id, approved: true, toolCallId: part.toolCallId }) : undefined}
          onDeny={approval && onToolApproval ? () => onToolApproval({ id: approval.id, approved: false, toolCallId: part.toolCallId }) : undefined}
        />
      )
    } else if (part.type.startsWith("data-") && renderData) out.push(<React.Fragment key={key}>{renderData(part as { type: string; data: unknown })}</React.Fragment>)
  })
  if (sources.length) out.push(<ChatSources key={`${message.id}-sources`} sources={sources} />)
  return out
}

export { ChatReasoning, ChatTool, ChatSources, ChatCitation, ChatFile, ChatAttachment, ChatError, ChatActions, ChatAction, ChatReactions, renderParts }
export type { ChatUIMessage, ChatUIPart, ChatToolState, ChatSource, ChatReaction, RenderPartsOptions }
