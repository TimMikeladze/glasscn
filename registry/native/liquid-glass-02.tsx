import * as React from "react"
import { Image, ScrollView, Share, StyleSheet, TextInput, View, useWindowDimensions, type ViewProps } from "react-native"
import { CheckIcon, ChevronRightIcon, FolderPlusIcon, HeartIcon, HistoryIcon, MountainIcon, PinIcon, PinOffIcon, Redo2Icon, SearchIcon, ShareIcon, Undo2Icon, XIcon } from "lucide-react-native"
import { announce } from "@/components/glass/native/a11y"
import { BackgroundExtension } from "@/components/glass/native/background-extension"
import { Backdrop } from "@/components/glass/native/backdrop"
import { Button } from "@/components/glass/native/button"
import { Glass } from "@/components/glass/native/glass"
import { GlassMorph, GlassMorphItem } from "@/components/glass/native/glass-morph"
import { Input } from "@/components/glass/native/input"
import { Press } from "@/components/glass/native/press"
import { SearchField } from "@/components/glass/native/search-field"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/glass/native/sheet"
import { Slider } from "@/components/glass/native/slider"
import { GlassThemeProvider } from "@/components/glass/native/tokens"
import { ToolbarCommands, ToolbarGroup, ToolbarItem } from "@/components/glass/native/toolbar"
import { GIcon, GText, useUI } from "@/components/glass/native/ui"

export type LiquidGlass02Scene = "landmarks" | "notes" | "search" | "materials"
export type LiquidGlass02Props = ViewProps & { scene?: LiquidGlass02Scene; photoBase?: string }
const PLACES = [
  { id: "lake", title: "Alpine lake", file: "alpine.jpg", photo: "photo-1470770841072-f978cf4d019e", detail: "A still morning beside the water.", distance: "4.2 km loop" },
  { id: "coast", title: "Open coast", file: "coast.jpg", photo: "photo-1500530855697-b586d89ba3ee", detail: "Follow the headland to the sheltered cove.", distance: "6.8 km return" },
  { id: "summit", title: "Mountain summit", file: "summit.jpg", photo: "photo-1464822759023-fed622ff2c3b", detail: "A rocky ridge above the tree line.", distance: "8.1 km return" },
] as const
const image = (index: number, base?: string) => base ? `${base.replace(/\/$/, "")}/${PLACES[index % PLACES.length].file}` : `https://images.unsplash.com/${PLACES[index % PLACES.length].photo}?auto=format&fit=crop&w=1200&q=85`

const initialNote = "Follow the trail beside the lake. Stop at the ridge for lunch, then take the lower path home."

/** Landmarks, Notes, Search and Materials use the same public contracts as the web block. */
export function LiquidGlass02({ scene = "landmarks", photoBase, style, onLayout, ...props }: LiquidGlass02Props) {
  const ui = useUI()
  const [width, setWidth] = React.useState(0)
  return <View testID={`liquid-glass-02-${scene}`} onLayout={event => { setWidth(event.nativeEvent.layout.width); onLayout?.(event) }} style={[{ minHeight: 620, minWidth: 0, borderRadius: ui.radius.surface, overflow: "hidden", backgroundColor: ui.auroraBase }, style]} {...props}>
    <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
      {scene === "landmarks" ? <Landmarks width={width} photoBase={photoBase} /> : scene === "notes" ? <Notes /> : scene === "search" ? <Search width={width} /> : <Materials width={width} photoBase={photoBase} />}
    </ScrollView>
  </View>
}

