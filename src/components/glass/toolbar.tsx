"use client"

import * as React from "react"
import { cn } from "@/lib/glass-cn"
import { allocateToolbarCommands } from "@/lib/glass-toolbar-layout"
import { Slot } from "radix-ui"
import { EllipsisIcon } from "lucide-react"

import { GlassGroup } from "@/components/glass/glass-group"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/glass/dropdown-menu"
import { useScrollMinimized, useScrollOverContent } from "@/components/glass/scroll-edge"
import { useGlassPointer } from "@/hooks/use-glass-pointer"

/**
 * A floating toolbar on the control layer: groups of buttons that share one liquid
 * capsule, spacers between them, a title, an overflow menu and a standalone
 * prominent action — Apple's `.toolbar` for the web.
 *
 *   <Toolbar placement="top" aria-label="Entry">
 *     <ToolbarGroup>
 *       <ToolbarItem aria-label="Back"><ChevronLeftIcon /></ToolbarItem>
 *     </ToolbarGroup>
 *     <ToolbarSpacer />
 *     <ToolbarTitle>Tonight</ToolbarTitle>
 *     <ToolbarSpacer />
 *     <ToolbarGroup>
 *       <ToolbarItem aria-label="Share"><ShareIcon /></ToolbarItem>
 *       <ToolbarOverflow>…DropdownMenuItems…</ToolbarOverflow>
 *     </ToolbarGroup>
 *     <ToolbarItem prominent aria-label="Done"><CheckIcon /></ToolbarItem>
 *   </Toolbar>
 *
 * Fixed at the top or bottom, it sets `--toolbar-inset-top` / `--toolbar-inset-bottom`
 * on <html> so content can pad itself clear. Arrow keys move between items.
 */

const focusable = 'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Arrow keys / Home / End move focus between the toolbar's controls (mirrored in RTL). */
function onToolbarKeyDown(e: React.KeyboardEvent<HTMLElement>) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return
  if (e.target instanceof HTMLInputElement) return
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(focusable)).filter(item => !item.closest("[data-toolbar-measure]"))
  const i = items.indexOf(document.activeElement as HTMLElement)
  if (i < 0) return
  const rtl = getComputedStyle(e.currentTarget).direction === "rtl"
  const step = e.key === "ArrowRight" ? (rtl ? -1 : 1) : e.key === "ArrowLeft" ? (rtl ? 1 : -1) : 0
  const next = e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : (i + step + items.length) % items.length
  items[next]?.focus()
  e.preventDefault()
}

function useToolbarInset(ref: React.RefObject<HTMLElement | null>, edge: "top" | "bottom" | null) {
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el || !edge) return
    const root = document.documentElement
    const name = `--toolbar-inset-${edge}`
    let value = ""
    const update = () => {
      value = `calc(${el.offsetHeight}px + max(0.75rem, env(safe-area-inset-${edge})))`
      root.style.setProperty(name, value)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => {
      observer.disconnect()
      if (root.style.getPropertyValue(name) === value) root.style.removeProperty(name)
    }
  }, [ref, edge])
}

type ToolbarProps = React.ComponentProps<"div"> & {
  /** `top` / `bottom` float fixed over the page; `sticky-top` / `sticky-bottom` stick inside a scroll container; `static` sits in flow. */
  placement?: "top" | "bottom" | "sticky-top" | "sticky-bottom" | "static"
  /** `onScrollDown` shrinks the toolbar while the content scrolls down; it returns on scroll up, hover or focus. */
  minimize?: "never" | "onScrollDown"
}

