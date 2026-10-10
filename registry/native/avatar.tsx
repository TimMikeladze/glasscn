import * as React from "react"
import { Image, StyleSheet, View, type ImageProps, type ViewProps } from "react-native"

import { GText, useUI, type UI } from "@/components/glass/native/ui"

/**
 * shadcn's Avatar on glass: a round photo with a hairline rim, falling back to
 * initials on a soft fill. Stack several in an `AvatarGroup`.
 *
 *   <Avatar>
 *     <AvatarImage src="https://…/mara.jpg" alt="Mara" />
 *     <AvatarFallback>MK</AvatarFallback>
 *   </Avatar>
 */

type Size = "sm" | "default" | "lg"
type Status = "idle" | "loading" | "loaded" | "error"

const SIZES: Record<Size, { box: number; font: number }> = { sm: { box: 24, font: 9.6 }, default: { box: 32, font: 12 }, lg: { box: 40, font: 14 } }

const AvatarContext = React.createContext<{ size: Size; status: Status; setStatus: (s: Status) => void }>({ size: "default", status: "idle", setStatus: () => {} })
const GroupContext = React.createContext(false)

/** Box style for a size — the native stand-in for the web's cva helper. */
function avatarVariants(ui: UI, { size = "default" }: { size?: Size } = {}) {
  const s = SIZES[size]
  return { width: s.box, height: s.box, borderRadius: s.box / 2, overflow: "hidden" as const, fontSize: s.font }
}

function Rim({ grouped }: { grouped: boolean }) {
  const ui = useUI()
  return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: 999, borderWidth: grouped ? 2 : 1, borderColor: ui.glassBorder }]} />
}

function Avatar({ size = "default", style, children, ...props }: ViewProps & { size?: Size }) {
  const ui = useUI()
  const grouped = React.useContext(GroupContext)
  const [status, setStatus] = React.useState<Status>("idle")
  const value = React.useMemo(() => ({ size, status, setStatus }), [size, status])
  const box = { ...avatarVariants(ui, { size }), fontSize: undefined }
  return (
    <AvatarContext.Provider value={value}>
      <View style={[box, grouped ? { backgroundColor: ui.glassTint, marginLeft: -8 } : null, style]} {...props}>
        {children}
        <Rim grouped={grouped} />
      </View>
    </AvatarContext.Provider>
  )
}

/** The photo. Hidden until it loads; on error the fallback stays. `src` is a URI. */
function AvatarImage({ src, alt, source, style, onLoad, onError, ...props }: Omit<ImageProps, "source"> & { src?: string; source?: ImageProps["source"] }) {
  const { status, setStatus } = React.useContext(AvatarContext)
  if (status === "error" || (!src && !source)) return null
  return (
    <Image
      source={source ?? { uri: src }}
      accessibilityLabel={alt}
      alt={alt}
      onLoadStart={() => status === "idle" && setStatus("loading")}
      onLoad={(e) => {
        setStatus("loaded")
        onLoad?.(e)
      }}
      onError={(e) => {
        setStatus("error")
        onError?.(e)
      }}
      style={[StyleSheet.absoluteFill, { opacity: status === "loaded" ? 1 : 0 }, style]}
      {...props}
    />
  )
}

/** Initials or an icon on a soft fill, shown until (or unless) the image loads. */
function AvatarFallback({ style, children, ...props }: ViewProps) {
  const ui = useUI()
  const { size, status } = React.useContext(AvatarContext)
  if (status === "loaded") return null
  const s = SIZES[size]
  return (
    <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center", backgroundColor: ui.fill }, style]} {...props}>
      {React.Children.map(children, (c) =>
        typeof c === "string" || typeof c === "number" ? (
          <GText weight="500" style={{ fontSize: s.font, lineHeight: Math.round(s.font * 1.2) }}>
            {c}
          </GText>
        ) : React.isValidElement<{ color?: string; size?: number }>(c) ? (
          React.cloneElement(c, { color: c.props.color ?? ui.foreground, size: c.props.size ?? Math.round(s.box * 0.55) })
        ) : (
          c
        )
      )}
    </View>
  )
}

/** Overlapping avatars, each ringed in the glass rim so the stack reads on any pane. */
function AvatarGroup({ style, ...props }: ViewProps) {
  return (
    <GroupContext.Provider value>
      <View style={[{ flexDirection: "row", alignItems: "center", paddingLeft: 8 }, style]} {...props} />
    </GroupContext.Provider>
  )
}

/** The "+3" at the end of a group. Takes the same `size` as the avatars. */
function AvatarGroupCount({ size = "default", style, children, ...props }: ViewProps & { size?: Size }) {
  const ui = useUI()
  const grouped = React.useContext(GroupContext)
  const { fontSize, ...box } = avatarVariants(ui, { size })
  return (
    <View style={[box, { alignItems: "center", justifyContent: "center", backgroundColor: ui.glassTint }, grouped ? { marginLeft: -8 } : null, style]} {...props}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: ui.fill }]} />
      {typeof children === "string" || typeof children === "number" ? (
        <GText tone="muted" weight="500" style={{ fontSize, lineHeight: Math.round(fontSize * 1.2), fontVariant: ["tabular-nums"] }}>
          {children}
        </GText>
      ) : (
        children
      )}
      <Rim grouped={grouped} />
    </View>
  )
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, avatarVariants }
