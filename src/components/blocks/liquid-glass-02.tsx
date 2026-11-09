"use client"

import * as React from "react"
import { AwardIcon, CheckIcon, ChevronRightIcon, FolderPlusIcon, HeartIcon, HistoryIcon, ListChecksIcon, MapPinIcon, MountainIcon, PanelRightIcon, PinIcon, Redo2Icon, SearchIcon, ShareIcon, Undo2Icon, XIcon } from "lucide-react"
import { cn } from "@/lib/glass-cn"
import { BackgroundExtension } from "@/components/glass/background-extension"
import { Backdrop } from "@/components/glass/backdrop"
import { Button } from "@/components/glass/button"
import { Glass } from "@/components/glass/glass"
import { GlassMorph, GlassMorphItem } from "@/components/glass/glass-morph"
import { Input } from "@/components/glass/input"
import { LiquidGlass } from "@/components/glass/liquid-glass"
import { SearchField } from "@/components/glass/search-field"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/glass/sheet"
import { Slider } from "@/components/glass/slider"
import { ThemeScope } from "@/components/glass/theme-scope"
import { ToolbarCommands, ToolbarGroup, ToolbarItem } from "@/components/glass/toolbar"

export type LiquidGlass02Scene = "landmarks" | "notes" | "search" | "materials"
export type LiquidGlass02Props = React.ComponentProps<"section"> & { scene?: LiquidGlass02Scene; photoBase?: string }
const PLACES = [
  { id: "lake", title: "Alpine lake", file: "alpine.jpg", photo: "photo-1470770841072-f978cf4d019e", detail: "A still morning beside the water.", distance: "4.2 km loop" },
  { id: "coast", title: "Open coast", file: "coast.jpg", photo: "photo-1500530855697-b586d89ba3ee", detail: "Follow the headland to the sheltered cove.", distance: "6.8 km return" },
  { id: "summit", title: "Mountain summit", file: "summit.jpg", photo: "photo-1464822759023-fed622ff2c3b", detail: "A rocky ridge above the tree line.", distance: "8.1 km return" },
] as const
const image = (index: number, base?: string) => base ? `${base.replace(/\/$/, "")}/${PLACES[index % PLACES.length].file}` : `https://images.unsplash.com/${PLACES[index % PLACES.length].photo}?auto=format&fit=crop&w=1200&q=85`
/** The scene's own frame: presentations attach to it instead of the browser viewport. */
const SceneFrame = React.createContext<HTMLElement | null>(null)
const initialNote = "Follow the trail beside the lake. Stop at the ridge for lunch, then take the lower path home."

/** Source families: Landmarks background extension/badges, WWDC26 toolbar/search, HIG sheets/materials. */
export function LiquidGlass02({ scene = "landmarks", photoBase, className, ref, ...props }: LiquidGlass02Props) {
  const [frame, setFrame] = React.useState<HTMLElement | null>(null)
  const attach = React.useCallback((node: HTMLElement | null) => {
    setFrame(node)
    if (typeof ref === "function") ref(node)
    else if (ref) ref.current = node
  }, [ref])
  return <section ref={attach} data-slot="liquid-glass-02" data-scene={scene} aria-label={`${scene[0].toUpperCase()}${scene.slice(1)} example`} className={cn("@container relative isolate min-h-144 min-w-0 overflow-hidden rounded-surface bg-background text-foreground", className)} {...props}>
    <SceneFrame.Provider value={frame}>{scene === "landmarks" ? <Landmarks photoBase={photoBase} /> : scene === "notes" ? <Notes /> : scene === "search" ? <Search /> : <Materials photoBase={photoBase} />}</SceneFrame.Provider>
  </section>
}

