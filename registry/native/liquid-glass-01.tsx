import * as React from "react"
import { Image, Platform, ScrollView, Share, StyleSheet, TextInput, View, useWindowDimensions, type StyleProp, type TextInputProps, type ViewStyle } from "react-native"
import { KeyboardStickyView } from "react-native-keyboard-controller"
import { ArchiveIcon, BookOpenTextIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, CoffeeIcon, CropIcon, EllipsisIcon, FileIcon, FlagIcon, HeartIcon, HouseIcon, InboxIcon, InfoIcon, LayersIcon, LibraryIcon, ListFilterIcon, NavigationIcon, PanelLeftIcon, PauseIcon, PlayIcon, RadioIcon, RotateCcwIcon, RotateCwIcon, ShareIcon, SkipForwardIcon, SlidersHorizontalIcon, SquarePenIcon, SunIcon, ThermometerIcon, Trash2Icon, TreesIcon, WavesIcon, XIcon, type LucideIcon } from "lucide-react-native"
import type { ImageProps as SwiftImageProps } from "@expo/ui/swift-ui"
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg"

import { useReducedMotion, useReduceTransparency } from "@/components/glass/native/a11y"
import { Backdrop } from "@/components/glass/native/backdrop"
import { ActionSheet, ActionSheetAction, ActionSheetContent, ActionSheetTrigger } from "@/components/glass/native/action-sheet"
import { Button } from "@/components/glass/native/button"
import { Dock, DockAccessory, DockBar, DockItem, DockSearch, usePlacement } from "@/components/glass/native/dock"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/glass/native/dropdown-menu"
import { Glass, GlassEffectGroup, hasLiquidGlass } from "@/components/glass/native/glass"
import { GlassMorph, GlassMorphItem } from "@/components/glass/native/glass-morph"
import { Input } from "@/components/glass/native/input"
import { Press, haptics } from "@/components/glass/native/press"
import { ScrollEdge, ScrollEdgeProvider, useScrollEdges } from "@/components/glass/native/scroll-edge"
import { SearchField } from "@/components/glass/native/search-field"
import { SegmentedControl, SegmentedControlItem } from "@/components/glass/native/segmented-control"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/glass/native/sheet"
import { Slider } from "@/components/glass/native/slider"
import { GlassThemeProvider, nativeControlTheme, useGlassThemeOptions } from "@/components/glass/native/tokens"
import { GIcon, GText, alpha, useGlassForeground, useUI } from "@/components/glass/native/ui"

export type LiquidGlassScene = "photos" | "music" | "maps" | "safari" | "mail" | "controls"
export type LiquidGlass01Props = {
  scene?: LiquidGlassScene
  /** Optional URL containing alpine.jpg, coast.jpg, and summit.jpg. */
  photoBase?: string
  style?: StyleProp<ViewStyle>
}

const PICTURES = [
  { file: "alpine.jpg", uri: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=85", title: "By the lake", location: "The Alps", date: "September 18", description: "Mountain peaks reflected in a still alpine lake" },
  { file: "coast.jpg", uri: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85", title: "Open country", location: "The Highlands", date: "September 19", description: "An open landscape beneath a wide sky" },
  { file: "summit.jpg", uri: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85", title: "Above the clouds", location: "At the summit", date: "September 20", description: "A mountain summit rising above the surrounding peaks" },
] as const
const pictureURI = (index: number, base?: string) => base ? `${base.replace(/\/$/, "")}/${PICTURES[index % PICTURES.length].file}` : PICTURES[index % PICTURES.length].uri
const row: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 12 }


/** Six interactive compositions using native system glass, controls, menus, and sheets. */
export function LiquidGlass01({ scene = "photos", photoBase, style }: LiquidGlass01Props) {
  const ui = useUI()
  const [width, setWidth] = React.useState(360)
  // a fixed viewport, like an app window: large text reflows the chrome and content scrolls,
  // rather than the scene growing several screens tall
  const height = 620
  return (
    <View testID={`liquid-glass-scene-${scene}`} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={[{ height, minHeight: height, borderRadius: ui.radius.surface, overflow: "hidden", backgroundColor: ui.auroraBase }, style]}>
      {scene === "photos" ? <GlassThemeProvider scheme="dark"><PhotosScene photoBase={photoBase} presentationScheme={ui.scheme} width={width} /></GlassThemeProvider> : null}
      {scene === "music" ? <MusicScene photoBase={photoBase} /> : null}
      {scene === "maps" ? <MapsScene /> : null}
      {scene === "safari" ? <SafariScene photoBase={photoBase} /> : null}
      {scene === "mail" ? <MailScene width={width} /> : null}
      {scene === "controls" ? <GlassThemeProvider scheme="dark"><ControlsScene width={width} photoBase={photoBase} /></GlassThemeProvider> : null}
    </View>
  )
}

function FloatingIcon({ icon: Icon, label, onPress, active, clear = false, disabled = false }: { icon: LucideIcon; label: string; onPress: () => void; active?: boolean; clear?: boolean; disabled?: boolean }) {
  const ui = useUI()
  return (
    <Press haptic liquid accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: active, disabled }} aria-pressed={active} disabled={disabled} aria-disabled={disabled} onPress={onPress}>
      <Glass variant={clear ? "liquid-clear" : "liquid"} interactive={!disabled} radius={ui.radius.button} style={{ minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" }}>
        <GIcon><Icon size={21} color={active ? ui.primary : ui.foreground} style={{ opacity: disabled ? 0.35 : 1 }} /></GIcon>
      </Glass>
    </Press>
  )
}

function PlainIcon({ icon: Icon, label, onPress, active, disabled }: { icon: LucideIcon; label: string; onPress: () => void; active?: boolean; disabled?: boolean }) {
  const ui = useUI()
  return (
    <Press haptic accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: active, disabled }} aria-pressed={active} aria-disabled={disabled} disabled={disabled} onPress={onPress} style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: ui.radius.button }}>
      <GIcon><Icon size={21} color={active ? ui.primary : ui.foreground} style={{ opacity: disabled ? 0.35 : 1 }} /></GIcon>
    </Press>
  )
}

function InfoSheet({ open, onOpenChange, title, description, modal = true, children }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; modal?: boolean; children?: React.ReactNode }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" detents={["medium", "large"]} modal={modal} style={{ paddingHorizontal: 20, gap: 16 }}>
        <SheetHeader style={{ paddingHorizontal: 0 }}><SheetTitle>{title}</SheetTitle><SheetDescription>{description}</SheetDescription></SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  )
}