// https://developer.apple.com/documentation/swiftui/landmarks-displaying-custom-activity-badges
function Landmarks({ width, photoBase }: { width: number; photoBase?: string }) {
  const ui = useUI()
  const wide = width >= 760
  const [selection, setSelection] = React.useState(0)
  const [badges, setBadges] = React.useState(["Trail", "Lake"])
  const [badgeWidths, setBadgeWidths] = React.useState<Record<string, number>>({})
  const badgePlaneWidth = Math.max(1, width - (wide ? 352 : 0) - 2 * ui.pad.default, badges.reduce((sum, badge) => sum + (badgeWidths[badge] ?? 0) + 18 + 8 + 2 * ui.pad.default, 0) + Math.max(0, badges.length - 1) * 8)
  const [message, setMessage] = React.useState("Choose a badge to see its activity.")
  const [favorites, setFavorites] = React.useState<number[]>([])
  const [section, setSection] = React.useState<"places" | "badges">("places")
  const place = PLACES[selection]
  const favorite = favorites.includes(selection)
  const inspector = <View testID="landmark-inspector" style={{ padding: ui.pad.default, gap: 10 }}><GText font="heading" size="lg">{place.title}</GText><GText tone="muted">{place.detail}</GText><GText size="sm">{place.distance}</GText></View>
  return <View style={{ paddingBottom: ui.pad.default }}>
    <View style={{ marginLeft: wide ? 160 : 0, marginRight: wide ? 192 : 0 }}>
      {/* Landmarks' toolbar: Share alone, Favorite and Collections sharing glass (T01) */}
      <View style={{ position: "absolute", top: 12, right: 12, zIndex: 2, flexDirection: "row", gap: 8 }}>
        <ToolbarGroup><ToolbarItem accessibilityLabel={`Share ${place.title}`} onPress={() => { void Share.share({ message: place.title }).catch(() => {}) }}><ShareIcon /></ToolbarItem></ToolbarGroup>
        <ToolbarGroup><ToolbarItem accessibilityLabel={favorite ? "Remove favorite" : "Add favorite"} accessibilityState={{ selected: favorite }} aria-pressed={favorite} onPress={() => setFavorites(current => favorite ? current.filter(v => v !== selection) : [...current, selection])}><HeartIcon fill={favorite ? ui.primary : "transparent"} color={favorite ? ui.primary : undefined} /></ToolbarItem><ToolbarItem accessibilityLabel="Add to collection" onPress={() => setMessage(`${place.title} added to Saved places.`)}><FolderPlusIcon /></ToolbarItem></ToolbarGroup>
      </View>
      <BackgroundExtension src={image(selection, photoBase)} start={wide ? 160 : 0} end={wide ? 192 : 0} style={{ minHeight: 260, aspectRatio: 4 / 3 }}>
        <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: ui.dim, padding: ui.pad.lg }}><GlassThemeProvider scheme="dark"><GText size="sm">Field collection</GText><GText font="display" size="3xl">Places to return to</GText></GlassThemeProvider></View>
      </BackgroundExtension>
    </View>
    <ScrollView horizontal accessibilityLabel="Saved places" showsHorizontalScrollIndicator contentContainerStyle={{ paddingTop: 20, paddingBottom: 12, paddingLeft: ui.pad.default + (wide ? 160 : 0), paddingRight: ui.pad.default + (wide ? 192 : 0), gap: 12 }}>
      {PLACES.map((entry, index) => <Press key={entry.id} accessibilityRole="button" accessibilityLabel={`Select ${entry.title}`} aria-pressed={selection === index} onPress={() => setSelection(index)} style={{ width: Math.max(180, width * 0.25), padding: ui.pad.sm, gap: 10, borderRadius: ui.radius.control, borderWidth: 2, borderColor: selection === index ? ui.primary : ui.glassBorder, backgroundColor: selection === index ? ui.fillStrong : ui.fill }}><Image alt="" source={{ uri: image(index, photoBase) }} accessible={false} style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: ui.radius.control }} /><GText font="heading" size="sm">{entry.title}</GText></Press>)}
    </ScrollView>
    {wide ? <Glass variant="liquid" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 160, borderRadius: 0, padding: ui.pad.default, gap: 16 }}><GText font="heading">Collections</GText>{([["places", "Saved places"], ["badges", "Activity badges"]] as const).map(([id, label]) => <Button key={id} variant={section === id ? "secondary" : "ghost"} accessibilityState={{ selected: section === id }} onPress={() => { setSection(id); setMessage(id === "places" ? "Showing saved places." : "Showing activity badges.") }}>{label}</Button>)}</Glass> : null}
    {wide ? <Glass variant="liquid" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 192, borderRadius: 0 }}>{inspector}</Glass> : inspector}
    <View style={{ marginLeft: wide ? 160 : 0, marginRight: wide ? 192 : 0, padding: ui.pad.default, gap: 14 }}>
      <ScrollView horizontal><GlassMorph value={badges.join("-")} spacing={8} style={{ width: badgePlaneWidth }}>{badges.map(badge => <GlassMorphItem key={badge} id={`activity-${badge.toLowerCase()}`} accessibilityLabel={`${badge} badge`} onPress={() => setMessage(`${badge} activity selected.`)}><GIcon><MountainIcon size={18} color={ui.foreground} /></GIcon><GText onTextLayout={event => { const measured = Math.max(0, ...event.nativeEvent.lines.map(line => line.width)); setBadgeWidths(previous => previous[badge] === measured ? previous : { ...previous, [badge]: measured }) }}>{badge}</GText></GlassMorphItem>)}</GlassMorph></ScrollView>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}><Button size="sm" variant="secondary" accessibilityLabel={badges.includes("Summit") ? "Remove summit badge" : "Add summit badge"} onPress={() => setBadges(current => current.includes("Summit") ? current.filter(b => b !== "Summit") : [...current, "Summit"])}>{badges.includes("Summit") ? "Remove Summit" : "Add Summit"}</Button><Button size="sm" variant="ghost" onPress={() => setBadges(current => [...current].reverse())}>Reverse badges</Button></View>
      <GText accessibilityLiveRegion="polite" tone="muted" size="sm">{message}</GText>
    </View>
  </View>
}

