import { describe, expect, it } from "vitest"
import {
  FONTS,
  TYPE_PRESETS,
  fontDependencies,
  fontItemName,
  fontStylesheetUrl,
  typeScale,
  MATERIALS,
  PALETTES,
  TOKENS,
  TOKEN_NAMES,
  createGlassTheme,
  decodeTheme,
  defaultTheme,
  encodeTheme,
  legibility,
  oklchToLinearRgb,
  paletteFromHue,
  parseOklch,
  randomTheme,
  sanitizeTokens,
  sanitizeValue,
  themeToCss,
  themeToRegistryItem,
  themeVars,
} from "../glass-theme"

describe("schema", () => {
  it("has unique token names, each with a value for both schemes (optional ones start unset)", () => {
    expect(new Set(TOKEN_NAMES).size).toBe(TOKENS.length)
    for (const t of TOKENS) {
      if (t.optional) {
        expect([t.light, t.dark], t.name).toEqual(["", ""])
        continue
      }
      expect(sanitizeValue(t.light), `${t.name} light`).toBe(t.light)
      expect(sanitizeValue(t.dark), `${t.name} dark`).toBe(t.dark)
    }
  })
  it("every select default is one of its options", () => {
    for (const t of TOKENS) if (t.control.type === "select") expect(t.control.options.map((o) => o.value)).toContain(t.light)
  })
})

describe("palettes", () => {
  it("every palette sets the full colour group with parseable OKLCH", () => {
    const colour = TOKENS.filter((t) => t.group === "Colour").map((t) => t.name)
    for (const [name, p] of Object.entries(PALETTES))
      for (const scheme of ["light", "dark"] as const)
        for (const k of colour) expect(parseOklch(p.theme[scheme][k] ?? ""), `${name} ${scheme} ${k}`).not.toBeNull()
  })
  it("generates harmonies around the hue", () => {
    const tri = paletteFromHue({ hue: 0, harmony: "triadic" })
    const hue = (v: string) => parseOklch(v)![2]
    expect(hue(tri.light["aurora-1"])).toBe(0)
    expect(hue(tri.light["aurora-2"])).toBe(120)
    expect(hue(tri.light["aurora-3"])).toBe(240)
    expect(hue(paletteFromHue({ hue: 350, harmony: "complementary" }).light["aurora-2"])).toBe(170)
  })
})

describe("createGlassTheme", () => {
  it("is the defaults when given nothing", () => {
    expect(createGlassTheme()).toEqual({ ...defaultTheme(), light: { ...defaultTheme().light, ...PALETTES.dusk.theme.light }, dark: { ...defaultTheme().dark, ...PALETTES.dusk.theme.dark } })
  })
  it("layers palette, material, shape, motion, density, then overrides — later wins", () => {
    const t = createGlassTheme({ palette: "ocean", material: "liquid", shape: "square", motion: "still", density: "compact", tokens: { "glass-blur": "3px" }, dark: { "glass-glow": "20%" } })
    expect(t.light.primary).toBe(PALETTES.ocean.theme.light.primary)
    expect(t.light["glass-opacity"]).toBe(MATERIALS.liquid.light!["glass-opacity"])
    expect(t.light["glass-radius-surface"]).toBe("0rem")
    expect(t.dark["glass-duration"]).toBe("0ms")
    expect(t.light["glass-density"]).toBe("0.85")
    expect(t.light["glass-blur"]).toBe("3px") // override beat the material
    expect(t.dark["glass-glow"]).toBe("20%")
    expect(t.light["glass-glow"]).toBe("0%")
  })
  it("accepts a hue spec as the palette", () => {
    expect(createGlassTheme({ palette: { hue: 140 } }).light.primary).toContain(" 140)")
  })
})

describe("safety", () => {
  it("rejects anything that could break out of a declaration", () => {
    for (const bad of ["red; } body { display:none", "</style><script>", "url(javascript:alert(1))", 'url("x")', 'image-set("x.png" 1x)', "a\\b", "{", "x:y", '"Inter, sans-serif', "'Inter'"]) expect(sanitizeValue(bad), bad).toBeNull()
  })
  it("allows colours, lengths, easings and inert base64 SVG urls", () => {
    for (const ok of ["oklch(0.5 0.1 200 / 40%)", "12px", "-0.015em", "cubic-bezier(0.2, 0.9, 0.3, 1.12)", "url(data:image/svg+xml;base64,PHN2Zz4=)", "#ff00aa", "none", '"Source Serif 4", ui-serif, serif', '"ss01" 1, "cv11" 1'])
      expect(sanitizeValue(ok), ok).toBe(ok)
  })
  it("drops unknown tokens and unsafe values", () => {
    expect(sanitizeTokens({ "glass-blur": "4px", evil: "1px", primary: "red;}" })).toEqual({ "glass-blur": "4px" })
  })
})

