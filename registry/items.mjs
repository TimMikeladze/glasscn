/**
 * Every glasscn item, by hand: what it is, which files it ships, what it needs.
 * `scripts/generate.mjs` adds the foundation's tokens and the palette themes and
 * writes registry.json — never edit registry.json directly.
 */

import { existsSync, readFileSync } from "node:fs"

const R = "{REGISTRY_URL}/r"
const foundation = `${R}/glass-style.json`

/** A web component: one file under components/glass, the foundation, and its own needs. */
const ui = (name, title, description, { deps = [], reg = [], categories = [], extraFiles = [] } = {}) => ({
  name,
  type: "registry:ui",
  title,
  description,
  categories: ["glass", ...categories],
  dependencies: ["cn", ...deps],
  registryDependencies: [foundation, ...reg],
  files: [
    { path: `src/components/glass/${name}.tsx`, type: "registry:ui", target: `@components/glass/${name}.tsx` },
    ...extraFiles,
  ],
})

const hook = `${R}/use-sliding-indicator.json`
const charts = `${R}/glass-charts.json`
const at = (name) => `${R}/${name}.json`

export const foundations = [
  {
    name: "glass-style",
    type: "registry:lib",
    title: "Glass style",
    description:
      "The design tokens (frost, rim, highlight, shadow, blur, saturation, fill, aurora, liquid, clarity, labels, status), the material utilities (glass / glass-strong / glass-subtle), the liquid control-layer utilities (glass-liquid / glass-liquid-clear), focus, hit-area, concentric corners, Apple text styles, accessibility overrides, aurora and draw keyframes, a no-backdrop-filter fallback, and glassVariants — the cva every surface shares.",
    categories: ["glass", "foundations"],
    // tw-animate-css: overlay enter/exit classes (animate-in, zoom-in-95…). `shadcn init` already imports it.
    dependencies: ["cn", "class-variance-authority", "tw-animate-css"],
    docs: 'glasscn is installed. Put <Aurora /> (shadcn add @glasscn-app/aurora) behind your app, and make sure your global CSS has @import "tw-animate-css"; (shadcn init adds it) so overlays animate.',
    files: [{ path: "src/lib/glass-variants.ts", type: "registry:lib", target: "@lib/glass-variants.ts" }],
    // cssVars + css are filled in by scripts/generate.mjs from src/lib/glass-theme.ts and registry/stylesheet.mjs
  },
  {
    name: "glass-theme",
    type: "registry:lib",
    title: "Theme engine",
    description:
      "The schema of every glass primitive, the palettes and presets, a hue-harmony palette generator, and exports to CSS, inline style, a shadcn theme item and a share code — with value sanitising and a legibility estimate.",
    categories: ["glass", "foundations"],
    files: [{ path: "src/lib/glass-theme.ts", type: "registry:lib", target: "@lib/glass-theme.ts" }],
  },
  {
    name: "use-sliding-indicator",
    type: "registry:hook",
    title: "useSlidingIndicator",
    description: "Exposes the selected child's box as CSS variables so one element can slide between items — the moving thumb in segmented controls, tabs and the dock.",
    categories: ["glass", "foundations"],
    files: [{ path: "src/hooks/use-sliding-indicator.ts", type: "registry:hook", target: "@hooks/use-sliding-indicator.ts" }],
  },
  {
    name: "use-glass-pointer",
    type: "registry:hook",
    title: "useGlassPointer",
    description: "Feeds liquid glass from the pointer: --glass-press-x/y for the glass-illuminate press glow, and optionally turns the rim's light toward a hovering pointer. rAF-batched, no React state.",
    categories: ["glass", "foundations"],
    files: [{ path: "src/hooks/use-glass-pointer.ts", type: "registry:hook", target: "@hooks/use-glass-pointer.ts" }],
  },
  {
    name: "glass-charts",
    type: "registry:lib",
    title: "Chart maths",
    description: "Pure maths for the data components: ring radii and arcs, scaled series, smooth Catmull-Rom paths and areas, the heatmap week grid, bar shares, gauge arcs and category segments.",
    categories: ["glass", "foundations"],
    files: [{ path: "src/lib/glass-charts.ts", type: "registry:lib", target: "@lib/glass-charts.ts" }],
  },
]

