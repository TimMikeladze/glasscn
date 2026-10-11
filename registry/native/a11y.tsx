import * as React from "react"
import { AccessibilityInfo, Platform, type Insets } from "react-native"

/**
 * The OS accessibility settings every native glasscn component follows, live:
 * Reduce Motion, Reduce Transparency, Increase Contrast (iOS Darker System Colors,
 * Android High Text Contrast, the web's `prefers-contrast: more`) and Bold Text.
 * One OS listener per setting while anything is subscribed; read with
 * `useA11y()` or a single hook. Also: screen-reader announcements and the 44pt
 * hit-slop policy.
 */

export type A11ySetting = "reduceMotion" | "reduceTransparency" | "highContrast" | "boldText"

type ChangeEvent = "reduceMotionChanged" | "reduceTransparencyChanged" | "darkerSystemColorsChanged" | "highTextContrastChanged" | "boldTextChanged"

type Source = {
  /** Native: the promise getter and change event (unsupported platform → omitted). */
  get?: () => Promise<boolean>
  event?: ChangeEvent
  /** Web: the equivalent media query. */
  query?: string
}

const SOURCES: Record<A11ySetting, Source> = {
  reduceMotion: { get: AccessibilityInfo.isReduceMotionEnabled, event: "reduceMotionChanged", query: "(prefers-reduced-motion: reduce)" },
  reduceTransparency: {
    get: Platform.OS === "ios" ? AccessibilityInfo.isReduceTransparencyEnabled : undefined,
    event: "reduceTransparencyChanged",
    query: "(prefers-reduced-transparency: reduce)",
  },
  highContrast: {
    get: Platform.OS === "ios" ? AccessibilityInfo.isDarkerSystemColorsEnabled : Platform.OS === "android" ? AccessibilityInfo.isHighTextContrastEnabled : undefined,
    event: Platform.OS === "ios" ? "darkerSystemColorsChanged" : "highTextContrastChanged",
    query: "(prefers-contrast: more)",
  },
  boldText: { get: Platform.OS === "ios" ? AccessibilityInfo.isBoldTextEnabled : undefined, event: "boldTextChanged" },
}

type Store = { value: boolean; listeners: Set<() => void>; stop: (() => void) | null }
const stores = Object.fromEntries((Object.keys(SOURCES) as A11ySetting[]).map((k) => [k, { value: false, listeners: new Set(), stop: null }])) as Record<A11ySetting, Store>

/** Test and preview hook: force a setting (null hands it back to the OS). */
const forced: Partial<Record<A11ySetting, boolean>> = {}
export function forceA11y(setting: A11ySetting, value: boolean | null) {
  if (value === null) delete forced[setting]
  else forced[setting] = value
  stores[setting].listeners.forEach((l) => l())
}

function set(setting: A11ySetting, on: boolean) {
  const s = stores[setting]
  if (s.value === on) return
  s.value = on
  s.listeners.forEach((l) => l())
}

function start(setting: A11ySetting): () => void {
  const src = SOURCES[setting]
  if (Platform.OS === "web") {
    const mq = src.query && typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia(src.query) : null
    if (!mq) return () => {}
    const onChange = (e: { matches: boolean }) => set(setting, e.matches)
    set(setting, mq.matches)
    mq.addEventListener?.("change", onChange)
    return () => mq.removeEventListener?.("change", onChange)
  }
  if (!src.get || !src.event) return () => {}
  let live = true
  src
    .get()
    .then((on) => live && set(setting, on))
    .catch(() => {})
  const sub = AccessibilityInfo.addEventListener(src.event, ((on: boolean) => set(setting, on)) as never)
  return () => {
    live = false
    sub.remove()
  }
}

function subscribe(setting: A11ySetting, listener: () => void) {
  const s = stores[setting]
  s.listeners.add(listener)
  if (!s.stop) s.stop = start(setting)
  return () => {
    s.listeners.delete(listener)
    if (!s.listeners.size && s.stop) {
      s.stop()
      s.stop = null
    }
  }
}

/** One OS accessibility setting, live. False until the OS answers (one frame), and wherever the platform has no such setting. */
export function useA11ySetting(setting: A11ySetting): boolean {
  const sub = React.useCallback((l: () => void) => subscribe(setting, l), [setting])
  return React.useSyncExternalStore(
    sub,
    () => forced[setting] ?? stores[setting].value,
    () => false
  )
}

export const useReducedMotion = () => useA11ySetting("reduceMotion")
export const useReduceTransparency = () => useA11ySetting("reduceTransparency")
export const useHighContrast = () => useA11ySetting("highContrast")
export const useBoldText = () => useA11ySetting("boldText")

/** Every setting at once. */
export function useA11y() {
  return { reduceMotion: useReducedMotion(), reduceTransparency: useReduceTransparency(), highContrast: useHighContrast(), boldText: useBoldText() }
}

/** The current value outside React (e.g. inside an event handler). */
export const readA11y = (setting: A11ySetting) => forced[setting] ?? stores[setting].value

/**
 * Speak a message with the screen reader (toasts, sends, async results). Queued
 * behind current speech on iOS; Android and web announce politely.
 */
export function announce(message: string) {
  if (!message) return
  if (Platform.OS === "web") {
    if (typeof document === "undefined") return
    let region = document.getElementById("glass-announcer")
    if (!region) {
      region = document.createElement("div")
      region.id = "glass-announcer"
      region.setAttribute("aria-live", "polite")
      region.setAttribute("role", "status")
      Object.assign(region.style, { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" })
      document.body.appendChild(region)
    }
    region.textContent = ""
    setTimeout(() => region && (region.textContent = message), 30)
    return
  }
  if (typeof AccessibilityInfo.announceForAccessibilityWithOptions === "function") AccessibilityInfo.announceForAccessibilityWithOptions(message, { queue: true })
  else AccessibilityInfo.announceForAccessibility(message)
}

/** Apple's minimum: every tappable thing is at least 44pt each way. */
export const HIT_MIN = 44

/** Hit slop that grows a `width` × `height` control to `min` (44pt) each way. */
export function hitSlop(height: number, width: number = height, min: number = HIT_MIN): Insets | undefined {
  const v = Math.max(0, Math.ceil((min - height) / 2))
  const h = Math.max(0, Math.ceil((min - width) / 2))
  return v || h ? { top: v, bottom: v, left: h, right: h } : undefined
}

/** Font scaling caps per role, so large Dynamic Type grows text without breaking layout. */
export const MAX_FONT_SCALE = { body: 2, label: 1.6, heading: 1.6, display: 1.2 } as const
