import { chromium, shot } from "./lib.mjs"
import { sceneSetup, status } from "./scene.mjs"
const b = await chromium.launch()
const log = (...a) => console.log(...a)
const fi = (p) => p.evaluate(() => { const a = document.activeElement; return a === document.body ? "BODY" : (a.getAttribute("aria-label") || a.textContent.trim().slice(0,20) || a.tagName) })
// MAPS
{
  const { c, p, scene } = await sceneSetup(b, "Maps")
  await scene.getByRole("searchbox", { name: "Search places" }).fill("forest"); await p.waitForTimeout(200)
  log("matches", await scene.getByRole("button", { name: /Forest Park/ }).count())
  await scene.getByRole("button", { name: /Forest Park/ }).click(); await p.waitForTimeout(700)
  const dlg = p.getByRole("dialog")
  log("sheet", await dlg.count(), await dlg.locator("h2").first().textContent())
  const geo = async () => p.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog]')].pop(); const r = d.getBoundingClientRect(); const f = document.querySelector('[data-testid="liquid-glass-scene"]').getBoundingClientRect(); const s = getComputedStyle(d); return { top: Math.round(r.top - f.top), h: Math.round(r.height), fh: Math.round(f.height), left: Math.round(r.left - f.left), w: Math.round(r.width), radius: s.borderRadius, bg: s.backgroundColor, bf: s.backdropFilter.slice(0, 60), detent: d.dataset.detent } })
  log("medium geo", JSON.stringify(await geo()))
  await shot(p, "maps-sheet-medium", { clip: await scene.boundingBox() })
  // can map still be interacted with (nonmodal)? click layers button
  const grab = p.locator('[data-slot="sheet-grabber"], [aria-label*="grabber" i], button[aria-label*="Expand" i], button[aria-label*="detent" i]')
  log("grabber candidates", await grab.evaluateAll(g => g.map(x => x.outerHTML.slice(0, 160))))
  if (await grab.count()) { await grab.first().click(); await p.waitForTimeout(800); log("large geo", JSON.stringify(await geo())); await shot(p, "maps-sheet-large", { clip: await scene.boundingBox() }) }
  if (await grab.count()) { await grab.first().click(); await p.waitForTimeout(800); log("after grabber 2", JSON.stringify(await geo())) }
  await p.keyboard.press("Escape"); await p.waitForTimeout(500)
  log("after Escape dialogs", await p.getByRole("dialog").count(), "focus", await fi(p))
  // layers button
  await scene.getByRole("button", { name: "Map layers" }).click(); await p.waitForTimeout(700)
  log("layers opens:", await p.getByRole("dialog").locator("h2").first().textContent().catch(() => "none"), "|", await p.getByRole("dialog").locator("p").first().textContent().catch(() => ""))
  await shot(p, "maps-layers-button", { clip: await scene.boundingBox() })
  await p.keyboard.press("Escape"); await p.waitForTimeout(400)
  await scene.getByRole("searchbox", { name: "Search places" }).fill("zzz"); await p.waitForTimeout(200)
  log("maps empty", await status(p))
  log("errors", p._errs)
  await c.close()
}
// SAFARI
{
  const { c, p, scene } = await sceneSetup(b, "Safari", { motion: "no-preference" })
  const region = scene.getByRole("region", { name: "Article" })
  await region.hover()
  const bar = () => p.evaluate(() => { const i = document.querySelector('[aria-label="Website address"], [aria-label="Expand address field"]'); const g = i.closest('[data-slot]') ; const r = i.parentElement.getBoundingClientRect(); return { el: i.getAttribute("aria-label"), w: Math.round(r.width) } })
  log("bar start", JSON.stringify(await bar()))
  for (let i = 0; i < 5; i++) { await p.mouse.wheel(0, 150); await p.waitForTimeout(100) }
  await p.waitForTimeout(600)
  log("bar after scroll", JSON.stringify(await bar()))
  await shot(p, "safari-compact", { clip: await scene.boundingBox() })
  await scene.getByRole("button", { name: "Expand address field" }).click(); await p.waitForTimeout(500)
  log("after press", JSON.stringify(await bar()), "focus", await fi(p), "selected", await p.evaluate(() => { const a = document.activeElement; return a.selectionStart + "-" + a.selectionEnd }))
  await p.keyboard.type("example.org"); await p.keyboard.press("Enter"); await p.waitForTimeout(300)
  log("address now", await scene.getByRole("textbox", { name: "Website address" }).inputValue().catch(() => "?"))
  await scene.getByRole("button", { name: "Reader view" }).click(); await p.waitForTimeout(400)
  log("reader", await scene.getByRole("button", { name: "Reader view" }).getAttribute("aria-pressed"))
  await shot(p, "safari-reader", { clip: await scene.boundingBox() })
  await scene.getByRole("button", { name: "Back to top" }).click(); await p.waitForTimeout(800)
  log("back to top scrollTop", await region.evaluate(e => e.scrollTop))
  log("errors", p._errs)
  await c.close()
}
await b.close()
