"use client"

import * as React from "react"
import { cn } from "@/lib/glass-cn"
import { Tabs as TabsPrimitive } from "radix-ui"
import {
  ArchiveIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, FileTextIcon, FlagIcon, SquarePenIcon,
  CompassIcon, EllipsisIcon, EraserIcon, MousePointer2Icon, PencilIcon, HeartIcon, HouseIcon, InboxIcon, InfoIcon, LayersIcon, LayoutGridIcon, ListMusicIcon,
  MapPinIcon, NavigationIcon, PauseIcon,
  PlayIcon, PlusIcon, SearchIcon, SendIcon, ShareIcon, SkipForwardIcon,
  StarIcon, Trash2Icon, Volume2Icon, XIcon,
} from "lucide-react"

import { Button } from "@/components/glass/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/glass/dropdown-menu"
import { LiquidGlass } from "@/components/glass/liquid-glass"
import { NavigationBar, NavigationBarLeading, NavigationBarTrailing } from "@/components/glass/navigation-bar"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/segmented-control"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/glass/sheet"
import { Sidebar, SidebarContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/glass/sidebar"
import { Slider } from "@/components/glass/slider"
import { Switch } from "@/components/glass/switch"
import { ToolbarGroup, ToolbarItem } from "@/components/glass/toolbar"
import { nextMinimized } from "@/components/glass/scroll-edge"

export type LiquidGlassScene = "photos" | "music" | "maps" | "safari" | "mail" | "controls"
type SceneProps = { photoBase?: string }
/** The scene's own frame: presentations attach to it instead of the browser viewport. */
const SceneFrame = React.createContext<HTMLElement | null>(null)
const PHOTO_DATA = [
  { file: "alpine.jpg", id: "photo-1470770841072-f978cf4d019e", title: "Alpine lake", place: "Sierra Nevada", date: "June 14 · 7:24 AM" },
  { file: "coast.jpg", id: "photo-1500530855697-b586d89ba3ee", title: "Coast at golden hour", place: "The coast", date: "June 15 · 6:42 PM" },
  { file: "summit.jpg", id: "photo-1464822759023-fed622ff2c3b", title: "Mountain summit", place: "Cascade Range", date: "June 16 · 9:16 AM" },
]
const photo = (index: number, base?: string) => base ? `${base}/${PHOTO_DATA[index % PHOTO_DATA.length].file}` : `https://images.unsplash.com/${PHOTO_DATA[index % PHOTO_DATA.length].id}?auto=format&fit=crop&w=1200&q=85`

function IconButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  return <Button variant="ghost" size="icon" className={cn("text-current hover:bg-fill [&_svg]:size-5", className)} {...props} />
}

// iOS 27 Photos one-up: clear controls over the photo, Share and Delete on their own at the
// bottom edges with Favorite/Info/Edit grouped between. Only the bands under the controls are
// dimmed (HIG Materials: 35% behind clear glass over bright media); the photo stays bright.
function PhotosScene({ photoBase }: SceneProps) {
  const [photos, setPhotos] = React.useState([0, 1, 2])
  const [index, setIndex] = React.useState(0)
  const [favorites, setFavorites] = React.useState<number[]>([])
  const [info, setInfo] = React.useState(false)
  const [status, setStatus] = React.useState("")
  const id = photos[index % photos.length]
  const selected = PHOTO_DATA[id]
  const favorite = favorites.includes(id)
  const toggleFavorite = () => setFavorites(favorite ? favorites.filter((v) => v !== id) : [...favorites, id])
  const remove = () => {
    if (photos.length === 1) return setStatus("The last photo can't be deleted in this example.")
    setPhotos(photos.filter((v) => v !== id))
    setIndex(index % (photos.length - 1))
    setStatus(`${selected.title} deleted.`)
  }
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo(id, photoBase)} alt={selected.title} className="absolute inset-0 size-full object-cover" />
      <div aria-hidden className="pointer-events-none absolute inset-0 [background:linear-gradient(to_bottom,var(--color-glass-media-dim)_0%,var(--color-glass-media-dim)_16%,transparent_40%,transparent_64%,var(--color-glass-media-dim)_86%,var(--color-glass-media-dim)_100%)]" />
      <div className="absolute inset-x-4 top-4 grid grid-cols-[1fr_auto_1fr] items-start gap-3 text-glass-media-foreground">
        <span />
        <div className="min-w-0 pt-1 text-center [text-shadow:0_1px_2px_rgb(0_0_0/0.35)]"><p className="truncate text-[0.9375rem] font-semibold">{selected.place}</p><p className="truncate text-xs">{selected.date}</p></div>
        <LiquidGlass variant="clear" className="flex items-center justify-self-end rounded-button p-1" interactive>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><IconButton aria-label="Photo options"><EllipsisIcon /></IconButton></DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setInfo(true)}>Show Info</DropdownMenuItem><DropdownMenuItem onSelect={toggleFavorite}>{favorite ? "Unfavorite" : "Favorite"}</DropdownMenuItem></DropdownMenuContent>
          </DropdownMenu>
        </LiquidGlass>
      </div>
      {/* pointer arrows at the edges, as iPadOS shows them on hover; touch swipes on device */}
      {photos.length > 1 ? <>
        <LiquidGlass variant="clear" className="absolute start-3 top-1/2 -translate-y-1/2 rounded-button p-0.5 text-glass-media-foreground" interactive><IconButton aria-label="Previous photo" onClick={() => setIndex((index + photos.length - 1) % photos.length)}><ChevronLeftIcon className="rtl:-scale-x-100" /></IconButton></LiquidGlass>
        <LiquidGlass variant="clear" className="absolute end-3 top-1/2 -translate-y-1/2 rounded-button p-0.5 text-glass-media-foreground" interactive><IconButton aria-label="Next photo" onClick={() => setIndex((index + 1) % photos.length)}><ChevronRightIcon className="rtl:-scale-x-100" /></IconButton></LiquidGlass>
      </> : null}
      <div className="absolute inset-x-4 bottom-5 flex flex-wrap items-center justify-between gap-3 text-glass-media-foreground">
        <LiquidGlass variant="clear" className="flex items-center rounded-button p-1" interactive>
          <IconButton aria-label="Share photo" onClick={() => setStatus(`${selected.title} ready to share.`)}><ShareIcon /></IconButton>
        </LiquidGlass>
        <LiquidGlass variant="clear" className="flex items-center gap-1 rounded-button p-1">
          <IconButton aria-label={favorite ? "Remove favorite" : "Favorite photo"} aria-pressed={favorite} onClick={toggleFavorite}><HeartIcon className={favorite ? "fill-current" : undefined} /></IconButton>
          <IconButton aria-label="Photo information" aria-expanded={info} onClick={() => setInfo(!info)}><InfoIcon /></IconButton>
        </LiquidGlass>
        <LiquidGlass variant="clear" className="flex items-center rounded-button p-1" interactive>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><IconButton aria-label="Delete photo"><Trash2Icon /></IconButton></DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top"><DropdownMenuItem variant="destructive" onSelect={remove}><Trash2Icon />Delete Photo</DropdownMenuItem></DropdownMenuContent>
          </DropdownMenu>
        </LiquidGlass>
      </div>
      {info ? <LiquidGlass className="absolute right-4 bottom-24 left-4 mx-auto max-w-sm rounded-surface p-5"><p className="type-headline">{selected.title}</p><p className="mt-1 text-sm text-muted-foreground">iPhone · 24 mm · ƒ/1.8 · ISO 100</p><Button variant="secondary" size="sm" className="mt-3" onClick={() => setInfo(false)}>Close Info</Button></LiquidGlass> : null}
      <p role="status" className="sr-only">{status}</p>
    </>
  )
}

