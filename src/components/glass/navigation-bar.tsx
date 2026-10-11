"use client"

import * as React from "react"
import { cn } from "cn"

import { scrollParent } from "@/components/glass/scroll-edge"

/**
 * iOS's navigation bar: a large title that scrolls away with the content and hands
 * over to a small inline title in the bar. The bar itself is not glass — its buttons
 * are (put Buttons with `variant="glass"` or a ToolbarGroup in the slots) — and once
 * content is under it, a scroll-edge band keeps the title legible.
 *
 *   <NavigationBar title="Journal">
 *     <NavigationBarLeading>…</NavigationBarLeading>
 *     <NavigationBarTrailing>…</NavigationBarTrailing>
 *   </NavigationBar>
 *   …content…
 *
 * The large title is the page's `h1`; the inline copy is hidden from assistive tech.
 */

function NavigationBar({
  className,
  title,
  titleDisplayMode = "large",
  subtitle,
  children,
  ...props
}: Omit<React.ComponentProps<"header">, "title"> & {
  title: React.ReactNode
  /** `large` starts with a big title under the bar; `inline` keeps it small in the bar. */
  titleDisplayMode?: "large" | "inline"
  /** A line under the large title (a date, a count). */
  subtitle?: React.ReactNode
}) {
  const large = React.useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = React.useState(titleDisplayMode === "inline")
  React.useEffect(() => {
    const el = large.current
    if (!el || typeof IntersectionObserver === "undefined") return
    // collapsed once the large title has passed under the bar
    const observer = new IntersectionObserver(([entry]) => setCollapsed(!entry.isIntersecting), { root: scrollParent(el), rootMargin: "-56px 0px 0px 0px" })
    observer.observe(el)
    return () => observer.disconnect()
  }, [titleDisplayMode])
  const inline = titleDisplayMode === "inline"
  return (
    <>
      <header
        data-slot="navigation-bar"
        data-collapsed={collapsed ? "" : undefined}
        data-bar-edge="top"
        data-over-content={collapsed ? "" : undefined}
        className={cn(
          "sticky top-0 isolate z-30 grid h-[calc(3.5rem*var(--glass-density))] grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 pt-[env(safe-area-inset-top)]",
          className
        )}
        {...props}
      >
        {/* the scroll edge under the bar once content is beneath it (the utility sets its own position, so it sits on a child) */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[calc(100%+1.5rem)] opacity-0 transition-opacity duration-(--glass-duration) ease-glass in-data-over-content:opacity-100">
          <div className="size-full scroll-edge-soft" />
        </div>
        {children}
        <div
          data-slot="navigation-bar-title"
          aria-hidden={!inline}
          role={inline ? "heading" : undefined}
          aria-level={inline ? 1 : undefined}
          className="col-start-2 row-start-1 min-w-0 truncate text-center type-glass-heading text-base opacity-0 transition-opacity duration-(--glass-duration) ease-glass in-data-collapsed:opacity-100"
        >
          {title}
        </div>
      </header>
      {inline ? null : (
        <div ref={large} data-slot="navigation-bar-large-title" className="px-4 pt-1 pb-2">
          <h1 className="type-glass-display text-3xl">{title}</h1>
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      )}
    </>
  )
}

/** Back, close, a sidebar toggle — the start of the bar. */
function NavigationBarLeading({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="navigation-bar-leading" className={cn("col-start-1 row-start-1 flex items-center gap-2 justify-self-start", className)} {...props} />
}

/** Actions — the end of the bar. */
function NavigationBarTrailing({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="navigation-bar-trailing" className={cn("col-start-3 row-start-1 flex items-center gap-2 justify-self-end", className)} {...props} />
}

export { NavigationBar, NavigationBarLeading, NavigationBarTrailing }
