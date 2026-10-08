#!/usr/bin/env node
/**
 * Writes registry.json, src/app/glass.generated.css and src/lib/sources.generated.ts
 * from registry/items.mjs, registry/stylesheet.mjs and src/lib/glass-theme.ts (the
 * token schema and presets). All three outputs are generated — edit the sources.
 */
import { writeFileSync } from "node:fs"
import { blocks, components, foundations, nativeItems } from "../registry/items.mjs"
import { proseStylesheet, stylesheet, themeTokens } from "../registry/stylesheet.mjs"
import { DENSITIES, FONTS, MATERIALS, MOTIONS, PALETTES, SHAPES, TOKENS, TYPE_PRESETS, createGlassTheme, defaultTheme, fontItemName, themeToCss } from "../src/lib/glass-theme.ts"

const base = defaultTheme()
const groupOf = Object.fromEntries(TOKENS.map((t) => [t.name, t.group]))
// unset optional tokens are omitted, never written empty (an empty var would block its fallback)
const present = (tokens) => Object.fromEntries(Object.entries(tokens).filter(([, v]) => v !== ""))
const pickGroups = (tokens, groups, extra = []) => present(Object.fromEntries(Object.entries(tokens).filter(([k]) => groups.includes(groupOf[k]) || extra.includes(k))))
const notAccent = (tokens) => present(Object.fromEntries(Object.entries(tokens).filter(([k]) => !["primary", "primary-foreground", "ring"].includes(k) && !k.startsWith("chart-"))))

// The foundation: every primitive except the accent and charts (those are the user's
// shadcn colours until they add a palette), including Dusk's aurora so it works alone.
const style = foundations.find((f) => f.name === "glass-style")
style.cssVars = { theme: themeTokens, light: notAccent(base.light), dark: notAccent(base.dark) }
style.css = stylesheet
// items that carry their own CSS
const prose = components.find((c) => c.name === "prose")
if (prose) prose.css = proseStylesheet

// Preset items. Each carries the WHOLE of its groups, so adding one resets what a previous one set.
const presetItem = (name, title, description, theme, groups, extra = []) => ({
  name,
  type: "registry:theme",
  title,
  description,
  categories: ["glass", "themes"],
  cssVars: { light: pickGroups(theme.light, groups, extra), dark: pickGroups(theme.dark, groups, extra) },
})
const themes = [
  ...Object.entries(PALETTES).map(([k, p]) =>
    presetItem(`theme-${k}`, `${p.title} palette`, `${p.description} Sets the accent, ring, five chart colours, the aurora and the ground for light and dark.`, createGlassTheme({ palette: k }), ["Colour"])
  ),
  ...Object.entries(MATERIALS).map(([k, m]) =>
    presetItem(`material-${k}`, `${m.title} material`, `${m.description} Sets frost, blur, saturation, sheen, grain, rim and depth.`, createGlassTheme({ material: k }), ["Material", "Rim", "Depth"])
  ),
  ...Object.entries(SHAPES).map(([k, m]) => presetItem(`shape-${k}`, `${m.title} shape`, `${m.description} Sets every corner radius.`, createGlassTheme({ shape: k }), ["Shape"])),
  ...Object.entries(MOTIONS).map(([k, m]) =>
    presetItem(`motion-${k}`, `${m.title} motion`, `${m.description} Sets duration, easing, press and aurora speed.`, createGlassTheme({ motion: k }), ["Motion"], ["aurora-speed"])
  ),
  // type presets: the Type group, plus their Google fonts installed as app fonts (registry:font items)
  ...Object.entries(TYPE_PRESETS).map(([k, t]) => {
    const item = presetItem(`type-${k}`, `${t.title} type`, `${t.description} Sets the type scale, leading, weights, case and numerals.`, createGlassTheme({ type: k }), ["Type"])
    const fonts = Object.entries(t.fonts ?? {}).filter(([role, key]) => FONTS[key]?.google && role !== "display")
    if (fonts.length) item.registryDependencies = [...new Set(fonts.map(([role, key]) => `{REGISTRY_URL}/r/${fontItemName(role, key)}.json`))]
    // system stacks need no loading, so a system preset sets them as theme fonts directly
    const system = Object.entries(t.fonts ?? {}).filter(([, key]) => FONTS[key] && !FONTS[key].google)
    for (const [role, key] of system) for (const s of ["light", "dark"]) item.cssVars[s][`glass-font-${role}`] = FONTS[key].stack
    return item
  }),
  ...Object.entries(DENSITIES).map(([k]) =>
    presetItem(`density-${k}`, `${k[0].toUpperCase()}${k.slice(1)} density`, `Scales control heights, paddings and card spacing (×${DENSITIES[k]}).`, createGlassTheme({ density: k }), ["Density"])
  ),
]

