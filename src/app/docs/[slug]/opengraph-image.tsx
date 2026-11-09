// Next hashes only this file into the image URL (?hash), so X keeps a stale card when render.tsx or pages.ts change. Bump on visual changes: og-v3
import { docBySlug, docs } from "@/lib/docs"
import { ogContentType, ogSize, renderOg } from "@/lib/og/render"
import { GROUP_CARD } from "@/lib/og/scenes"
import { registryNamespace } from "@/lib/site"

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
    command: `npx shadcn add ${registryNamespace}/${slug}`,
    path: `/docs/${slug}`,
    ...GROUP_CARD[doc.group],
  })
}
