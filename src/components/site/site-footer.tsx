import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-24 flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 pb-28 text-xs text-muted-foreground">
      <span>glasscn — a shadcn registry. Copy it, own it, change it.</span>
      <span className="flex gap-4">
        <Link href="/docs" className="hover:text-foreground">Docs</Link>
        <Link href="/docs/theming" className="hover:text-foreground">Theming</Link>
        <Link href="/r/registry.json" className="hover:text-foreground">registry.json</Link>
      </span>
    </footer>
  )
}