const TRACKS = ["A slower morning", "Saltwater", "First light", "The long way home", "Still here", "Blue hour", "Small hours", "Open water"]

function useSceneMinimize() {
  const [compact, setCompact] = React.useState(false)
  const anchor = React.useRef(0)
  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const from = anchor.current
    const to = event.currentTarget.scrollTop
    if (Math.abs(to - from) > 8 || to <= 48) anchor.current = to
    const keyboardFocus = event.currentTarget.closest('[data-testid="liquid-glass-scene"]')?.querySelector(":focus-visible")
    setCompact((current) => keyboardFocus ? false : nextMinimized(current, from, to))
  }
  return { compact, setCompact, onScroll }
}

/** True while the scene frame is narrower than `rem` root ems: on a phone that means enlarged text. */
function useNarrowFrame(rem: number) {
  const frame = React.useContext(SceneFrame)
  const [narrow, setNarrow] = React.useState(false)
  React.useEffect(() => {
    if (!frame) return
    const check = () => setNarrow(frame.clientWidth / (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) < rem)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [frame, rem])
  return narrow
}

const MUSIC_TABS = [[HouseIcon, "Home"], [LayoutGridIcon, "New"], [ListMusicIcon, "Library"]] as const
const MUSIC_TAB_GLYPHS = MUSIC_TABS.map(([Icon]) => <Icon key="glyph" className="size-6" />)
// each browse category leads to its own tracks (indexes into TRACKS)
const GENRES: Record<string, number[]> = { Chill: [0, 5], Acoustic: [1, 3], Focus: [2, 4], Jazz: [5, 6], Classical: [3, 7], Ambient: [6, 7] }

// iOS 27 Music: a tab capsule at the leading edge, Search as its own trailing tab and the
// MiniPlayer accessory above both. Scrolling down collapses the tabs to the selected icon and
// moves the accessory inline between it and Search; scrolling back expands them.
function MusicScene({ photoBase }: SceneProps) {
  const fieldId = React.useId()
  const [playing, setPlaying] = React.useState(true)
  const [track, setTrack] = React.useState(0)
  const [tab, setTab] = React.useState("Home")
  const [lastTab, setLastTab] = React.useState("Home")
  const [query, setQuery] = React.useState("")
  const { compact: scrolled, setCompact, onScroll } = useSceneMinimize()
  const searching = tab === "Search"
  const narrow = useNarrowFrame(15)
  // the search tab owns the bottom bar: its field replaces the tab capsule, which collapses; enlarged
  // text collapses it too, since bar items don't grow with Dynamic Type on iOS
  const compact = scrolled || searching || narrow
  const heading = React.useRef<HTMLHeadingElement>(null)
  const field = React.useRef<HTMLInputElement>(null)
  const select = (value: string) => {
    if (value !== "Search") setLastTab(value)
    // the Search tab's own trigger gives way to the field, so focus moves to the page it opened
    else requestAnimationFrame(() => heading.current?.focus())
    setTab(value)
    setCompact(false)
  }
  const genre = Object.keys(GENRES).find((g) => g.toLowerCase() === query.trim().toLowerCase())
  const tracks = TRACKS.filter((name, i) => (genre ? GENRES[genre].includes(i) : name.toLowerCase().includes(query.toLowerCase())))
  const list = <div className="divide-y divide-separator">{tracks.map((name) => {
    const n = TRACKS.indexOf(name)
    return <button key={name} type="button" className="glass-focus flex w-full items-center gap-3 py-2.5 text-start" onClick={() => { setTrack(n); setPlaying(true) }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo(n, photoBase)} alt="" className="size-12 rounded-control-sm object-cover" /><span className="min-w-0 flex-1"><span className="block truncate text-base">{name}</span><span className="block truncate text-sm text-muted-foreground">Northbound · {n % 2 ? "Open water" : "Daybreak"}</span></span>{track === n && playing ? <Volume2Icon aria-label="Now playing" className="size-4 text-primary" /> : null}
    </button>
  })}</div>
  const content = (
      <div className="h-full overflow-y-auto px-5 pt-7 pb-48" onScroll={onScroll} data-slot="music-scroll">
        <div className="mb-5 flex items-center justify-between"><h2 ref={heading} tabIndex={-1} className="type-large-title glass-focus rounded-control-sm font-bold">{tab}</h2><span aria-label="Account" role="img" className="flex size-control items-center justify-center rounded-button bg-fill-strong text-sm font-semibold">JD</span></div>
        {searching ? (query ? <>{list}{tracks.length === 0 ? <p role="status" className="py-8 text-center text-base text-muted-foreground">No results for “{query}”</p> : null}</> : <>
          <h3 className="type-title-3 mb-3 font-bold">Browse categories</h3>
          <div className="grid grid-cols-2 gap-3 @lg:grid-cols-3">{Object.keys(GENRES).map((genre, i) => <button key={genre} type="button" onClick={() => setQuery(genre)} className="glass-focus relative isolate aspect-[3/2] overflow-hidden rounded-control text-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo(i, photoBase)} alt="" className="absolute inset-0 -z-10 size-full object-cover" /><span className="absolute inset-0 -z-10 bg-linear-to-t from-glass-dim to-transparent" /><span className="absolute bottom-2.5 left-3 text-base font-semibold text-glass-media-foreground">{genre}</span>
          </button>)}</div>
        </>) : <>
          <div className="relative mb-6 overflow-hidden rounded-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo(1, photoBase)} alt="Sunlit landscape for the Slow mornings playlist" className="aspect-[16/9] w-full object-cover @xl:aspect-[21/8]" />
            <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-glass-dim to-transparent p-5 text-glass-media-foreground"><p className="text-sm font-medium">Made for the morning</p><h3 className="type-title-1 font-bold">Slow mornings</h3></div>
          </div>
          <h3 className="type-title-3 mb-2 font-bold">Recently played</h3>
          {list}
        </>}
      </div>
  )
  const collapsed = MUSIC_TABS.findIndex(([, name]) => name === lastTab)
  return (
    <TabsPrimitive.Root value={tab} onValueChange={select} className="contents">
      {[...MUSIC_TABS.map(([, name]) => name), "Search"].map((value) => <TabsPrimitive.Content key={value} value={value} className="h-full min-h-0 focus-visible:outline-hidden">{tab === value ? content : null}</TabsPrimitive.Content>)}
      <div className="pointer-events-none absolute inset-x-3 bottom-4 mx-auto grid max-w-xl grid-cols-[minmax(0,1fr)] gap-2">
        {!compact || (narrow && !searching) ? <MiniPlayer art={!narrow} className="w-full" photoBase={photoBase} track={track} playing={playing} setPlaying={setPlaying} next={() => setTrack((track + 1) % TRACKS.length)} /> : null}
        <div className="flex items-center gap-2">
          {/* one tablist for keyboard order; the accessory sits between its pieces visually */}
          <TabsPrimitive.List aria-label="Music sections" className="contents" onFocus={() => { if (!searching) setCompact(false) }}>
            <LiquidGlass className={cn("pointer-events-auto order-1 flex shrink-0 items-center rounded-button p-1", !compact && "min-w-0 flex-1")}>
              {compact ? <TabsPrimitive.Trigger value={lastTab} aria-label={lastTab} className="glass-focus-inset flex size-control-lg items-center justify-center rounded-button text-primary">{MUSIC_TAB_GLYPHS[Math.max(0, collapsed)]}</TabsPrimitive.Trigger>
                : MUSIC_TABS.map(([Icon, name]) => <TabsPrimitive.Trigger key={name} value={name} className={cn("glass-focus-inset flex h-control-lg min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-button px-pad-sm text-[0.625rem] font-medium", tab === name ? "bg-fill-strong font-semibold text-primary" : "text-foreground")}><Icon className="size-6" /><span>{name}</span></TabsPrimitive.Trigger>)}
            </LiquidGlass>
            {!searching ? <LiquidGlass className="pointer-events-auto order-3 shrink-0 rounded-button p-1">
              <TabsPrimitive.Trigger value="Search" aria-label="Search" className="glass-focus-inset flex size-control-lg items-center justify-center rounded-button"><SearchIcon className="size-6" /></TabsPrimitive.Trigger>
            </LiquidGlass> : null}
          </TabsPrimitive.List>
          {compact && !searching && !narrow ? <MiniPlayer className="order-2 min-w-0 flex-1" photoBase={photoBase} track={track} playing={playing} setPlaying={setPlaying} /> : null}
          {searching ? <LiquidGlass className="pointer-events-auto order-3 flex h-control-lg min-w-0 flex-1 items-center gap-2 rounded-button px-pad-sm">
            <SearchIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
            <label htmlFor={`${fieldId}-search`} className="sr-only">Search music</label>
            <input ref={field} id={`${fieldId}-search`} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Artists, Songs, Lyrics and More" className="glass-focus h-control min-w-0 flex-1 bg-transparent text-base placeholder:text-glass-label-tertiary [&::-webkit-search-cancel-button]:hidden" />
            {query ? <button type="button" aria-label="Clear search" className="glass-focus hit-area flex size-5 items-center justify-center rounded-button bg-fill-strong" onClick={() => { setQuery(""); field.current?.focus() }}><XIcon className="size-3" /></button> : null}
          </LiquidGlass> : null}
        </div>
      </div>
    </TabsPrimitive.Root>
  )
}

function MiniPlayer({ className, photoBase, track, playing, setPlaying, next, art = true }: { className?: string; photoBase?: string; track: number; playing: boolean; setPlaying: (playing: boolean) => void; next?: () => void; art?: boolean }) {
  return <LiquidGlass className={cn("pointer-events-auto flex h-control-lg items-center gap-3 rounded-button ps-2 pe-1", className)}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {art ? <img src={photo(track, photoBase)} alt="" className="size-9 rounded-control-sm object-cover" /> : null}<p className="min-w-0 flex-1 truncate text-sm font-medium">{TRACKS[track]}</p>
    <IconButton aria-label={playing ? "Pause playback" : "Play music"} onClick={() => setPlaying(!playing)}>{playing ? <PauseIcon className="fill-current" /> : <PlayIcon className="fill-current" />}</IconButton>
    {next ? <IconButton aria-label="Next track" onClick={next}><SkipForwardIcon className="fill-current" /></IconButton> : null}
  </LiquidGlass>
}

const PLACES = [
  { name: "Forest Park", detail: "Trails · 2.4 mi", icon: CompassIcon },
  { name: "Pittock Mansion", detail: "Scenic viewpoint · 3.1 mi", icon: MapPinIcon },
  { name: "Good Coffee", detail: "Coffee · 0.6 mi", icon: StarIcon },
]

function MapCanvas({ mode = "explore", located = false }: { mode?: string; located?: boolean }) {
  const satellite = mode === "satellite"
  return <svg aria-label={`Illustrative ${satellite ? "satellite" : "street"} map of Portland parks`} role="img" viewBox="0 0 800 700" preserveAspectRatio="xMidYMid slice" className={cn("absolute inset-0 size-full", satellite ? "bg-[oklch(0.42_0.05_140)]" : "bg-background")}>
    <path d="M0 0H285L340 120 260 260 180 390 0 350Z" fill={satellite ? "oklch(0.32 0.06 145)" : "var(--success)"} opacity={satellite ? 1 : 0.16} /><path d="M520 -30C440 120 560 200 470 320S480 590 430 730" fill="none" stroke={satellite ? "oklch(0.35 0.06 230)" : "var(--info)"} strokeWidth="64" opacity={satellite ? 1 : 0.3} />
    {[90, 160, 235, 310, 390, 465, 545, 620].map((y) => <path key={y} d={`M-20 ${y}Q350 ${y - 35} 820 ${y + 35}`} fill="none" stroke="var(--glass-label)" strokeOpacity="0.13" strokeWidth="9" />)}
    {[80, 175, 285, 390, 580, 675, 765].map((x) => <path key={x} d={`M${x} -30Q${x - 80} 330 ${x + 40} 740`} fill="none" stroke="var(--glass-label)" strokeOpacity="0.13" strokeWidth="8" />)}
    <path d="M180 440 250 375 310 320 380 280 420 170" fill="none" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round" />{located ? <circle cx="180" cy="440" r="34" fill="var(--primary)" opacity="0.16" /> : null}<circle cx="180" cy="440" r="11" fill="var(--primary)" stroke="var(--background)" strokeWidth="4" />
    <g fill="var(--foreground)" fontSize="17" fontFamily="system-ui"><text x="110" y="155">Forest Park</text><text x="530" y="280">Pearl District</text><text x="310" y="430">Portland</text><text x="565" y="550">Eastside</text></g>
  </svg>
}

function MapsScene() {
  const frame = React.useContext(SceneFrame)
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<string | null>(null)
  const [detent, setDetent] = React.useState(0)
  const [mode, setMode] = React.useState("explore")
  const [located, setLocated] = React.useState(false)
  const opener = React.useRef<HTMLElement | null>(null)
  const matches = PLACES.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
  const open = (name: string, from: HTMLElement) => { opener.current = from; setSelected(name) }
  return <>
    <MapCanvas mode={mode} located={located} />
    <LiquidGlass className="absolute top-4 right-4 flex flex-col rounded-button p-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild><IconButton aria-label="Map style"><LayersIcon /></IconButton></DropdownMenuTrigger>
        <DropdownMenuContent align="end"><DropdownMenuRadioGroup value={mode} onValueChange={setMode}><DropdownMenuRadioItem value="explore">Explore</DropdownMenuRadioItem><DropdownMenuRadioItem value="satellite">Satellite</DropdownMenuRadioItem></DropdownMenuRadioGroup></DropdownMenuContent>
      </DropdownMenu>
      <IconButton aria-label="Show current location" aria-pressed={located} onClick={() => setLocated(!located)}><NavigationIcon className={located ? "fill-current text-primary" : undefined} /></IconButton>
    </LiquidGlass>
    <p aria-live="polite" className="sr-only">{located ? "Showing your location." : ""}</p>
    {/* iPhone: a card above the bottom edge; iPad width: a floating card at the top leading corner */}
    <LiquidGlass className="absolute right-3 bottom-4 left-3 mx-auto max-w-sm rounded-surface p-4 @xl:top-4 @xl:right-auto @xl:bottom-auto @xl:left-4 @xl:mx-0 @xl:w-80">
      <div className="flex items-center gap-3 rounded-control bg-fill px-pad-sm"><SearchIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" /><input aria-label="Search places" type="search" placeholder="Search Maps" value={query} onChange={(e) => setQuery(e.target.value)} className="glass-focus h-control min-w-0 flex-1 bg-transparent text-base focus-visible:outline-hidden" />{query ? <button type="button" aria-label="Clear search" className="glass-focus hit-area" onClick={() => setQuery("")}><XIcon className="size-4" /></button> : null}</div>
      <h3 className="type-headline mt-5 mb-2">{query ? "Places" : "Nearby"}</h3>
      <div className="divide-y divide-separator">{matches.map(({ name, detail, icon: Icon }) => <button key={name} type="button" className="glass-focus flex w-full items-center gap-3 py-3 text-start" onClick={(e) => open(name, e.currentTarget)}><span className="flex size-control-sm items-center justify-center rounded-control bg-fill-strong"><Icon className="size-4" /></span><span className="flex-1"><span className="block text-sm font-semibold">{name}</span><span className="block text-xs text-muted-foreground">{detail}</span></span><ChevronRightIcon className="size-4 text-muted-foreground" /></button>)}</div>
      {matches.length === 0 ? <p role="status" className="py-6 text-sm text-muted-foreground">No places match “{query}”.</p> : null}
    </LiquidGlass>
    <Sheet open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null) }} modal={false}>
      <SheetContent container={frame} side="bottom" detents={["medium", "large"]} detent={detent} onDetentChange={setDetent} className="@xl:inset-x-auto! @xl:left-4! @xl:mx-0! @xl:w-80! @xl:max-w-80! @xl:rounded-b-surface! @xl:bottom-4! @xl:max-h-[calc(100%-2rem)]!" onCloseAutoFocus={(e) => { e.preventDefault(); opener.current?.focus() }}>
        <SheetHeader><SheetTitle>{selected}</SheetTitle><SheetDescription>Portland, Oregon · Open today</SheetDescription></SheetHeader>
        <div className="grid gap-6 overflow-y-auto px-6 pb-10"><p className="max-w-prose text-sm leading-relaxed">Follow the trails through old-growth forest, stop at the overlook, or find a quiet place for the afternoon. Choose a route before you head out.</p><Button onClick={() => setSelected(null)}><NavigationIcon />Start walking route</Button><h3 className="type-headline">About this place</h3><p className="max-w-prose text-sm leading-relaxed">Walking paths connect the neighborhood to the park. Allow extra time for the climb and bring water for the trail.</p></div>
      </SheetContent>
    </Sheet>
  </>
}

