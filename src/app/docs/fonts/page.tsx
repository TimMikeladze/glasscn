import { Badge } from "@/components/glass/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
import { Glass } from "@/components/glass/glass"
import { ThemeScope } from "@/components/glass/theme-scope"
import { Heading, Text } from "@/components/glass/typography"
import { CodeBlock } from "@/components/site/code-block"
import { InstallCommand } from "@/components/site/install-command"
import { C, H2, P, PageHeader } from "@/components/site/prose"
import { FONTS, TYPE_PRESETS, createGlassTheme, fontItemName, typeScale, type FontDef } from "@/lib/glass-theme"
import { itemUrl } from "@/lib/site"

export const metadata = { title: "Fonts & type", description: "Fonts, a modular type scale, and type presets for glasscn." }

const SAMPLE = "Small gains, every night 0123456789"
const SITE_FONTS = ["Geist", "Geist Mono"]
const code = (s: string) => ({ code: s, html: `<pre><code>${s.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</code></pre>` })

/**
 * One stylesheet for every catalogue font, subset to the sample's letters — kilobytes, not megabytes.
 * Skips the fonts this site already loads in full (a subset face under the same name would mix glyphs).
 */
const specimenUrl = (() => {
  const families = Object.values(FONTS)
    .filter((f) => f.google && !SITE_FONTS.includes(f.google.family))
    .map((f) => `family=${f.google!.family.replace(/ /g, "+")}${f.google!.weights === "variable" ? ":wght@400;700" : `:wght@${f.google!.weights.join(";")}`}`)
  const letters = [...new Set(SAMPLE + Object.values(FONTS).map((f) => f.label).join(""))].join("")
  return `https://fonts.googleapis.com/css2?${families.join("&")}&text=${encodeURIComponent(letters)}&display=swap`
})()

const runtime = code(`import { ThemeScope } from "@/components/glass/theme-scope"

// a type preset, its fonts loaded for you
<ThemeScope type="editorial" loadFonts>…</ThemeScope>

// or pick fonts by catalogue key (or any CSS stack)
<ThemeScope fonts={{ heading: "fraunces", sans: "inter", mono: "jetbrains-mono" }} loadFonts>…</ThemeScope>

// or straight on an element — load the font yourself
<section className="[--glass-font-heading:Fraunces,serif] [--glass-type-ratio:1.414]">…</section>`)

const usage = code(`<body className="type-glass">              {/* body font, leading, tracking, weight, features */}
<h2 className="type-glass-heading type-step-3">  {/* heading face at step 3 of the scale */}
<span className="type-glass-display type-step-6">1,826</span>
<code className="font-glass-mono">carryId</code>`)

function FontCard({ id, font }: { id: string; font: FontDef }) {
  const roles = font.category === "mono" ? (["mono"] as const) : font.category === "serif" || font.category === "display" ? (["heading", "sans"] as const) : (["sans", "heading"] as const)
  return (
    <Glass className="grid gap-2 rounded-surface-sm p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{font.label}</span>
        <Badge variant="secondary" className="font-normal capitalize">
          {font.category}
        </Badge>
      </div>
      <div className="truncate text-2xl leading-tight" style={{ fontFamily: font.stack }}>
        {SAMPLE}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {font.google ? (
          roles.map((r) => (
            <code key={r} className="rounded-md bg-fill px-1.5 py-0.5 font-mono text-[0.7rem] text-muted-foreground">
              {fontItemName(r, id)}
            </code>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">System — nothing to load. Use it as a theme font.</span>
        )}
      </div>
    </Glass>
  )
}

export default function Typography() {
  const scale = typeScale(createGlassTheme())
  return (
    <>
      <link rel="stylesheet" href={specimenUrl} precedence="glass-fonts" />
      <PageHeader eyebrow="Guides" title="Fonts & type" description="Fonts the shadcn way, a modular type scale, and type presets that restyle every heading, figure and paragraph at once." />

      <H2>Two kinds of font</H2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle>App fonts</CardTitle>
            <CardDescription>
              shadcn’s <C>--font-sans</C>, <C>--font-heading</C>, <C>--font-mono</C>, set by <C>registry:font</C> items. The CLI wires next/font in Next.js and fontsource elsewhere. Glass components use them
              automatically.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle>Theme fonts</CardTitle>
            <CardDescription>
              Optional <C>--glass-font-sans | heading | display | mono</C> overrides — for a ThemeScope, a section, the studio. Unset, they fall back to your app fonts; set, you load them (
              <C>loadFonts</C> does it for Google fonts).
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <H2>Install fonts</H2>
      <P>One item per role. Body fonts set <C>--font-sans</C>, heading fonts <C>--font-heading</C>, mono fonts <C>--font-mono</C>:</P>
      <InstallCommand args={`add ${itemUrl("font-inter")} ${itemUrl("font-heading-fraunces")} ${itemUrl("font-mono-jetbrains-mono")}`} />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(FONTS).map(([id, f]) => (
          <FontCard key={id} id={id} font={f} />
        ))}
      </div>

      <H2>Type presets</H2>
      <P>
        A type preset sets the scale, leading, weights, tracking, case and numerals — and installs its fonts. <C>type-system</C> is the Apple look: San Francisco with SF Rounded figures, nothing to load.
      </P>
      <InstallCommand args={`add ${itemUrl("type-editorial")}`} />
      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {Object.entries(TYPE_PRESETS).map(([k, p]) => (
          <ThemeScope key={k} type={k} loadFonts className="rounded-surface">
            <Card className="h-full">
              <CardContent className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono font-normal">
                    type-{k}
                  </Badge>
                </div>
                <Heading level={3} size="2">
                  {p.title}: small gains, every night.
                </Heading>
                <Text variant="muted">{p.description}</Text>
                <div className="type-glass-display type-step-4">1,826</div>
              </CardContent>
            </Card>
          </ThemeScope>
        ))}
      </div>

      <H2>The scale</H2>
      <P>
        Every size is a step: <C>1rem × --glass-text-scale × --glass-type-ratio^n</C>, as Tailwind utilities <C>type-step-n2</C> … <C>type-step-6</C>. Change the ratio and every heading moves together.
        Defaults (major third, 1.25):
      </P>
      <Glass className="grid gap-1 overflow-hidden p-5">
        {Object.entries(scale)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([n, px]) => (
            <div key={n} className="flex items-baseline gap-4">
              <code className="w-28 shrink-0 font-mono text-xs text-muted-foreground">type-step-{Number(n) < 0 ? `n${-Number(n)}` : n}</code>
              <code className="w-16 shrink-0 font-mono text-xs text-muted-foreground">{px}px</code>
              <span className="truncate type-glass-heading" style={{ fontSize: px }}>
                Small gains
              </span>
            </div>
          ))}
      </Glass>

      <H2>Utilities</H2>
      <CodeBlock {...usage} title="classes" />
      <P className="mt-4">
        <C>type-glass</C> (body), <C>type-glass-heading</C>, <C>type-glass-display</C>, <C>font-glass-sans | heading | display | mono</C>, <C>numeric-glass</C>, <C>type-step-*</C>, and{" "}
        <C>glass-prose</C> (the <C>Prose</C> component) for rich text. All read the Fonts and Type tokens.
      </P>

      <H2>At runtime</H2>
      <CodeBlock {...runtime} title="theme fonts" />
    </>
  )
}