const NOTE_STYLES = ["Title", "Heading", "Body", "Monostyled"] as const
type NoteStyle = (typeof NOTE_STYLES)[number]
type NoteState = { text: string; format: NoteStyle }
/** Typing within this many milliseconds of the last keystroke joins the same undo step. */
const UNDO_PAUSE = 1000

/**
 * Undo history for the note: a run of typing is one step, as in UITextView, and a format change
 * is its own step. `typedAt` is the last keystroke; a format change or an undo ends the run.
 */
type NoteHistory = { past: NoteState[]; current: NoteState; future: NoteState[]; typedAt: number }
function noteHistory(history: NoteHistory, change: { text: string } | { format: NoteStyle }, now: number): NoteHistory {
  if ("format" in change) {
    if (change.format === history.current.format) return history
    return { past: [...history.past, history.current], current: { ...history.current, format: change.format }, future: [], typedAt: 0 }
  }
  const run = history.typedAt > 0 && now - history.typedAt < UNDO_PAUSE
  return { past: run ? history.past : [...history.past, history.current], current: { ...history.current, text: change.text }, future: [], typedAt: now }
}

// Notes: icon-only bar items with a tinted Done, a plain document, a bottom Checklist/Aa group,
// and a nonmodal system Format sheet that leaves the note editable behind it.
// https://developer.apple.com/videos/play/wwdc2026/269/?time=375
function Notes() {
  const ui = useUI()
  const accessible = useWindowDimensions().fontScale >= 1.7
  const [history, setHistory] = React.useState<NoteHistory>({ past: [], current: { text: initialNote, format: "Body" }, future: [], typedAt: 0 })
  const [saved, setSaved] = React.useState<NoteState>(history.current)
  const [pinned, setPinned] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [status, setStatus] = React.useState({ text: "", id: 0 })
  const editor = React.useRef<TextInput>(null)
  const { text, format } = history.current
  const notify = (message: string) => setStatus(current => ({ text: message, id: current.id + 1 }))
  // results show on screen for a moment and are spoken; the message then clears
  React.useEffect(() => {
    if (!status.text) return
    announce(status.text)
    const timer = setTimeout(() => setStatus(current => current.id === status.id ? { ...current, text: "" } : current), 3000)
    return () => clearTimeout(timer)
  }, [status])
  const edit = (next: string) => setHistory(current => noteHistory(current, { text: next }, Date.now()))
  const setFormat = (next: NoteStyle) => setHistory(current => noteHistory(current, { format: next }, Date.now()))
  const undo = () => setHistory(current => current.past.length ? { past: current.past.slice(0, -1), current: current.past.at(-1)!, future: [current.current, ...current.future], typedAt: 0 } : current)
  const redo = () => setHistory(current => current.future.length ? { past: [...current.past, current.current], current: current.future[0], future: current.future.slice(1), typedAt: 0 } : current)
  const save = () => { setSaved(history.current); notify("Note saved."); setOpen(false); editor.current?.blur() }
  // closing Format would otherwise raise the keyboard over Aa: the editor took focus without it
  const changeOpen = (next: boolean) => { setOpen(next); if (!next) editor.current?.blur() }
  const share = async () => { try { const result = await Share.share({ message: text }); if (result.action === Share.sharedAction) notify("Note shared.") } catch { notify("Sharing closed. Your note is still here.") } }
  const type = format === "Title" ? { fontSize: ui.text["3xl"], fontWeight: "700" as const } : format === "Heading" ? { fontSize: ui.text.xl, fontWeight: "700" as const } : format === "Monostyled" ? { fontSize: ui.text.base, fontFamily: ui.fonts.mono } : { fontSize: ui.text.base }
  return <Sheet open={open} onOpenChange={changeOpen}>
    <View style={{ flex: 1, minHeight: 620 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingTop: 12 }}>
        <ToolbarCommands style={{ flex: 1 }} accessibilityLabel="Note actions" overflowLabel="More note actions" commands={[
          { id: "undo", label: "Undo", icon: <Undo2Icon />, priority: 20, disabled: !history.past.length, onSelect: undo },
          { id: "redo", label: "Redo", icon: <Redo2Icon />, priority: 20, disabled: !history.future.length, onSelect: redo },
          { id: "pin", label: pinned ? "Unpin note" : "Pin note", icon: pinned ? <PinOffIcon /> : <PinIcon />, priority: 1, onSelect: () => { setPinned(!pinned); notify(pinned ? "Note unpinned." : "Note pinned.") } },
          { id: "word-count", label: "Word count", overflow: "always", onSelect: () => { const words = text.trim().split(/\s+/).filter(Boolean).length; notify(`${words} ${words === 1 ? "word" : "words"}`) } },
          { id: "share", label: "Share", icon: <ShareIcon />, pinned: true, onSelect: () => { void share() } },
        ]} />
        <ToolbarItem prominent accessibilityLabel="Done" onPress={save}><CheckIcon /></ToolbarItem>
      </View>
      <View style={{ flex: 1, paddingHorizontal: ui.pad.lg, paddingTop: 12, paddingBottom: 96, gap: 4 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", columnGap: 6 }}>
          {pinned ? <View accessible accessibilityLabel="Pinned" style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><GIcon><PinIcon size={12} color={ui.primary} fill={ui.primary} /></GIcon><GText size="xs" weight="600" color={ui.primary}>Pinned</GText></View> : null}
          <GText size="xs" tone="muted" align="center">November 10, 2026 at 9:41 AM</GText>
        </View>
        {status.text ? <GText testID="note-status" size="xs" weight="600" align="center" style={{ alignSelf: "center", marginTop: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: ui.radius.badge, backgroundColor: ui.fillStrong, overflow: "hidden" }}>{status.text}</GText> : null}
        <GText font="heading" size="3xl" weight="700" accessibilityRole="header" style={{ marginTop: 8 }}>A day by the lake</GText>
        <TextInput ref={editor} accessibilityLabel="Note text" multiline scrollEnabled={false} showSoftInputOnFocus={!open} textAlignVertical="top" value={text} onChangeText={edit} selectionColor={ui.primary} style={[{ minHeight: 200, color: ui.foreground, fontFamily: ui.fonts.sans, padding: 0 }, type, { lineHeight: Math.round(type.fontSize * (format === "Title" || format === "Heading" ? 1.2 : 1.4)) }]} />
      </View>
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 16, alignItems: "center" }}>
        {/* accessibility sizes open taller, so every format shows without scrolling */}
        <SheetContent side="bottom" modal={false} detents={accessible ? ["medium", "large"] : [0.3, "medium"]} anchor={<Button variant="glass" onAction={() => setOpen(true)} testID="notes-format" accessibilityLabel="Format note">Aa</Button>} style={{ padding: ui.pad.default }}>
          <SheetHeader style={{ paddingHorizontal: 0 }}><SheetTitle>Format</SheetTitle><SheetDescription>Applies to this note.</SheetDescription></SheetHeader>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{NOTE_STYLES.map(item => <Button key={item} variant={format === item ? "default" : "secondary"} aria-pressed={format === item} accessibilityState={{ selected: format === item }} onPress={() => setFormat(item)}>{item}</Button>)}</View>
        </SheetContent>
      </View>
      <GText style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} accessibilityLiveRegion="polite">{saved.text === text && saved.format === format ? "Saved" : "Draft"}</GText>
    </View>
  </Sheet>
}