function SafariScene({ photoBase }: SceneProps) {
  const { compact, setCompact, onScroll } = useSceneMinimize()
  const [reader, setReader] = React.useState(false)
  const [address, setAddress] = React.useState("fieldnotes.example")
  const addressRef = React.useRef<HTMLInputElement>(null)
  return <>
    <div role="region" aria-label="Article" tabIndex={0} className="glass-focus-inset h-full overflow-y-auto pb-32" onScroll={onScroll}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {!reader ? <img src={photo(2, photoBase)} alt="A mountain rising above the clouds" className="aspect-[4/3] w-full object-cover" /> : null}
      <article className="mx-auto max-w-prose px-6 pt-7 text-base leading-relaxed"><p className="mb-3 text-sm text-muted-foreground">Field Notes · Outdoors</p><h2 className="type-large-title font-semibold mb-5">Take the long way.</h2><p className="mb-5">The best part of a day outside is the part you didn’t plan. A turn in the trail, a break in the clouds, a lake you can hear before you see.</p><p className="mb-5">Leave early. Take something warm. Find a path that gives you time to notice where you are.</p><h3 className="type-title-2 font-semibold mt-8 mb-4">A little room to wander</h3>{Array.from({ length: 4 }, (_, i) => <p className="mb-5" key={i}>There is no need to fill every hour. Stop beside the water. Look up at the ridgeline. Give the weather a chance to change. The walk back will look different from the walk out.</p>)}</article>
    </div>
    <div className="absolute right-3 bottom-4 left-3 flex justify-center">
      <LiquidGlass className={cn("flex max-w-lg items-center gap-1 rounded-button p-1.5 transition-[width] duration-(--glass-duration) ease-glass", compact ? "w-64" : "w-full")}>
        <IconButton aria-label="Back to top" onClick={(e) => { e.currentTarget.closest('[data-testid="liquid-glass-scene"]')?.querySelector(".overflow-y-auto")?.scrollTo({ top: 0, behavior: "smooth" }); setCompact(false) }}><ArrowUpIcon /></IconButton>
        {compact ? <button type="button" className="glass-focus h-control min-w-0 flex-1 truncate text-sm" aria-label="Expand address field" onClick={() => { setCompact(false); requestAnimationFrame(() => addressRef.current?.focus()) }}>{address}</button> : <input ref={addressRef} aria-label="Website address" value={address} onChange={(e) => setAddress(e.target.value)} onFocus={(e) => e.target.select()} className="glass-focus h-control min-w-0 flex-1 rounded-button bg-transparent px-1 text-center text-sm" />}
        <IconButton aria-label="Reader view" aria-pressed={reader} onClick={() => setReader(!reader)}><FileTextIcon className={reader ? "text-primary-ink" : undefined} /></IconButton>
      </LiquidGlass>
    </div>
  </>
}

