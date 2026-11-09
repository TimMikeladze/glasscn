import { chromium, shot } from "./lib.mjs"
import { sceneSetup } from "./scene.mjs"
const b = await chromium.launch()
const { c, p, scene } = await sceneSetup(b, "Notes")
const ta = scene.locator("textarea")
await scene.getByRole("button", { name: "Format note" }).click(); await p.waitForTimeout(600)
for (const s of ["Title", "Heading", "Body", "Monostyled"]) {
  await p.getByRole("dialog").getByRole("button", { name: s }).click(); await p.waitForTimeout(250)
  console.log(s, await ta.evaluate(e => ({ fs: getComputedStyle(e).fontSize, fw: getComputedStyle(e).fontWeight, ff: getComputedStyle(e).fontFamily.slice(0, 30), cls: e.className.split(" ").filter(c => /type-|text-\[|font-/.test(c)).join(" ") })))
  if (s === "Title") await shot(p, "notes-format-title", { clip: await scene.boundingBox() })
}
await b.close()
