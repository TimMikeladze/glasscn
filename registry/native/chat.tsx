import * as React from "react"
import {
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type TextInputProps,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react-native"

import { Button } from "@/components/glass/native/button"
import { Glass, canFade } from "@/components/glass/native/glass"
import { useReduceMotion } from "@/components/glass/native/segmented-control"
import { GText, alpha, useUI, web, type UI } from "@/components/glass/native/ui"

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

const ChatMessageContext = React.createContext<{ from: ChatFrom; grouped: boolean; nextGrouped: boolean }>({ from: "assistant", grouped: false, nextGrouped: false })
/** Whether the following sibling is a grouped turn — CSS's `:has(+ [data-grouped])`. */
const NextGroupedContext = React.createContext(false)
/** Whether a turn is the thread's first child — CSS's `not-first:`. */
const FirstContext = React.createContext(false)

/** Pixels from the bottom that still count as "at the bottom". */
const STICK_THRESHOLD = 32

const bubbleRadius = (ui: UI) => Math.round(ui.radius.surface * 0.75)

/**
 * The scrolling log. Sticks to the newest message while you're at the bottom (and
 * whenever you send one); scroll up to read back and a "jump to latest" button appears.
 * `inset` leaves room for a composer floating over its bottom edge.
 */
function ChatThread({ style, children, inset = 0, ...props }: ViewProps & { inset?: number }) {
  const ui = useUI()
  const reduce = useReduceMotion()
  const scrollRef = React.useRef<ScrollView>(null)
  const stick = React.useRef(true)
  const lastKey = React.useRef<React.Key | null>(null)
  const [atBottom, setAtBottom] = React.useState(true)
  const [shown] = React.useState(() => new Animated.Value(0))

  const kids = React.Children.toArray(children)
  const messages = kids.filter((c): c is React.ReactElement<ChatMessageProps> => React.isValidElement(c) && c.type === ChatMessage)
  const last = messages[messages.length - 1]
  const lastInfo = last ? { key: last.key, from: last.props.from ?? "assistant" } : null

  const show = (visible: boolean) => {
    setAtBottom(!visible)
    Animated.timing(shown, { toValue: visible ? 1 : 0, duration: reduce.current ? 0 : ui.motion.duration, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start()
  }

  const scrollToBottom = (animated = false) => {
    stick.current = true
    if (!atBottom) show(false)
    scrollRef.current?.scrollToEnd({ animated: animated && !reduce.current })
  }

  const follow = () => {
    const sentByUser = lastInfo !== null && lastInfo.key !== lastKey.current && lastInfo.from === "user"
    lastKey.current = lastInfo?.key ?? null
    if (stick.current || sentByUser) scrollToBottom()
  }

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent
    const bottom = contentSize.height - contentOffset.y - layoutMeasurement.height <= STICK_THRESHOLD
    stick.current = bottom
    if (bottom !== atBottom) show(!bottom)
  }

  const fade = canFade()
  return (
    <View style={[{ position: "relative", minHeight: 0, overflow: "hidden" }, style]} {...props}>
      <ScrollView
        ref={scrollRef}
        role="log"
        accessibilityLiveRegion="polite"
        onScroll={onScroll}
        scrollEventThrottle={32}
        onContentSizeChange={follow}
        onLayout={follow}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end", paddingHorizontal: ui.pad.sm, paddingTop: 16, paddingBottom: inset + 16 }}
      >
        {kids.map((child, i) => {
          const next = kids[i + 1]
          const nextGrouped = React.isValidElement<ChatMessageProps>(next) && next.type === ChatMessage && !!next.props.grouped
          return (
            <FirstContext.Provider key={React.isValidElement(child) && child.key != null ? child.key : i} value={i === 0}>
              <NextGroupedContext.Provider value={nextGrouped}>{child}</NextGroupedContext.Provider>
            </FirstContext.Provider>
          )
        })}
      </ScrollView>
      <Animated.View
        pointerEvents={atBottom ? "none" : "auto"}
        accessibilityElementsHidden={atBottom}
        importantForAccessibility={atBottom ? "no-hide-descendants" : "auto"}
        style={{
          position: "absolute",
          bottom: inset + 12,
          alignSelf: "center",
          // Liquid Glass vanishes under a fading ancestor: translate and scale only where it renders.
          opacity: fade ? shown : 1,
          transform: [
            { translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
            { scale: fade ? 1 : shown },
          ],
        }}
      >
        <Button variant="glass" size="icon" accessibilityLabel="Jump to latest" onPress={() => scrollToBottom(true)}>
          <ArrowDownIcon />
        </Button>
      </Animated.View>
    </View>
  )
}

type ChatMessageProps = ViewProps & { from?: ChatFrom; grouped?: boolean; avatar?: React.ReactNode }

/**
 * One turn. User turns sit on the right, the rest on the left. `grouped` marks a
 * follow-up from the same sender: the gap tightens, the avatar hides and the
 * bubble corners facing the sender square off so the run reads as one.
 */
function ChatMessage({ style, from = "assistant", grouped = false, avatar, children, ...props }: ChatMessageProps) {
  const first = React.useContext(FirstContext)
  const nextGrouped = React.useContext(NextGroupedContext)
  return (
    <ChatMessageContext.Provider value={{ from, grouped, nextGrouped }}>
      <View
        style={[
          {
            width: "100%",
            flexDirection: from === "user" ? "row-reverse" : "row",
            alignItems: "flex-end",
            justifyContent: from === "system" ? "center" : "flex-start",
            gap: 8,
            marginTop: first ? 0 : grouped ? 4 : 12,
          },
          style,
        ]}
        {...props}
      >
        {avatar && from !== "system" ? (
          <View accessibilityElementsHidden={grouped} importantForAccessibility={grouped ? "no-hide-descendants" : "auto"} style={{ flexShrink: 0, opacity: grouped ? 0 : 1 }}>
            {avatar}
          </View>
        ) : null}
        <View
          style={{
            maxWidth: from === "system" ? "100%" : "80%",
            minWidth: 0,
            flexShrink: 1,
            gap: 4,
            alignItems: from === "system" ? "center" : from === "user" ? "flex-end" : "flex-start",
          }}
        >
          {children}
        </View>
      </View>
    </ChatMessageContext.Provider>
  )
}

type BubbleVariant = "user" | "assistant" | "system"

function chatBubbleVariants(ui: UI, { variant = "assistant" }: { variant?: BubbleVariant } = {}) {
  const pad = { paddingHorizontal: 14, paddingVertical: 8 }
  const container: ViewStyle =
    variant === "user"
      ? { backgroundColor: ui.primary, ...pad }
      : variant === "assistant"
        ? { backgroundColor: ui.fill, ...pad }
        : {}
  const text = { color: variant === "user" ? ui.primaryForeground : variant === "system" ? ui.mutedForeground : ui.foreground }
  return { container: { maxWidth: "100%", borderRadius: bubbleRadius(ui), borderCurve: "continuous", ...container } as ViewStyle, text, size: variant === "system" ? ("xs" as const) : ("sm" as const) }
}

/** Fades and rises a bubble in once, as the web `glass-fade` does. */
function useEntrance() {
  const reduce = useReduceMotion()
  const [v] = React.useState(() => new Animated.Value(0))
  React.useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: reduce.current ? 0 : 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start()
  }, [v, reduce])
  return { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [4, 0] }) }] }
}