// iOS 27 Photos one-up: swipe between photos, clear controls over the image, Share and Delete
// alone at the bottom corners with Favorite/Info grouped between. Only the bands under the
// controls are dimmed (HIG Materials: about 35% behind clear glass over bright media).
function PhotosScene({ photoBase, presentationScheme, width }: { photoBase?: string; presentationScheme: "light" | "dark"; width: number }) {
  const ui = useUI()
  const pager = React.useRef<ScrollView>(null)
  const [photos, setPhotos] = React.useState([0, 1, 2])
  const [index, setIndex] = React.useState(0)
  const [favorites, setFavorites] = React.useState<number[]>([])
  const [info, setInfo] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const id = photos[Math.min(index, photos.length - 1)]
  const photo = PICTURES[id]
  const favorite = favorites.includes(id)
  const go = (next: number) => {
    const target = (next + photos.length) % photos.length
    setIndex(target)
    pager.current?.scrollTo({ x: target * width, animated: true })
  }
  const share = () => {
    if (Platform.OS === "web") return setInfo(true)
    void Share.share({ message: photo.title, url: pictureURI(id, photoBase) }).catch(() => setInfo(true))
  }
  const remove = () => {
    if (photos.length === 1) return
    setPhotos((all) => all.filter((n) => n !== id))
    setIndex((i) => Math.min(i, photos.length - 2))
  }
  return (
    <View style={{ flex: 1 }}>
      <ScrollView ref={pager} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / Math.max(1, width)))} style={StyleSheet.absoluteFill}
        accessible accessibilityRole="adjustable" accessibilityLabel={photo.description} accessibilityValue={{ text: `Photo ${index + 1} of ${photos.length}` }}
        accessibilityActions={[{ name: "increment", label: "Next photo" }, { name: "decrement", label: "Previous photo" }]} onAccessibilityAction={(e) => go(index + (e.nativeEvent.actionName === "increment" ? 1 : -1))}>
        {photos.map((n) => <Image key={n} source={{ uri: pictureURI(n, photoBase) }} alt="" accessible={false} style={{ width, height: "100%" }} resizeMode="cover" />)}
      </ScrollView>
      <MediaBands />
      <View style={[row, { padding: 16, alignItems: "flex-start" }]}>
        <View style={{ width: 48 }} />
        <View style={{ flex: 1, alignItems: "center", gap: 1, paddingTop: 4 }}><GText weight="600" numberOfLines={1}>{photo.location}</GText><GText size="xs" numberOfLines={1}>{photo.date} at 4:28 PM</GText></View>
        <DropdownMenu>
          <DropdownMenuTrigger accessibilityLabel="Photo options">
            <Glass variant="liquid-clear" interactive radius={ui.radius.button} style={{ minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" }}><EllipsisIcon size={22} color={ui.foreground} /></Glass>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem systemImage="info.circle" onSelect={() => setInfo(true)}>Show Info</DropdownMenuItem>
            <DropdownMenuItem systemImage="rectangle.stack.badge.plus" onSelect={() => setSaved((v) => !v)}>{saved ? "Remove from Album" : "Add to Album"}</DropdownMenuItem>
            <DropdownMenuItem systemImage="chevron.forward" onSelect={() => go(index + 1)}>Next Photo</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </View>
      <GlassEffectGroup merge spacing={16} style={[row, { position: "absolute", bottom: 24, left: 16, right: 16, justifyContent: "space-between" }]}>
        <FloatingIcon clear icon={ShareIcon} label="Share photo" onPress={share} />
        <Glass variant="liquid-clear" interactive radius={ui.radius.button} style={[row, { paddingHorizontal: 6, paddingVertical: 2, gap: 4 }]}>
          <PlainIcon icon={HeartIcon} label={favorite ? "Remove favorite" : "Favorite photo"} active={favorite} onPress={() => setFavorites((v) => favorite ? v.filter((n) => n !== id) : [...v, id])} />
          <PlainIcon icon={InfoIcon} label="Show photo details" onPress={() => setInfo(true)} />
        </Glass>
        {/* Delete's glass and glyph belong to the group, so they render and merge like Share's; the
            press goes to the trigger below, which sits over it outside the group */}
        {photos.length > 1 ? (
          <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Glass variant="liquid-clear" interactive radius={ui.radius.button} style={{ minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" }}><GIcon><Trash2Icon size={21} color={ui.foreground} /></GIcon></Glass>
          </View>
        ) : <View style={{ width: 48 }} />}
      </GlassEffectGroup>
      {/* the trigger stays outside the clear-glass group: a system dialog anchored inside a glass
          container renders translucent and loses its source placement */}
      {photos.length > 1 ? <View style={{ position: "absolute", right: 16, bottom: 24 }}>
        <ActionSheet>
          <ActionSheetTrigger accessibilityLabel="Delete photo">
            <View testID="photos-delete-anchor" style={{ width: 48, height: 48 }} />
          </ActionSheetTrigger>
          <ActionSheetContent><ActionSheetAction variant="destructive" onAction={remove}>Delete Photo</ActionSheetAction></ActionSheetContent>
        </ActionSheet>
      </View> : null}
      <GlassThemeProvider scheme={presentationScheme}><InfoSheet open={info} onOpenChange={setInfo} title={photo.title} description={`${photo.location} · ${photo.date}`}>
        <Image source={{ uri: pictureURI(id, photoBase) }} alt={photo.description} accessibilityLabel={photo.description} style={{ width: "100%", height: 140, borderRadius: ui.radius.control }} />
        <GText size="sm" selectable>{photo.description}</GText>
        <GText size="sm">{favorite ? "In Favorites" : "Not in Favorites"}{saved ? " · In an album" : ""}</GText>
      </InfoSheet></GlassThemeProvider>
    </View>
  )
}

/** 35% dark bands behind the top and bottom controls, fading out toward the middle of the photo. */
function MediaBands() {
  return <Svg pointerEvents="none" style={StyleSheet.absoluteFill} preserveAspectRatio="none" viewBox="0,0,100,100">
    <Defs><LinearGradient id="photo-bands" x1="0" y1="0" x2="0" y2="1">
      <Stop offset="0" stopColor="#000" stopOpacity={0.35} /><Stop offset="0.28" stopColor="#000" stopOpacity={0} />
      <Stop offset="0.68" stopColor="#000" stopOpacity={0} /><Stop offset="1" stopColor="#000" stopOpacity={0.35} />
    </LinearGradient></Defs>
    <Rect x="0" y="0" width="100" height="100" fill="url(#photo-bands)" />
  </Svg>
}

const TRACKS = [
  { title: "A little further", artist: "North of Here", subtitle: "An afternoon without a plan", picture: 0 },
  { title: "Wide open", artist: "The Long Way", subtitle: "Songs for the coast road", picture: 1 },
  { title: "Through the trees", artist: "Soft Light", subtitle: "Find your own pace", picture: 2 },
]

function MiniPlayer({ track, playing, toggle, next, photoBase }: { track: number; playing: boolean; toggle: () => void; next: () => void; photoBase?: string }) {
  const ui = useUI()
  const placement = usePlacement()
  const song = TRACKS[track]
  return (
    <DockAccessory style={{ minHeight: 56, height: undefined, gap: 8 }}>
      <Image source={{ uri: pictureURI(song.picture, photoBase) }} alt={`${song.title} artwork`} accessibilityLabel={`${song.title} artwork`} style={{ width: 36, height: 36, borderRadius: ui.radius.control }} />
      {/* bar text: it grows only to the largest standard size, so the accessory stays one row */}
      <View style={{ flex: 1 }}><GText size="sm" weight="600" numberOfLines={1} maxFontSizeMultiplier={1.35}>{song.title}</GText>{placement === "expanded" ? <GText size="xs" tone="muted" numberOfLines={1} maxFontSizeMultiplier={1.35}>{song.artist}</GText> : null}</View>
      <PlainIcon icon={playing ? PauseIcon : PlayIcon} label={playing ? "Pause music" : "Play music"} onPress={toggle} />
      {placement === "expanded" ? <PlainIcon icon={SkipForwardIcon} label="Next track" onPress={next} /> : null}
    </DockAccessory>
  )
}

function MusicScene({ photoBase }: { photoBase?: string }) {
  const ui = useUI()
  // accessibility text sizes (AX1 is 1.786): the bar starts folded to the current tab and Search,
  // and songs become rows, so the list fills the scene rather than the chrome
  const accessible = useWindowDimensions().fontScale >= 1.7
  const edges = useScrollEdges()
  const scroll = React.useRef<ScrollView>(null)
  const [tab, setTab] = React.useState("home")
  const [tabsOpen, setTabsOpen] = React.useState(false)
  const [track, setTrack] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const tracks = TRACKS.map((song, i) => ({ ...song, i })).filter((song) => `${song.title} ${song.artist}`.toLowerCase().includes(query.toLowerCase()))
  const folded = accessible && !tabsOpen
  // folded, the one tab opens the bar; choosing a tab folds it again
  const chooseTab = (value: string) => {
    if (folded) return setTabsOpen(true)
    setTab(value)
    setTabsOpen(false)
  }
  return (
    <ScrollEdgeProvider value={edges}>
      <ScrollView ref={scroll} onScroll={edges.onScroll} scrollEventThrottle={16} nestedScrollEnabled keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, paddingBottom: 180, gap: 24 }}>
        <GText size="3xl" font="heading" accessibilityRole="header">{tab === "home" ? "Home" : tab === "library" ? "Library" : "Radio"}</GText>
        {tab === "radio" ? <GText tone="muted">A station for the road ahead.</GText> : null}
        {!query ? tracks.map((song) => (
          <Press key={song.title} accessibilityRole="button" accessibilityLabel={`Play ${song.title} by ${song.artist}`} onPress={() => { setTrack(song.i); setPlaying(true) }} style={{ gap: 10 }}>
            <Image source={{ uri: pictureURI(song.picture, photoBase) }} alt={`${song.title} artwork`} accessibilityLabel={`${song.title} artwork`} style={accessible ? { width: 88, height: 88, borderRadius: ui.radius.control } : { width: "100%", height: tab === "library" ? 132 : 220, borderRadius: ui.radius.surface }} />
            <View style={[row, { justifyContent: "space-between" }]}><View style={{ flex: 1, gap: 3 }}><GText size={accessible ? "base" : "lg"} font="heading">{song.title}</GText><GText size="sm" tone="muted">{tab === "library" ? song.artist : song.subtitle}</GText></View>{accessible ? null : <PlayIcon size={22} color={ui.primary} />}</View>
          </Press>
        )) : null}
      </ScrollView>
      <ScrollEdge edge="bottom" variant="automatic" size={148} visible={edges.overBottom} />
      {query ? (
        <View style={{ position: "absolute", left: 24, right: 24, bottom: 112, maxHeight: 300, borderRadius: ui.radius.surface, backgroundColor: ui.auroraBase }}>
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, gap: 16 }}>
            {tracks.length ? tracks.map((song) => <Press key={song.title} accessibilityRole="button" accessibilityLabel={`Play ${song.title} by ${song.artist}`} onPress={() => { setTrack(song.i); setPlaying(true) }} style={[row, { minHeight: 48 }]}><Image source={{ uri: pictureURI(song.picture, photoBase) }} alt={`${song.title} artwork`} style={{ width: 44, height: 44, borderRadius: ui.radius.control }} /><View style={{ flex: 1 }}><GText weight="600">{song.title}</GText><GText size="sm" tone="muted">{song.artist}</GText></View><PlayIcon size={20} color={ui.primary} /></Press>) : <GText>No songs match “{query}”.</GText>}
          </ScrollView>
        </View>
      ) : null}
      <Dock minimizeBehavior="onScrollDown" minimized={accessible ? folded : undefined} style={{ bottom: 16 }}>
        <MiniPlayer track={track} playing={playing} toggle={() => setPlaying((v) => !v)} next={() => setTrack((v) => (v + 1) % TRACKS.length)} photoBase={photoBase} />
        <DockBar value={tab} onValueChange={chooseTab} accessibilityLabel="Music sections">
          {[{ value: "home", label: "Home", icon: HouseIcon }, { value: "library", label: "Library", icon: LibraryIcon }, { value: "radio", label: "Radio", icon: RadioIcon }].map(({ value, label, icon: Icon }) => (
            <DockItem key={value} value={value} accessibilityHint={folded ? "Shows all sections" : undefined}><Icon />{label}</DockItem>
          ))}
        </DockBar>
        <DockSearch value={query} onValueChange={(value) => { setQuery(value); scroll.current?.scrollTo({ y: 0, animated: false }) }} placeholder="Search music" accessibilityLabel="Search music" />
      </Dock>
    </ScrollEdgeProvider>
  )
}

