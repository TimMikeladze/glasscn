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

const PROPS: Record<string, { props?: PropRow[]; notes?: string[] }> = {
  aurora: {
    props: [
      { name: "speed", type: "number", default: "--aurora-speed (1)", description: "Drift speed multiplier." },
      { name: "intensity", type: "number", default: "--aurora-opacity (1)", description: "Blob opacity, 0–1." },
      { name: "scale", type: "number", default: "--aurora-scale (1)", description: "Blob size multiplier." },
      { name: "blur", type: "number", default: "--aurora-blur (0)", description: "Extra blur on the blobs, px." },
      { name: "animate", type: "boolean", default: "true", description: "Drift or hold still. Always still under prefers-reduced-motion." },
      { name: "className", type: "string", default: `"fixed inset-0 -z-10"`, description: "Use `absolute` to fill a positioned container instead of the viewport." },
    ],
    notes: ["Colours come from --aurora-1, --aurora-2, --aurora-3 over --aurora-base — set by the theme items, or by you."],
  },
  typography: {
    props: [
      { name: "level / size (Heading)", type: "1–6 / display | 1–6", default: "2 / the level", description: "level sets the element (h1–h6), size the look — so an h2 can look like an h1." },
      { name: "variant (Text)", type: `"body" | "lead" | "large" | "small" | "muted" | "overline" | "caption"`, default: `"body"`, description: "lead is held to --glass-measure." },
      { name: "size (Display)", type: `"sm" | "md" | "lg" | "xl"`, default: `"lg"`, description: "Steps 4, 5, 6 and 8 of the scale." },
      { name: "ordered (List)", type: "boolean", default: "false", description: "Numbered, with the theme's numerals." },
      { name: "asChild", type: "boolean", default: "false", description: "On Heading, Text, Display and TextLink — e.g. a Next Link as a TextLink." },
    ],
    notes: [
      "Sizes are type-step-n2 … type-step-6: 1rem × --glass-text-scale × --glass-type-ratio^n (CSS pow()). Use them in your own components too.",
      "Fonts: font-glass-sans | heading | display | mono — a theme font if one is set, otherwise your app's --font-sans / --font-heading / --font-mono.",
    ],
  },
  prose: {
    notes: [
      "Wrap rendered Markdown/MDX: <Prose dangerouslySetInnerHTML={{ __html }} /> or <Prose><MDXContent /></Prose>.",
      "Line length follows --glass-measure; className=\"max-w-none\" to fill the container. Everything else comes from the type, colour and shape tokens.",
    ],
  },
  "theme-scope": {
    props: [
      { name: "palette / material / shape / motion / density / type", type: "string | HueSpec | number", description: "Preset names (or a hue spec for the palette) — composed with createGlassTheme." },
      { name: "fonts", type: "{ sans?, heading?, display?, mono? }", description: "Theme fonts by catalogue key (inter, fraunces, jetbrains-mono…) or raw CSS stacks." },
      { name: "loadFonts", type: "boolean", default: "false", description: "Add one Google Fonts stylesheet for the theme's fonts." },
      { name: "theme", type: "GlassTheme", description: "A finished theme instead, e.g. from createGlassTheme or decodeTheme." },
      { name: "scheme", type: `"light" | "dark"`, description: "Force a scheme for this subtree; omit to follow the page's .dark." },
    ],
    notes: [
      "Writes one sanitised, scoped <style> for its own subtree. Portalled content (dialogs, menus, tooltips) renders outside it — wrap the portal target, or theme the page instead.",
    ],
  },
  glass: { props: [...glassProps, { name: "asChild", type: "boolean", default: "false", description: "Render the child element as the pane." }] },
  card: {
    props: [...glassProps, { name: "size", type: `"default" | "sm"`, default: `"default"`, description: "Padding and corner scale." }],
    notes: ["Parts: CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter — same as shadcn's Card."],
  },
  button: {
    props: [
      { name: "variant", type: `"default" | "glass" | "tinted" | "secondary" | "outline" | "ghost" | "destructive" | "link"`, default: `"default"`, description: "Solid accent, frosted, accent wash, soft fill, rim, bare, danger, or text." },
      { name: "size", type: `"default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"`, default: `"default"`, description: "Height and padding; icon sizes are square." },
      { name: "shape", type: `"pill" | "rounded"`, default: `"pill"`, description: "Capsule, or shadcn-style rounded corners." },
      { name: "asChild", type: "boolean", default: "false", description: "Render a link or other element as the button." },
    ],
  },
  badge: { props: [{ name: "variant", type: `"default" | "tinted" | "glass" | "secondary" | "outline" | "destructive"`, default: `"default"`, description: "" }] },
  switch: { props: [{ name: "size", type: `"default" | "sm"`, default: `"default"`, description: "51×31 iOS size, or a compact 36×22." }], notes: ["All Radix Switch props: checked, defaultChecked, onCheckedChange, disabled…"] },
  "segmented-control": {
    props: [
      { name: "value / defaultValue", type: "string", description: "The chosen segment. Controlled or not." },
      { name: "onValueChange", type: "(value: string) => void", description: "Fires with the new segment. Never fires with an empty value — a segmented control always has a selection." },
      { name: "size", type: `"sm" | "default" | "lg"`, default: `"default"`, description: "" },
    ],
  },
  tabs: { props: [{ name: "variant (TabsList)", type: `"default" | "plain" | "line"`, default: `"default"`, description: "Glass capsule with a sliding pill, the pill alone, or a sliding underline." }] },
  dock: {
    props: [
      { name: "position (Dock)", type: `"fixed" | "static"`, default: `"fixed"`, description: "Float at the bottom of the viewport (safe-area aware) or sit in flow." },
      { name: "value / onValueChange (DockBar)", type: "string", description: "The current destination; route on change." },
      { name: "asChild (DockAction)", type: "boolean", default: "false", description: "Render a link as the action button." },
    ],
  },
  checkbox: { notes: ["All Radix Checkbox props: checked (true | false | \"indeterminate\"), defaultChecked, onCheckedChange, disabled, required, name.", "Indeterminate shows a dash — use it for a parent that controls a group."] },
  table: { notes: ["Parts (shadcn's API): Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption.", "No pane of its own — put it in a Card. Rows take data-state=\"selected\" for the selected fill.", "Cell padding scales with --glass-density; numbers use the theme's numerals. Align figures with className=\"text-right\"."] },
  "data-table": {
    props: [
      { name: "columns", type: "TableOptions<DataTableFeatures, Row>[\"columns\"]", default: "—", description: "Build with createDataTableColumnHelper<Row>() and helper.columns([...]). Keep it stable (module scope or useMemo)." },
      { name: "data", type: "Row[]", default: "—", description: "Your rows, unmodified. Keep the array stable between real changes." },
      { name: "searchPlaceholder", type: "string", default: "—", description: "Shows a search box filtering every text and number column." },
      { name: "pageSize", type: "number", default: "10", description: "Rows per page." },
      { name: "initialSorting", type: "SortingState", default: "[]", description: "e.g. [{ id: \"date\", desc: true }]." },
      { name: "getRowId", type: "(row: Row, index: number) => string", default: "row index", description: "Stable ids keep selection on the right rows." },
      { name: "onRowClick", type: "(row: Row) => void", default: "—", description: "Makes rows clickable and focusable (Enter opens)." },
      { name: "empty", type: "ReactNode", default: "\"No results.\"", description: "Shown when nothing matches." },
    ],
    notes: [
      "Built on TanStack Table v9 (useTable + tableFeatures): sorting, global filter, pagination and row selection are registered in dataTableFeatures.",
      "selectColumn<Row>() adds a checkbox column (select row / select page, indeterminate when some are picked).",
      "DataTableColumnHeader sorts its column on click (ascending → descending → off) and the th carries aria-sort.",
      "DataTablePagination is exported for custom layouts: selected count, page x of y, previous/next.",
    ],
  },
  "grouped-list": { notes: ["Parts: GroupedList, GroupedListHeader, GroupedListContent, GroupedListItem (asChild for button/link rows), GroupedListIcon, GroupedListTitle, GroupedListDescription, GroupedListValue, GroupedListChevron, GroupedListFooter."] },
  avatar: {
    props: [{ name: "size (Avatar, AvatarGroupCount)", type: `"sm" | "default" | "lg"`, default: `"default"`, description: "24, 32 or 40px, scaled by density." }],
    notes: ["Parts: Avatar, AvatarImage, AvatarFallback (shown until the image loads, or if it fails), AvatarGroup (overlapping stack with a glass rim), AvatarGroupCount (the \"+3\")."],
  },
  chat: {
    props: [
      { name: "from (ChatMessage)", type: `"user" | "assistant" | "system"`, default: `"assistant"`, description: "User turns sit on the right in the accent; assistant turns on the left on a fill; system lines are centred and muted." },
      { name: "grouped (ChatMessage)", type: "boolean", default: "false", description: "A follow-up from the same sender: tighter gap, avatar hidden, the sender-side corners squared." },
      { name: "avatar (ChatMessage)", type: "ReactNode", description: "Beside the bubble — usually an Avatar." },
      { name: "variant (ChatBubble)", type: `"user" | "assistant" | "system"`, default: "the message's from", description: "Override the bubble's look." },
      { name: "name (ChatTyping)", type: "string", default: `"Assistant"`, description: "Announced as \"<name> is typing\"." },
      { name: "onSelect (ChatSuggestions)", type: "(value: string) => void", description: "Called with a chip's value (defaults to its text)." },
      { name: "onSubmit (ChatComposer)", type: "(text: string) => void", description: "The trimmed text. Enter sends, Shift+Enter breaks a line, IME composition never sends." },
      { name: "value / defaultValue / onValueChange (ChatComposer)", type: "string", description: "Control the draft, or let the composer keep it and clear itself after sending." },
      { name: "variant (ChatComposer)", type: `"inset" | "floating"`, default: `"inset"`, description: "A fill inside a pane, or a strong-glass capsule floating over the bottom of a thread." },
      { name: "leading / disabled / placeholder (ChatComposer)", type: "ReactNode / boolean / string", description: "A slot before the field (attach), disable while offline, the field's label." },
    ],
    notes: [
      "Parts: ChatThread, ChatMessage, ChatBubble, ChatMeta, ChatDivider, ChatTyping, ChatSuggestions, ChatSuggestion, ChatComposer. It owns no messages and no networking.",
      "ChatThread sticks to the newest message while you're at the bottom, and always when the newest message is the user's. Scrolled up, a \"jump to latest\" button appears. Give it a height (h-full in a flex parent). Set --chat-thread-inset to leave room for a floating composer.",
      "With AI SDK useChat: map messages to <ChatMessage from={m.role}> with a ChatBubble per text part; render <ChatTyping /> in an assistant message while status === \"submitted\"; pass sendMessage({ text }) as the composer's onSubmit and disabled={status !== \"ready\"}.",
    ],
  },
  "activity-rings": {
    props: [
      { name: "rings", type: "{ value: number; color?: string; label?: string }[]", description: "Outermost first. value 0–1; above 1 laps. Colours default to --chart-1..3." },
      { name: "size / stroke / gap", type: "number", default: "160 / 16 / 4", description: "Pixel geometry." },
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
      { name: "today", type: "string", default: "the current date", description: "Pass it when rendering on the server to avoid a timezone mismatch." },
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
      { name: "height (ChartContainer)", type: "number", default: "320", description: "Width follows the container." },
      { name: "animate (ChartContainer)", type: "boolean", default: "true", description: "Draw in on mount. Reduced motion always snaps." },
      { name: "items (ChartLegend)", type: "{ label: string; color?: string }[]", description: "Colours default to chartColor(index)." },
      { name: "chartColor(i)", type: "(i: number) => string", description: "var(--chart-1…5), cycling." },
    ],
    notes: [
      "The container maps tokens onto TanStack Charts' theme variables: --ts-chart-1…5 ← --chart-1…5, --ts-chart-6 ← --primary, the tooltip ← glass-strong. Text and grid inherit text-muted-foreground. Leave colours unset in your definition and palettes, schemes and ThemeScope re-theme it without a rebuild.",
      "This module owns the renderer import (it pulls in d3 pieces); import marks and scales from @tanstack/charts subpaths in your chart definition.",
      "Children are overlaid on the chart (the host is position: relative).",
    ],
  },
  "line-chart": {
    props: [
      { name: "data", type: "readonly Row[]", description: "Your rows, unmodified — tooltips and callbacks get them back." },
      { name: "x", type: "(d: Row) => string | number | Date", description: "Dates get a UTC time axis, numbers a linear one, strings evenly spaced points." },
      { name: "series", type: "{ id; label; value: (d: Row) => number | null; color? }[]", description: "One line each. null is a gap. Colours default to --chart-1…5." },
      { name: "ariaLabel", type: "string", description: "Required." },
      { name: "points", type: "boolean", default: "false", description: "A dot at each value." },
      { name: "curve", type: `"smooth" | "linear"`, default: `"smooth"`, description: "Smooth is monotone: it never swings past a peak." },
      { name: "valueFormat / xFormat", type: "(v) => string", description: "Axis ticks and tooltip." },
      { name: "height / legend / grid", type: "number / boolean / boolean", default: "240 / series > 1 / true", description: "" },
    ],
    notes: ["Hovering snaps to the nearest x and lists every series there. Keep series and accessors stable (module scope or useMemo): they key the chart definition."],
  },
  "area-chart": {
    props: [
      { name: "data / x / series / ariaLabel", type: "as LineChart", description: "Your rows, an x accessor, and one area per series." },
      { name: "stacked", type: "boolean", default: "false", description: "Pile the layers into a total. The tooltip still shows each layer's own value." },
      { name: "curve", type: `"smooth" | "linear"`, default: `"smooth"`, description: "" },
      { name: "valueFormat / xFormat", type: "(v) => string", description: "Axis ticks and tooltip." },
      { name: "height / legend / grid", type: "number / boolean / boolean", default: "240 / series > 1 / true", description: "" },
    ],
  },
  "bar-chart": {
    props: [
      { name: "data / x / series / ariaLabel", type: "as LineChart", description: "x is the category; dates become YYYY-MM-DD labels unless you pass xFormat." },
      { name: "stacked", type: "boolean", default: "false", description: "Pile series into one bar; otherwise they sit side by side." },
      { name: "layout", type: `"vertical" | "horizontal"`, default: `"vertical"`, description: "Horizontal puts categories down the side — good for long labels." },
      { name: "valueFormat / xFormat", type: "(v) => string", description: "Value axis and tooltip / category labels." },
      { name: "height / legend / grid", type: "number / boolean / boolean", default: "240 / series > 1 / true", description: "" },
    ],
    notes: ["Bar ends take the theme's control radius (so shape-square squares them); only the outer end of a stack is rounded."],
  },
  "donut-chart": {
    props: [
      { name: "data", type: "readonly Row[]", description: "One slice per row, in order from 12 o'clock." },
      { name: "label / value", type: "(d: Row) => string / number", description: "Labels name slices in the legend and tooltip and must be unique." },
      { name: "children", type: "ReactNode", description: "Centred in the hole — a total, a label." },
      { name: "thickness", type: "number", default: "0.28", description: "Ring width as a share of the radius." },
      { name: "valueFormat", type: "(v: number) => string", description: "Tooltip value; the share is added after it." },
      { name: "height / legend", type: "number / boolean", default: "220 / true", description: "" },
    ],
  },
  stat: { props: glassProps, notes: ["Parts: Stat, StatIcon, StatValue, StatLabel, StatTrend (direction up | down)."] },
  sheet: { props: [{ name: "side (SheetContent)", type: `"top" | "right" | "bottom" | "left"`, default: `"right"`, description: "Floats inset from that edge." }] },
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
