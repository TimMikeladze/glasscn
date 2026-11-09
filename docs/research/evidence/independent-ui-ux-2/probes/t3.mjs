import { chromium, ctx, open } from "./lib.mjs"
const b = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  const c = await ctx(b, { scheme })
  const p = await c.newPage()
  await open(p, "/")
  const r = await p.evaluate(() => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 1; const g = cv.getContext("2d", { willReadFrequently: true })
    const hex = (col) => { g.clearRect(0,0,1,1); g.fillStyle = "#000"; g.fillStyle = col; g.fillRect(0,0,1,1); const d = g.getImageData(0,0,1,1).data; return "#" + [d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,"0")).join("") + (d[3] < 255 ? `@${(d[3]/255).toFixed(2)}` : "") }
    const cs = getComputedStyle(document.documentElement)
    const out = {}
    for (const v of ["--primary","--primary-foreground","--background","--foreground","--muted-foreground","--card","--border","--destructive","--ring","--chart-2","--chart-3","--glass-label","--glass-label-secondary","--aurora-base","--glass-tint","--separator","--fill","--secondary","--accent"]) { const val = cs.getPropertyValue(v).trim(); if (val) out[v] = hex(val) + "  (" + val.slice(0,40) + ")" }
    const btn = [...document.querySelectorAll("a,button")].find(e => e.textContent.trim() === "Get started")
    const ex = [...document.querySelectorAll("a,button")].find(e => e.textContent.trim().startsWith("Explore the glass"))
    const st = (e) => { const s = getComputedStyle(e); return { bg: hex(s.backgroundColor), fg: hex(s.color), font: s.fontSize + "/" + s.fontWeight, h: e.getBoundingClientRect().height, radius: s.borderRadius } }
    out.getStarted = st(btn); out.explore = st(ex)
    const h1 = document.querySelector("h1"); const hs = getComputedStyle(h1); out.h1 = { size: hs.fontSize, weight: hs.fontWeight, ls: hs.letterSpacing, font: hs.fontFamily.slice(0,60), color: hex(hs.color) }
    out.bodyColor = hex(getComputedStyle(document.body).color); out.bodyBg = hex(getComputedStyle(document.body).backgroundColor)
    return out
  })
  console.log(scheme, JSON.stringify(r, null, 1))
  await c.close()
}
await b.close()
