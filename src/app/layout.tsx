import type { Metadata } from "next"

import { Aurora } from "@/components/glass/aurora"
import { GlassPreferencesScript } from "@/components/glass/glass-preferences-script"
import { GlassEffects } from "@/components/glass/glass-effects"
import { Providers, paletteScript } from "@/components/site/providers"
import { SiteHeader } from "@/components/site/site-header"
import { docsNav } from "@/components/site/docs-nav-data"
import { SiteFooter } from "@/components/site/site-footer"
import { repoStars } from "@/lib/github"
import { rootMetadata } from "@/lib/metadata"
import { PALETTES } from "@/lib/glass-theme"
import "./globals.css"

export const metadata: Metadata = rootMetadata

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const stars = await repoStars()
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <head>
        <script dangerouslySetInnerHTML={{ __html: paletteScript }} />
        <GlassPreferencesScript />
      </head>
      <body className="type-glass min-h-dvh">
        <Providers palettes={Object.keys(PALETTES)}>
          <GlassEffects />
          <Aurora />
          <SiteHeader stars={stars} nav={docsNav} />
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  )
}