const LETTERS = [
  { from: "Alex Morgan", time: "9:41 AM", subject: "The weekend route", body: "I found a quieter trail along the north side of the lake. There’s a good place to stop for lunch just before the overlook. Shall we meet at the trailhead at eight?" },
  { from: "Jordan Lee", time: "Yesterday", subject: "A few photos from yesterday", body: "The light changed just as we reached the ridge. I’ve put the photos in our shared album. The one with the lake is my favorite." },
  { from: "Sam Rivera", time: "Tuesday", subject: "Coffee on Friday?", body: "I’ll be near your studio on Friday morning. There’s a new coffee place around the corner. Let’s catch up before the day gets busy." },
]
type Letter = (typeof LETTERS)[number] & { id: number; folder: string; flagged: boolean; unread: boolean }
const initials = (name: string) => name.split(" ").map((part) => part[0]).join("")

// iPad Mail: sidebar at the window edge, message list and message side by side at regular
// width; a compact width shows the list and pushes the message. Compose is a modal sheet.
function MailScene() {
  const frame = React.useContext(SceneFrame)
  const [folder, setFolder] = React.useState("Inbox")
  const [letters, setLetters] = React.useState<Letter[]>(() => LETTERS.map((letter, id) => ({ ...letter, id, folder: "Inbox", flagged: false, unread: id > 0 })))
  const [selected, setSelected] = React.useState(0)
  const [pushed, setPushed] = React.useState(false)
  const [composing, setComposing] = React.useState(false)
  const [draft, setDraft] = React.useState({ to: "", subject: "", body: "" })
  const [status, setStatus] = React.useState("")
  const shown = letters.filter((letter) => folder === "Flagged" ? letter.flagged : letter.folder === folder)
  const letter = shown.find((entry) => entry.id === selected) ?? null
  const update = (id: number, change: Partial<Letter>) => setLetters((all) => all.map((entry) => entry.id === id ? { ...entry, ...change } : entry))
  const list = React.useRef<HTMLElement>(null)
  const reading = React.useRef<HTMLHeadingElement>(null)
  const composeButton = React.useRef<HTMLButtonElement>(null)
  // Mail opens a new message with the cursor in To
  const toField = React.useRef<HTMLInputElement>(null)
  // focus follows the action: the message on a compact push, its row going back, the next row after archive
  const later = (fn: () => void) => requestAnimationFrame(() => requestAnimationFrame(fn))
  const row = (id?: number) => list.current?.querySelector<HTMLElement>(id === undefined ? "button[data-letter]" : `button[data-letter="${id}"]`)
  const open = (id: number) => {
    setSelected(id); update(id, { unread: false }); setPushed(true)
    later(() => { if (!list.current?.offsetParent) reading.current?.focus() })
  }
  const back = () => { setPushed(false); later(() => row(selected)?.focus()) }
  const archive = () => {
    if (!letter) return
    update(letter.id, { folder: "Archive" })
    setStatus(`“${letter.subject}” moved to Archive.`)
    setPushed(false)
    later(() => (row() ?? composeButton.current)?.focus())
  }
  const dirty = !!(draft.to.trim() || draft.subject.trim() || draft.body.trim())
  const closeCompose = (keep: boolean) => {
    if (!keep) setDraft({ to: "", subject: "", body: "" })
    setComposing(false)
    if (keep && dirty) setStatus("Draft saved.")
  }
  const send = () => {
    setComposing(false)
    setStatus(`Message to ${draft.to} sent.`)
    setDraft({ to: "", subject: "", body: "" })
  }
  return <SidebarProvider className="h-full min-h-0" style={{ "--sidebar-width": "13rem" } as React.CSSProperties}>
    <Sidebar position="absolute"><SidebarHeader><span className="type-title-2 font-bold">Mailboxes</span></SidebarHeader><SidebarContent><SidebarGroupLabel>Favorites</SidebarGroupLabel><SidebarMenu>{([[InboxIcon, "Inbox"], [FlagIcon, "Flagged"], [SendIcon, "Sent"], [ArchiveIcon, "Archive"]] as const).map(([Glyph, name]) => <SidebarMenuItem key={name}><SidebarMenuButton isActive={folder === name} onClick={() => { setFolder(name); setPushed(false) }}><Glyph /><span>{name}</span><span className="ms-auto text-sm text-muted-foreground">{letters.filter((entry) => name === "Flagged" ? entry.flagged : entry.folder === name && entry.unread).length || null}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarContent></Sidebar>
    <SidebarInset className="@container/mail h-full min-h-0">
      <div className="grid h-full min-h-0 @xl/mail:grid-cols-[minmax(16rem,22rem)_1fr]">
        <section ref={list} aria-label={`${folder} messages`} className={cn("h-full min-h-0 overflow-y-auto pb-6 @xl/mail:border-e @xl/mail:border-separator", pushed && "hidden @xl/mail:block")}>
          <NavigationBar title={folder}><NavigationBarLeading><SidebarTrigger /></NavigationBarLeading><NavigationBarTrailing><LiquidGlass interactive className="rounded-button p-0.5"><IconButton ref={composeButton} aria-label="New message" onClick={() => setComposing(true)}><SquarePenIcon /></IconButton></LiquidGlass></NavigationBarTrailing></NavigationBar>
          <ul className="px-2">{shown.map((entry) => <li key={entry.id} className="border-b border-separator last:border-0">
            <button type="button" data-letter={entry.id} onClick={() => open(entry.id)} aria-current={letter?.id === entry.id ? "true" : undefined} className={cn("glass-focus-inset grid w-full grid-cols-[0.75rem_1fr] gap-x-1.5 rounded-control px-2 py-2.5 text-start", letter?.id === entry.id && "@xl/mail:bg-fill-strong")}>
              <span aria-label={entry.unread ? "Unread" : undefined} className={cn("mt-1.5 size-2.5 rounded-full", entry.unread ? "bg-primary" : entry.flagged ? "bg-warning" : "")} />
              <span className="min-w-0"><span className="flex items-baseline gap-2"><span className="min-w-0 flex-1 truncate text-[0.9375rem] font-semibold">{entry.from}</span><span className="shrink-0 text-sm text-muted-foreground">{entry.time}</span></span><span className="block truncate text-[0.9375rem]">{entry.subject}</span><span className="line-clamp-2 text-[0.9375rem] text-muted-foreground">{entry.body}</span></span>
            </button>
          </li>)}</ul>
          {!shown.length ? <p className="px-6 py-10 text-center text-base text-muted-foreground">No Mail</p> : null}
        </section>
        <section aria-label="Message" className={cn("h-full min-h-0 overflow-y-auto pb-8", !pushed && "hidden @xl/mail:block")}>
          <NavigationBar title="" titleDisplayMode="inline">
            <NavigationBarLeading><LiquidGlass interactive className="rounded-button p-0.5 @xl/mail:hidden"><IconButton aria-label={`Back to ${folder}`} onClick={back}><ChevronLeftIcon className="rtl:-scale-x-100" /></IconButton></LiquidGlass></NavigationBarLeading>
            {letter ? <NavigationBarTrailing><ToolbarGroup aria-label="Message actions"><ToolbarItem aria-label={letter.flagged ? "Unflag message" : "Flag message"} aria-pressed={letter.flagged} onClick={() => update(letter.id, { flagged: !letter.flagged })}><FlagIcon className={letter.flagged ? "fill-current text-warning" : undefined} /></ToolbarItem><ToolbarItem aria-label="Archive message" disabled={letter.folder === "Archive"} onClick={archive}><ArchiveIcon /></ToolbarItem></ToolbarGroup></NavigationBarTrailing> : null}
          </NavigationBar>
          {letter ? <article className="px-6">
            <div className="flex items-center gap-3 border-b border-separator pb-4"><span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-fill-strong text-sm font-semibold">{initials(letter.from)}</span><div className="min-w-0 flex-1"><p className="truncate text-[0.9375rem] font-semibold">{letter.from}</p><p className="text-sm text-muted-foreground">To: You</p></div><p className="text-sm text-muted-foreground">{letter.time}</p></div>
            <h2 ref={reading} tabIndex={-1} className="type-title-2 glass-focus mt-4 rounded-control-sm font-bold">{letter.subject}</h2>
            <p className="mt-4 text-[1.0625rem] leading-relaxed">{letter.body}</p><p className="mt-5 text-[1.0625rem]">See you soon,<br />{letter.from.split(" ")[0]}</p>
          </article> : <p className="px-6 pt-16 text-center text-base text-muted-foreground">No Message Selected</p>}
        </section>
      </div>
      <p role="status" className="sr-only">{status}</p>
    </SidebarInset>
    {/* Escape keeps a started draft, as Mail does when compose is dismissed; Cancel asks */}
    <Sheet open={composing} onOpenChange={(next) => next ? setComposing(true) : closeCompose(true)}>
      <SheetContent container={frame} side="bottom" detents={["large"]} grabber={false} showCloseButton={false} className="gap-0" onOpenAutoFocus={(e) => { e.preventDefault(); toField.current?.focus() }} onCloseAutoFocus={(e) => { e.preventDefault(); composeButton.current?.focus() }}>
        <SheetHeader className="grid grid-cols-[auto_1fr_auto] items-center gap-3 p-3">
          {dirty ? <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="glass" size="icon" aria-label="Cancel"><XIcon /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="start"><DropdownMenuItem variant="destructive" onSelect={() => closeCompose(false)}>Delete Draft</DropdownMenuItem><DropdownMenuItem onSelect={() => closeCompose(true)}>Save Draft</DropdownMenuItem></DropdownMenuContent>
          </DropdownMenu> : <Button variant="glass" size="icon" aria-label="Cancel" onClick={() => closeCompose(false)}><XIcon /></Button>}
          <SheetTitle className="text-center type-headline">New Message</SheetTitle>
          <Button variant="prominent" size="icon" aria-label="Send" disabled={!draft.to.trim()} onClick={send}><ArrowUpIcon /></Button>
        </SheetHeader>
        <SheetDescription className="sr-only">Write a message. Cancel asks whether to keep a started draft.</SheetDescription>
        <div className="grid border-y border-separator px-5 text-[0.9375rem]">
          <label className="flex items-center gap-2 border-b border-separator py-2.5"><span className="text-muted-foreground">To:</span><input ref={toField} value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} className="glass-focus min-w-0 flex-1 bg-transparent" autoComplete="off" /></label>
          <label className="flex items-center gap-2 py-2.5"><span className="text-muted-foreground">Subject:</span><input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} className="glass-focus min-w-0 flex-1 bg-transparent" /></label>
        </div>
        <label className="sr-only" htmlFor="mail-compose-body">Message</label>
        <textarea id="mail-compose-body" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} className="glass-focus-inset min-h-40 flex-1 resize-none bg-transparent px-5 py-3 text-[1.0625rem]" />
      </SheetContent>
    </Sheet>
  </SidebarProvider>
}

