import { chromium } from "./lib.mjs"
import { sceneSetup } from "./scene.mjs"
const b = await chromium.launch()
const hexOf = (p, loc) => loc.evaluate(e => { const c = document.createElement("canvas"); c.width = c.height = 1; const g = c.getContext("2d", { willReadFrequently: true }); const h = (col) => { g.clearRect(0,0,1,1); g.fillStyle = col; g.fillRect(0,0,1,1); const d = g.getImageData(0,0,1,1).data; return "#" + [d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,"0")).join("") }; const s = getComputedStyle(e); const svg = e.querySelector("svg"); return { bg: h(s.backgroundColor), fg: h(s.color), svg: svg ? h(getComputedStyle(svg).color) : null } })
for (const scheme of ["light", "dark"]) {
  let { c, p, scene } = await sceneSetup(b, "Notes", { scheme })
  console.log(scheme, "Notes Done", JSON.stringify(await hexOf(p, scene.getByRole("button", { name: "Done" }))))
  await c.close();
  ({ c, p, scene } = await sceneSetup(b, "Photos", { scheme }))
  await scene.getByRole("button", { name: "Delete photo" }).click(); await p.waitForTimeout(400)
  console.log(scheme, "Delete Photo item", JSON.stringify(await hexOf(p, p.getByRole("menuitem", { name: "Delete Photo" }))))
  await c.close();
  ({ c, p, scene } = await sceneSetup(b, "Mail", { scheme }))
  console.log(scheme, "Mail sidebar active", JSON.stringify(await hexOf(p, scene.getByRole("button", { name: /^Inbox/ }))))
  await c.close()
}
await b.close()