// https://developer.apple.com/documentation/swiftui/landmarks-displaying-custom-activity-badges
function Landmarks({ photoBase }: { photoBase?: string }) {
  const [selection, setSelection] = React.useState(0)
  const [badges, setBadges] = React.useState(["Trail", "Lake"])
  const [message, setMessage] = React.useState("Choose a badge to see its activity.")
  const [inspector, setInspector] = React.useState(true)
  const [section, setSection] = React.useState<"places" | "badges">("places")
  const placesId = React.useId()
  const badgesId = React.useId()
  const [favorites, setFavorites] = React.useState<number[]>([])
  const place = PLACES[selection]
  const favorite = favorites.includes(selection)
  return <div className="relative pb-6">
    <div className={cn("relative @3xl:ms-40", inspector && "@3xl:me-48")}>
      {/* Landmarks' toolbar: Share, then Favorite and Collections sharing glass, then the inspector toggle, split by fixed spacers */}
      <div className="absolute end-3 top-3 z-30 flex items-center gap-2 @3xl:end-4">
        <ToolbarGroup aria-label="Share"><ToolbarItem aria-label={`Share ${place.title}`} onClick={() => setMessage(`${place.title} ready to share.`)}><ShareIcon /></ToolbarItem></ToolbarGroup>
        <ToolbarGroup aria-label="Collections"><ToolbarItem aria-label={favorite ? "Remove favorite" : "Add favorite"} aria-pressed={favorite} onClick={() => setFavorites(current => favorite ? current.filter(v => v !== selection) : [...current, selection])}><HeartIcon className={favorite ? "fill-current text-primary-ink" : undefined} /></ToolbarItem><ToolbarItem aria-label="Add to collection" onClick={() => setMessage(`${place.title} added to Saved places.`)}><FolderPlusIcon /></ToolbarItem></ToolbarGroup>
        <ToolbarGroup aria-label="Inspector" className="hidden @3xl:flex"><ToolbarItem aria-label={inspector ? "Hide inspector" : "Show inspector"} aria-pressed={inspector} onClick={() => setInspector(!inspector)}><PanelRightIcon /></ToolbarItem></ToolbarGroup>
      </div>
      <BackgroundExtension src={image(selection, photoBase)} alt="" start={160} end={inspector ? 192 : 0} className="min-h-64" style={{ aspectRatio: "4 / 3" }}>
        <div className="absolute inset-0 bg-linear-to-t from-glass-dim to-transparent" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 p-6 text-glass-media-foreground"><p className="text-sm">Field collection</p><h3 className="type-glass-display text-3xl">Places to return to</h3></div>
      </BackgroundExtension>
    </div>
    {/* sidebar and inspector are text panels over the extended image: the thick tier keeps their labels at AA */}
    <Glass variant="liquid" className="absolute inset-y-0 start-0 hidden w-40 rounded-none! p-4 [--glass-liquid-opacity:var(--glass-opacity-strong)] @3xl:block">
      <h4 className="type-title-3 font-bold">Landmarks</h4><nav aria-label="Landmarks sections" className="mt-3 grid gap-0.5">{([["places", MapPinIcon, "Saved places"], ["badges", AwardIcon, "Activity badges"]] as const).map(([id, Icon, label]) => <Button key={id} variant={section === id ? "secondary" : "ghost"} shape="rounded" aria-current={section === id ? "page" : undefined} className="justify-start px-2.5" onClick={() => { setSection(id); requestAnimationFrame(() => document.getElementById(id === "places" ? placesId : badgesId)?.querySelector<HTMLElement>("button")?.focus()) }}><Icon className="text-primary" />{label}</Button>)}</nav>
    </Glass>
    <div id={placesId} className={cn("relative z-10 flex gap-3 overflow-x-auto px-4 pt-5 pb-3 @3xl:ps-44", inspector ? "@3xl:pe-52" : "@3xl:pe-4")} aria-label="Saved places">
      {PLACES.map((entry, index) => <button key={entry.id} type="button" aria-label={`Select ${entry.title}`} aria-pressed={selection === index} onClick={() => setSelection(index)} className="glass-focus min-w-44 flex-1 rounded-control border border-glass-border bg-fill p-3 text-start aria-pressed:bg-fill-strong">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image(index, photoBase)} alt="" className="mb-2 aspect-video w-full rounded-control object-cover" /><span className="type-glass-heading text-sm">{entry.title}</span>
      </button>)}
    </div>
    <Glass variant="liquid" asChild><aside data-testid="landmark-inspector" aria-label="Selected place" className={cn("relative z-20 mx-4 rounded-control p-4 [--glass-liquid-opacity:var(--glass-opacity-thick)] @3xl:absolute @3xl:inset-y-0 @3xl:end-0 @3xl:mx-0 @3xl:w-48 @3xl:rounded-none @3xl:p-4", !inspector && "@3xl:hidden")}>
      <h4 className="type-glass-heading">{place.title}</h4><p className="mt-2 text-sm text-muted-foreground">{place.detail}</p><p className="mt-3 text-sm">{place.distance}</p>
    </aside></Glass>
    <div className={cn("relative z-10 space-y-3 px-4 pt-4 @3xl:ms-40", inspector && "@3xl:me-48")}>
      <GlassMorph id={badgesId} aria-label="Activity badges" value={badges.join("-")} spacing={8} className="flex flex-wrap">{badges.map(badge => <GlassMorphItem key={badge} id={`activity-${badge.toLowerCase()}`} accessibilityLabel={`${badge} badge`} onPress={() => setMessage(`${badge} activity selected.`)}><MountainIcon aria-hidden className="size-4" />{badge}</GlassMorphItem>)}</GlassMorph>
      <div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" aria-label={badges.includes("Summit") ? "Remove summit badge" : "Add summit badge"} onClick={() => setBadges(current => current.includes("Summit") ? current.filter(b => b !== "Summit") : [...current, "Summit"])}>{badges.includes("Summit") ? "Remove Summit" : "Add Summit"}</Button><Button size="sm" variant="ghost" onClick={() => setBadges(current => [...current].reverse())}>Reverse badges</Button></div>
      <p role="status" className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
}

