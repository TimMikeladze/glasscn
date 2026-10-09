// Captures crisp stills of the running site for the promo video (docs/promo-video.md).
// BASE_URL=http://localhost:3000 node capture.mjs
import { chromium } from "playwright"
import { mkdir, readFile, writeFile } from "node:fs/promises"

const BASE = process.env.BASE_URL ?? "http://localhost:3000"
const OUT = new URL("./shots/", import.meta.url).pathname
const registry = JSON.parse(await readFile(new URL("../registry.json", import.meta.url), "utf8"))

const vars = (name, scheme) => registry.items.find((i) => i.name === name)?.cssVars?.[scheme] ?? {}
/** Material/shape/density presets as the site's custom-theme CSS. */
function presetCss(presets) {
  const block = (scheme) =>
    presets.flatMap((p) => Object.entries(vars(p, scheme))).map(([k, v]) => `--${k}:${v};`).join("")
  return `:root[data-glass-custom]{${block("light")}}:root[data-glass-custom].dark{${block("dark")}}`
}

const SKIP = new Set(["glass", "theme-scope", "toaster", "native-tokens", "native-glass", "native-aurora", "native-press"])
const components = registry.items.filter((i) => i.type === "registry:ui" && !SKIP.has(i.name)).map((i) => i.name)
const PALETTES = ["dusk", "ocean", "rose", "sage", "amber", "lavender", "mint", "cherry", "lagoon", "midnight"]

const THEMES = [
  { id: "dusk-frosted", palette: "dusk", scheme: "dark", presets: [] },
  { id: "ocean-liquid", palette: "ocean", scheme: "light", presets: ["material-liquid"] },
  { id: "rose-crystal", palette: "rose", scheme: "dark", presets: ["material-crystal", "shape-soft"] },
  { id: "sage-matte", palette: "sage", scheme: "light", presets: ["material-matte", "shape-square"] },
  { id: "amber-neon", palette: "amber", scheme: "dark", presets: ["material-neon", "shape-sharp"] },
  { id: "lagoon-vapor", palette: "lagoon", scheme: "light", presets: ["material-vapor", "density-compact"] },
]

const browser = await chromium.launch()

async function context(viewport, scale, theme) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale, colorScheme: theme.scheme, reducedMotion: "reduce" })
  const css = theme.presets.length ? presetCss(theme.presets) : ""
  await ctx.addInitScript(({ palette, scheme, css }) => {
    localStorage.setItem("glasscn-palette", palette)
    localStorage.setItem("theme", scheme)
    if (css) localStorage.setItem("glasscn-custom-css", css)
    else localStorage.removeItem("glasscn-custom-css")
  }, { palette: theme.palette, scheme: theme.scheme, css })
  return ctx
}

async function open(ctx, path) {
  const page = await ctx.newPage()
  await page.goto(BASE + path, { waitUntil: "networkidle" })
  await page.evaluate(() => document.fonts.ready)
  // The dev server's registry URL is localhost; show the production one.
  await page.evaluate(() => {
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    while (walk.nextNode()) walk.currentNode.nodeValue = walk.currentNode.nodeValue.replace(/http:\/\/localhost:\d+/g, "https://glasscn.app")
  })
  await page.addStyleTag({ content: "nextjs-portal { display: none !important }" })
  await page.waitForTimeout(600)
  return page
}

const manifest = { components: [], themes: THEMES.map(({ id, palette, scheme, presets }) => ({ id, palette, scheme, presets })) }
await mkdir(OUT + "c", { recursive: true })

// 1. Every component's docs preview, palettes and schemes rotating.
for (const [n, name] of components.entries()) {
  const theme = { palette: PALETTES[n % PALETTES.length], scheme: n % 3 === 1 ? "light" : "dark", presets: [] }
  const ctx = await context({ width: 1100, height: 900 }, 2, theme)
  const page = await open(ctx, `/docs/${name}`)
  const el = page.locator('[role="tabpanel"] > div').first()
  try {
    await el.screenshot({ path: `${OUT}c/${name}.png` })
    manifest.components.push({ name, ...theme })
  } catch (e) {
    console.warn("skip", name, e.message.split("\n")[0])
  }
  await ctx.close()
  process.stdout.write(".")
}
console.log(`\n${manifest.components.length} components`)

// 2. Per theme: landing (desktop + mobile), blocks, mobile docs + chat.
for (const theme of THEMES) {
  const desk = await context({ width: 1440, height: 900 }, 2, theme)
  for (const block of ["dashboard-01", "analytics-01"]) {
    const page = await open(desk, `/docs/${block}`)
    await page.locator('[role="tabpanel"] > div').first().screenshot({ path: `${OUT}${block}-${theme.id}.png` })
    await page.close()
  }
  if (theme.id === "dusk-frosted" || theme.id === "ocean-liquid") {
    const page = await open(desk, "/")
    await page.screenshot({ path: `${OUT}home-${theme.id}.png`, fullPage: true })
    await page.close()
  }
  await desk.close()

  const phone = await context({ width: 390, height: 844 }, 3, theme)
  for (const [key, path] of [["home", "/"], ["button", "/docs/activity-rings"], ["chat", "/docs/chat-01"]]) {
    const page = await open(phone, path)
    await page.screenshot({ path: `${OUT}m-${key}-${theme.id}.png`, fullPage: true })
    await page.close()
  }
  await phone.close()
  console.log("theme", theme.id)
}

await writeFile(OUT + "manifest.json", JSON.stringify(manifest, null, 2))
await browser.close()
