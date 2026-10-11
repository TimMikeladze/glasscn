import * as React from "react"
import { cn } from "cn"

import { TOKENS, createGlassTheme, fontStylesheetUrl, sanitizeTokens, type CreateThemeOptions, type GlassTheme, type TokenGroup, type Tokens } from "@/lib/glass-theme"

type Presets = Pick<CreateThemeOptions, "palette" | "material" | "shape" | "motion" | "density" | "type" | "fonts">

/**
 * "Inside a dark scheme": the nearest `.dark` / `.light` ancestor (or the element itself) is `.dark`.
 * Exact to three levels (page → scope → scope), so a forced light scope in a dark page is light and a
 * dark scope in a light page is dark — even when next-themes puts `light` on <html>. Same selector as
 * glasscn's `@custom-variant dark`, which your app needs for `dark:` utilities to follow it (docs/theming.md).
 */
const DARK_SCHEME = ":is(.dark, .dark *):not(:where(.dark .light, .dark .light *):not(:where(.dark .light .dark, .dark .light .dark *)))"

/** shadcn's neutral colours per scheme — written when a scheme is forced, so every surface and text colour follows it. */
const NEUTRALS: Record<"light" | "dark", Tokens> = {
  light: {
    background: "oklch(1 0 0)",
    foreground: "oklch(0.145 0 0)",
    card: "oklch(1 0 0)",
    "card-foreground": "oklch(0.145 0 0)",
    popover: "oklch(1 0 0)",
    "popover-foreground": "oklch(0.145 0 0)",
    secondary: "oklch(0.97 0 0)",
    "secondary-foreground": "oklch(0.205 0 0)",
    muted: "oklch(0.97 0 0)",
    "muted-foreground": "oklch(0.47 0.01 285)",
    accent: "oklch(0.97 0 0)",
    "accent-foreground": "oklch(0.205 0 0)",
    destructive: "oklch(0.577 0.245 27.325)",
    border: "oklch(0.922 0 0)",
    input: "oklch(0.922 0 0)",
  },
  dark: {
    background: "oklch(0.145 0 0)",
    foreground: "oklch(0.985 0 0)",
    card: "oklch(0.205 0 0)",
    "card-foreground": "oklch(0.985 0 0)",
    popover: "oklch(0.205 0 0)",
    "popover-foreground": "oklch(0.985 0 0)",
    secondary: "oklch(0.269 0 0)",
    "secondary-foreground": "oklch(0.985 0 0)",
    muted: "oklch(0.269 0 0)",
    "muted-foreground": "oklch(0.84 0.01 285)",
    accent: "oklch(0.269 0 0)",
    "accent-foreground": "oklch(0.985 0 0)",
    destructive: "oklch(0.704 0.191 22.216)",
    border: "oklch(1 0 0 / 10%)",
    input: "oklch(1 0 0 / 15%)",
  },
}

/** The token groups each preset prop owns: a partial scope writes these and nothing else. */
const OWNS: Record<keyof Presets, (name: string, group: TokenGroup) => boolean> = {
  palette: (_, g) => g === "Colour",
  material: (_, g) => g === "Material" || g === "Liquid" || g === "Rim" || g === "Depth",
  shape: (_, g) => g === "Shape",
  motion: (n, g) => g === "Motion" || n === "aurora-speed",
  density: (_, g) => g === "Density",
  type: (_, g) => g === "Type",
  fonts: (_, g) => g === "Fonts",
}
/** The user's brand colours: a forced light scope without a palette keeps the page's. */
const isAccent = (name: string) => name === "primary" || name === "primary-foreground" || name === "ring" || name.startsWith("chart-")

let base: GlassTheme | undefined
const baseTheme = () => (base ??= createGlassTheme())

const pick = (tokens: Tokens, names: Set<string>) => Object.fromEntries(Object.entries(tokens).filter(([k]) => names.has(k)))
const rule = (selector: string, decls: [string, string][]) => (decls.length ? `${selector} {\n${decls.map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}` : "")
const vars = (tokens: Tokens): [string, string][] => Object.entries(sanitizeTokens(tokens)).map(([k, v]) => [`--${k}`, v])

