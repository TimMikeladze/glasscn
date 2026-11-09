import { chromium, ctx, open, shot } from "./lib.mjs"
export async function sceneSetup(b, name, opts = {}) {
  const c = await ctx(b, opts)
  const p = await c.newPage()
  p._errs = []
  p.on("pageerror", e => p._errs.push("PAGEERROR " + e.message.slice(0, 200)))
  p.on("console", m => { if (m.type() === "error") p._errs.push(m.text().slice(0, 200)) })
  await open(p, "/showcase")
  await p.getByRole("tab", { name, exact: true }).click()
  await p.waitForTimeout(600)
  const scene = p.locator('[data-testid="liquid-glass-scene"]').first()
  await scene.scrollIntoViewIfNeeded()
  return { c, p, scene }
}
export const status = (p) => p.evaluate(() => [...document.querySelectorAll('[data-testid="liquid-glass-scene"] [role=status]')].map(s => s.textContent).join(" | "))
export const focusInfo = (p) => p.evaluate(() => { const a = document.activeElement; return a ? (a.getAttribute("aria-label") || a.textContent?.trim().slice(0, 30) || a.tagName) : null })