const PLACES = [
  { name: "Ocean Beach", detail: "Beach · 12 min away", category: "parks", icon: WavesIcon, tone: "info", x: "26%", y: "45%", description: "A long stretch of coast, walking trails, and room to watch the waves." },
  { name: "Sunset Coffee", detail: "Coffee · 8 min away", category: "food", icon: CoffeeIcon, tone: "warning", x: "64%", y: "37%", description: "Coffee, fresh pastries, and a sunny table by the window." },
  { name: "Golden Gate Park", detail: "Park · 6 min away", category: "parks", icon: TreesIcon, tone: "success", x: "70%", y: "53%", description: "Gardens, winding paths, and a quiet place for an afternoon walk." },
] as const

function MapArtwork({ routeIndex }: { routeIndex?: number }) {
  const ui = useUI()
  const destination = routeIndex === undefined ? undefined : PLACES[routeIndex]
  return (
    // slice keeps the art's proportions in any frame, so the location dot stays round
    <Svg width="100%" height="100%" viewBox="0,0,400,620" preserveAspectRatio="xMidYMid slice" accessibilityLabel="Map showing the coast and nearby neighborhoods">
      <Rect width="400" height="620" fill={ui.scheme === "dark" ? "#1c2229" : "#f2efe9"} />
      <Path d="M0 0 H145 Q108 110 134 200 T100 410 Q84 530 68 620 H0 Z" fill={ui.scheme === "dark" ? "#1d3448" : "#a9d3ee"} />
      <Path d="M164 350 H400 V430 H157 Z M252 76 H392 V178 H250 Z" fill={ui.scheme === "dark" ? "#22392b" : "#cfe6c5"} />
      {[165, 205, 245, 285, 325, 365].map((x) => <Path key={x} d={`M${x} 0 L${x - 30} 620`} stroke={ui.scheme === "dark" ? "#3a434d" : "#ffffff"} strokeWidth={7} />)}
      {[100, 160, 220, 280, 340, 400, 460, 520, 580].map((y) => <Path key={y} d={`M110 ${y} L400 ${y + 24}`} stroke={ui.scheme === "dark" ? "#3a434d" : "#ffffff"} strokeWidth={7} />)}
      <Path d="M148 620 Q168 460 177 332 Q184 184 246 0" stroke={ui.scheme === "dark" ? "#8a6d3b" : "#f6c96b"} strokeWidth={9} fill="none" />
      {destination ? <Path d={`M208 336 L208 ${parseFloat(destination.y) * 6.2} L${parseFloat(destination.x) * 4} ${parseFloat(destination.y) * 6.2}`} stroke={ui.info} strokeWidth={6} strokeLinejoin="round" fill="none" /> : null}
      <Circle cx="208" cy="336" r="13" fill={alpha(ui.info, 0.2)} /><Circle cx="208" cy="336" r="6.5" fill={ui.info} stroke="#ffffff" strokeWidth={3} />
    </Svg>
  )
}

