import { chromium } from "@playwright/test"
const b = await chromium.launch()
for (const path of ["/", "/showcase"]) {
  const p = await b.newPage({ viewport: { width: 390, height: 800 } })
  await p.goto("http://localhost:3041" + path, { waitUntil: "networkidle" })
  await p.addStyleTag({ content: "html { font-size: 200% !important }" }); await p.waitForTimeout(300)
  console.log(path, await p.evaluate(() => {
    const all = [...document.querySelectorAll("body *")].filter((e) => e.getBoundingClientRect().right > innerWidth + 1)
    // deepest offenders: no offending child
    const leaves = all.filter((e) => ![...e.children].some((c) => all.includes(c))).slice(0, 6)
    return leaves.map((e) => `${e.tagName.toLowerCase()} "${(e.textContent || "").trim().slice(0, 30)}" r=${Math.round(e.getBoundingClientRect().right)} ws=${getComputedStyle(e).whiteSpace} cls=${String(e.className).slice(0, 70)}`)
  }))
  await p.close()
}
await b.close()
