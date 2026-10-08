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

export type Group = "Surfaces" | "Controls" | "Overlays" | "Navigation" | "Data" | "Blocks"
export const GROUPS: Group[] = ["Surfaces", "Controls", "Overlays", "Navigation", "Data", "Blocks"]

const GROUP_OF: Record<string, Group> = { surfaces: "Surfaces", controls: "Controls", overlays: "Overlays", navigation: "Navigation", data: "Data", blocks: "Blocks" }

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
  "theme-scope": {
    props: [
      { name: "palette / material / shape / motion / density", type: "string | HueSpec | number", description: "Preset names (or a hue spec for the palette) — composed with createGlassTheme." },
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
  "grouped-list": { notes: ["Parts: GroupedList, GroupedListHeader, GroupedListContent, GroupedListItem (asChild for button/link rows), GroupedListIcon, GroupedListTitle, GroupedListDescription, GroupedListValue, GroupedListChevron, GroupedListFooter."] },
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
