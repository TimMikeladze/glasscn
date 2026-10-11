/**
 * What the docs know about each item: the registry's own title/description,
 * its group, and a props table for the parts worth explaining.
 */
import registry from "../../registry.json"

export interface PropRow {
  name: string
  type: string
  default?: string
  description: string
}

export type Group = "Surfaces" | "Typography" | "Controls" | "Overlays" | "Navigation" | "Data" | "Chat" | "Blocks"
export const GROUPS: Group[] = ["Surfaces", "Typography", "Controls", "Overlays", "Navigation", "Data", "Chat", "Blocks"]

const GROUP_OF: Record<string, Group> = { surfaces: "Surfaces", typography: "Typography", controls: "Controls", overlays: "Overlays", navigation: "Navigation", data: "Data", chat: "Chat", blocks: "Blocks" }

export interface DocEntry {
  slug: string
  title: string
  description: string
  group: Group
  dependencies: string[]
  props?: PropRow[]
  notes?: string[]
}

const glassProps: PropRow[] = [
  { name: "intensity", type: `"default" | "strong" | "subtle"`, default: `"default"`, description: "How much frost: the fill's opacity over the blur." },
  { name: "tint", type: `"none" | "primary" | "destructive"`, default: `"none"`, description: "Mixes a colour into the frost via --glass-bg." },
  { name: "elevation", type: `"raised" | "flat"`, default: `"raised"`, description: "Drop shadow on or off (--glass-elevation)." },
]

/** What the line, area and bar presets share. */
const chartPresetProps: PropRow[] = [
  { name: "axis", type: `"leading" | "trailing"`, default: `"trailing"`, description: "The value axis side — trailing, as Apple's charts (flips in RTL)." },
  { name: "selectedX / onSelect", type: "x value | null / (row: Row | null) => void", description: "Controlled selection: a click, tap or Enter on a point reports its row; selectedX marks it." },
  { name: "state / onRetry / stateLabels", type: `"ready" | "loading" | "empty" | "error"`, default: `"ready" ("empty" when data is empty)`, description: "A skeleton, \"No data for this range\" or an error with a retry, the plot's height." },
  { name: "accessibilityTable", type: `boolean | "visible"`, default: "true", description: "A ChartSummary sentence and ChartDataTable for screen readers (sr-only), shown with \"visible\", omitted with false." },
]

