"use client"

import * as React from "react"
import { cn } from "cn"
import { Slot } from "radix-ui"
import { PanelLeftIcon } from "lucide-react"

/**
 * The iPadOS / macOS sidebar: a floating, inset panel of liquid glass beside the
 * content, which runs underneath it. Collapsible (the trigger, or ⌘B / Ctrl+B); on
 * narrow screens it opens over the page instead. Two levels at most — a menu and
 * one submenu — as Apple advises.
 *
 *   <SidebarProvider>
 *     <Sidebar>
 *       <SidebarHeader>…</SidebarHeader>
 *       <SidebarContent>
 *         <SidebarGroup>
 *           <SidebarGroupLabel>Library</SidebarGroupLabel>
 *           <SidebarMenu>
 *             <SidebarMenuItem><SidebarMenuButton isActive><BookIcon />Entries</SidebarMenuButton></SidebarMenuItem>
 *           </SidebarMenu>
 *         </SidebarGroup>
 *       </SidebarContent>
 *     </Sidebar>
 *     <SidebarInset>
 *       <BackgroundExtension><img … /></BackgroundExtension>
 *       …
 *     </SidebarInset>
 *   </SidebarProvider>
 */

type SidebarCtx = { open: boolean; setOpen: (open: boolean) => void; mobileOpen: boolean; setMobileOpen: (open: boolean) => void; toggle: () => void }
const SidebarContext = React.createContext<SidebarCtx | null>(null)

function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used inside <SidebarProvider>")
  return ctx
}

const narrow = "(max-width: 767px)"
function subscribeNarrow(onChange: () => void) {
  const mq = window.matchMedia(narrow)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}

function SidebarProvider({
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [inner, setInner] = React.useState(defaultOpen)
  const open = openProp ?? inner
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const isNarrow = React.useSyncExternalStore(subscribeNarrow, () => window.matchMedia(narrow).matches, () => false)
  const setOpen = React.useCallback(
    (next: boolean) => {
      setInner(next)
      onOpenChange?.(next)
    },
    [onOpenChange]
  )
  const toggle = React.useCallback(() => (isNarrow ? setMobileOpen((o) => !o) : setOpen(!open)), [isNarrow, open, setOpen])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toggle])

  const ctx = React.useMemo(() => ({ open, setOpen, mobileOpen, setMobileOpen, toggle }), [open, setOpen, mobileOpen, toggle])
  return (
    <SidebarContext.Provider value={ctx}>
      <div
        data-slot="sidebar-wrapper"
        data-state={open ? "expanded" : "collapsed"}
        style={{ "--sidebar-width": "17rem", ...style } as React.CSSProperties}
        className={cn("group/sidebar-wrapper relative flex min-h-svh w-full", className)}
        {...props}
      />
    </SidebarContext.Provider>
  )
}

/** The floating panel. Inset from the edges; collapses off the start edge (mirrored in RTL). */
function Sidebar({
  className,
  children,
  side = "start",
  position = "fixed",
  ...props
}: React.ComponentProps<"aside"> & { side?: "start" | "end"; /** `absolute` keeps it inside a positioned SidebarProvider (a preview, a pane). */ position?: "fixed" | "absolute" }) {
  const { open, mobileOpen, setMobileOpen } = useSidebar()
  return (
    <>
      {mobileOpen ? (
        <div data-slot="sidebar-backdrop" aria-hidden onClick={() => setMobileOpen(false)} data-position={position} className="fixed inset-0 z-40 bg-glass-dim data-[position=absolute]:absolute md:hidden" />
      ) : null}
      <aside
        data-slot="sidebar"
        data-side={side}
        data-position={position}
        data-state={open ? "expanded" : "collapsed"}
        data-mobile-open={mobileOpen ? "" : undefined}
        aria-label={props["aria-label"] ?? "Sidebar"}
        inert={!open && !mobileOpen ? true : undefined}
        onKeyDown={(e) => {
          if (e.key === "Escape" && mobileOpen) setMobileOpen(false)
        }}
        className={cn(
          "glass-liquid fixed inset-y-3 data-[position=absolute]:absolute z-50 flex w-(--sidebar-width) max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-surface text-sm transition-[translate,opacity] duration-[calc(var(--glass-duration)*1.5)] ease-glass motion-reduce:transition-none",
          "data-[side=start]:start-3 data-[side=end]:end-3",
          // collapsed (wide) or closed (narrow): slide out past its edge
          "data-[side=start]:data-[state=collapsed]:-translate-x-[calc(100%+1rem)] data-[side=end]:data-[state=collapsed]:translate-x-[calc(100%+1rem)] rtl:data-[side=start]:data-[state=collapsed]:translate-x-[calc(100%+1rem)] rtl:data-[side=end]:data-[state=collapsed]:-translate-x-[calc(100%+1rem)] data-[state=collapsed]:opacity-0",
          "max-md:data-[side=start]:not-data-mobile-open:-translate-x-[calc(100%+1rem)] max-md:data-[side=end]:not-data-mobile-open:translate-x-[calc(100%+1rem)] max-md:rtl:data-[side=start]:not-data-mobile-open:translate-x-[calc(100%+1rem)] max-md:not-data-mobile-open:opacity-0 max-md:data-mobile-open:translate-x-0 max-md:data-mobile-open:opacity-100",
          className
        )}
        {...props}
      >
        {children}
      </aside>
    </>
  )
}