export const components = [
  // surfaces
  ui("aurora", "Aurora", "The living ground: three palette blobs drifting over the base colour. Pure CSS, reduced-motion aware.", { categories: ["surfaces"] }),
  ui("backdrop", "Backdrop", "A ground for glass besides the aurora: a photo with an optional scrim, a muted looping video (paused under reduced motion), a palette mesh, or a fine noise.", { categories: ["surfaces"] }),
  ui("glass", "Glass", "A glass pane — material (content) or liquid (control layer, regular or clear). Intensity, tint and elevation variants; asChild.", { deps: ["radix-ui"], categories: ["surfaces"] }),
  ui("card", "Card", "shadcn's Card API on glass: header, title, description, action, content, footer, a hero image — regular, thick or solid material, and asChild for a pressable link card.", { deps: ["radix-ui"], categories: ["surfaces"] }),
  ui("theme-scope", "Theme scope", "Re-theme a subtree at runtime: a different palette, material, shape or scheme for one card, section or preview.", { reg: [at("glass-theme")], categories: ["surfaces"] }),
  // typography
  ui("typography", "Typography", "Heading, Text, Display, Blockquote, InlineCode, List and TextLink on the theme's modular scale — fonts, weights, case and numerals from the type tokens.", { deps: ["radix-ui", "class-variance-authority"], categories: ["typography"] }),
  ui("prose", "Prose", "Rich text (Markdown, MDX, CMS) set in the theme's type: headings, links, lists, quotes, code, tables.", { deps: ["radix-ui"], categories: ["typography"] }),
  // controls
  ui("button", "Button", "shadcn's Button with liquid glass, prominent (tinted liquid), tinted and secondary variants; capsule or rounded, elastic press, a loading state, pull-down and split buttons.", { deps: ["radix-ui", "class-variance-authority"], reg: [at("spinner")], categories: ["controls"] }),
  ui("badge", "Badge", "Small capsule labels: solid, tinted, glass, secondary, outline, destructive.", { deps: ["radix-ui", "class-variance-authority"], categories: ["controls"] }),
  ui("input", "Input", "A filled field for glass: soft fill, accent caret and focus ring.", { categories: ["controls"] }),
  ui("textarea", "Textarea", "A filled, auto-growing text area for glass.", { categories: ["controls"] }),
  ui("label", "Label", "An accessible label.", { deps: ["radix-ui"], categories: ["controls"] }),
  ui("switch", "Switch", "The iOS 27 switch: a wide capsule fills with the accent; the knob stretches toward where it's going, turns into a lens while held and can be dragged.", { deps: ["radix-ui"], categories: ["controls"] }),
  ui("checkbox", "Checkbox", "shadcn's Checkbox on glass: a soft box that fills with the accent, with an indeterminate dash.", { deps: ["radix-ui", "lucide-react"], categories: ["controls"] }),
  ui("segmented-control", "Segmented control", "The iOS segmented control: one concentric thumb slides to the chosen segment and can be dragged across them as a lens; capsule or rounded, or momentary actions.", { deps: ["radix-ui"], reg: [hook], categories: ["controls"] }),
  ui("tabs", "Tabs", "Tabs with a sliding pill (glass capsule, plain) or a sliding underline.", { deps: ["radix-ui", "class-variance-authority"], reg: [hook], categories: ["controls"] }),
  ui("glass-group", "Glass group", "One shared liquid backdrop for neighbouring controls (Apple's GlassEffectContainer), with an optional selection that slides and morphs between them.", { deps: ["radix-ui"], reg: [hook], categories: ["controls"] }),
  ui("slider", "Slider", "A soft track, an accent range and capsule knobs that turn into lenses while dragged. Ranges, ticks, a neutral origin, end icons, a value bubble and a thumbless progress variant.", { deps: ["radix-ui"], categories: ["controls"] }),
  ui("progress", "Progress", "A capsule bar filling from the second chart colour into the accent.", { deps: ["radix-ui"], categories: ["controls"] }),
  ui("kbd", "Kbd", "Keycaps on glass, singly or grouped.", { categories: ["controls"] }),
  ui("separator", "Separator", "A hairline that reads on glass.", { deps: ["radix-ui"], categories: ["controls"] }),
  ui("avatar", "Avatar", "shadcn's Avatar on glass: a round photo with a hairline rim, initials on a soft fill, and overlapping groups.", { deps: ["radix-ui", "class-variance-authority"], categories: ["controls"] }),
  ui("glass-preferences", "Glass preferences", "The viewer's Liquid Glass setting: a Clarity slider (clear ↔ tinted) and a Reduce transparency switch that write --glass-clarity for the whole page, persisted, with a head script that applies it before paint.", {
    reg: [at("label"), at("slider"), at("switch")],
    categories: ["controls"],
    extraFiles: [{ path: "src/components/glass/glass-preferences-script.tsx", type: "registry:ui", target: "@components/glass/glass-preferences-script.tsx" }],
  }),
  // overlays
  ui("dialog", "Dialog", "A liquid-glass modal over a dimmed page that morphs out of its trigger (View Transitions) or materialises in place.", { deps: ["radix-ui", "lucide-react", "react-dom"], reg: [at("button")], categories: ["overlays"] }),
  ui("alert-dialog", "Alert dialog", "An Apple-style alert on strong glass: a bold title, a short message and capsule actions — for confirming destructive or irreversible choices. Only its buttons close it.", { deps: ["radix-ui"], reg: [at("button")], categories: ["overlays"] }),
  ui("sheet", "Sheet", "A floating glass panel that slides in from any edge, inset like an iPad sheet — with detents, a grabber, drag-to-dismiss and a non-modal inspector mode.", { deps: ["radix-ui", "lucide-react"], reg: [at("button")], categories: ["overlays"] }),
  ui("action-sheet", "Action sheet", "The iOS action sheet: a few choices in one liquid group rising from the bottom, Cancel in its own capsule — on the alert-dialog primitives.", { deps: ["radix-ui"], reg: [at("alert-dialog")], categories: ["overlays"] }),
  ui("popover", "Popover", "Floating glass content anchored to a trigger.", { deps: ["radix-ui"], categories: ["overlays"] }),
  ui("tooltip", "Tooltip", "A small glass capsule on hover and focus.", { deps: ["radix-ui"], categories: ["overlays"] }),
  ui("dropdown-menu", "Dropdown menu", "A glass menu: items, checkbox and radio items, labels, shortcuts, submenus.", { deps: ["radix-ui", "lucide-react"], categories: ["overlays"] }),
  ui("toaster", "Toaster", "Sonner toasts dressed in glass: bottom-right on wide screens, top-centre on phones, clear of the Dock and a top Toolbar.", { deps: ["sonner", "lucide-react"], categories: ["overlays"] }),
  // navigation
  ui("dock", "Dock", "The floating tab bar: a liquid capsule of destinations with a sliding pill and badges, drag-to-scrub, minimize on scroll, an accessory, a search tab and a tinted action button.", { deps: ["radix-ui"], reg: [hook, at("use-glass-pointer"), at("scroll-edge"), at("search-field")], categories: ["navigation"] }),
  ui("toolbar", "Toolbar", "A floating toolbar on the control layer: button groups sharing one liquid capsule, spacers, a title, an overflow menu, a prominent action and minimize on scroll.", { deps: ["radix-ui", "lucide-react"], reg: [at("dropdown-menu"), at("glass-group"), at("scroll-edge"), at("use-glass-pointer")], categories: ["navigation"] }),
  ui("scroll-edge", "Scroll edge", "Keeps bars legible over scrolling content — a progressive blur or a hard strip — and tells the bars when content is under them.", { categories: ["navigation"] }),
  ui("navigation-bar", "Navigation bar", "iOS's navigation bar: a large title that scrolls away into a small inline one, leading and trailing slots.", { reg: [at("scroll-edge")], categories: ["navigation"] }),
  ui("sidebar", "Sidebar", "A floating, inset liquid sidebar: collapsible, two levels, an overlay on phones, and BackgroundExtension to run media under it.", { deps: ["radix-ui", "lucide-react"], categories: ["navigation"] }),
  ui("search-field", "Search field", "A capsule search field: clear and cancel, a minimized button that morphs open, suggestions, and a bottom placement that rides the keyboard.", { deps: ["lucide-react"], categories: ["navigation"] }),
  ui("grouped-list", "Grouped list", "iOS Settings-style inset grouped rows on glass: headers, footers, icon tiles, values, chevrons.", { deps: ["radix-ui", "lucide-react"], categories: ["navigation"] }),
  // data
  ui("activity-rings", "Activity rings", "Apple's Activity rings: an angular gradient along each arc, round caps, endless laps past 100% with a shadow under the leading cap, and a glyph per ring. Server-component safe.", { reg: [charts], categories: ["data"] }),
  ui("progress-ring", "Progress ring", "One ring that closes around its content — a goal, a countdown, a seal.", { reg: [charts], categories: ["data"] }),
  ui("sparkline", "Sparkline", "A smooth measure over time that draws itself, with a soft area and the latest point lit.", { reg: [charts], categories: ["data"] }),
  ui("stat", "Stat", "A figure on a fill tile (glass when standalone): label, value, trend with sentiment, a description, a chart slot, compact formatting and a skeleton.", { deps: ["lucide-react"], categories: ["data"] }),
  ui("kpi", "KPI", "A key figure from Stat: compact value, a trend coloured by whether up is good, context and a sparkline slot — or a skeleton while it loads.", { reg: [at("stat")], categories: ["data"] }),
  ui("widget", "Widget", "Glanceable widgets at Apple's sizes — small, medium, large, extra large and the lock-screen circular, rectangular and inline — laid out by container queries, with an accented mode.", { categories: ["data"] }),
  ui("range-chart", "Range chart", "Low-to-high capsules on a shared scale with a current dot — Weather's ten-day temperatures, Health's heart-rate ranges. Server-component safe.", { reg: [charts], categories: ["data"] }),
  ui("bar-list", "Bar list", "Ranked horizontal bars with the label inside and the value at the end — top habits, sources, pages.", { reg: [charts], categories: ["data"] }),
  ui("gauge", "Gauge", "A three-quarter meter with an optional target tick and the figure in its bowl. Server-component safe.", { reg: [charts], categories: ["data"] }),
  ui("tracker", "Tracker", "A row of status blocks — uptime, or a habit's last 30 days.", { categories: ["data"] }),
  ui("category-bar", "Category bar", "A range split into coloured bands with a marker — a readiness score, a budget.", { reg: [charts], categories: ["data"] }),
  ui("heatmap", "Heatmap", "Days in week columns coloured by intensity — a contribution graph with month and weekday labels and a legend.", { reg: [charts], categories: ["data"] }),
  ui("chart", "Chart", "The chart host: TanStack Charts in a container that maps glass tokens — eight series colours, a glass-strong tooltip, Apple-style axes — plus loading/empty/error states, ChartDataTable and ChartSummary text alternatives, a legend and stable accessors.", { deps: ["@tanstack/charts", "d3-scale"], reg: [charts], categories: ["data"] }),
  ui("area-chart", "Area chart", "Volume over time: gradient areas under a line per series — stacked (diverging for negatives) or 100% — with scrubbing, selection and a grouped glass tooltip.", { deps: ["@tanstack/charts"], reg: [at("chart"), charts], categories: ["data"] }),
  ui("bar-chart", "Bar chart", "Amounts per category, grouped or stacked with separators, vertical or horizontal, theme-rounded bar ends and a selected bar.", { deps: ["@tanstack/charts"], reg: [at("chart"), charts], categories: ["data"] }),
  ui("line-chart", "Line chart", "Measures over time, one smooth (or stepped) line per series, with scrubbing, selection, a grouped glass tooltip and a crosshair.", { deps: ["@tanstack/charts"], reg: [at("chart"), charts], categories: ["data"] }),
  ui("donut-chart", "Donut chart", "Parts of a whole as a ring of rounded slices: an \"Other\" past eight, a selected slice in the hole, legend values and shares in your locale.", { deps: ["@tanstack/charts"], reg: [at("chart"), charts], categories: ["data"] }),
  ui("table", "Table", "shadcn's Table for glass: hairline rows, fill on hover and selection, muted headers, density-aware cells.", { categories: ["data"] }),
  ui("data-table", "Data table", "shadcn's data table as one component on TanStack Table v9: search, faceted filters, column visibility, selection, rows per page — controlled, server (manual) and virtual modes, loading and error rows.", { deps: ["@tanstack/react-table", "@tanstack/react-virtual", "lucide-react"], reg: [at("table"), at("input"), at("button"), at("checkbox"), at("dropdown-menu"), charts], categories: ["data"] }),
  // chat
  ui("chat", "Chat", "A conversation in parts: a thread that sticks to the latest message, user and assistant bubbles that group into runs, receipts, day dividers, typing dots, quick replies and a composer where Enter sends.", { deps: ["lucide-react", "class-variance-authority"], reg: [at("button")], categories: ["chat"] }),
  ui("chat-markdown", "Chat markdown", "Streaming-safe Markdown for chat replies — unclosed fences and marks closed as tokens arrive, GitHub tables and task lists — and ChatCodeBlock with language, copy, wrap and optional Shiki highlighting.", { deps: ["lucide-react", "react-markdown", "remark-gfm"], reg: [at("button"), at("prose")], categories: ["chat"] }),
  ui("chat-parts", "Chat parts", "AI SDK UIMessage parts on glass: reasoning (\"Thought for 12s\"), tool calls with approve/deny, sources and citations, files and attachment chips, errors with retry, message actions, reactions — and renderParts(message).", { deps: ["lucide-react", "radix-ui"], reg: [at("button"), at("chat"), at("chat-markdown")], categories: ["chat"] }),
  // pickers
  ui("command", "Command", "A cmdk command palette: a search capsule, groups, fill rows and shortcuts — CommandDialog floats it in a liquid panel for ⌘K.", { deps: ["cmdk", "lucide-react"], reg: [at("dialog")], categories: ["overlays"] }),
  ui("combobox", "Combobox", "A searchable select (Popover + Command): single, or multiple with removable chips — a token field.", { deps: ["lucide-react"], reg: [at("command"), at("popover")], categories: ["controls"] }),
  ui("calendar", "Calendar", "react-day-picker on glass: circular days, an accent today, capsule-ended ranges, dropdown captions, RTL.", { deps: ["react-day-picker", "lucide-react"], reg: [at("button")], categories: ["controls"] }),
  ui("date-picker", "Date picker", "A date, range or date-and-time behind a button — iOS's compact accent capsule or a form field — opening a calendar in a liquid popover; minute steps that divide 60.", { deps: ["react-day-picker", "lucide-react"], reg: [at("calendar"), at("popover")], categories: ["controls"] }),
  // M3 forms
  ui("spinner", "Spinner", "An activity indicator: an arc or iOS's radial ticks, a status with a label, a still frame under reduced motion. Button's loading state uses it.", { categories: ["controls"] }),
  ui("skeleton", "Skeleton", "A loading placeholder: a fill with a soft shimmer, still under reduced motion.", { categories: ["controls"] }),
  ui("select", "Select", "shadcn's Select on glass: a field trigger, a liquid list that grows out of it with a leading check, groups and labels — or a pill pop-up button showing the current choice.", { deps: ["radix-ui", "lucide-react"], categories: ["controls"] }),
  ui("radio-group", "Radio group", "shadcn's RadioGroup on glass: accent circles with a dot, 44pt hit areas, and a card variant where the whole tile selects.", { deps: ["radix-ui"], categories: ["controls"] }),
  ui("field", "Field", "shadcn's Field: label, control, description and error laid out together — and wired: ids, htmlFor, aria-describedby and aria-invalid. Sets, legends, groups, horizontal rows.", { deps: ["class-variance-authority"], reg: [at("label"), at("separator")], categories: ["controls"] }),
  ui("input-group", "Input group", "One filled field holding an input or textarea and addons: a search icon, units, clear, password reveal, a submit capsule.", { deps: ["class-variance-authority"], reg: [at("button"), at("input"), at("textarea")], categories: ["controls"] }),
  ui("button-group", "Button group", "Buttons joined into one control — shared corners, hairlines between, either orientation — or floating on one liquid capsule like an Apple toolbar group.", { deps: ["radix-ui", "class-variance-authority"], reg: [at("separator")], categories: ["controls"] }),
  ui("toggle", "Toggle", "shadcn's Toggle: a two-state button that takes the accent's tint when on.", { deps: ["radix-ui", "class-variance-authority"], categories: ["controls"] }),
  ui("toggle-group", "Toggle group", "Toggles in a row, single or multiple choice, joined or spaced.", { deps: ["radix-ui", "class-variance-authority"], reg: [at("toggle")], categories: ["controls"] }),
  ui("stepper", "Stepper", "Apple's − / + capsule pair: a spinbutton with arrow keys, Shift ×10 and hold-to-repeat, beside the value it changes.", { deps: ["lucide-react"], categories: ["controls"] }),
  ui("drawer", "Drawer", "shadcn's Drawer API on the bottom Sheet: a grabber, medium and large detents, drag to resize or dismiss — no vaul.", { reg: [at("sheet")], categories: ["overlays"] }),
  ui("context-menu", "Context menu", "Right-click or long-press for the dropdown menu's liquid panel at the pointer, with a preview that lifts while it's open.", { deps: ["radix-ui", "lucide-react"], categories: ["overlays"] }),
  ui("confirmation-popover", "Confirmation popover", "A destructive confirm anchored to the button that asked — an alertdialog popover with Cancel focused.", { deps: ["radix-ui"], reg: [at("button")], categories: ["overlays"] }),
  ui("scroll-area", "Scroll area", "shadcn's ScrollArea with capsule thumbs that read on glass, a focusable viewport and optional faded edges.", { deps: ["radix-ui"], categories: ["surfaces"] }),
  ui("accordion", "Accordion", "Apple's disclosure rows: a trailing chevron that turns down, content that slides open, plain or as an inset grouped list.", { deps: ["radix-ui", "lucide-react"], categories: ["surfaces"] }),
  ui("collapsible", "Collapsible", "Show and hide a region from a trigger, with a measured height animation.", { deps: ["radix-ui"], categories: ["surfaces"] }),
  ui("alert", "Alert", "An inline callout on a fill: icon, title, description and an action; info, success and destructive tints.", { deps: ["class-variance-authority"], categories: ["surfaces"] }),
  ui("item", "Item", "shadcn's Item: a flexible row of media, title, description and actions — plain, outlined or filled, in groups.", { deps: ["radix-ui", "class-variance-authority"], reg: [at("separator")], categories: ["surfaces"] }),
  ui("empty", "Empty", "An empty state: an icon tile, a title (or “No results for …”), a description and actions.", { deps: ["class-variance-authority"], categories: ["surfaces"] }),
]