// iPhone Maps: the map fills the screen, map controls stack at the top trailing corner, and
// search lives in the card at the bottom with the results under it.
function MapsScene() {
  const ui = useUI()
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState("all")
  const [selected, setSelected] = React.useState(0)
  const [open, setOpen] = React.useState(false)
  const [route, setRoute] = React.useState(false)
  const [searching, setSearching] = React.useState(false)
  const place = PLACES[selected]
  const places = PLACES.map((p, i) => ({ ...p, i })).filter((p) => (category === "all" || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase()))
  const show = (i: number) => { setSelected(i); setOpen(true); setRoute(false) }
  return (
    <View style={{ flex: 1 }}>
      <View style={StyleSheet.absoluteFill}><MapArtwork routeIndex={route ? selected : undefined} /></View>
      {places.map((p) => {
        const Icon = p.icon
        return <Press key={p.name} accessibilityRole="button" accessibilityLabel={`Show ${p.name}`} onPress={() => show(p.i)} style={{ position: "absolute", left: p.x, top: p.y, transform: [{ translateX: -22 }], alignItems: "center", minHeight: 44, gap: 2 }}>
          <View style={{ backgroundColor: ui[p.tone], width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: "#ffffff", alignItems: "center", justifyContent: "center" }}><Icon size={16} color="#ffffff" /></View>
          <GText size="xs" weight="600" numberOfLines={2} style={{ maxWidth: 110, textAlign: "center", textShadowColor: ui.scheme === "dark" ? "#000000" : "#ffffff", textShadowRadius: 3, textShadowOffset: { width: 0, height: 0 } }}>{p.name}</GText>
        </Press>
      })}
      <Glass variant="liquid" radius={ui.radius.button} style={{ position: "absolute", right: 16, top: 16 }}>
        <PlainIcon icon={LayersIcon} label="Map style" onPress={() => setCategory("all")} />
        <PlainIcon icon={NavigationIcon} label="Current location" onPress={() => { setQuery(""); setRoute(false) }} />
      </Glass>
      {/* the search card rides the keyboard, as Maps' does, so the field, Cancel and results stay above it.
          At rest it holds only the field and categories, clear of the pins; a place's sheet replaces it */}
      {open ? null : <KeyboardStickyView style={{ position: "absolute", left: 12, right: 12, bottom: 12 }}>
      <Glass variant="liquid" radius={ui.radius.surface} style={{ padding: 14, gap: 12 }}>
        <SearchField value={query} onValueChange={setQuery} onFocus={() => setSearching(true)} onBlur={() => setSearching(false)} placeholder="Search Maps" accessibilityLabel="Search nearby places" />
        <SegmentedControl value={category} onValueChange={setCategory} accessibilityLabel="Place categories">
          <SegmentedControlItem value="all">All</SegmentedControlItem><SegmentedControlItem value="food">Food</SegmentedControlItem><SegmentedControlItem value="parks">Outdoors</SegmentedControlItem>
        </SegmentedControl>
        {!searching && !query ? null : places.length ? places.map((p) => {
          const Icon = p.icon
          return <Press key={p.name} accessibilityRole="button" accessibilityLabel={`Open ${p.name}`} onPress={() => show(p.i)} style={[row, { minHeight: 48 }]}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: ui[p.tone], alignItems: "center", justifyContent: "center" }}><Icon size={16} color="#ffffff" /></View>
            <View style={{ flex: 1 }}><GText weight="600" numberOfLines={1}>{p.name}</GText><GText size="sm" tone="muted" numberOfLines={1}>{p.detail}</GText></View>
            <GIcon><ChevronRightIcon size={18} color={ui.labelTertiary} /></GIcon>
          </Press>
        }) : <View style={{ gap: 4, paddingVertical: 8 }}><GText weight="600">No places found</GText><GText size="sm" tone="muted">Try another search for “{query}”.</GText></View>}
      </Glass>
      </KeyboardStickyView>}
      {/* nonmodal, as Maps' place card is: the map and the route stay bright and the pins stay tappable */}
      <InfoSheet open={open} onOpenChange={setOpen} modal={false} title={place.name} description={place.detail}>
        <Button onPress={() => setRoute((v) => !v)}><NavigationIcon />{route ? "Hide route" : "Directions"}</Button>
        <GText>{route ? `The walking route to ${place.name} is highlighted on the map.` : place.description}</GText>
      </InfoSheet>
    </View>
  )
}

