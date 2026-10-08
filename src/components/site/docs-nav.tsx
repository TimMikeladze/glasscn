"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "cn"

import { GROUPS, docs } from "@/lib/docs"

const GUIDES = [
  { href: "/docs", label: "Introduction" },
  { href: "/docs/installation", label: "Installation" },
  { href: "/docs/theming", label: "Theming" },
  { href: "/docs/native", label: "React Native" },
]

export function DocsNav({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
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
      <div className="flex flex-col gap-0.5">
        <div className="px-3 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Guides</div>
        {GUIDES.map((g) => link(g.href, g.label))}
      </div>
      {GROUPS.map((group) => (
        <div key={group} className="flex flex-col gap-0.5">
          <div className="px-3 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group}</div>
          {docs.filter((d) => d.group === group).map((d) => link(`/docs/${d.slug}`, d.title))}
        </div>
      ))}
    </nav>
  )
}
