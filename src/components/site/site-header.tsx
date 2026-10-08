"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { cn } from "cn"
import { MenuIcon, MoonIcon, PaletteIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/glass/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/glass/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/glass/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/glass/tooltip"
import { Logo } from "./logo"
import { PALETTES, usePalette, type Palette } from "./providers"
import { DocsNav } from "./docs-nav"

const NAV = [
  { href: "/docs", label: "Docs" },
  { href: "/docs/button", label: "Components" },
  { href: "/themes", label: "Themes" },
  { href: "/docs/theming", label: "Theming" },
  { href: "/docs/native", label: "Native" },
]

export function PaletteSwatch({ palette, className }: { palette: Palette; className?: string }) {
  return (
    <span
      data-palette-swatch={palette}
      className={cn("inline-block size-4 rounded-full border border-glass-border", className)}
      style={{ background: `var(--swatch-${palette})` }}
    />
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const { palette, setPalette } = usePalette()
  const [menu, setMenu] = React.useState(false)
  return (
    <header className="sticky top-0 z-40 px-3 pt-3">
      <div className="glass-strong mx-auto flex h-14 max-w-6xl items-center gap-2 rounded-full pr-2 pl-4">
        <Sheet open={menu} onOpenChange={setMenu}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Menu">
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>glasscn</SheetTitle>
            </SheetHeader>
            <div className="px-3 pb-6">
              <DocsNav onNavigate={() => setMenu(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Logo />
          glasscn
        </Link>
        <nav className="ml-4 hidden items-center gap-1 md:flex">
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
        <div className="ml-auto flex items-center gap-1">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Palette">
                    <PaletteIcon />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Palette</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="max-h-96 w-44">
              <DropdownMenuLabel>Palette</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={palette} onValueChange={(v) => setPalette(v as Palette)}>
                {PALETTES.map((p) => (
                  <DropdownMenuRadioItem key={p} value={p} className="capitalize">
                    <PaletteSwatch palette={p} />
                    {p}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Toggle dark mode" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
                <SunIcon className="hidden dark:block" />
                <MoonIcon className="dark:hidden" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Light / dark</TooltipContent>
          </Tooltip>
          <Button asChild size="sm" className="ml-1 hidden sm:inline-flex">
            <Link href="/docs/installation">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
