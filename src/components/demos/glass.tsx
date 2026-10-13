"use client"

import * as React from "react"
import { BookOpenIcon, BookmarkIcon, ChevronLeftIcon, ImageIcon, PauseIcon, PenIcon, PlayIcon, SearchIcon, ShareIcon, Volume2Icon, XIcon } from "lucide-react"

import { Button } from "@/components/glass/button"
import { Dock, DockAction, DockBar, DockItem } from "@/components/glass/dock"
import { Glass } from "@/components/glass/glass"

/** A stand-in photo: sky, sun and two hills, painted from the palette's chart colours. */
const photo = (sky: number, sun: number, hill: number, at = 70): React.CSSProperties => ({
  background: [
    `radial-gradient(circle at ${at}% 32%, color-mix(in oklch, var(--chart-${sun}) 70%, white) 0 9%, transparent 9.5%)`,
    `radial-gradient(ellipse 90% 55% at ${100 - at}% 100%, color-mix(in oklch, var(--chart-${hill}) 70%, black) 0 99%, transparent 100%)`,
    `radial-gradient(ellipse 80% 45% at ${at}% 104%, color-mix(in oklch, var(--chart-${hill}) 88%, black) 0 99%, transparent 100%)`,
    `linear-gradient(to bottom, color-mix(in oklch, var(--chart-${sky}) 80%, white), var(--chart-${sun}))`,
  ].join(", "),
})

const frame = "relative h-[30rem] overflow-hidden rounded-surface border border-glass-border bg-background text-foreground"

export default function GlassDemo() {
  const [tab, setTab] = React.useState("journal")
  const [playing, setPlaying] = React.useState(true)
  return (
    <div className="grid w-full max-w-2xl gap-8">
      {/* The material: content panes, in flow */}
      <div className="grid grid-cols-3 gap-3">
        <Glass intensity="subtle" className="flex h-24 items-end p-4 text-sm font-medium">Subtle</Glass>
        <Glass className="flex h-24 items-end p-4 text-sm font-medium">Default</Glass>
        <Glass intensity="strong" className="flex h-24 items-end p-4 text-sm font-medium">Strong</Glass>
        <Glass tint="primary" className="flex h-16 items-end p-4 text-sm font-medium">Tinted</Glass>
        <Glass elevation="flat" className="col-span-2 flex h-16 items-end p-4 text-sm font-medium">Flat — no drop shadow</Glass>
      </div>

      {/* Liquid: the control layer, floating over real content */}
      <div className="grid gap-4 @lg:grid-cols-2">
        <figure className="grid gap-2">
          <div className={frame}>
            {/* edge to edge: the content runs under the bars */}
            <div tabIndex={0} aria-label="Field notes" className="absolute inset-0 overflow-y-auto px-4 pb-28 [scrollbar-width:none]">
              <div className="-mx-4 aspect-[4/3]" style={photo(5, 3, 4)} role="img" aria-label="Dunes at dusk" />
              <p className="mt-4 text-xs font-medium text-muted-foreground">Thursday · Field notes</p>
              <h3 className="type-glass-heading mt-1 text-xl">A week on the coast</h3>
              <p className="mt-2 text-sm leading-relaxed">
                Up before the light again. The tide was out far enough to walk to the rocks, and the wind dropped just as the sun cleared the dunes.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="aspect-square rounded-control" style={photo(2, 1, 4, 30)} role="img" aria-label="Headland" />
                <div className="aspect-square rounded-control" style={photo(5, 3, 2)} role="img" aria-label="Harbour" />
                <div className="aspect-square rounded-control" style={photo(1, 3, 5, 40)} role="img" aria-label="Cliffs" />
                <div className="aspect-square rounded-control" style={photo(4, 2, 1, 60)} role="img" aria-label="Pines" />
              </div>
              <p className="mt-4 text-sm leading-relaxed">
                Wrote three pages at the café by the harbour. Kept the promise to stop at nine. Tomorrow: the lighthouse path, and no phone until noon.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Scroll — the toolbar and the dock stay legible over whatever passes beneath, because they are liquid glass and the article is not.
              </p>
            </div>
            {/* toolbar: two groups, each one liquid capsule — never a capsule inside a capsule */}
            <div className="pointer-events-none absolute inset-x-3 top-3 flex justify-between *:pointer-events-auto">
              <Button variant="glass" size="icon" aria-label="Back">
                <ChevronLeftIcon />
              </Button>
              <div className="glass-liquid flex rounded-full p-0.5">
                <Button variant="ghost" size="icon-sm" aria-label="Share">
                  <ShareIcon />
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="Bookmark">
                  <BookmarkIcon />
                </Button>
              </div>
            </div>
            <Dock position="static" className="absolute inset-x-0 bottom-3">
              <DockBar value={tab} onValueChange={setTab} aria-label="Sections">
                <DockItem value="journal" aria-label="Journal">
                  <BookOpenIcon />
                </DockItem>
                <DockItem value="photos" aria-label="Photos">
                  <ImageIcon />
                </DockItem>
                <DockItem value="search" aria-label="Search">
                  <SearchIcon />
                </DockItem>
              </DockBar>
              <DockAction aria-label="Write">
                <PenIcon />
              </DockAction>
            </Dock>
          </div>
          <figcaption className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Regular</span> — over content. One prominent action.
          </figcaption>
        </figure>

        <figure className="grid gap-2">
          <div className={frame}>
            <div className="absolute inset-0" style={photo(2, 3, 5, 55)} role="img" aria-label="A video of the coast at sunset" />
            {/* clear glass only over media; its built-in dim keeps the white glyphs legible. Not mixed with regular. */}
            <Button variant="ghost" size="icon" aria-label="Close" className="glass-liquid-clear absolute top-3 left-3">
              <XIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label={playing ? "Pause" : "Play"}
              onClick={() => setPlaying((p) => !p)}
              className="glass-liquid-clear absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              {playing ? <PauseIcon className="size-6 fill-current" /> : <PlayIcon className="size-6 fill-current" />}
            </Button>
            <div className="glass-liquid-clear absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-full py-2 pr-2 pl-4 text-xs font-semibold">
              <span className="numeric-glass">0:42</span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-foreground/30" role="progressbar" aria-label="Played" aria-valuenow={35} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full w-[35%] rounded-full bg-foreground" />
              </div>
              <span className="numeric-glass">2:05</span>
              <Button variant="ghost" size="icon-sm" aria-label="Volume">
                <Volume2Icon />
              </Button>
            </div>
          </div>
          <figcaption className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Clear</span> — over media only, with a dim. Never beside regular.
          </figcaption>
        </figure>
      </div>
    </div>
  )
}
