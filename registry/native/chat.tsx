import * as React from "react"
import { Platform, ScrollView, StyleSheet, TextInput, View, type NativeScrollEvent, type NativeSyntheticEvent, type TextInputProps, type ViewProps, type ViewStyle } from "react-native"
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated"
import { FlashList, type FlashListRef } from "@shopify/flash-list"
import { KeyboardStickyView } from "react-native-keyboard-controller"
import { ArrowDownIcon, ArrowUpIcon, RotateCwIcon, SquareIcon } from "lucide-react-native"

import { HIT_MIN, announce, hitSlop, useReducedMotion } from "@/components/glass/native/a11y"
import { Button } from "@/components/glass/native/button"
import { Glass, canFade } from "@/components/glass/native/glass"
import { Press } from "@/components/glass/native/press"
import { GText, alpha, useUI, web, type UI } from "@/components/glass/native/ui"

/**
 * A conversation in parts. It renders whatever you pass — local state, a socket,
 * or AI SDK's `useChat` — and owns no messages or networking.
 *
 *   <ChatThread layout="document">
 *     <ChatDivider>Today</ChatDivider>
 *     <ChatMessage key="1" from="assistant" avatar={<Avatar>…</Avatar>}>
 *       <ChatBubble>How did the evening go?</ChatBubble>
 *     </ChatMessage>
 *     <ChatMessage key="2" from="user">
 *       <ChatBubble>Wrote three lines.</ChatBubble>
 *       <ChatMeta>Read</ChatMeta>
 *     </ChatMessage>
 *   </ChatThread>
 *   <ChatComposer status={status} onStop={stop} onSubmit={send} />
 */

type ChatFrom = "user" | "assistant" | "system"
type ChatLayout = "bubble" | "document"
/** AI SDK `useChat().status`. */
type ChatStatus = "ready" | "submitted" | "streaming" | "error"
type ChatMessageStatus = "sending" | "failed" | "edited"

const ChatMessageContext = React.createContext<{ from: ChatFrom; grouped: boolean; nextGrouped: boolean }>({ from: "assistant", grouped: false, nextGrouped: false })
const ChatLayoutContext = React.createContext<ChatLayout>("bubble")
/** Per row: whether the next row is a grouped turn, and whether this row is the first. */
const RowContext = React.createContext<{ first: boolean; nextGrouped: boolean }>({ first: false, nextGrouped: false })
/** True once the thread has shown its first rows — later assistant turns are announced on arrival. */
const ThreadLiveContext = React.createContext<React.RefObject<boolean> | null>(null)

/** Pixels from the bottom that still count as "at the bottom". */
const STICK_THRESHOLD = 32

const bubbleRadius = (ui: UI) => Math.round(ui.radius.surface * 0.75)

type ChatThreadProps = ViewProps & {
  /** `bubble` (messages app) or `document` (assistant turns as full-width prose, as modern AI chats). */
  layout?: ChatLayout
  /** Room for a composer floating over the thread's bottom edge. */
  inset?: number
  /** Called when the reader scrolls near the top. Prepend older messages; the reading position is kept. */
  onLoadOlder?: () => void | Promise<void>
  /** Whether there is older history to load; `onLoadOlder` isn't called once false. */
  hasOlder?: boolean
}

const keyOf = (child: React.ReactNode, i: number) => (React.isValidElement(child) && child.key != null ? String(child.key) : `row-${i}`)

/**
 * The scrolling log, virtualised (FlashList v2) and rendered from the bottom. Sticks to
 * the newest message while you're at the bottom (and whenever you send one); scroll up
 * to read back and a liquid "jump to latest" button materialises, counting messages that
 * arrived since. Prepending older history keeps your place. Dragging the log down
 * dismisses the keyboard interactively on iOS. Give each `ChatMessage` a stable `key`.
 *
 * VoiceOver/TalkBack hear each new assistant turn once it's complete (`announce()`);
 * a `streaming` turn stays busy until it finishes.
 */
