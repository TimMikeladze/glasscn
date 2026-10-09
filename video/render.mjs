// Renders stage.html frame by frame into out/glasscn.mp4 (docs/promo-video.md). Run capture.mjs first.
import { chromium } from "playwright"
import { spawn } from "node:child_process"
import { createRequire } from "node:module"
import { mkdir, readFile } from "node:fs/promises"

const FPS = Number(process.env.FPS ?? 30)
const ONLY = process.env.AT // "12.5" renders one still to out/still.png for a quick look
const dir = new URL("./", import.meta.url).pathname
const sharp = createRequire(import.meta.url)("../node_modules/sharp")

// Tall full-page shots: crop to what the stage scrolls through and recompress.
await mkdir(dir + "p", { recursive: true })
const manifest = JSON.parse(await readFile(dir + "shots/manifest.json", "utf8"))
const jobs = [
  ...["dusk-frosted", "ocean-liquid"].map((id) => [`home-${id}`, 2880, 7400, 1440]),
  ...manifest.themes.flatMap((t) => ["home", "chat", "button"].map((p) => [`m-${p}-${t.id}`, 1170, 12000, 744])),
]
await Promise.all(jobs.map(async ([name, w, h, outW]) => {
  const img = sharp(`${dir}shots/${name}.png`, { limitInputPixels: false })
  const meta = await img.metadata()
  await img.extract({ left: 0, top: 0, width: Math.min(w, meta.width), height: Math.min(h, meta.height) }).resize({ width: outW }).jpeg({ quality: 90 }).toFile(`${dir}p/${name}.jpg`)
}))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
await page.addInitScript((m) => { window.MANIFEST = m }, manifest)
await page.goto("file://" + dir + "stage.html")
await page.evaluate(() => window.ready)
const duration = await page.evaluate(() => window.DURATION)
await mkdir(dir + "out", { recursive: true })

if (ONLY) {
  await page.evaluate((t) => window.seek(t), Number(ONLY))
  await page.screenshot({ path: dir + "out/still.png" })
} else {
  const ff = spawn("ffmpeg", ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "18",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", dir + "out/glasscn.mp4"], { stdio: ["pipe", "inherit", "inherit"] })
  const total = Math.round(duration * FPS)
  for (let f = 0; f < total; f++) {
    await page.evaluate((t) => window.seek(t), f / FPS)
    const buf = await page.screenshot({ type: "jpeg", quality: 95 })
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r))
    if (f % 60 === 0) process.stdout.write(`\r${f}/${total}`)
  }
  ff.stdin.end()
  await new Promise((r) => ff.on("close", r))
  console.log("\nout/glasscn.mp4")
}
await browser.close()
