"use client"

import * as React from "react"
import { cn } from "@/lib/glass-cn"
import { Slot } from "radix-ui"

type Masks = { fill: string; rim: string; left: number; top: number; width: number; height: number }
const paintProperties = new Set(["offset", "computedOffset", "easing", "composite", "opacity", "color", "backgroundColor", "backgroundImage", "backgroundPosition", "boxShadow", "textShadow", "filter", "backdropFilter", "visibility", "fill", "stroke", "outlineColor", "borderColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor"])

/** Notify the contour when starting imperative Web Animations geometry motion. */
export function trackGlassAnimation(animation: Animation): Animation {
  const target = (animation.effect as KeyframeEffect | null)?.target
  if (target instanceof Element) target.dispatchEvent(new Event("glass-geometry-change", { bubbles: true }))
  return animation
}

/** Neighboring controls share one backdrop, with a smooth union contour as they approach. */
export function GlassCluster({ spacing = 12, mergeDistance = 24, variant = "regular", className, style, children, ref: forwardedRef, ...props }: React.ComponentProps<"div"> & { spacing?: number; mergeDistance?: number; variant?: "regular" | "clear" }) {
  const root = React.useRef<HTMLDivElement>(null)
  React.useImperativeHandle(forwardedRef, () => root.current as HTMLDivElement)
  const [masks, setMasks] = React.useState<Masks | null>(null)
  React.useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    let frame = 0
    const measure = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const scaleX = el.offsetWidth ? rect.width / el.offsetWidth : 1
      const scaleY = el.offsetHeight ? rect.height / el.offsetHeight : 1
      const shapes = [...el.querySelectorAll<HTMLElement>('[data-slot="glass-cluster-item"]')].map((item) => {
        const r = item.getBoundingClientRect()
        const width = r.width / scaleX, height = r.height / scaleY
        const radius = Math.min(parseFloat(getComputedStyle(item).borderTopLeftRadius) || 0, width / 2, height / 2)
        return { x: (r.left - rect.left) / scaleX, y: (r.top - rect.top) / scaleY, width, height, radius }
      })
      const css = getComputedStyle(el)
      const pad = (value: string) => parseFloat(value) || 0
      // Layout may already have contracted while FLIP items and exit ghosts
      // still occupy their previous positions. Their glass must travel with them.
      const left = Math.min(0, ...shapes.map((s) => s.x - pad(css.paddingLeft)))
      const top = Math.min(0, ...shapes.map((s) => s.y - pad(css.paddingTop)))
      const width = Math.max(rect.width / scaleX, ...shapes.map((s) => s.x + s.width + pad(css.paddingRight))) - left
      const height = Math.max(rect.height / scaleY, ...shapes.map((s) => s.y + s.height + pad(css.paddingBottom))) - top
      const shapeMarkup = shapes.map((s) => `<rect x="${s.x - left}" y="${s.y - top}" width="${s.width}" height="${s.height}" rx="${s.radius}" fill="white"/>`).join("")
      const sigma = Math.max(0.1, Math.min(48, Number.isFinite(mergeDistance) ? mergeDistance / 2 : 12))
      // The alpha union and erosion affect only the mask, never the label or backdrop pixels.
      const filter = `<filter id="union" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sigma}"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 18 -8" result="shape"/>`
      const image = (rim: boolean) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs>${filter}${rim ? '<feMorphology in="shape" operator="erode" radius="1.3" result="inner"/><feComposite in="shape" in2="inner" operator="out"/>' : ''}</filter></defs><g filter="url(#union)">${shapeMarkup}</g></svg>`)}")`
      const next = { fill: image(false), rim: image(true), left, top, width, height }
      setMasks((previous) => previous?.fill === next.fill && previous.left === left && previous.top === top ? previous : next)
      const geometryIsAnimating = el.getAnimations?.({ subtree: true }).some((animation) => {
        const effect = animation.effect as KeyframeEffect | null
        const target = effect?.target
        return target instanceof Element && (target === el || target.matches('[data-slot="glass-cluster-item"]') || !!target.querySelector('[data-slot="glass-cluster-item"]')) && (animation.pending || animation.playState === "running") && effect!.getKeyframes().some((keyframe) => Object.keys(keyframe).some((property) => !paintProperties.has(property)))
      })
      if (geometryIsAnimating) schedule()
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure) }
    const motion = (event: TransitionEvent | AnimationEvent) => {
      const target = event.target
      if (!(target instanceof Element) || (target !== el && !target.matches('[data-slot="glass-cluster-item"]') && !target.querySelector('[data-slot="glass-cluster-item"]'))) return
      schedule()
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(el)
    el.querySelectorAll('[data-slot="glass-cluster-item"]').forEach((item) => observer.observe(item))
    el.addEventListener("transitionrun", motion)
    el.addEventListener("transitionend", motion)
    el.addEventListener("transitioncancel", motion)
    el.addEventListener("animationstart", motion)
    el.addEventListener("animationend", motion)
    el.addEventListener("animationcancel", motion)
    el.addEventListener("glass-geometry-change", schedule)
    el.addEventListener("pointerover", schedule)
    el.addEventListener("pointerout", schedule)
    el.addEventListener("focusin", schedule)
    el.addEventListener("focusout", schedule)
    const mutations = new MutationObserver((records) => {
      if (records.some(({ target }) => target instanceof Element && (target === el || target.matches('[data-slot="glass-cluster-item"]') || !!target.querySelector('[data-slot="glass-cluster-item"]')))) schedule()
    })
    mutations.observe(el, { attributes: true, subtree: true, attributeFilter: ["style", "class", "hidden"] })
    window.addEventListener("resize", schedule)
    schedule()
    return () => {
      observer.disconnect()
      mutations.disconnect()
      cancelAnimationFrame(frame)
      el.removeEventListener("transitionrun", motion)
      el.removeEventListener("transitionend", motion)
      el.removeEventListener("transitioncancel", motion)
      el.removeEventListener("animationstart", motion)
      el.removeEventListener("animationend", motion)
      el.removeEventListener("animationcancel", motion)
      el.removeEventListener("glass-geometry-change", schedule)
      el.removeEventListener("pointerover", schedule)
      el.removeEventListener("pointerout", schedule)
      el.removeEventListener("focusin", schedule)
      el.removeEventListener("focusout", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [children, mergeDistance, spacing, className, style])
  return <div ref={root} data-slot="glass-cluster" className={cn("relative inline-flex items-center p-3 transition-[gap] duration-[calc(var(--glass-duration)*2)] ease-glass", variant === "clear" ? "glass-clear-label" : "text-glass-label", className)} style={{ gap: Math.max(0, Number.isFinite(spacing) ? spacing : 12), ...style }} {...props}>
    {masks ? <>
      <div aria-hidden data-glass-optics="off" data-slot="glass-cluster-surface" className={cn(variant === "clear" ? "glass-liquid-clear" : "glass-liquid", "pointer-events-none absolute border-0 shadow-none before:hidden")} style={{ left: masks.left, top: masks.top, width: masks.width, height: masks.height, maskImage: masks.fill, WebkitMaskImage: masks.fill }} />
      <div aria-hidden className="pointer-events-none absolute" style={{ left: masks.left, top: masks.top, width: masks.width, height: masks.height, maskImage: masks.rim, WebkitMaskImage: masks.rim, background: "linear-gradient(var(--glass-light-angle), color-mix(in oklch, var(--glass-highlight-color) var(--glass-specular), transparent), color-mix(in oklch, var(--glass-shadow-color) var(--glass-edge-shade), transparent))" }} />
    </> : null}
    {children}
  </div>
}

export function GlassClusterItem({ asChild = false, className, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return <Comp data-slot="glass-cluster-item" type={asChild ? undefined : "button"} className={cn("glass-focus glass-press-liquid relative inline-flex h-control-lg min-w-control-lg items-center justify-center gap-2 rounded-button px-pad-sm text-sm font-medium disabled:text-glass-label-tertiary [&_svg]:size-5", className)} {...props} />
}
