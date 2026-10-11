/**
 * The docs navigation as plain data: the guides, then every documented item by group.
 * Built on the server (it reads the registry) and handed to `DocsNav` as a prop, so the
 * registry never ships to the browser. The sitemap walks the same list.
 */
import { GROUPS, docs } from "@/lib/docs"
import { GUIDES } from "@/lib/og/pages"

export interface NavSection {
  label: string
  links: { href: string; label: string }[]
}

export const docsNav: NavSection[] = [
  { label: "Guides", links: GUIDES.map((g) => ({ href: g.path, label: g.label })) },
  ...GROUPS.map((group) => ({
    label: group,
    links: docs.filter((d) => d.group === group).map((d) => ({ href: `/docs/${d.slug}`, label: d.title })),
  })).filter((s) => s.links.length > 0),
]
