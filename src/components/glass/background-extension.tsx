"use client"

import * as React from "react"
import { cn } from "@/lib/glass-cn"

export type BackgroundExtensionProps = React.ComponentProps<"div"> & {
  src: string
  alt?: string
  /** Image-only extensions beneath leading/trailing chrome, in pixels. */
  start?: number
  end?: number
}

/** Mirror imagery beneath surrounding chrome. Foreground children render once. */
export function BackgroundExtension({ src, alt = "", start = 0, end = 0, className, style, children, ref: forwardedRef, ...props }: BackgroundExtensionProps) {
  const root = React.useRef<HTMLDivElement>(null)
  React.useImperativeHandle(forwardedRef, () => root.current as HTMLDivElement)
  React.useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const update = () => el.style.setProperty("--glass-extension-width", `${el.getBoundingClientRect().width}px`)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const extent = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0
  const mirror = (side: "start" | "end", width: number) => width > 0 ? <div key={side} data-slot="background-extension-mirror" data-side={side} aria-hidden inert className="pointer-events-none absolute inset-y-0 -z-10 overflow-hidden" style={{ width, [side === "start" ? "insetInlineEnd" : "insetInlineStart"]: "100%" }}>
    {/* a light blur: the chrome above is glass and diffuses it again, so a full blur here washes it out */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt="" className="absolute inset-y-0 h-full max-w-none -scale-x-100 object-cover blur-[calc(var(--glass-blur)/3)]" style={{ width: "var(--glass-extension-width)", [side === "start" ? "insetInlineEnd" : "insetInlineStart"]: 0 }} />
  </div> : null
  return <div ref={root} data-slot="background-extension" className={cn("relative isolate w-full", className)} style={{ aspectRatio: "16 / 9", ...style }} {...props}>
    {mirror("start", extent(start))}{mirror("end", extent(end))}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img data-slot="background-extension-image" src={src} alt={alt} className="absolute inset-0 -z-10 size-full object-cover" />
    {children}
  </div>
}