const block = (name, title, description, reg) => ({
  name,
  type: "registry:block",
  title,
  description,
  categories: ["glass", "blocks"],
  dependencies: ["lucide-react"],
  registryDependencies: reg.map(at),
  files: [{ path: `src/components/blocks/${name}.tsx`, type: "registry:component", target: `@components/glass-blocks/${name}.tsx` }],
})

export const blocks = [
  block("dashboard-01", "Dashboard", "Activity rings, stat tiles, a ranged sparkline and a 39-week heatmap.", ["activity-rings", "button", "card", "dropdown-menu", "heatmap", "segmented-control", "sparkline", "stat"]),
  block("analytics-01", "Analytics", "KPIs with deltas over the range, stacked active minutes, the training mix as a donut, a recovery gauge, top habits and a sortable table of recent sessions.", ["area-chart", "bar-list", "card", "data-table", "donut-chart", "gauge", "kpi", "segmented-control"]),
  block("settings-01", "Settings", "iOS Settings in glass: grouped rows, icon tiles, a switch, a segmented control and a slider.", ["grouped-list", "segmented-control", "slider", "switch"]),
  block("auth-01", "Sign in", "A glass sign-in card with email, password and a passkey option.", ["button", "card", "input", "label", "separator"]),
  block("chat-01", "Chat", "A conversation on glass: grouped turns with avatars, a read receipt, typing that streams into a reply you can stop, message actions and a reaction, quick replies above a floating composer.", ["avatar", "button", "card", "chat", "chat-parts"]),
]

