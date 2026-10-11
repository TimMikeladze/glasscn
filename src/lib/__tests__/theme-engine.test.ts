import { readFileSync } from "node:fs"
import { transform } from "lightningcss"
import { describe, expect, it } from "vitest"

import { DARK_SCHEME, themeScopeCss } from "@/components/glass/theme-scope"
import { TOKENS, createGlassTheme, decodeTheme, defaultTheme, sanitizeTokens, sanitizeValue, themeToCss } from "@/lib/glass-theme"
import fixtureFile from "./fixtures/theme-codes.json"

const AT = '[data-glass-scope="s1"]'
const fixtures = fixtureFile as unknown as { fixtures: { name: string; code: string; tokens: { l: Record<string, string>; d: Record<string, string> } }[] }
const groupOf = Object.fromEntries(TOKENS.map((t) => [t.name, t.group]))
/** `--name: value` pairs per rule selector. */
function rules(css: string): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {}
  for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^}]*)\}/g))
    out[selector.trim()] = Object.fromEntries([...body.matchAll(/([\w-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]))
  return out
}
/** Parse with lightningcss, errors fatal. Tailwind's at-rules become plain rules first, so their bodies and selectors are checked too. */
function parse(css: string, filename: string) {
  const plain = css
    .replace(/@theme inline \{/g, ":root {")
    .replace(/@utility ([\w-]+) \{/g, ".utility-$1 {")
    .replace(/@custom-variant ([\w-]+) \((.*)\);/g, (_, name: string, selector: string) => `.variant-${name}${selector.replaceAll("&", "")} {}`)
  return transform({ filename, code: Buffer.from(plain), errorRecovery: false })
}

describe("ThemeScope CSS", () => {
  it("writes only the groups a preset prop names (ENG-51)", () => {
    const css = rules(themeScopeCss(AT, { shape: "sharp" }))
    const written = Object.values(css).flatMap((r) => Object.keys(r).map((k) => k.slice(2)))
    expect(written.length).toBeGreaterThan(0)
    for (const name of written) expect(groupOf[name], name).toBe("Shape")
    expect(css[AT]["--glass-radius-surface"]).toBe(createGlassTheme({ shape: "sharp" }).light["glass-radius-surface"])
  })

  it("a palette scope writes colours only, and a material scope never touches the palette", () => {
    const palette = Object.keys(rules(themeScopeCss(AT, { palette: "ocean" }))[AT]).map((k) => k.slice(2))
    expect(new Set(palette.map((k) => groupOf[k]))).toEqual(new Set(["Colour"]))
    const material = Object.values(rules(themeScopeCss(AT, { material: "smoked" }))).flatMap((r) => Object.keys(r).map((k) => k.slice(2)))
    expect(material).toContain("glass-tint")
    expect(material.some((k) => groupOf[k] === "Colour")).toBe(false)
  })

  it("writes nothing for a bare scope", () => {
    expect(themeScopeCss(AT, {})).toBe("")
  })

  it("emits the dark rule as a diff of the light one (ENG-52)", () => {
    const theme = createGlassTheme({ palette: "ocean", material: "vivid" })
    const css = rules(themeScopeCss(AT, { theme }))
    const dark = css[`${AT}${DARK_SCHEME}`]
    expect(Object.keys(css[AT])).toHaveLength(Object.keys(sanitizeTokens(theme.light)).length)
    for (const [k, v] of Object.entries(dark)) expect(css[AT][k], k).not.toBe(v)
    // shape, motion, type… are scheme-independent: written once
    expect(dark["--glass-radius-surface"]).toBeUndefined()
    expect(dark["--primary"]).toBe(theme.dark.primary)
    // well under the old 2 × full-theme output
    const old = themeToCss(theme, { selector: AT, darkSelector: `.dark ${AT}, ${AT}.dark` })
    expect(themeScopeCss(AT, { theme }).length).toBeLessThan(old.length * 0.8)
  })

  it("a forced scheme writes one rule: its values, the full shadcn neutral set and color-scheme (ENG-50)", () => {
    for (const scheme of ["light", "dark"] as const) {
      const css = rules(themeScopeCss(AT, { palette: "sage", scheme }))
      expect(Object.keys(css)).toEqual([AT])
      const r = css[AT]
      for (const n of ["background", "foreground", "card", "card-foreground", "popover", "popover-foreground", "muted", "muted-foreground", "secondary", "secondary-foreground", "accent", "accent-foreground", "border", "input", "destructive"])
        expect(r[`--${n}`], `${scheme} --${n}`).toBeTruthy()
      expect(r["color-scheme"]).toBe(scheme)
      expect(r["--primary"]).toBe(createGlassTheme({ palette: "sage" })[scheme].primary)
    }
  })

  it("a forced light scope also turns the page's scheme-dependent tokens light, but keeps the page's accent", () => {
    const r = rules(themeScopeCss(AT, { shape: "sharp", scheme: "light" }))[AT]
    const base = createGlassTheme()
    expect(r["--glass-tint"]).toBe(base.light["glass-tint"])
    expect(r["--aurora-base"]).toBe(base.light["aurora-base"])
    expect(r["--primary"]).toBeUndefined()
    expect(r["--glass-radius-surface"]).toBe(createGlassTheme({ shape: "sharp" }).light["glass-radius-surface"])
  })

  it("sanitises what it writes", () => {
    const evil = createGlassTheme()
    evil.light["glass-blur"] = "1px; } body { display: none"
    evil.light["glass-tint"] = "var(--x)"
    const css = themeScopeCss(AT, { theme: evil })
    expect(css).not.toContain("display: none")
    expect(css).not.toContain("var(--x)")
  })

  it("parses as CSS, every mode", () => {
    for (const options of [{ shape: "sharp" }, { palette: "ocean", material: "vivid", scheme: "light" as const }, { theme: createGlassTheme({ type: "editorial" }), scheme: "dark" as const }, { theme: createGlassTheme() }])
      expect(parse(themeScopeCss(AT, options), "scope.css").warnings).toEqual([])
  })
})

describe("the dark-scheme selector", () => {
  it("is what the site's @custom-variant dark uses", () => {
    expect(readFileSync("src/app/globals.css", "utf8")).toContain(`@custom-variant dark (&${DARK_SCHEME});`)
  })
})

describe("sanitizeValue", () => {
  it.each([
    ["a comment opener", "1px /* x"],
    ["a comment closer", "1px */"],
    ["a declaration break", "1px; color: red"],
    ["a closing brace", "1px }"],
    ["a var() reference", "var(--primary)"],
    ["a spaced var()", "VAR (--x)"],
    ["a remote url", "url(https://example.com/x.png)"],
    ["an image()", "image(red)"],
    ["unbalanced quotes", '"Inter'],
    ["a single quote", "'Inter'"],
    ["a backslash escape", "\\75 rl(x)"],
    ["markup", "</style><script>"],
    ["empty", ""],
    ["an object", { toString: (): string => "red" }],
  ])("rejects %s", (_, value) => {
    expect(sanitizeValue(value)).toBeNull()
  })
  it.each([["oklch(0.5 0.1 200 / 40%)"], ["28px"], ['"Inter", ui-sans-serif, sans-serif'], ["linear(0, 0.5 20%, 1)"], ["url(data:image/svg+xml;base64,PHN2Zz4=)"], [12]])("keeps %s", (value) => {
    expect(sanitizeValue(value)).toBe(String(value))
  })
  it("drops tokens whose value doesn't fit the control (ranges, units, colours)", () => {
    const out = sanitizeTokens({ "glass-blur": "-4px", "glass-opacity": "50px", primary: "12px", "glass-density": "0", "glass-radius-surface": "1rem", "not-a-token": "1px" })
    expect(out).toEqual({ "glass-radius-surface": "1rem" })
  })
})

describe("decodeTheme back-compat", () => {
  it.each(fixtures.fixtures.map((f) => [f.name, f] as const))("%s still decodes to the values it was shared with", (_, f) => {
    const theme = decodeTheme(f.code)
    expect(theme).not.toBeNull()
    for (const [scheme, key] of [["light", "l"], ["dark", "d"]] as const)
      for (const [name, value] of Object.entries(f.tokens[key])) expect(theme![scheme][name], `${scheme} ${name}`).toBe(value)
    // and is a whole theme: every current token present
    for (const t of TOKENS) expect(theme!.light, t.name).toHaveProperty(t.name)
  })
  it("returns null for garbage and drops unknown or unsafe values", () => {
    expect(decodeTheme("%%%")).toBeNull()
    const code = Buffer.from(JSON.stringify({ l: { "glass-blur": "1px;}", bogus: "1px", "glass-radius-surface": "2rem" } })).toString("base64url")
    const t = decodeTheme(code)!
    expect(t.light["glass-blur"]).toBe(defaultTheme().light["glass-blur"])
    expect(t.light["glass-radius-surface"]).toBe("2rem")
    expect(t.light).not.toHaveProperty("bogus")
  })
})

describe("generated CSS parses (lightningcss)", () => {
  it("src/app/glass.generated.css", () => {
    expect(parse(readFileSync("src/app/glass.generated.css", "utf8"), "glass.generated.css").warnings).toEqual([])
  })
  it("every registry item's css and cssVars", () => {
    const registry = JSON.parse(readFileSync("registry.json", "utf8")) as { items: { name: string; css?: Record<string, unknown>; cssVars?: Record<string, Record<string, string>> }[] }
    const block = (selector: string, body: unknown): string =>
      body && typeof body === "object" && Object.keys(body).length === 0
        ? `${selector};`
        : `${selector} {\n${Object.entries(body as Record<string, unknown>)
            .map(([k, v]) => (typeof v === "object" ? block(k, v) : `${k}: ${v};`))
            .join("\n")}\n}`
    for (const item of registry.items) {
      const vars = Object.entries(item.cssVars ?? {}).map(([scope, v]) => `${scope === "theme" ? "@theme inline" : `.${scope}`} {\n${Object.entries(v).map(([k, x]) => `--${k}: ${x};`).join("\n")}\n}`)
      const css = [...vars, ...Object.entries(item.css ?? {}).map(([k, v]) => block(k, v))].join("\n")
      if (css) expect(() => parse(css, `${item.name}.css`), item.name).not.toThrow()
    }
  })
})
