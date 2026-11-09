"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/glass-cn"
import { ArrowRightIcon, ExternalLinkIcon, HeartIcon, MoveIcon, PlusIcon, ShareIcon } from "lucide-react"

import { LiquidGlass01, type LiquidGlassScene } from "@/components/blocks/liquid-glass-01"
import { LiquidGlass02, type LiquidGlass02Scene } from "@/components/blocks/liquid-glass-02"
import { Button } from "@/components/glass/button"
import { GlassPreferences } from "@/components/glass/glass-preferences"
import { GlassCluster, GlassClusterItem } from "@/components/glass/glass-cluster"
import { LiquidGlass } from "@/components/glass/liquid-glass"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/segmented-control"
import { Slider } from "@/components/glass/slider"
import { Switch } from "@/components/glass/switch"

type ShowcaseScene = LiquidGlassScene | LiquidGlass02Scene
const ADVANCED: readonly string[] = ["landmarks", "notes", "search", "materials"]
const SCENES: { id: ShowcaseScene; title: string; description: string; action: string; source: string; reference: string }[] = [
  { id: "photos", title: "Photos", description: "Clear glass keeps the photo in view. Only the bands under the controls are dimmed, so the image stays bright. Share and Delete sit alone at the corners; Delete confirms from its own button.", action: "Favorite a photo, use the next arrow, then delete it.", source: "https://developer.apple.com/design/human-interface-guidelines/materials", reference: "Apple · Materials" },
  { id: "music", title: "Music", description: "The MiniPlayer sits above the tabs, and Search is its own tab at the trailing edge. Scrolling down collapses the tabs to the current one and moves the MiniPlayer between it and Search. The Search tab opens a browse page with its field in the bottom bar.", action: "Scroll the song list, then open Search.", source: "https://developer.apple.com/videos/play/wwdc2026/292/", reference: "Apple · Design intuitive search" },
  { id: "maps", title: "Maps", description: "A floating search panel keeps the map usable. Place details open at a medium detent; the grabber expands them into an anchored, opaque full-height sheet.", action: "Search for Forest Park, open it, then tap the grabber.", source: "https://developer.apple.com/videos/play/wwdc2025/323/?time=397", reference: "Apple · Sheets and the new design" },
  { id: "safari", title: "Safari", description: "The address bar yields space as the article scrolls. The URL stays readable and a press expands the field. Reader view changes the content while the navigation remains available.", action: "Scroll the article, then press its address.", source: "https://www.apple.com/os/ios/", reference: "Apple · iOS 27" },
  { id: "mail", title: "Mail", description: "The 27 sidebar meets the window edges and uses accent-colored symbols. The message list and the message sit side by side when there's room; a narrow window pushes the message. Compose is a modal sheet with Cancel and Send.", action: "Open a message, flag or archive it, then compose.", source: "https://developer.apple.com/videos/play/wwdc2026/102/", reference: "Apple · The 27 design updates" },
  { id: "controls", title: "Controls", description: "Related actions share one glass surface. Inline switches, sliders and segmented controls use fills at rest; their held thumb lifts into a lens. Native uses system controls for these effects.", action: "Expand the tools and drag a thumb.", source: "https://developer.apple.com/videos/play/wwdc2025/284/?time=835", reference: "Apple · System controls" },
  { id: "landmarks", title: "Landmarks", description: "Only the image extends beneath the sidebar and selection-linked inspector. The toolbar groups Share, Favorite with Collections, and the inspector toggle. A horizontal collection scrolls under the chrome, and activity badges keep stable identities as they appear and reorder.", action: "Choose a place, hide the inspector, then add or reorder badges.", source: "https://developer.apple.com/documentation/swiftui/landmarks-building-an-app-with-liquid-glass", reference: "Apple · Landmarks sample" },
  { id: "notes", title: "Notes", description: "Bar items are symbols, with a tinted Done at the trailing edge. The Format sheet is nonmodal, so the note stays editable behind it. As the window narrows, lower-priority commands move into More while Share stays pinned.", action: "Open Aa, edit the note behind it, then tap Done.", source: "https://developer.apple.com/design/human-interface-guidelines/sheets", reference: "Apple · Nonmodal sheets" },
  { id: "search", title: "Search", description: "A standard destination starts with browsing. A prominent search action focuses immediately. Local scopes, recent searches and predictions keep the search's reach understandable.", action: "Compare Search with Search now, then remove a recent query.", source: "https://developer.apple.com/videos/play/wwdc2026/292/", reference: "Apple · Search placement and scope" },
  { id: "materials", title: "Materials", description: "Compare four content materials, size-dependent regular glass and clear controls over prepared bright, dark and already-dimmed media. Foreground hierarchy and control states belong to the material contract.", action: "Change the media and compare the control treatments.", source: "https://developer.apple.com/design/human-interface-guidelines/materials", reference: "Apple · Materials" },
]

