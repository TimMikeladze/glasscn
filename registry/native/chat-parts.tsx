import * as React from "react"
import { Image, Linking, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { AlertCircleIcon, BrainIcon, CheckIcon, ChevronDownIcon, FileIcon, GlobeIcon, LoaderIcon, RotateCwIcon, WrenchIcon, XIcon } from "lucide-react-native"

import { Button } from "@/components/glass/native/button"
import { Glass } from "@/components/glass/native/glass"
import { ChatBubble } from "@/components/glass/native/chat"
import { ChatMarkdown } from "@/components/glass/native/chat-markdown"
import { Press } from "@/components/glass/native/press"
import { GText, alpha, useUI, web } from "@/components/glass/native/ui"

/**
 * The pieces of an AI reply for React Native, shaped after AI SDK's `UIMessage.parts`,
 * with the web's names and props: reasoning, tools, sources, files, errors, actions,
 * reactions, and `renderParts(message)`.
 */

type ChatToolState = "input-streaming" | "input-available" | "approval-requested" | "approval-responded" | "output-available" | "output-error" | "output-denied"
type ChatToolPart = { type: string; toolName?: string; toolCallId: string; state: ChatToolState; input?: unknown; output?: unknown; errorText?: string; approval?: { id: string; approved?: boolean } }
type ChatUIPart =
  | { type: "text"; text: string; state?: "streaming" | "done" }
  | { type: "reasoning"; text: string; state?: "streaming" | "done" }
  | { type: "source-url"; sourceId: string; url: string; title?: string }
  | { type: "source-document"; sourceId: string; mediaType: string; title: string; filename?: string }
  | { type: "file"; mediaType: string; url: string; filename?: string }
  | ChatToolPart
  | { type: string }
type ChatUIMessage = { id: string; role: "user" | "assistant" | "system"; parts: ReadonlyArray<ChatUIPart> }

const json = (v: unknown) => (v === undefined ? "" : typeof v === "string" ? v : JSON.stringify(v, null, 2))

function Disclosure({ icon, label, open, onToggle }: { icon: React.ReactNode; label: string; open: boolean; onToggle: () => void }) {
  const ui = useUI()
  return (
    <Press accessibilityRole="button" aria-expanded={open} onPress={onToggle} style={[{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 2, alignSelf: "flex-start" }, web({ cursor: "pointer" })]}>
      {icon}
      <GText size="sm" tone="muted">
        {label}
      </GText>
      <ChevronDownIcon size={16} color={ui.mutedForeground} style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }} />
    </Press>
  )
}

function ChatReasoning({ children, streaming = false, duration, defaultOpen, style, ...props }: ViewProps & { children?: React.ReactNode; streaming?: boolean; duration?: number; defaultOpen?: boolean }) {
  const ui = useUI()
  const [open, setOpen] = React.useState(defaultOpen ?? streaming)
  const touched = React.useRef(false)
  React.useEffect(() => {
    if (!touched.current) setOpen(streaming)
  }, [streaming])
  const label = streaming ? "Thinking…" : duration !== undefined ? `Thought for ${Math.max(1, Math.round(duration))}s` : "Reasoning"
  return (
    <View style={[{ width: "100%" }, style]} {...props}>
      <Disclosure
        icon={<BrainIcon size={16} color={ui.mutedForeground} />}
        label={label}
        open={open}
        onToggle={() => {
          touched.current = true
          setOpen(!open)
        }}
      />
      {open ? (
        <View style={{ marginTop: 6, borderLeftWidth: 2, borderLeftColor: ui.separator, paddingLeft: 12 }}>
          {typeof children === "string" ? <ChatMarkdown>{children}</ChatMarkdown> : children}
        </View>
      ) : null}
    </View>
  )
}

const TOOL_LABEL: Record<ChatToolState, string> = {
  "input-streaming": "Preparing",
  "input-available": "Running",
  "approval-requested": "Needs approval",
  "approval-responded": "Responded",
  "output-available": "Done",
  "output-error": "Failed",
  "output-denied": "Denied",
}

