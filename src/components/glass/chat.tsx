"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { ArrowDownIcon, ArrowUpIcon, RotateCwIcon, SquareIcon } from "lucide-react"

import { Button } from "@/components/glass/button"

/**
 * A conversation in parts. It renders whatever you pass — local state, a socket,
 * or AI SDK's `useChat` — and owns no messages or networking. For AI SDK message
 * parts (markdown, reasoning, tools, sources, files) see `chat-parts`.
 *
 *   <ChatThread layout="document">
 *     <ChatDivider>Today</ChatDivider>
 *     <ChatMessage from="assistant" name="Kai" avatar={<Avatar>…</Avatar>}>
 *       <ChatBubble>How did the evening go?</ChatBubble>
 *     </ChatMessage>
 *     <ChatMessage from="user">
 *       <ChatBubble>Wrote three lines.</ChatBubble>
 *       <ChatMeta time={sentAt}>Read</ChatMeta>
 *     </ChatMessage>
 *   </ChatThread>
 *   <ChatComposer status={status} onStop={stop} onSubmit={send} />
 */

type ChatFrom = "user" | "assistant" | "system"
type ChatLayout = "bubble" | "document"
/** AI SDK `useChat().status`. */
type ChatStatus = "ready" | "submitted" | "streaming" | "error"

const ChatMessageContext = React.createContext<ChatFrom>("assistant")
const ChatLayoutContext = React.createContext<ChatLayout>("bubble")

/** Hands a finished message's text to the thread's announcer. */
const ChatAnnounceContext = React.createContext<((text: string) => void) | null>(null)

/** Pixels from the bottom that still count as "at the bottom"; from the top that ask for older history. */
const STICK_THRESHOLD = 32
const OLDER_THRESHOLD = 64

type ChatThreadProps = React.ComponentProps<"div"> & {
  /** `bubble` (messages app) or `document` (assistant turns as full-width prose, as modern AI chats). */
  layout?: ChatLayout
  /** Called when the reader scrolls near the top. Prepend older messages; the reading position is kept. */
  onLoadOlder?: () => void | Promise<void>
  /** Whether there is older history to load; `onLoadOlder` isn't called once false. */
  hasOlder?: boolean
}

/**
 * The scrolling log. Sticks to the newest message while you're at the bottom (and
 * whenever you send one); scroll up to read back and a liquid "jump to latest" button
 * materialises, counting messages that arrived since. Prepending older history keeps
 * your place. Set `--chat-thread-inset` to leave room for a composer floating over its
 * bottom edge, and `--chat-bubble-max` (default 36rem) to cap a bubble's width.
 *
 * Screen readers hear new messages through the log's implicit polite live region.
 * A `ChatMessage` marked `streaming` is `aria-busy` (and only additions are relevant),
 * so partial text isn't read token by token; when it finishes, the whole message is
 * announced once through a visually hidden status region.
 */
