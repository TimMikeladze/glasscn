"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * A ground for glass that isn't the aurora: Liquid Glass reads best over real
 * content. Fixed behind the page by default (`fixed inset-0 -z-10`); pass
 * `className="absolute"` to fill a container.
 *
 *   image  a photo, `object-fit: cover` at `position`. `dim` lays a scrim over it
 *          (0.35 is Apple's for clear glass) so text on glass stays legible.
 *   video  muted, inline, looping, with a `poster`; paused (on the poster) under
 *          reduced motion and while off screen.
 *   mesh   a soft four-point mesh from the palette (`--chart-*`, `--aurora-base`).
 *   noise  the aurora base with a fine grain — a quiet ground for dense screens.
 */
function Backdrop({
  variant = "mesh",
  src,
  poster,
  alt = "",
  position = "center",
  dim = 0,
  className,
  style,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  variant?: "image" | "video" | "mesh" | "noise"
  /** The image or video URL (image, video). */
  src?: string
  /** The still shown before the video plays, and under reduced motion. */
  poster?: string
  /** For an image that carries meaning; decorative (empty) by default. */
  alt?: string
  /** `object-position` for image and video. */
  position?: string
  /** A scrim over the media, 0–1. */
  dim?: number
}) {
  const video = React.useRef<HTMLVideoElement>(null)
  // reduced motion and off screen hold the video on its poster
  React.useEffect(() => {
    const el = video.current
    if (!el || variant !== "video") return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    let visible = true
    const sync = () => {
      if (reduce.matches || !visible) el.pause()
      else void el.play().catch(() => {})
    }
    sync()
    reduce.addEventListener("change", sync)
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver((entries) => {
            visible = entries[entries.length - 1].isIntersecting
            sync()
          })
    observer?.observe(el)
    return () => {
      reduce.removeEventListener("change", sync)
      observer?.disconnect()
    }
  }, [variant])

  const media = "absolute inset-0 size-full object-cover"
  return (
    <div
      data-slot="backdrop"
      data-variant={variant}
      aria-hidden={alt ? undefined : true}
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-aurora-base", className)}
      style={style}
      {...props}
    >
      {variant === "image" && src ? (
        // a plain img: the ground can be any URL, and next/image isn't available in every app
        // eslint-disable-next-line @next/next/no-img-element
        <img data-slot="backdrop-media" src={src} alt={alt} className={media} style={{ objectPosition: position }} decoding="async" />
      ) : null}
      {variant === "video" && src ? (
        <video
          ref={video}
          data-slot="backdrop-media"
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          className={media}
          style={{ objectPosition: position }}
        />
      ) : null}
      {variant === "mesh" ? (
        <div
          data-slot="backdrop-mesh"
          className="absolute inset-0"
          style={{
            backgroundImage: [
              "radial-gradient(at 12% 18%, var(--chart-1) 0, transparent 55%)",
              "radial-gradient(at 88% 12%, var(--chart-2) 0, transparent 50%)",
              "radial-gradient(at 78% 86%, var(--chart-3) 0, transparent 55%)",
              "radial-gradient(at 18% 92%, var(--chart-5) 0, transparent 50%)",
            ].join(","),
            opacity: "var(--aurora-opacity, 100%)",
          }}
        />
      ) : null}
      {variant === "noise" ? (
        <svg data-slot="backdrop-noise" className="absolute inset-0 size-full opacity-[0.14] mix-blend-overlay" aria-hidden>
          <filter id="glass-backdrop-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#glass-backdrop-noise)" />
        </svg>
      ) : null}
      {dim > 0 ? <div data-slot="backdrop-dim" className="absolute inset-0" style={{ background: `color-mix(in oklch, oklch(0 0 0) ${Math.round(Math.min(1, dim) * 100)}%, transparent)` }} /> : null}
    </div>
  )
}

export { Backdrop }
