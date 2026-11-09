"use client"

import * as React from "react"
import { Portal as PortalPrimitive } from "radix-ui"

const GlassScopeContext = React.createContext<string | null>(null)

/** A server-rendered ThemeScope supplies its DOM identity to portaled descendants. */
export function GlassScopeProvider({ scope, children }: { scope: string; children: React.ReactNode }) {
  return <GlassScopeContext.Provider value={scope}>{children}</GlassScopeContext.Provider>
}

const themeProperty = /^--(?:glass-|aurora-|chart-|font-|sidebar-|primary(?:-|$)|foreground$|background$|card(?:-|$)|popover(?:-|$)|muted(?:-|$)|accent(?:-|$)|secondary(?:-|$)|destructive(?:-|$)|border$|input$|ring$|success(?:-|$)|warning(?:-|$)|info(?:-|$))/

/** Preserve the source scope without putting fixed overlays inside a clipping/transform ancestor. */
type PortalContainer = React.ComponentProps<typeof PortalPrimitive.Root>["container"]

export function GlassPortal({ container, children }: { container?: PortalContainer; children: (container: Exclude<PortalContainer, null>) => React.ReactNode }) {
  const scope = React.useContext(GlassScopeContext)
  const [host, setHost] = React.useState<HTMLDivElement | null>(null)
  const hostRef = React.useRef<HTMLDivElement | null>(null)
  const attachHost = React.useCallback((element: HTMLDivElement | null) => { hostRef.current = element; setHost(element) }, [])

  React.useLayoutEffect(() => {
    const target = hostRef.current
    if (!scope || !target) return
    const source = document.querySelector<HTMLElement>(`[data-glass-scope="${scope}"]`)
    if (!source) return
    const copied = new Set<string>()
    const sync = () => {
      const computed = getComputedStyle(source)
      const next = new Set<string>()
      for (let i = 0; i < computed.length; i++) {
        const name = computed.item(i)
        if (!themeProperty.test(name)) continue
        const value = computed.getPropertyValue(name).trim()
        if (!value) continue
        next.add(name)
        if (target.style.getPropertyValue(name) !== value) target.style.setProperty(name, value)
      }
      for (const name of copied) if (!next.has(name)) target.style.removeProperty(name)
      copied.clear()
      for (const name of next) copied.add(name)
      const scheme = source.closest(".light,.dark")?.classList.contains("dark") ? "dark" : "light"
      target.className = `type-glass ${scheme}`
      target.style.colorScheme = computed.colorScheme || scheme
      target.style.direction = computed.direction
      target.style.color = computed.color
    }
    sync()
    let frame = 0
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; sync() })
    }
    const observer = new MutationObserver((records) => {
      if (records.some((record) => record.type === "attributes" && (record.target === source || source.contains(record.target) === false)
        || (record.target instanceof Element ? record.target : record.target.parentElement)?.closest("style")
        || [...record.addedNodes, ...record.removedNodes].some((node) => node instanceof Element && (node.matches("style,link[rel=stylesheet]") || node.querySelector("style,link[rel=stylesheet]"))))) schedule()
    })
    // Inline variables, scoped <style> text and the page's palette/scheme can change live.
    observer.observe(source, { attributes: true, subtree: true, childList: true, characterData: true })
    observer.observe(document.head, { subtree: true, childList: true, characterData: true })
    for (let ancestor = source.parentElement; ancestor; ancestor = ancestor.parentElement) observer.observe(ancestor, { attributes: true })
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [scope, host])

  if (!scope) return children(container ?? undefined)
  return (
    <PortalPrimitive.Root container={container} asChild>
      <div ref={attachHost} data-slot="glass-portal" data-glass-portal={scope} data-glass-scope="" style={{ display: "contents" }}>
        {host ? children(host) : null}
      </div>
    </PortalPrimitive.Root>
  )
}
