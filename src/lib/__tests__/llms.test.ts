import { describe, expect, it } from "vitest"

import { docs } from "@/lib/docs"
import { llmsFullTxt, llmsTxt, section } from "@/lib/llms"
import { GUIDES } from "@/lib/og/pages"
import { registryNamespace } from "@/lib/site"

describe("llms.txt", () => {
  const txt = llmsTxt()

  it("links every guide and every documented item", () => {
    for (const g of GUIDES) expect(txt).toContain(`](https://glasscn.app${g.path})`)
    for (const d of docs) expect(txt).toContain(`- [${d.title}](https://glasscn.app/docs/${d.slug}): ${d.description}`)
  })

  it("explains the namespace install", () => {
    expect(txt).toMatch(/^# glasscn\n\n> /)
    expect(txt).toContain(`"registries": { "${registryNamespace}": `)
    expect(txt).toContain(`add ${registryNamespace}/button`)
  })
})

describe("llms-full.txt", () => {
  const full = llmsFullTxt()

  it("has every item with its props, notes and install command", () => {
    for (const d of docs) {
      expect(full).toContain(`### ${d.title}\n`)
      expect(full).toContain(`add ${registryNamespace}/${d.slug}`)
      for (const p of d.props ?? []) expect(full).toContain(`| ${p.name.replace(/\|/g, "\\|")} |`)
      for (const n of d.notes ?? []) expect(full).toContain(`- ${n}`)
    }
  })

  it("includes the design rules and the material guidance", () => {
    expect(full).toContain("## Design rules")
    expect(full).toContain("**Glass needs something to frost.**")
    expect(full).toContain("## Material vs Liquid Glass")
    expect(full).toContain("material-liquid")
  })
})

describe("section", () => {
  it("returns a heading's body up to the next heading or rule", () => {
    expect(section("# T\n\n## A\n\none\n\n## B\n\ntwo", "A")).toBe("one")
    expect(section("## A\n\none\n\n---\n\nrest", "A")).toBe("one")
    expect(section("## A\n\none", "Missing")).toBe("")
  })
})
