import { existsSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { blocks, components, foundations, nativeItems } from "./items.mjs"
import { palettes } from "./tokens.mjs"

const registry = JSON.parse(readFileSync("registry.json", "utf8"))
const names = new Set(registry.items.map((i) => i.name))

describe("registry.json", () => {
  it("is in sync with registry/items.mjs and tokens.mjs (run scripts/generate.mjs)", () => {
    const expected = foundations.length + Object.keys(palettes).length + components.length + blocks.length + nativeItems.length
    expect(registry.items).toHaveLength(expected)
  })
  it("has unique names", () => {
    expect(names.size).toBe(registry.items.length)
  })
  it("ships files that exist", () => {
    for (const item of registry.items) for (const f of item.files ?? []) expect(existsSync(f.path), `${item.name}: ${f.path}`).toBe(true)
  })
  it("only depends on its own items", () => {
    for (const item of registry.items)
      for (const dep of item.registryDependencies ?? []) {
        const m = dep.match(/^\{REGISTRY_URL\}\/r\/(.+)\.json$/)
        expect(m, `${item.name} → ${dep}`).not.toBeNull()
        expect(names.has(m[1]), `${item.name} → ${m[1]}`).toBe(true)
      }
  })
  it("declares every component's local imports as registry dependencies", () => {
    // which item ships each importable module
    const provider = new Map()
    for (const item of registry.items)
      for (const f of item.files ?? []) provider.set(f.path.replace(/^src\//, "@/").replace(/\.tsx?$/, ""), item.name)
    for (const item of [...components, ...blocks]) {
      const source = item.files.map((f) => readFileSync(f.path, "utf8")).join("\n")
      const deps = new Set((item.registryDependencies ?? []).map((d) => d.match(/\/r\/(.+)\.json$/)[1]))
      for (const [, path] of source.matchAll(/from "(@\/[^"]+)"/g)) {
        const owner = provider.get(path)
        expect(owner, `${item.name} imports ${path}, which no item ships`).toBeTruthy()
        if (owner !== item.name) expect(deps.has(owner), `${item.name} imports ${path} without depending on ${owner}`).toBe(true)
      }
    }
  })
  it("gives every shipped file a unique base name — the shadcn CLI rewrites imports by file name", () => {
    const seen = new Map()
    for (const item of registry.items)
      for (const f of item.files ?? []) {
        if (f.path.startsWith("registry/native/")) continue // installed into a different (Expo) project
        const base = f.path.split("/").pop().replace(/\.tsx?$/, "")
        expect(seen.get(base), `${base} shipped by ${seen.get(base)} and ${item.name}`).toBeUndefined()
        seen.set(base, item.name)
      }
  })
  it("lists npm packages each component imports", () => {
    for (const item of [...components, ...blocks]) {
      const source = item.files.map((f) => readFileSync(f.path, "utf8")).join("\n")
      const pkgs = [...source.matchAll(/from "([^@.][^"/]*|@[^"/]+\/[^"/]+)"/g)].map((m) => m[1]).filter((p) => p !== "react")
      for (const p of pkgs) expect(item.dependencies ?? [], `${item.name} imports ${p}`).toContain(p)
    }
  })
  it("gives the foundation every glass token in light and dark", () => {
    const style = registry.items.find((i) => i.name === "glass-style")
    for (const k of ["glass", "glass-strong", "glass-border", "glass-blur", "aurora-base", "aurora-1"]) {
      expect(style.cssVars.light[k], k).toBeTruthy()
      expect(style.cssVars.dark[k], k).toBeTruthy()
    }
    expect(Object.keys(style.css)).toContain("@utility glass")
  })
})
