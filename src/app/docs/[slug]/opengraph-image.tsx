import { docBySlug, docs } from "@/lib/docs"
import { GROUP_PALETTE } from "@/lib/og/colors"
import { ogContentType, ogSize, renderOg } from "@/lib/og/render"

export function generateStaticParams() {
  return docs.map((d) => ({ slug: d.slug }))
}

export function generateImageMetadata({ params }: { params: { slug: string } }) {
  const doc = docBySlug(params.slug)
  return [{ id: "card", alt: doc ? `${doc.title} — a glasscn ${doc.group === "Blocks" ? "block" : "component"}` : "glasscn", size: ogSize, contentType: ogContentType }]
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = docBySlug(slug)
  if (!doc) return renderOg({ title: "Not found", path: `/docs/${slug}` })
  return renderOg({
    title: doc.title,
    description: doc.description,
    eyebrow: doc.group,
    command: `npx shadcn add @glasscn/${slug}`,
    path: `/docs/${slug}`,
    palette: GROUP_PALETTE[doc.group],
  })
}