function ChatThread({ style, children, layout = "bubble", inset = 0, onLoadOlder, hasOlder = true, ...props }: ChatThreadProps) {
  const ui = useUI()
  const still = useReducedMotion()
  const listRef = React.useRef<FlashListRef<React.ReactNode>>(null)
  const stick = React.useRef(true)
  const live = React.useRef(false)
  const [atBottom, setAtBottom] = React.useState(true)
  const [unread, setUnread] = React.useState(0)
  const loading = React.useRef(false)

  const kids = React.Children.toArray(children)
  const messages = kids.filter((c): c is React.ReactElement<ChatMessageProps> => React.isValidElement(c) && c.type === ChatMessage)
  const last = messages[messages.length - 1]
  const lastKey = React.useRef<React.Key | null>(last?.key ?? null)
  const count = React.useRef(messages.length)

  React.useEffect(() => {
    live.current = true
  }, [])

  const scrollToBottom = React.useCallback(
    (animated = false) => {
      stick.current = true
      setAtBottom(true)
      setUnread(0)
      listRef.current?.scrollToEnd({ animated: animated && !still })
    },
    [still]
  )

  // new messages: always follow your own; count the others you haven't seen
  React.useEffect(() => {
    const added = messages.length - count.current
    count.current = messages.length
    if (!last || last.key === lastKey.current) return
    lastKey.current = last.key
    if (last.props.from === "user") requestAnimationFrame(() => scrollToBottom())
    else if (!stick.current && added > 0) setUnread((n) => n + added)
  }, [messages.length, last, scrollToBottom])

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent
    const bottom = contentSize.height - contentOffset.y - layoutMeasurement.height <= STICK_THRESHOLD
    stick.current = bottom
    if (bottom !== atBottom) setAtBottom(bottom)
    if (bottom && unread) setUnread(0)
  }

  const loadOlder = async () => {
    if (!onLoadOlder || !hasOlder || loading.current) return
    loading.current = true
    try {
      await onLoadOlder()
    } finally {
      loading.current = false
    }
  }

  return (
    <View style={[{ position: "relative", flex: 1, minHeight: 0, overflow: "hidden" }, style]} {...props}>
      <ChatLayoutContext.Provider value={layout}>
        <ThreadLiveContext.Provider value={live}>
          <FlashList
            ref={listRef}
            data={kids}
            keyExtractor={(child, i) => keyOf(child, i)}
            renderItem={({ item, index }) => {
              const next = kids[index + 1]
              const nextGrouped = React.isValidElement<ChatMessageProps>(next) && next.type === ChatMessage && !!next.props.grouped
              return <RowContext.Provider value={{ first: index === 0, nextGrouped }}>{item}</RowContext.Provider>
            }}
            role="log"
            maintainVisibleContentPosition={{ startRenderingFromBottom: true, autoscrollToBottomThreshold: 0.1, animateAutoScrollToBottom: !still }}
            onStartReached={onLoadOlder && hasOlder ? () => void loadOlder() : undefined}
            onStartReachedThreshold={0.2}
            onScroll={onScroll}
            scrollEventThrottle={32}
            onContentSizeChange={() => {
              if (stick.current) listRef.current?.scrollToEnd({ animated: false })
            }}
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: ui.pad.sm, paddingTop: 16, paddingBottom: inset + 16 }}
          />
        </ThreadLiveContext.Provider>
      </ChatLayoutContext.Provider>
      {/* Liquid glass (the control layer) over the log: it materialises, never fades. */}
      <View
        pointerEvents={atBottom ? "none" : "box-none"}
        accessibilityElementsHidden={atBottom}
        importantForAccessibility={atBottom ? "no-hide-descendants" : "auto"}
        style={{ position: "absolute", bottom: inset + 12, alignSelf: "center" }}
      >
        <Glass variant="liquid" interactive visible={!atBottom} radius={ui.radius.button}>
          <Press
            accessibilityLabel={unread ? `Jump to latest, ${unread} new` : "Jump to latest"}
            liquid
            onPress={() => scrollToBottom(true)}
            hitSlop={hitSlop(ui.control.default)}
            style={{ height: ui.control.default, minWidth: ui.control.default, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <ArrowDownIcon size={16} color={ui.foreground} />
            {unread ? (
              <GText size="sm" weight="500" style={{ fontVariant: ["tabular-nums"] }}>
                {unread > 99 ? "99+" : String(unread)}
              </GText>
            ) : null}
          </Press>
        </Glass>
      </View>
    </View>
  )
}

type ChatMessageProps = ViewProps & {
  from?: ChatFrom
  name?: string
  grouped?: boolean
  streaming?: boolean
  avatar?: React.ReactNode
  /** Delivery state under the bubble: sending (dimmed), failed (with `onRetry`) or edited. */
  status?: ChatMessageStatus
  onRetry?: () => void
}