function ChatThread({ className, children, layout = "bubble", onLoadOlder, hasOlder = true, ...props }: ChatThreadProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const stick = React.useRef(true)
  const bottomRef = React.useRef(true)
  // set while older history loads: the distance from the bottom to restore once it lands
  const anchor = React.useRef<number | null>(null)
  const [atBottom, setAtBottomState] = React.useState(true)
  const [unread, setUnread] = React.useState(0)
  const [loadingOlder, setLoadingOlder] = React.useState(false)
  const [announcement, setAnnouncement] = React.useState("")
  const announce = React.useCallback((text: string) => {
    // clear first so the same text twice is still a change
    setAnnouncement("")
    requestAnimationFrame(() => setAnnouncement(text))
  }, [])

  const setAtBottom = React.useCallback((bottom: boolean) => {
    if (bottomRef.current === bottom) return
    bottomRef.current = bottom
    setAtBottomState(bottom)
    if (bottom) setUnread(0)
  }, [])

  const scrollToBottom = React.useCallback(
    (behavior: ScrollBehavior = "instant") => {
      const el = viewportRef.current
      if (!el) return
      stick.current = true
      setAtBottom(true)
      el.scrollTo({ top: el.scrollHeight, behavior })
    },
    [setAtBottom]
  )

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!viewport || !content) return
    // size changes (streaming text, images loading): follow if stuck, or hold the place after prepending
    const follow = () => {
      if (anchor.current !== null) {
        viewport.scrollTop = viewport.scrollHeight - anchor.current
        return
      }
      if (stick.current) viewport.scrollTop = viewport.scrollHeight
    }
    // new messages: always follow your own; count the others you haven't seen
    const added = (records: MutationRecord[]) => {
      for (const r of records)
        for (const node of r.addedNodes) {
          if (!(node instanceof HTMLElement) || node.dataset.slot !== "chat-message") continue
          if (node.dataset.from === "user" && anchor.current === null) scrollToBottom()
          else if (!stick.current && anchor.current === null) setUnread((n) => n + 1)
        }
    }
    follow()
    const resize = new ResizeObserver(follow)
    resize.observe(content)
    resize.observe(viewport)
    const mutation = new MutationObserver(added)
    mutation.observe(content, { childList: true })
    return () => {
      resize.disconnect()
      mutation.disconnect()
    }
  }, [scrollToBottom])

  const loadOlder = async () => {
    const el = viewportRef.current
    if (!el || !onLoadOlder || loadingOlder || !hasOlder) return
    anchor.current = el.scrollHeight - el.scrollTop
    setLoadingOlder(true)
    try {
      await onLoadOlder()
    } finally {
      // let the prepended rows lay out (the ResizeObserver restores the place) before letting go
      requestAnimationFrame(() => {
        anchor.current = null
        setLoadingOlder(false)
      })
    }
  }

  const onScroll = () => {
    const el = viewportRef.current
    if (!el || anchor.current !== null) return
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight <= STICK_THRESHOLD
    stick.current = bottom
    setAtBottom(bottom)
    if (el.scrollTop <= OLDER_THRESHOLD && el.scrollHeight > el.clientHeight) void loadOlder()
  }

  return (
    <div data-slot="chat-thread" data-layout={layout} className={cn("relative flex min-h-0 flex-col overflow-hidden", className)} {...props}>
      <div
        ref={viewportRef}
        data-slot="chat-thread-viewport"
        role="log"
        aria-relevant="additions"
        aria-busy={loadingOlder || undefined}
        tabIndex={0}
        onScroll={onScroll}
        className="glass-focus-inset min-h-0 flex-1 overflow-y-auto overscroll-contain [overflow-anchor:none] [scrollbar-width:thin]"
      >
        <div
          ref={contentRef}
          data-slot="chat-thread-content"
          className="flex min-h-full flex-col justify-end px-pad-sm pt-4 pb-[calc(var(--chat-thread-inset,0px)+1rem)]"
        >
          <ChatLayoutContext.Provider value={layout}>
            <ChatAnnounceContext.Provider value={announce}>{children}</ChatAnnounceContext.Provider>
          </ChatLayoutContext.Provider>
        </div>
      </div>
      <div data-slot="chat-thread-announcer" role="status" className="sr-only">
        {announcement}
      </div>
      {/* Liquid glass (the control layer) floating over the log; it materialises — grows in — rather than sliding. */}
      <button
        type="button"
        data-slot="chat-thread-jump"
        aria-label={unread ? `Jump to latest, ${unread} new` : "Jump to latest"}
        data-state={atBottom ? "closed" : "open"}
        tabIndex={atBottom ? -1 : 0}
        aria-hidden={atBottom || undefined}
        onClick={() => scrollToBottom("smooth")}
        className="glass-liquid glass-focus glass-materialize hit-area absolute bottom-[calc(var(--chat-thread-inset,0px)+0.75rem)] left-1/2 inline-flex h-control min-w-control -translate-x-1/2 items-center justify-center gap-1.5 rounded-button px-2.5 text-sm font-medium text-foreground transition-[scale] duration-(--glass-duration) ease-glass active:scale-(--glass-press-scale) data-[state=closed]:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
        data-glass-motion
      >
        <ArrowDownIcon />
        {unread ? (
          <span data-slot="chat-thread-unread" className="numeric-glass">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>
    </div>
  )
}

type ChatMessageStatus = "sending" | "failed" | "edited"

/**
 * One turn, an `article` named for its speaker. User turns sit on the right, the rest on the
 * left. `grouped` marks a follow-up from the same sender: the gap tightens, the avatar hides
 * and the bubble corners facing the sender square off so the run reads as one.
 * `streaming` marks a reply still arriving: it's `aria-busy` until it turns false, then its
 * full text is announced once. `status` shows sending, failed (with `onRetry`) or edited.
 */
function ChatMessage({
  className,
  from = "assistant",
  name,
  grouped = false,
  streaming = false,
  status,
  onRetry,
  avatar,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  from?: ChatFrom
  /** The speaker, for the article's label ("You" for user turns by default). */
  name?: string
  grouped?: boolean
  streaming?: boolean
  status?: ChatMessageStatus
  onRetry?: () => void
  avatar?: React.ReactNode
}) {
  const layout = React.useContext(ChatLayoutContext)
  const announce = React.useContext(ChatAnnounceContext)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const wasStreaming = React.useRef(streaming)
  React.useEffect(() => {
    if (wasStreaming.current && !streaming) {
      const text = contentRef.current?.textContent?.trim()
      if (text) announce?.(text)
    }
    wasStreaming.current = streaming
  }, [streaming, announce])
  const speaker = name ?? (from === "user" ? "You" : from === "system" ? "System" : "Assistant")
  return (
    <ChatMessageContext.Provider value={from}>
      <div
        data-slot="chat-message"
        data-from={from}
        data-layout={layout}
        data-grouped={grouped || undefined}
        data-streaming={streaming || undefined}
        data-status={status}
        role="article"
        aria-label={props["aria-label"] ?? speaker}
        aria-busy={streaming || undefined}
        className={cn(
          "group/chat-message flex w-full items-end gap-2 not-first:mt-3 data-grouped:mt-1 data-[from=system]:justify-center data-[from=user]:flex-row-reverse data-[status=sending]:opacity-70",
          // Document layout: assistant turns are full-width prose, the avatar on top.
          "data-[layout=document]:data-[from=assistant]:flex-col data-[layout=document]:data-[from=assistant]:items-start data-[layout=document]:data-[from=assistant]:not-first:mt-5",
          // Runs: square the sender-side corners between bubbles of the same sender.
          "data-grouped:data-[from=assistant]:**:data-[slot=chat-bubble]:rounded-ss-[calc(var(--glass-radius-surface)*0.25)] data-grouped:data-[from=user]:**:data-[slot=chat-bubble]:rounded-se-[calc(var(--glass-radius-surface)*0.25)]",
          "has-[+[data-grouped]]:data-[from=assistant]:**:data-[slot=chat-bubble]:rounded-es-[calc(var(--glass-radius-surface)*0.25)] has-[+[data-grouped]]:data-[from=user]:**:data-[slot=chat-bubble]:rounded-ee-[calc(var(--glass-radius-surface)*0.25)]",
          className
        )}
        {...props}
      >
        {avatar && from !== "system" ? (
          <div data-slot="chat-message-avatar" aria-hidden={grouped || undefined} className="flex shrink-0 group-data-grouped/chat-message:invisible group-data-[layout=document]/chat-message:group-data-[from=assistant]/chat-message:group-data-grouped/chat-message:hidden">
            {avatar}
          </div>
        ) : null}
        <div
          ref={contentRef}
          data-slot="chat-message-content"
          className="relative flex max-w-[min(80%,var(--chat-bubble-max,36rem))] min-w-0 flex-col items-start gap-1 group-data-[from=system]/chat-message:max-w-full group-data-[from=system]/chat-message:items-center group-data-[from=user]/chat-message:items-end group-data-[layout=document]/chat-message:group-data-[from=assistant]/chat-message:w-full group-data-[layout=document]/chat-message:group-data-[from=assistant]/chat-message:max-w-full"
        >
          {children}
          {status === "failed" ? (
            <div data-slot="chat-message-failed" role="alert" className="type-caption-2 flex items-center gap-1.5 px-1 text-destructive-ink">
              Not delivered
              {onRetry ? (
                <Button type="button" variant="link" size="xs" className="h-auto px-0" onClick={onRetry}>
                  <RotateCwIcon />
                  Retry
                </Button>
              ) : null}
            </div>
          ) : status ? (
            <div data-slot="chat-message-status" className="type-caption-2 px-1 text-muted-foreground">
              {status === "sending" ? "Sending…" : "Edited"}
            </div>
          ) : null}
        </div>
      </div>
    </ChatMessageContext.Provider>
  )
}

const chatBubbleVariants = cva("w-fit max-w-full rounded-surface-sm text-sm leading-snug break-words animate-[glass-fade_var(--glass-duration)_ease-out]", {
  variants: {
    variant: {
      user: "bg-primary px-pad-sm py-[calc(0.5rem*var(--glass-density))] text-primary-foreground selection:bg-primary-foreground/30",
      assistant: "bg-fill px-pad-sm py-[calc(0.5rem*var(--glass-density))] text-foreground",
      system: "text-center text-xs text-muted-foreground",
      // full-width prose: no bubble, the text sits on the pane
      document: "w-full text-base leading-relaxed text-foreground md:text-sm",
    },
  },
})

/**
 * The message body. Its look follows the enclosing `ChatMessage` (and the thread's layout)
 * unless `variant` says otherwise. Plain text keeps its line breaks; rich children (Markdown)
 * lay themselves out.
 */
function ChatBubble({ className, variant, children, ...props }: React.ComponentProps<"div"> & VariantProps<typeof chatBubbleVariants>) {
  const from = React.useContext(ChatMessageContext)
  const layout = React.useContext(ChatLayoutContext)
  const resolved = variant ?? (layout === "document" && from === "assistant" ? "document" : from)
  return (
    <div
      data-slot="chat-bubble"
      data-variant={resolved}
      data-glass-motion
      className={cn(chatBubbleVariants({ variant: resolved }), typeof children === "string" && "whitespace-pre-wrap", className)}
      {...props}
    >
      {children}
    </div>
  )
}

/** A timestamp or receipt ("Delivered", "Read 9:41") under a bubble. Pass `time` for a machine-readable `<time>`. */
function ChatMeta({ className, time, children, ...props }: React.ComponentProps<"div"> & { time?: Date | string }) {
  const stamp = time === undefined ? null : typeof time === "string" ? time : time.toISOString()
  return (
    <div data-slot="chat-meta" className={cn("type-caption-2 px-1 text-muted-foreground numeric-glass", className)} {...props}>
      {stamp ? <time dateTime={stamp}>{children ?? (time instanceof Date ? time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : time)}</time> : children}
    </div>
  )
}

/** A day separator ("Today") between hairlines. */
function ChatDivider({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-divider"
      role="separator"
      className={cn(
        "type-caption-2 my-4 flex items-center gap-3 font-medium text-muted-foreground first:mt-0 before:h-px before:flex-1 before:bg-separator after:h-px after:flex-1 after:bg-separator",
        className
      )}
      {...props}
    />
  )
}

/** Three bouncing dots in an assistant bubble. Put it in a `ChatMessage` while a reply is on its way. */
function ChatTyping({ className, name = "Assistant", ...props }: React.ComponentProps<"div"> & { name?: string }) {
  return (
    <ChatBubble
      data-slot="chat-typing"
      variant="assistant"
      role="status"
      aria-label={`${name} is typing`}
      className={cn("flex h-[calc(2.25rem*var(--glass-density))] items-center gap-1", className)}
      {...props}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          data-glass-motion
          className="size-1.5 rounded-full bg-muted-foreground opacity-60 animate-[glass-typing_1.2s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </ChatBubble>
  )
}

const ChatSuggestionsContext = React.createContext<((value: string) => void) | undefined>(undefined)

/**
 * A row of quick replies that scrolls sideways, snapping chip by chip, its edges fading.
 * Put it above the composer, outside the thread, so it isn't announced as a message.
 */
function ChatSuggestions({ className, onSelect, ...props }: Omit<React.ComponentProps<"div">, "onSelect"> & { onSelect?: (value: string) => void }) {
  return (
    <ChatSuggestionsContext.Provider value={onSelect}>
      <div
        data-slot="chat-suggestions"
        role="group"
        aria-label={props["aria-label"] ?? "Suggestions"}
        className={cn(
          "flex snap-x snap-proximity scroll-px-pad-sm gap-2 overflow-x-auto overscroll-x-contain px-pad-sm py-1 [mask-image:linear-gradient(to_right,transparent,#000_1rem,#000_calc(100%-1rem),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          className
        )}
        {...props}
      />
    </ChatSuggestionsContext.Provider>
  )
}

/** One quick reply. `value` defaults to its text. */
function ChatSuggestion({ className, value, children, onClick, ...props }: React.ComponentProps<typeof Button> & { value?: string }) {
  const onSelect = React.useContext(ChatSuggestionsContext)
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      data-slot="chat-suggestion"
      className={cn("shrink-0 snap-start", className)}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) onSelect?.(value ?? (typeof children === "string" ? children : ""))
      }}
      {...props}
    >
      {children}
    </Button>
  )
}

