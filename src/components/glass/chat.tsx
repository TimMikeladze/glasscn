"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"

import { Button } from "@/components/glass/button"

/**
 * A conversation in parts. It renders whatever you pass — local state, a socket,
 * or AI SDK's `useChat` — and owns no messages or networking.
 *
 *   <ChatThread>
 *     <ChatDivider>Today</ChatDivider>
 *     <ChatMessage from="assistant" avatar={<Avatar>…</Avatar>}>
 *       <ChatBubble>How did the evening go?</ChatBubble>
 *     </ChatMessage>
 *     <ChatMessage from="user">
 *       <ChatBubble>Wrote three lines.</ChatBubble>
 *       <ChatMeta>Read</ChatMeta>
 *     </ChatMessage>
 *   </ChatThread>
 *   <ChatComposer onSubmit={send} />
 */

type ChatFrom = "user" | "assistant" | "system"

const ChatMessageContext = React.createContext<ChatFrom>("assistant")

/** Pixels from the bottom that still count as "at the bottom". */
const STICK_THRESHOLD = 32

/**
 * The scrolling log. Sticks to the newest message while you're at the bottom (and
 * whenever you send one); scroll up to read back and a "jump to latest" button appears.
 * Set `--chat-thread-inset` to leave room for a composer floating over its bottom edge.
 */
function ChatThread({ className, children, ...props }: React.ComponentProps<"div">) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const stick = React.useRef(true)
  const lastMessage = React.useRef<Element | null>(null)
  const [atBottom, setAtBottom] = React.useState(true)

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = "instant") => {
    const el = viewportRef.current
    if (!el) return
    stick.current = true
    setAtBottom(true)
    el.scrollTo({ top: el.scrollHeight, behavior })
  }, [])

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!viewport || !content) return
    const follow = () => {
      const messages = content.querySelectorAll("[data-slot=chat-message]")
      const last = messages[messages.length - 1] ?? null
      const sentByUser = last !== lastMessage.current && last?.getAttribute("data-from") === "user"
      lastMessage.current = last
      if (stick.current || sentByUser) scrollToBottom()
    }
    follow()
    const observer = new ResizeObserver(follow)
    observer.observe(content)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [scrollToBottom])

  const onScroll = () => {
    const el = viewportRef.current
    if (!el) return
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight <= STICK_THRESHOLD
    stick.current = bottom
    setAtBottom(bottom)
  }

  return (
    <div data-slot="chat-thread" className={cn("relative flex min-h-0 flex-col overflow-hidden", className)} {...props}>
      <div
        ref={viewportRef}
        data-slot="chat-thread-viewport"
        role="log"
        aria-live="polite"
        tabIndex={0}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none [scrollbar-width:thin] focus-visible:ring-(length:--glass-ring-width) focus-visible:ring-ring/40 focus-visible:ring-inset"
      >
        <div
          ref={contentRef}
          data-slot="chat-thread-content"
          className="flex min-h-full flex-col justify-end px-pad-sm pt-4 pb-[calc(var(--chat-thread-inset,0px)+1rem)]"
        >
          {children}
        </div>
      </div>
      <Button
        type="button"
        variant="glass"
        size="icon"
        data-slot="chat-thread-jump"
        aria-label="Jump to latest"
        data-state={atBottom ? "hidden" : "visible"}
        tabIndex={atBottom ? -1 : 0}
        aria-hidden={atBottom || undefined}
        onClick={() => scrollToBottom("smooth")}
        className="absolute bottom-[calc(var(--chat-thread-inset,0px)+0.75rem)] left-1/2 -translate-x-1/2 [--glass-elevation:initial] [--glass-opacity:var(--glass-opacity-strong)] transition-[opacity,translate,scale] data-[state=hidden]:pointer-events-none data-[state=hidden]:translate-y-2 data-[state=hidden]:opacity-0"
        data-glass-motion
      >
        <ArrowDownIcon />
      </Button>
    </div>
  )
}

/**
 * One turn. User turns sit on the right, the rest on the left. `grouped` marks a
 * follow-up from the same sender: the gap tightens, the avatar hides and the
 * bubble corners facing the sender square off so the run reads as one.
 */
function ChatMessage({
  className,
  from = "assistant",
  grouped = false,
  avatar,
  children,
  ...props
}: React.ComponentProps<"div"> & { from?: ChatFrom; grouped?: boolean; avatar?: React.ReactNode }) {
  return (
    <ChatMessageContext.Provider value={from}>
      <div
        data-slot="chat-message"
        data-from={from}
        data-grouped={grouped || undefined}
        className={cn(
          "group/chat-message flex w-full items-end gap-2 not-first:mt-3 data-grouped:mt-1 data-[from=system]:justify-center data-[from=user]:flex-row-reverse",
          // Runs: square the sender-side corners between bubbles of the same sender.
          "data-grouped:data-[from=assistant]:**:data-[slot=chat-bubble]:rounded-ss-[calc(var(--glass-radius-surface)*0.25)] data-grouped:data-[from=user]:**:data-[slot=chat-bubble]:rounded-se-[calc(var(--glass-radius-surface)*0.25)]",
          "has-[+[data-grouped]]:data-[from=assistant]:**:data-[slot=chat-bubble]:rounded-es-[calc(var(--glass-radius-surface)*0.25)] has-[+[data-grouped]]:data-[from=user]:**:data-[slot=chat-bubble]:rounded-ee-[calc(var(--glass-radius-surface)*0.25)]",
          className
        )}
        {...props}
      >
        {avatar && from !== "system" ? (
          <div data-slot="chat-message-avatar" aria-hidden={grouped || undefined} className="flex shrink-0 group-data-grouped/chat-message:invisible">
            {avatar}
          </div>
        ) : null}
        <div
          data-slot="chat-message-content"
          className="flex max-w-[min(80%,36rem)] min-w-0 flex-col items-start gap-1 group-data-[from=system]/chat-message:max-w-full group-data-[from=system]/chat-message:items-center group-data-[from=user]/chat-message:items-end"
        >
          {children}
        </div>
      </div>
    </ChatMessageContext.Provider>
  )
}

