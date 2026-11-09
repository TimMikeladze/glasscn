import { chromium, open, shot } from "./lib.mjs"
import { stressCtx } from "./stress.mjs"
import { probe } from "./contrast.mjs"
const b = await chromium.launch()
const rows = []
async function run(tag, opts, scenes = ["Music", "Maps", "Controls"]) {
  const c = await stressCtx(b, opts)
  const p = await c.newPage()
  await open(p, "/showcase")
  for (const s of scenes) {
    await p.getByRole("tab", { name: s, exact: true }).click(); await p.waitForTimeout(500)
    const scene = p.locator('[data-testid="liquid-glass-scene"]').first()
    await scene.scrollIntoViewIfNeeded()
    if (s === "Music") rows.push({ tag, ...(await probe(p, scene.getByText("A slower morning").last(), "music miniplayer")) }, { tag, ...(await probe(p, scene.getByRole("tab", { name: "New" }).locator("span"), "music tab New")) })
    if (s === "Maps") rows.push({ tag, ...(await probe(p, scene.getByText("Trails · 2.4 mi"), "maps detail")) })
    if (s === "Controls") rows.push({ tag, ...(await probe(p, scene.getByRole("radio", { name: "Erase" }), "controls segment")) }, { tag, ...(await probe(p, scene.getByText("Mountain study"), "controls title")) })
    if (s === "Photos") rows.push({ tag, ...(await probe(p, scene.getByText("Sierra Nevada"), "photos place")) })
    await shot(p, `stress-${tag}-${s.toLowerCase()}`, { clip: await scene.boundingBox(), max: 600 })
  }
  await c.close()
}
for (const clarity of [0, 0.5, 0.65, 0.7, 0.74, 1]) await run(`clarity${clarity}`, { prefs: { clarity } }, ["Music", "Maps", "Controls"])
await run("reduceT", { prefs: { clarity: 0.5, reduceTransparency: true } })
await run("reduceT-dark", { scheme: "dark", prefs: { clarity: 0.5, reduceTransparency: true } })
await run("borders", { prefs: { clarity: 0.5, showBorders: true } }, ["Music", "Controls"])
await run("contrast-more", { contrast: "more" }, ["Music", "Controls"])
await run("contrast-more-dark", { contrast: "more", scheme: "dark" }, ["Music", "Controls"])
for (const r of rows) console.log(r.tag.padEnd(16), r.label.padEnd(18), "median", String(r.median).padEnd(6), "worst", r.worst10, r.fg)
await b.close()