const native = (name, title, description, deps, reg = [], ext = "tsx") => ({
  name: `native-${name}`,
  type: "registry:ui",
  title,
  description,
  categories: ["glass", "native"],
  dependencies: deps,
  registryDependencies: reg.map((n) => `${R}/native-${n}.json`),
  files: [{ path: `registry/native/${name}.${ext}`, type: ext === "ts" ? "registry:lib" : "registry:ui", target: `@components/glass/native/${name}.${ext}` }],
})

const NATIVE_NAMES = ["typography", "prose", "card", "theme-scope", "button", "badge", "input", "textarea", "label", "kbd", "separator", "avatar", "switch", "checkbox", "segmented-control", "glass-group", "tabs", "slider", "progress", "dock", "toolbar", "scroll-edge", "navigation-bar", "sidebar", "search-field", "grouped-list", "dialog", "alert-dialog", "sheet", "action-sheet", "popover", "tooltip", "dropdown-menu", "toaster", "activity-rings", "progress-ring", "sparkline", "stat", "bar-list", "gauge", "tracker", "category-bar", "heatmap", "chart", "area-chart", "bar-chart", "line-chart", "donut-chart", "table", "data-table", "chat", "dashboard-01", "analytics-01", "settings-01", "auth-01", "chat-01", "chat-markdown", "chat-parts", "command", "combobox", "calendar", "date-picker", "spinner", "skeleton", "select", "radio-group", "field", "input-group", "button-group", "toggle", "toggle-group", "stepper", "drawer", "context-menu", "confirmation-popover", "scroll-area", "accordion", "collapsible", "alert", "item", "empty", "backdrop", "kpi", "widget", "range-chart"]