/** The plain text inside a tree of elements — what a finished message announces. */
function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join(" ")
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children)
  return ""
}

/**
 * One turn, named for its speaker. User turns sit at the end, the rest at the start.
 * `grouped` marks a follow-up from the same sender: the gap tightens, the avatar hides
 * and the bubble corners facing the sender square off so the run reads as one.
 * `streaming` marks a reply still arriving: it's busy until it turns false, then its
 * full text is announced once. `status` shows sending, failed (with `onRetry`) or edited.
 */
function ChatMessage({ style, from = "assistant", name, grouped = false, streaming = false, avatar, status, onRetry, children, ...props }: ChatMessageProps) {
  const ui = useUI()
  const { first, nextGrouped } = React.useContext(RowContext)
  const layout = React.useContext(ChatLayoutContext)
  const live = React.useContext(ThreadLiveContext)
  const doc = layout === "document" && from === "assistant"
  const wasStreaming = React.useRef<boolean | null>(null)
  React.useEffect(() => {
    const finished = wasStreaming.current === true && !streaming
    // a complete assistant turn arriving after the thread is up (native: the web log announces additions itself)
    const arrived = wasStreaming.current === null && !streaming && from === "assistant" && !!live?.current && Platform.OS !== "web"
    if (finished || arrived) {
      const text = textOf(children).replace(/\s+/g, " ").trim()
      if (text) announce(text)
    }
    wasStreaming.current = streaming
  }, [streaming, children, from, live])
  return (
    <ChatMessageContext.Provider value={{ from, grouped, nextGrouped }}>
      <View
        style={[
          {
            width: "100%",
            flexDirection: doc ? "column" : from === "user" ? "row-reverse" : "row",
            alignItems: doc ? "flex-start" : "flex-end",
            justifyContent: from === "system" ? "center" : "flex-start",
            gap: 8,
            marginTop: first ? 0 : grouped ? 4 : doc ? 20 : 12,
            opacity: status === "sending" ? 0.7 : 1,
          },
          style,
        ]}
        role="article"
        aria-label={name ?? (from === "user" ? "You" : from === "system" ? "System" : "Assistant")}
        aria-busy={streaming || undefined}
        {...props}
      >
        {avatar && from !== "system" && !(doc && grouped) ? (
          <View accessibilityElementsHidden={grouped} importantForAccessibility={grouped ? "no-hide-descendants" : "auto"} style={{ flexShrink: 0, opacity: grouped ? 0 : 1 }}>
            {avatar}
          </View>
        ) : null}
        <View
          style={{
            maxWidth: from === "system" || doc ? "100%" : "80%",
            width: doc ? "100%" : undefined,
            minWidth: 0,
            flexShrink: 1,
            gap: 4,
            alignItems: from === "system" ? "center" : from === "user" ? "flex-end" : "flex-start",
          }}
        >
          {children}
          {status === "failed" ? (
            <View role="alert" style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 4 }}>
              <GText size="xs" color={ui.destructive}>
                Not delivered
              </GText>
              {onRetry ? (
                <Button variant="link" size="xs" onPress={onRetry} style={{ paddingHorizontal: 0, height: undefined }}>
                  <RotateCwIcon />
                  Retry
                </Button>
              ) : null}
            </View>
          ) : status ? (
            <GText tone="muted" style={{ fontSize: 11, lineHeight: 14, paddingHorizontal: 4 }}>
              {status === "sending" ? "Sending…" : "Edited"}
            </GText>
          ) : null}
        </View>
      </View>
    </ChatMessageContext.Provider>
  )
}

type BubbleVariant = "user" | "assistant" | "system" | "document"

function chatBubbleVariants(ui: UI, { variant = "assistant" }: { variant?: BubbleVariant } = {}) {
  const pad = { paddingHorizontal: ui.pad.sm, paddingVertical: Math.round(8 * ui.density) }
  const container: ViewStyle =
    variant === "user" ? { backgroundColor: ui.primary, ...pad } : variant === "assistant" ? { backgroundColor: ui.fill, ...pad } : variant === "document" ? { width: "100%" } : {}
  const text = { color: variant === "user" ? ui.primaryForeground : variant === "system" ? ui.mutedForeground : ui.foreground }
  const size = variant === "system" ? ("xs" as const) : variant === "document" ? ("base" as const) : ("sm" as const)
  return { container: { maxWidth: "100%", borderRadius: bubbleRadius(ui), borderCurve: "continuous", ...container } as ViewStyle, text, size }
}

