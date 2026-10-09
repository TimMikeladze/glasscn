import Link from "next/link"
import { GlobeIcon } from "lucide-react"

import { site } from "@/lib/site"
import { DiscordIcon, GitHubIcon, LinkedInIcon, XIcon } from "./brand-icons"

const socialIcon =
  "transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none"

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-24 flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 pb-28 text-xs text-muted-foreground">
      <span>glasscn — a shadcn registry. Copy it, own it, change it.</span>
      <span className="flex items-center gap-3">
        <a href={site.repository} target="_blank" rel="noreferrer" aria-label="glasscn on GitHub" className={socialIcon}>
          <GitHubIcon className="size-3.5" />
        </a>
        <a href={site.author.twitter} target="_blank" rel="noreferrer" aria-label="Author on X" className={socialIcon}>
          <XIcon className="size-3.5" />
        </a>
        <a href={site.author.linkedin} target="_blank" rel="noreferrer" aria-label="Author on LinkedIn" className={socialIcon}>
          <LinkedInIcon className="size-3.5" />
        </a>
        <a href={site.author.portfolio} target="_blank" rel="noreferrer" aria-label="Portfolio — linesofcode.dev" className={socialIcon}>
          <GlobeIcon className="size-3.5" />
        </a>
        <a href={site.discord} target="_blank" rel="noreferrer" aria-label="Discord" className={socialIcon}>
          <DiscordIcon className="size-3.5" />
        </a>
      </span>
      <span className="flex gap-4">
        <Link href="/docs" className="hover:text-foreground">Docs</Link>
        <Link href="/docs/theming" className="hover:text-foreground">Theming</Link>
        <Link href="/r/registry.json" className="hover:text-foreground">registry.json</Link>
      </span>
    </footer>
  )
}
