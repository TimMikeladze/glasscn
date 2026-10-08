import { CodeBlock } from "@/components/site/code-block"
import { Customizer } from "@/components/site/customizer"
import { InstallCommand } from "@/components/site/install-command"
import { C, H2, P, PageHeader } from "@/components/site/prose"
import { PaletteSwatch } from "@/components/site/site-header"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
import { Glass } from "@/components/glass/glass"
import { themeItems } from "@/lib/docs"
import { snippets } from "@/lib/sources.generated"
import { itemUrl } from "@/lib/site"

export const metadata = { title: "Theming" }

const TOKENS: [string, string][] = [
  ["--glass", "The frost: the pane's fill over the blur."],
  ["--glass-strong / --glass-subtle", "Heavier and lighter frost (dialogs and menus use strong)."],
  ["--glass-border", "The light rim around every pane."],
  ["--glass-highlight", "The inset top highlight — the edge catching light."],
  ["--glass-shadow", "Colour of the soft drop shadow."],
  ["--glass-blur / --glass-saturate", "The backdrop-filter: how much to blur and how vivid the colour behind stays."],
  ["--glass-fill / --glass-fill-strong", "Control fills on glass: inputs, tracks, idle pills."],
  ["--glass-thumb", "The raised thumb of segmented controls."],
  ["--aurora-base / --aurora-1..3", "The page colour and the three drifting blobs."],
]

export default function Theming() {
  return (
    <>
      <PageHeader eyebrow="Guides" title="Theming" description="Every visual decision is a CSS variable. Pick a palette, turn the knobs, paste the result." />
      <Customizer />

      <H2>Palettes</H2>
      <P>Each palette is a shadcn theme item: it sets --primary, --ring, --chart-1..3 and the aurora for light and dark.</P>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {themeItems.map((t) => {
          const key = t.name.replace("theme-", "") as Parameters<typeof PaletteSwatch>[0]["palette"]
          return (
            <Card key={t.name} size="sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PaletteSwatch palette={key} className="size-5" />
                  {t.title?.replace(" theme", "")}
                </CardTitle>
                <CardDescription>{t.description?.split(" Sets")[0]}</CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>
      <div className="mt-4">
        <InstallCommand args={`add ${itemUrl("theme-ocean")}`} />
      </div>

      <H2>Tokens</H2>
      <div className="glass overflow-hidden rounded-2xl [--glass-elevation:0_0_#0000]">
        {TOKENS.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1 border-b border-foreground/5 px-4 py-3 last:border-0 sm:flex-row sm:gap-6">
            <code className="w-72 shrink-0 font-mono text-[0.8rem] text-primary">{k}</code>
            <span className="text-sm text-muted-foreground">{v}</span>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <CodeBlock code={snippets.tokens.code} html={snippets.tokens.html} title="what glass-style adds to globals.css" maxHeight={320} />
      </div>

      <H2>Restyle one surface</H2>
      <P>
        Every pane reads two hooks, so a class is enough — no new variant needed: <C>--glass-bg</C> for the fill and <C>--glass-elevation</C> for the drop shadow.
      </P>
      <div className="grid gap-3 sm:grid-cols-3">
        <Glass className="p-5 text-sm">Default</Glass>
        <Glass className="p-5 text-sm [--glass-bg:color-mix(in_oklch,var(--chart-2)_22%,var(--glass))]">--glass-bg: chart-2 wash</Glass>
        <Glass className="p-5 text-sm [--glass-elevation:0_24px_60px_var(--glass-shadow)]">--glass-elevation: deeper</Glass>
      </div>

      <H2>Utilities</H2>
      <P>
        The foundation registers <C>glass</C>, <C>glass-strong</C> and <C>glass-subtle</C> as Tailwind utilities, and the colours <C>bg-glass</C>, <C>bg-fill</C>, <C>border-glass-border</C>,{" "}
        <C>bg-aurora-1</C>… Browsers without backdrop-filter fall back to the strong, more opaque frost; <C>prefers-reduced-motion</C> stills the aurora and the drawing charts.
      </P>
    </>
  )
}