const chatComposerVariants = cva(
  // focus: the same outline as glass-focus, drawn on the field's container while the textarea has keyboard focus
  "flex w-full flex-col gap-1.5 rounded-surface-sm p-1.5 has-[textarea:disabled]:opacity-60 has-[textarea:focus-visible]:outline-(length:--glass-ring-width) has-[textarea:focus-visible]:outline-offset-2 has-[textarea:focus-visible]:outline-ring has-[textarea:focus-visible]:outline-solid data-dragging:outline-(length:--glass-ring-width) data-dragging:outline-ring data-dragging:outline-dashed",
  {
    variants: {
      variant: {
        inset: "bg-fill",
        // liquid glass: the control layer floating over the thread (inside it, fills only)
        floating: "glass-liquid",
      },
    },
    defaultVariants: { variant: "inset" },
  }
)

type ChatComposerProps = Omit<React.ComponentProps<"form">, "onSubmit"> &
  VariantProps<typeof chatComposerVariants> & {
    /** Called with the trimmed text. The field clears itself unless `value` is controlled. */
    onSubmit?: (text: string) => void
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    disabled?: boolean
    /** AI SDK `status`: while `submitted` or `streaming` the send button becomes Stop. */
    status?: ChatStatus
    onStop?: () => void
    /** Before the field — an attach button, say. */
    leading?: React.ReactNode
    /** After the field, before send — a model picker or a mic. */
    trailing?: React.ReactNode
    /** Files pasted or dropped on the composer. Without it, pasting files does nothing special. */
    onAttach?: (files: File[]) => void
    /** Attachment chips (`ChatAttachment`) shown above the field. A composer with attachments can send without text. */
    attachments?: React.ReactNode
    /** Shows a counter near the limit and refuses to send past it. */
    maxLength?: number
    /** Enter sends (Shift+Enter breaks a line). Off: Enter breaks a line and ⌘/Ctrl+Enter sends. */
    submitOnEnter?: boolean
    textareaProps?: React.ComponentProps<"textarea">
  }

