/**
 * Page metadata with full Open Graph and Twitter/X cards. The image itself comes
 * from the `opengraph-image.tsx` beside each page (see docs/og-images.md).
 */
import type { Metadata } from "next"

import { site } from "@/lib/site"

export const twitterHandle = `@${new URL(site.author.twitter).pathname.slice(1)}`

/** Defaults every page inherits; set once in the root layout. */
export const rootMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author.name, url: site.author.portfolio }],
  creator: site.author.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    url: "/",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: { card: "summary_large_image", creator: twitterHandle, title: `${site.name} — ${site.tagline}`, description: site.description },
}

/**
 * A page's metadata. Open Graph and Twitter are replaced wholesale per segment,
 * so each page restates them — otherwise it would share the home page's title.
 */
export function pageMetadata({ title, description = site.description, path }: { title: string; description?: string; path: string }): Metadata {
  const full = `${title} · ${site.name}`
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: site.name, locale: "en_US", url: path, title: full, description },
    twitter: { card: "summary_large_image", creator: twitterHandle, title: full, description },
  }
}
