import { existsSync, readdirSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { blocks, components, foundations, nativeItems } from "./items.mjs"
import { DENSITIES, FONTS, MATERIALS, MOTIONS, PALETTES, SHAPES, TOKENS, TYPE_PRESETS } from "../src/lib/glass-theme.ts"
import { DARK, themeTokens } from "./stylesheet.mjs"
import { registryUrl } from "../scripts/registry-url.mjs"

const registry = JSON.parse(readFileSync("registry.json", "utf8"))
const names = new Set(registry.items.map((i) => i.name))

describe("registry.json", () => {
  it("is in sync with registry/items.mjs and the theme presets (run scripts/generate.mjs)", () => {
    const presets = [PALETTES, MATERIALS, SHAPES, MOTIONS, DENSITIES, TYPE_PRESETS].reduce((n, p) => n + Object.keys(p).length, 0)
    const fonts = registry.items.filter((i) => i.type === "registry:font").length
    expect(fonts).toBeGreaterThan(20)
    const expected = foundations.length + presets + fonts + components.length + blocks.length + nativeItems.length
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
  it("never ships an optional token as an empty value (an empty var would block its fallback)", () => {
    for (const item of registry.items) for (const scheme of ["light", "dark"]) for (const [k, v] of Object.entries(item.cssVars?.[scheme] ?? {})) expect(v, `${item.name} ${k}`).not.toBe("")
  })
  it("gives the foundation every primitive except the accent, charts and optional fonts, in light and dark", () => {
    const style = registry.items.find((i) => i.name === "glass-style")
    for (const t of TOKENS.filter((t) => !t.optional)) {
      const accent = ["primary", "primary-foreground", "ring"].includes(t.name) || t.name.startsWith("chart-")
      expect(Boolean(style.cssVars.light[t.name]), t.name).toBe(!accent)
      expect(Boolean(style.cssVars.dark[t.name]), t.name).toBe(!accent)
    }
    expect(Object.keys(style.css)).toContain("@utility glass")
  })
  it("never stores a derived value as a primitive — derived values live in the theme tokens and utilities only", () => {
    const style = registry.items.find((i) => i.name === "glass-style")
    for (const v of [...Object.values(style.cssVars.light), ...Object.values(style.cssVars.dark)]) expect(v).not.toMatch(/var\(/)
    for (const v of Object.values(themeTokens)) expect(v).toMatch(/var\(--/)
  })
  it("font items follow shadcn's registry:font shape, and every type preset's font dependency exists", () => {
    for (const item of registry.items.filter((i) => i.type === "registry:font")) {
      expect(item.font.provider).toBe("google")
      expect(["--font-sans", "--font-heading", "--font-display", "--font-mono"]).toContain(item.font.variable)
      expect(item.font.dependency).toMatch(/^@fontsource/)
      // a code font must not become the whole app's font (the CLI's default for --font-mono)
      if (item.font.variable === "--font-mono") expect(item.font.selector).toBe("code, kbd, samp, pre")
    }
    for (const item of registry.items.filter((i) => i.name.startsWith("type-")))
      for (const dep of item.registryDependencies ?? []) expect(names.has(dep.match(/\/r\/(.+)\.json$/)[1]), dep).toBe(true)
    expect(Object.values(FONTS).length).toBeGreaterThan(20)
  })
  it("never lets a custom property reference itself in a component class (it would be invalid)", () => {
    const files = readdirSync("src/components/glass").map((f) => `src/components/glass/${f}`).concat("src/lib/glass-variants.ts")
    for (const f of files) {
      const src = readFileSync(f, "utf8")
      for (const [, name, value] of src.matchAll(/\[--([\w-]+):([^\]\s"]*)\]/g)) expect(value.includes(`var(--${name})`), `${f}: --${name}`).toBe(false)
    }
  })
  it("ships a dark variant identical to ThemeScope's forced-scheme selector", () => {
    const scope = readFileSync("src/components/glass/theme-scope.tsx", "utf8")
    expect(scope).toContain(`const DARK_SCHEME = "${DARK}"`)
    const style = registry.items.find((i) => i.name === "glass-style")
    expect(Object.keys(style.css)).toContain(`@custom-variant dark (&${DARK})`)
  })
  it("ships the data-* variants its components use", () => {
    const style = registry.items.find((i) => i.name === "glass-style")
    for (const v of ["open", "closed", "checked", "unchecked", "disabled", "horizontal", "vertical"])
      expect(Object.keys(style.css).some((k) => k.startsWith(`@custom-variant data-${v} `)), v).toBe(true)
  })
  it("never nests an at-rule inside another rule (the shadcn CLI mangles it: `@media (pointer::after: coarse)`)", () => {
    const nested = []
    const walk = (o, path) => {
      for (const [k, v] of Object.entries(o)) {
        if (typeof v !== "object") continue
        if (path.length && k.startsWith("@") && !path[0].startsWith("@media") && !path[0].startsWith("@supports")) nested.push(`${path.join(" > ")} > ${k}`)
        walk(v, [...path, k])
      }
    }
    for (const item of registry.items.filter((i) => i.css)) walk(item.css, [])
    expect(nested).toEqual([])
  })
  it("ships the liquid surfaces, focus, hit-area, concentric and the accessibility overrides", () => {
    const style = registry.items.find((i) => i.name === "glass-style")
    for (const k of ["@utility glass-liquid", "@utility glass-liquid-clear", "@utility glass-focus", "@utility hit-area", "@utility rounded-concentric", "@utility type-body", "@media (prefers-reduced-transparency: reduce)", "@media (prefers-contrast: more)", "@media (forced-colors: active)"])
      expect(Object.keys(style.css), k).toContain(k)
  })
  it("states the real primitive count in the docs", () => {
    for (const f of ["README.md", "docs/theming.md", "docs/spec.md"]) expect(readFileSync(f, "utf8"), f).toContain(`${TOKENS.length} primitives`)
  })
  it("references only primitives that exist", () => {
    // primitives, the two layer hooks, and shadcn's own colour tokens
    const known = new Set([...TOKENS.map((t) => t.name), "glass-bg", "glass-elevation", "glass-tinted", "glass-draw-from", "glass-container-radius", "glass-container-pad", "glass-concentric-min", "primary", "destructive", "foreground", "muted-foreground"])
    const css = JSON.stringify([themeTokens, ...registry.items.filter((i) => i.css).map((i) => i.css)])
    for (const [, name] of css.matchAll(/var\(--([\w-]+)/g)) expect(known.has(name), name).toBe(true)
  })
})

describe("component rules (docs/rules/components.md, tokens.md, accessibility.md)", () => {
  const dirs = ["src/components/glass", "src/components/blocks"]
  const files = dirs.flatMap((d) => readdirSync(d).filter((f) => f.endsWith(".tsx")).map((f) => `${d}/${f}`))
  const code = (f) => readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")
  const banned = [
    [/(?<![\w:-])outline-none(?![\w-])/, "outline-none hides focus in forced colours — use focus-visible:outline-hidden"],
    [/(?<![\w-])(?:bg|text|border|fill|stroke)-(?:white|black)(?![\w-])/, "literal white/black — use a token (glass-knob, primary-foreground, glass-dim…)"],
    [/(?<![\w-])[\w-]+-\[[^\]]*(?:#[0-9a-f]{3,8}\b|rgba?\(|hsla?\()/i, "literal colour in an arbitrary class — use a token"],
    [/(?<![\w:-])backdrop-blur(?:-|\b)/, "raw backdrop-blur — glass comes from the glass utilities"],
  ]
  it("components use tokens and keep focus visible", () => {
    const failures = []
    for (const f of files) {
      const src = code(f)
      for (const [re, why] of banned) {
        const m = src.match(re)
        if (m) failures.push(`${f}: "${m[0]}" — ${why}`)
      }
    }
    expect(failures).toEqual([])
  })
})

describe("primitives stay plain, and every variable a component uses exists (REG-02, REG-03)", () => {
  const derived = /\bvar\s*\(|\benv\s*\(|\b(?:calc|color-mix|min|max|clamp)\s*\([^)]*--/i
  it("no registry:theme item (or the foundation) stores a derived value — no var(), and no calc()/color-mix() over variables", () => {
    const themed = registry.items.filter((i) => i.type === "registry:theme" || i.name === "glass-style")
    expect(themed.length).toBeGreaterThan(30)
    for (const item of themed)
      for (const scheme of ["light", "dark"]) for (const [k, v] of Object.entries(item.cssVars?.[scheme] ?? {})) expect(v, `${item.name} ${scheme} --${k}`).not.toMatch(derived)
  })
  it("the check catches derived values", () => {
    for (const v of ["var(--x)", "VAR (--x)", "calc(var(--a) * 2)", "color-mix(in oklch, var(--primary) 30%, white)", "calc(--a * 2)", "env(safe-area-inset-top)"]) expect(v).toMatch(derived)
    for (const v of ["oklch(0.5 0.1 200 / 40%)", "28px", "calc(1rem * 2)", "linear(0, 0.5 20%, 1)"]) expect(v).not.toMatch(derived)
  })
  it("primitives re-declared at :root / .dark / a ThemeScope (the accessibility overrides) are plain too", () => {
    const failures = []
    const walk = (name, obj, path) => {
      for (const [k, v] of Object.entries(obj)) {
        if (v && typeof v === "object") walk(name, v, [...path, k])
        else if (k.startsWith("--") && path.some((p) => !p.startsWith("@") && /:root|\.dark|data-glass-scope/.test(p)) && derived.test(String(v))) failures.push(`${name}: ${path.join(" > ")} ${k}: ${v}`)
      }
    }
    for (const item of registry.items) walk(item.name, item.css ?? {}, [])
    expect(failures).toEqual([])
  })

  it("component class strings and styles only use variables that exist", () => {
    const dirs = ["src/components/glass", "src/components/blocks", "src/hooks"]
    const files = dirs.flatMap((d) => readdirSync(d).filter((f) => /\.tsx?$/.test(f)).map((f) => `${d}/${f}`)).concat("src/lib/glass-variants.ts")
    const sources = Object.fromEntries(files.map((f) => [f, readFileSync(f, "utf8")]))
    // declared by a component: an arbitrary property `[--x:…]`, a style key `"--x"`, or setProperty("--x")
    const declared = new Set()
    for (const src of Object.values(sources)) for (const [, name] of src.matchAll(/(?:\[|["'`])--([\w-]+)(?::|["'`])/g)) declared.add(name)
    const primitives = new Set(TOKENS.map((t) => t.name))
    const hooks = new Set(["glass-bg", "glass-elevation", "glass-tinted", "glass-draw-from", "glass-container-radius", "glass-container-pad", "glass-concentric-min"])
    const shadcn = new Set(["background", "foreground", "card", "card-foreground", "popover", "popover-foreground", "primary", "primary-foreground", "secondary", "secondary-foreground", "muted", "muted-foreground", "accent", "accent-foreground", "destructive", "border", "input", "ring", "radius"])
    const theme = new Set(Object.keys(themeTokens))
    // radix's measured vars, the sliding indicator, TanStack Charts' tooltip/series, tw-animate-css
    const foreign = /^(?:radix-|indicator-|ts-|tw-)/
    const known = (n) => primitives.has(n) || hooks.has(n) || shadcn.has(n) || theme.has(n) || foreign.test(n) || n.startsWith("sidebar") || declared.has(n)
    const failures = []
    for (const [f, src] of Object.entries(sources)) {
      // var(--x) and Tailwind's (--x) shorthand: `duration-(--glass-duration)`
      for (const [, name] of src.matchAll(/(?:var\(|\()--([\w-]+)/g)) {
        // a template prefix — var(--chart-${i}) — must prefix something real
        const ok = name.endsWith("-") ? [...primitives, ...theme].some((p) => p.startsWith(name)) : known(name)
        if (!ok) failures.push(`${f}: --${name}`)
      }
      // writing a --glass-* name that isn't a primitive or a hook is a typo the cascade silently ignores
      for (const [, name] of src.matchAll(/\[--(glass-[\w-]+):/g)) if (!primitives.has(name) && !hooks.has(name)) failures.push(`${f}: sets --${name}`)
    }
    expect(failures).toEqual([])
  })
})

describe("registry URL (REG-04)", () => {
  it("stamps production with glasscn.app, previews with their own URL, local builds with localhost", () => {
    expect(registryUrl({ VERCEL: "1", VERCEL_ENV: "production", VERCEL_URL: "glasscn-abc.vercel.app" })).toBe("https://glasscn.app")
    expect(registryUrl({ VERCEL: "1", VERCEL_ENV: "preview", VERCEL_BRANCH_URL: "glasscn-git-x.vercel.app", VERCEL_URL: "glasscn-abc.vercel.app" })).toBe("https://glasscn-git-x.vercel.app")
    expect(registryUrl({ VERCEL: "1", VERCEL_ENV: "preview", VERCEL_URL: "glasscn-abc.vercel.app" })).toBe("https://glasscn-abc.vercel.app")
    expect(registryUrl({ VERCEL: "1", VERCEL_ENV: "preview", VERCEL_URL: "x.vercel.app", NEXT_PUBLIC_REGISTRY_URL: "https://r.example/" })).toBe("https://r.example")
    expect(registryUrl({})).toBe("http://localhost:3000")
  })
})