function Toolbar({ className, placement = "top", minimize = "never", onKeyDown, ref: forwardedRef, children, ...props }: ToolbarProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement)
  const edge = placement === "static" ? null : placement.endsWith("top") ? "top" : "bottom"
  useToolbarInset(ref, placement === "top" || placement === "bottom" ? edge : null)
  const minimized = useScrollMinimized(ref, minimize === "onScrollDown")
  const over = useScrollOverContent(ref, edge)
  return (
    <div
      ref={ref}
      role="toolbar"
      aria-orientation="horizontal"
      data-slot="toolbar"
      data-placement={placement}
      data-bar-edge={edge ?? undefined}
      data-minimized={minimized ? "" : undefined}
      data-over-content={over ? "" : undefined}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        if (!e.defaultPrevented) onToolbarKeyDown(e)
      }}
      className={cn(
        "group/toolbar pointer-events-none isolate z-40 flex items-center gap-2 px-3 *:pointer-events-auto",
        "data-[placement=bottom]:fixed data-[placement=top]:fixed data-[placement=bottom]:inset-x-0 data-[placement=top]:inset-x-0 data-[placement=top]:top-[max(0.75rem,env(safe-area-inset-top))] data-[placement=bottom]:bottom-[max(0.75rem,env(safe-area-inset-bottom))]",
        "data-[placement=sticky-bottom]:sticky data-[placement=sticky-top]:sticky data-[placement=sticky-top]:top-3 data-[placement=sticky-bottom]:bottom-3",
        "origin-top transition-transform duration-(--glass-duration) ease-glass data-[bar-edge=bottom]:origin-bottom data-minimized:scale-90 data-minimized:hover:scale-100 data-minimized:focus-within:scale-100 motion-reduce:transition-none",
        className
      )}
      {...props}
    >
      {edge ? (
        <div aria-hidden data-slot="toolbar-backdrop" style={{ pointerEvents: "none" }} className="absolute inset-x-0 -z-10 h-[calc(100%+2.25rem)] opacity-0 transition-opacity duration-(--glass-duration) ease-glass group-data-over-content/toolbar:opacity-100 group-data-[bar-edge=top]/toolbar:-top-3 group-data-[bar-edge=bottom]/toolbar:-bottom-3 group-data-[bar-edge=bottom]/toolbar:[--glass-scroll-edge-to:top]">
          <div className="size-full scroll-edge-automatic" />
        </div>
      ) : null}
      {children}
    </div>
  )
}

/**
 * Items that share one liquid capsule. The buttons inside are transparent — one
 * piece of glass per group, never glass on glass.
 */
function ToolbarGroup({ className, ...props }: React.ComponentProps<typeof GlassGroup>) {
  return <GlassGroup data-slot="toolbar-group" className={cn("glass-light glass-shadow-adaptive", className)} {...props} />
}

/** `flexible` (default) pushes what follows to the far edge; `fixed` is a small gap between groups. */
function ToolbarSpacer({ className, variant = "flexible", ...props }: React.ComponentProps<"div"> & { variant?: "flexible" | "fixed" }) {
  return <div aria-hidden data-slot="toolbar-spacer" data-variant={variant} className={cn("data-[variant=fixed]:w-2 data-[variant=flexible]:flex-1", className)} {...props} />
}

/** The title between the groups: centred, truncating; hidden while minimized. */
function ToolbarTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar-title"
      className={cn("min-w-0 truncate type-glass-heading text-base transition-opacity duration-(--glass-duration) ease-glass group-data-minimized/toolbar:opacity-0", className)}
      {...props}
    />
  )
}

/**
 * A toolbar button. Icon-only by default (give it an aria-label); text grows it into
 * a capsule. Inside a group it is transparent with a fill on hover. `prominent`
 * is the standalone tinted action (Done, Send) — put it outside any group.
 */
