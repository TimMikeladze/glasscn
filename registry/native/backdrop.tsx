import * as React from "react"
import { Image, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { Defs, RadialGradient, Rect, Stop, Svg } from "react-native-svg"
import { useVideoPlayer, VideoView } from "expo-video"

import { useReducedMotion } from "@/components/glass/native/a11y"
import { useUI } from "@/components/glass/native/ui"

const MESH = [
  { cx: "12%", cy: "18%", r: "60%", i: 0 },
  { cx: "88%", cy: "12%", r: "55%", i: 1 },
  { cx: "78%", cy: "86%", r: "60%", i: 2 },
  { cx: "18%", cy: "92%", r: "55%", i: 4 },
] as const

/**
 * A ground for glass besides the aurora — the web's Backdrop. `image` covers the
 * view with a photo and an optional `dim` scrim; `video` plays `src` muted and
 * looping with expo-video, showing `poster` until the first frame (and staying
 * paused on it under Reduce Motion);
 * `mesh` blends four chart colours; `noise` is the plain ground.
 */
export function Backdrop({
  variant = "mesh",
  src,
  poster,
  position,
  dim = 0,
  style,
  ...props
}: Omit<ViewProps, "style" | "children"> & {
  variant?: "image" | "video" | "mesh" | "noise"
  src?: string
  poster?: string
  /** Kept for parity with the web's object-position; native images cover from the centre. */
  position?: string
  dim?: number
  style?: StyleProp<ViewStyle>
}) {
  const ui = useUI()
  void position
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const uri = variant === "image" ? src : variant === "video" ? poster : undefined
  const [ready, setReady] = React.useState(false)
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[StyleSheet.absoluteFill, { backgroundColor: ui.auroraBase, overflow: "hidden" }, style]} {...props}>
      {variant === "video" && src ? <BackdropVideo src={src} onReady={() => setReady(true)} /> : null}
      {uri && !(variant === "video" && ready) ? <Image alt="" source={{ uri }} resizeMode="cover" style={StyleSheet.absoluteFill} /> : null}
      {variant === "mesh" ? (
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            {MESH.map((m) => (
              <RadialGradient key={m.i} id={`${id}-${m.i}`} cx={m.cx} cy={m.cy} r={m.r}>
                <Stop offset="0" stopColor={ui.charts[m.i]} stopOpacity={0.9} />
                <Stop offset="1" stopColor={ui.charts[m.i]} stopOpacity={0} />
              </RadialGradient>
            ))}
          </Defs>
          {MESH.map((m) => (
            <Rect key={m.i} width="100%" height="100%" fill={`url(#${id}-${m.i})`} />
          ))}
        </Svg>
      ) : null}
      {dim > 0 ? <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${Math.min(1, dim)})` }]} /> : null}
    </View>
  )
}

/** Muted, looping, no controls; paused under Reduce Motion. */
function BackdropVideo({ src, onReady }: { src: string; onReady: () => void }) {
  const still = useReducedMotion()
  const player = useVideoPlayer(src, (p) => {
    p.muted = true
    p.loop = true
  })
  React.useEffect(() => {
    if (still) player.pause()
    else player.play()
  }, [player, still])
  return <VideoView player={player} nativeControls={false} contentFit="cover" onFirstFrameRender={onReady} style={StyleSheet.absoluteFill} />
}