/** Rises a bubble in once (and fades it where nothing liquid can be inside), as the web `glass-fade` does. */
function useEntrance() {
  const still = useReducedMotion()
  const ui = useUI()
  const v = useSharedValue(still ? 1 : 0)
  const fade = canFade()
  React.useEffect(() => {
    v.set(withTiming(1, { duration: still ? 0 : ui.motion.duration, easing: Easing.out(Easing.cubic) }))
  }, [v, still, ui.motion.duration])
  return useAnimatedStyle(() => ({ opacity: fade ? v.value : 1, transform: [{ translateY: (1 - v.value) * 4 }] }))
}

/**
 * The message body. Its look follows the enclosing `ChatMessage` (and the thread's layout)
 * unless `variant` says otherwise. Plain text is selectable; rich children lay themselves out.
 * Corners facing the sender square off in a grouped run, on the logical (RTL-aware) side.
 */
function ChatBubble({ style, variant, children, ...props }: ViewProps & { variant?: BubbleVariant }) {
  const ui = useUI()
  const { from, grouped, nextGrouped } = React.useContext(ChatMessageContext)
  const layout = React.useContext(ChatLayoutContext)
  const resolved = variant ?? (layout === "document" && from === "assistant" ? "document" : from)
  const v = chatBubbleVariants(ui, { variant: resolved })
  const square = Math.round(ui.radius.surface * 0.25)
  const corners: ViewStyle =
    resolved === "assistant"
      ? { ...(grouped ? { borderTopStartRadius: square } : null), ...(nextGrouped ? { borderBottomStartRadius: square } : null) }
      : resolved === "user"
        ? { ...(grouped ? { borderTopEndRadius: square } : null), ...(nextGrouped ? { borderBottomEndRadius: square } : null) }
        : {}
  const entrance = useEntrance()
  const kids = React.Children.toArray(children)
  const textOnly = kids.length > 0 && kids.every((c) => typeof c === "string" || typeof c === "number")
  return (
    <Animated.View style={[v.container, corners, entrance, style]} {...props}>
      {textOnly ? (
        <GText size={v.size} color={v.text.color} align={resolved === "system" ? "center" : undefined} selectable style={{ lineHeight: Math.round(ui.text[v.size] * (resolved === "document" ? 1.6 : 1.35)) }}>
          {kids.join("")}
        </GText>
      ) : (
        children
      )}
    </Animated.View>
  )
}

/** A timestamp or receipt ("Delivered", "Read 9:41") under a bubble. Pass `time` to format a time for you. */
function ChatMeta({ style, time, children, ...props }: ViewProps & { time?: Date | string }) {
  const label = children ?? (time instanceof Date ? time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : time)
  return (
    <View style={[{ paddingHorizontal: 4 }, style]} {...props}>
      <GText tone="muted" style={{ fontSize: 11, lineHeight: 14, fontVariant: ["tabular-nums"] }}>
        {label}
      </GText>
    </View>
  )
}

/** A day separator ("Today") between hairlines. */
function ChatDivider({ style, children, ...props }: ViewProps) {
  const ui = useUI()
  const { first } = React.useContext(RowContext)
  const line = { height: StyleSheet.hairlineWidth, flex: 1, backgroundColor: ui.glassBorder }
  return (
    <View style={[{ marginTop: first ? 0 : 16, marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 12 }, style]} {...props}>
      <View style={line} />
      <GText tone="muted" weight="500" style={{ fontSize: 11, lineHeight: 14 }}>
        {children}
      </GText>
      <View style={line} />
    </View>
  )
}

function TypingDot({ index }: { index: number }) {
  const ui = useUI()
  const still = useReducedMotion()
  const v = useSharedValue(0)
  React.useEffect(() => {
    if (still) return
    const ease = Easing.inOut(Easing.ease)
    v.set(withDelay(index * 150, withRepeat(withSequence(withTiming(1, { duration: 300, easing: ease }), withTiming(0, { duration: 300, easing: ease }), withTiming(0, { duration: 600 })), -1)))
  }, [v, index, still])
  const anim = useAnimatedStyle(() => ({ opacity: 0.6 + v.value * 0.4, transform: [{ translateY: -3 * v.value }] }))
  return <Animated.View style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: ui.mutedForeground }, anim]} />
}