function ToolbarItem({ className, prominent = false, asChild = false, ref: forwardedRef, ...props }: React.ComponentProps<"button"> & { prominent?: boolean; asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  // the press glow follows the finger
  const ref = useGlassPointer<HTMLButtonElement>({}, forwardedRef)
  return (
    <Comp
      ref={ref}
      data-slot="toolbar-item"
      data-prominent={prominent ? "" : undefined}
      type={asChild ? undefined : "button"}
      className={cn(
        "glass-focus hit-area inline-flex h-control min-w-control shrink-0 items-center justify-center gap-1.5 rounded-button px-2 text-sm font-medium whitespace-nowrap text-foreground transition-[background-color,transform] duration-(--glass-duration) ease-glass hover:bg-fill active:scale-(--glass-press-scale) disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5",
        "data-prominent:glass-prominent data-prominent:glass-illuminate data-prominent:glass-press-liquid data-prominent:glass-shadow-adaptive data-prominent:h-control-lg data-prominent:min-w-control-lg data-prominent:text-primary-foreground data-prominent:hover:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

/** "More": the items that don't fit, in a glass menu. Children are DropdownMenu items. */
function ToolbarOverflow({ children, label = "More", align = "end", className }: { children: React.ReactNode; label?: string; align?: "start" | "center" | "end"; className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ToolbarItem aria-label={label} data-slot="toolbar-overflow" className={className}>
          <EllipsisIcon />
        </ToolbarItem>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}

export type ToolbarCommand = {
  id: string
  label: string
  icon?: React.ReactNode
  onSelect: () => void
  priority?: number
  pinned?: boolean
  disabled?: boolean
  overflow?: "auto" | "always"
}

/** Measures every command independently of its current placement, including scaled text. */
function ToolbarCommands({ commands, overflowLabel = "More actions", className, onKeyDown, ...props }: React.ComponentProps<"div"> & { commands: readonly ToolbarCommand[]; overflowLabel?: string }) {
  const root = React.useRef<HTMLDivElement>(null)
  const [geometry, setGeometry] = React.useState({ width: 0, widths: {} as Record<string, number>, overflowWidth: 40, gap: 2, padding: 8, groupGap: 8 })
  const [open, setOpen] = React.useState(false)
  const focused = React.useRef<string | null>(null)
  React.useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const update = () => {
      const widths: Record<string, number> = {}
      el.querySelectorAll<HTMLElement>("[data-measure-id], [data-measure-overflow]").forEach(item => { if (item.dataset.measureId) widths[item.dataset.measureId] = item.getBoundingClientRect().width })
      const css = getComputedStyle(el)
      const measured = getComputedStyle(el.querySelector<HTMLElement>("[data-toolbar-measure-items]")!)
      const scale = el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1
      const px = (value: string, fallback = 0) => (parseFloat(value) || fallback) * scale
      const next = { width: el.getBoundingClientRect().width - px(css.paddingLeft) - px(css.paddingRight) - px(css.borderLeftWidth) - px(css.borderRightWidth), widths, overflowWidth: el.querySelector<HTMLElement>("[data-measure-overflow]")?.getBoundingClientRect().width ?? 40, gap: px(measured.columnGap, 2), padding: px(measured.paddingLeft, 4) + px(measured.paddingRight, 4), groupGap: px(css.columnGap, 8) }
      setGeometry(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    el.querySelectorAll<HTMLElement>("[data-measure-id], [data-measure-overflow]").forEach(item => observer.observe(item))
    return () => observer.disconnect()
  }, [commands])
  const layout = allocateToolbarCommands(commands.map(command => ({ ...command, width: geometry.widths[command.id] ?? 0 })), geometry.width, geometry)
  const overflowKey = layout.overflow.join("\0")
  React.useLayoutEffect(() => {
    if (focused.current && layout.overflow.includes(focused.current) && !open) {
      root.current?.querySelector<HTMLButtonElement>('[data-slot="toolbar-overflow"]')?.focus()
      focused.current = null
    }
  }, [overflowKey, layout.overflow, open])
  const activate = (id: string) => {
    const command = commands.find(item => item.id === id)
    if (command && !command.disabled) command.onSelect()
  }
  const renderCommand = (id: string) => {
    const command = commands.find(item => item.id === id)!
    // iOS bar items show a symbol or a word, not both; the overflow menu spells the label out
    return <ToolbarItem key={id} data-command-id={id} aria-label={command.label} disabled={command.disabled} onClick={() => activate(id)}>{command.icon ?? command.label}</ToolbarItem>
  }
  return <div ref={root} data-slot="toolbar-commands" role="toolbar" aria-orientation="horizontal" className={cn("relative flex w-full min-w-0 items-center gap-2", className)} onFocusCapture={event => { focused.current = (event.target as HTMLElement).dataset.commandId ?? null }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) focused.current = null }} onKeyDown={event => { onKeyDown?.(event); if (!event.defaultPrevented) onToolbarKeyDown(event) }} {...props}>
    <div data-toolbar-measure aria-hidden inert className="pointer-events-none invisible absolute inset-0 overflow-hidden"><div data-toolbar-measure-items className="flex w-max gap-0.5 p-1">
      {commands.map(command => <ToolbarItem key={command.id} data-measure-id={command.id} tabIndex={-1}>{command.icon ?? command.label}</ToolbarItem>)}
      <ToolbarItem data-measure-overflow tabIndex={-1}><EllipsisIcon /></ToolbarItem>
    </div></div>
    {layout.visible.length > 0 || layout.overflow.length > 0 ? <ToolbarGroup className="shrink-0">
      {layout.visible.map(renderCommand)}
      {layout.overflow.length ? <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild><ToolbarItem data-slot="toolbar-overflow" aria-label={overflowLabel}><EllipsisIcon /></ToolbarItem></DropdownMenuTrigger>
        <DropdownMenuContent align="end">{layout.overflow.map(id => {
          const command = commands.find(item => item.id === id)!
          return <DropdownMenuItem key={id} disabled={command.disabled} onSelect={() => activate(id)}>{command.label}</DropdownMenuItem>
        })}</DropdownMenuContent>
      </DropdownMenu> : null}
    </ToolbarGroup> : null}
    {layout.pinned.length ? <div data-slot="toolbar-commands-pinned" data-scrolling={layout.scrollPinned || undefined} className={cn("ms-auto min-w-0", layout.scrollPinned && "-my-4 overflow-x-auto overscroll-x-contain py-4")}><ToolbarGroup className="w-max">{layout.pinned.map(renderCommand)}</ToolbarGroup></div> : null}
  </div>
}

export { ToolbarCommands, Toolbar, ToolbarGroup, ToolbarItem, ToolbarOverflow, ToolbarSpacer, ToolbarTitle }
