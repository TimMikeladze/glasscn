import * as React from "react"
import { cn } from "cn"

import { createGlassTheme, themeToCss, type CreateThemeOptions, type GlassTheme } from "@/lib/glass-theme"

/** shadcn's text colours per scheme — written when a scheme is forced, so a light scope reads right inside a dark page. */
const TEXT = {
  light: { foreground: "oklch(0.145 0 0)", "card-foreground": "oklch(0.145 0 0)", "popover-foreground": "oklch(0.145 0 0)", "muted-foreground": "oklch(0.556 0 0)" },
  dark: { foreground: "oklch(0.985 0 0)", "card-foreground": "oklch(0.985 0 0)", "popover-foreground": "oklch(0.985 0 0)", "muted-foreground": "oklch(0.708 0 0)" },
}

/**
 * Re-themes everything inside it. Pass a finished theme or preset names:
 *
 *   <ThemeScope palette="ocean" material="liquid" shape="sharp">…</ThemeScope>
 *   <ThemeScope theme={createGlassTheme({ palette: { hue: 200, harmony: "triadic" } })} scheme="dark">…</ThemeScope>
 *
 * Writes one scoped, sanitised <style> for its own subtree — light rules, dark rules
 * (following the page's `.dark`), or a forced `scheme`. Works in Server Components.
 */
function ThemeScope({
  theme,
  palette,
  material,
  shape,
  motion,
  density,
  scheme,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> &
  Pick<CreateThemeOptions, "palette" | "material" | "shape" | "motion" | "density"> & {
    theme?: GlassTheme
    /** Force a scheme for this subtree; omit to follow the page. */
    scheme?: "light" | "dark"
  }) {
  const id = React.useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const resolved = theme ?? createGlassTheme({ palette, material, shape, motion, density })
  const at = `[data-glass-scope="${id}"]`
  const forced = scheme ? { ...resolved[scheme], ...TEXT[scheme] } : null
  const css = forced
    ? themeToCss({ light: forced, dark: forced }, { selector: at, darkSelector: `.dark ${at}` })
    : themeToCss(resolved, { selector: at, darkSelector: `.dark ${at}, ${at}.dark` })
  return (
    <div data-slot="theme-scope" data-glass-scope={id} className={cn(scheme, className)} {...props}>
      {/* a plain, in-place <style>: it must update on every change (a hoisted, keyed one would not) */}
      <style>{css}</style>
      {children}
    </div>
  )
}

export { ThemeScope }
