"use client"

import * as React from "react"
import { flushSync } from "react-dom"

type OpenOptions = { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }
type ViewTransition = { finished: Promise<void>; skipTransition?: () => void }
type MorphDocument = Document & { startViewTransition?: (update: () => void) => ViewTransition }

export type GlassMorph = {
  open: boolean
  setOpen: (open: boolean) => void
  morphing: boolean
  setTrigger: (element: HTMLElement | null) => void
  setContent: (element: HTMLElement | null) => void
}

export const GlassMorphContext = React.createContext<GlassMorph | null>(null)

/** Compose a consumer's React 19 ref with the presentation's source/destination ref. */
export function useGlassMorphRef<T extends HTMLElement>(part: "trigger" | "content", forwardedRef?: React.Ref<T>) {
  const morph = React.useContext(GlassMorphContext)
  const set = part === "trigger" ? morph?.setTrigger : morph?.setContent
  const [node, setNode] = React.useState<T | null>(null)
  React.useImperativeHandle(forwardedRef, () => node as T, [node])
  return React.useCallback((element: T | null) => {
    set?.(element)
    setNode(element)
  }, [set])
}

/** One source identity follows a presentation from its trigger to its content and back. */
export function useGlassPresentation({ open: controlled, defaultOpen = false, onOpenChange }: OpenOptions): GlassMorph {
  const [inner, setInner] = React.useState(defaultOpen)
  const [morphing, setMorphing] = React.useState(false)
  const open = controlled ?? inner
  const trigger = React.useRef<HTMLElement | null>(null)
  const content = React.useRef<HTMLElement | null>(null)
  const active = React.useRef<{ transition: ViewTransition; restore: () => void; next: boolean } | null>(null)
  const id = React.useId()
  const name = `glass-presentation-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`
  const setTrigger = React.useCallback((element: HTMLElement | null) => { trigger.current = element }, [])
  const setContent = React.useCallback((element: HTMLElement | null) => { content.current = element }, [])

  React.useEffect(() => () => { active.current?.transition.skipTransition?.(); active.current?.restore(); active.current = null }, [])

  const setOpen = React.useCallback((next: boolean) => {
    if (active.current?.next === next) return
    const apply = () => { if (controlled === undefined) setInner(next); onOpenChange?.(next) }
    const doc = document as MorphDocument
    const from = next ? trigger.current : content.current
    const destination = () => next ? content.current : trigger.current
    if (next === open || !from?.isConnected || !doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) { apply(); return }

    active.current?.transition.skipTransition?.()
    active.current?.restore()
    active.current = null
    const previous = new Map<HTMLElement, { name: string; group: string }>()
    const mark = (element: HTMLElement) => {
      if (!previous.has(element)) previous.set(element, { name: element.style.viewTransitionName, group: element.style.getPropertyValue("view-transition-class") })
      element.style.viewTransitionName = name
      element.style.setProperty("view-transition-class", "glass-presentation")
    }
    const restore = () => {
      for (const [element, value] of previous) {
        if (element.style.viewTransitionName !== name && element.style.viewTransitionName !== value.name) continue
        if (element.style.viewTransitionName === name) element.style.viewTransitionName = value.name
        if (value.group) element.style.setProperty("view-transition-class", value.group)
        else element.style.removeProperty("view-transition-class")
      }
    }
    flushSync(() => setMorphing(true))
    mark(from)
    let transition: ViewTransition
    try {
      transition = doc.startViewTransition(() => {
        from.style.viewTransitionName = previous.get(from)?.name ?? ""
        flushSync(apply)
        const to = destination()
        if (to?.isConnected) mark(to)
      })
    } catch {
      restore()
      setMorphing(false)
      apply()
      return
    }
    active.current = { transition, restore, next }
    void transition.finished.catch(() => {}).finally(() => {
      if (active.current?.transition !== transition) return
      restore()
      active.current = null
      flushSync(() => setMorphing(false))
      // The morph already presented the content. Dropping data-morphing re-enables its CSS entry
      // animation, which would start again from opacity 0 (the menu seemed to open twice);
      // end those animations before the next frame paints.
      // the morph target can sit inside the animated content (the action sheet's choice group)
      const presented = content.current?.closest<HTMLElement>("[data-glass-motion]") ?? content.current
      if (next && typeof presented?.getAnimations === "function") for (const animation of presented.getAnimations({ subtree: true })) {
        if (typeof CSSAnimation !== "undefined" && animation instanceof CSSAnimation && Number.isFinite(animation.effect?.getComputedTiming().endTime ?? Infinity) && (animation.pending || (Number(animation.currentTime) || 0) < 50)) animation.finish()
      }
    })
  }, [controlled, onOpenChange, open, name])

  return React.useMemo(() => ({ open, setOpen, morphing, setTrigger, setContent }), [open, setOpen, morphing, setTrigger, setContent])
}