/** Three bouncing dots in an assistant bubble. Put it in a `ChatMessage` while a reply is on its way. */
function ChatTyping({ style, name = "Assistant", ...props }: ViewProps & { name?: string }) {
  return (
    <ChatBubble
      variant="assistant"
      role="status"
      accessibilityLabel={`${name} is typing`}
      style={[{ height: 36, flexDirection: "row", alignItems: "center", gap: 4 }, style]}
      {...props}
    >
      {[0, 1, 2].map((i) => (
        <TypingDot key={i} index={i} />
      ))}
    </ChatBubble>
  )
}

const ChatSuggestionsContext = React.createContext<((value: string) => void) | undefined>(undefined)

/** A row of quick replies that scrolls sideways. `onSelect` receives the chosen suggestion's value. */
function ChatSuggestions({ style, onSelect, accessibilityLabel = "Suggestions", children, ...props }: ViewProps & { onSelect?: (value: string) => void }) {
  const ui = useUI()
  return (
    <ChatSuggestionsContext.Provider value={onSelect}>
      <View role="group" accessibilityLabel={accessibilityLabel} style={style} {...props}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: ui.pad.sm, paddingVertical: 4 }}>
          {children}
        </ScrollView>
      </View>
    </ChatSuggestionsContext.Provider>
  )
}

/** One quick reply. `value` defaults to its text. */
function ChatSuggestion({ style, value, children, onPress, ...props }: React.ComponentProps<typeof Button> & { value?: string }) {
  const onSelect = React.useContext(ChatSuggestionsContext)
  return (
    <Button
      variant="secondary"
      size="sm"
      style={[{ flexShrink: 0 }, style]}
      onPress={(e) => {
        onPress?.(e)
        onSelect?.(value ?? (typeof children === "string" ? children : ""))
      }}
      {...props}
    >
      {children}
    </Button>
  )
}

type ComposerVariant = "inset" | "floating"

function chatComposerVariants(ui: UI, { variant = "inset" }: { variant?: ComposerVariant } = {}): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    padding: 6,
    borderRadius: bubbleRadius(ui),
    borderCurve: "continuous",
    backgroundColor: variant === "inset" ? ui.fill : "transparent",
  }
}

type ChatComposerProps = Omit<ViewProps, "children"> & {
  variant?: ComposerVariant
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
  /** Attachment chips (`ChatAttachment`) above the field. A composer with attachments can send without text. */
  attachments?: React.ReactNode
  /** Shows a counter near the limit and refuses to send past it. */
  maxLength?: number
  /**
   * Return sends. Default: on for the web (Shift+Enter breaks a line), off on iOS/Android,
   * where Return breaks a line like Messages and the send button sends.
   */
  submitOnEnter?: boolean
  /**
   * Ride on top of the keyboard (`KeyboardStickyView`; needs `KeyboardProvider` at the app root).
   * Defaults to on for `floating`. Native only.
   */
  sticky?: boolean
  textInputProps?: TextInputProps
}

/** Line height and the 160px cap from the web `max-h-40`. */
const LINE = 20
const MAX_FIELD = 160

/**
 * The message field: grows with its text; Return breaks a line on a phone and sends on
 * the web (`submitOnEnter`); IME composition never sends early. While a reply streams the
 * send button turns into Stop. `floating` makes it a liquid-glass capsule (the control
 * layer) riding on the keyboard over the bottom of a thread.
 */