const ARTICLES = [
  { title: "Take the slower road", subtitle: "A field guide to the places between destinations.", address: "fieldnotes.example/alpine", picture: 0, paragraphs: ["The best part of the journey wasn't on the itinerary. It was the turn we almost missed, the path beside the water, and the hour we forgot to check the time.", "Leave room in the day. A good view rarely needs a reservation, and the road home can wait until the light has changed.", "Bring a notebook. Write down the small things: the smell of the trees after rain, the color of the lake, the sound of the wind around the ridge.", "Follow the shoreline a little further. The landscape keeps changing when you stop trying to reach the next place."] },
  { title: "An open afternoon", subtitle: "Pack lightly. Stay until the shadows get long.", address: "fieldnotes.example/coast", picture: 1, paragraphs: ["We started with a direction rather than a destination. There was a road to the coast, a place for coffee, and nothing scheduled after that.", "The walk took us past a row of quiet houses and out into the open. No one needed to decide how far we would go.", "When the light began to soften we turned back. The same path looked different on the way home.", "Some afternoons are worth keeping empty. This was one of them."] },
]

function SafariAddressInput({ inputRef, style, ...props }: TextInputProps & { inputRef: React.Ref<TextInput> }) {
  const ui = useUI()
  const color = useGlassForeground()
  return <TextInput ref={inputRef} multiline={false} numberOfLines={1} {...props} style={[{ flex: 1, minHeight: 48, color, fontSize: ui.text.sm }, style]} />
}

