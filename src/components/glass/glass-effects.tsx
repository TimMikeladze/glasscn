"use client"

import * as React from "react"

import { createLensMap } from "@/lib/glass-optics"

const NS = "http://www.w3.org/2000/svg"
const SURFACES = '[class*="glass-liquid"], [class*="glass-prominent"], [class*="glass-knob-lens"], [data-liquid-surface]'
const PREFERENCES = ["(prefers-reduced-transparency: reduce)", "(prefers-contrast: more)", "(forced-colors: active)"]
type Filter = { id: string; node: SVGFilterElement; uses: number }
type Surface = { key: string; filter: Filter }
type Runtime = { retain: () => void; release: () => void }
const runtimes = new WeakMap<Document, Runtime>()
let sequence = 0

// Some engines accept URL filters syntactically but don't render them on a backdrop.
// Keep their CSS material intact; browser tests verify pixels as well as computed CSS.
function supportsRefraction() {
  return /\b(?:Chrome|Chromium|HeadlessChrome)\/\d+/.test(navigator.userAgent) && CSS.supports("backdrop-filter", "url(#glass)")
}

// React attaches its fiber to a DOM node when it hydrates it. A server-rendered node inside a
// React tree without one belongs to a Suspense boundary that hasn't hydrated yet; writing
// attributes or styles to it now produces a hydration mismatch. Plain DOM outside React is fine.
function reactOwned(el: Element) {
  for (const key in el) if (key.startsWith("__reactFiber$")) return true
  return false
}
function hydrated(el: HTMLElement) {
  if (reactOwned(el)) return true
  for (let parent = el.parentElement; parent; parent = parent.parentElement) if (reactOwned(parent)) return false
  return true
}

