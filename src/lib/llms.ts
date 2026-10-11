/**
 * /llms.txt and /llms-full.txt (https://llmstxt.org), built from the same data as the site:
 * the docs list and props (`docs.ts`), the guides (`og/pages.ts`), the theme items in the registry,
 * each demo's source, and the design rules in `docs/`. Nothing here is a hand-copied list.
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { GROUPS, docs, nativeItems, themeItems, type DocEntry } from "@/lib/docs"
import { GUIDES, PAGES } from "@/lib/og/pages"
import { itemUrl, registryNamespace, registryUrl, site, siteUrl } from "@/lib/site"
import { demoSources } from "@/lib/sources.generated"

const page = (path: string) => new URL(path, siteUrl).toString()
/** A file under `docs/` — scoped to that folder so output tracing ships just it. */
const readDoc = (file: string) => readFileSync(join(process.cwd(), "docs", file), "utf8")

/** A markdown file's section under `## heading`, up to the next `##` heading or rule. */
export function section(markdown: string, heading: string) {
  const start = markdown.indexOf(`## ${heading}\n`)
  if (start < 0) return ""
  const body = markdown.slice(start + heading.length + 4)
  const end = body.search(/^(## |---)/m)
  return (end < 0 ? body : body.slice(0, end)).trim()
}

/** Drops a markdown file's first `# Title` line and demotes the rest so it nests under a `##`. */
const nest = (markdown: string) =>
  markdown
    .replace(/^# .*\n+/, "")
    .replace(/^(#+) /gm, "#$1 ")
    .trim()

function header() {
  return [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "Components install as source with the shadcn CLI and keep shadcn's APIs (`@/components/ui/card` → `@/components/glass/card`). Every visual — frost, blur, rim, aurora, radii, density, motion, type — is a CSS variable, so palettes, materials, shapes and per-subtree `ThemeScope` theming need no component changes. Built on Radix and Tailwind v4; every component also has a React Native twin (`native-<name>`) for Expo.",
    "",
    "## Install",
    "",
    "```bash",
    `npx shadcn@latest add ${itemUrl("glass-style")} ${itemUrl("theme-dusk")}   # foundation + a palette`,
    `npx shadcn@latest add ${itemUrl("aurora")} ${itemUrl("card")} ${itemUrl("button")}`,
    "```",
    "",
    `Or register the namespace once in \`components.json\` and install by name:`,
    "",
    "```json",
    `{ "registries": { "${registryNamespace}": "${registryUrl}/r/{name}.json" } }`,
    "```",
    "",
    "```bash",
    `npx shadcn@latest add ${registryNamespace}/button ${registryNamespace}/dock`,
    "```",
    "",
    "Put `<Aurora />` once in the root layout — glass needs something to frost. Components land in `components/glass/`, blocks in `components/glass-blocks/`.",
  ]
}

const link = (title: string, path: string, description: string) => `- [${title}](${page(path)}): ${description}`

function index() {
  return [
    "## Guides",
    "",
    link("Home", PAGES.home.path, PAGES.home.description),
    ...GUIDES.map((g) => link(g.label, g.path, g.description)),
    ...GROUPS.flatMap((group) => {
      const items = docs.filter((d) => d.group === group)
      return items.length ? ["", `## ${group}`, "", ...items.map((d) => link(d.title, `/docs/${d.slug}`, d.description))] : []
    }),
    "",
    "## Themes",
    "",
    `Presets that only set CSS variables — install any number with \`npx shadcn@latest add ${registryNamespace}/<name>\`.`,
    "",
    ...themeItems.map((t) => `- \`${t.name}\`: ${t.description}`),
  ]
}

const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ")

function item(d: DocEntry) {
  const lines = [
    `### ${d.title}`,
    "",
    `${d.group} · ${page(`/docs/${d.slug}`)}`,
    "",
    d.description,
    "",
    "```bash",
    `npx shadcn@latest add ${registryNamespace}/${d.slug}   # or ${itemUrl(d.slug)}`,
    "```",
  ]
  if (nativeItems.some((i) => i.name === `native-${d.slug}`)) lines.push("", `React Native twin: \`npx shadcn@latest add ${registryNamespace}/native-${d.slug}\`.`)
  if (d.dependencies.length) lines.push("", `npm dependencies: ${d.dependencies.join(", ")}.`)
  if (d.props?.length) {
    lines.push("", "| Prop | Type | Default | Description |", "| --- | --- | --- | --- |")
    for (const p of d.props) lines.push(`| ${cell(p.name)} | \`${cell(p.type)}\` | ${p.default ? `\`${cell(p.default)}\`` : ""} | ${cell(p.description)} |`)
  }
  if (d.notes?.length) lines.push("", ...d.notes.map((n) => `- ${n}`))
  const usage = demoSources[d.slug]?.code
  if (usage) lines.push("", "Usage:", "", "```tsx", usage.trim(), "```")
  return lines
}

/** The index: what glasscn is, how to install it, and one line per page. */
export function llmsTxt() {
  return [...header(), "", ...index(), "", "## Optional", "", link("llms-full.txt", "/llms-full.txt", "Everything above plus every item's props, notes and usage, and the design rules.")].join("\n") + "\n"
}

/** The index plus every item in full and the design rules. */
export function llmsFullTxt() {
  const rules = nest(readDoc("rules/design.md"))
  const liquid = section(readDoc("liquid-glass.md"), "TL;DR").split(/\n\nThe five changes/)[0]
  return (
    [
      ...header(),
      "",
      ...index(),
      "",
      "## Design rules",
      "",
      rules,
      "",
      "## Material vs Liquid Glass",
      "",
      liquid,
      "",
      `Choose a material with a theme item (${themeItems
        .filter((t) => t.name.startsWith("material-"))
        .map((t) => `\`${t.name}\``)
        .join(", ")}); \`glass-subtle\` / \`glass\` / \`glass-strong\` set intensity by elevation.`,
      "",
      "## Components and blocks",
      "",
      ...docs.flatMap((d) => [...item(d), ""]),
    ].join("\n").trimEnd() + "\n"
  )
}
