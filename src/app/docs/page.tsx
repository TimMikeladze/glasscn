import Link from "next/link"

import { Badge } from "@/components/glass/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/glass/card"
import { C, H2, P, PageHeader } from "@/components/site/prose"
import { GROUPS, docs } from "@/lib/docs"
import { pageMetadata } from "@/lib/metadata"
import { PAGES } from "@/lib/og/pages"

export const metadata = pageMetadata(PAGES.docs)

export default function DocsIndex() {
  return (
    <>
      <PageHeader eyebrow="Introduction" title="glasscn" description="Glassmorphic components for shadcn — frosted surfaces over a living aurora, built on Radix and Tailwind v4, installed as source." />
      <P>
        glasscn is a <Link className="text-primary hover:underline" href="https://ui.shadcn.com/docs/registry">shadcn registry</Link>. You don’t install a package: the shadcn CLI copies each component into
        your project, where it’s yours to read and change. Components keep shadcn’s APIs where one exists, so <C>@/components/ui/button</C> becomes <C>@/components/glass/button</C> and nothing else
        changes.
      </P>
      <P>
        Everything visual is a CSS variable — the frost, the rim, the blur and saturation, the aurora’s three colours — set by one foundation item and a palette theme. Start with{" "}
        <Link className="text-primary hover:underline" href="/docs/installation">Installation</Link>, then make it yours in <Link className="text-primary hover:underline" href="/docs/theming">Theming</Link>.
      </P>
      {GROUPS.map((group) => (
        <section key={group}>
          <H2>{group}</H2>
          <div className="grid gap-3 sm:grid-cols-2">
            {docs
              .filter((d) => d.group === group)
              .map((d) => (
                <Link key={d.slug} href={`/docs/${d.slug}`} className="group">
                  <Card size="sm" className="h-full transition-transform group-hover:-translate-y-0.5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {d.title}
                        {d.group === "Blocks" ? <Badge variant="tinted">block</Badge> : null}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">{d.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </>
  )
}