/** The message body. Its look follows the enclosing `ChatMessage` unless `variant` says otherwise. */
function ChatBubble({ style, variant, children, ...props }: ViewProps & { variant?: BubbleVariant }) {
  const ui = useUI()
  const { from, grouped, nextGrouped } = React.useContext(ChatMessageContext)
  const resolved = variant ?? from
  const v = chatBubbleVariants(ui, { variant: resolved })
  const square = Math.round(ui.radius.surface * 0.25)
  const corners: ViewStyle =
    from === "assistant"
      ? { ...(grouped ? { borderTopLeftRadius: square } : null), ...(nextGrouped ? { borderBottomLeftRadius: square } : null) }
      : from === "user"
        ? { ...(grouped ? { borderTopRightRadius: square } : null), ...(nextGrouped ? { borderBottomRightRadius: square } : null) }
        : {}
  const entrance = useEntrance()
  const kids = React.Children.toArray(children)
  const textOnly = kids.length > 0 && kids.every((c) => typeof c === "string" || typeof c === "number")
  return (
    <Animated.View style={[v.container, corners, entrance, style]} {...props}>
      {textOnly ? (
        <GText size={v.size} color={v.text.color} align={resolved === "system" ? "center" : undefined} selectable style={{ lineHeight: Math.round(ui.text[v.size] * 1.35) }}>
          {kids.join("")}
        </GText>
      ) : (
        children
      )}
    </Animated.View>
  )
}