// enlarged text shows the tools as symbols, so the control keeps its size
const TOOLS = [["draw", "Draw", PencilIcon], ["erase", "Erase", EraserIcon], ["select", "Select", MousePointer2Icon]] as const

function ControlsScene({ photoBase }: SceneProps) {
  const fieldId = React.useId()
  const narrow = useNarrowFrame(15)
  const [expanded, setExpanded] = React.useState(false)
  const [volume, setVolume] = React.useState([48])
  const [notifications, setNotifications] = React.useState(true)
  const [tool, setTool] = React.useState("draw")
  return <>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={photo(0, photoBase)} alt="Lake and mountains behind floating controls" className="absolute inset-0 size-full object-cover" />
    <div className="absolute inset-x-5 top-5 flex flex-wrap items-start justify-between gap-3"><LiquidGlass className="rounded-button px-5 py-3 text-sm font-semibold">Mountain study</LiquidGlass><LiquidGlass interactive className="rounded-button p-1"><IconButton aria-label={expanded ? "Collapse tools" : "Expand tools"} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}><PlusIcon className={cn("transition-transform duration-(--glass-duration) ease-glass", expanded && "rotate-45")} /></IconButton></LiquidGlass></div>
    <div className="absolute right-5 bottom-5 left-5 mx-auto grid max-w-sm grid-cols-[minmax(0,1fr)] gap-3">
      {expanded ? <LiquidGlass className="grid gap-5 rounded-surface p-5"><div className="flex items-center justify-between gap-3"><label htmlFor={`${fieldId}-notifications`} className="text-sm font-medium">Notifications</label><Switch id={`${fieldId}-notifications`} checked={notifications} onCheckedChange={setNotifications} /></div><div className="grid gap-3"><label htmlFor={`${fieldId}-volume`} className="flex items-center gap-2 text-sm font-medium"><Volume2Icon className="size-4" />Volume<span className="numeric-glass ms-auto">{volume[0]}%</span></label><Slider id={`${fieldId}-volume`} aria-label="Volume" value={volume} onValueChange={setVolume} /></div></LiquidGlass> : null}
      <LiquidGlass className="flex w-fit items-center justify-self-center rounded-button p-1"><SegmentedControl value={tool} onValueChange={setTool} aria-label="Drawing tool">{TOOLS.map(([value, label, Icon]) => <SegmentedControlItem key={value} value={value} aria-label={narrow ? label : undefined}>{narrow ? <Icon aria-hidden className="size-4" /> : label}</SegmentedControlItem>)}</SegmentedControl></LiquidGlass>
    </div>
  </>
}