const LIBRARY = [{ title: "Alpine lake", kind: "Places", text: "Water and a quiet trail." }, { title: "Open coast", kind: "Places", text: "The path beside the sea." }, { title: "Summit journal", kind: "Notes", text: "Bring a field guide for the ridge." }]
// One search field with a scope bar under it; recents as a list. At regular width the folders
// move into a sidebar with their own filter (S06), the library gets an inline filter (S04),
// and the selected result stays visible beside the results (S05).
// https://developer.apple.com/videos/play/wwdc2026/292/
function Search({ width }: { width: number }) {
  const ui = useUI()
  const wide = width >= 700
  // at accessibility sizes the scope stacks and rows wrap, so no label breaks mid-word
  const { fontScale } = useWindowDimensions()
  const large = fontScale >= 1.35
  const [mode, setMode] = React.useState<"destination" | "prominent">("destination")
  const [query, setQuery] = React.useState("")
  const [local, setLocal] = React.useState("")
  const [folderQuery, setFolderQuery] = React.useState("")
  const [scope, setScope] = React.useState("All")
  const [recent, setRecent] = React.useState(["Coast", "Lake"])
  const [selected, setSelected] = React.useState(LIBRARY[0])
  const results = LIBRARY.filter(entry => (scope === "All" || entry.kind === scope) && `${entry.title} ${entry.text}`.toLowerCase().includes(query.toLowerCase()) && entry.title.toLowerCase().includes(local.toLowerCase()))
  // the detail follows the results: a filtered-out selection isn't left on screen
  const current = results.find(entry => entry.title === selected.title) ?? results[0]
  const submit = (value: string) => { setQuery(value); if (value.trim()) setRecent(current => [value, ...current.filter(item => item !== value)].slice(0, 4)) }
  const suggestions = query ? LIBRARY.filter(entry => entry.title.toLowerCase().startsWith(query.toLowerCase()) && entry.title.toLowerCase() !== query.toLowerCase()).map(entry => ({ value: entry.title, label: <GText>{entry.title.slice(0, query.length)}<GText weight="700">{entry.title.slice(query.length)}</GText></GText> })) : []
  const folders = ["All", "Places", "Notes"].filter(item => item.toLowerCase().includes(folderQuery.toLowerCase()))
  const scopeBar = <View accessibilityRole="tablist" accessibilityLabel="Scope" style={wide || large ? { gap: 2 } : { flexDirection: "row", padding: 3, gap: 2, borderRadius: ui.radius.button, backgroundColor: ui.fill }}>{folders.map(item => <Press key={item} accessibilityRole="button" accessibilityLabel={`Show ${item} folder`} aria-pressed={scope === item} accessibilityState={{ selected: scope === item }} onPress={() => setScope(item)} style={[{ minHeight: wide || large ? 44 : 34, justifyContent: "center", paddingHorizontal: 12, borderRadius: wide || large ? ui.radius.control : ui.radius.button }, wide || large ? { backgroundColor: scope === item ? ui.fillStrong : "transparent" } : { flex: 1, alignItems: "center", backgroundColor: scope === item ? ui.glassSolid : "transparent" }]}><GText size="sm" weight={scope === item ? "600" : "400"} tone={scope === item ? "default" : "muted"}>{item}</GText></Press>)}</View>
  const list = <View style={{ flex: 1, gap: 16 }}>
    {wide ? <Input accessibilityLabel="Filter this library" placeholder={`Filter ${scope === "All" ? "this library" : scope.toLowerCase()}`} value={local} onChangeText={setLocal} /> : null}
    {!query && !local ? <View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", columnGap: 8 }}><GText weight="600" accessibilityRole="header" style={{ flexShrink: 1 }}>Recent Searches</GText>{recent.length ? <Button variant="ghost" size="sm" onPress={() => setRecent([])}><GText size="sm" weight="600" color={ui.primary}>Clear</GText></Button> : null}</View>
      {recent.map(item => <View key={item} style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 44, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: ui.separator }}><GIcon><HistoryIcon size={16} color={ui.mutedForeground} /></GIcon><Press accessibilityRole="button" accessibilityLabel={`Search recent ${item}`} onPress={() => submit(item)} style={{ flex: 1, minHeight: 44, justifyContent: "center" }}><GText>{item}</GText></Press><Press accessibilityRole="button" accessibilityLabel={`Remove recent ${item}`} onPress={() => setRecent(current => current.filter(value => value !== item))} hitSlop={8} style={{ minWidth: 32, minHeight: 32, alignItems: "center", justifyContent: "center" }}><GIcon><XIcon size={16} color={ui.mutedForeground} /></GIcon></Press></View>)}
      {!recent.length ? <GText size="sm" tone="muted" style={{ paddingVertical: 8 }}>Your next search will appear here.</GText> : null}
    </View> : null}
    {results.length ? <View accessibilityLabel="Search results" style={{ borderRadius: ui.radius.control, backgroundColor: ui.fill, overflow: "hidden" }}>{results.map((entry, i) => <Press key={entry.title} accessibilityRole="button" accessibilityLabel={`Open ${entry.title}`} aria-pressed={current?.title === entry.title} onPress={() => setSelected(entry)} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: current?.title === entry.title ? ui.fillStrong : "transparent", borderTopWidth: i ? StyleSheet.hairlineWidth : 0, borderTopColor: ui.separator }}><View style={{ flex: 1 }}><GText weight="500">{entry.title}</GText><GText size="sm" tone="muted">{entry.kind}</GText></View><GIcon><ChevronRightIcon size={16} color={ui.labelTertiary} /></GIcon></Press>)}</View>
      : <View style={{ alignItems: "center", gap: 6, paddingVertical: 28 }}><GIcon><SearchIcon size={40} color={ui.labelTertiary} /></GIcon><GText size="lg" weight="700">No Results</GText><GText size="sm" tone="muted" align="center">No results for “{query || local}”. Check the spelling or try a new search.</GText><Button size="sm" variant="ghost" onPress={() => { setQuery(""); setLocal(""); setScope("All") }}><GText size="sm" weight="600" color={ui.primary}>Clear filters</GText></Button></View>}
    {current ? <View accessibilityLabel="Selected result" style={{ padding: ui.pad.default, borderRadius: ui.radius.control, backgroundColor: ui.fill, gap: 6 }}><GText tone="muted" size="sm">{current.kind}</GText><GText size="lg" weight="700">{current.title}</GText><GText>{current.text}</GText></View> : null}
  </View>
  return <View style={{ padding: ui.pad.lg, gap: 16 }}>
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}><GText font="heading" size="3xl" weight="700" accessibilityRole="header">Collections</GText><View style={{ flexDirection: "row", flexWrap: "wrap", flexShrink: 1, gap: 8 }}><Button variant={mode === "destination" ? "secondary" : "ghost"} size="sm" accessibilityLabel="Search destination" aria-pressed={mode === "destination"} accessibilityState={{ selected: mode === "destination" }} onPress={() => { setMode("destination"); setQuery("") }}>Browse</Button><Button variant={mode === "prominent" ? "secondary" : "ghost"} size="sm" testID="search-now" accessibilityLabel="Search now" aria-pressed={mode === "prominent"} accessibilityState={{ selected: mode === "prominent" }} onPress={() => setMode("prominent")}>Search now</Button></View></View>
    <SearchField key={mode} accessibilityLabel="Search all collections" placeholder="Search all collections" value={query} onValueChange={setQuery} tokens={scope === "All" ? [] : [{ id: "scope", label: scope }]} onTokenRemove={() => setScope("All")} onSubmit={submit} autoFocus={mode === "prominent"} suggestions={suggestions} onSuggestionSelect={submit} onCancel={() => setMode("destination")} />
    {wide ? <View style={{ flexDirection: "row", gap: 20 }}>
      <View style={{ width: 170, gap: 8 }}><GText tone="muted" size="sm">Folders</GText><Input accessibilityLabel="Search folders" placeholder="Find a folder" value={folderQuery} onChangeText={setFolderQuery} />{scopeBar}</View>
      {list}
    </View> : <>{scopeBar}{list}</>}
  </View>
}

