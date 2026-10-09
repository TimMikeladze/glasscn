import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Badge } from "@/components/glass/badge"
import { Button } from "@/components/glass/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
import { Glass } from "@/components/glass/glass"
import { ThemeScope } from "@/components/glass/theme-scope"
import { CodeBlock } from "@/components/site/code-block"
import { InstallCommand } from "@/components/site/install-command"
import { C, H2, P, PageHeader } from "@/components/site/prose"
import { GROUPS, MATERIALS, MOTIONS, PALETTES, SHAPES, TOKENS } from "@/lib/glass-theme"
import { snippets } from "@/lib/sources.generated"
import { itemUrl } from "@/lib/site"
import { pageMetadata } from "@/lib/metadata"
import { PAGES } from "@/lib/og/pages"

export const metadata = pageMetadata(PAGES.theming)

const code = (s: string) => ({ code: s, html: `<pre><code>${s.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</code></pre>` })

const perElement = code(`<Card className="[--glass-blur:6px] [--glass-opacity:70%]">Less blur, more frost</Card>
<Button className="[--glass-radius-button:0.5rem]">Squarer</Button>
<section className="[--glass-density:0.85]">…everything inside is compact</section>`)

const runtime = code(`import { ThemeScope } from "@/components/glass/theme-scope"
import { createGlassTheme } from "@/lib/glass-theme"

const brand = createGlassTheme({
  palette: { hue: 200, harmony: "triadic", chroma: 0.18 },
  material: "liquid",
  shape: "soft",
  density: "compact",
  tokens: { "glass-blur": "20px" },
  dark: { "glass-glow": "24%" },
})

<ThemeScope theme={brand}>…</ThemeScope>`)

function PresetRow({ title, prefix, presets }: { title: string; prefix: string; presets: Record<string, { title: string; description: string }> }) {
  return (
    <div className="grid gap-3">
      <h3 className="type-glass-heading text-lg">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(presets).map(([k, p]) => (
          <Card key={k} size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {p.title}
                <Badge variant="secondary" className="font-mono font-normal">
                  {prefix}-{k}
                </Badge>
              </CardTitle>
              <CardDescription>{p.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function Theming() {
  return (
    <>
      <PageHeader eyebrow="Guides" title="Theming" description={`${TOKENS.length} primitives in ${GROUPS.length} groups. Pick presets, turn any knob, theme a single card — all with CSS variables.`} />
      <Glass tint="primary" className="flex flex-wrap items-center gap-4 p-5">
        <div className="min-w-0 flex-1">
          <div className="type-glass-heading text-lg">Theme Studio</div>
          <p className="text-sm text-muted-foreground">Every primitive as a control, a hue-harmony generator, a live preview, and export as a one-line shadcn CLI install, CSS, a shadcn item or a link.</p>
        </div>
        <Button asChild>
          <Link href="/themes">
            Open the studio <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      </Glass>

      <H2>How it works</H2>
      <P>
        The <C>glass-style</C> foundation adds primitives to <C>:root</C> and <C>.dark</C>. Everything you see — the frost, the rim, the shadow, the corners, the control heights — is computed from them
        <em> on the element that uses them</em>. So a primitive can be overridden anywhere, and only that subtree changes:
      </P>
      <CodeBlock {...perElement} title="any element" />

      <H2>Presets compose</H2>
      <P>
        Each preset is a shadcn theme item that sets only its own group, so you mix them: a palette, a material, a shape, a motion, a density. Adding one replaces the previous choice in its group.
      </P>
      <InstallCommand args={`add ${itemUrl("theme-lagoon")} ${itemUrl("material-liquid")} ${itemUrl("shape-soft")}`} />
      <div className="mt-6 grid gap-8">
        <div className="grid gap-3">
          <h3 className="type-glass-heading text-lg">Palettes</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Object.entries(PALETTES).map(([k, p]) => (
              <ThemeScope key={k} palette={k} className="rounded-surface-sm">
                <Glass className="flex items-center gap-3 rounded-surface-sm p-3">
                  <span className="size-8 shrink-0 rounded-full border border-glass-border bg-[conic-gradient(var(--aurora-1),var(--aurora-2),var(--primary),var(--aurora-3),var(--aurora-1))]" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{p.title}</div>
                    <code className="font-mono text-[0.7rem] text-muted-foreground">theme-{k}</code>
                  </div>
                </Glass>
              </ThemeScope>
            ))}
          </div>
        </div>
        <PresetRow title="Materials" prefix="material" presets={MATERIALS} />
        <PresetRow title="Shapes" prefix="shape" presets={SHAPES} />
        <PresetRow title="Motion" prefix="motion" presets={MOTIONS} />
        <PresetRow title="Density" prefix="density" presets={{ compact: { title: "Compact", description: "×0.85" }, default: { title: "Default", description: "×1" }, comfortable: { title: "Comfortable", description: "×1.15" } }} />
      </div>

      <H2>At runtime</H2>
      <P>
        The engine (<C>glass-theme</C>) builds themes in code — any hue and harmony, presets, overrides per scheme — and <C>ThemeScope</C> applies one to a subtree. Values are sanitised before they
        become CSS, so a theme from a share link can’t inject anything.
      </P>
      <InstallCommand args={`add ${itemUrl("theme-scope")}`} />
      <div className="mt-4">
        <CodeBlock {...runtime} title="theme.ts" />
      </div>

      <H2>Every primitive</H2>
      {GROUPS.map((g) => (
        <div key={g} className="mb-6">
          <h3 className="mb-2 type-glass-heading text-base">{g}</h3>
          <div className="glass overflow-hidden rounded-surface-sm [--glass-elevation:0_0_#0000]">
            {TOKENS.filter((t) => t.group === g).map((t) => (
              <div key={t.name} className="grid gap-1 border-b border-foreground/5 px-4 py-2.5 last:border-0 sm:grid-cols-[14rem_1fr_auto] sm:gap-4">
                <code className="font-mono text-[0.78rem] text-primary">--{t.name}</code>
                <span className="text-sm text-muted-foreground">{t.description}</span>
                <code className="truncate font-mono text-[0.72rem] text-muted-foreground sm:max-w-56" title={t.light}>
                  {t.control.type === "select" ? (t.control.options.find((o) => o.value === t.light)?.label ?? t.light) : t.light}
                </code>
              </div>
            ))}
          </div>
        </div>
      ))}

      <H2>Utilities</H2>
      <P>
        <C>glass</C>, <C>glass-strong</C>, <C>glass-subtle</C> for surfaces; colours <C>bg-glass</C>, <C>bg-fill</C>, <C>border-glass-border</C>, <C>bg-aurora-1</C>…; corners <C>rounded-surface</C>,{" "}
        <C>rounded-control</C>, <C>rounded-button</C>, <C>rounded-badge</C>; sizing <C>h-control</C>, <C>px-pad</C>; motion <C>ease-glass</C>; type <C>type-glass-heading</C>, <C>type-step-*</C> (see <Link href="/docs/fonts" className="text-primary underline">Fonts &amp; type</Link>). Two hooks
        replace whole layers: <C>--glass-bg</C> and <C>--glass-elevation</C>. No <C>backdrop-filter</C>? Panes go nearly opaque. <C>prefers-reduced-motion</C> stills the aurora and the charts.
      </P>
      <CodeBlock code={snippets.tokens.code} html={snippets.tokens.html} title="what glass-style adds to globals.css" maxHeight={320} />
    </>
  )
}
