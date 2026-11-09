"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { cn } from "@/lib/glass-cn"
import { MenuIcon, MoonIcon, PaletteIcon, SlidersHorizontalIcon, StarIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/glass/button"
import { GlassPreferences } from "@/components/glass/glass-preferences"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/glass/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/glass/popover"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/glass/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/glass/tooltip"
import { site } from "@/lib/site"
import { formatStars } from "@/lib/format-stars"
import { GitHubIcon, LinkedInIcon, XIcon } from "./brand-icons"
import { Logo } from "./logo"
import { usePalette, type Palette } from "./providers"
import { DocsNav } from "./docs-nav"
import type { NavSection } from "./docs-nav-data"

const NAV = [
  { href: "/showcase", label: "Showcase" },
  { href: "/docs", label: "Docs" },
  { href: "/docs/button", label: "Components" },
  { href: "/themes", label: "Studio" },
  { href: "/docs/theming", label: "Theming" },
  { href: "/docs/native", label: "Native" },
]

// Every trailing control is the same 32px circle with a 16px glyph in the same tone.
const headerIcon = "size-8 text-foreground/70 hover:text-foreground"
// The header collapses by its own width in rem, so enlarged text (which grows every part) collapses it
// too (content-box widths): nav 59rem, social links 29rem, Get started 22rem, palette and glass 15rem, wordmark 11rem
const socialLink =
  "glass-focus hidden h-8 min-w-8 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-fill hover:text-foreground @min-[29rem]/header:inline-flex [&_svg]:size-4"

export function PaletteSwatch({ palette, className }: { palette: Palette; className?: string }) {
  return (
    <span
      data-palette-swatch={palette}
      className={cn("inline-block size-4 rounded-full border border-glass-border", className)}
      style={{ background: `var(--swatch-${palette})` }}
    />
  )
}

export function SiteHeader({ stars, nav }: { stars: number | null; nav: NavSection[] }) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const { palette, setPalette, palettes } = usePalette()
  const [menu, setMenu] = React.useState(false)
  return (
    <header className="sticky top-0 z-40 min-w-0 w-full px-3 pt-3">
      <div className="glass-strong @container/header mx-auto flex h-14 min-w-0 w-full max-w-6xl items-center gap-2 rounded-full pr-2 pl-4">
        <Sheet open={menu} onOpenChange={setMenu}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="@min-[59rem]/header:hidden" aria-label="Menu">
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>glasscn</SheetTitle>
            </SheetHeader>
            <div className="px-3 pb-6">
              <nav aria-label="Site navigation" className="mb-5 grid gap-1 border-b border-glass-border pb-4">
                {NAV.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenu(false)} className="glass-focus rounded-control px-pad-sm py-2 text-sm font-medium hover:bg-fill">{item.label}</Link>)}
              </nav>
              {/* palette and glass leave the bar first when it's narrow, so they're here too */}
              <section aria-label="Palette" className="mb-5 border-b border-glass-border pb-4">
                <p className="mb-2 px-pad-sm text-xs font-medium text-muted-foreground">Palette</p>
                <div className="grid grid-cols-2 gap-1">
                  {palettes.map((p) => <Button key={p} variant={palette === p ? "secondary" : "ghost"} size="sm" aria-pressed={palette === p} className="justify-start capitalize" onClick={() => setPalette(p as Palette)}><PaletteSwatch palette={p} />{p}</Button>)}
                </div>
              </section>
              <section aria-label="Glass" className="mb-5 grid gap-3 border-b border-glass-border pb-4 px-pad-sm">
                <p className="text-xs font-medium text-muted-foreground">Glass</p>
                <GlassPreferences />
              </section>
              <DocsNav sections={nav} onNavigate={() => setMenu(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/" aria-label="glasscn" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <Logo className="shrink-0" />
          <span className="hidden @min-[11rem]/header:inline">glasscn</span>
        </Link>
        <nav aria-label="Primary navigation" className="ml-4 hidden shrink-0 items-center gap-1 @min-[59rem]/header:flex">
          {NAV.map((n) => {
            const on = n.href === "/docs" ? pathname === "/docs" || pathname === "/docs/installation" : pathname.startsWith(n.href)
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn("rounded-full px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-fill hover:text-foreground", on && "bg-fill text-foreground")}
              >
                {n.label}
              </Link>
            )
          })}
        </nav>
        <div className="ml-auto flex shrink-0 items-center">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className={cn(headerIcon, "hidden @min-[15rem]/header:inline-flex")} aria-label="Palette">
                    <PaletteIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Palette</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="max-h-96 w-44">
              <DropdownMenuLabel>Palette</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={palette} onValueChange={(v) => setPalette(v as Palette)}>
                {palettes.map((p) => (
                  <DropdownMenuRadioItem key={p} value={p} className="capitalize">
                    <PaletteSwatch palette={p} />
                    {p}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className={cn(headerIcon, "hidden @min-[15rem]/header:inline-flex")} aria-label="Glass preferences">
                    <SlidersHorizontalIcon className="size-[17.5px]" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Glass</TooltipContent>
            </Tooltip>
            <PopoverContent align="end" className="w-72 gap-4">
              <div className="grid gap-1">
                <p className="type-glass-heading text-sm">Glass</p>
                <p className="text-xs text-muted-foreground">How much the page shows through, for you — like iOS 27&rsquo;s Liquid Glass setting.</p>
              </div>
              <GlassPreferences />
            </PopoverContent>
          </Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" className={headerIcon} aria-label="Toggle dark mode" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
                <SunIcon className="hidden size-4 dark:block" />
                <MoonIcon className="size-4 dark:hidden" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Light / dark</TooltipContent>
          </Tooltip>
          <a
            href={site.repository}
            target="_blank"
            rel="noreferrer"
            aria-label={stars ? `glasscn on GitHub — ${stars} stars` : "glasscn on GitHub"}
            className={cn(socialLink, stars ? "gap-1 px-2" : null)}
          >
            {/* brand marks fill their box; lucide glyphs leave ~2px, so each mark is sized to the same ~14.7px of ink */}
            <GitHubIcon className="size-[15px]!" />
            {/* Omitted when unknown or zero — a lone "0" reads as broken, not humble. */}
            {stars ? (
              <span className="flex items-center gap-1 text-xs font-medium tabular-nums">
                <StarIcon className="size-3! fill-current opacity-70" aria-hidden />
                {formatStars(stars)}
              </span>
            ) : null}
          </a>
          <a href={site.author.twitter} target="_blank" rel="noreferrer" aria-label="Author on X" className={socialLink}>
            <XIcon className="size-[18px]!" />
          </a>
          <a href={site.author.linkedin} target="_blank" rel="noreferrer" aria-label="Author on LinkedIn" className={socialLink}>
            <LinkedInIcon className="size-[17.5px]!" />
          </a>
          <Button asChild size="sm" className="ml-2 hidden @min-[22rem]/header:inline-flex">
            <Link href="/docs/installation">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