// https://developer.apple.com/design/human-interface-guidelines/materials
function Materials({ width, photoBase }: { width: number; photoBase?: string }) {
  const ui = useUI()
  // two tiles a row break words at accessibility sizes; one per row keeps them whole
  const { fontScale } = useWindowDimensions()
  const [dark, setDark] = React.useState(false)
  const [balance, setBalance] = React.useState([0])
  const [progress, setProgress] = React.useState([35])
  const [inset, setInset] = React.useState([12])
  const [playing, setPlaying] = React.useState([false, false, false])
  return <View style={{ padding: ui.pad.lg, gap: 24 }}>
    <GText font="heading" size="2xl">Material study</GText><Button variant="secondary" aria-pressed={dark} onPress={() => setDark(current => !current)}>{dark ? "Bright content" : "Dark content"}</Button>
    <View style={{ gap: 16, padding: ui.pad.default, borderRadius: ui.radius.surface, overflow: "hidden" }}><Backdrop variant="image" src={image(dark ? 2 : 1, photoBase)} dim={dark ? 0.7 : 0} />
      <Glass variant="liquid" style={{ alignSelf: "flex-start", padding: ui.pad.sm, borderRadius: ui.radius.button }}><GText font="heading" size="sm">Regular · small</GText></Glass><Glass variant="liquid" style={{ gap: 8, padding: ui.pad.lg, borderRadius: ui.radius.surface }}><GText font="heading" size="lg">Regular · large</GText><GText tone="muted" size="sm">Secondary foreground</GText><GText color={ui.labelTertiary} size="sm">Tertiary foreground</GText></Glass>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>{(["ultraThin", "thin", "regular", "thick"] as const).map(level => <Glass key={level} intensity={level} style={{ flexGrow: 1, flexBasis: fontScale >= 1.35 ? "100%" : "40%", padding: ui.pad.default, gap: 6, borderRadius: ui.radius.control }}><GText font="heading" size="sm">{level}</GText><GText tone="muted" size="sm">Standard material</GText></Glass>)}</View>
    </View>
    <View style={{ flexDirection: width > 700 ? "row" : "column", gap: 12 }}>{["Bright media", "Dark media", "Already dimmed media"].map((label, index) => <GlassThemeProvider key={label} scheme="dark"><MediaCase index={index} label={label} photoBase={photoBase} playing={playing[index]} onToggle={() => setPlaying(current => current.map((value, i) => i === index ? !value : value))} /></GlassThemeProvider>)}</View>
    <View style={{ gap: 16 }}><GText size="sm">Balance · {balance[0]}</GText><Slider accessibilityLabel="Neutral balance" min={-2} max={2} step={1} ticks neutralValue={0} value={balance} onValueChange={setBalance} /><GText size="sm">Progress · {progress[0]}%</GText><Slider accessibilityLabel="Playback progress" variant="progress" value={progress} onValueChange={setProgress} formatValue={value => `${value}%`} /></View>
    <View style={{ gap: 12 }}><GText size="sm">Control inset · {inset[0]}</GText><Slider accessibilityLabel="Control inset" min={4} max={24} value={inset} onValueChange={setInset} /><View style={{ padding: inset[0], borderRadius: ui.radius.surface, backgroundColor: ui.fill }}><Button variant="secondary" style={{ alignSelf: "stretch", borderRadius: Math.max(0, ui.radius.surface - inset[0]) }} onPress={() => setInset([12])}>Reset inset</Button></View></View>
  </View>
}

function MediaCase({ index, label, playing, onToggle, photoBase }: { index: number; label: string; playing: boolean; onToggle: () => void; photoBase?: string }) {
  const ui = useUI()
  return <View style={{ flex: 1, minHeight: 160, padding: ui.pad.sm, gap: 24, justifyContent: "space-between", borderRadius: ui.radius.surface, overflow: "hidden", backgroundColor: ui.auroraBase }}>
    {/* dark media is dark content of its own, not a dimmed photo: a deep colour field */}
    {index === 1 ? <Backdrop variant="mesh" dim={0.6} /> : <Backdrop variant="image" src={image(index === 0 ? 1 : 0, photoBase)} dim={index === 0 ? 0.35 : 0.65} />}<GText size="sm">{label}</GText><Glass variant="liquid-clear" style={{ alignSelf: "flex-start", borderRadius: ui.radius.button }}><Button variant="ghost" accessibilityLabel={`${playing ? "Hide details" : "Show details"} ${label.toLowerCase()}`} onPress={onToggle}>{playing ? "Hide details" : "Details"}</Button></Glass>{playing ? <GText size="sm">{index === 1 ? "Night recording · 21:45" : "Field recording · 06:30"}</GText> : null}
  </View>
}