const chatBubbleVariants = cva(
  "w-fit max-w-full rounded-surface-sm text-sm leading-snug break-words whitespace-pre-wrap animate-[glass-fade_var(--glass-duration)_ease-out]",
  {
    variants: {
      variant: {
        user: "bg-primary px-[calc(0.875rem*var(--glass-density))] py-[calc(0.5rem*var(--glass-density))] text-primary-foreground selection:bg-primary-foreground/30",
        assistant: "bg-fill px-[calc(0.875rem*var(--glass-density))] py-[calc(0.5rem*var(--glass-density))] text-foreground",
        system: "text-center text-xs text-muted-foreground",
      },
    },
  }
)

/** The message body. Its look follows the enclosing `ChatMessage` unless `variant` says otherwise. */
function ChatBubble({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof chatBubbleVariants>) {
  const from = React.useContext(ChatMessageContext)
  const resolved = variant ?? from
  return <div data-slot="chat-bubble" data-variant={resolved} data-glass-motion className={cn(chatBubbleVariants({ variant: resolved }), className)} {...props} />
}

/** A timestamp or receipt ("Delivered", "Read 9:41") under a bubble. */
function ChatMeta({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="chat-meta" className={cn("px-1 text-[0.7rem] text-muted-foreground numeric-glass", className)} {...props} />
}

/** A day separator ("Today") between hairlines. */
function ChatDivider({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-divider"
      className={cn(
        "my-4 flex items-center gap-3 text-[0.7rem] font-medium text-muted-foreground first:mt-0 before:h-px before:flex-1 before:bg-glass-border after:h-px after:flex-1 after:bg-glass-border",
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

/** A row of quick replies that scrolls sideways. `onSelect` receives the chosen suggestion's value. */
function ChatSuggestions({
  className,
  onSelect,
  ...props
}: Omit<React.ComponentProps<"div">, "onSelect"> & { onSelect?: (value: string) => void }) {
  return (
    <ChatSuggestionsContext.Provider value={onSelect}>
      <div
        data-slot="chat-suggestions"
        role="group"
        aria-label={props["aria-label"] ?? "Suggestions"}
        className={cn("flex gap-2 overflow-x-auto overscroll-x-contain px-pad-sm py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}
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
      className={cn("shrink-0", className)}
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
  "flex w-full items-end gap-1.5 rounded-surface-sm p-1.5 transition-shadow duration-(--glass-duration) ease-glass has-[textarea:focus-visible]:ring-(length:--glass-ring-width) has-[textarea:focus-visible]:ring-ring/40 has-[textarea:disabled]:opacity-60",
  {
    variants: {
      variant: {
        inset: "bg-fill",
        floating: "glass-strong",
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
    /** Before the field — an attach button, say. */
    leading?: React.ReactNode
    textareaProps?: React.ComponentProps<"textarea">
  }

/**
 * The message field: grows with its text, Enter sends, Shift+Enter breaks a line,
 * and IME composition (Japanese, Chinese…) never sends early. `floating` makes it
 * a strong-glass capsule to sit over the bottom of a thread.
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
  leading,
  textareaProps,
  ...props
}: ChatComposerProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const text = value ?? inner
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const empty = text.trim() === ""

  const setText = (next: string) => {
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }

  // Grow with the text (capped by max-height); works where `field-sizing` doesn't.
  React.useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [text])

  const send = () => {
    if (empty || disabled) return
    onSubmit?.(text.trim())
    setText("")
  }

  return (
    <form
      data-slot="chat-composer"
      data-variant={variant}
      className={cn(chatComposerVariants({ variant }), className)}
      onSubmit={(e) => {
        e.preventDefault()
        send()
      }}
      {...props}
    >
      {leading}
      <textarea
        ref={textareaRef}
        data-slot="chat-composer-input"
        rows={1}
        aria-label={placeholder}
        placeholder={placeholder}
        disabled={disabled}
        enterKeyHint="send"
        {...textareaProps}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          textareaProps?.onChange?.(e)
        }}
        onKeyDown={(e) => {
          textareaProps?.onKeyDown?.(e)
          if (e.defaultPrevented) return
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
            e.preventDefault()
            send()
          }
        }}
        className={cn(
          "max-h-40 min-h-control-sm flex-1 resize-none bg-transparent px-2 py-[calc((2rem*var(--glass-density)-1.25rem)/2)] text-base leading-5 text-foreground caret-primary outline-none placeholder:text-muted-foreground/80 selection:bg-primary/25 disabled:cursor-not-allowed md:text-sm md:leading-5",
          textareaProps?.className
        )}
      />
      <Button type="submit" size="icon-sm" aria-label="Send" disabled={disabled || empty} data-slot="chat-composer-send">
        <ArrowUpIcon />
      </Button>
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
