import { readFileSync } from "node:fs"
const registry = JSON.parse(readFileSync("/Users/tim/workspace/glasscn/registry.json", "utf8"))
const vars = (name, scheme) => registry.items.find(i => i.name === name)?.cssVars?.[scheme] ?? {}
export function presetCss(presets) {
  const block = (scheme) => presets.flatMap(p => Object.entries(vars(p, scheme))).map(([k, v]) => `--${k}:${v};`).join("")
  return `:root[data-glass-custom]{${block("light")}}:root[data-glass-custom].dark{${block("dark")}}`
}
export async function stressCtx(b, { scheme = "light", palette, presets = [], prefs, contrast, forced, width = 1440, height = 900, motion = "reduce" } = {}) {
  const c = await b.newContext({ viewport: { width, height }, colorScheme: scheme, reducedMotion: motion, contrast: contrast ?? "no-preference", forcedColors: forced ? "active" : "none" })
  const css = presets.length ? presetCss(presets) : ""
  await c.addInitScript(({ palette, scheme, css, prefs }) => {
    try {
      if (palette) localStorage.setItem("glasscn-palette", palette)
      localStorage.setItem("theme", scheme)
      if (css) localStorage.setItem("glasscn-custom-css", css); else localStorage.removeItem("glasscn-custom-css")
      if (prefs) localStorage.setItem("glass-preferences", JSON.stringify(prefs)); else localStorage.removeItem("glass-preferences")
    } catch {}
  }, { palette, scheme, css, prefs })
  return c
}
