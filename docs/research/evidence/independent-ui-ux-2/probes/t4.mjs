import { chromium, ctx, open, shot } from "./lib.mjs"
const b = await chromium.launch()
const widths = [320, 390, 768, 900, 1024, 1200, 1280, 1440]
for (const path of ["/", "/themes"]) {
  for (const w of widths) {
    const c = await ctx(b, { width: w, height: 900 })
    const p = await c.newPage()
    await open(p, path)
    await p.waitForTimeout(400)
    const r = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth
      const header = document.querySelector("header")
      const hb = header.getBoundingClientRect()
      const ctrls = [...header.querySelectorAll("a,button")].filter(e => { const s = getComputedStyle(e); return s.display !== "none" && s.visibility !== "hidden" && e.getBoundingClientRect().width > 0 })
      const boxes = ctrls.map(e => { const r = e.getBoundingClientRect(); return { n: (e.getAttribute("aria-label") || e.textContent.trim()).slice(0, 18), l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height) } })
      const out = boxes.filter(b => b.l < 0 || b.r > vw)
      // overlaps between controls
      const ov = []
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) { const a = boxes[i], c = boxes[j]; if (a.l < c.r - 1 && c.l < a.r - 1) ov.push(a.n + "~" + c.n) }
      // widest offenders anywhere on page
      const wide = [...document.querySelectorAll("body *")].filter(e => { const r = e.getBoundingClientRect(); return r.right > vw + 1 && r.width > 0 && getComputedStyle(e).position !== "fixed" }).filter(e => { let p = e.parentElement; while (p) { const s = getComputedStyle(p); if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) return false; p = p.parentElement } return true }).slice(0, 5).map(e => e.tagName + "." + (e.className?.toString?.() || "").slice(0, 50) + " r=" + Math.round(e.getBoundingClientRect().right))
      const menuBtn = header.querySelector('[aria-label="Menu"]')
      return { vw, sw: document.documentElement.scrollWidth, bodySW: document.body.scrollWidth, header: [Math.round(hb.left), Math.round(hb.right)], nCtrl: boxes.length, small: boxes.filter(b => b.h < 24 || b.w < 24).map(b => b.n + ` ${b.w}x${b.h}`), out, ov, wide, menu: menuBtn ? getComputedStyle(menuBtn).display : null }
    })
    console.log(path, w, JSON.stringify(r))
    if ([320, 390, 900, 1200, 1280].includes(w)) await shot(p, `width-${path === "/" ? "home" : "themes"}-${w}`, { max: w <= 500 ? 700 : 1000 })
    await c.close()
  }
}
await b.close()