describe("outputs", () => {
  const theme = createGlassTheme({ palette: "rose", material: "crystal" })
  it("writes CSS for both schemes, optionally only the differences", () => {
    const css = themeToCss(theme)
    expect(css).toMatch(/^:root \{\n  --primary: /)
    expect(css).toContain(".dark {")
    const diff = themeToCss(theme, { only: createGlassTheme({ palette: "rose" }) })
    expect(diff).toContain("--glass-blur: 10px")
    expect(diff).not.toContain("--primary")
  })
  it("scopes CSS to any selector", () => {
    expect(themeToCss(theme, { selector: "[data-x]", darkSelector: ".dark [data-x]" })).toMatch(/^\[data-x\] \{/)
  })
  it("makes a valid shadcn theme item and inline style vars", () => {
    const item = themeToRegistryItem(theme, "my-theme")
    expect(item).toMatchObject({ name: "my-theme", type: "registry:theme" })
    expect(Object.keys(item.cssVars.light)).toHaveLength(TOKENS.filter((t) => !t.optional).length)
    expect(themeVars(theme, "dark")["--glass-blur"]).toBe("10px")
  })
  it("round-trips a share code, keeping only safe known tokens", () => {
    const code = encodeTheme(theme)
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(decodeTheme(code)).toEqual(theme)
    expect(decodeTheme("not a code")).toBeNull()
  })
})

describe("colour maths", () => {
  it("parses OKLCH with and without alpha", () => {
    expect(parseOklch("oklch(0.5 0.1 200)")).toEqual([0.5, 0.1, 200, 1])
    expect(parseOklch("oklch(50% 0.1 200 / 40%)")).toEqual([0.5, 0.1, 200, 0.4])
    expect(parseOklch("red")).toBeNull()
  })
  it("converts white and black exactly", () => {
    expect(oklchToLinearRgb([1, 0, 0, 1]).map((x) => Math.round(x * 1000) / 1000)).toEqual([1, 1, 1])
    expect(oklchToLinearRgb([0, 0, 0, 1])).toEqual([0, 0, 0])
  })
  it("rates the default themes legible, and flags clear glass over a mid ground", () => {
    expect(legibility(createGlassTheme(), "light").level).not.toBe("low")
    expect(legibility(createGlassTheme(), "dark").level).not.toBe("low")
    const bad = createGlassTheme({ tokens: { "glass-opacity": "0%", "aurora-base": "oklch(0.55 0 0)", "aurora-1": "oklch(0.55 0 0)", "aurora-2": "oklch(0.55 0 0)", "aurora-3": "oklch(0.55 0 0)" } })
    expect(legibility(bad, "light").level).toBe("low")
  })
  it("random themes are deterministic per seed and always sanitary", () => {
    expect(randomTheme(0.42)).toEqual(randomTheme(0.42))
    const t = randomTheme(0.7)
    expect(sanitizeTokens(t.light)).toEqual(t.light)
  })
})

describe("typography", () => {
  it("every select option is a sanitary value", () => {
    for (const t of TOKENS) if (t.control.type === "select") for (const o of t.control.options) if (o.value) expect(sanitizeValue(o.value), `${t.name}: ${o.label}`).toBe(o.value)
  })
  it("every catalogue stack is sanitary and every Google font names its next/font import and fontsource package", () => {
    for (const [k, f] of Object.entries(FONTS)) {
      expect(sanitizeValue(f.stack), k).toBe(f.stack)
      if (f.google) {
        expect(f.google.import, k).toMatch(/^[A-Z][A-Za-z0-9_]+$/)
        expect(f.google.dependency, k).toMatch(/^@fontsource(-variable)?\/[a-z0-9-]+$/)
      }
    }
  })
  it("leaves fonts unset by default — the app's fonts apply", () => {
    const t = createGlassTheme()
    expect([t.light["glass-font-sans"], t.light["glass-font-heading"]]).toEqual(["", ""])
    expect(themeToCss(t)).not.toMatch(/--glass-font-(sans|heading|display|mono)/)
    expect(fontStylesheetUrl(t)).toBeNull()
  })
  it("type presets set the scale and their fonts", () => {
    const t = createGlassTheme({ type: "editorial" })
    expect(t.light["glass-type-ratio"]).toBe("1.333")
    expect(t.light["glass-font-heading"]).toBe(FONTS["instrument-serif"].stack)
    expect(fontDependencies(t).map((d) => `${d.role}:${d.key}`)).toEqual(["sans:inter", "heading:instrument-serif", "display:instrument-serif", "mono:jetbrains-mono"])
    for (const [k, p] of Object.entries(TYPE_PRESETS)) for (const key of Object.values(p.fonts ?? {})) expect(FONTS[key], `${k}: ${key}`).toBeTruthy()
  })
  it("fonts can be set by key or stack and override the preset", () => {
    const t = createGlassTheme({ type: "editorial", fonts: { heading: "fraunces", mono: "ui-monospace, monospace" } })
    expect(t.dark["glass-font-heading"]).toBe(FONTS.fraunces.stack)
    expect(t.dark["glass-font-mono"]).toBe("ui-monospace, monospace")
  })
  it("builds one Google Fonts URL for the theme's Google fonts, skipping system stacks", () => {
    expect(fontStylesheetUrl(createGlassTheme({ type: "system" }))).toBeNull()
    const url = fontStylesheetUrl(createGlassTheme({ type: "editorial" }))!
    expect(url).toMatch(/^https:\/\/fonts\.googleapis\.com\/css2\?/)
    expect(url).toContain("family=Instrument+Serif:wght@400")
    expect(url).toContain("family=Inter:wght@100..900")
    expect(url.match(/Instrument\+Serif/g)).toHaveLength(1)
    expect(url).toMatch(/&display=swap$/)
  })
  it("names font items by role", () => {
    expect([fontItemName("sans", "inter"), fontItemName("heading", "fraunces"), fontItemName("display", "fraunces"), fontItemName("mono", "dm-mono")]).toEqual([
      "font-inter",
      "font-heading-fraunces",
      "font-heading-fraunces",
      "font-mono-dm-mono",
    ])
  })
  it("turns Google theme fonts into font-item dependencies in a registry export", () => {
    const item = themeToRegistryItem(createGlassTheme({ type: "editorial" }), "x", "X", { fontItemUrl: (n) => `https://r.dev/r/${n}.json` })
    expect(item.registryDependencies).toEqual(["https://r.dev/r/font-inter.json", "https://r.dev/r/font-heading-instrument-serif.json", "https://r.dev/r/font-mono-jetbrains-mono.json"])
    expect(item.cssVars.light["glass-font-heading"]).toBeUndefined()
    expect(item.cssVars.light["glass-font-display"]).toBe(FONTS["instrument-serif"].stack) // display has no app-font slot
  })
  it("computes the modular scale", () => {
    const s = typeScale(createGlassTheme({ tokens: { "glass-type-ratio": "1.5", "glass-text-scale": "1" } }))
    expect([s[0], s[1], s[2]]).toEqual([16, 24, 36])
    expect(s[-1]).toBeCloseTo(10.67, 1)
  })
  it("CSS can carry the font import", () => {
    expect(themeToCss(createGlassTheme({ type: "grotesk" }), { fontImport: true })).toMatch(/^@import url\("https:\/\/fonts\.googleapis\.com/)
  })
})

describe("font catalogue vs next/font", () => {
  it("every Google font exists in next/font with the weights we ask for", async () => {
    const { readFileSync } = await import("node:fs")
    const { createRequire } = await import("node:module")
    const require = createRequire(import.meta.url)
    const data = JSON.parse(readFileSync(require.resolve("next/dist/compiled/@next/font/dist/google/font-data.json"), "utf8")) as Record<string, { weights: string[] }>
    for (const f of Object.values(FONTS)) {
      if (!f.google) continue
      const entry = data[f.google.family]
      expect(entry, f.google.family).toBeTruthy()
      if (f.google.weights === "variable") {
        expect(entry.weights, f.google.family).toContain("variable")
        // the URL asks for exactly this range — wider and Google Fonts answers 400
        const wght = (entry as { axes?: { tag: string; min: number; max: number }[] }).axes?.find((a) => a.tag === "wght")
        expect(f.google.axis, f.google.family).toEqual([wght!.min, wght!.max])
      }
      else for (const w of f.google.weights) expect(entry.weights, `${f.google.family} ${w}`).toContain(w)
    }
  })
})
