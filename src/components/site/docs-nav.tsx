"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "cn"

import type { NavSection } from "./docs-nav-data"

/** The docs sidebar. `sections` comes from `docsNav`, built on the server. */
export function DocsNav({ sections, className, onNavigate }: { sections: NavSection[]; className?: string; onNavigate?: () => void }) {
  const pathname = usePathname()
  const link = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      onClick={onNavigate}
      className={cn(
        "block rounded-xl px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-fill hover:text-foreground",
        pathname === href && "bg-fill-strong font-medium text-foreground"
      )}
    >
      {label}
    </Link>
  )
  return (
    <nav className={cn("flex flex-col gap-5", className)} aria-label="Docs">
      {sections.map((section) => (
        <div key={section.label} className="flex flex-col gap-0.5">
          <div className="px-3 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{section.label}</div>
          {section.links.map((l) => link(l.href, l.label))}
        </div>
      ))}
    </nav>
  )
}