function OpticalLab() {
  const [optics, setOptics] = React.useState(true)
  const [variant, setVariant] = React.useState("regular")
  const [strength, setStrength] = React.useState([14])
  const [clarity, setClarity] = React.useState([0.5])
  const id = React.useId()
  return <section className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_17rem]" aria-labelledby="optical-lab-title">
    <div className="grid gap-4">
      <h2 id="optical-lab-title" className="type-title-1 font-semibold">Inspect the material</h2>
      <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-surface" style={{ "--glass-refraction": `${strength[0]}px`, "--glass-clarity": String(clarity[0]) } as React.CSSProperties}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/showcase/alpine.jpg" alt="" className="absolute inset-0 size-full object-cover" />
        {variant === "clear" ? <div className="absolute inset-0 bg-glass-media-dim" aria-hidden /> : null}
        <div aria-hidden className="absolute inset-0 flex items-center justify-around gap-5 overflow-hidden text-7xl font-bold tracking-tight text-glass-media-foreground"><span>GLASS</span><span>GLASS</span></div>
        <LiquidGlass data-testid="optical-lens" variant={variant === "clear" ? "clear" : "regular"} optics={optics} followLight interactive className="flex h-24 w-4/5 max-w-md items-center justify-center gap-3 rounded-button px-pad text-lg font-semibold"><MoveIcon className="size-5" />Move across the lens</LiquidGlass>
      </div>
      <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">Chromium bends the backdrop at the edge; Safari and Firefox use the diffuse material. Native renders Apple’s system effect.</p>
    </div>
    <div className="grid gap-6 rounded-surface bg-fill p-5 lg:mt-12">
      <SegmentedControl aria-label="Material variant" value={variant} onValueChange={setVariant} className="w-full"><SegmentedControlItem value="regular">Regular</SegmentedControlItem><SegmentedControlItem value="clear">Clear</SegmentedControlItem></SegmentedControl>
      <div className="flex items-center justify-between gap-4"><label htmlFor={`${id}-optics`} className="text-sm font-medium">Optical refraction</label><Switch id={`${id}-optics`} checked={optics} onCheckedChange={setOptics} /></div>
      <div className="grid gap-3"><label htmlFor={`${id}-strength`} className="flex justify-between gap-3 text-sm">Edge displacement<span className="numeric-glass">{strength[0]} px</span></label><Slider id={`${id}-strength`} aria-label="Refraction strength" value={strength} onValueChange={setStrength} min={0} max={28} step={1} /></div>
      <div className="grid gap-3"><label htmlFor={`${id}-clarity`} className="flex justify-between gap-3 text-sm">Clarity<span className="numeric-glass">{Math.round(clarity[0] * 100)}%</span></label><Slider id={`${id}-clarity`} aria-label="Lens clarity" value={clarity} onValueChange={setClarity} min={0} max={1} step={0.01} /></div>
    </div>
  </section>
}

function MergeLab() {
  const [joined, setJoined] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  return <section className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_17rem]" aria-labelledby="merge-lab-title"><div className="grid gap-4"><h2 id="merge-lab-title" className="type-title-1 font-semibold">Separate, then come together</h2><div className="relative flex h-60 items-center justify-center overflow-hidden rounded-surface">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img alt="" src="/showcase/coast.jpg" className="absolute inset-0 size-full object-cover" /><GlassCluster spacing={joined ? 0 : 32} mergeDistance={24}><GlassClusterItem aria-label={joined ? "Separate controls" : "Merge controls"} aria-expanded={joined} onClick={() => setJoined(!joined)}><PlusIcon /></GlassClusterItem><GlassClusterItem aria-label={saved ? "Unsave landscape" : "Save landscape"} aria-pressed={saved} onClick={() => setSaved(!saved)}><HeartIcon className={saved ? "fill-current" : undefined} /></GlassClusterItem><GlassClusterItem aria-label="Share landscape" onClick={() => setJoined(!joined)}><ShareIcon /></GlassClusterItem></GlassCluster></div></div><div className="grid gap-4 lg:mt-12"><p className="text-sm leading-relaxed text-muted-foreground">Move the controls closer and their glass forms one contour. Labels stay sharp while a shared backdrop follows the merging shapes.</p><Button variant="secondary" className="w-fit" onClick={() => setJoined(!joined)}>{joined ? "Separate" : "Bring together"}</Button><a href="https://developer.apple.com/documentation/swiftui/glasseffectcontainer" target="_blank" rel="noreferrer" className="glass-focus inline-flex items-center gap-2 text-sm text-primary-ink underline underline-offset-4">Apple · GlassEffectContainer<ExternalLinkIcon className="size-3.5" /></a><p className="text-xs leading-relaxed text-muted-foreground">Web uses a smooth union mask. Native combines sibling glass views in the system container.</p></div></section>
}