/**
 * The native port of every web component and block: one React Native file per
 * item, the same name and API, rendered on the web by react-native-web.
 * Each file's imports are checked against these deps by registry.test.mjs.
 */
const NATIVE_COMPONENTS = nativeComponents()

function nativeComponents() {
  const meta = Object.fromEntries([...components, ...blocks].map((i) => [i.name, i]))
  return NATIVE_NAMES.map((name) => {
    const web = meta[name]
    const file = `registry/native/${name}.tsx`
    const source = existsSync(file) ? readFileSync(file, "utf8") : ""
    const pkgs = [...new Set([...source.matchAll(/from "([^@.][^"/]*|@[^"/]+\/[^"/]+)"/g)].map((m) => m[1]))].filter((p) => !["react", "react-native"].includes(p))
    const reg = [...new Set([...source.matchAll(/from "@\/components\/glass\/native\/([^"]+)"/g)].map((m) => m[1]))]
    return native(name, `${web?.title ?? name} (native)`, `${web?.description ?? ""} React Native: iOS, Android and web.`.trim(), pkgs, reg)
  })
}

export const nativeItems = [
  native("tokens", "Native tokens", "The glasscn palettes and tokens for React Native, a GlassThemeProvider and useGlassTheme().", []),
  native("glass", "Native glass", "Frosted glass for Expo: Liquid Glass on iOS 26, blur on older iOS, backdrop-filter on web, a fill on Android.", ["expo-blur", "expo-glass-effect"], ["tokens"]),
  native("aurora", "Native aurora", "The drifting aurora for React Native, drawn with react-native-svg on the native driver.", ["react-native-svg"], ["tokens"]),
  native("press", "Native press", "The pressable everything is built on: spring squash, dim, haptic, hover lift.", ["expo-haptics"]),
  native("ui", "Native UI tokens", "The web theme's radii, control heights, type scale, chart colours and motion as plain values (useUI()), and GText, the text every native component sets type with.", [], ["tokens"]),
  native("chart-math", "Native chart maths", "The pure maths behind the native data components: ring arcs, smooth paths, heatmap grids, gauge arcs, segments, stacks.", [], [], "ts"),
  ...NATIVE_COMPONENTS,
]
