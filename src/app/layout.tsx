import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { Aurora } from "@/components/glass/aurora"
import { Providers, paletteScript } from "@/components/site/providers"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { repoStars } from "@/lib/github"
import { rootMetadata } from "@/lib/metadata"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = rootMetadata

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const stars = await repoStars()
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: paletteScript }} />
      </head>
      <body className="type-glass min-h-dvh">
        <Providers>
          <Aurora />
          <SiteHeader stars={stars} />
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  )
}