function ChatTool({ name, state, input, output, errorText, onApprove, onDeny, defaultOpen, style, ...props }: ViewProps & { name: string; state: ChatToolState; input?: unknown; output?: unknown; errorText?: string; onApprove?: () => void; onDeny?: () => void; defaultOpen?: boolean }) {
  const ui = useUI()
  const asking = state === "approval-requested"
  const [open, setOpen] = React.useState(defaultOpen ?? (asking || state === "output-error"))
  const tone = state === "output-available" ? ui.success : state === "output-error" || state === "output-denied" ? ui.destructive : ui.mutedForeground
  const StateIcon = state === "output-available" ? CheckIcon : state === "output-error" || state === "output-denied" || asking ? AlertCircleIcon : LoaderIcon
  const section = (label: string, body: string) => (
    <View style={{ gap: 4 }}>
      <GText size="xs" tone="muted" weight="500">
        {label.toUpperCase()}
      </GText>
      <View style={{ borderRadius: ui.radius.control - 4, backgroundColor: ui.fill, padding: 8 }}>
        <GText size="xs" font="mono" selectable>
          {body}
        </GText>
      </View>
    </View>
  )
  return (
    <View style={[{ width: "100%", borderRadius: ui.radius.control, borderWidth: 1, borderColor: ui.glassBorder, backgroundColor: ui.fill, overflow: "hidden" }, style]} {...props}>
      <Press accessibilityRole="button" aria-expanded={open} onPress={() => setOpen(!open)} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
        <WrenchIcon size={16} color={ui.mutedForeground} />
        <GText size="sm" font="mono" numberOfLines={1} style={{ flex: 1 }}>
          {name}
        </GText>
        <StateIcon size={14} color={tone} />
        <GText size="xs" tone="muted">
          {TOOL_LABEL[state]}
        </GText>
      </Press>
      {open ? (
        <View style={{ gap: 8, borderTopWidth: 1, borderTopColor: ui.separator, padding: 12 }}>
          {input !== undefined ? section("Input", json(input)) : null}
          {state === "output-error" && errorText ? (
            <GText size="sm" color={ui.destructive} role="alert">
              {errorText}
            </GText>
          ) : null}
          {state === "output-available" && output !== undefined ? section("Output", json(output)) : null}
        </View>
      ) : null}
      {asking && (onApprove || onDeny) ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderTopWidth: 1, borderTopColor: ui.separator, padding: 8 }}>
          <GText size="sm" tone="muted" style={{ flex: 1 }}>
            Allow {name} to run?
          </GText>
          {onDeny ? (
            <Button variant="secondary" size="sm" onPress={onDeny}>
              Deny
            </Button>
          ) : null}
          {onApprove ? (
            <Button size="sm" onPress={onApprove}>
              Approve
            </Button>
          ) : null}
        </View>
      ) : null}
    </View>
  )
}

type ChatSource = { url?: string; title?: string; id?: string }