/**
 * The message field: grows with its text, Enter sends, Shift+Enter breaks a line,
 * and IME composition (Japanese, Chinese…) never sends early. While a reply streams
 * the send button turns into Stop. Paste or drop files to attach them. `floating`
 * makes it a liquid-glass capsule (the control layer) to sit over the bottom of a thread.
 */
function ChatComposer({
  className,
  variant = "inset",
  onSubmit,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Message",
  disabled = false,
  status = "ready",
  onStop,
  leading,
  trailing,
  onAttach,
  attachments,
  maxLength,
  submitOnEnter = true,
  textareaProps,
  ...props
}: ChatComposerProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const [dragging, setDragging] = React.useState(false)
  const text = value ?? inner
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const { ref: outerRef, ...areaProps } = textareaProps ?? {}
  const hasAttachments = React.Children.toArray(attachments).length > 0
  const busy = status === "submitted" || status === "streaming"
  const over = maxLength !== undefined && text.length > maxLength
  const empty = text.trim() === "" && !hasAttachments

  // your ref (textareaProps.ref) and the composer's both point at the field
  React.useImperativeHandle(outerRef, () => textareaRef.current as HTMLTextAreaElement, [])

  const setText = (next: string) => {
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }

  // Grow with the text (capped by max-height) where `field-sizing: content` isn't supported.
  React.useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el || (typeof CSS !== "undefined" && CSS.supports?.("field-sizing", "content"))) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [text])

  const send = () => {
    if (empty || disabled || busy || over) return
    onSubmit?.(text.trim())
    setText("")
  }

  const filesOf = (list: DataTransfer | null) => (list ? Array.from(list.files) : [])

  return (
    <form
      data-slot="chat-composer"
      data-variant={variant}
      data-status={status}
      data-dragging={dragging || undefined}
      className={cn(chatComposerVariants({ variant }), className)}
      onSubmit={(e) => {
        e.preventDefault()
        send()
      }}
      onDragOver={
        onAttach
          ? (e) => {
              if (!e.dataTransfer.types.includes("Files")) return
              e.preventDefault()
              setDragging(true)
            }
          : undefined
      }
      onDragLeave={onAttach ? () => setDragging(false) : undefined}
      onDrop={
        onAttach
          ? (e) => {
              const files = filesOf(e.dataTransfer)
              setDragging(false)
              if (!files.length) return
              e.preventDefault()
              onAttach(files)
            }
          : undefined
      }
      {...props}
    >
      {hasAttachments ? (
        <div data-slot="chat-composer-attachments" className="flex flex-wrap gap-1.5 px-1 pt-1">
          {attachments}
        </div>
      ) : null}
      <div data-slot="chat-composer-row" className="flex w-full items-end gap-1.5">
        {leading}
        <textarea
          ref={textareaRef}
          data-slot="chat-composer-input"
          rows={1}
          aria-label={placeholder}
          placeholder={placeholder}
          disabled={disabled}
          enterKeyHint={submitOnEnter ? "send" : "enter"}
          aria-invalid={over || undefined}
          {...areaProps}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            areaProps.onChange?.(e)
          }}
          onPaste={(e) => {
            areaProps.onPaste?.(e)
            const files = filesOf(e.clipboardData)
            if (!onAttach || e.defaultPrevented || !files.length) return
            e.preventDefault()
            onAttach(files)
          }}
          onKeyDown={(e) => {
            areaProps.onKeyDown?.(e)
            if (e.defaultPrevented || e.key !== "Enter" || e.nativeEvent.isComposing || e.keyCode === 229) return
            const mod = e.metaKey || e.ctrlKey
            if (submitOnEnter ? !e.shiftKey : mod) {
              e.preventDefault()
              send()
            }
          }}
          className={cn(
            "max-h-40 min-h-control-sm flex-1 resize-none bg-transparent px-2 py-[calc((2rem*var(--glass-density)-1.25rem)/2)] text-base leading-5 text-foreground caret-primary [field-sizing:content] placeholder:text-glass-label-tertiary selection:bg-primary/25 focus-visible:outline-hidden disabled:cursor-not-allowed md:text-sm md:leading-5",
            areaProps.className
          )}
        />
        {maxLength !== undefined && text.length >= maxLength * 0.8 ? (
          <span data-slot="chat-composer-count" aria-live="polite" className={cn("type-caption-2 self-center numeric-glass text-muted-foreground", over && "text-destructive-ink")}>
            {maxLength - text.length}
          </span>
        ) : null}
        {trailing}
        {busy && onStop ? (
          <Button type="button" variant="tinted" size="icon-sm" aria-label="Stop" data-slot="chat-composer-stop" onClick={onStop}>
            <SquareIcon className="fill-current" />
          </Button>
        ) : (
          <Button type="submit" variant="tinted" size="icon-sm" aria-label="Send" disabled={disabled || empty || busy || over} data-slot="chat-composer-send">
            <ArrowUpIcon />
          </Button>
        )}
      </div>
    </form>
  )
}

export {
  ChatThread,
  ChatMessage,
  ChatBubble,
  ChatMeta,
  ChatDivider,
  ChatTyping,
  ChatSuggestions,
  ChatSuggestion,
  ChatComposer,
  chatBubbleVariants,
  chatComposerVariants,
}
export type { ChatFrom, ChatLayout, ChatStatus, ChatMessageStatus }
