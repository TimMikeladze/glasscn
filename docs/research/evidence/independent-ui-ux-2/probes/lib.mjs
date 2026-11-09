import { chromium, webkit, firefox } from "/Users/tim/workspace/glasscn/node_modules/@playwright/test/index.mjs"
import { execFileSync } from "node:child_process"
export const BASE = "http://localhost:3027"
export const OUT = "/Users/tim/workspace/glasscn/docs/research/evidence/independent-ui-ux-2/web"
export async function ctx(browser, { width = 1440, height = 900, scheme = "light", palette, motion = "reduce", dsf = 1, mobile = false, touch = false, locale } = {}) {
  const c = await browser.newContext({ viewport: { width, height }, colorScheme: scheme, reducedMotion: motion, deviceScaleFactor: dsf, isMobile: mobile, hasTouch: touch, locale })
  await c.addInitScript(({ palette, scheme }) => {
    try { if (palette) localStorage.setItem("glasscn-palette", palette); localStorage.setItem("theme", scheme) } catch {}
  }, { palette, scheme })
  return c
}
export async function open(page, path, wait = "networkidle") {
  await page.goto(BASE + path, { waitUntil: wait, timeout: 90000 })
  await page.evaluate(() => document.fonts.ready)
  await page.addStyleTag({ content: "nextjs-portal { display: none !important }" })
}
export async function shot(page, name, opts = {}) {
  const file = `${OUT}/${name}.png`
  await page.screenshot({ path: file, ...opts })
  const vw = page.viewportSize().width
  const max = opts.max ?? (vw <= 500 ? 700 : 1000)
  execFileSync("python3", ["/private/tmp/claude-501/-Users-tim-workspace-glasscn/45032303-4089-45d1-b4c9-e8c8342a550b/scratchpad/pw/shrink.py", String(max), file])
  return file
}
export { chromium, webkit, firefox }
