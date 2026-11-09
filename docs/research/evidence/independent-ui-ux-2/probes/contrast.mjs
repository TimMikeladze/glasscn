// Effective contrast of a text element over whatever renders behind it (glass, media).
import { createRequire } from "node:module"
const sharp = createRequire("/Users/tim/workspace/glasscn/package.json")("sharp")
export async function probe(p, loc, label) {
  await loc.scrollIntoViewIfNeeded().catch(() => {})
  const bb = await loc.boundingBox()
  if (!bb) return { label, err: "no box" }
  const clip = { x: Math.max(0, bb.x - 2), y: Math.max(0, bb.y - 2), width: bb.width + 4, height: bb.height + 4 }
  const fg = await loc.evaluate(e => { const c = document.createElement("canvas"); c.width = c.height = 1; const g = c.getContext("2d", { willReadFrequently: true }); g.fillStyle = getComputedStyle(e).color; g.fillRect(0, 0, 1, 1); const d = g.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255, getComputedStyle(e).fontSize, getComputedStyle(e).fontWeight] })
  await loc.evaluate(e => { e.dataset.probeColor = e.style.color; e.style.setProperty("color", "transparent", "important"); e.style.setProperty("text-shadow", "none", "important"); e.querySelectorAll("*").forEach(x => { x.style.setProperty("color", "transparent", "important") }) })
  await p.waitForTimeout(80)
  const buf = await p.screenshot({ clip })
  await loc.evaluate(e => { e.style.removeProperty("color"); e.style.removeProperty("text-shadow"); e.querySelectorAll("*").forEach(x => x.style.removeProperty("color")) })
  const { data: raw, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const img = { data: [] }
  for (let i = 0; i < raw.length; i += 3) img.data.push(raw[i], raw[i + 1], raw[i + 2], 255)
  const lum = (r, g, b) => { const f = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
  const ls = []
  const bgs = []
  for (let i = 0; i < img.data.length; i += 4) { ls.push(lum(img.data[i], img.data[i + 1], img.data[i + 2])); bgs.push([img.data[i], img.data[i + 1], img.data[i + 2]]) }
  // composite fg alpha over median bg
  ls.sort((a, b) => a - b)
  const med = ls[ls.length >> 1]
  const a = fg[3]
  const medIdx = bgs.map(c => lum(...c)).indexOf(med)
  const mb = bgs[medIdx] ?? [128, 128, 128]
  const comp = [0, 1, 2].map(i => fg[i] * a + mb[i] * (1 - a))
  const lf = lum(...comp)
  const cr = (x, y) => (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
  const textDark = lf < med
  // worst case: background pixel closest in luminance to text (10th percentile on the near side)
  const worst = textDark ? ls[Math.floor(ls.length * 0.1)] : ls[Math.floor(ls.length * 0.9)]
  return { label, fg: `rgb(${fg.slice(0, 3).join(",")}) a${a.toFixed(2)}`, size: fg[4] + "/" + fg[5], median: +cr(lf, med).toFixed(2), worst10: +cr(lf, worst).toFixed(2) }
}
