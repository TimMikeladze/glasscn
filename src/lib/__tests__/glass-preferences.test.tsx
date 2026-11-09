import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeAll, describe, expect, it } from "vitest"

import { GlassPreferences } from "@/components/glass/glass-preferences"
import {
  GLASS_PREFERENCES_KEY,
  applyGlassPreferences,
  effectiveClarity,
  glassPreferencesCss,
  glassPreferencesScript,
  parseGlassPreferences,
} from "@/components/glass/glass-preferences-script"

const style = () => document.getElementById("glass-preferences")?.textContent ?? null
const reduced = () => document.documentElement.hasAttribute("data-glass-reduce-transparency")

// Node's own (flagless, unusable) localStorage global shadows jsdom's — give the tests a working one
beforeAll(() => {
  const data = new Map<string, string>()
  const storage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, String(v)),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
  }
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true })
})

afterEach(() => {
  localStorage.clear()
  applyGlassPreferences(null)
})

describe("glass preferences", () => {
  it("parses stored values defensively", () => {
    expect(parseGlassPreferences(null)).toBeNull()
    expect(parseGlassPreferences("{oops")).toBeNull()
    expect(parseGlassPreferences(JSON.stringify({ clarity: "x" }))).toBeNull()
    expect(parseGlassPreferences(JSON.stringify({ clarity: 3, reduceTransparency: "yes" }))).toEqual({ clarity: 1, reduceTransparency: false, reduceHighlights: false, showBorders: false })
  })

  it("floors clarity under reduce transparency and keeps OS overrides winning", () => {
    expect(effectiveClarity({ clarity: 0.2, reduceTransparency: true })).toBe(0.9)
    expect(effectiveClarity({ clarity: 0.95, reduceTransparency: true })).toBe(0.95)
    // zero specificity: the prefers-reduced-transparency / prefers-contrast blocks (also !important) still win
    expect(glassPreferencesCss({ clarity: 0.3, reduceTransparency: false })).toContain(".glass-liquid-clear")
    expect(glassPreferencesCss({ clarity: 0.3, reduceTransparency: false })).toContain("--glass-clarity:0.3!important")
  })

  it("the head script applies exactly what applyGlassPreferences does", () => {
    const prefs = { clarity: 0.27, reduceTransparency: true, reduceHighlights: true, showBorders: true }
    localStorage.setItem(GLASS_PREFERENCES_KEY, JSON.stringify(prefs))
    new Function(glassPreferencesScript)()
    expect(style()).toBe(glassPreferencesCss(prefs))
    expect(reduced()).toBe(true)
    expect(document.documentElement.hasAttribute("data-glass-show-borders")).toBe(true)
  })

  it("writes nothing until the viewer changes something, then persists and resets", () => {
    render(<GlassPreferences />)
    expect(style()).toBeNull()
    fireEvent.click(screen.getByRole("switch", { name: "Reduce transparency" }))
    expect(JSON.parse(localStorage.getItem(GLASS_PREFERENCES_KEY)!)).toEqual({ clarity: 0.5, reduceTransparency: true, reduceHighlights: false, showBorders: false })
    expect(style()).toContain("--glass-clarity:0.9!important")
    expect(reduced()).toBe(true)
    fireEvent.click(screen.getByRole("button", { name: "Reset to the theme" }))
    expect(localStorage.getItem(GLASS_PREFERENCES_KEY)).toBeNull()
    expect(style()).toBeNull()
    expect(reduced()).toBe(false)
  })

  it("lets the viewer suppress bright highlights without changing transparency", () => {
    render(<GlassPreferences />)
    fireEvent.click(screen.getByRole("switch", { name: "Reduce bright effects" }))
    expect(style()).toContain("--glass-specular:0%!important")
    expect(style()).toContain("--glass-illumination:0%!important")
    expect(style()).toContain("--glass-clarity:0.5!important")
    expect(reduced()).toBe(false)
  })

  it("persists visible control borders and removes them on reset", () => {
    render(<GlassPreferences />)
    fireEvent.click(screen.getByRole("switch", { name: "Show control borders" }))
    expect(document.documentElement.hasAttribute("data-glass-show-borders")).toBe(true)
    expect(JSON.parse(localStorage.getItem(GLASS_PREFERENCES_KEY)!).showBorders).toBe(true)
    fireEvent.click(screen.getByRole("button", { name: "Reset to the theme" }))
    expect(document.documentElement.hasAttribute("data-glass-show-borders")).toBe(false)
  })
})