/** Apple-inspired interaction examples. Photos and app content are illustrative. */
export function LiquidGlass01({ scene = "photos", photoBase, className, ref, ...props }: React.ComponentProps<"section"> & SceneProps & { scene?: LiquidGlassScene }) {
  const [frame, setFrame] = React.useState<HTMLElement | null>(null)
  const attach = React.useCallback((node: HTMLElement | null) => {
    setFrame(node)
    if (typeof ref === "function") ref(node)
    else if (ref) ref.current = node
  }, [ref])
  const scenes: Record<LiquidGlassScene, React.ReactNode> = {
    photos: <PhotosScene photoBase={photoBase} />,
    music: <MusicScene photoBase={photoBase} />,
    maps: <MapsScene />,
    safari: <SafariScene photoBase={photoBase} />,
    mail: <MailScene />,
    controls: <ControlsScene photoBase={photoBase} />,
  }
  return <section ref={attach} data-slot="liquid-glass-01" data-testid="liquid-glass-scene" data-scene={scene} aria-label={`${scene.charAt(0).toUpperCase() + scene.slice(1)} example`} className={cn("@container relative isolate h-[36rem] min-w-0 overflow-hidden rounded-surface bg-background text-foreground", className)} {...props}><SceneFrame.Provider value={frame}>{scenes[scene]}</SceneFrame.Provider></section>
}
