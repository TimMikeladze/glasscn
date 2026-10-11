#!/usr/bin/env node
/**
 * NAT-53: compare the latest Maestro "Visual baselines" run against .maestro/baselines/.
 *   node scripts/visual.mjs            compare (exit 1 on a diff over the budget)
 *   node scripts/visual.mjs --update   accept the latest run as the baselines
 * The status bar (clock, battery) is cropped off; the flow freezes the aurora (?still=1).
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import pixelmatch from "pixelmatch"
import { PNG } from "pngjs"

const RUNS = join(homedir(), ".maestro", "tests")
const FLOW_PREFIX = "Visual baselines"
const BASE = new URL("../.maestro/baselines/", import.meta.url).pathname
const DIFFS = new URL("../.maestro/diffs/", import.meta.url).pathname
const STATUS_BAR = 180 // px at 3×
const BUDGET = 0.005 // share of pixels allowed to differ

// newest run of each "Visual baselines …" flow (palettes, a11y variants), merged by file name
const latest = new Map()
for (const r of readdirSync(RUNS)) {
  const dir = join(RUNS, r)
  if (!statSync(dir).isDirectory()) continue
  for (const flow of readdirSync(dir).filter((f) => f.startsWith(FLOW_PREFIX))) {
    const shotsDir = join(dir, flow, "takeScreenshot", "screenshots")
    if (!existsSync(shotsDir)) continue
    const t = statSync(shotsDir).mtimeMs
    if (!latest.has(flow) || latest.get(flow).t < t) latest.set(flow, { dir: shotsDir, t })
  }
}
if (!latest.size) {
  console.error(`No "${FLOW_PREFIX} …" runs in ${RUNS}. Run: npm run e2e`)
  process.exit(1)
}
const files = new Map([...latest.values()].flatMap(({ dir }) => readdirSync(dir).filter((f) => f.endsWith(".png")).map((f) => [f, join(dir, f)])))
const shots = [...files.keys()]

if (process.argv.includes("--update")) {
  mkdirSync(BASE, { recursive: true })
  for (const f of shots) copyFileSync(files.get(f), join(BASE, f))
  console.log(`✔ ${shots.length} baselines updated`)
  process.exit(0)
}

const crop = (png) => {
  const out = new PNG({ width: png.width, height: png.height - STATUS_BAR })
  PNG.bitblt(png, out, 0, STATUS_BAR, png.width, png.height - STATUS_BAR, 0, 0)
  return out
}
let failed = 0
mkdirSync(DIFFS, { recursive: true })
for (const f of shots) {
  if (!existsSync(join(BASE, f))) {
    console.log(`? ${f}: no baseline (run with --update)`)
    failed++
    continue
  }
  const a = crop(PNG.sync.read(readFileSync(join(BASE, f))))
  const b = crop(PNG.sync.read(readFileSync(files.get(f))))
  if (a.width !== b.width || a.height !== b.height) {
    console.log(`✘ ${f}: size ${a.width}×${a.height} → ${b.width}×${b.height}`)
    failed++
    continue
  }
  const diff = new PNG({ width: a.width, height: a.height })
  const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.15 })
  const share = n / (a.width * a.height)
  if (share > BUDGET) {
    writeFileSync(join(DIFFS, f), PNG.sync.write(diff))
    console.log(`✘ ${f}: ${(share * 100).toFixed(2)}% differs (diff in .maestro/diffs/)`)
    failed++
  } else console.log(`✔ ${f}: ${(share * 100).toFixed(3)}%`)
}
process.exit(failed ? 1 : 0)
