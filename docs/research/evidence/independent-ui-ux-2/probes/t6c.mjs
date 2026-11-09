import { chromium, shot } from "./lib.mjs"
import { sceneSetup } from "./scene.mjs"
const b = await chromium.launch()
const { c, p, scene } = await sceneSetup(b, "Music")
const fi = () => p.evaluate(() => { const a = document.activeElement; return a === document.body ? "BODY" : (a.getAttribute("aria-label") || a.textContent.trim().slice(0,12) || a.tagName) + "|" + a.tagName })
const sel = () => scene.locator("h2").first().textContent()
await scene.getByRole("tab", { name: "Home" }).focus()
console.log("start", await fi(), await sel())
for (let i = 0; i < 4; i++) { await p.keyboard.press("ArrowRight"); await p.waitForTimeout(500); console.log("→", await fi(), "selected:", await sel()) }
console.log("search field?", await scene.getByRole("searchbox").count())
// mouse path: click Search tab
await scene.getByRole("tab", { name: "Home" }).first().click(); await p.waitForTimeout(400)
await scene.getByRole("tab", { name: "Search" }).click(); await p.waitForTimeout(400)
console.log("click Search: focus", await fi(), "selected", await sel())
await scene.getByRole("searchbox").click(); await p.keyboard.type("morn"); await p.waitForTimeout(200)
const clear = scene.getByRole("button", { name: "Clear search" })
await clear.focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(300)
console.log("after clear via keyboard →", await fi())
await b.close()