function createRuntime(doc: Document): Runtime {
  let references = 0
  let frame = 0
  let retry = 0
  let pointerFrame = 0
  let latestPointer: PointerEvent | null = null
  const surfaces = new Map<HTMLElement, Surface>()
  const candidates = new Set<HTMLElement>()
  const filters = new Map<string, Filter>()
  const maps = new Map<string, string>()
  const depths = new Map<HTMLElement, { previous: string; value: string }>()
  const svg = doc.createElementNS(NS, "svg")
  svg.setAttribute("data-slot", "glass-effects")
  svg.setAttribute("aria-hidden", "true")
  svg.setAttribute("width", "0")
  svg.setAttribute("height", "0")
  svg.style.cssText = "position:absolute;pointer-events:none;overflow:hidden"
  const defs = doc.createElementNS(NS, "defs")
  svg.append(defs)
  const preferences = PREFERENCES.map((q) => matchMedia(q))
  const motion = matchMedia("(prefers-reduced-motion: reduce)")
  const canRefract = supportsRefraction()
  const previousActivity = doc.documentElement.getAttribute("data-glass-window-active")
  let activityValue: string | null = null
  function activity() {
    // Explicit authored activity is a scoped preview override.
    if (previousActivity !== null) return
    activityValue = String(doc.visibilityState !== "hidden" && doc.hasFocus())
    doc.documentElement.setAttribute("data-glass-window-active", activityValue)
  }
  function clearDepth(el: HTMLElement) {
    const owned = depths.get(el)
    if (!owned) return
    if (el.style.getPropertyValue("--glass-surface-depth") === owned.value) {
      if (owned.previous) el.style.setProperty("--glass-surface-depth", owned.previous)
      else el.style.removeProperty("--glass-surface-depth")
    }
    depths.delete(el)
  }

  function remove(el: HTMLElement) {
    const surface = surfaces.get(el)
    if (!surface) return
    surfaces.delete(el)
    el.style.removeProperty("--glass-optical-filter")
    el.removeAttribute("data-glass-refracting")
    surface.filter.uses -= 1
    if (surface.filter.uses === 0) {
      surface.filter.node.remove()
      filters.delete(surface.key)
    }
  }

  function update(el: HTMLElement) {
    if (!el.isConnected) {
      remove(el)
      clearDepth(el)
      candidates.delete(el)
      resize.unobserve(el)
      viewport?.unobserve(el)
      return
    }
    const rect = el.getBoundingClientRect()
    if (viewport && (rect.bottom < -120 || rect.top > innerHeight + 120 || rect.right < -120 || rect.left > innerWidth + 120)) {
      remove(el)
      clearDepth(el)
      return
    }
    const style = getComputedStyle(el)
    const width = Math.round(el.offsetWidth)
    const height = Math.round(el.offsetHeight)
    const strength = parseFloat(style.getPropertyValue("--glass-refraction")) || 0
    const clarity = parseFloat(style.getPropertyValue("--glass-clarity"))
    const filter = style.backdropFilter || style.getPropertyValue("-webkit-backdrop-filter")
    const parentLiquid = el.parentElement?.closest('[data-glass-refracting], [data-liquid-surface]')
    if (!hydrated(el)) {
      // hydration doesn't mutate the DOM, so nothing else would wake the runtime for it
      if (!retry) retry = window.setTimeout(() => { retry = 0; schedule() }, 120)
      return
    }
    const ready = el.dataset.slot !== "liquid-glass" || el.hasAttribute("data-glass-ready")
    const regular = el.classList.contains("glass-liquid") && !parentLiquid
    const depth = ready && regular && !preferences.some((q) => q.matches) && !doc.documentElement.hasAttribute("data-glass-reduce-transparency") && parseFloat(style.getPropertyValue("--glass-liquid-blur")) > 0
      ? Math.min(1, Math.max(0, (Math.min(width, height) - 96) / 224)) : 0
    if (depth > 0) {
      const value = depth.toFixed(3)
      if (!depths.has(el)) depths.set(el, { previous: el.style.getPropertyValue("--glass-surface-depth"), value })
      depths.get(el)!.value = value
      if (el.style.getPropertyValue("--glass-surface-depth") !== value) el.style.setProperty("--glass-surface-depth", value)
    } else clearDepth(el)
    const allow = ready && canRefract && !preferences.some((q) => q.matches) && !doc.documentElement.hasAttribute("data-glass-reduce-transparency") && strength > 0 && clarity < 0.98 &&
      !el.closest('[data-glass-optics="off"]') && !parentLiquid &&
      width > 0 && height > 0 && width * height <= 180_000 && height <= 600 &&
      /blur\((?!0(?:px)?\))/.test(filter) && !el.hidden
    if (!allow) {
      remove(el)
      return
    }
    const corner = style.borderTopLeftRadius
    const radius = corner.includes("%") ? Math.min(width, height) * parseFloat(corner) / 100 : parseFloat(corner) || 0
    const bezel = parseFloat(style.getPropertyValue("--glass-bezel")) || 12
    const key = `${width}:${height}:${radius}:${bezel}:${strength}`
    if (surfaces.get(el)?.key === key) return
    remove(el)
    let entry = filters.get(key)
    if (!entry) {
      const geometry = `${width}:${height}:${radius}:${bezel}`
      let texture = maps.get(geometry)
      if (!texture) {
        const map = createLensMap({ width, height, radius, bezel })
        const canvas = doc.createElement("canvas")
        canvas.width = map.width
        canvas.height = map.height
        const context = canvas.getContext("2d")
        if (!context) return
        const pixels = context.createImageData(map.width, map.height)
        pixels.data.set(map.data)
        context.putImageData(pixels, 0, 0)
        texture = canvas.toDataURL()
        if (maps.size >= 64) maps.delete(maps.keys().next().value!)
        maps.set(geometry, texture)
      }
      const id = `glass-lens-${++sequence}`
      const node = doc.createElementNS(NS, "filter")
      node.id = id
      for (const [name, value] of Object.entries({ x: "0", y: "0", width: String(width), height: String(height), filterUnits: "userSpaceOnUse", "color-interpolation-filters": "sRGB" })) node.setAttribute(name, value)
      const image = doc.createElementNS(NS, "feImage")
      for (const [name, value] of Object.entries({ href: texture, width: String(width), height: String(height), preserveAspectRatio: "none", result: "lens" })) image.setAttribute(name, value)
      const displacement = doc.createElementNS(NS, "feDisplacementMap")
      for (const [name, value] of Object.entries({ in: "SourceGraphic", in2: "lens", scale: String(strength * 2), xChannelSelector: "R", yChannelSelector: "G" })) displacement.setAttribute(name, value)
      node.append(image, displacement)
      defs.append(node)
      entry = { id, node, uses: 0 }
      filters.set(key, entry)
    }
    entry.uses++
    surfaces.set(el, { key, filter: entry })
    el.style.setProperty("--glass-optical-filter", `url("#${entry.id}")`)
    el.setAttribute("data-glass-refracting", "")
  }

  function collect(root: ParentNode) {
    if (root instanceof HTMLElement && root.matches(SURFACES)) candidates.add(root)
    root.querySelectorAll<HTMLElement>(SURFACES).forEach((el) => {
      if (!candidates.has(el)) {
        candidates.add(el)
        resize.observe(el)
        viewport?.observe(el)
      }
    })
  }

  function refresh() {
    frame = 0
    collect(doc)
    for (const el of candidates) update(el)
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(refresh)
  }
  const resize = new ResizeObserver(schedule)
  const viewport = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(schedule, { rootMargin: "120px" })
  const withoutRuntimeStyles = (style: string) => style.replace(/--glass-(?:press-[xy]|light-angle|optical-filter|surface-depth)\s*:[^;]*(?:;|$)/g, "").trim()
  const mutations = new MutationObserver((records) => {
    const changed = records.some((r) => {
      if (svg.contains(r.target)) return false
      if (r.type === "characterData") return r.target.parentElement?.tagName === "STYLE"
      if (r.type === "attributes" && r.attributeName === "style" && r.target instanceof HTMLElement) {
        return withoutRuntimeStyles(r.oldValue ?? "") !== withoutRuntimeStyles(r.target.getAttribute("style") ?? "")
      }
      return true
    })
    if (changed) schedule()
  })

  function illuminate() {
    pointerFrame = 0
    const event = latestPointer
    latestPointer = null
    if (!event) return
    if (!(event.target instanceof Element)) return
    const el = event.target.closest<HTMLElement>('[class*="glass-illuminate"], [class*="glass-prominent"], [data-liquid-surface]')
    if (el) {
      const rect = el.getBoundingClientRect()
      el.style.setProperty("--glass-press-x", `${Math.round(event.clientX - rect.left)}px`)
      el.style.setProperty("--glass-press-y", `${Math.round(event.clientY - rect.top)}px`)
      if (el.dataset.glassFollowLight !== undefined && !motion.matches && event.pointerType === "mouse") {
        el.style.setProperty("--glass-light-angle", `${Math.round(Math.atan2(event.clientX - rect.left - rect.width / 2, rect.height / 2 - event.clientY + rect.top) * 180 / Math.PI)}deg`)
      }
    }
  }
  function pointer(event: PointerEvent) {
    latestPointer = event
    if (!pointerFrame) pointerFrame = requestAnimationFrame(illuminate)
    if (event.type !== "pointermove" && event.target instanceof Element && event.target.closest('[data-slot="switch"], [data-slot="slider"], [data-slot="segmented-control"]')) schedule()
  }

  return {
    retain() {
      if (++references !== 1) return
      doc.body.append(svg)
      activity()
      mutations.observe(doc.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeOldValue: true, attributeFilter: ["class", "style", "data-state", "data-palette", "data-glass-optics", "data-glass-ready", "data-glass-reduce-transparency"] })
      preferences.forEach((q) => q.addEventListener("change", schedule))
      window.addEventListener("focus", activity)
      window.addEventListener("blur", activity)
      doc.addEventListener("visibilitychange", activity)
      doc.addEventListener("pointerdown", pointer, { passive: true })
      doc.addEventListener("pointermove", pointer, { passive: true })
      doc.addEventListener("pointerup", pointer, { passive: true })
      doc.addEventListener("pointercancel", pointer, { passive: true })
      schedule()
    },
    release() {
      references -= 1
      if (references !== 0) return
      mutations.disconnect()
      resize.disconnect()
      viewport?.disconnect()
      preferences.forEach((q) => q.removeEventListener("change", schedule))
      window.removeEventListener("focus", activity)
      window.removeEventListener("blur", activity)
      doc.removeEventListener("visibilitychange", activity)
      if (activityValue !== null && doc.documentElement.getAttribute("data-glass-window-active") === activityValue) doc.documentElement.removeAttribute("data-glass-window-active")
      doc.removeEventListener("pointerdown", pointer)
      doc.removeEventListener("pointermove", pointer)
      doc.removeEventListener("pointerup", pointer)
      doc.removeEventListener("pointercancel", pointer)
      cancelAnimationFrame(frame)
      clearTimeout(retry)
      retry = 0
      cancelAnimationFrame(pointerFrame)
      latestPointer = null
      for (const el of surfaces.keys()) remove(el)
      for (const el of depths.keys()) clearDepth(el)
      candidates.clear()
      maps.clear()
      svg.remove()
      runtimes.delete(doc)
    },
  }
}

/**
 * Install once near the app root. Enhances floating surfaces, including newly opened portals.
 * Multiple instances share one runtime. CSS materials remain complete without JavaScript.
 */
export function GlassEffects({ enabled = true }: { enabled?: boolean }) {
  React.useEffect(() => {
    if (!enabled || typeof ResizeObserver === "undefined") return
    let runtime = runtimes.get(document)
    if (!runtime) {
      runtime = createRuntime(document)
      runtimes.set(document, runtime)
    }
    runtime.retain()
    return () => runtime.release()
  }, [enabled])
  return null
}