const NOTE_STYLES = [["Title", "type-title-1 font-bold"], ["Heading", "type-title-3 font-bold"], ["Body", ""], ["Monostyled", "font-glass-mono text-[0.95rem]"]] as const

// Notes: icon-only bar items with a tinted Done, a plain document, a floating bottom group,
// and a nonmodal Format sheet that leaves the note editable behind it.
// https://developer.apple.com/videos/play/wwdc2026/269/?time=375
function Notes() {
  const frame = React.useContext(SceneFrame)
  const [history, setHistory] = React.useState({ past: [] as string[], text: initialNote, future: [] as string[] })
  const [saved, setSaved] = React.useState(initialNote)
  const [format, setFormat] = React.useState("Body")
  const [savedFormat, setSavedFormat] = React.useState("Body")
  const [pinned, setPinned] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [message, setMessage] = React.useState("")
  const editor = React.useRef<HTMLTextAreaElement>(null)
  const trigger = React.useRef<HTMLButtonElement>(null)
  const edit = (text: string) => setHistory(current => ({ past: [...current.past, current.text], text, future: [] }))
  const undo = () => setHistory(current => current.past.length ? { past: current.past.slice(0, -1), text: current.past.at(-1)!, future: [current.text, ...current.future] } : current)
  const redo = () => setHistory(current => current.future.length ? { past: [...current.past, current.text], text: current.future[0], future: current.future.slice(1) } : current)
  const share = async () => {
    try {
      if (navigator.share) { await navigator.share({ text: history.text }); setMessage("Note shared.") }
      else if (navigator.clipboard) { await navigator.clipboard.writeText(history.text); setMessage("Note text copied for sharing.") }
      else setMessage("Select the note text to copy it.")
    } catch { setMessage("Sharing closed. Your note is still here.") }
  }
  const save = () => { setSaved(history.text); setSavedFormat(format); setMessage("Note saved."); setOpen(false); requestAnimationFrame(() => editor.current?.focus()) }
  const styled = NOTE_STYLES.find(([name]) => name === format)?.[1]
  return <Sheet modal={false} open={open} onOpenChange={setOpen}>
    <div className="relative flex min-h-144 flex-col">
      <div className="flex min-w-0 items-center gap-2 px-3 pt-3 @lg:px-4">
        <ToolbarCommands className="min-w-0 flex-1" aria-label="Note actions" overflowLabel="More note actions" commands={[
          { id: "undo", label: "Undo", icon: <Undo2Icon />, priority: 20, disabled: !history.past.length, onSelect: undo },
          { id: "redo", label: "Redo", icon: <Redo2Icon />, priority: 20, disabled: !history.future.length, onSelect: redo },
          { id: "pin", label: pinned ? "Unpin note" : "Pin note", icon: <PinIcon className={pinned ? "fill-current" : undefined} />, priority: 1, onSelect: () => { setPinned(!pinned); setMessage(pinned ? "Note unpinned." : "Note pinned.") } },
          { id: "word-count", label: "Word count", overflow: "always", onSelect: () => setMessage(`${history.text.trim().split(/\s+/).filter(Boolean).length} words`) },
          { id: "share", label: "Share", icon: <ShareIcon />, pinned: true, onSelect: () => { void share() } },
        ]} />
        <Button variant="prominent" size="icon-lg" aria-label="Done" onClick={save}><CheckIcon /></Button>
      </div>
      <div className="flex-1 px-6 pt-3 pb-28 @lg:px-10">
        <p className="mb-3 text-center text-xs text-muted-foreground">November 10, 2026 at 9:41 AM</p>
        <h3 className="type-title-1 mb-1 font-bold">A day by the lake</h3>
        <label htmlFor="field-note-text" className="sr-only">Note text</label>
        <textarea id="field-note-text" ref={editor} value={history.text} onChange={event => edit(event.target.value)} className={cn("glass-focus-inset -mx-2 block min-h-48 w-[calc(100%+1rem)] resize-none rounded-control-sm bg-transparent px-2 py-1 leading-relaxed caret-primary field-sizing-content", styled || "text-[1.0625rem]")} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
        <ToolbarGroup aria-label="Note tools" className="pointer-events-auto">
          <ToolbarItem aria-label="Add checklist item" onClick={() => edit(`${history.text}\n☐ Bring a field guide`)}><ListChecksIcon /></ToolbarItem>
          <SheetTrigger asChild><ToolbarItem ref={trigger} aria-label="Format note"><span aria-hidden className="text-base font-semibold">Aa</span></ToolbarItem></SheetTrigger>
        </ToolbarGroup>
      </div>
      <p role="status" className="sr-only">{saved === history.text && savedFormat === format ? "Saved" : "Draft"}</p>
      <p aria-live="polite" className="sr-only">{message}</p>
    </div>
    <SheetContent container={frame} side="bottom" detents={["196px", "medium"]} onOpenAutoFocus={event => event.preventDefault()} onCloseAutoFocus={event => { event.preventDefault(); if (!editor.current?.matches(":focus")) trigger.current?.focus() }} className="mx-auto max-w-xl">
      <SheetHeader><SheetTitle>Format</SheetTitle><SheetDescription className="sr-only">Formatting applies to this note. You can keep editing above.</SheetDescription></SheetHeader>
      <div role="group" aria-label="Text style" className="flex gap-2 overflow-x-auto px-5 pb-5">{NOTE_STYLES.map(([style, look]) => <Button key={style} variant={format === style ? "default" : "secondary"} aria-pressed={format === style} onClick={() => setFormat(style)} className={cn("shrink-0", look && style !== "Title" && style !== "Heading" ? look : style === "Title" ? "text-lg font-bold" : style === "Heading" ? "font-bold" : undefined)}>{style}</Button>)}</div>
    </SheetContent>
  </Sheet>
}

