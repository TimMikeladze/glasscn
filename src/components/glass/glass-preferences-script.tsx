/**
 * The viewer's glass preferences — clarity and reduce transparency — outside React:
 * storage, the CSS they become, and an inline script that applies them before first
 * paint. Server-safe (no "use client"), so a root layout can render
 * <GlassPreferencesScript /> in <head>. The controls live in glass-preferences.tsx.
 */

export interface GlassPreferencesValue {
  /** 0 ultra clear → 1 fully tinted, like iOS 27's Liquid Glass slider. 0.5 is the theme as designed. */
  clarity: number
  /** Frost every pane almost opaque (clarity ≥ 0.9), as the OS setting does. */
  reduceTransparency: boolean
}

export const GLASS_PREFERENCES_KEY = "glass-preferences"
/** Fired on window after a change in this tab (other tabs hear the storage event). */
export const GLASS_PREFERENCES_EVENT = "glass-preferences"
const STYLE_ID = "glass-preferences"
const ATTR = "data-glass-reduce-transparency"

export const DEFAULT_GLASS_PREFERENCES: GlassPreferencesValue = { clarity: 0.5, reduceTransparency: false }
/** The clarity reduce transparency floors to: maps the default frosts to ≈ the prefers-reduced-transparency values. */
export const REDUCED_TRANSPARENCY_CLARITY = 0.9

const clamp = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 100) / 100

/** A stored value back into preferences; null when missing or malformed. */
export function parseGlassPreferences(raw: string | null): GlassPreferencesValue | null {
  if (!raw) return null
  try {
    const v = JSON.parse(raw) as Partial<GlassPreferencesValue>
    const clarity = Number(v.clarity)
    if (!Number.isFinite(clarity)) return null
    return { clarity: clamp(clarity), reduceTransparency: v.reduceTransparency === true }
  } catch {
    return null
  }
}

/** The clarity that reaches the panes. */
export const effectiveClarity = (p: GlassPreferencesValue) => (p.reduceTransparency ? Math.max(REDUCED_TRANSPARENCY_CLARITY, clamp(p.clarity)) : clamp(p.clarity))

/**
 * `!important` beats themes, ThemeScopes and site themes (a viewer preference outranks the author's
 * default); `:where()` keeps specificity at zero so the OS accessibility overrides — also !important,
 * on `:root, [data-glass-scope]` — still win.
 */
export const glassPreferencesCss = (p: GlassPreferencesValue) => `:where(:root,[data-glass-scope]){--glass-clarity:${effectiveClarity(p)}!important}`

/** Writes (or, with null, removes) the preference style and the reduce-transparency attribute. */
export function applyGlassPreferences(p: GlassPreferencesValue | null, doc: Document = document) {
  const root = doc.documentElement
  let el = doc.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!p) {
    el?.remove()
    root.removeAttribute(ATTR)
    return
  }
  if (!el) {
    el = doc.createElement("style")
    el.id = STYLE_ID
    doc.head.appendChild(el)
  }
  const css = glassPreferencesCss(p)
  if (el.textContent !== css) el.textContent = css
  root.toggleAttribute(ATTR, p.reduceTransparency)
}

/** The same as applyGlassPreferences(stored), as an inline script for <head> — no flash of the default clarity. */
export const glassPreferencesScript = `try{var p=JSON.parse(localStorage.getItem(${JSON.stringify(GLASS_PREFERENCES_KEY)})||"null"),c=p&&Number(p.clarity);if(p&&isFinite(c)){c=Math.round(Math.min(1,Math.max(0,c))*100)/100;if(p.reduceTransparency===true){c=Math.max(${REDUCED_TRANSPARENCY_CLARITY},c);document.documentElement.setAttribute("${ATTR}","")}var s=document.createElement("style");s.id="${STYLE_ID}";s.textContent=":where(:root,[data-glass-scope]){--glass-clarity:"+c+"!important}";document.head.appendChild(s)}}catch(e){}`

/** Put once in the root layout's <head> (with suppressHydrationWarning on <html>, as next-themes asks). */
function GlassPreferencesScript() {
  return <script data-slot="glass-preferences-script" dangerouslySetInnerHTML={{ __html: glassPreferencesScript }} />
}

export { GlassPreferencesScript }
