"use client"

import * as React from "react"

/**
 * Tracks the selected child of a group and exposes its box as CSS variables on
 * the group, so one indicator element can slide between items:
 *
 *   --indicator-x / --indicator-y / --indicator-w / --indicator-h / --indicator-opacity
 *
 * Works for any primitive that marks the selection with an attribute (Radix's
 * `data-state="on"` / `"active"`), controlled or not, and follows resizes.
 * `data-indicator-ready` is set after the first measurement so the indicator
 * doesn't animate in from the corner on mount.
 */
export function useSlidingIndicator<T extends HTMLElement>(selector: string) {
  const ref = React.useRef<T>(null)

  React.useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const update = () => {
      const active = root.querySelector<HTMLElement>(selector)
      if (!active) {
        root.style.setProperty("--indicator-opacity", "0")
        return
      }
      root.style.setProperty("--indicator-x", `${active.offsetLeft}px`)
      root.style.setProperty("--indicator-y", `${active.offsetTop}px`)
      root.style.setProperty("--indicator-w", `${active.offsetWidth}px`)
      root.style.setProperty("--indicator-h", `${active.offsetHeight}px`)
      root.style.setProperty("--indicator-opacity", "1")
      if (!root.dataset.indicatorReady) {
        requestAnimationFrame(() => {
          root.dataset.indicatorReady = "true"
        })
      }
    }
    update()
    const mutations = new MutationObserver(update)
    mutations.observe(root, { subtree: true, attributes: true, attributeFilter: ["data-state", "aria-selected", "aria-checked"] })
    const resizes = new ResizeObserver(update)
    resizes.observe(root)
    return () => {
      mutations.disconnect()
      resizes.disconnect()
    }
  }, [selector])

  return ref
}

/** Classes for the sliding element itself. */
export const slidingIndicatorClass =
  "pointer-events-none absolute top-0 left-0 h-(--indicator-h) w-(--indicator-w) [transform:translate(var(--indicator-x),var(--indicator-y))] opacity-(--indicator-opacity) in-data-indicator-ready:transition-[transform,width,height,opacity] in-data-indicator-ready:duration-[calc(var(--glass-duration)*1.5)] in-data-indicator-ready:ease-glass motion-reduce:transition-none"
