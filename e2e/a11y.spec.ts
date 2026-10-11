import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

import { applyTheme, blockSlugs, docSlugs, open, staticDocs } from "./theme"

// QA-02 / A11Y-06: axe on every docs page, /themes and the blocks, light/dark × matte/smoked.
const MATRIX = [
  { scheme: "light", material: "material-matte" },
  { scheme: "dark", material: "material-matte" },
  { scheme: "light", material: "material-smoked" },
  { scheme: "dark", material: "material-smoked" },
] as const

// Every page in the default theme; the full material matrix on the pages that show every surface.
const pages = [...staticDocs, "/themes", ...docSlugs.map((s) => `/docs/${s}`)]
const matrixPages = ["/themes", ...blockSlugs.map((s) => `/docs/${s}`)]

async function scan(page: import("@playwright/test").Page, path: string) {
  await open(page, path)
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()
  // cmdk wraps its options in a sizer div, which axe reads as a listbox child it doesn't allow
  // (pacocoursey/cmdk; shadcn's Command has the same). Screen readers still get the options.
  const relevant = violations
    .map((v) => (v.id === "aria-required-children" ? { ...v, nodes: v.nodes.filter((n) => !n.html.includes("cmdk-list")) } : v))
    .filter((v) => v.nodes.length)
  const report = relevant.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).slice(0, 5).join(", ")}`)
  expect(report, `${path}\n${report.join("\n")}`).toEqual([])
}

for (const path of pages) {
  test(`axe ${path}`, async ({ page }) => scan(page, path))
}

for (const { scheme, material } of MATRIX) {
  test.describe(`${scheme} ${material}`, () => {
    test.beforeEach(async ({ context }) => applyTheme(context, { scheme, presets: [material] }))
    for (const path of matrixPages) test(`axe ${path}`, async ({ page }) => scan(page, path))
  })
}