function SafariScene({ photoBase }: { photoBase?: string }) {
  const ui = useUI()
  const edges = useScrollEdges()
  const [page, setPage] = React.useState(0)
  const [address, setAddress] = React.useState(ARTICLES[0].address)
  const [editing, setEditing] = React.useState(false)
  const [tabs, setTabs] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [reader, setReader] = React.useState(false)
  const input = React.useRef<TextInput>(null)
  const scroll = React.useRef<ScrollView>(null)
  const article = ARTICLES[page]
  const collapsed = edges.minimized && !editing
  const navigate = (next: number) => { setPage(next); setAddress(ARTICLES[next].address); setEditing(false); scroll.current?.scrollTo({ y: 0, animated: false }) }
  React.useEffect(() => { if (editing) input.current?.focus() }, [editing])
  return (
    <ScrollEdgeProvider value={edges}>
      <ScrollView ref={scroll} nestedScrollEnabled keyboardShouldPersistTaps="handled" onScroll={edges.onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: 168 }}>
        {reader ? null : <Image source={{ uri: pictureURI(article.picture, photoBase) }} alt={PICTURES[article.picture].description} accessibilityLabel={PICTURES[article.picture].description} style={{ height: 270, width: "100%" }} />}
        <View style={{ padding: 28, paddingTop: reader ? 40 : 28, gap: 22 }}>
          <GText size="sm" weight="600">{reader ? "Reader · Field Notes" : "Field Notes"}</GText><GText size="3xl" font="display" accessibilityRole="header">{article.title}</GText><GText size="lg" tone="muted">{article.subtitle}</GText>
          {article.paragraphs.map((p) => <GText key={p} size={reader ? "lg" : "base"} selectable>{p}</GText>)}
          <GText size="sm" tone="muted">{saved ? "Saved to Reading List" : "From the weekend journal"}</GText>
        </View>
      </ScrollView>
      <ScrollEdge edge="bottom" variant="automatic" visible size={collapsed ? 74 : 140} />
      {/* iOS 27 Safari compact bar: Back, the address capsule (Reader, the domain centred, Reload), More.
          Scrolling folds it to a small pill; editing widens the field across the bar */}
      <View style={[row, { position: "absolute", left: 16, right: 16, bottom: 16, justifyContent: "center", gap: 8 }]}>
        {!collapsed && !editing ? <FloatingIcon icon={ChevronLeftIcon} label="Previous article" disabled={page === 0} onPress={() => navigate(0)} /> : null}
        <Glass variant="liquid" interactive radius={ui.radius.button} style={{ flex: collapsed ? 0 : 1, minWidth: collapsed ? 150 : 0, minHeight: collapsed ? 36 : 48, paddingHorizontal: collapsed || editing ? 14 : 2, flexDirection: "row", alignItems: "center", gap: collapsed || editing ? 4 : 0 }}>
          {collapsed ? <Press accessibilityRole="button" accessibilityLabel="Expand address bar" onPress={() => setEditing(true)} style={{ flex: 1, minHeight: 36, justifyContent: "center" }}><GText size="xs" align="center" numberOfLines={1}>{article.address.split("/")[0]}</GText></Press> : editing ? (
            // the whole address, selected, on a URL keyboard with no autocorrection
            <SafariAddressInput inputRef={input} accessibilityLabel="Website address" value={address} onChangeText={setAddress} onBlur={() => setEditing(false)} onSubmitEditing={() => navigate(address.toLowerCase().includes("coast") ? 1 : 0)} keyboardType="url" textContentType="URL" autoCapitalize="none" autoCorrect={false} spellCheck={false} clearButtonMode="while-editing" returnKeyType="go" selectTextOnFocus />
          ) : <>
            <PlainIcon icon={BookOpenTextIcon} label={reader ? "Hide Reader" : "Show Reader"} active={reader} onPress={() => setReader((v) => !v)} />
            {/* at rest the domain is one line of text; the field only exists while editing */}
            <Press accessibilityRole="button" accessibilityLabel={`Website address, ${article.address.split("/")[0]}`} accessibilityHint="Edits the address" onPress={() => { setAddress(article.address); setEditing(true) }} style={{ flex: 1, minHeight: 48, justifyContent: "center" }}>
              <GText size="sm" align="center" numberOfLines={1} ellipsizeMode="middle" adjustsFontSizeToFit minimumFontScale={0.85}>{article.address.split("/")[0]}</GText>
            </Press>
            <PlainIcon icon={RotateCwIcon} label="Reload article" onPress={() => scroll.current?.scrollTo({ y: 0, animated: false })} />
          </>}
        </Glass>
        {!collapsed && !editing ? <DropdownMenu>
          <DropdownMenuTrigger accessibilityLabel="More">
            <Glass variant="liquid" interactive radius={ui.radius.button} style={{ minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" }}><GIcon><EllipsisIcon size={21} color={ui.foreground} /></GIcon></Glass>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem systemImage="square.on.square" onSelect={() => setTabs(true)}>Show Open Tabs</DropdownMenuItem>
            <DropdownMenuItem systemImage="eyeglasses" onSelect={() => setSaved((v) => !v)}>{saved ? "Remove from Reading List" : "Add to Reading List"}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> : null}
      </View>
      <InfoSheet open={tabs} onOpenChange={setTabs} title="Open Tabs" description="Two places to explore.">
        {ARTICLES.map((item, i) => <Press key={item.title} accessibilityRole="button" accessibilityLabel={`Open ${item.title}`} onPress={() => { navigate(i); setTabs(false) }} style={[row, { minHeight: 64, paddingVertical: 8 }]}><Image source={{ uri: pictureURI(item.picture, photoBase) }} alt={item.title} accessibilityLabel={item.title} style={{ width: 72, height: 54, borderRadius: ui.radius.control }} /><View style={{ flex: 1 }}><GText weight="600">{item.title}</GText><GText size="sm" tone="muted">{item.address}</GText></View>{page === i ? <CheckIcon size={20} color={ui.primary} /> : null}</Press>)}
      </InfoSheet>
    </ScrollEdgeProvider>
  )
}

const MESSAGES = [
  { from: "Sam Rivera", subject: "Sunday by the coast", preview: "Found a trail I think you'll like.", body: "There's a path just north of the beach with a view all the way across the bay. Let's bring lunch and make a day of it.", time: "9:41 AM", starred: true },
  { from: "Field Notes", subject: "The September journal", preview: "A few places worth taking your time.", body: "This month's journal follows the slower roads: lakeside walks, quiet places for coffee, and a long afternoon in the hills.", time: "8:24 AM", starred: false },
  { from: "Avery Chen", subject: "A place for the weekend", preview: "What about the little cabin by the lake?", body: "The cabin is free this weekend. We could leave on Friday and take the scenic route home on Sunday.", time: "Yesterday", starred: false },
  { from: "Morgan Lee", subject: "Photos from the walk", preview: "The light was worth the early start.", body: "Here are a few of my favorites from the trail. I'd love to go back when the leaves change.", time: "Yesterday", starred: true },
]

function MailScene({ width }: { width: number }) {
  const ui = useUI()
  // large text: the sender takes its own line instead of truncating beside the time
  const large = useWindowDimensions().fontScale >= 1.35
  const edges = useScrollEdges()
  const [mailbox, setMailbox] = React.useState("Inbox")
  const [sidebar, setSidebar] = React.useState(false)
  const [hideSidebar, setHideSidebar] = React.useState(false)
  const [selected, setSelected] = React.useState<number | null>(null)
  const [archived, setArchived] = React.useState<number[]>([])
  const [compose, setCompose] = React.useState(false)
  const [subject, setSubject] = React.useState("")
  const [draft, setDraft] = React.useState("")
  const [drafts, setDrafts] = React.useState<{ subject: string; body: string }[]>([])
  const [editingDraft, setEditingDraft] = React.useState<number | null>(null)
  const [read, setRead] = React.useState<number[]>([0])
  const [flagged, setFlagged] = React.useState<number[]>(() => MESSAGES.flatMap((m, i) => m.starred ? [i] : []))
  const wide = width >= 640
  const message = selected === null ? undefined : MESSAGES[selected]
  const mailboxes = [{ name: "Inbox", icon: InboxIcon }, { name: "Flagged", icon: FlagIcon }, { name: "Archive", icon: ArchiveIcon }, { name: "Drafts", icon: FileIcon }]
  const unread = (name: string) => name === "Inbox" ? MESSAGES.filter((m, i) => !archived.includes(i) && !read.includes(i)).length : 0
  // the sheet already titles itself "Mailboxes"; only the sidebar shows the heading
  const mailboxList = (heading: boolean) => <View style={{ gap: 2, padding: heading ? 16 : 0 }}>{heading ? <GText size="2xl" font="heading" weight="700" style={{ paddingHorizontal: 10, paddingBottom: 8 }}>Mailboxes</GText> : null}{mailboxes.map(({ name, icon: Icon }) => <Press key={name} accessibilityRole="button" accessibilityLabel={`Open ${name}`} aria-selected={name === mailbox} onPress={() => { setMailbox(name); setSelected(null); setSidebar(false) }} style={[row, { paddingHorizontal: 12, minHeight: 48, borderRadius: ui.radius.control, backgroundColor: name === mailbox ? ui.fillStrong : "transparent" }]}><Icon size={20} color={ui.primary} /><GText weight={name === mailbox ? "600" : "400"} style={{ flex: 1 }}>{name}</GText>{unread(name) ? <GText tone="muted">{unread(name)}</GText> : null}</Press>)}</View>
  return (
    <ScrollEdgeProvider value={edges}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {wide && !hideSidebar ? <Glass variant="liquid" radius={0} style={{ width: 204, alignSelf: "stretch" }}>{mailboxList(true)}</Glass> : null}
        <View style={{ flex: 1 }}>
          <ScrollView nestedScrollEnabled onScroll={edges.onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingTop: 76, paddingBottom: 104 }}>
            {message ? <View style={{ padding: 24, gap: 16 }}><GText size="2xl" font="heading">{message.subject}</GText><GText weight="600">{message.from}</GText><GText size="sm" tone="muted">To you · {message.time}</GText><GText selectable>{message.body}</GText><GText selectable>See you soon.</GText></View> : mailbox === "Drafts" ? <View style={{ padding: 24, gap: 16 }}><GText size="2xl" font="heading">Drafts</GText>{drafts.length ? drafts.map((item, i) => <Press key={`${item.subject}-${i}`} accessibilityRole="button" accessibilityLabel={`Edit draft ${item.subject}`} onPress={() => { setSubject(item.subject); setDraft(item.body); setEditingDraft(i); setCompose(true) }} style={{ gap: 6, paddingVertical: 10 }}><GText weight="600">{item.subject}</GText><GText size="sm" tone="muted" numberOfLines={2}>{item.body}</GText></Press>) : <GText tone="muted">Your saved drafts appear here.</GText>}</View> : <View><GText size="3xl" font="heading" weight="700" accessibilityRole="header" style={{ paddingHorizontal: 20, paddingBottom: 8 }}>{mailbox}</GText>{MESSAGES.map((m, i) => ({ ...m, i })).filter((m) => (mailbox === "Archive" ? archived.includes(m.i) : !archived.includes(m.i)) && (mailbox !== "Flagged" || flagged.includes(m.i))).map((m) => <Press key={m.subject} accessibilityRole="button" accessibilityLabel={`Read ${m.subject} from ${m.from}${read.includes(m.i) ? "" : ", unread"}${flagged.includes(m.i) ? ", flagged" : ""}`} onPress={() => { setSelected(m.i); setRead((v) => v.includes(m.i) ? v : [...v, m.i]) }} style={{ flexDirection: "row", paddingLeft: 8 }}>
              <View style={{ width: 20, alignItems: "center", paddingTop: 18 }}>{!read.includes(m.i) ? <View accessibilityLabel="Unread" style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: ui.primary }} /> : flagged.includes(m.i) ? <FlagIcon size={10} color={ui.warning} fill={ui.warning} /> : null}</View>
              <View style={{ flex: 1, paddingVertical: 11, paddingRight: 20, gap: 2, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: ui.separator }}>
                <View style={[row, { gap: 8, flexWrap: large ? "wrap" : "nowrap" }]}><GText weight="600" numberOfLines={large ? 2 : 1} style={large ? { flexBasis: "100%" } : { flex: 1 }}>{m.from}</GText><GText size="sm" tone="muted" style={large ? { flex: 1 } : null}>{m.time}</GText><GIcon><ChevronRightIcon size={14} color={ui.labelTertiary} /></GIcon></View>
                <GText size="sm" numberOfLines={1}>{m.subject}</GText><GText size="sm" tone="muted" numberOfLines={2}>{m.preview} {m.body}</GText>
              </View>
            </Press>)}</View>}
          </ScrollView>
          <ScrollEdge variant="automatic" visible={edges.overTop} size={80} />
          <GlassEffectGroup spacing={12} style={[row, { position: "absolute", left: 16, right: 16, top: 16, justifyContent: "space-between" }]}>
            {/* iPhone Mail: a back chevron to the previous level; at regular width the sidebar toggle */}
            <FloatingIcon icon={message ? ChevronLeftIcon : wide ? PanelLeftIcon : ChevronLeftIcon} label={message ? `Back to ${mailbox}` : wide && !hideSidebar ? "Hide mailboxes" : "Show mailboxes"} onPress={() => message ? setSelected(null) : wide ? setHideSidebar((v) => !v) : setSidebar(true)} />
            {message ? <Glass variant="liquid" interactive radius={ui.radius.button} style={[row, { padding: 2, gap: 0 }]}>
              <PlainIcon icon={FlagIcon} label={flagged.includes(selected!) ? "Unflag message" : "Flag message"} active={flagged.includes(selected!)} onPress={() => setFlagged((v) => v.includes(selected!) ? v.filter((i) => i !== selected) : [...v, selected!])} />
              <PlainIcon icon={ArchiveIcon} label={archived.includes(selected!) ? "Move message to Inbox" : "Archive message"} onPress={() => { setArchived((v) => v.includes(selected!) ? v.filter((i) => i !== selected) : [...v, selected!]); setSelected(null) }} />
            </Glass> : null}
          </GlassEffectGroup>
          {/* a hard edge under the toolbar: its status is text with no glass behind it (T08) */}
          <ScrollEdge edge="bottom" variant="hard" visible size={104} />
          {/* the bottom toolbar: filter, status, compose */}
          <View style={[row, { position: "absolute", left: 16, right: 16, bottom: 16, justifyContent: "space-between" }]}>
            <FloatingIcon icon={ListFilterIcon} label={mailbox === "Inbox" ? "Filter unread" : "Filter"} onPress={() => setMailbox("Inbox")} />
            {/* bar text keeps its size, like the bar's own labels, so it stays on the edge */}
            <GText size="xs" tone="muted" align="center" numberOfLines={1} maxFontSizeMultiplier={1} style={{ flex: 1 }}>Updated Just Now</GText>
            <FloatingIcon icon={SquarePenIcon} label="Compose message" onPress={() => { setEditingDraft(null); setSubject(""); setDraft(""); setCompose(true) }} />
          </View>
        </View>
      </View>
      <InfoSheet open={!wide && sidebar} onOpenChange={setSidebar} title="Mailboxes" description="Choose a mailbox.">{mailboxList(false)}</InfoSheet>
      <InfoSheet open={compose} onOpenChange={(open) => {
        // swiping a started message away keeps it in Drafts, as Mail does, instead of losing it
        if (!open && (subject.trim() || draft.trim())) { const item = { subject: subject.trim() || "No Subject", body: draft }; setDrafts((v) => editingDraft === null ? [...v, item] : v.map((d, i) => i === editingDraft ? item : d)); setSubject(""); setDraft(""); setEditingDraft(null) }
        setCompose(open)
      }} title="New Message" description="Write a draft for later. Swiping it away keeps it in Drafts.">
        <Input value={subject} onChangeText={setSubject} placeholder="Subject" accessibilityLabel="Message subject" />
        <Input value={draft} onChangeText={setDraft} placeholder="Your message" accessibilityLabel="Message body" multiline style={{ minHeight: 110 }} />
        <Button disabled={!subject.trim()} onPress={() => { const item = { subject: subject.trim(), body: draft }; setDrafts((v) => editingDraft === null ? [...v, item] : v.map((d, i) => i === editingDraft ? item : d)); setCompose(false); setSubject(""); setDraft(""); setEditingDraft(null); setMailbox("Drafts"); setSelected(null) }}>Save Draft</Button>
      </InfoSheet>
    </ScrollEdgeProvider>
  )
}