function ChatCitation({ index, href, children, style, ...props }: Omit<React.ComponentProps<typeof Press>, "children" | "style"> & { index?: number; href?: string; children?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  return (
    <Press
      accessibilityRole={href ? "link" : "text"}
      onPress={href ? () => void Linking.openURL(href) : undefined}
      style={[{ flexDirection: "row", alignItems: "center", gap: 6, maxWidth: 240, borderRadius: ui.radius.badge, backgroundColor: ui.fill, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start" }, style]}
      {...props}
    >
      {index !== undefined ? (
        <GText size="xs" weight="500" color={ui.primary}>
          {index}
        </GText>
      ) : null}
      {children ? (
        <GText size="xs" numberOfLines={1}>
          {children}
        </GText>
      ) : null}
    </Press>
  )
}

function ChatSources({ sources, defaultOpen = false, style, ...props }: ViewProps & { sources: ChatSource[]; defaultOpen?: boolean }) {
  const ui = useUI()
  const [open, setOpen] = React.useState(defaultOpen)
  if (!sources.length) return null
  return (
    <View style={[{ width: "100%", gap: 6 }, style]} {...props}>
      <Disclosure icon={<GlobeIcon size={16} color={ui.mutedForeground} />} label={sources.length === 1 ? "1 source" : `${sources.length} sources`} open={open} onToggle={() => setOpen(!open)} />
      {open ? (
        <View role="list" style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {sources.map((s, i) => (
            <ChatCitation key={s.id ?? s.url ?? i} href={s.url} index={i + 1}>
              {s.title ?? s.url}
            </ChatCitation>
          ))}
        </View>
      ) : null}
    </View>
  )
}

function ChatFile({ url, mediaType, filename, style, ...props }: ViewProps & { url: string; mediaType: string; filename?: string }) {
  const ui = useUI()
  if (mediaType.startsWith("image/"))
    return (
      <View style={[{ borderRadius: ui.radius.surface - 8, overflow: "hidden" }, style]} {...props}>
        <Image source={{ uri: url }} alt={filename ?? "Image"} style={{ width: 220, height: 160 }} resizeMode="cover" />
      </View>
    )
  return (
    <Press accessibilityRole="link" onPress={() => void Linking.openURL(url)} style={[{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: ui.radius.control, backgroundColor: ui.fill, paddingHorizontal: 12, paddingVertical: 8, alignSelf: "flex-start" }, style]}>
      <FileIcon size={16} color={ui.mutedForeground} />
      <GText size="sm" numberOfLines={1}>
        {filename ?? mediaType}
      </GText>
    </Press>
  )
}

function ChatAttachment({ name, previewUrl, onRemove, uploading = false, style, ...props }: ViewProps & { name: string; previewUrl?: string; onRemove?: () => void; uploading?: boolean }) {
  const ui = useUI()
  return (
    <View aria-busy={uploading || undefined} style={[{ flexDirection: "row", alignItems: "center", gap: 6, height: ui.control.sm, maxWidth: 192, borderRadius: ui.radius.control - 4, backgroundColor: ui.fillStrong, paddingLeft: 4, paddingRight: 2 }, style]} {...props}>
      {previewUrl ? <Image source={{ uri: previewUrl }} alt="" style={{ width: 24, height: 24, borderRadius: 6 }} /> : <FileIcon size={14} color={ui.mutedForeground} style={{ marginLeft: 4 }} />}
      <GText size="xs" numberOfLines={1} style={{ flexShrink: 1 }}>
        {name}
      </GText>
      {onRemove ? (
        <Button variant="ghost" size="icon-xs" accessibilityLabel={`Remove ${name}`} onPress={onRemove}>
          <XIcon />
        </Button>
      ) : null}
    </View>
  )
}

function ChatError({ children = "Something went wrong.", onRetry, style, ...props }: ViewProps & { children?: React.ReactNode; onRetry?: () => void }) {
  const ui = useUI()
  return (
    <View role="alert" style={[{ flexDirection: "row", alignItems: "center", gap: 8, width: "100%", borderRadius: ui.radius.control, backgroundColor: alpha(ui.destructive, 0.12), paddingHorizontal: 12, paddingVertical: 8 }, style]} {...props}>
      <AlertCircleIcon size={16} color={ui.destructive} />
      <GText size="sm" color={ui.destructive} style={{ flex: 1 }}>
        {children}
      </GText>
      {onRetry ? (
        <Button variant="ghost" size="sm" onPress={onRetry}>
          <RotateCwIcon />
          Retry
        </Button>
      ) : null}
    </View>
  )
}

function ChatActions({ style, ...props }: ViewProps) {
  return <View role="toolbar" aria-label="Message actions" style={[{ flexDirection: "row", alignItems: "center", gap: 2 }, style]} {...props} />
}

function ChatAction({ label, active, children, ...props }: Omit<React.ComponentProps<typeof Button>, "variant" | "size"> & { label: string; active?: boolean }) {
  const ui = useUI()
  return (
    <Button variant="ghost" size="icon-xs" accessibilityLabel={label} aria-pressed={active} {...props}>
      {React.Children.map(children, (c) => (React.isValidElement<{ color?: string }>(c) ? React.cloneElement(c, { color: c.props.color ?? (active ? ui.primary : ui.mutedForeground) }) : c))}
    </Button>
  )
}

type ChatReaction = { emoji: string; count?: number; mine?: boolean; label?: string }

function ChatReactions({ reactions, onToggle, style, ...props }: ViewProps & { reactions: ChatReaction[]; onToggle?: (emoji: string) => void }) {
  const ui = useUI()
  if (!reactions.length) return null
  return (
    // a liquid capsule on the bubble's corner (the control layer); its taps never dim it
    <Glass variant="liquid" radius={ui.radius.badge} role="group" aria-label="Reactions" style={[{ flexDirection: "row", gap: 2, marginTop: -12, marginHorizontal: 8, padding: 2, alignSelf: "flex-start" }, style]} {...props}>
      {reactions.map((r) => (
        <Press
          key={r.emoji}
          accessibilityRole="button"
          aria-pressed={r.mine ?? false}
          accessibilityLabel={`${r.label ?? r.emoji}${r.count && r.count > 1 ? `, ${r.count}` : ""}`}
          onPress={() => onToggle?.(r.emoji)}
          style={{ flexDirection: "row", alignItems: "center", gap: 2, minWidth: 24, height: 24, justifyContent: "center", borderRadius: ui.radius.badge, paddingHorizontal: 4, backgroundColor: r.mine ? alpha(ui.primary, 0.16) : "transparent" }}
        >
          <GText size="xs">{r.emoji}</GText>
          {r.count && r.count > 1 ? (
            <GText size="xs" tone="muted">
              {r.count}
            </GText>
          ) : null}
        </Press>
      ))}
    </Glass>
  )
}

type RenderPartsOptions = { streaming?: boolean; reasoningDuration?: number; onToolApproval?: (a: { id: string; approved: boolean; toolCallId: string }) => void }

/** Maps an AI SDK `UIMessage` onto chat parts, as on the web. */
function renderParts(message: ChatUIMessage, { streaming = false, reasoningDuration, onToolApproval }: RenderPartsOptions = {}): React.ReactNode[] {
  const out: React.ReactNode[] = []
  const sources: ChatSource[] = []
  message.parts.forEach((part, i) => {
    const key = `${message.id}-${i}`
    const p = part as Record<string, unknown> & { type: string }
    if (p.type === "text" && p.text) out.push(<ChatBubble key={key}>{message.role === "assistant" ? <ChatMarkdown>{String(p.text)}</ChatMarkdown> : String(p.text)}</ChatBubble>)
    else if (p.type === "reasoning")
      out.push(
        <ChatReasoning key={key} streaming={streaming && p.state === "streaming"} duration={reasoningDuration}>
          {String(p.text)}
        </ChatReasoning>
      )
    else if (p.type === "source-url") sources.push({ id: String(p.sourceId), url: String(p.url), title: p.title as string | undefined })
    else if (p.type === "source-document") sources.push({ id: String(p.sourceId), title: String(p.title) })
    else if (p.type === "file") out.push(<ChatFile key={key} url={String(p.url)} mediaType={String(p.mediaType)} filename={p.filename as string | undefined} />)
    else if ("toolCallId" in p) {
      const t = p as unknown as ChatToolPart
      const name = t.type === "dynamic-tool" ? (t.toolName ?? "tool") : t.type.slice(5)
      const a = t.approval
      out.push(
        <ChatTool
          key={key}
          name={name}
          state={t.state}
          input={t.input}
          output={t.output}
          errorText={t.errorText}
          onApprove={a && onToolApproval ? () => onToolApproval({ id: a.id, approved: true, toolCallId: t.toolCallId }) : undefined}
          onDeny={a && onToolApproval ? () => onToolApproval({ id: a.id, approved: false, toolCallId: t.toolCallId }) : undefined}
        />
      )
    }
  })
  if (sources.length) out.push(<ChatSources key={`${message.id}-sources`} sources={sources} />)
  return out
}

export { ChatReasoning, ChatTool, ChatSources, ChatCitation, ChatFile, ChatAttachment, ChatError, ChatActions, ChatAction, ChatReactions, renderParts }
export type { ChatUIMessage, ChatUIPart, ChatToolState, ChatSource, ChatReaction }