/**
 * The scoped CSS a ThemeScope writes for `selector`.
 *
 * - `theme`: every token. Preset props: only the groups they name (a `shape` scope keeps the page's palette).
 * - Following the page: one rule for light, then a dark rule with only the tokens whose dark value differs.
 * - A forced `scheme`: one rule — its values, shadcn's neutral set and `color-scheme`. Tokens it doesn't name
 *   follow the scheme too: a dark scope matches your `.dark` rules by its class; a light one takes the default
 *   light values (except your accent and charts).
 */
function themeScopeCss(selector: string, { theme, scheme, ...presets }: Presets & { theme?: GlassTheme; scheme?: "light" | "dark" }): string {
  const named = (Object.keys(OWNS) as (keyof Presets)[]).filter((k) => presets[k] !== undefined)
  let resolved: GlassTheme
  let names: Set<string>
  if (theme) {
    resolved = theme
    names = new Set([...Object.keys(theme.light), ...Object.keys(theme.dark)])
  } else if (named.length) {
    resolved = createGlassTheme(presets)
    const b = baseTheme()
    names = new Set(TOKENS.filter((t) => named.some((k) => OWNS[k](t.name, t.group))).map((t) => t.name))
    // anything else a preset sets (smoked's labels, a type preset's fonts)
    for (const s of ["light", "dark"] as const) for (const [k, v] of Object.entries(resolved[s])) if (b[s][k] !== v) names.add(k)
  } else {
    resolved = { light: {}, dark: {} }
    names = new Set()
  }
  const light = pick(resolved.light, names)
  const dark = pick(resolved.dark, names)

  if (scheme) {
    const b = baseTheme()
    const fill = scheme === "light" && !theme ? Object.fromEntries(Object.entries(b.light).filter(([k, v]) => !names.has(k) && !isAccent(k) && b.dark[k] !== v)) : {}
    const neutrals = Object.entries(NEUTRALS[scheme]).map(([k, v]): [string, string] => [`--${k}`, v])
    return rule(selector, [...vars({ ...fill, ...(scheme === "light" ? light : dark) }), ...neutrals, ["color-scheme", scheme], ["color", "var(--foreground)"]])
  }
  const darkOnly = Object.fromEntries(Object.entries(dark).filter(([k, v]) => light[k] !== v))
  return [rule(selector, vars(light)), rule(`${selector}${DARK_SCHEME}`, vars(darkOnly))].filter(Boolean).join("\n")
}

/**
 * Re-themes everything inside it. Pass a finished theme or preset names:
 *
 *   <ThemeScope palette="ocean" material="vivid" shape="sharp">…</ThemeScope>
 *   <ThemeScope shape="sharp">…</ThemeScope>            // only the corners; your palette stays
 *   <ThemeScope theme={createGlassTheme({ palette: { hue: 200, harmony: "triadic" } })} scheme="dark">…</ThemeScope>
 *   <ThemeScope type="editorial" loadFonts>…</ThemeScope>
 *
 * Writes one small, scoped, sanitised <style> for its own subtree — only the groups you name, light
 * rules plus the dark values that differ (following the page's `.dark`), or a forced `scheme`.
 * Works in Server Components.
 */
function ThemeScope({
  theme,
  palette,
  material,
  shape,
  motion,
  density,
  type,
  fonts,
  scheme,
  loadFonts = false,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> &
  Presets & {
    /** A finished theme: every token is written. Takes precedence over the preset props. */
    theme?: GlassTheme
    /** Force a scheme for this subtree; omit to follow the page. */
    scheme?: "light" | "dark"
    /** Load the theme's Google fonts (one stylesheet, deduplicated by React). Off: you load them. */
    loadFonts?: boolean
  }) {
  const id = React.useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const presets = { palette, material, shape, motion, density, type, fonts }
  const css = themeScopeCss(`[data-glass-scope="${id}"]`, { theme, scheme, ...presets })
  const fontUrl = loadFonts ? fontStylesheetUrl(theme ?? createGlassTheme(presets)) : null
  return (
    <div data-slot="theme-scope" data-glass-scope={id} className={cn("type-glass", scheme, className)} {...props}>
      {fontUrl ? <link rel="stylesheet" href={fontUrl} precedence="glass-fonts" /> : null}
      {/* a plain, in-place <style>: it must update on every change (a hoisted, keyed one would not) */}
      {css ? <style>{css}</style> : null}
      {children}
    </div>
  )
}

export { DARK_SCHEME, ThemeScope, themeScopeCss }