function ChatComposer({
  style,
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
  attachments,
  maxLength,
  submitOnEnter = Platform.OS === "web",
  sticky = variant === "floating",
  textInputProps,
  ...props
}: ChatComposerProps) {
  const ui = useUI()
  const [inner, setInner] = React.useState(defaultValue)
  const [focused, setFocused] = React.useState(false)
  const [height, setHeight] = React.useState(LINE)
  const text = value ?? inner
  const hasAttachments = React.Children.toArray(attachments).length > 0
  const over = maxLength !== undefined && text.length > maxLength
  const empty = text.trim() === "" && !hasAttachments
  const field = ui.control.sm

  const setText = (next: string) => {
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }

  const busy = status === "submitted" || status === "streaming"
  const send = () => {
    if (empty || disabled || busy || over) return
    onSubmit?.(text.trim())
    setText("")
  }

  const ring: ViewStyle = focused ? { borderWidth: 2, borderColor: alpha(ui.ring, 0.4) } : { borderWidth: 2, borderColor: "transparent" }
  // 32pt buttons, 44pt targets (NAT-65)
  const slop = hitSlop(ui.control.sm, ui.control.sm, HIT_MIN)
  const near = maxLength !== undefined && text.length >= maxLength * 0.8
  const row = (
    <>
      {leading}
      <TextInput
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        placeholderTextColor={alpha(ui.mutedForeground, 0.8)}
        editable={!disabled}
        multiline
        enterKeyHint={submitOnEnter ? "send" : "enter"}
        submitBehavior={Platform.OS === "web" ? undefined : submitOnEnter ? "submit" : "newline"}
        selectionColor={ui.primary}
        cursorColor={ui.primary}
        {...textInputProps}
        value={text}
        onChangeText={(t) => {
          setText(t)
          textInputProps?.onChangeText?.(t)
        }}
        onSubmitEditing={(e) => {
          textInputProps?.onSubmitEditing?.(e)
          if (submitOnEnter) send()
        }}
        onKeyPress={(e) => {
          textInputProps?.onKeyPress?.(e)
          if (Platform.OS !== "web") return
          const ev = e.nativeEvent as unknown as { key: string; shiftKey?: boolean; metaKey?: boolean; ctrlKey?: boolean; isComposing?: boolean; keyCode?: number }
          if (ev.key !== "Enter" || ev.isComposing || ev.keyCode === 229) return
          if (submitOnEnter ? !ev.shiftKey : ev.metaKey || ev.ctrlKey) {
            e.preventDefault()
            send()
          }
        }}
        onFocus={(e) => {
          setFocused(true)
          textInputProps?.onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          textInputProps?.onBlur?.(e)
        }}
        onContentSizeChange={(e) => {
          setHeight(Math.min(MAX_FIELD, Math.max(LINE, e.nativeEvent.contentSize.height)))
          textInputProps?.onContentSizeChange?.(e)
        }}
        style={[
          {
            flex: 1,
            minHeight: field,
            maxHeight: MAX_FIELD,
            height: Math.max(field, height + (field - LINE)),
            paddingHorizontal: 8,
            paddingVertical: (field - LINE) / 2,
            fontSize: Platform.OS === "web" ? ui.text.sm : ui.text.base,
            lineHeight: LINE,
            color: ui.foreground,
          },
          web({ outlineStyle: "none", resize: "none", cursor: disabled ? "not-allowed" : "text" }),
          textInputProps?.style,
        ]}
      />
      {trailing}
      {near ? (
        <GText size="xs" color={over ? ui.destructive : ui.mutedForeground} style={{ alignSelf: "center", fontVariant: ["tabular-nums"] }} accessibilityLabel={`${text.length} of ${maxLength} characters`}>
          {String(maxLength! - text.length)}
        </GText>
      ) : null}
      {busy && onStop ? (
        <Button variant="tinted" size="icon-sm" accessibilityLabel="Stop" hitSlop={slop} onPress={onStop}>
          <SquareIcon />
        </Button>
      ) : (
        <Button variant="tinted" size="icon-sm" accessibilityLabel="Send" hitSlop={slop} disabled={disabled || empty || busy || over} onPress={send}>
          <ArrowUpIcon />
        </Button>
      )}
    </>
  )
  const base = chatComposerVariants(ui, { variant })
  const body = (
    <View style={[{ gap: 6 }, ring, disabled ? { opacity: 0.6 } : null, { borderRadius: base.borderRadius }]}>
      {hasAttachments ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 6, paddingTop: 6 }}>
          {attachments}
        </ScrollView>
      ) : null}
      <View style={[base, { backgroundColor: "transparent", borderRadius: undefined }]}>{row}</View>
    </View>
  )
  const stick = sticky && Platform.OS !== "web"
  // when riding the keyboard, your style (position, insets) goes on the sticky wrapper
  const own = stick ? null : style
  const composer =
    variant === "floating" ? (
      // the pane never dims (Liquid Glass vanishes under opacity) — only its contents do
      <Glass variant="liquid" radius={base.borderRadius as number} style={[{ width: "100%" }, own]} {...props}>
        {body}
      </Glass>
    ) : (
      <View style={[{ width: "100%", backgroundColor: base.backgroundColor, borderRadius: base.borderRadius, borderCurve: "continuous" }, own]} {...props}>
        {body}
      </View>
    )
  if (!stick) return composer
  return (
    <KeyboardStickyView offset={{ closed: 0, opened: 8 }} style={style}>
      {composer}
    </KeyboardStickyView>
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
