"use client"

import * as React from "react"
import { cn } from "@/lib/glass-cn"
import { Slot } from "radix-ui"

const paintProperties = new Set(["offset", "computedOffset", "easing", "composite", "opacity", "color", "backgroundColor", "backgroundImage", "backgroundPosition", "boxShadow", "textShadow", "filter", "backdropFilter", "visibility", "fill", "stroke", "outlineColor", "borderColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor"])

/** Notify the contour when starting imperative Web Animations geometry motion. */
export function trackGlassAnimation(animation: Animation): Animation {
  const target = (animation.effect as KeyframeEffect | null)?.target
  if (target instanceof Element) target.dispatchEvent(new Event("glass-geometry-change", { bubbles: true }))
  return animation
}

type Shape = { x: number; y: number; width: number; height: number; radius: number }

const round = (v: number) => Math.round(v * 100) / 100

/**
 * The outline of rounded rectangles joined by a smooth minimum: shapes nearer than `blend`
 * grow a neck between them, like Liquid Glass siblings in one container. Traced with marching
 * squares on a `step` grid; `inset` traces the outline that far inside the edge (the rim's
 * inner side). Returns an SVG path in the shapes' coordinates minus `origin`.
 */
export function unionContour(shapes: Shape[], blend: number, { step = 2, inset = 0, origin = [0, 0] as [number, number] } = {}): string {
  if (!shapes.length) return ""
  const field = (px: number, py: number) => {
    let d = Infinity
    for (const s of shapes) {
      const r = Math.max(0, Math.min(s.radius, s.width / 2, s.height / 2))
      const qx = Math.abs(px - s.x - s.width / 2) - s.width / 2 + r
      const qy = Math.abs(py - s.y - s.height / 2) - s.height / 2 + r
      const sd = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r
      if (d === Infinity || blend <= 0) d = Math.min(d, sd)
      else {
        const h = Math.max(blend - Math.abs(d - sd), 0) / blend
        d = Math.min(d, sd) - (h * h * blend) / 4
      }
    }
    return d + inset
  }
  // the smooth minimum reaches up to blend / 4 past the shapes; keep a dry border round the grid
  const pad = Math.max(0, blend) / 4 + step * 2
  const x0 = Math.min(...shapes.map((s) => s.x)) - pad, y0 = Math.min(...shapes.map((s) => s.y)) - pad
  const nx = Math.ceil((Math.max(...shapes.map((s) => s.x + s.width)) + pad - x0) / step) + 1
  const ny = Math.ceil((Math.max(...shapes.map((s) => s.y + s.height)) + pad - y0) / step) + 1
  const v = new Float32Array(nx * ny)
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) v[j * nx + i] = field(x0 + i * step, y0 + j * step)
  // edge ids: 2k is the horizontal edge right of grid point k, 2k + 1 the vertical edge below it
  const at = new Map<number, [number, number]>()
  const links = new Map<number, number[]>()
  const point = (edge: number) => {
    if (at.has(edge)) return
    const k = edge >> 1, i = k % nx, j = (k - i) / nx
    const a = v[k], b = edge & 1 ? v[k + nx] : v[k + 1]
    const t = a / (a - b)
    at.set(edge, edge & 1 ? [x0 + i * step, y0 + (j + t) * step] : [x0 + (i + t) * step, y0 + j * step])
  }
  const link = (a: number, b: number) => {
    point(a); point(b)
    ;(links.get(a) ?? links.set(a, []).get(a)!).push(b)
    ;(links.get(b) ?? links.set(b, []).get(b)!).push(a)
  }
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const k = j * nx + i
    const c = (v[k] < 0 ? 1 : 0) | (v[k + 1] < 0 ? 2 : 0) | (v[k + nx + 1] < 0 ? 4 : 0) | (v[k + nx] < 0 ? 8 : 0)
    if (c === 0 || c === 15) continue
    const top = 2 * k, bottom = 2 * (k + nx), left = 2 * k + 1, right = 2 * (k + 1) + 1
    const centre = (v[k] + v[k + 1] + v[k + nx] + v[k + nx + 1]) / 4 < 0
    switch (c) {
      case 1: case 14: link(left, top); break
      case 2: case 13: link(top, right); break
      case 3: case 12: link(left, right); break
      case 4: case 11: link(right, bottom); break
      case 6: case 9: link(top, bottom); break
      case 7: case 8: link(left, bottom); break
      case 5: if (centre) { link(top, right); link(left, bottom) } else { link(left, top); link(right, bottom) } break
      case 10: if (centre) { link(left, top); link(right, bottom) } else { link(top, right); link(left, bottom) } break
    }
  }
  const seen = new Set<number>()
  let d = ""
  for (const first of links.keys()) {
    if (seen.has(first)) continue
    let previous = -1, edge = first
    const loop: string[] = []
    while (!seen.has(edge)) {
      seen.add(edge)
      const [x, y] = at.get(edge)!
      loop.push(`${round(x - origin[0])} ${round(y - origin[1])}`)
      const next = links.get(edge)!.find((n) => n !== previous && !seen.has(n)) ?? links.get(edge)!.find((n) => n !== previous)
      if (next === undefined) break
      previous = edge
      edge = next
    }
    if (loop.length > 2) d += `M${loop.join("L")}Z`
  }
  return d
}