const PROPS: Record<string, { props?: PropRow[]; notes?: string[] }> = {
  aurora: {
    props: [
      { name: "speed", type: "number", default: "--aurora-speed (1)", description: "Drift speed multiplier. 0 holds it still." },
      { name: "intensity", type: "number", default: "--aurora-opacity (1)", description: "Blob opacity, 0–1." },
      { name: "scale", type: "number", default: "--aurora-scale (1)", description: "Blob size multiplier." },
      { name: "blur", type: "number", default: "--aurora-blur (0)", description: "Extra blur on the blobs, px." },
      { name: "animate", type: "boolean", default: "true", description: "Drift or hold still. Always still under prefers-reduced-motion." },
      { name: "className", type: "string", default: `"fixed inset-0 -z-10"`, description: "Use `absolute` to fill a positioned container instead of the viewport." },
    ],
    notes: [
      "Colours come from --aurora-1, --aurora-2, --aurora-3 over --aurora-base — set by the theme items, or by you.",
      "Cheap when idle: the blobs are GPU layers only while they drift, and the drift pauses while the aurora is off screen (IntersectionObserver) or the page is scrolling.",
    ],
  },
  typography: {
    props: [
      { name: "level / size (Heading)", type: "1–6 / display | 1–6", default: "2 / the level", description: "level sets the element (h1–h6), size the look — so an h2 can look like an h1." },
      { name: "variant (Text)", type: `"body" | "lead" | "large" | "small" | "muted" | "overline" | "caption" | AppleTextStyle`, default: `"body"`, description: "lead is held to --glass-measure. overline is set as written (title case); add className=\"uppercase\" for an all-caps eyebrow. Apple's text styles: large-title, title-1…3, headline, apple-body, callout, subheadline, footnote, caption-1, caption-2." },
      { name: "emphasized (Text)", type: "boolean", default: "false", description: "Apple's emphasized weight: semibold, bold for the titles." },
      { name: "size (Display)", type: `"sm" | "md" | "lg" | "xl"`, default: `"lg"`, description: "Steps 4, 5, 6 and 8 of the scale." },
      { name: "ordered (List)", type: "boolean", default: "false", description: "Numbered, with the theme's numerals." },
      { name: "asChild", type: "boolean", default: "false", description: "On Heading, Text, Display and TextLink — e.g. a Next Link as a TextLink." },
    ],
    notes: [
      "Sizes are type-step-n2 … type-step-6: 1rem × --glass-text-scale × --glass-type-ratio^n (CSS pow()). Use them in your own components too.",
      "Fonts: font-glass-sans | heading | display | mono — a theme font if one is set, otherwise your app's --font-sans / --font-heading / --font-mono.",
      "Body text wraps with text-wrap: pretty. --glass-hyphens (manual | auto) turns on hyphenation for body text and Prose — set lang on <html> for it to work.",
    ],
  },
  prose: {
    notes: [
      "Wrap rendered Markdown/MDX: <Prose dangerouslySetInnerHTML={{ __html }} /> or <Prose><MDXContent /></Prose>.",
      "Line length follows --glass-measure; className=\"max-w-none\" to fill the container. Everything else comes from the type, colour and shape tokens.",
      "Images and video never exceed the measure; a wide table scrolls sideways inside it.",
      "Styles kbd, mark, del/ins, dl, details/summary, figure, nested list markers, GFM task lists and footnotes (remark-gfm), and GitHub alerts (`.markdown-alert`, from remark-github-blockquote-alert). Headings keep clear of a sticky header when linked (scroll-margin-top).",
    ],
  },
  "theme-scope": {
    props: [
      { name: "palette / material / shape / motion / density / type", type: "string | HueSpec | number", description: "Preset names (or a hue spec for the palette). Each writes only its own token groups — shape=\"sharp\" changes the corners and keeps the page's palette." },
      { name: "fonts", type: "{ sans?, heading?, display?, mono? }", description: "Theme fonts by catalogue key (inter, fraunces, jetbrains-mono…) or raw CSS stacks." },
      { name: "loadFonts", type: "boolean", default: "false", description: "Add one Google Fonts stylesheet for the theme's fonts." },
      { name: "theme", type: "GlassTheme", description: "A finished theme instead, e.g. from createGlassTheme or decodeTheme." },
      { name: "scheme", type: `"light" | "dark"`, description: "Force a scheme for this subtree (its values, shadcn's neutral colours and color-scheme); omit to follow the page's .dark." },
    ],
    notes: [
      "Writes one sanitised, scoped <style> for its own subtree: only the groups you name, the light values plus the dark ones that differ. A theme prop writes every token. Portalled content (dialogs, menus, tooltips) renders outside it — wrap the portal target, or theme the page instead.",
      "A forced scheme keeps dark: utilities right only if your dark variant stops at a .light scope: @custom-variant dark (&:is(.dark, .dark *):not(:where(.dark .light, .dark .light *):not(:where(.dark .light .dark, .dark .light .dark *)))); — glass-style ships it.",
    ],
  },
  glass: {
    props: [
      { name: "variant", type: `"material" | "liquid" | "liquid-clear"`, default: `"material"`, description: "material: the content layer (cards, panes), frosted by intensity. liquid: the control layer floating over content (toolbars, floating buttons). liquid-clear: over photos and video only. Never liquid inside liquid — use fills inside it." },
      ...glassProps,
      { name: "asChild", type: "boolean", default: "false", description: "Render the child element as the pane." },
    ],
  },
  card: {
    props: [
      ...glassProps,
      { name: "material", type: `"regular" | "thick" | "solid"`, default: `"regular"`, description: "regular = glass, thick = glass-strong (more frost), solid = opaque --card with no blur, for dense screens." },
      { name: "size", type: `"default" | "sm"`, default: `"default"`, description: "Padding and corner scale." },
      { name: "asChild", type: "boolean", default: "false", description: "Render as the child (an <a>): the whole card is the target, with focus ring and press state." },
    ],
    notes: [
      "Parts: CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter — same as shadcn's Card — plus CardImage, a full-bleed hero at the top.",
      "Padding is --card-spacing (the card / card-sm spacing tokens, scaled by --glass-density). The card sets --glass-container-radius and --glass-container-pad, so tiles inside can use rounded-concentric.",
      "Apple's widget sizes are the Widget item (Card's variant is the glass layer).",
    ],
  },
  button: {
    props: [
      { name: "variant", type: `"default" | "glass" | "prominent" | "tinted" | "secondary" | "outline" | "ghost" | "destructive" | "link"`, default: `"default"`, description: "Solid accent, liquid glass (the control layer, for buttons floating over content), prominent (liquid glass tinted with the accent — one per bar), accent wash, soft fill, rim, bare, danger, or text." },
      { name: "size", type: `"default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"`, default: `"default"`, description: "Height and padding; icon sizes are square — circles with the default capsule shape." },
      { name: "shape", type: `"pill" | "rounded"`, default: `"pill"`, description: "Capsule, or shadcn-style rounded corners." },
      { name: "loading", type: "boolean", default: "false", description: "A spinner replaces the leading icon (or covers the label, keeping the width); aria-busy, clicks ignored." },
      { name: "loadingText", type: "ReactNode", description: "A label while loading (\"Checking out…\"); the width may change." },
      { name: "asChild", type: "boolean", default: "false", description: "Render a link or other element as the button." },
    ],
    notes: [
      "Disabled glass keeps its material and dims the label; the other variants fade as a whole. aria-disabled=\"true\" disables too — use it on an asChild link.",
      "Solid variants squash elastically when pressed (glass-press); glass and prominent grow and light up under the finger (glass-press-liquid, glass-illuminate). Reduced motion turns both off.",
      "PullDownButton adds a trailing chevron — wrap it in DropdownMenuTrigger asChild. SplitButton joins an action and a PullDownButton into one shape.",
      "default stays solid for shadcn compatibility; prefer prominent for the one key action in a floating bar.",
    ],
  },
  badge: {
    props: [
      { name: "variant", type: `"default" | "tinted" | "glass" | "secondary" | "outline" | "destructive"`, default: `"default"`, description: "" },
      { name: "count (BadgeCount)", type: "number", description: "The number in the red oval; omit for a dot. 0 hides it unless showZero." },
      { name: "max (BadgeCount)", type: "number", default: "99", description: "Larger counts read \"99+\"." },
      { name: "label (BadgeCount)", type: "string", description: "Read after the number by screen readers — \"unread\"." },
    ],
    notes: ["BadgeCount pins to the top-end corner of its parent, which needs `relative` — an icon Button, an Avatar. Keep it for things that need attention (Apple's notification badge)."],
  },
  switch: {
    props: [{ name: "size", type: `"default" | "sm"`, default: `"default"`, description: "The iOS 27 63×28 switch with a 38×24 capsule knob, or a compact 44×20." }],
    notes: [
      "All Radix Switch props: checked, defaultChecked, onCheckedChange, disabled…",
      "Pressed, the knob turns into a liquid lens and stretches toward where it's going. Drag it to a side to choose; a drag back to where it started keeps it.",
      "The knob slides toward the inline end, so it flips under dir=\"rtl\".",
    ],
  },
  "glass-preferences": {
    props: [
      { name: "className", type: "string", description: "The panel is a plain grid — put it in a Popover, a Sheet or a settings Card." },
      { name: "useGlassPreferences()", type: "{ preferences, customised, setPreferences, reset }", description: "The same state without the UI: preferences is { clarity: 0–1, reduceTransparency }; setPreferences takes a partial; reset() returns to the theme." },
      { name: "<GlassPreferencesScript />", type: "from glass-preferences-script", description: "Render once in the root layout's <head> so a reload paints with the viewer's clarity (no flash)." },
    ],
    notes: [
      "Clarity is iOS 27's Liquid Glass slider for your app: 0 ultra clear, 0.5 the theme as designed, 1 fully tinted. It scales every frost — material and liquid — at once through --glass-clarity.",
      "It writes one style, :where(:root, [data-glass-scope]) { --glass-clarity: … !important }, so it reaches every ThemeScope and beats theme values, while the OS settings (prefers-reduced-transparency, prefers-contrast) still win. Nothing is written until the viewer changes something.",
      "Reduce transparency floors clarity at 0.9 — the same frosts the prefers-reduced-transparency media query gives — and sets data-glass-reduce-transparency on <html> for your own styles. It matters most in Safari, which has no such media query.",
      "Persisted in localStorage under glass-preferences; every instance and every open tab stays in step. Add suppressHydrationWarning to <html> (next-themes asks for it too).",
      "Web only: on iOS 26+ the system's own Liquid Glass clarity and Reduce Transparency already apply to native glass.",
    ],
  },
  slider: {
    props: [
      { name: "variant", type: `"default" | "progress"`, default: `"default"`, description: "progress is thumbless (a media scrubber); its track thickens while dragged." },
      { name: "ticks", type: "boolean | number[]", description: "true: a mark per step (up to 21); or the values to mark." },
      { name: "neutralValue", type: "number", description: "The range grows from here instead of min (a balance, an offset)." },
      { name: "minIcon / maxIcon", type: "ReactNode", description: "Icons at the ends of the track. className then goes on the wrapper." },
      { name: "valueBubble", type: "boolean | (value: number) => ReactNode", description: "A bubble over the thumb with its value while dragging." },
    ],
    notes: [
      "The knob is a capsule that turns into a liquid lens while dragged, stretching with the drag (glass-knob-lens).",
      "Right-to-left: Radix places the thumbs, so give it the direction — wrap the app in Radix's DirectionProvider dir=\"rtl\" or pass dir=\"rtl\".",
    ],
  },
  "glass-group": {
    props: [
      { name: "indicator (GlassGroup)", type: "boolean", default: "false", description: "A fill that slides to the selected item and morphs to its size and corners." },
      { name: "orientation (GlassGroup)", type: `"horizontal" | "vertical"`, default: `"horizontal"`, description: "" },
      { name: "selected (GlassGroupItem)", type: "boolean", description: "Marks it (aria-pressed) for the indicator. Leave undefined for a plain action." },
      { name: "asChild (GlassGroupItem)", type: "boolean", default: "false", description: "A link as the item (aria-current=\"page\" selects it)." },
    ],
    notes: [
      "Apple's GlassEffectContainer: one liquid backdrop for neighbouring controls, instead of a capsule each — glass can't sample glass. Items are transparent and take fills.",
      "Used for toolbar groups, button clusters and steppers. Never inside another liquid surface.",
    ],
  },
  "segmented-control": {
    props: [
      { name: "value / defaultValue", type: "string", description: "The chosen segment. Controlled or not." },
      { name: "onValueChange", type: "(value: string) => void", description: "Fires with the new segment. Never fires with an empty value — a segmented control always has a selection." },
      { name: "size", type: `"sm" | "default" | "lg"`, default: `"default"`, description: "" },
      { name: "shape", type: `"capsule" | "rounded"`, default: `"capsule"`, description: "Apple's capsule, or the control radius. The thumb is concentric either way." },
      { name: "momentary", type: "boolean", default: "false", description: "Segments are actions: onValueChange fires on each press and nothing stays selected." },
    ],
    notes: ["Drag the thumb across the segments to scrub; while held it becomes a liquid lens."],
  },
  tabs: { props: [{ name: "variant (TabsList)", type: `"default" | "plain" | "line"`, default: `"default"`, description: "Glass capsule with a sliding pill, the pill alone, or a sliding underline." }] },
  dock: {
    props: [
      { name: "position (Dock)", type: `"fixed" | "static"`, default: `"fixed"`, description: "Float at the bottom of the viewport (safe-area aware) or sit in flow. Fixed, it sets --dock-inset on <html> (its height + bottom gap): pad scrolling content with pb-(--dock-inset); the Toaster lifts toasts above it." },
      { name: "minimizeBehavior (Dock)", type: `"never" | "onScrollDown"`, default: `"never"`, description: "Fold the bar to its current item (glyph only) while the page — or the dock's scroll container — scrolls down; it opens again on scroll up." },
      { name: "layout (Dock)", type: `"default" | "compact"`, default: `"default"`, description: "compact puts icon and label side by side in shorter items (iPad, landscape)." },
      { name: "active (DockLink)", type: "boolean", default: "false", description: "The current page: sets aria-current=\"page\" and moves the pill to it. DockNav + DockLink are links in a nav landmark — use them for routes." },
      { name: "asChild (DockLink)", type: "boolean", default: "false", description: "Render your router's Link (next/link…) as the item." },
      { name: "badge (DockItem, DockLink)", type: "ReactNode", description: "A count in a red badge on the item's corner; read as \"3 new\". 0, null and false hide it." },
      { name: "prominent (DockItem, DockLink)", type: "boolean", default: "false", description: "Tint the item in the accent even when it isn't current." },
      { name: "value / onValueChange (DockBar)", type: "string", description: "DockBar + DockItem: views inside one page (single-choice group). For routes use DockNav." },
      { name: "asChild (DockAction)", type: "boolean", default: "false", description: "Render a link as the action button." },
    ],
    notes: [
      "Drag across the bar to scrub: a DockBar picks each item as the finger passes; a DockNav opens the link under the finger on release.",
      "DockAccessory sits above the bar (a now-playing strip, a draft) and moves inline beside it when the dock minimizes; read usePlacement() (\"expanded\" | \"inline\") inside it to show less.",
      "DockSearch is the separate search tab: a round glass button that opens into a SearchField; the bar folds while it is open. It takes SearchField's props.",
      "DockAction is tinted liquid glass (glass-prominent) — the accent in the frost, a lit rim and a glow where pressed.",
    ],
  },
  toolbar: {
    props: [
      { name: "placement (Toolbar)", type: `"top" | "bottom" | "sticky-top" | "sticky-bottom" | "static"`, default: `"top"`, description: "top / bottom float fixed (safe-area aware) and set --toolbar-inset-top / --toolbar-inset-bottom on <html>; sticky-* stick inside a scroll container; static sits in flow." },
      { name: "minimize (Toolbar)", type: `"never" | "onScrollDown"`, default: `"never"`, description: "Shrink (and hide the title) while content scrolls down; it returns on scroll up, hover or focus." },
      { name: "prominent (ToolbarItem)", type: "boolean", default: "false", description: "The tinted standalone action (Done, Send) — put it outside any group." },
      { name: "variant (ToolbarSpacer)", type: `"flexible" | "fixed"`, default: `"flexible"`, description: "flexible pushes what follows to the far edge; fixed is a small gap between groups." },
    ],
    notes: [
      "ToolbarGroup is one piece of liquid glass; its items are transparent — never glass on glass.",
      "role=toolbar: arrow keys, Home and End move between its controls (mirrored in RTL). Give icon-only items an aria-label.",
      "ToolbarOverflow is a \"More\" button with a glass menu; its children are DropdownMenu items.",
    ],
  },
  "scroll-edge": {
    props: [
      { name: "edge", type: `"top" | "bottom"`, default: `"top"`, description: "Put a top edge first and a bottom edge last inside the scrolling content." },
      { name: "variant", type: `"automatic" | "soft" | "hard"`, default: `"automatic"`, description: "soft: a progressive blur; hard: a near-opaque strip for dense text and pinned headers; automatic: soft on touch, hard with a fine pointer. (Apple's scrollEdgeEffectStyle — named variant here so it doesn't shadow the style prop.)" },
    ],
    notes: [
      "A sentinel at the content's edge sets data-over-content on the bars at that edge (data-bar-edge) in the same scroll container — Toolbar, Dock, NavigationBar — so their shadows deepen while content is beneath (glass-shadow-adaptive).",
      "The bars' minimize-on-scroll uses the same module (useScrollMinimized).",
    ],
  },
  "navigation-bar": {
    props: [
      { name: "title", type: "ReactNode", description: "The large title (the page's h1) and the inline one it collapses into." },
      { name: "titleDisplayMode", type: `"large" | "inline"`, default: `"large"`, description: "large starts with a big title under the bar; inline keeps it small in the bar." },
      { name: "subtitle", type: "ReactNode", description: "A line under the large title." },
    ],
    notes: ["The bar is not glass: its buttons are (Button variant=\"glass\" or a ToolbarGroup in NavigationBarLeading / NavigationBarTrailing). Once the large title has scrolled under it, a soft scroll edge keeps the inline title legible."],
  },
  sidebar: {
    props: [
      { name: "open / defaultOpen / onOpenChange (SidebarProvider)", type: "boolean", default: "true", description: "Expanded or collapsed on wide screens. ⌘B / Ctrl+B toggles." },
      { name: "side (Sidebar)", type: `"start" | "end"`, default: `"start"`, description: "Logical: start is left in LTR, right in RTL." },
      { name: "position (Sidebar)", type: `"fixed" | "absolute"`, default: `"fixed"`, description: "absolute keeps it inside a positioned SidebarProvider (a preview, a pane)." },
      { name: "isActive (SidebarMenuButton)", type: "boolean", default: "false", description: "The current destination (aria-current)." },
    ],
    notes: [
      "A floating, inset liquid panel; the content runs under it on narrow screens, where the trigger opens it over the page (Escape or the backdrop closes it).",
      "Two levels at most: SidebarMenu and one SidebarMenuSub.",
      "BackgroundExtension wraps media (a hero image) so a mirrored, blurred copy fills the strip under the sidebar — SwiftUI's backgroundExtensionEffect().",
    ],
  },
  "search-field": {
    props: [
      { name: "value / defaultValue / onValueChange", type: "string", description: "The query." },
      { name: "onSubmit", type: "(value: string) => void", description: "Enter (with no suggestion highlighted)." },
      { name: "minimized", type: "boolean", default: "false", description: "Start as a round search button that morphs open; it folds back when left empty." },
      { name: "placement", type: `"inline" | "bottom"`, default: `"inline"`, description: "bottom floats it fixed at the bottom edge and rides the on-screen keyboard (visualViewport)." },
      { name: "showCancel", type: `"auto" | "always" | "never"`, default: `"auto"`, description: "auto: while focused (or open from minimized). Cancel clears, blurs and folds." },
      { name: "suggestions / onSuggestionSelect", type: "(string | { value, label })[]", description: "A listbox under the field (over it at the bottom): ↑/↓ to move, Enter to pick. Filter them yourself." },
    ],
    notes: ["Escape clears the text, then cancels."],
  },
  "action-sheet": {
    props: [{ name: "variant (ActionSheetAction)", type: `"default" | "destructive" | "preferred"`, default: `"default"`, description: "destructive for the risky choice; preferred sets it in bold." }],
    notes: [
      "The choices share one liquid group; ActionSheetCancel (write it last) sits in its own capsule below. Tapping outside cancels; Escape too.",
      "Bottom-anchored on phones, centred from sm. Built on the alert-dialog primitives: focus is trapped and Cancel takes it on open.",
    ],
  },
  checkbox: {
    props: [
      { name: "shape", type: `"square" | "circle"`, default: `"square"`, description: "circle is iOS's selection checkmark (lists, pickers)." },
      { name: "size", type: `"sm" | "default" | "lg"`, default: `"default"`, description: "14, 18 or 22px, scaled by density; the hit area stays 44pt on touch." },
    ],
    notes: ["All Radix Checkbox props: checked (true | false | \"indeterminate\"), defaultChecked, onCheckedChange, disabled, required, name.", "Indeterminate shows a dash — use it for a parent that controls a group."],
  },
  table: { notes: ["Parts (shadcn's API): Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption.", "No pane of its own — put it in a Card. Rows take data-state=\"selected\" for the selected fill.", "Cell padding scales with --glass-density; numbers use the theme's numerals. TableHead and TableCell take align (start | center | end) and numeric (end-aligned figures) — logical, so they flip in RTL.", "When the table is wider than its container, the scroll container becomes a focusable region (named by the table's aria-label) so keyboard users can scroll it."] },
  "data-table": {
    props: [
      { name: "columns", type: "TableOptions<DataTableFeatures, Row>[\"columns\"]", default: "—", description: "Build with createDataTableColumnHelper<Row>() and helper.columns([...]). Keep it stable (module scope or useMemo)." },
      { name: "data", type: "Row[]", default: "—", description: "Your rows, unmodified (one page of them in manual mode). Keep the array stable between real changes." },
      { name: "searchPlaceholder", type: "string", default: "—", description: "Shows a search box filtering every text and number column (debounced 200ms)." },
      { name: "filters", type: "{ column; title; options: { value; label; icon? }[] }[]", default: "—", description: "Faceted filter buttons with counts. Give the column filterFn: \"arrIncludesSome\"." },
      { name: "viewOptions", type: "boolean", default: "true with a toolbar", description: "The View menu: show and hide columns (meta.label names them; enableHiding: false pins one)." },
      { name: "toolbar", type: "(table) => ReactNode", default: "—", description: "Your own toolbar actions." },
      { name: "pageSize / pageSizes", type: "number / number[]", default: "10 / [10, 20, 50, 100]", description: "Rows per page and the menu's choices." },
      { name: "initialSorting", type: "SortingState", default: "[]", description: "e.g. [{ id: \"date\", desc: true }]." },
      { name: "getRowId", type: "(row: Row, index: number) => string", default: "row index", description: "Stable ids keep selection on the right rows." },
      { name: "onRowClick", type: "(row: Row) => void", default: "—", description: "Makes rows clickable and focusable (Enter or Space opens). Clicks on links, buttons and checkboxes inside a row stay theirs." },
      { name: "state / onStateChange", type: "Partial<{ sorting, columnFilters, globalFilter, pagination, rowSelection, columnVisibility }>", default: "—", description: "Control any slices (URL sync, persistence); onStateChange gets the slice that changed." },
      { name: "manual / rowCount", type: "boolean | { pagination?, sorting?, filtering? } / number", default: "—", description: "The server sorts, filters and pages; pass one page of data and the total." },
      { name: "virtual", type: "boolean | { height?, estimateRowHeight?, overscan? }", default: "false", description: "Every row in one scrolling body (28rem) with a sticky header; only visible rows mount (@tanstack/react-virtual). No pagination." },
      { name: "loading / error / onRetry", type: "boolean / ReactNode / () => void", default: "—", description: "Skeleton rows, or an error row with a retry." },
      { name: "empty", type: "ReactNode", default: "\"No results.\"", description: "Shown when nothing matches." },
      { name: "labels", type: "Partial<DataTableLabels>", default: "English", description: "Every string, for translation (dataTableLabels exports the defaults)." },
      { name: "tableOptions", type: "Partial<TableOptions>", default: "—", description: "Anything else TanStack Table takes, merged last." },
    ],
    notes: [
      "Built on TanStack Table v9 (useTable + tableFeatures): sorting, global and column filters, faceting, column visibility, pagination and row selection are registered in dataTableFeatures.",
      "Column meta: { align: \"start\" | \"center\" | \"end\" } or { numeric: true } aligns a column's header and cells (logical, so RTL flips them); { label } names it in the View menu.",
      "selectColumn<Row>() adds a checkbox column (select row / select page, indeterminate when some are picked).",
      "DataTableColumnHeader sorts its column on click (ascending → descending → off) and the th carries aria-sort.",
      "Exported for custom layouts: DataTableToolbar, DataTableSearch, DataTableFacetedFilter, DataTableViewOptions, DataTableRowActions (a … menu — pass DropdownMenuItems), DataTablePagination (rows per page, page x of y, first/previous/next/last).",
      "The row count is announced politely, once typing settles — not per keystroke.",
    ],
  },
  tooltip: { notes: ["Parts: Tooltip, TooltipTrigger, TooltipContent, TooltipProvider. Each Tooltip brings its own provider (as shadcn's does); wrap an area in TooltipProvider to share delays.", "Tooltips don't open on touch — give icon-only buttons an aria-label too."] },
  "grouped-list": { notes: ["Parts: GroupedList, GroupedListHeader, GroupedListContent, GroupedListItem (asChild for button/link rows), GroupedListIcon, GroupedListTitle, GroupedListDescription, GroupedListValue, GroupedListChevron, GroupedListFooter.", "With asChild the list-item role sits on a wrapper, so a <button> or <a> row keeps its own role.", "GroupedListItem takes disabled: the row dims and ignores the pointer (a <button> child is disabled, a link gets aria-disabled).", "Separators are inset to where the text starts (past the icon tile), as in iOS."] },
  avatar: {
    props: [{ name: "size (Avatar, AvatarGroupCount)", type: `"sm" | "default" | "lg"`, default: `"default"`, description: "24, 32 or 40px, scaled by density." }],
    notes: [
      "Parts: Avatar, AvatarImage, AvatarFallback (shown until the image loads, or if it fails), AvatarBadge (a status dot on the bottom corner), AvatarGroup (overlapping stack with a glass rim), AvatarGroupCount (the \"+3\").",
      "AvatarBadge takes the accent by default — className=\"bg-success\" for online. Give it an aria-label or it's decorative. For a count, put a BadgeCount (badge) inside the Avatar instead.",
    ],
  },
  chat: {
    props: [
      { name: "layout (ChatThread)", type: `"bubble" | "document"`, default: `"bubble"`, description: "Messages-app bubbles, or assistant turns as full-width prose (modern AI chats). User turns stay bubbles." },
      { name: "onLoadOlder / hasOlder (ChatThread)", type: "() => void | Promise<void> / boolean", description: "Called near the top; prepend older messages and the reading position is kept. Stops once hasOlder is false." },
      { name: "from (ChatMessage)", type: `"user" | "assistant" | "system"`, default: `"assistant"`, description: "User turns sit on the right in the accent; assistant turns on the left on a fill; system lines are centred and muted." },
      { name: "name (ChatMessage)", type: "string", default: `"You" / "Assistant"`, description: "The speaker. Each message is an article labelled with it." },
      { name: "grouped (ChatMessage)", type: "boolean", default: "false", description: "A follow-up from the same sender: tighter gap, avatar hidden, the sender-side corners squared." },
      { name: "streaming (ChatMessage)", type: "boolean", default: "false", description: "A reply still arriving: aria-busy, so screen readers don't read it token by token. When it turns false the whole message is announced once." },
      { name: "status / onRetry (ChatMessage)", type: `"sending" | "failed" | "edited" / () => void`, description: "Sending dims it; failed shows \"Not delivered\" and Retry; edited shows a note." },
      { name: "avatar (ChatMessage)", type: "ReactNode", description: "Beside the bubble (above the prose in document layout) — usually an Avatar." },
      { name: "variant (ChatBubble)", type: `"user" | "assistant" | "system" | "document"`, default: "the message's from", description: "Override the bubble's look. Plain-text children keep their line breaks; Markdown lays itself out." },
      { name: "time (ChatMeta)", type: "Date | string", description: "Rendered as <time dateTime>; the children (\"Read 9:41\") are its visible text." },
      { name: "name (ChatTyping)", type: "string", default: `"Assistant"`, description: "Announced as \"<name> is typing\"." },
      { name: "onSelect (ChatSuggestions)", type: "(value: string) => void", description: "Called with a chip's value (defaults to its text). Scrolls sideways with snap and faded edges." },
      { name: "onSubmit (ChatComposer)", type: "(text: string) => void", description: "The trimmed text. Enter sends, Shift+Enter breaks a line, IME composition never sends." },
      { name: "status / onStop (ChatComposer)", type: `"ready" | "submitted" | "streaming" | "error" / () => void`, description: "AI SDK's status: while submitted or streaming, send turns into Stop." },
      { name: "value / defaultValue / onValueChange (ChatComposer)", type: "string", description: "Control the draft, or let the composer keep it and clear itself after sending." },
      { name: "variant (ChatComposer)", type: `"inset" | "floating"`, default: `"inset"`, description: "A fill inside a pane, or a liquid-glass capsule floating over the bottom of a thread." },
      { name: "leading / trailing (ChatComposer)", type: "ReactNode", description: "Before the field (attach) and before send (model picker, mic)." },
      { name: "onAttach / attachments (ChatComposer)", type: "(files: File[]) => void / ReactNode", description: "Files pasted or dropped on the composer; ChatAttachment chips above the field. With attachments it can send without text." },
      { name: "maxLength (ChatComposer)", type: "number", description: "A counter from 80% of the limit; past it, send is refused." },
      { name: "submitOnEnter (ChatComposer)", type: "boolean", default: "true", description: "Off: Enter breaks a line and ⌘/Ctrl+Enter sends." },
      { name: "textareaProps (ChatComposer)", type: "ComponentProps<\"textarea\">", description: "Passed to the field; its ref is merged with the composer's." },
    ],
    notes: [
      "Parts: ChatThread, ChatMessage, ChatBubble, ChatMeta, ChatDivider, ChatTyping, ChatSuggestions, ChatSuggestion, ChatComposer. It owns no messages and no networking. For AI SDK parts (Markdown, reasoning, tools, sources, files) add chat-parts.",
      "ChatThread sticks to the newest message while you're at the bottom, and always when you send one. Scrolled up, a liquid \"jump to latest\" button materialises and counts new messages. Give it a height (h-full in a flex parent). Set --chat-thread-inset to leave room for a floating composer, and --chat-bubble-max (default 36rem) to cap a bubble's width.",
      "Put ChatSuggestions above the composer, outside the thread — inside the log they'd be announced as messages.",
      "With AI SDK useChat: <ChatMessage from={m.role}>{renderParts(m, { streaming: status === \"streaming\" && m === messages.at(-1) })}</ChatMessage>; <ChatTyping /> while status === \"submitted\"; <ChatComposer status={status} onStop={stop} onSubmit={(text) => sendMessage({ text })} />.",
    ],
  },
  "chat-markdown": {
    props: [
      { name: "children (ChatMarkdown)", type: "string", description: "The Markdown, complete or still streaming. GitHub flavoured: tables, task lists, strikethrough, autolinks. Raw HTML is not rendered." },
      { name: "repair (ChatMarkdown)", type: "boolean", default: "true", description: "Close an unfinished fence, inline code, bold, italic or strike, and drop a link whose URL hasn't arrived — so streaming text doesn't flicker." },
      { name: "highlight", type: "(code, language) => string | Promise<string>", description: "Highlighted HTML for code blocks — Shiki's codeToHtml, say. Plain text shows until it resolves." },
      { name: "components (ChatMarkdown)", type: "react-markdown Components", description: "Override how any element renders." },
      { name: "code / language / wrap (ChatCodeBlock)", type: "string / string / boolean", description: "The code, its language label, and whether long lines start wrapped. Copy and a wrap toggle are built in." },
    ],
    notes: ["repairMarkdown(text) is exported for your own renderers.", "Links open in a new tab with rel=\"noreferrer noopener\"."],
  },
  "chat-parts": {
    props: [
      { name: "renderParts(message, options)", type: "(UIMessage, { streaming?, highlight?, onToolApproval?, renderTool?, renderData?, reasoningDuration? }) => ReactNode[]", description: "Maps an AI SDK UIMessage onto the parts below, in order; sources collect at the end. Types are structural — no dependency on ai." },
      { name: "streaming / duration (ChatReasoning)", type: "boolean / number", description: "Opens itself while streaming (\"Thinking…\"), folds away after (\"Thought for 12s\") unless the reader opened it." },
      { name: "name / state (ChatTool)", type: "string / input-streaming | input-available | approval-requested | approval-responded | output-available | output-error | output-denied", description: "The tool and AI SDK's tool part state." },
      { name: "input / output / errorText / renderOutput (ChatTool)", type: "unknown / unknown / string / (output) => ReactNode", description: "Shown as JSON unless you render the output yourself." },
      { name: "onApprove / onDeny (ChatTool)", type: "() => void", description: "Approve and Deny while the state is approval-requested (AI SDK addToolApprovalResponse)." },
      { name: "sources (ChatSources)", type: "{ url?, title?, id? }[]", description: "Collapsed under \"N sources\"; each a numbered ChatCitation." },
      { name: "url / mediaType / filename (ChatFile)", type: "string", description: "Images show as a thumbnail; other files as a download chip." },
      { name: "name / previewUrl / onRemove / uploading (ChatAttachment)", type: "string / string / () => void / boolean", description: "A composer chip. Pass these to ChatComposer's attachments." },
      { name: "onRetry (ChatError)", type: "() => void", description: "A failed reply with Retry (AI SDK regenerate)." },
      { name: "label / active (ChatAction)", type: "string / boolean", description: "An icon button in ChatActions; active marks a toggle that's on. ChatActions shows on hover/focus with a mouse and always on touch and for the last message." },
      { name: "reactions / onToggle (ChatReactions)", type: "{ emoji, count?, mine?, label? }[] / (emoji) => void", description: "Tapbacks in a capsule pinned to the bubble's corner." },
    ],
  },
  command: {
    props: [
      { name: "title / description (CommandDialog)", type: "string", default: `"Command palette"`, description: "Screen-reader title and description of the dialog." },
      { name: "commandProps (CommandDialog)", type: "ComponentProps<typeof Command>", description: "Passed to the inner Command (filter, shouldFilter, loop…)." },
      { name: "keywords / onSelect / disabled (CommandItem)", type: "string[] / (value) => void / boolean", description: "Extra search terms, the action, and a dimmed row." },
    ],
    notes: [
      "Parts as shadcn: Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut. Built on cmdk.",
      "Command itself is transparent: put it on a card, in a popover (as Combobox does), or in CommandDialog, which floats it in a liquid panel. Rows are fills.",
      "Wire ⌘K yourself: listen for keydown with metaKey/ctrlKey and toggle open.",
    ],
  },
  combobox: {
    props: [
      { name: "options", type: "{ value, label, keywords?, disabled?, icon?, group? }[]", description: "Grouped by group, searched by label and keywords." },
      { name: "multiple", type: "boolean", default: "false", description: "value becomes string[]; chosen items show as removable chips in the field (Backspace removes the last)." },
      { name: "value / defaultValue / onValueChange", type: "string | string[]", description: "Controlled or not. In single mode, choosing the current value clears it." },
      { name: "placeholder / searchPlaceholder / emptyText", type: "string / string / ReactNode", description: "" },
      { name: "open / onOpenChange", type: "boolean", description: "Control the popover." },
    ],
    notes: ["Built from Popover + Command, as shadcn's combobox example. The list is as wide as the field and grows out of it."],
  },
  calendar: {
    props: [
      { name: "mode", type: `"single" | "multiple" | "range"`, description: "react-day-picker's selection modes; every DayPicker prop works." },
      { name: "captionLayout", type: `"label" | "dropdown" | "dropdown-months" | "dropdown-years"`, default: `"label"`, description: "Month/year dropdowns for distant dates." },
      { name: "showOutsideDays", type: "boolean", default: "true", description: "" },
      { name: "buttonVariant", type: `"ghost" | "secondary" | "outline"`, default: `"ghost"`, description: "The look of the nav buttons." },
    ],
    notes: ["Transparent: put it on a card or in a popover (see date-picker).", "Day cells scale with density; RTL flips the chevrons.", "CalendarDayButton is exported for custom day renders."],
  },
  "date-picker": {
    props: [
      { name: "mode", type: `"single" | "range"`, default: `"single"`, description: "A day, or a range across two months." },
      { name: "variant", type: `"compact" | "field"`, default: `"compact"`, description: "iOS's compact date button (a capsule, the accent while open) or a full-width form field with an icon." },
      { name: "value / defaultValue / onValueChange", type: "Date | DateRange", description: "" },
      { name: "time / minuteStep", type: "boolean / number", default: "false / 1", description: "Add hour and minute pickers. The step must divide 60 (5, 10, 15, 30…)." },
      { name: "formatOptions / locale", type: "Intl.DateTimeFormatOptions / string", description: "How the value is written on the button." },
      { name: "calendarProps", type: "Calendar props", description: "disabled days, startMonth, numberOfMonths…" },
    ],
    notes: ["minuteSlots(step) and snapMinutes(date, step) are exported."],
  },
  "activity-rings": {
    props: [
      { name: "rings", type: "{ value: number; color?: string; label?: string; icon?: ReactNode }[]", description: "Outermost first. value 1 = one lap; past 1 the ring keeps winding, any number of laps. Colours default to --chart-1..3." },
      { name: "size / stroke / gap", type: "number", default: "160 / 16 / 4", description: "Pixel geometry." },
    ],
    notes: [
      "Apple's anatomy: a dim track, an angular gradient along the arc from a deep start to a light end, round caps, and past 100% a shadow under the leading cap where it overlaps the lap beneath.",
      "icon sits at twelve o'clock on the ring, sized to the stroke (Apple's arrows).",
      "CSS only — Server Component safe. The sweep is timed by --glass-duration, so motion-still and reduced motion still it.",
    ],
  },
  "progress-ring": {
    props: [
      { name: "value", type: "number", description: "0–1." },
      { name: "size", type: "number", default: "72", description: "" },
      { name: "color", type: "string", default: `"var(--primary)"`, description: "Ring and content colour." },
    ],
  },
  sparkline: {
    props: [
      { name: "data", type: "(number | null)[]", description: "One value per step; nulls are gaps." },
      { name: "height", type: "number", default: "72", description: "Width follows the container." },
      { name: "color", type: "string", default: `"var(--primary)"`, description: "" },
      { name: "area / dot", type: "boolean", default: "true", description: "The gradient under the line; the lit last point." },
    ],
  },
  heatmap: {
    props: [
      { name: "values", type: "Record<string, number>", description: "Numbers by ISO date (YYYY-MM-DD)." },
      { name: "weeks", type: "number", default: "26", description: "Columns, ending with the week holding today." },
      { name: "weekStart", type: "0 | 1", default: "1", description: "Sunday or Monday." },
      { name: "today", type: "string", default: "the viewer's local date", description: "The last day shown (YYYY-MM-DD). Without it the server renders empty cells and the client fills them in after hydration; pass it to render dates on the server." },
      { name: "locale", type: "string", default: `"en-US"`, description: "BCP 47 locale for weekday, month and cell-title text. Fixed rather than the browser's, so server and client agree." },
      { name: "cellSize", type: "number", default: "16", description: "Largest a cell grows (px); cells shrink to fit narrow containers." },
      { name: "onSelect", type: "(date: string) => void", description: "Makes past cells buttons." },
    ],
  },
  "bar-list": {
    props: [
      { name: "data", type: "{ name, value, href?, icon?, key? }[]", description: "Rows in display order — sort them yourself." },
      { name: "max", type: "number", default: "the largest value", description: "What a full-width bar means, e.g. 30 days." },
      { name: "valueFormat", type: "(value: number) => ReactNode", default: "toLocaleString", description: "" },
      { name: "color", type: "string", default: `"var(--primary)"`, description: "Bars are a 22% wash of it." },
      { name: "onSelect", type: "(item, index) => void", description: "Makes rows buttons (or runs on link click)." },
    ],
  },
  gauge: {
    props: [
      { name: "value / min / max", type: "number", default: "— / 0 / 100", description: "Clamped into the range." },
      { name: "target", type: "number", description: "A tick on the track — the goal." },
      { name: "size / stroke", type: "number", default: "160 / 8.5% of size", description: "" },
      { name: "color", type: "string", default: `"var(--primary)"`, description: "" },
      { name: "label", type: "string", description: "Accessible name (role=meter)." },
    ],
    notes: ["Children render in the bowl: put the figure and a caption there."],
  },
  tracker: {
    props: [
      { name: "data", type: "{ title, status?, key? }[]", description: "One block each; title is the tooltip and accessible label." },
      { name: "colors", type: "Record<string, string>", default: "done · partial · missed · rest", description: "Status → colour class, e.g. { up: \"bg-primary\", down: \"bg-destructive\" }." },
    ],
  },
  "category-bar": {
    props: [
      { name: "values", type: "number[]", description: "Band sizes, in order; the scale is their running total." },
      { name: "marker", type: "number", description: "A point on that scale; its band stays lit, the rest dim." },
      { name: "colors", type: "string[]", default: "--chart-1…5", description: "CSS colours per band; cycles." },
      { name: "labels", type: "boolean", default: "true", description: "Band edges under the bar." },
      { name: "markerLabel", type: "string", description: "Accessible text for the marker." },
    ],
  },
  chart: {
    props: [
      { name: "definition (ChartContainer)", type: "ChartDefinition", description: "Any TanStack Charts definition. Memoize it (useMemo) against the values it captures — a new identity rebuilds the scene." },
      { name: "ariaLabel (ChartContainer)", type: "string", description: "Required. Say what the chart shows, not \"chart\"." },
      { name: "height (ChartContainer)", type: "number", default: "320", description: "Width follows the container; the server renders at initialWidth (640) with ids from useId, so hydration matches." },
      { name: "animate (ChartContainer)", type: "boolean", default: "true", description: "Draw in on mount. Reduced motion always snaps." },
      { name: "state / onRetry / stateLabels (ChartContainer)", type: `"ready" | "loading" | "empty" | "error"`, default: `"ready"`, description: "Show ChartState in the plot's place." },
      { name: "ChartState", type: "{ state; height?; onRetry?; labels? }", description: "The placeholder on its own — skeleton axes with a shimmer, \"No data for this range\", or an error with a retry." },
      { name: "ChartDataTable", type: "{ data; x; series; xFormat?; valueFormat?; caption?; visible? }", description: "The exact values as a real <table> — sr-only unless visible." },
      { name: "ChartSummary", type: "{ data; series; valueFormat?; visible? }", description: "One sentence per series: count, low, high, latest, trend." },
      { name: "items / shape (ChartLegend)", type: `{ label; color?; value? }[] / "dot" | "line"`, description: "Colours default to chartColor(index). Lines get a dash." },
      { name: "chartColor(i)", type: "(i: number) => string", description: "var(--chart-1…8), cycling. Past eight, fold into \"Other\" (foldOther in glass-charts)." },
      { name: "useChartAccessors", type: "({ x, series, valueFormat?, xFormat? }) => stable", description: "What the presets use: inline accessors stay stable — they call your latest functions — and change only with the series' ids, labels and colours." },
    ],
    notes: [
      "The container maps tokens onto TanStack Charts' theme variables: --ts-chart-1…6 ← --chart-1…6, the tooltip ← glass-strong. Text and grid inherit text-muted-foreground. Leave colours unset in your definition and palettes, schemes and ThemeScope re-theme it without a rebuild.",
      "Eight series colours: 6–8 extend each palette with a lightness ladder (dark, light, near-neutral) so series part by lightness as well as hue — legible under colour-vision deficiency. --chart-8 doubles as \"Other\".",
      "Presets draw Apple-style axes: value axis trailing, no domain lines or tick stubs, a hairline grid.",
      "This module owns the renderer import (it pulls in d3 pieces); import marks and scales from @tanstack/charts subpaths in your chart definition.",
      "Children are overlaid on the chart (the host is position: relative).",
    ],
  },
  "line-chart": {
    props: [
      { name: "data", type: "readonly Row[]", description: "Your rows, unmodified — tooltips and callbacks get them back." },
      { name: "x", type: "(d: Row) => string | number | Date", description: "Dates get a UTC time axis, numbers a linear one, strings evenly spaced points." },
      { name: "series", type: "{ id; label; value: (d: Row) => number | null; color?; format? }[]", description: "One line each. null is a gap. Colours default to --chart-1…8." },
      { name: "ariaLabel", type: "string", description: "Required." },
      { name: "points", type: "boolean", default: "false", description: "A dot at each value." },
      { name: "curve", type: `"smooth" | "linear" | "step"`, default: `"smooth"`, description: "Smooth is monotone: it never swings past a peak." },
      { name: "onScrub", type: "(row: Row | null) => void", description: "The row under the pointer, finger (press and drag) or keyboard focus." },
      ...chartPresetProps,
      { name: "valueFormat / xFormat", type: "(v) => string", description: "Axis ticks, tooltip and the data table." },
      { name: "height / legend / grid", type: "number / boolean / boolean", default: "240 / series > 1 / true", description: "" },
    ],
    notes: ["Hovering snaps to the nearest x and lists every series there; arrow keys move along x.", "Accessors can be inline arrows: the preset keeps them stable and calls the latest. Pass new data to redraw."],
  },
  "area-chart": {
    props: [
      { name: "data / x / series / ariaLabel", type: "as LineChart", description: "Your rows, an x accessor, and one area per series." },
      { name: "stacked", type: `boolean | "expand"`, default: "false", description: "Pile the layers into a total (negatives stack down from zero); \"expand\" shows each layer's share. The tooltip lists layers top-down with their own values." },
      { name: "latestPoint", type: "boolean", default: "false", description: "A dot on each series' last value." },
      { name: "curve", type: `"smooth" | "linear" | "step"`, default: `"smooth"`, description: "" },
      { name: "onScrub", type: "(row: Row | null) => void", description: "As LineChart." },
      ...chartPresetProps,
      { name: "valueFormat / xFormat", type: "(v) => string", description: "Axis ticks and tooltip." },
      { name: "height / legend / grid", type: "number / boolean / boolean", default: "240 / series > 1 / true", description: "" },
    ],
  },
  "bar-chart": {
    props: [
      { name: "data / x / series / ariaLabel", type: "as LineChart", description: "x is the category. Each row is its own band (two \"Mon\"s stay two bars); dates key by their local day and label as \"Oct 8\" unless you pass xFormat." },
      { name: "stacked", type: "boolean", default: "false", description: "Pile series into one bar, with a hairline between segments; otherwise they sit side by side." },
      { name: "layout", type: `"vertical" | "horizontal"`, default: `"vertical"`, description: "Horizontal puts categories down the side — good for long labels." },
      ...chartPresetProps,
      { name: "valueFormat / xFormat", type: "(v) => string", description: "Value axis and tooltip / category labels." },
      { name: "height / legend / grid", type: "number / boolean / boolean", default: "240 / series > 1 / true", description: "" },
    ],
    notes: ["Bars start at zero. Bar ends take the theme's control radius (so shape-square squares them, and a ThemeScope's shape reaches them); only the outer end of a stack is rounded.", "selectedX dims every other bar."],
  },
  "donut-chart": {
    props: [
      { name: "data", type: "readonly Row[]", description: "One slice per row, in order from 12 o'clock. Keyed by position, so labels may repeat." },
      { name: "label / value", type: "(d: Row) => string / number", description: "Slice name and size." },
      { name: "children", type: "ReactNode", description: "Centred in the hole — a total, a label. A selected slice replaces it with its value and share." },
      { name: "selectedIndex / defaultSelectedIndex / onSelect", type: "number | null / (row, index) => void", description: "Click, tap or Enter selects a slice; again clears. \"Other\" reports a null row." },
      { name: "legendValues", type: "boolean", default: "false", description: "Legend rows show each slice's value and share." },
      { name: "locale", type: "string", default: "the runtime's", description: "Numbers and percentages via Intl." },
      { name: "otherLabel", type: "string", default: `"Other"`, description: "Past eight slices, the smallest fold into one." },
      { name: "thickness", type: "number", default: "0.28", description: "Ring width as a share of the radius." },
      { name: "valueFormat", type: "(v: number) => string", description: "Tooltip, centre and table value; the share is added after it." },
      { name: "state / accessibilityTable", type: "as LineChart", description: "" },
      { name: "height / legend", type: "number / boolean", default: "220 / true", description: "" },
    ],
  },
  stat: {
    props: [
      { name: "variant", type: `"fill" | "glass"`, default: `"fill" ("glass" when intensity, tint or elevation is set)`, description: "fill: a tile with a corner concentric to its container — use inside a Card. glass: its own pane, for a stat standing alone on the ground." },
      ...glassProps,
      { name: "direction (StatTrend)", type: `"up" | "down" | "flat"`, default: `"up"`, description: "Which way the figure moved: the arrow, and the word screen readers hear." },
      { name: "sentiment (StatTrend)", type: `"positive" | "negative" | "neutral"`, default: "from direction", description: "Whether that's good: success, destructive or neutral colour. Latency going up: direction=\"up\" sentiment=\"negative\"." },
      { name: "srLabel (StatTrend)", type: "string", default: `"Increased" | "Decreased" | "Unchanged"`, description: "Read before the figure by screen readers." },
      { name: "formatStat(value, opts?)", type: "(n, { locale?, compact? } & Intl.NumberFormatOptions) => string", description: "Compact notation (12.5K) in the locale — what fits a tile." },
    ],
    notes: [
      "Parts: Stat, StatIcon, StatValue, StatLabel, StatTrend, StatDescription (\"vs last week\"), StatChart (a Sparkline slot), StatSkeleton.",
      "StatValue and StatLabel put their text in title, so a truncated figure can still be read.",
      "Tiles in a card are fills, not more glass (two levels of glass at most).",
    ],
  },
  kpi: {
    props: [
      { name: "label / value", type: "ReactNode / number", description: "What it counts, and the figure." },
      { name: "format / locale", type: "(v) => string / string", default: "compact notation", description: "12.4K by default." },
      { name: "trend", type: `{ value: number; format?; good?: "up" | "down" }`, description: "The change (0.12 = +12%). Its sign sets the arrow; good decides the colour — resting heart rate falling is good: good: \"down\"." },
      { name: "description / icon / chart", type: "ReactNode", description: "Context, a glyph, and a small chart (a Sparkline) under the figure." },
      { name: "loading", type: "boolean", default: "false", description: "A skeleton tile." },
      { name: "variant", type: `"fill" | "glass"`, default: `"fill"`, description: "As Stat." },
    ],
  },
  widget: {
    props: [
      { name: "size", type: `"small" | "medium" | "large" | "extraLarge" | "circular" | "rectangular" | "inline"`, default: `"small"`, description: "Apple's families in points (170², 364×170, 364×382, 768×382; lock screen 76², 172×76, one line)." },
      { name: "accented", type: "boolean", default: "false", description: "iOS's tinted rendering: text in the accent, charts desaturated." },
    ],
    notes: [
      "Parts: Widget, WidgetHeader, WidgetTitle, WidgetValue, WidgetDescription, WidgetContent.",
      "The widget is a container (@container/widget): lay content out by the space it gets, e.g. @md/widget:grid-cols-2. 16pt margins; text never under 11pt.",
      "Home-screen sizes are glass panes; the lock-screen accessories have no pane of their own. Give a circular widget an aria-label.",
    ],
  },
  "range-chart": {
    props: [
      { name: "data / label / low / high", type: "readonly Row[] / accessors", description: "One capsule per row, low to high." },
      { name: "current", type: "(d: Row) => number | null", description: "A dot on the capsule — now." },
      { name: "min / max", type: "number", default: "the data's extent", description: "The shared domain." },
      { name: "from / to", type: "CSS colour", default: "var(--chart-5) / var(--chart-1)", description: "The gradient across the whole domain; each capsule shows its slice." },
      { name: "valueFormat", type: "(v: number) => string", description: "e.g. (v) => `${v}°`." },
    ],
    notes: ["Pure HTML: Server Component safe, flips in RTL, and a list screen readers read row by row (\"Mon: low 6°, high 12°\")."],
  },
  backdrop: {
    props: [
      { name: "variant", type: `"image" | "video" | "mesh" | "noise"`, default: `"mesh"`, description: "A photo, a looping video, a four-point palette mesh, or the base with a fine grain." },
      { name: "src / poster / alt", type: "string", description: "Media URL; the video's still; alt only when the image carries meaning." },
      { name: "position", type: "string", default: `"center"`, description: "object-position for image and video." },
      { name: "dim", type: "number", default: "0", description: "A dark scrim 0–1 over the media; 0.35 for clear glass over busy photos." },
    ],
    notes: ["Fixed behind the page by default; className=\"absolute\" fills a container.", "Video is muted, inline and looping; it holds on its poster under reduced motion and while off screen."],
  },
  "alert-dialog": {
    props: [
      { name: "size (AlertDialogContent)", type: `"default" | "sm"`, default: `"default"`, description: "Default: up to 28rem, buttons stacked on phones and in a trailing row from sm. sm: 20rem, two buttons side by side at equal width." },
      { name: "variant (AlertDialogAction)", type: `"default" | "destructive" | …Button variants`, default: `"default"`, description: "The default action: solid accent, or the tinted destructive button for an action the user didn't deliberately choose." },
      { name: "variant (AlertDialogCancel)", type: "Button variant", default: `"secondary"`, description: "A soft fill — never glass on the glass panel." },
      { name: "open / defaultOpen / onOpenChange", type: "Radix AlertDialog", description: "Controlled or not, as Radix." },
    ],
    notes: [
      "Use AlertDialog for destructive or irreversible confirmations; Dialog for everything else (forms, details, anything the user may dismiss by clicking away).",
      "role=\"alertdialog\": an outside click doesn't close it, only its buttons and Escape (which cancels). Cancel is focused on open.",
      "Parts (shadcn's API): AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, plus AlertDialogPortal and AlertDialogOverlay.",
      "Write Cancel first, then the action: on phones the action stacks on top and Cancel at the bottom; from sm they sit in a trailing row with Cancel leading.",
      "Apple's rules: a title of two lines at most, a short message, at most three buttons labelled with one- or two-word verbs, and always a Cancel. Don't use an alert for undoable deletes or plain information.",
      "The page behind dims by --glass-dim with no blur; enter and exit run on --glass-duration and still under reduced motion.",
    ],
  },
  sheet: {
    props: [
      { name: "side (SheetContent)", type: `"top" | "right" | "bottom" | "left" | "start" | "end"`, default: `"right"`, description: "Floats inset from that edge (and the safe area). start / end follow the writing direction." },
      { name: "detents (SheetContent)", type: `("medium" | "large" | number | \`\${number}px\`)[]`, description: "Bottom sheets: the heights it rests at, smallest first. A number is a fraction of the viewport. Full height (large) turns opaque." },
      { name: "detent / defaultDetent / onDetentChange", type: "number", default: "0", description: "The current detent's index." },
      { name: "grabber (SheetContent)", type: "boolean", default: "true with detents", description: "The capsule at the top: a button — press, Enter or Space steps to the next detent, ↑/↓ step up or down; drag it to resize or, below the smallest detent, to dismiss." },
      { name: "onBeforeDismiss (SheetContent)", type: "() => boolean | Promise<boolean>", description: "Asked before a drag-to-dismiss closes the sheet; return false to keep it (\"Discard changes?\")." },
      { name: "modal (Sheet)", type: "boolean", default: "true", description: "false makes an inspector: no dimmed page, no focus trap, outside clicks don't close it." },
    ],
    notes: ["Put long content in SheetBody: it fills the space between SheetHeader and SheetFooter and scrolls."],
  },
  dialog: { notes: ["Opened from a DialogTrigger, the trigger morphs into the panel (and back) with a same-document View Transition where the browser supports it; elsewhere, and under reduced motion, the panel materialises in place.", "Never taller than the viewport: a long dialog scrolls. Wrap the middle in DialogBody to keep the header and footer in view while it scrolls."] },
  toaster: {
    notes: [
      "The scheme follows the .dark / .light class on <html> (next-themes, shadcn); pass theme to set it yourself.",
      "Bottom-right on wide screens, top-centre on narrow ones (≤ 600px) unless you pass position.",
      "Toasts clear a fixed Dock (--dock-inset) at the bottom and a fixed top Toolbar (--toolbar-inset-top) at the top. Pass offset / mobileOffset to place them yourself.",
    ],
  },
  // M3 forms
  input: {
    props: [{ name: "size", type: `"sm" | "default" | "lg"`, default: `"default"`, description: "The control height. Replaces the HTML size attribute." }],
    notes: ["Search fields drop the browser's cancel glyph and number fields their spinners — use an InputGroup with a clear button, or a Stepper.", "For icons, units, clear and reveal buttons, wrap it in an InputGroup instead of positioning by hand."],
  },
  textarea: {
    props: [{ name: "maxRows", type: "number", default: "10", description: "Grows with its content up to this many lines, then scrolls." }],
    notes: ["Grows with field-sizing: content, or a small script where that isn't supported. Padding and the minimum height follow density."],
  },
  label: {
    props: [
      { name: "required", type: "boolean", default: "false", description: "A marker after the text (hidden from screen readers — mark the control required too)." },
      { name: "optional", type: "boolean | string", default: "false", description: "A quiet \"(optional)\" hint, or your own text." },
    ],
  },
  spinner: {
    props: [{ name: "variant", type: `"ring" | "ticks"`, default: `"ring"`, description: "An arc, or iOS's radial spokes." }],
    notes: ["A role=\"status\" labelled \"Loading\" — pass aria-label to say what's loading, or aria-hidden when something else announces it (Button loading does).", "Reduced motion: the ring holds still, the ticks step slowly."],
  },
  skeleton: { notes: ["Size it with classes (h-4 w-3/5, size-10 rounded-full). It's aria-hidden: mark the loading region aria-busy.", "The shimmer runs toward the reading direction and is off under reduced motion."] },
  select: {
    props: [
      { name: "variant (SelectTrigger)", type: `"default" | "pill"`, default: `"default"`, description: "pill is Apple's pop-up button: a capsule with the current choice and ↕ chevrons." },
      { name: "size (SelectTrigger)", type: `"sm" | "default" | "lg"`, default: `"default"`, description: "The control heights Input uses." },
      { name: "position (SelectContent)", type: `"popper" | "item-aligned"`, default: `"popper"`, description: "popper drops below the trigger; item-aligned overlays the chosen row (macOS)." },
    ],
    notes: ["Parts (shadcn's API): Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton.", "The list is the dropdown menu's liquid panel and grows out of the trigger. Use it for more than ~5 options; fewer read better as a RadioGroup or SegmentedControl."],
  },
  "radio-group": {
    props: [{ name: "variant", type: `"default" | "card"`, default: `"default"`, description: "card: wrap each item in RadioGroupCard and the whole tile selects, with an accent rim when chosen." }],
    notes: ["Arrow keys move the choice (Radix). Name the group with aria-label or a FieldLegend.", "Apple: 2–5 options; more belong in a Select."],
  },
  field: {
    props: [
      { name: "orientation (Field)", type: `"vertical" | "horizontal" | "responsive"`, default: `"vertical"`, description: "horizontal is a settings row — label leading, switch trailing. responsive switches at the FieldGroup's @md container width." },
      { name: "data-invalid (Field)", type: "boolean", description: "Colours the field and sets aria-invalid on its control." },
      { name: "errors (FieldError)", type: "{ message?: string }[]", description: "From react-hook-form / zod; duplicates collapse, several become a list. Renders nothing when empty." },
      { name: "variant (FieldLegend)", type: `"legend" | "label"`, default: `"legend"`, description: "" },
    ],
    notes: [
      "Parts (shadcn's API): FieldSet, FieldLegend, FieldGroup, Field, FieldContent, FieldLabel, FieldTitle, FieldDescription, FieldError, FieldSeparator.",
      "Wiring: the first control inside a Field gets an id (if it has none) that FieldLabel points at, aria-describedby → the description and the error, and aria-invalid while there's an error. Your own ids and aria-describedby are kept.",
      "FieldError is role=\"alert\". Works with react-hook-form's Controller or TanStack Form — glasscn doesn't ship a separate form item.",
    ],
  },
  "input-group": {
    props: [
      { name: "align (InputGroupAddon)", type: `"inline-start" | "inline-end" | "block-start" | "block-end"`, default: `"inline-start"`, description: "Logical: inline-start is the left in LTR, the right in RTL. block-* put a row above or below (with a textarea)." },
      { name: "size (InputGroupButton)", type: `"xs" | "sm" | "icon-xs" | "icon-sm"`, default: `"xs"`, description: "Ghost by default; variant=\"default\" for a submit capsule." },
    ],
    notes: ["Parts: InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea. The group owns the fill, rim, focus ring and invalid rim.", "Recipes: a search icon + clear button, password reveal (aria-pressed), units, a submit button on a textarea. Clicking an addon focuses the input."],
  },
  "button-group": {
    props: [
      { name: "orientation", type: `"horizontal" | "vertical"`, default: `"horizontal"`, description: "" },
      { name: "variant", type: `"default" | "glass"`, default: `"default"`, description: "glass floats the group on one liquid capsule and clears the buttons — for over content, never on a pane." },
    ],
    notes: ["Parts: ButtonGroup (role=\"group\" — give it an aria-label), ButtonGroupText, ButtonGroupSeparator. Nest groups for gaps between clusters."],
  },
  toggle: {
    props: [
      { name: "variant", type: `"default" | "outline"`, default: `"default"`, description: "" },
      { name: "size", type: `"sm" | "default" | "lg"`, default: `"default"`, description: "" },
    ],
    notes: ["All Radix Toggle props: pressed, defaultPressed, onPressedChange. Icon-only toggles need an aria-label."],
  },
  "toggle-group": {
    props: [
      { name: "type", type: `"single" | "multiple"`, description: "Required (Radix)." },
      { name: "spacing", type: "number", default: "0", description: "0 joins the items into one control; otherwise the gap in 0.25rem steps." },
    ],
    notes: ["variant and size on the group apply to every item. Arrow keys move between items."],
  },
  stepper: {
    props: [
      { name: "value / defaultValue / onValueChange", type: "number", default: "0", description: "" },
      { name: "min / max / step", type: "number", default: "0 / 100 / 1", description: "" },
      { name: "formatValue", type: "(value) => string", description: "What screen readers hear — \"3 cups\"." },
      { name: "size", type: `"sm" | "default"`, default: `"default"`, description: "" },
    ],
    notes: ["One role=\"spinbutton\": ↑/→ and ↓/← step, Shift or Page Up/Down ×10, Home/End jump. Hold a button to repeat; Shift-click steps ×10.", "Always show the value beside it, and name it (aria-label / aria-labelledby)."],
  },
  drawer: {
    notes: [
      "shadcn's Drawer parts — Drawer, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, DrawerTitle, DrawerDescription — on glasscn's bottom Sheet. No vaul dependency.",
      "DrawerContent takes every SheetContent prop except side: detents (default [\"medium\", \"large\"]), detent / onDetentChange, grabber, onBeforeDismiss.",
    ],
  },
  "context-menu": {
    props: [{ name: "variant (ContextMenuItem)", type: `"default" | "destructive"`, default: `"default"`, description: "Put the destructive item last." }],
    notes: [
      "Parts (shadcn's API) plus ContextMenuPreview: wrap the trigger's content in it and it lifts while the menu is open.",
      "Long-press opens it on touch (Radix). Apple: ≤ 3 groups; hide items that don't apply rather than disabling them.",
    ],
  },
  "confirmation-popover": {
    props: [
      { name: "title / description", type: "ReactNode", description: "title is required — it names the alertdialog." },
      { name: "confirmLabel / cancelLabel", type: "ReactNode", default: `"Confirm" / "Cancel"`, description: "Use the verb: \"Delete\", not \"OK\"." },
      { name: "variant", type: `"destructive" | "default"`, default: `"destructive"`, description: "" },
      { name: "onConfirm / onCancel", type: "() => void", description: "Both close it." },
    ],
    notes: ["Focus starts on Cancel. Escape or a click outside cancels. On phones an ActionSheet is often the better fit."],
  },
  "scroll-area": {
    props: [{ name: "edges (ScrollArea)", type: "boolean", default: "false", description: "Fade content into the top and bottom edges." }],
    notes: ["Parts: ScrollArea, ScrollBar (add <ScrollBar orientation=\"horizontal\" /> for sideways scrolling). Give the area an aria-label: its viewport is focusable so it can be scrolled from the keyboard."],
  },
  accordion: {
    props: [{ name: "variant (Accordion)", type: `"default" | "grouped"`, default: `"default"`, description: "grouped: an inset grouped list on a fill, hairlines between rows." }],
    notes: ["All Radix Accordion props: type (single | multiple), collapsible, value, defaultValue.", "The chevron points to the trailing side and turns down when open (Apple's disclosure); the height animation is off under reduced motion."],
  },
  collapsible: { notes: ["Parts: Collapsible, CollapsibleTrigger (asChild a Button), CollapsibleContent. The content's height animates; reduced motion opens it at once."] },
  alert: {
    props: [{ name: "variant", type: `"default" | "info" | "success" | "destructive"`, default: `"default"`, description: "destructive is role=\"alert\"; the others role=\"status\"." }],
    notes: ["Parts: Alert, AlertTitle, AlertDescription, AlertAction (trailing). A leading svg is laid out as the icon.", "A fill, not glass — it sits on panes."],
  },
  item: {
    props: [
      { name: "variant (Item)", type: `"default" | "outline" | "muted"`, default: `"default"`, description: "" },
      { name: "size (Item)", type: `"default" | "sm"`, default: `"default"`, description: "" },
      { name: "variant (ItemMedia)", type: `"default" | "icon" | "image"`, default: `"default"`, description: "icon is a filled tile; image a rounded thumbnail." },
    ],
    notes: ["Parts (shadcn's API): ItemGroup, Item (asChild for a link or button), ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemHeader, ItemFooter, ItemSeparator.", "For iOS Settings-style inset lists (icon tiles, values, chevrons, inset hairlines) use GroupedList."],
  },
  empty: {
    props: [
      { name: "variant (EmptyMedia)", type: `"default" | "icon"`, default: `"default"`, description: "icon: a filled tile." },
      { name: "query (EmptyTitle)", type: "string", description: "The search flavour: \"No results for “query”\" unless you write the title." },
    ],
    notes: ["Parts (shadcn's API): Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent."],
  },
}

type Item = (typeof registry.items)[number]
const isDocumented = (i: Item) => i.type === "registry:ui" || i.type === "registry:block"

export const docs: DocEntry[] = registry.items
  .filter((i) => isDocumented(i) && !i.name.startsWith("native-"))
  .map((i) => ({
    slug: i.name,
    title: i.title ?? i.name,
    description: i.description ?? "",
    group: GROUP_OF[(i.categories ?? []).find((c) => GROUP_OF[c]) ?? "surfaces"],
    dependencies: ((i as { dependencies?: string[] }).dependencies ?? []).filter((d) => d !== "cn"),
    ...PROPS[i.name],
  }))

export const docBySlug = (slug: string) => docs.find((d) => d.slug === slug)

export const nativeItems = registry.items.filter((i) => i.name.startsWith("native-"))
export const themeItems = registry.items.filter((i) => i.type === "registry:theme")