export function LiquidGlassShowcase() {
  const [scene, setScene] = React.useState<ShowcaseScene>("photos")
  const selected = SCENES.find((s) => s.id === scene)!
  const tabId = React.useId()
  return <main className="mx-auto grid max-w-6xl gap-16 px-4 pt-10 pb-16 sm:px-6">
    <section className="grid gap-5" aria-labelledby="showcase-title">
      <div className="flex flex-wrap items-end justify-between gap-5"><div className="grid gap-3"><h1 id="showcase-title" className="type-glass-display text-4xl tracking-tight sm:text-5xl">Liquid Glass</h1><p className="max-w-2xl text-base leading-relaxed text-muted-foreground">Apple-inspired examples for web and native. Touch the controls, scroll the content, and change what shows through.</p></div><Button asChild variant="secondary"><Link href={ADVANCED.includes(scene) ? "/docs/liquid-glass-02" : "/docs/liquid-glass-01"}>Install the examples <ArrowRightIcon /></Link></Button></div>
      <div role="tablist" aria-label="Apple examples" className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-button bg-fill p-1">{SCENES.map(({ id, title }, index) => <button key={id} id={`${tabId}-${id}`} type="button" role="tab" aria-selected={scene === id} aria-controls={`${tabId}-panel`} tabIndex={scene === id ? 0 : -1} onClick={() => setScene(id)} onKeyDown={(e) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return
        e.preventDefault()
        const next = e.key === "Home" ? 0 : e.key === "End" ? SCENES.length - 1 : (index + (e.key === "ArrowRight" ? 1 : -1) + SCENES.length) % SCENES.length
        setScene(SCENES[next].id)
        document.getElementById(`${tabId}-${SCENES[next].id}`)?.focus()
      }} className={cn("glass-focus-inset h-control shrink-0 rounded-button px-pad-sm text-sm transition-colors duration-(--glass-duration)", scene === id ? "bg-background font-semibold text-foreground shadow-glass-1" : "text-muted-foreground hover:text-foreground")}>{title}</button>)}</div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div id={`${tabId}-panel`} role="tabpanel" aria-labelledby={`${tabId}-${scene}`}>{ADVANCED.includes(scene) ? <LiquidGlass02 key={scene} scene={scene as LiquidGlass02Scene} photoBase="/showcase" data-testid="liquid-glass-scene" /> : <LiquidGlass01 key={scene} scene={scene as LiquidGlassScene} photoBase="/showcase" />}</div>
        <aside className="grid gap-5 py-2 lg:py-4"><div className="grid gap-3"><h2 className="type-title-2 font-semibold">{selected.title}</h2><p className="text-sm leading-relaxed text-muted-foreground">{selected.description}</p><p className="text-sm font-medium">{selected.action}</p></div><a href={selected.source} target="_blank" rel="noreferrer" className="glass-focus inline-flex w-fit items-center gap-2 text-sm text-primary-ink underline underline-offset-4">{selected.reference}<ExternalLinkIcon className="size-3.5" /></a><div className="h-px bg-separator" /><div className="grid gap-4"><h3 className="type-headline">Your glass settings</h3><GlassPreferences /></div></aside>
      </div>
    </section>
    <OpticalLab />
    <MergeLab />
    <section className="grid max-w-3xl gap-5" aria-labelledby="showcase-native-title"><h2 id="showcase-native-title" className="type-title-1 font-semibold">The system renders the native material</h2><p className="text-base leading-relaxed text-muted-foreground">On iOS, these examples use Liquid Glass and system controls through Expo. Running on iOS 27 inherits its revised diffusion, edge treatment and accessibility settings. The web uses the same layer model and interactions.</p><div className="flex flex-wrap gap-3"><Button asChild variant="secondary"><Link href="/docs/native">Run the native sandbox <ArrowRightIcon /></Link></Button><Button asChild variant="ghost"><a href="https://developer.apple.com/documentation/swiftui/landmarks-building-an-app-with-liquid-glass" target="_blank" rel="noreferrer">Apple’s Landmarks sample <ExternalLinkIcon /></a></Button></div><p className="text-xs text-muted-foreground">Example content is illustrative. Landscape photographs: <a className="underline underline-offset-4" href="https://unsplash.com/license" target="_blank" rel="noreferrer">Unsplash</a>. Apple references describe the interaction being recreated.</p></section>
  </main>
}