// Font items: shadcn's registry:font — the CLI wires next/font (Next) or fontsource (others).
// sans → --font-sans, heading → --font-heading, mono → --font-mono.
const fontItems = Object.entries(FONTS).flatMap(([key, f]) => {
  if (!f.google) return []
  const roles = f.category === "mono" ? ["mono"] : f.category === "serif" || f.category === "display" ? ["heading", "sans"] : ["sans", "heading"]
  return roles.map((role) => ({
    name: fontItemName(role, key),
    type: "registry:font",
    title: `${f.label}${role === "sans" ? "" : role === "heading" ? " (headings)" : " (mono)"}`,
    description: `${f.label} as your app's ${role === "sans" ? "body" : role === "heading" ? "heading" : "monospace"} font (${f.category}).`,
    categories: ["glass", "fonts"],
    font: {
      // fontsource registers variable fonts as "<Family> Variable"; next/font ignores this and uses `import`
      family: `"${f.google.family}${f.google.weights === "variable" ? " Variable" : ""}", ${f.stack.split(", ").slice(1).join(", ")}`,
      provider: "google",
      import: f.google.import,
      variable: role === "sans" ? "--font-sans" : role === "heading" ? "--font-heading" : "--font-mono",
      // where the CLI applies it. Without one it puts --font-mono on <html> (shadcn's all-mono look) — ours is a code font.
      ...(role === "sans" ? {} : { selector: role === "heading" ? "h1, h2, h3, h4, h5, h6" : "code, kbd, samp, pre" }),
      ...(f.google.weights === "variable" ? {} : { weight: f.google.weights }),
      subsets: ["latin"],
      dependency: f.google.dependency,
    },
  }))
})

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "glasscn",
  homepage: "{REGISTRY_URL}",
  items: [...foundations, ...themes, ...fontItems, ...components, ...blocks, ...nativeItems],
}
writeFileSync("registry.json", JSON.stringify(registry, null, 2) + "\n")

// ---- the docs site's CSS: what ships, the full default theme, and palette presets keyed by data-palette ----
const block = (selector, body, depth = 0) => {
  const pad = "  ".repeat(depth)
  const inner = Object.entries(body)
    .map(([k, v]) => (typeof v === "object" ? block(k, v, depth + 1) : `${pad}  ${k}: ${v};`))
    .join("\n")
  return `${pad}${selector} {\n${inner}\n${pad}}`
}
const decl = (vars) => Object.entries(vars).map(([k, v]) => `  --${k}: ${v};`).join("\n")
const css = [
  "/* Generated by scripts/generate.mjs — do not edit. */",
  "",
  `@theme inline {\n${decl(themeTokens)}\n}`,
  "",
  themeToCss(createGlassTheme()),
  "",
  ...Object.keys(PALETTES).map((k) => themeToCss(createGlassTheme({ palette: k }), { selector: `:root[data-palette="${k}"]`, darkSelector: `:root.dark[data-palette="${k}"]`, only: base })),
  "",
  `:root {\n${decl(Object.fromEntries(Object.entries(PALETTES).map(([k, p]) => [`swatch-${k}`, p.theme.light.primary])))}\n}`,
  `.dark {\n${decl(Object.fromEntries(Object.entries(PALETTES).map(([k, p]) => [`swatch-${k}`, p.theme.dark.primary])))}\n}`,
  "",
  ...Object.entries({ ...stylesheet, ...proseStylesheet }).map(([k, v]) => block(k, v)),
  "",
].join("\n")
writeFileSync("src/app/glass.generated.css", css)
console.log(`registry.json: ${registry.items.length} items (${themes.length} themes, ${fontItems.length} fonts) · glass.generated.css written`)

// ---- docs: every shipped file and every demo, highlighted once here (shiki dual themes) ----
const { readFileSync, existsSync } = await import("node:fs")
const { createHighlighter } = await import("shiki")
const highlighter = await createHighlighter({ themes: ["github-light", "github-dark"], langs: ["tsx", "ts", "css", "json", "bash"] })
const highlight = (code, lang = "tsx") => highlighter.codeToHtml(code, { lang, themes: { light: "github-light", dark: "github-dark" }, defaultColor: false })

const sources = {}
for (const item of registry.items) {
  if (!item.files?.length) continue
  sources[item.name] = item.files.map((f) => {
    const code = readFileSync(f.path, "utf8")
    return { path: f.target.replace(/^@(\w+)\//, (_, a) => `${a}/`), code, html: highlight(code, f.path.endsWith(".ts") ? "ts" : "tsx") }
  })
}
const demos = {}
for (const item of [...components, ...blocks]) {
  const path = `src/components/demos/${item.name}.tsx`
  if (!existsSync(path)) continue
  const code = readFileSync(path, "utf8")
  demos[item.name] = { code, html: highlight(code) }
}
const cssVarsCode = themeToCss({ light: style.cssVars.light, dark: style.cssVars.dark })
const snippets = { tokens: { code: cssVarsCode, html: highlight(cssVarsCode, "css") } }
writeFileSync(
  "src/lib/sources.generated.ts",
  `// Generated by scripts/generate.mjs — do not edit.\nexport interface Source { code: string; html: string }\nexport const sources: Record<string, (Source & { path: string })[]> = ${JSON.stringify(sources)}\nexport const demoSources: Record<string, Source> = ${JSON.stringify(demos)}\nexport const snippets: Record<string, Source> = ${JSON.stringify(snippets)}\n`
)
console.log(`sources.generated.ts: ${Object.keys(sources).length} items, ${Object.keys(demos).length} demos`)
