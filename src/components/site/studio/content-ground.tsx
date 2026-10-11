import * as React from "react"
import { cn } from "cn"

/** A stand-in photo painted from the theme's chart colours, so it changes with the palette. */
const photo = (sky: number, sun: number, hill: number, at: number): React.CSSProperties => ({
  background: [
    `radial-gradient(circle at ${at}% 30%, color-mix(in oklch, var(--chart-${sun}) 70%, white) 0 8%, transparent 8.5%)`,
    `radial-gradient(ellipse 90% 55% at ${100 - at}% 100%, color-mix(in oklch, var(--chart-${hill}) 70%, black) 0 99%, transparent 100%)`,
    `radial-gradient(ellipse 80% 45% at ${at}% 104%, color-mix(in oklch, var(--chart-${hill}) 88%, black) 0 99%, transparent 100%)`,
    `linear-gradient(to bottom, color-mix(in oklch, var(--chart-${sky}) 80%, white), var(--chart-${sun}))`,
  ].join(", "),
})

const TILES: [number, number, number, number, string][] = [
  [5, 3, 4, 70, "row-span-2"],
  [2, 1, 4, 30, ""],
  [1, 3, 5, 40, "row-span-2"],
  [4, 2, 1, 60, ""],
  [5, 3, 2, 75, ""],
  [2, 3, 5, 55, "row-span-2"],
  [3, 5, 2, 25, ""],
  [1, 4, 3, 65, ""],
]

const LINES = [
  "Up before the light again. The tide was out far enough to walk to the rocks, and the wind dropped just as the sun cleared the dunes.",
  "Wrote three pages at the café by the harbour. Kept the promise to stop at nine.",
  "Tomorrow: the lighthouse path, and no phone until noon. Breathe twice before engaging.",
]

/**
 * The studio's "content" ground: an opaque page of photos and text instead of the aurora —
 * what Liquid Glass is meant to float over. Fills its positioned parent (clipped).
 */
export function ContentGround({ className }: { className?: string }) {
  return (
    <div aria-hidden data-slot="content-ground" className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-aurora-base", className)}>
      <div className="grid auto-rows-[7rem] grid-cols-3 gap-2 p-2 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 4 }, (_, block) =>
          TILES.map(([sky, sun, hill, at, span], i) =>
            i === 3 ? (
              <p key={`${block}-${i}`} className="col-span-2 p-3 text-sm leading-relaxed text-foreground">
                {LINES[block % LINES.length]}
              </p>
            ) : (
              <div key={`${block}-${i}`} className={cn("rounded-control", span)} style={photo(sky, sun, hill, (at + block * 17) % 90)} />
            )
          )
        )}
      </div>
    </div>
  )
}
