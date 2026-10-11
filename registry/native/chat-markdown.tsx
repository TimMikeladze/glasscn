import * as React from "react"
import { Platform, ScrollView, View, type ViewProps } from "react-native"
import { CheckIcon, CopyIcon } from "lucide-react-native"

import { Button } from "@/components/glass/native/button"
import { GText, useUI } from "@/components/glass/native/ui"

/**
 * Chat Markdown for React Native — a small block parser (headings, paragraphs, lists,
 * quotes, fenced code) with inline **bold**, *em*, `code` and links, safe to render
 * while streaming. For full GFM on native, render with your Markdown library of choice.
 */

/** Closes what a half-streamed Markdown string left open (same as the web). */
export function repairMarkdown(text: string): string {
  let out = text
  const fences = out.match(/^\s{0,3}(```|~~~)/gm) ?? []
  if (fences.length % 2 === 1) return `${out}${out.endsWith("\n") ? "" : "\n"}${fences[fences.length - 1].trim()}`
  const tail = out.slice(out.lastIndexOf("```") + 1)
  out = out.replace(/!?\[([^\]\n]*)\]\([^)\s]*$/, "$1").replace(/!?\[([^\]\n]*)$/, "$1")
  const count = (re: RegExp) => (tail.replace(/`[^`\n]*`/g, "").match(re) ?? []).length
  if ((tail.match(/`/g) ?? []).length % 2 === 1) out += "`"
  if (count(/\*\*/g) % 2 === 1) out += "**"
  if (count(/~~/g) % 2 === 1) out += "~~"
  if (count(/(?<![*\w])\*(?![*\s])|(?<![*\s])\*(?![*\w])/g) % 2 === 1) out += "*"
  return out
}

const mono = Platform.select({ ios: "Menlo", web: "ui-monospace, Menlo, monospace", default: "monospace" })

/** A fenced code block: language, copy (when a clipboard is passed), horizontal scroll. */
function ChatCodeBlock({ code, language, onCopy, style, ...props }: ViewProps & { code: string; language?: string; onCopy?: (code: string) => void }) {
  const ui = useUI()
  const [copied, setCopied] = React.useState(false)
  return (
    <View style={[{ borderRadius: ui.radius.control, borderWidth: 1, borderColor: ui.glassBorder, backgroundColor: ui.fill, overflow: "hidden", marginVertical: 6 }, style]} {...props}>
      <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: ui.separator, paddingLeft: 12, paddingRight: 4, paddingVertical: 2 }}>
        <GText size="xs" tone="muted" style={{ flex: 1, fontFamily: mono }}>
          {language || "text"}
        </GText>
        {onCopy ? (
          <Button
            variant="ghost"
            size="icon-xs"
            accessibilityLabel={copied ? "Copied" : "Copy code"}
            onPress={() => {
              onCopy(code)
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            }}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </Button>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10 }}>
        <GText size="xs" selectable style={{ fontFamily: mono, lineHeight: 18 }}>
          {code}
        </GText>
      </ScrollView>
    </View>
  )
}

/** Inline marks → nested GText. */
function inline(text: string, key: string, link: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*|~~[^~]+~~|\[[^\]]+\]\([^)]+\))/g
  let last = 0
  let i = 0
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push(text.slice(last, m.index))
    const t = m[0]
    const k = `${key}-${i++}`
    if (t.startsWith("**")) out.push(<GText key={k} weight="600">{t.slice(2, -2)}</GText>)
    else if (t.startsWith("`")) out.push(<GText key={k} style={{ fontFamily: mono }}>{t.slice(1, -1)}</GText>)
    else if (t.startsWith("~~")) out.push(<GText key={k} style={{ textDecorationLine: "line-through" }}>{t.slice(2, -2)}</GText>)
    else if (t.startsWith("[")) out.push(<GText key={k} color={link} style={{ textDecorationLine: "underline" }}>{t.slice(1, t.indexOf("]"))}</GText>)
    else out.push(<GText key={k} style={{ fontStyle: "italic" }}>{t.slice(1, -1)}</GText>)
    last = m.index! + t.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

/** Markdown in the theme's type, closed up first so a streaming reply doesn't flicker. */
function ChatMarkdown({ children, repair = true, onCopy, style, ...props }: ViewProps & { children: string; repair?: boolean; onCopy?: (code: string) => void }) {
  const ui = useUI()
  const source = repair ? repairMarkdown(children) : children
  const blocks: React.ReactNode[] = []
  const lines = source.split("\n")
  let para: string[] = []
  const flush = () => {
    if (!para.length) return
    const k = `p${blocks.length}`
    blocks.push(
      <GText key={k} size="sm" style={{ lineHeight: 21 }}>
        {inline(para.join(" "), k, ui.primary)}
      </GText>
    )
    para = []
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const fence = /^\s{0,3}```\s*([\w+#-]*)/.exec(line)
    if (fence) {
      flush()
      const code: string[] = []
      while (++i < lines.length && !/^\s{0,3}```/.test(lines[i])) code.push(lines[i])
      blocks.push(<ChatCodeBlock key={`c${blocks.length}`} code={code.join("\n")} language={fence[1]} onCopy={onCopy} />)
      continue
    }
    const heading = /^(#{1,6})\s+(.*)/.exec(line)
    const item = /^\s*([-*+]|\d+[.)])\s+(.*)/.exec(line)
    const quote = /^>\s?(.*)/.exec(line)
    if (heading) {
      flush()
      const k = `h${blocks.length}`
      blocks.push(
        <GText key={k} role="heading" size={heading[1].length <= 2 ? "lg" : "base"} weight="600" font="heading">
          {inline(heading[2], k, ui.primary)}
        </GText>
      )
    } else if (item) {
      flush()
      const k = `l${blocks.length}`
      blocks.push(
        <View key={k} style={{ flexDirection: "row", gap: 6, paddingLeft: 4 }}>
          <GText size="sm" tone="muted" style={{ minWidth: 14 }}>
            {/^\d/.test(item[1]) ? item[1] : "•"}
          </GText>
          <GText size="sm" style={{ flex: 1, lineHeight: 21 }}>
            {inline(item[2], k, ui.primary)}
          </GText>
        </View>
      )
    } else if (quote) {
      flush()
      const k = `q${blocks.length}`
      blocks.push(
        <View key={k} style={{ borderLeftWidth: 2, borderLeftColor: ui.separator, paddingLeft: 10 }}>
          <GText size="sm" tone="muted">
            {inline(quote[1], k, ui.primary)}
          </GText>
        </View>
      )
    } else if (!line.trim()) flush()
    else para.push(line.trim())
  }
  flush()
  return (
    <View style={[{ gap: 8 }, style]} {...props}>
      {blocks}
    </View>
  )
}

export { ChatMarkdown, ChatCodeBlock }
