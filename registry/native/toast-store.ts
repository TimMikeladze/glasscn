import type * as React from "react"

/**
 * The toast queue behind `toast()` / `<Toaster />` — plain functions over an array and
 * a tiny subscribable store, no React Native, so it unit-tests in node.
 */

export type ToastType = "default" | "success" | "info" | "warning" | "error" | "loading"
export type ToastOptions = {
  id?: string | number
  description?: React.ReactNode
  /** One button on the toast; pressing it dismisses the toast. */
  action?: { label: string; onClick: () => void }
  /** ms before it leaves on its own; Infinity keeps it. Loading toasts stay until updated. */
  duration?: number
  onDismiss?: () => void
}
export type Toast = ToastOptions & { id: string | number; title: React.ReactNode; type: ToastType; closing: boolean }

/** Add a toast on top, or replace the one with the same id in place (a loading toast turning into success). */
export function upsertToast(list: Toast[], toast: Toast): Toast[] {
  return list.some((t) => t.id === toast.id) ? list.map((t) => (t.id === toast.id ? toast : t)) : [toast, ...list]
}

/** Mark one toast (or all, without an id) as leaving; the Toaster removes it after its exit. */
export function closeToasts(list: Toast[], id?: string | number): Toast[] {
  return list.map((t) => (id === undefined || t.id === id ? { ...t, closing: true } : t))
}

export function removeToast(list: Toast[], id: string | number): Toast[] {
  return list.filter((t) => t.id !== id)
}

/** How long a toast stays: its own duration, the Toaster's default, forever while loading. */
export function toastDuration(t: Pick<Toast, "duration" | "type">, fallback: number) {
  return t.duration ?? (t.type === "loading" ? Infinity : fallback)
}

export function createToastStore() {
  let toasts: Toast[] = []
  let seq = 0
  const listeners = new Set<() => void>()
  const set = (next: Toast[]) => {
    toasts = next
    listeners.forEach((l) => l())
  }
  return {
    get: () => toasts,
    subscribe: (l: () => void) => {
      listeners.add(l)
      return () => {
        listeners.delete(l)
      }
    },
    show(type: ToastType, title: React.ReactNode, options: ToastOptions = {}) {
      const id = options.id ?? ++seq
      set(upsertToast(toasts, { ...options, id, title, type, closing: false }))
      return id
    },
    dismiss: (id?: string | number) => set(closeToasts(toasts, id)),
    remove: (id: string | number) => set(removeToast(toasts, id)),
    clear: () => set([]),
  }
}

/** The app's one queue. */
export const toastStore = createToastStore()
