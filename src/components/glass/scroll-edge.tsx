"use client"

import * as React from "react"
import { cn } from "@/lib/glass-cn"

/**
 * Scroll awareness for the floating bars (toolbar, dock, navigation bar): where the
 * page scrolls, which way it last went, and whether content sits under a bar.
 *
 * `ScrollEdge` keeps text legible where content slides under a bar — a progressive
 * blur band (`soft`) or a near-opaque strip (`hard`) — and, through a sentinel at
 * the content's edge, sets `data-over-content` on the bars at that edge so their
 * shadow deepens (`glass-shadow-adaptive`). Put it first (top) or last (bottom)
 * inside the scrolling content:
 *
 *   <main>
 *     <ScrollEdge edge="top" />
 *     …long content…
 *     <ScrollEdge edge="bottom" />
 *   </main>
 */

/** The element that scrolls `el`: the nearest ancestor with overflow auto/scroll, or null for the page. */
export function scrollParent(el: Element | null): HTMLElement | null {
  for (let node = el?.parentElement ?? null; node; node = node.parentElement) {
    if (node === document.body || node === document.documentElement) return null
    const { overflowY } = getComputedStyle(node)
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") return node
  }
  return null
}

/**
 * The next minimized state from one scroll step. Hides after travelling `threshold`
 * px down past the first `offset` px; shows again on any scroll up, or near the top.
 */
export function nextMinimized(prev: boolean, from: number, to: number, { threshold = 8, offset = 48 } = {}) {
  if (to <= offset) return false
  const delta = to - from
  if (delta > threshold) return true
  if (delta < -threshold) return false
  return prev
}

/**
 * True while the user is scrolling down (the page, or the bar's own scroll container) —
 * the bars use it for `minimize="onScrollDown"`. Always false when `enabled` is false.
 */
export function useScrollMinimized(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const [minimized, setMinimized] = React.useState(false)
  React.useEffect(() => {
    if (!enabled) return
    const parent = scrollParent(ref.current)
    const target: HTMLElement | Window = parent ?? window
    const position = () => (parent ? parent.scrollTop : window.scrollY)
    let last = position()
    let state = false
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const y = position()
        const next = ref.current?.querySelector(":focus-visible") ? false : nextMinimized(state, last, y)
        // ignore jitter: move the anchor only once a step was big enough to decide
        if (next !== state || Math.abs(y - last) > 8) last = y
        state = next
        setMinimized(next)
      })
    }
    target.addEventListener("scroll", onScroll, { passive: true })
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof Element && event.target.matches(":focus-visible")) { state = false; setMinimized(false) }
    }
    const bar = ref.current
    bar?.addEventListener("focusin", onFocus)
    return () => {
      target.removeEventListener("scroll", onScroll)
      bar?.removeEventListener("focusin", onFocus)
      cancelAnimationFrame(frame)
    }
  }, [ref, enabled])
  return enabled && minimized
}

type Edge = "top" | "bottom"

/** Bars track their own scrolling content; callers do not need a separate sentinel. */
export function useScrollOverContent(ref: React.RefObject<HTMLElement | null>, edge: Edge | null) {
  const subscribe = React.useCallback((notify: () => void) => {
    if (!edge) return () => {}
    const parent = scrollParent(ref.current)
    const target = parent ?? window
    target.addEventListener("scroll", notify, { passive: true })
    window.addEventListener("resize", notify)
    const resize = new ResizeObserver(notify)
    resize.observe(parent ?? document.documentElement)
    return () => { target.removeEventListener("scroll", notify); window.removeEventListener("resize", notify); resize.disconnect() }
  }, [ref, edge])
  const snapshot = React.useCallback(() => {
    if (!edge || !ref.current) return false
    const parent = scrollParent(ref.current)
    const y = parent ? parent.scrollTop : window.scrollY
    if (edge === "top") return y > 0
    const height = parent ? parent.clientHeight : window.innerHeight
    const extent = parent ? parent.scrollHeight : document.documentElement.scrollHeight
    return y + height < extent - 1
  }, [ref, edge])
  return React.useSyncExternalStore(subscribe, snapshot, () => false)
}

/**
 * Bars at an edge (`data-bar-edge="top" | "bottom"`) inside `root` — or on the page
 * when root is null — get `data-over-content` while `over` is true.
 */
function markBars(root: HTMLElement | null, edge: Edge, over: boolean) {
  const scope: ParentNode = root ?? document
  scope.querySelectorAll<HTMLElement>(`[data-bar-edge="${edge}"]`).forEach((bar) => {
    if (scrollParent(bar) !== root) return
    if (over) bar.setAttribute("data-over-content", "")
    else bar.removeAttribute("data-over-content")
  })
}

/**
 * True once content has scrolled under `edge`: the sentinel left the viewport (top)
 * or there is more content below (bottom). Marks that edge's bars as it changes.
 */
function useOverContent(sentinel: React.RefObject<HTMLElement | null>, edge: Edge) {
  const [over, setOver] = React.useState(false)
  React.useEffect(() => {
    const el = sentinel.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const root = scrollParent(el)
    const observer = new IntersectionObserver(
      ([entry]) => {
        const next = !entry.isIntersecting
        setOver(next)
        markBars(root, edge, next)
      },
      { root, threshold: 0 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      markBars(root, edge, false)
    }
  }, [sentinel, edge])
  return over
}

type ScrollEdgeProps = Omit<React.ComponentProps<"div">, "children"> & {
  edge?: Edge
  /** `automatic` diffuses content into a uniform bar with a fading edge; `soft` and `hard` explicitly override it. */
  variant?: "automatic" | "soft" | "hard"
}

function ScrollEdge({ edge = "top", variant = "automatic", className, ...props }: ScrollEdgeProps) {
  const sentinel = React.useRef<HTMLDivElement>(null)
  const over = useOverContent(sentinel, edge)
  const band = (
    <div
      data-slot="scroll-edge"
      data-edge={edge}
      data-variant={variant}
      data-over-content={over ? "" : undefined}
      aria-hidden
      className={cn(
        "group/scroll-edge pointer-events-none sticky z-20 h-(--scroll-edge-size) opacity-0 transition-opacity duration-(--glass-duration) ease-glass [--scroll-edge-size:calc(5rem*var(--glass-density))] data-over-content:opacity-100",
        "data-[edge=top]:top-0 data-[edge=top]:-mb-(--scroll-edge-size) data-[edge=bottom]:bottom-0 data-[edge=bottom]:-mt-(--scroll-edge-size) data-[edge=bottom]:[--glass-scroll-edge-to:top]",
        className
      )}
      {...props}
    >
      {/* the material lives on a child: the scroll-edge utilities set their own position */}
      <div className="size-full group-data-[variant=hard]/scroll-edge:scroll-edge-hard group-data-[variant=soft]/scroll-edge:scroll-edge-soft group-data-[variant=automatic]/scroll-edge:scroll-edge-automatic" />
    </div>
  )
  const mark = <div ref={sentinel} data-slot="scroll-edge-sentinel" aria-hidden className="h-px w-full" />
  return edge === "top" ? (
    <>
      {band}
      {mark}
    </>
  ) : (
    <>
      {mark}
      {band}
    </>
  )
}

export { ScrollEdge }
