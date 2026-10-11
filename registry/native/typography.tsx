import * as React from "react"
import { Linking, Text as RNText, View, type TextProps, type ViewProps } from "react-native"

import { MAX_FONT_SCALE } from "@/components/glass/native/a11y"
import { GText, alpha, useUI, type GTextProps, type TextSize } from "@/components/glass/native/ui"

/**
 * Type on the glass scale. Sizes are steps of the major-third scale from useUI();
 * fonts, weights and tracking come from the theme.
 */

type Level = 1 | 2 | 3 | 4 | 5 | 6
type HeadingSize = "display" | "1" | "2" | "3" | "4" | "5" | "6"

const HEADING: Record<HeadingSize, TextSize> = { display: "5xl", "1": "4xl", "2": "3xl", "3": "2xl", "4": "xl", "5": "lg", "6": "base" }

/** Style for a heading size — the native stand-in for the web's cva helper. */
function headingVariants({ size = "2" }: { size?: HeadingSize } = {}) {
  return { size: HEADING[size] }
}

/** h1–h6. `level` sets the accessibility heading; `size` the look (defaults to the level). */
function Heading({ level = 2, size, ...props }: Omit<GTextProps, "size"> & { level?: Level; size?: HeadingSize }) {
  return <GText accessibilityRole="header" aria-level={level} font="heading" size={headingVariants({ size: size ?? (String(level) as HeadingSize) }).size} {...props} />
}

type AppleStyle = "large-title" | "title-1" | "title-2" | "title-3" | "headline" | "apple-body" | "callout" | "subheadline" | "footnote" | "caption-1" | "caption-2"
type TextVariant = "body" | "lead" | "large" | "small" | "muted" | "overline" | "caption" | AppleStyle

/** Apple's text styles at the default Dynamic Type size: [size, line height, weight, heading font]. */
const APPLE: Record<AppleStyle, [number, number, "400" | "600", boolean]> = {
  "large-title": [34, 41, "400", true],
  "title-1": [28, 34, "400", true],
  "title-2": [22, 28, "400", true],
  "title-3": [20, 25, "400", true],
  headline: [17, 22, "600", false],
  "apple-body": [17, 22, "400", false],
  callout: [16, 21, "400", false],
  subheadline: [15, 20, "400", false],
  footnote: [13, 18, "400", false],
  "caption-1": [12, 16, "400", false],
  "caption-2": [11, 13, "400", false],
}

/** Props for a Text variant — the native stand-in for the web's cva helper. */
function textVariants({ variant = "body", emphasized = false }: { variant?: TextVariant; emphasized?: boolean } = {}): Pick<GTextProps, "size" | "tone" | "weight" | "style" | "font"> {
  if (variant in APPLE) {
    const [px, leading, weight, heading] = APPLE[variant as AppleStyle]
    return { font: heading ? "heading" : "sans", weight: emphasized ? (heading ? "700" : "600") : weight, style: { fontSize: px, lineHeight: leading } }
  }
  const base = textVariantsBase(variant)
  return emphasized ? { ...base, weight: "600" } : base
}

function textVariantsBase(variant: TextVariant): Pick<GTextProps, "size" | "tone" | "weight" | "style"> {
  switch (variant) {
    case "lead":
      return { size: "lg", tone: "muted", style: { maxWidth: 640 } }
    case "large":
      return { size: "lg", weight: "600" }
    case "small":
      return { size: "sm" }
    case "muted":
      return { size: "sm", tone: "muted" }
    case "overline":
      return { size: "xs", tone: "muted", weight: "600", style: { letterSpacing: 1.4, textTransform: "uppercase" } }
    case "caption":
      return { size: "xs", tone: "muted" }
    default:
      return { size: "base" }
  }
}

/** Running text. `variant`: body, lead, large, small, muted, overline, caption, or an Apple text style; `emphasized` is its bolder weight. */
function Text({ variant = "body", emphasized = false, style, ...props }: GTextProps & { variant?: TextVariant; emphasized?: boolean }) {
  const v = textVariants({ variant, emphasized })
  return <GText {...v} style={[v.style, style]} {...props} />
}

type DisplaySize = "sm" | "md" | "lg" | "xl"
const DISPLAY: Record<DisplaySize, number> = { sm: 39, md: 49, lg: 61, xl: 95 }

/** Font size for a Display size — the native stand-in for the web's cva helper. */
function displayVariants({ size = "lg" }: { size?: DisplaySize } = {}) {
  return { fontSize: DISPLAY[size], lineHeight: Math.round(DISPLAY[size] * 1.05) }
}

/** A big figure — a count, a day number, a price. Display font, tight tracking, tabular numerals. */
function Display({ size = "lg", style, ...props }: Omit<GTextProps, "size"> & { size?: DisplaySize }) {
  const d = displayVariants({ size })
  // 95pt grows at most 1.2× under the largest Dynamic Type (NAT-74)
  return <GText font="display" maxFontSizeMultiplier={MAX_FONT_SCALE.display} style={[d, { letterSpacing: -0.03 * d.fontSize }, style]} {...props} />
}

/** A pulled quote in the heading face, ruled with the accent. */
function Blockquote({ style, children, ...props }: ViewProps) {
  const ui = useUI()
  return (
    <View style={[{ borderStartWidth: 3, borderStartColor: ui.primary, paddingStart: 16 }, style]} {...props}>
      {typeof children === "string" || typeof children === "number" ? (
        <GText font="heading" size="lg" tone="muted" weight="400">
          {children}
        </GText>
      ) : (
        children
      )}
    </View>
  )
}

/** `code` in running text — nest it inside a Text. */
function InlineCode({ style, ...props }: TextProps) {
  const ui = useUI()
  return <RNText style={[{ backgroundColor: ui.fill, borderRadius: ui.radius.control * 0.5, fontFamily: ui.fonts.mono, fontSize: ui.text.sm * 0.95, color: ui.foreground }, style]} {...props} />
}

/** Bulleted or numbered, markers in the accent. Each child is one item; strings are set as body text. */
function List({ ordered = false, style, children, ...props }: ViewProps & { ordered?: boolean }) {
  const ui = useUI()
  const items = React.Children.toArray(children)
  return (
    <View accessibilityRole="list" style={[{ gap: 6 }, style]} {...props}>
      {items.map((child, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 8 }}>
          <GText color={ui.primary} style={{ minWidth: ordered ? 18 : 10, fontVariant: ["tabular-nums"] }}>
            {ordered ? `${i + 1}.` : "•"}
          </GText>
          <View style={{ flex: 1 }}>{typeof child === "string" || typeof child === "number" ? <GText>{child}</GText> : child}</View>
        </View>
      ))}
    </View>
  )
}

/** An inline link: accent, underlined. `href` opens through Linking unless `onPress` is given. */
function TextLink({ href, onPress, style, ...props }: TextProps & { href?: string }) {
  const ui = useUI()
  return (
    <RNText
      accessibilityRole="link"
      onPress={onPress ?? (href ? () => Linking.openURL(href).catch(() => {}) : undefined)}
      style={[{ color: ui.primary, textDecorationLine: "underline", textDecorationColor: alpha(ui.primary, 0.4) }, style]}
      {...(href ? ({ href } as object) : {})}
      {...props}
    />
  )
}

export { Heading, Text, Display, Blockquote, InlineCode, List, TextLink, headingVariants, textVariants, displayVariants }