type ClusterTool = { id: string; symbol: NonNullable<SwiftImageProps["systemName"]>; icon: LucideIcon; label: string; onPress: () => void; active?: boolean; toggle?: boolean }

/**
 * Photos' edit tools. With system glass every tool stays mounted in one SwiftUI glass container:
 * closed, the tools sit under the toggle, small and transparent, so their glass is the toggle's;
 * opening springs them out to their slots and the container pulls their glass out of the toggle.
 * (Mounting them on open would pop them in place: Expo UI inserts views outside the animation.)
 * Elsewhere the tools are separate glass siblings that appear when open.
 */
function ToolCluster({ tools, expanded, gap, style }: { tools: ClusterTool[]; expanded: boolean; gap: number; style?: StyleProp<ViewStyle> }) {
  const ui = useUI()
  const options = useGlassThemeOptions()
  const reduced = useReducedMotion() || ui.motion.duration === 0
  const solid = useReduceTransparency() || (ui.blur === 0 && ui.liquidBlur === 0 && ui.clearBlur === 0)
  const namespaceId = React.useId()
  const [revision, setRevision] = React.useState({ expanded, n: 0 })
  if (revision.expanded !== expanded) setRevision({ expanded, n: revision.n + 1 })
  const SIZE = 48
  if (!hasLiquidGlass() || solid)
    return (
      <GlassMorph value={expanded} spacing={gap} style={[{ justifyContent: "center" }, style]}>
        {tools.filter((t) => t.toggle || expanded).map((t) => (
          <GlassMorphItem key={t.id} id={t.id} accessibilityLabel={t.label} accessibilityState={t.active === undefined ? undefined : { selected: t.active }} onPress={() => { haptics.selection(); t.onPress() }} style={{ minWidth: SIZE, minHeight: SIZE, paddingHorizontal: 0 }}>
            <GIcon><t.icon size={21} color={t.active ? ui.primary : ui.foreground} /></GIcon>
          </GlassMorphItem>
        ))}
      </GlassMorph>
    )
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SwiftUI = require("@expo/ui/swift-ui") as typeof import("@expo/ui/swift-ui")
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("@expo/ui/swift-ui/modifiers") as typeof import("@expo/ui/swift-ui/modifiers")
  const center = tools.findIndex((t) => t.toggle)
  return (
    <View style={style}>
      <SwiftUI.Host matchContents={{ vertical: true }} {...nativeControlTheme(ui, options)} style={{ width: "100%" }}>
        <SwiftUI.Namespace id={namespaceId}>
          <SwiftUI.GlassEffectContainer spacing={gap}>
            <SwiftUI.ZStack modifiers={reduced ? [] : [m.animation(m.Animation.spring({ duration: (ui.motion.duration * 1.5) / 1000 }), revision.n)]}>
              {tools.map((t, i) => {
                const shown = expanded || !!t.toggle
                return (
                  <SwiftUI.Button
                    key={t.id}
                    onPress={() => { haptics.selection(); t.onPress() }}
                    modifiers={[
                      m.buttonStyle("plain"),
                      m.frame({ width: SIZE, height: SIZE }),
                      m.glassEffect({ glass: { variant: "regular", interactive: true }, shape: "capsule" }),
                      m.glassEffectId(t.id, namespaceId),
                      m.offset({ x: shown ? (i - center) * (SIZE + gap) : 0 }),
                      m.scaleEffect(shown ? 1 : 0.5),
                      m.zIndex(t.toggle ? 1 : 0),
                      m.disabled(!shown),
                      m.accessibilityHidden(!shown),
                      m.accessibilityLabel(t.label),
                      ...(t.active ? [m.accessibilityAddTraits(["isSelected"])] : []),
                    ]}
                  >
                    {/* the glass container draws content above every surface, so the glyph fades itself: in
                        once its glass has left the toggle, out before it gets back, so glyphs never pile up */}
                    <SwiftUI.Image systemName={t.symbol} size={20} color={t.active ? ui.primary : ui.foreground} modifiers={[m.opacity(shown ? 1 : 0), ...(reduced || t.toggle ? [] : [m.animation(expanded ? m.Animation.easeOut({ duration: 0.18 }).delay(0.12) : m.Animation.easeIn({ duration: 0.1 }), revision.n)])]} />
                  </SwiftUI.Button>
                )
              })}
            </SwiftUI.ZStack>
          </SwiftUI.GlassEffectContainer>
        </SwiftUI.Namespace>
      </SwiftUI.Host>
    </View>
  )
}