const LIBRARY = [{ title: "Alpine lake", kind: "Places", text: "Water and a quiet trail." }, { title: "Open coast", kind: "Places", text: "The path beside the sea." }, { title: "Summit journal", kind: "Notes", text: "Bring a field guide for the ridge." }]
// One search field with a scope bar under it; recents as a list. At regular width the folder
// list moves into a sidebar with its own local filter (S06), the library gets an inline filter
// (S04), and the selected result stays visible beside the results (S05).
// https://developer.apple.com/videos/play/wwdc2026/292/
function Search() {
  const [mode, setMode] = React.useState<"destination" | "prominent">("destination")
  const [query, setQuery] = React.useState("")
  const [local, setLocal] = React.useState("")
  const [folderQuery, setFolderQuery] = React.useState("")
  const [scope, setScope] = React.useState("All")
  const [recent, setRecent] = React.useState(["Coast", "Lake"])
  const [selected, setSelected] = React.useState(LIBRARY[0])
  const root = React.useRef<HTMLDivElement>(null)
  const searchNow = React.useRef<HTMLButtonElement>(null)
  // the field stays mounted between modes, so focus is moved here rather than by remounting it
  const field = () => root.current?.querySelector<HTMLInputElement>('input[aria-label="Search all collections"]')
  const removeRecent = (item: string) => {
    const next = recent.filter(value => value !== item)
    setRecent(next)
    requestAnimationFrame(() => (root.current?.querySelector<HTMLElement>(`[aria-label="Search recent ${next[Math.min(recent.indexOf(item), next.length - 1)]}"]`) ?? field())?.focus())
  }
  const results = LIBRARY.filter(entry => (scope === "All" || entry.kind === scope) && `${entry.title} ${entry.text}`.toLowerCase().includes(query.toLowerCase()) && entry.title.toLowerCase().includes(local.toLowerCase()))
  // the detail column follows the results: a filtered-out selection isn't left on screen
  const current = results.find(entry => entry.title === selected.title) ?? results[0]
  const submit = (value: string) => { setQuery(value); if (value.trim()) setRecent(current => [value, ...current.filter(item => item !== value)].slice(0, 4)) }
  const suggestions = query ? LIBRARY.filter(entry => entry.title.toLowerCase().startsWith(query.toLowerCase()) && entry.title.toLowerCase() !== query.toLowerCase()).map(entry => ({ value: entry.title, label: <span>{entry.title.slice(0, query.length)}<strong>{entry.title.slice(query.length)}</strong></span> })) : []
  const folders = ["All", "Places", "Notes"].filter(item => item.toLowerCase().includes(folderQuery.toLowerCase()))
  return <div ref={root} className="space-y-4 p-4 @lg:p-6">
    <header className="flex flex-wrap items-center justify-between gap-3"><h3 className="type-large-title font-bold">Collections</h3><div className="flex gap-2"><Button variant="secondary" size="sm" aria-label="Search destination" aria-pressed={mode === "destination"} onClick={() => { setMode("destination"); setQuery("") }}>Browse</Button><Button ref={searchNow} variant="secondary" size="sm" aria-label="Search now" onClick={() => { setMode("prominent"); field()?.focus() }}><SearchIcon />Search now</Button></div></header>
    <SearchField aria-label="Search all collections" placeholder="Search all collections" value={query} onValueChange={setQuery} tokens={scope === "All" ? [] : [{ id: "scope", label: scope }]} onTokenRemove={() => setScope("All")} onSubmit={submit} suggestions={suggestions} onSuggestionSelect={submit} onCancel={() => { setMode("destination"); requestAnimationFrame(() => searchNow.current?.focus()) }} />
    <div className="grid gap-5 @2xl:grid-cols-[11rem_1fr]">
      <aside aria-label="Folders" className="space-y-2">
        <label className="hidden text-sm text-muted-foreground @2xl:block">Folders<Input aria-label="Search folders" placeholder="Find a folder" value={folderQuery} onChange={event => setFolderQuery(event.target.value)} className="mt-1" /></label>
        {/* compact: a scope bar under the field; regular: the sidebar's folder list */}
        <div role="group" aria-label="Scope" className="flex gap-1 rounded-button bg-fill p-1 @2xl:grid @2xl:rounded-none @2xl:bg-transparent @2xl:p-0">{folders.map(item => <button key={item} type="button" aria-label={`Show ${item} folder`} aria-pressed={scope === item} onClick={() => setScope(item)} className={cn("glass-focus-inset h-control-sm flex-1 rounded-button px-pad-sm text-sm font-medium @2xl:h-control @2xl:rounded-control @2xl:text-start", scope === item ? "bg-background shadow-glass-1 @2xl:bg-fill-strong @2xl:shadow-none" : "text-muted-foreground")}>{item}</button>)}</div>
      </aside>
      <div className="min-w-0 space-y-4">
        <label className="hidden text-sm text-muted-foreground @2xl:block">{scope === "All" ? "Library" : scope}<Input aria-label="Filter this library" placeholder={`Filter ${scope === "All" ? "this library" : scope.toLowerCase()}`} value={local} onChange={event => setLocal(event.target.value)} className="mt-1" /></label>
        {!query && !local ? <section aria-label="Recent searches"><div className="flex items-center justify-between"><h4 className="type-headline">Recent Searches</h4>{recent.length ? <Button variant="ghost" size="sm" className="text-primary-ink" onClick={() => { setRecent([]); field()?.focus() }}>Clear</Button> : null}</div>
          <ul className="mt-1">{recent.map(item => <li key={item} className="flex items-center gap-3 border-b border-separator last:border-0"><HistoryIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" /><button type="button" aria-label={`Search recent ${item}`} onClick={() => submit(item)} className="glass-focus-inset min-h-control flex-1 text-start text-base">{item}</button><Button variant="ghost" size="icon-sm" aria-label={`Remove recent ${item}`} onClick={() => removeRecent(item)}><XIcon /></Button></li>)}</ul>
          {!recent.length ? <p className="py-2 text-sm text-muted-foreground">Your next search will appear here.</p> : null}</section> : null}
        <div className="grid gap-4 @xl:grid-cols-2">
          <div aria-label="Search results">{results.length ? <ul className="overflow-hidden rounded-control bg-fill">{results.map(entry => <li key={entry.title} className="border-b border-separator last:border-0"><button type="button" aria-label={`Open ${entry.title}`} aria-pressed={current?.title === entry.title} onClick={() => setSelected(entry)} className={cn("glass-focus-inset flex w-full items-center gap-3 px-4 py-2.5 text-start", current?.title === entry.title && "bg-fill-strong")}><span className="min-w-0 flex-1"><span className="block truncate text-base font-medium">{entry.title}</span><span className="block text-sm text-muted-foreground">{entry.kind}</span></span><ChevronRightIcon aria-hidden className="size-4 text-glass-label-tertiary" /></button></li>)}</ul>
            : <div role="status" className="grid justify-items-center gap-1 py-8 text-center"><SearchIcon aria-hidden className="size-10 text-glass-label-tertiary" /><p className="type-title-3 mt-2 font-bold">No Results</p><p className="text-sm text-muted-foreground">No results for “{query || local}”. Check the spelling or try a new search.</p><Button size="sm" variant="ghost" className="text-primary-ink" onClick={() => { setQuery(""); setLocal(""); setScope("All"); field()?.focus() }}>Clear filters</Button></div>}</div>
          {current ? <article aria-label="Selected result" className="rounded-control bg-fill-subtle p-4"><p className="text-sm text-muted-foreground">{current.kind}</p><h4 className="type-title-3 mt-1 font-bold">{current.title}</h4><p className="mt-2 text-base">{current.text}</p></article> : null}
        </div>
      </div>
    </div>
  </div>
}

// https://developer.apple.com/design/human-interface-guidelines/materials
function Materials({ photoBase }: { photoBase?: string }) {
  const [dark, setDark] = React.useState(false)
  const [balance, setBalance] = React.useState([0])
  const [progress, setProgress] = React.useState([35])
  const [inset, setInset] = React.useState([12])
  const [playing, setPlaying] = React.useState([false, false, false])
  return <div className="space-y-6 p-4 @lg:p-6">
    <header className="flex items-center justify-between gap-4"><h3 className="type-glass-heading text-2xl">Material study</h3><Button variant="secondary" aria-pressed={dark} onClick={() => setDark(current => !current)}>{dark ? "Bright content" : "Dark content"}</Button></header>
    <div className="relative isolate grid gap-4 overflow-hidden rounded-surface p-4 @xl:grid-cols-2">
      <Backdrop className="absolute" variant="image" src={image(dark ? 2 : 1, photoBase)} dim={dark ? 0.7 : 0} />
      <LiquidGlass className="self-start p-3"><p className="type-glass-heading text-sm">Regular · small</p></LiquidGlass><LiquidGlass className="space-y-2 p-6"><h4 className="type-glass-heading text-lg">Regular · large</h4><p className="text-sm text-muted-foreground">Secondary foreground</p><p className="text-sm text-glass-label-tertiary">Tertiary foreground</p></LiquidGlass>
      <div className="grid grid-cols-2 gap-3 @xl:col-span-2">{/* thin tiers show more of the photo, so their second line keeps the primary label (Apple's thin materials use vibrant labels) */}
        {(["ultraThin", "thin", "regular", "thick"] as const).map(level => <Glass key={level} intensity={level} className="p-4"><h4 className="type-glass-heading text-sm">{level}</h4><p className={cn("mt-1 text-sm", level === "ultraThin" || level === "thin" ? "text-foreground" : "text-muted-foreground")}>Standard material</p></Glass>)}</div>
    </div>
    <div className="grid gap-3 @xl:grid-cols-3">{["Bright media", "Dark media", "Already dimmed media"].map((label, index) => <div key={label} className="relative isolate flex min-h-40 flex-col justify-between gap-6 overflow-hidden rounded-surface p-3">
      {index === 1 ? <ThemeScope scheme="dark" className="absolute inset-0 -z-10 bg-background" aria-hidden><div className="absolute inset-0 bg-linear-to-br from-primary/20 to-transparent" /></ThemeScope> : <Backdrop className="absolute" variant="image" src={image(index === 0 ? 1 : 0, photoBase)} dim={index === 0 ? 0.35 : 0.65} />}
      <p className="text-sm text-glass-media-foreground">{label}</p><LiquidGlass variant="clear" className="self-start rounded-button"><Button variant="ghost" aria-label={`${playing[index] ? "Hide details" : "Show details"} ${label.toLowerCase()}`} onClick={() => setPlaying(current => current.map((value, i) => i === index ? !value : value))}>{playing[index] ? "Hide details" : "Details"}</Button></LiquidGlass>{playing[index] ? <p className="text-sm text-glass-media-foreground">{index === 1 ? "Night recording · 21:45" : "Field recording · 06:30"}</p> : null}
    </div>)}</div>
    <div className="grid gap-6 @xl:grid-cols-2"><div className="space-y-4"><label className="block text-sm">Balance · {balance[0]}<Slider aria-label="Neutral balance" min={-2} max={2} step={1} ticks neutralValue={0} value={balance} onValueChange={setBalance} /></label><label className="block text-sm">Progress · {progress[0]}%<Slider aria-label="Playback progress" variant="progress" value={progress} onValueChange={setProgress} className="mt-3" /></label></div><div className="space-y-3"><label className="block text-sm">Control inset · {inset[0]}<Slider aria-label="Control inset" min={4} max={24} value={inset} onValueChange={setInset} /></label><div className="rounded-surface bg-fill [--glass-container-radius:var(--glass-radius-surface)]" style={{ padding: inset[0], "--glass-container-pad": `${inset[0]}px` } as React.CSSProperties}><Button variant="secondary" className="w-full rounded-concentric" onClick={() => setInset([12])}>Reset inset</Button></div></div></div>
  </div>
}
