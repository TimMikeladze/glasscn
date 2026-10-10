import * as React from "react"
import { Linking, Text as RNText, View, type ViewProps } from "react-native"

import { Blockquote, Heading, InlineCode, List } from "@/components/glass/native/typography"
import { GText, useUI } from "@/components/glass/native/ui"

/**
 * Rich text set in the theme's type. Pass a Markdown string as `children` (or
 * `markdown`): headings, paragraphs, **bold**, _italic_, `code`, [links](…),
 * lists, quotes and fenced code blocks. Other children render as-is, spaced.
 * Line length is capped at a reading measure; pass `style={{ maxWidth: "100%" }}` to fill.
 */

type Block =
  | { kind: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "code"; text: string }

/** Markdown → blocks. Small on purpose: the subset prose needs, no dependencies. */
export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, "\n").split("\n")
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed) {
      i++
      continue
    }
    if (trimmed.startsWith("```")) {
      const body: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith("```")) body.push(lines[i++])
      i++
      blocks.push({ kind: "code", text: body.join("\n") })
      continue
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(trimmed)
    if (h) {
      blocks.push({ kind: "heading", level: h[1].length as 1, text: h[2] })
      i++
      continue
    }
    if (trimmed.startsWith(">")) {
      const body: string[] = []
      while (i < lines.length && lines[i].trim().startsWith(">")) body.push(lines[i++].trim().replace(/^>\s?/, ""))
      blocks.push({ kind: "quote", text: body.join(" ") })
      continue
    }
    const item = /^([-*+]|\d+[.)])\s+/
    if (item.test(trimmed)) {
      const ordered = /^\d/.test(trimmed)
      const items: string[] = []
      while (i < lines.length && item.test(lines[i].trim())) items.push(lines[i++].trim().replace(item, ""))
      blocks.push({ kind: "list", ordered, items })
      continue
    }
    const body: string[] = []
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|>|```|[-*+]\s|\d+[.)]\s)/.test(lines[i].trim())) body.push(lines[i++].trim())
    blocks.push({ kind: "paragraph", text: body.join(" ") })
  }
  return blocks
}

const INLINE = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*|_[^_]+_)/g

/** **bold**, _italic_, `code` and [links](url) as nested Text. */
function Inline({ text }: { text: string }) {
  const ui = useUI()
  return (
    <>
      {text.split(INLINE).map((part, i) => {
        if (!part) return null
        if (/^(\*\*|__)/.test(part)) return <RNText key={i} style={{ fontWeight: "700" }}>{part.slice(2, -2)}</RNText>
        if (part.startsWith("`")) return <InlineCode key={i}>{part.slice(1, -1)}</InlineCode>
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
        if (link)
          return (
            <RNText key={i} accessibilityRole="link" onPress={() => Linking.openURL(link[2]).catch(() => {})} style={{ color: ui.primary, textDecorationLine: "underline" }}>
              {link[1]}
            </RNText>
          )
        if (/^[*_].+[*_]$/.test(part)) return <RNText key={i} style={{ fontStyle: "italic" }}>{part.slice(1, -1)}</RNText>
        return part
      })}
    </>
  )
}

function Prose({ markdown, children, style, ...props }: ViewProps & { markdown?: string }) {
  const ui = useUI()
  const source = markdown ?? (typeof children === "string" ? children : null)
  const blocks = React.useMemo(() => (source == null ? null : parseMarkdown(source)), [source])
  return (
    <View style={[{ gap: 14, maxWidth: 680 }, style]} {...props}>
      {blocks
        ? blocks.map((b, i) => {
            switch (b.kind) {
              case "heading":
                return (
                  <Heading key={i} level={b.level} size={String(Math.min(6, b.level + 1)) as "3"} style={{ marginTop: i ? 8 : 0 }}>
                    <Inline text={b.text} />
                  </Heading>
                )
              case "quote":
                return (
                  <Blockquote key={i}>
                    <GText font="heading" size="lg" tone="muted" weight="400">
                      <Inline text={b.text} />
                    </GText>
                  </Blockquote>
                )
              case "list":
                return (
                  <List key={i} ordered={b.ordered}>
                    {b.items.map((t, j) => (
                      <GText key={j}>
                        <Inline text={t} />
                      </GText>
                    ))}
                  </List>
                )
              case "code":
                return (
                  <View key={i} style={{ backgroundColor: ui.fill, borderRadius: ui.radius.control, padding: 14 }}>
                    <GText font="mono" size="sm" selectable>
                      {b.text}
                    </GText>
                  </View>
                )
              default:
                return (
                  <GText key={i} selectable>
                    <Inline text={b.text} />
                  </GText>
                )
            }
          })
        : children}
    </View>
  )
}

export { Prose }
