import { readFileSync } from "node:fs"
import type { BrowserContext, Page } from "@playwright/test"

const registry = JSON.parse(readFileSync(new URL("../registry.json", import.meta.url), "utf8")) as {
  items: { name: string; type: string; cssVars?: Record<string, Record<string, string>> }[]
}

/** Every `/docs/<slug>` page — the same filter as `src/lib/docs.ts`. */
export const docSlugs = registry.items
  .filter((i) => (i.type === "registry:ui" || i.type === "registry:block") && !i.name.startsWith("native-"))
  .map((i) => i.name)
export const blockSlugs = registry.items.filter((i) => i.type === "registry:block").map((i) => i.name)
export const staticDocs = ["/docs", "/docs/installation", "/docs/theming", "/docs/fonts", "/docs/native"]

export interface Theme {
  palette?: string
  scheme: "light" | "dark"
  /** Registry preset items: material-*, shape-*, density-*. */
  presets?: string[]
}

const vars = (name: string, scheme: string) => registry.items.find((i) => i.name === name)?.cssVars?.[scheme] ?? {}
function presetCss(presets: string[]) {
  const block = (scheme: string) => presets.flatMap((p) => Object.entries(vars(p, scheme))).map(([k, v]) => `--${k}:${v};`).join("")
  return `:root[data-glass-custom]{${block("light")}}:root[data-glass-custom].dark{${block("dark")}}`
}

/** Applies a theme the way the site persists one (localStorage, read before paint). */
export async function applyTheme(ctx: BrowserContext, theme: Theme) {
  const css = theme.presets?.length ? presetCss(theme.presets) : ""
  await ctx.addInitScript(
    ({ palette, scheme, css }) => {
      if (palette) localStorage.setItem("glasscn-palette", palette)
      localStorage.setItem("theme", scheme)
      if (css) localStorage.setItem("glasscn-custom-css", css)
      else localStorage.removeItem("glasscn-custom-css")
    },
    { palette: theme.palette, scheme: theme.scheme, css }
  )
}

/** Opens a page and waits for fonts and the dev overlay to settle. */
export async function open(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" })
  await page.evaluate(() => document.fonts.ready)
  await page.addStyleTag({ content: "nextjs-portal { display: none !important }" })
}
