import type { MetadataRoute } from "next"

import { docsNav } from "@/components/site/docs-nav-data"
import { siteUrl } from "@/lib/site"

/** Every page: home plus everything the docs nav links to (the guides and every documented item). */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, siteUrl).toString()
  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    ...docsNav.flatMap((section) =>
      section.links.map((l) => ({ url: url(l.href), changeFrequency: section.label === "Guides" ? ("weekly" as const) : ("monthly" as const), priority: section.label === "Guides" ? 0.8 : 0.6 }))
    ),
  ]
}
