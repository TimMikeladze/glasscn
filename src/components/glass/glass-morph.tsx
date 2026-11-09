"use client"

import * as React from "react"
import { cn } from "@/lib/glass-cn"

import { GlassCluster, GlassClusterItem, trackGlassAnimation } from "@/components/glass/glass-cluster"

type Shape = { x: number; y: number; width: number; height: number; clone: HTMLElement }
type MorphProps = Omit<React.ComponentProps<"div">, "children" | "ref"> & { value?: string | number | boolean; spacing?: number; children?: React.ReactNode }
const items = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>("[data-glass-morph-id]")]

/** A namespace of stable sibling identities. Web measures geometry; native delegates to SwiftUI. */
export function GlassMorph({ ref: forwardedRef, ...props }: MorphProps & { ref?: React.Ref<HTMLDivElement> }) {
  const container = React.useRef<GlassMorphContainer>(null)
  React.useImperativeHandle(forwardedRef, () => container.current!.root.current!)
  return <GlassMorphContainer ref={container} {...props} />
}

class GlassMorphContainer extends React.Component<MorphProps> {
  root = React.createRef<HTMLDivElement>()
  private animations = new Set<Animation>()
  private ghosts = new Set<HTMLElement>()
  private motion?: MediaQueryList

  private onMotionChange = () => { if (this.motion?.matches) this.clear() }

  componentDidMount() {
    if (typeof matchMedia === "undefined") return
    this.motion = matchMedia("(prefers-reduced-motion: reduce)")
    this.motion.addEventListener("change", this.onMotionChange)
  }

  getSnapshotBeforeUpdate(): Map<string, Shape> | null {
    const root = this.root.current
    if (!root || typeof matchMedia === "undefined" || matchMedia("(prefers-reduced-motion: reduce)").matches) return null
    return new Map(items(root).map((item) => {
      const r = item.getBoundingClientRect()
      // Document coordinates retain movement of a centered container while
      // excluding viewport scrolling from the layout transition.
      return [item.dataset.glassMorphId!, { x: r.left + window.scrollX, y: r.top + window.scrollY, width: r.width, height: r.height, clone: item.cloneNode(true) as HTMLElement }]
    }))
  }

  componentDidUpdate(_props: MorphProps, _state: unknown, previous: Map<string, Shape> | null) {
    this.clear()
    const root = this.root.current
    if (!previous || !root || typeof root.animate !== "function") return
    const css = getComputedStyle(root)
    const rawDuration = css.getPropertyValue("--glass-duration").trim()
    const duration = (parseFloat(rawDuration) || 0) * (rawDuration.endsWith("ms") ? 1 : 1000) * 2
    if (!duration) return
    const easing = css.getPropertyValue("--glass-ease").trim() || "ease-out"
    const rect = root.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const scaleX = root.offsetWidth ? rect.width / root.offsetWidth : 1
    const scaleY = root.offsetHeight ? rect.height / root.offsetHeight : 1
    const current = items(root)
    const present = new Set(current.map((item) => item.dataset.glassMorphId!))
    const animate = (item: HTMLElement, frames: Keyframe[], removed = false) => {
      let animation: Animation
      try { animation = item.animate(frames, { duration, easing }) }
      catch { animation = item.animate(frames, { duration, easing: "ease-out" }) }
      this.animations.add(animation)
      const finish = () => {
        this.animations.delete(animation)
        if (removed) { this.ghosts.delete(item); item.remove() }
        root.dispatchEvent(new Event("glass-geometry-change"))
      }
      animation.addEventListener("finish", finish, { once: true })
      animation.addEventListener("cancel", finish, { once: true })
      trackGlassAnimation(animation)
    }
    for (const item of current) {
      const r = item.getBoundingClientRect()
      const old = previous.get(item.dataset.glassMorphId!)
      if (old && r.width && r.height) {
        const x = (old.x - r.left - window.scrollX) / scaleX, y = (old.y - r.top - window.scrollY) / scaleY
        if (Math.abs(x) + Math.abs(y) + Math.abs(old.width - r.width) + Math.abs(old.height - r.height) > 0.5) animate(item, [{ transformOrigin: "top left", transform: `translate(${x}px,${y}px) scale(${old.width / r.width},${old.height / r.height})` }, { transformOrigin: "top left", transform: "none" }])
      } else animate(item, [{ transform: "scale(0.6)", opacity: 0 }, { transform: "none", opacity: 1 }])
    }
    for (const [id, old] of previous) if (!present.has(id)) {
      const ghost = old.clone
      ghost.removeAttribute("data-glass-morph-id")
      ghost.setAttribute("aria-hidden", "true")
      ghost.inert = true
      ghost.removeAttribute("id")
      ghost.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"))
      Object.assign(ghost.style, { position: "absolute", left: `${(old.x - rect.left - window.scrollX) / scaleX}px`, top: `${(old.y - rect.top - window.scrollY) / scaleY}px`, width: `${old.width / scaleX}px`, height: `${old.height / scaleY}px`, pointerEvents: "none", margin: "0" })
      root.append(ghost)
      this.ghosts.add(ghost)
      animate(ghost, [{ transform: "none", opacity: 1 }, { transform: "scale(0.6)", opacity: 0 }], true)
    }
  }

  private clear() {
    for (const animation of this.animations) animation.cancel()
    this.animations.clear()
    for (const ghost of this.ghosts) ghost.remove()
    this.ghosts.clear()
    this.root.current?.dispatchEvent(new Event("glass-geometry-change"))
  }
  componentWillUnmount() {
    this.motion?.removeEventListener("change", this.onMotionChange)
    this.clear()
  }

  render() {
    const { value: _value, children, ...props } = this.props
    void _value
    const variants = new Set<"regular" | "clear">()
    const collect = (nodes: React.ReactNode) => React.Children.forEach(nodes, (node) => {
      if (!React.isValidElement<{ variant?: "regular" | "clear"; children?: React.ReactNode }>(node)) return
      if (node.type === React.Fragment) collect(node.props.children)
      else if (node.type === GlassMorphItem) variants.add(node.props.variant ?? "regular")
    })
    collect(children)
    if (variants.size > 1) throw new Error("GlassMorph uses one material variant per container; put regular and clear groups in separate containers.")
    return <GlassCluster {...props} ref={this.root} variant={variants.has("clear") ? "clear" : "regular"} data-slot="glass-morph">{children}</GlassCluster>
  }
}

export type GlassMorphItemProps = React.ComponentProps<typeof GlassClusterItem> & {
  id: string
  variant?: "regular" | "clear"
  tint?: string
  interactive?: boolean
  onPress?: () => void
  accessibilityLabel?: string
}

export function GlassMorphItem({ id, variant: _variant, tint, interactive = true, onPress, accessibilityLabel, onClick, style, className, ...props }: GlassMorphItemProps) {
  void _variant
  return <GlassClusterItem data-glass-morph-id={id} aria-label={accessibilityLabel} onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) onPress?.() }} className={cn("shrink-0", className)} style={{ ...(tint ? { backgroundColor: `color-mix(in oklch, ${tint} 28%, transparent)` } : {}), ...(interactive ? {} : { scale: "1" }), ...style }} {...props} />
}