/** Neighboring controls share one backdrop, with a smooth union contour as they approach. */
export function GlassCluster({ spacing = 12, mergeDistance = 24, variant = "regular", className, style, children, ref: forwardedRef, ...props }: React.ComponentProps<"div"> & { spacing?: number; mergeDistance?: number; variant?: "regular" | "clear" }) {
  const root = React.useRef<HTMLDivElement>(null)
  const surface = React.useRef<HTMLDivElement>(null)
  const rim = React.useRef<HTMLDivElement>(null)
  const fillPath = React.useRef<SVGPathElement>(null)
  const rimPath = React.useRef<SVGPathElement>(null)
  const id = `glass-cluster-${React.useId().replace(/[^\w-]/g, "")}`
  React.useImperativeHandle(forwardedRef, () => root.current as HTMLDivElement)
  React.useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    let frame = 0
    // Measured and painted in the same frame: the outline is written into inline SVG masks here,
    // not through React state or a data-URL image that decodes later, so it never trails moving
    // items. A mask (unlike clip-path: path() in Chromium) also clips the backdrop blur.
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
      }).filter((s) => s.width && s.height)
      const blend = Number.isFinite(mergeDistance) ? Math.max(0, mergeDistance) : 24
      const pad = blend / 4 + 6
      // Layout may already have contracted while FLIP items and exit ghosts
      // still occupy their previous positions. Their glass must travel with them.
      const left = Math.min(0, ...shapes.map((s) => s.x - pad))
      const top = Math.min(0, ...shapes.map((s) => s.y - pad))
      const width = Math.max(rect.width / scaleX, ...shapes.map((s) => s.x + s.width + pad)) - left
      const height = Math.max(rect.height / scaleY, ...shapes.map((s) => s.y + s.height + pad)) - top
      const origin: [number, number] = [left, top]
      const outline = unionContour(shapes, blend, { origin })
      const box = { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` }
      const fill = surface.current, edge = rim.current
      const key = `${round(left)},${round(top)},${round(width)},${round(height)} ${outline}`
      if (fill && edge && fillPath.current && rimPath.current && fill.dataset.outline !== key) {
        Object.assign(fill.style, box)
        Object.assign(edge.style, box)
        fillPath.current.setAttribute("d", outline)
        rimPath.current.setAttribute("d", outline + unionContour(shapes, blend, { inset: 1.3, origin }))
        fill.dataset.outline = key
        fill.dataset.shapes = shapes.map((s) => [s.x, s.y, s.width, s.height].map(round).join(",")).join(" ")
        fill.dataset.measured = ""
        edge.dataset.measured = ""
      }
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
    {/* the boxes, mask paths and data-shapes are written by measure(), outside React */}
    <svg aria-hidden width="0" height="0" className="pointer-events-none absolute">
      <defs>
        <mask id={`${id}-fill`}><path ref={fillPath} fill="white" fillRule="evenodd" /></mask>
        <mask id={`${id}-rim`}><path ref={rimPath} fill="white" fillRule="evenodd" /></mask>
      </defs>
    </svg>
    <div ref={surface} aria-hidden data-glass-optics="off" data-slot="glass-cluster-surface" className={cn(variant === "clear" ? "glass-liquid-clear" : "glass-liquid", "pointer-events-none invisible absolute rounded-none border-0 shadow-none before:hidden data-measured:visible")} style={{ maskImage: `url(#${id}-fill)`, WebkitMaskImage: `url(#${id}-fill)` }} />
    <div ref={rim} aria-hidden data-slot="glass-cluster-rim" className="pointer-events-none invisible absolute data-measured:visible" style={{ maskImage: `url(#${id}-rim)`, WebkitMaskImage: `url(#${id}-rim)`, background: "linear-gradient(var(--glass-light-angle), color-mix(in oklch, var(--glass-highlight-color) var(--glass-specular), transparent), color-mix(in oklch, var(--glass-shadow-color) var(--glass-edge-shade), transparent))" }} />
    {children}
  </div>
}

export function GlassClusterItem({ asChild = false, className, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return <Comp data-slot="glass-cluster-item" type={asChild ? undefined : "button"} className={cn("glass-focus glass-press-liquid relative inline-flex h-control-lg min-w-control-lg items-center justify-center gap-2 rounded-button px-pad-sm text-sm font-medium disabled:text-glass-label-tertiary [&_svg]:size-5", className)} {...props} />
}
