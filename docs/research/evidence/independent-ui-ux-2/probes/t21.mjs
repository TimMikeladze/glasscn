import { chromium, shot } from "./lib.mjs"
import { sceneSetup } from "./scene.mjs"
const b = await chromium.launch()
const log = (...a) => console.log(...a)
const fi = (p) => p.evaluate(() => { const a = document.activeElement; return a === document.body ? "BODY" : (a.getAttribute("aria-label") || a.textContent.trim().slice(0,20) || a.tagName) })
// live preference change while nonmodal Maps sheet open
{
  const { c, p, scene } = await sceneSetup(b, "Maps")
  await scene.getByRole("button", { name: /Forest Park/ }).click(); await p.waitForTimeout(600)
  const bg = () => p.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog]')].pop(); const s = getComputedStyle(d); return s.backgroundColor + " | " + s.backdropFilter.slice(0, 40) })
  log("sheet before", await bg())
  await p.getByRole("switch", { name: "Reduce transparency" }).click(); await p.waitForTimeout(500)
  log("sheet after RT", await bg(), "sheet still open", await p.getByRole("dialog").count())
  await shot(p, "maps-sheet-reduce-transparency", { clip: await scene.boundingBox() })
  await p.getByRole("switch", { name: "Reduce transparency" }).click(); await p.waitForTimeout(300)
  await c.close()
}
// compact widths
for (const s of ["Mail", "Landmarks", "Search", "Music"]) {
  const { c, p, scene } = await sceneSetup(b, s, { width: 390, height: 844, mobile: true, touch: true })
  await shot(p, `compact-390-${s.toLowerCase()}`, { clip: await scene.boundingBox() })
  if (s === "Mail") {
    await scene.getByRole("button", { name: /Jordan Lee/ }).click(); await p.waitForTimeout(400)
    log("mail pushed: back button", await scene.getByRole("button", { name: /Back to Inbox/ }).count(), "focus", await fi(p))
    await shot(p, "compact-390-mail-pushed", { clip: await scene.boundingBox() })
    await scene.getByRole("button", { name: /Back to Inbox/ }).click(); await p.waitForTimeout(400)
    log("after back focus", await fi(p))
  }
  const sw = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth])
  log(s, "390 sw", sw)
  await c.close()
}
await b.close()