/** A timestamp or receipt ("Delivered", "Read 9:41") under a bubble. */
function ChatMeta({ style, children, ...props }: ViewProps) {
  return (
    <View style={[{ paddingHorizontal: 4 }, style]} {...props}>
      <GText tone="muted" style={{ fontSize: 11, lineHeight: 14, fontVariant: ["tabular-nums"] }}>
        {children}
      </GText>
    </View>
  )
}

/** A day separator ("Today") between hairlines. */
function ChatDivider({ style, children, ...props }: ViewProps) {
  const ui = useUI()
  const first = React.useContext(FirstContext)
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
  const reduce = useReduceMotion()
  const [v] = React.useState(() => new Animated.Value(0))
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(index * 150),
        Animated.timing(v, { toValue: 1, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.delay(600 - index * 150),
      ])
    )
    const id = setTimeout(() => {
      if (!reduce.current) loop.start()
    }, 0)
    return () => {
      clearTimeout(id)
      loop.stop()
    }
  }, [v, index, reduce])
  return (
    <Animated.View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: ui.mutedForeground,
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
        transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }],
      }}
    />
  )
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
  /** Before the field — an attach button, say. */
  leading?: React.ReactNode
  textInputProps?: TextInputProps
}

/** Line height and the 160px cap from the web `max-h-40`. */
const LINE = 20
const MAX_FIELD = 160

/**
 * The message field: grows with its text, Return sends (Shift+Enter breaks a line
 * on web; IME composition never sends early). `floating` makes it a strong-glass
 * capsule to sit over the bottom of a thread.
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
  leading,
  textInputProps,
  ...props
}: ChatComposerProps) {
  const ui = useUI()
  const [inner, setInner] = React.useState(defaultValue)
  const [focused, setFocused] = React.useState(false)
  const [height, setHeight] = React.useState(LINE)
  const text = value ?? inner
  const empty = text.trim() === ""
  const field = ui.control.sm

  const setText = (next: string) => {
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }

  const send = () => {
    if (empty || disabled) return
    onSubmit?.(text.trim())
    setText("")
  }

  const ring: ViewStyle = focused ? { borderWidth: 2, borderColor: alpha(ui.ring, 0.4) } : { borderWidth: 2, borderColor: "transparent" }
  const body = (
    <>
      {leading}
      <TextInput
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        placeholderTextColor={alpha(ui.mutedForeground, 0.8)}
        editable={!disabled}
        multiline
        enterKeyHint="send"
        submitBehavior={Platform.OS === "web" ? undefined : "submit"}
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
          send()
        }}
        onKeyPress={(e) => {
          textInputProps?.onKeyPress?.(e)
          if (Platform.OS !== "web") return
          const ev = e.nativeEvent as unknown as { key: string; shiftKey?: boolean; isComposing?: boolean; keyCode?: number }
          if (ev.key === "Enter" && !ev.shiftKey && !ev.isComposing && ev.keyCode !== 229) {
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
      <Button size="icon-sm" accessibilityLabel="Send" disabled={disabled || empty} onPress={send}>
        <ArrowUpIcon />
      </Button>
    </>
  )
  const base = chatComposerVariants(ui, { variant })
  if (variant === "floating") {
    return (
      <Glass radius={base.borderRadius as number} style={[{ width: "100%" }, style]} {...props}>
        {/* Dim the contents, never the pane — Liquid Glass vanishes under opacity. */}
        <View style={[base, ring, disabled ? { opacity: 0.6 } : null]}>{body}</View>
      </Glass>
    )
  }
  return (
    <View style={[{ width: "100%" }, base, ring, disabled ? { opacity: 0.6 } : null, style]} {...props}>
      {body}
    </View>
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
