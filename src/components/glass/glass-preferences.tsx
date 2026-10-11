"use client"

import * as React from "react"
import { cn } from "cn"

import { Label } from "@/components/glass/label"
import { Slider } from "@/components/glass/slider"
import { Switch } from "@/components/glass/switch"
import {
  DEFAULT_GLASS_PREFERENCES,
  GLASS_PREFERENCES_EVENT,
  GLASS_PREFERENCES_KEY,
  applyGlassPreferences,
  effectiveClarity,
  parseGlassPreferences,
  type GlassPreferencesValue,
} from "@/components/glass/glass-preferences-script"

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange)
  window.addEventListener(GLASS_PREFERENCES_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(GLASS_PREFERENCES_EVENT, onChange)
  }
}

const read = () => {
  try {
    return localStorage.getItem(GLASS_PREFERENCES_KEY)
  } catch {
    return null
  }
}

/**
 * The viewer's glass preferences, persisted in localStorage and shared by every instance
 * (and tab). `customised` is false until the viewer changes something — until then the
 * theme's own clarity applies. `reset()` returns to it.
 */
function useGlassPreferences() {
  const raw = React.useSyncExternalStore(subscribe, read, () => null)
  const stored = React.useMemo(() => parseGlassPreferences(raw), [raw])

  // the head script applies before paint; this covers apps without it, and other tabs
  React.useEffect(() => applyGlassPreferences(stored), [stored])

  const setPreferences = React.useCallback((next: Partial<GlassPreferencesValue> | null) => {
    const value = next ? { ...DEFAULT_GLASS_PREFERENCES, ...parseGlassPreferences(read()), ...next } : null
    try {
      if (value) localStorage.setItem(GLASS_PREFERENCES_KEY, JSON.stringify(value))
      else localStorage.removeItem(GLASS_PREFERENCES_KEY)
    } catch {}
    applyGlassPreferences(value)
    window.dispatchEvent(new Event(GLASS_PREFERENCES_EVENT))
  }, [])
  const reset = React.useCallback(() => setPreferences(null), [setPreferences])

  return { preferences: stored ?? DEFAULT_GLASS_PREFERENCES, customised: stored !== null, setPreferences, reset }
}

/**
 * Clarity (Clear ↔ Tinted) and Reduce transparency for whoever is looking — iOS 27's Liquid
 * Glass setting for your app. Writes `--glass-clarity` for the whole page, persisted. Put it
 * in a popover, a settings page or a sheet; add <GlassPreferencesScript /> to <head> so a
 * reload paints with it.
 */
function GlassPreferences({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()
  const { preferences, customised, setPreferences, reset } = useGlassPreferences()
  const clarity = effectiveClarity(preferences)
  return (
    <div data-slot="glass-preferences" data-customised={customised || undefined} className={cn("grid gap-5", className)} {...props}>
      <div data-slot="glass-preferences-clarity" className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <Label asChild>
            <span>Clarity</span>
          </Label>
          <span className="numeric-glass text-xs text-muted-foreground">{Math.round(clarity * 100)}%</span>
        </div>
        <Slider
          value={[clarity]}
          min={0}
          max={1}
          step={0.01}
          disabled={preferences.reduceTransparency}
          aria-label="Clarity"
          onValueChange={([v]) => setPreferences({ clarity: v })}
        />
        <div className="flex justify-between text-xs text-muted-foreground" aria-hidden>
          <span>Clear</span>
          <span>Tinted</span>
        </div>
      </div>
      <div data-slot="glass-preferences-reduce-transparency" className="flex items-center justify-between gap-3">
        <div className="grid gap-1">
          <Label htmlFor={`${id}-reduce`}>Reduce transparency</Label>
          <p id={`${id}-reduce-hint`} className="text-xs text-muted-foreground">
            Frost every pane almost solid.
          </p>
        </div>
        <Switch
          id={`${id}-reduce`}
          aria-describedby={`${id}-reduce-hint`}
          checked={preferences.reduceTransparency}
          onCheckedChange={(on) => setPreferences({ reduceTransparency: on })}
        />
      </div>
      {customised ? (
        <button
          type="button"
          data-slot="glass-preferences-reset"
          onClick={reset}
          className="hit-area glass-focus relative justify-self-start rounded-badge text-xs text-muted-foreground underline-offset-4 transition-colors duration-(--glass-duration) ease-glass hover:text-foreground hover:underline"
        >
          Reset to the theme
        </button>
      ) : null}
    </div>
  )
}

export { GlassPreferences, useGlassPreferences }
