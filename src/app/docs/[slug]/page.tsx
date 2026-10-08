import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

import { Badge } from "@/components/glass/badge"
import { Button } from "@/components/glass/button"
import { CodeBlock } from "@/components/site/code-block"
import { ComponentPreview } from "@/components/site/component-preview"
import { InstallCommand } from "@/components/site/install-command"
import { PropsTable } from "@/components/site/props-table"
import { H2, P } from "@/components/site/prose"
import { docBySlug, docs } from "@/lib/docs"
import { demoSources, sources } from "@/lib/sources.generated"
import { itemUrl } from "@/lib/site"

export function generateStaticParams() {
  return docs.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: PageProps<"/docs/[slug]">) {
  const { slug } = await params
  const doc = docBySlug(slug)
  return doc ? { title: doc.title, description: doc.description } : {}
}

/** The page's static shell: a skeleton while the slug resolves, so navigation between items is instant. */
export default function DocPage(props: PageProps<"/docs/[slug]">) {
  return (
    <Suspense fallback={<DocSkeleton />}>
      <Doc params={props.params} />
    </Suspense>
  )
}

function DocSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy>
      <div className="h-6 w-24 rounded-full bg-fill" />
      <div className="h-10 w-64 rounded-xl bg-fill" />
      <div className="h-5 w-full max-w-xl rounded-lg bg-fill" />
      <div className="glass-subtle mt-6 h-72 rounded-3xl" />
    </div>
  )
}

async function Doc({ params }: { params: PageProps<"/docs/[slug]">["params"] }) {
  const { slug } = await params
  const doc = docBySlug(slug)
  if (!doc) notFound()
  const i = docs.indexOf(doc)
  const prev = docs[i - 1]
  const next = docs[i + 1]
  const demo = demoSources[slug]
  const files = sources[slug] ?? []
  return (
    <article>
      <div className="flex flex-col gap-2 pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="tinted">{doc.group}</Badge>
          {doc.dependencies.map((d) => (
            <Badge key={d} variant="secondary" className="font-mono font-normal">
              {d}
            </Badge>
          ))}
        </div>
        <h1 className="font-heading text-4xl font-bold tracking-tight">{doc.title}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{doc.description}</p>
      </div>

      <ComponentPreview name={slug} html={demo?.html} code={demo?.code} wide={doc.group === "Blocks"} />

      <H2>Installation</H2>
      <InstallCommand args={`add ${itemUrl(slug)}`} />
      <P className="mt-3 text-sm text-muted-foreground">
        Or with the namespace set up: <code className="rounded-md bg-fill px-1.5 py-0.5 font-mono text-xs">shadcn add @glasscn/{slug}</code>
      </P>

      {doc.props?.length ? (
        <>
          <H2>Props</H2>
          <PropsTable rows={doc.props} />
        </>
      ) : null}
      {doc.notes?.map((n) => (
        <P key={n} className="mt-4">
          {n}
        </P>
      ))}

      <H2>Source</H2>
      <div className="grid gap-4">
        {files.map((f) => (
          <CodeBlock key={f.path} code={f.code} html={f.html} title={f.path} maxHeight={420} />
        ))}
      </div>

      <nav className="mt-12 flex justify-between gap-3">
        {prev ? (
          <Button asChild variant="glass">
            <Link href={`/docs/${prev.slug}`}>
              <ArrowLeftIcon data-icon="inline-start" /> {prev.title}
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button asChild variant="glass">
            <Link href={`/docs/${next.slug}`}>
              {next.title} <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        ) : null}
      </nav>
    </article>
  )
}