function ControlsScene({ width, photoBase }: { width: number; photoBase?: string }) {
  const ui = useUI()
  const { fontScale } = useWindowDimensions()
  const [expanded, setExpanded] = React.useState(false)
  const [tool, setTool] = React.useState("Brightness")
  const [brightness, setBrightness] = React.useState(50)
  const [warmth, setWarmth] = React.useState(0)
  const [cropped, setCropped] = React.useState(false)
  const step = Math.max(44, (width - 80) / 4)
  const choose = (name: string) => { setTool(name); setExpanded(false) }
  const gap = Math.max(8, step - 48)
  const tools: ClusterTool[] = [
    { id: "brightness", symbol: "sun.max", icon: SunIcon, label: "Adjust brightness", onPress: () => choose("Brightness"), active: tool === "Brightness" },
    { id: "warmth", symbol: "thermometer.medium", icon: ThermometerIcon, label: "Adjust warmth", onPress: () => choose("Warmth"), active: tool === "Warmth" },
    { id: "tools", symbol: expanded ? "xmark" : "slider.horizontal.3", icon: expanded ? XIcon : SlidersHorizontalIcon, label: expanded ? "Close photo tools" : "Open photo tools", onPress: () => setExpanded((v) => !v), toggle: true },
    { id: "crop", symbol: "crop", icon: CropIcon, label: cropped ? "Remove crop" : "Crop photo", onPress: () => { setCropped((v) => !v); setExpanded(false) } },
    { id: "reset", symbol: "arrow.counterclockwise", icon: RotateCcwIcon, label: "Reset photo edits", onPress: () => { setBrightness(50); setWarmth(0); setCropped(false); choose("Brightness") } },
  ]
  return (
    <View style={{ flex: 1 }}>
      {/* the edit itself changes the photo: 50 is the original, no scrim over the asset */}
      <View style={[StyleSheet.absoluteFill, { transform: [{ scale: cropped ? 1.22 : 1 }] }]}><Backdrop variant="image" src={pictureURI(0, photoBase)} /><View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: brightness < 50 ? `rgba(0,0,0,${(50 - brightness) / 125})` : `rgba(255,255,255,${(brightness - 50) / 125})` }]} /><View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: alpha(ui.warning, warmth / 400) }]} /></View>
      <MediaBands />
      <View style={{ padding: 24, gap: 2, alignItems: "center" }}><GText weight="600">Edit</GText>{cropped ? <GText size="xs">Cropped</GText> : null}</View>
      <View style={{ position: "absolute", left: 24, right: 24, bottom: 116, gap: 8 }}>
        <View style={[row, fontScale >= 1.8 ? { flexDirection: "column", alignItems: "stretch" } : { justifyContent: "space-between" }]}><GText size="lg" weight="600" style={{ flexShrink: 1 }}>{tool}</GText><GText size="sm" style={{ fontVariant: ["tabular-nums"] }}>{tool === "Warmth" ? warmth : brightness}</GText></View>
        <Slider value={[tool === "Warmth" ? warmth : brightness]} onValueChange={([v]) => tool === "Warmth" ? setWarmth(v) : setBrightness(v)} min={0} max={100} accessibilityLabel={tool} />
      </View>
      <ToolCluster tools={tools} expanded={expanded} gap={gap} style={{ position: "absolute", left: 0, right: 0, bottom: 28 }} />
    </View>
  )
}