/** The content area: clears the open sidebar on wide screens; runs under it otherwise. */
function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "relative min-w-0 flex-1 transition-[padding] duration-[calc(var(--glass-duration)*1.5)] ease-glass motion-reduce:transition-none md:group-data-[state=expanded]/sidebar-wrapper:ps-[calc(var(--sidebar-width)+1.5rem)]",
        className
      )}
      {...props}
    />
  )
}

/**
 * Lets an image (a hero, a map) carry on under the sidebar, mirrored and blurred, so
 * the glass floats over the picture rather than a blank strip — SwiftUI's
 * `backgroundExtensionEffect()`. Wrap the media; the copy is decorative.
 */
function BackgroundExtension({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="background-extension" className={cn("relative isolate", className)} {...props}>
      <div
        aria-hidden
        inert
        data-slot="background-extension-mirror"
        className="pointer-events-none absolute inset-y-0 -start-[calc(var(--sidebar-width)+1.5rem)] -z-10 hidden w-[calc(var(--sidebar-width)+1.5rem)] -scale-x-100 overflow-hidden blur-2xl md:group-data-[state=expanded]/sidebar-wrapper:block *:size-full *:object-cover"
      >
        {children}
      </div>
      {children}
    </div>
  )
}

/** Toggles the sidebar (collapse on wide screens, open over the page on narrow ones). */
function SidebarTrigger({ className, onClick, children, ...props }: React.ComponentProps<"button">) {
  const { open, mobileOpen, toggle } = useSidebar()
  return (
    <button
      type="button"
      data-slot="sidebar-trigger"
      aria-label={props["aria-label"] ?? "Toggle sidebar"}
      aria-expanded={open || mobileOpen}
      onClick={(e) => {
        onClick?.(e)
        toggle()
      }}
      className={cn(
        "glass-liquid glass-illuminate glass-press-liquid glass-focus hit-area inline-flex size-control shrink-0 items-center justify-center rounded-button text-foreground [&_svg:not([class*='size-'])]:size-4.5",
        className
      )}
      {...props}
    >
      {children ?? <PanelLeftIcon className="rtl:-scale-x-100" />}
    </button>
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-header" className={cn("flex shrink-0 items-center gap-2 p-3", className)} {...props} />
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-footer" className={cn("mt-auto flex shrink-0 flex-col gap-2 p-3", className)} {...props} />
}

/** The scrolling middle. */
function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-content" className={cn("flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-2 pb-2", className)} {...props} />
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="group" data-slot="sidebar-group" className={cn("flex flex-col gap-0.5", className)} {...props} />
}

function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-group-label" className={cn("px-pad-sm pt-2 pb-1 text-xs font-semibold text-muted-foreground", className)} {...props} />
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="sidebar-menu" className={cn("flex flex-col gap-0.5", className)} {...props} />
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-item" className={cn("flex flex-col", className)} {...props} />
}

const menuButton =
  "glass-focus-inset flex h-control w-full min-w-0 items-center gap-2.5 rounded-control px-pad-sm text-start text-sm text-foreground transition-colors duration-(--glass-duration) ease-glass hover:bg-fill data-active:bg-fill-strong data-active:font-semibold data-active:text-primary-ink [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5 [&>span:last-child]:truncate"

/** A row. `isActive` marks the current destination (aria-current). Use asChild for router links. */
function SidebarMenuButton({ className, isActive = false, asChild = false, ...props }: React.ComponentProps<"button"> & { isActive?: boolean; asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="sidebar-menu-button"
      data-active={isActive ? "" : undefined}
      aria-current={isActive ? "page" : undefined}
      type={asChild ? undefined : "button"}
      className={cn(menuButton, className)}
      {...props}
    />
  )
}

/** A trailing count or value on a row. */
function SidebarMenuBadge({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="sidebar-menu-badge" className={cn("ms-auto text-xs text-muted-foreground numeric-glass", className)} {...props} />
}

/** The second (and last) level, indented under its row. */
function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="sidebar-menu-sub" className={cn("ms-5 flex flex-col gap-0.5 border-s border-separator ps-2", className)} {...props} />
}

function SidebarMenuSubItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-sub-item" className={cn(className)} {...props} />
}

function SidebarMenuSubButton({ className, isActive = false, asChild = false, ...props }: React.ComponentProps<"a"> & { isActive?: boolean; asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-active={isActive ? "" : undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(menuButton, "h-control-sm", className)}
      {...props}
    />
  )
}

export {
  BackgroundExtension,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}
