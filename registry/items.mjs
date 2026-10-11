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
  ui("glass", "Glass", "A glass pane — material (content) or liquid (control layer, regular or clear). Intensity, tint and elevation variants; asChild.", { deps: ["radix-ui"], categories: ["surfaces"] }),
  ui("card", "Card", "shadcn's Card API on glass: header, title, description, action, content, footer.", { categories: ["surfaces"] }),
  ui("theme-scope", "Theme scope", "Re-theme a subtree at runtime: a different palette, material, shape or scheme for one card, section or preview.", { reg: [at("glass-theme")], categories: ["surfaces"] }),
  // typography
  ui("typography", "Typography", "Heading, Text, Display, Blockquote, InlineCode, List and TextLink on the theme's modular scale — fonts, weights, case and numerals from the type tokens.", { deps: ["radix-ui", "class-variance-authority"], categories: ["typography"] }),
  ui("prose", "Prose", "Rich text (Markdown, MDX, CMS) set in the theme's type: headings, links, lists, quotes, code, tables.", { deps: ["radix-ui"], categories: ["typography"] }),
  // controls
  ui("button", "Button", "shadcn's Button with liquid glass, prominent (tinted liquid), tinted and secondary variants; capsule or rounded, elastic press, a loading state, pull-down and split buttons.", { deps: ["radix-ui", "class-variance-authority"], categories: ["controls"] }),
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
  ui("activity-rings", "Activity rings", "Concentric Activity-style rings that sweep in and lap past 100%. Server-component safe.", { reg: [charts], categories: ["data"] }),
  ui("progress-ring", "Progress ring", "One ring that closes around its content — a goal, a countdown, a seal.", { reg: [charts], categories: ["data"] }),
  ui("sparkline", "Sparkline", "A smooth measure over time that draws itself, with a soft area and the latest point lit.", { reg: [charts], categories: ["data"] }),
  ui("stat", "Stat", "A figure on a fill tile (glass when standalone): label, value, trend with sentiment.", { deps: ["lucide-react"], categories: ["data"] }),
  ui("bar-list", "Bar list", "Ranked horizontal bars with the label inside and the value at the end — top habits, sources, pages.", { reg: [charts], categories: ["data"] }),
  ui("gauge", "Gauge", "A three-quarter meter with an optional target tick and the figure in its bowl. Server-component safe.", { reg: [charts], categories: ["data"] }),
  ui("tracker", "Tracker", "A row of status blocks — uptime, or a habit's last 30 days.", { categories: ["data"] }),
  ui("category-bar", "Category bar", "A range split into coloured bands with a marker — a readiness score, a budget.", { reg: [charts], categories: ["data"] }),
  ui("heatmap", "Heatmap", "Days in week columns coloured by intensity — a contribution graph with month and weekday labels and a legend.", { reg: [charts], categories: ["data"] }),
  ui("chart", "Chart", "The chart host: TanStack Charts in a container that maps glass tokens — series colours from --chart-*, a glass-strong tooltip, inherited type — plus an HTML legend and chartColor().", { deps: ["@tanstack/charts", "d3-scale"], reg: [charts], categories: ["data"] }),
  ui("area-chart", "Area chart", "Volume over time: gradient areas under a line per series, optionally stacked, with a grouped glass tooltip.", { deps: ["@tanstack/charts"], reg: [at("chart"), charts], categories: ["data"] }),
  ui("bar-chart", "Bar chart", "Amounts per category, grouped or stacked, vertical or horizontal, with theme-rounded bar ends.", { deps: ["@tanstack/charts"], reg: [at("chart")], categories: ["data"] }),
  ui("line-chart", "Line chart", "Measures over time, one smooth line per series, with a grouped glass tooltip and a crosshair.", { deps: ["@tanstack/charts"], reg: [at("chart"), charts], categories: ["data"] }),
  ui("donut-chart", "Donut chart", "Parts of a whole as a ring of rounded slices, with content in the hole and a legend.", { deps: ["@tanstack/charts"], reg: [at("chart")], categories: ["data"] }),
  ui("table", "Table", "shadcn's Table for glass: hairline rows, fill on hover and selection, muted headers, density-aware cells.", { categories: ["data"] }),
  ui("data-table", "Data table", "A sortable, searchable, paginated table with row selection — TanStack Table v9 on the glass table.", { deps: ["@tanstack/react-table", "lucide-react"], reg: [at("table"), at("input"), at("button"), at("checkbox")], categories: ["data"] }),
  // chat
  ui("chat", "Chat", "A conversation in parts: a thread that sticks to the latest message, user and assistant bubbles that group into runs, receipts, day dividers, typing dots, quick replies and a composer where Enter sends.", { deps: ["lucide-react", "class-variance-authority"], reg: [at("button")], categories: ["chat"] }),
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
  block("analytics-01", "Analytics", "Stacked active minutes over a range, the training mix as a donut, a recovery gauge, top habits and a sortable table of recent sessions.", ["area-chart", "bar-list", "card", "data-table", "donut-chart", "gauge", "segmented-control"]),
  block("settings-01", "Settings", "iOS Settings in glass: grouped rows, icon tiles, a switch, a segmented control and a slider.", ["grouped-list", "segmented-control", "slider", "switch"]),
  block("auth-01", "Sign in", "A glass sign-in card with email, password and a passkey option.", ["button", "card", "input", "label", "separator"]),
  block("chat-01", "Chat", "A conversation on glass: grouped turns with avatars, a read receipt, typing that resolves into a reply, quick replies and a floating composer.", ["avatar", "button", "card", "chat"]),
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

const NATIVE_NAMES = ["typography", "prose", "card", "theme-scope", "button", "badge", "input", "textarea", "label", "kbd", "separator", "avatar", "switch", "checkbox", "segmented-control", "glass-group", "tabs", "slider", "progress", "dock", "toolbar", "scroll-edge", "navigation-bar", "sidebar", "search-field", "grouped-list", "dialog", "alert-dialog", "sheet", "action-sheet", "popover", "tooltip", "dropdown-menu", "toaster", "activity-rings", "progress-ring", "sparkline", "stat", "bar-list", "gauge", "tracker", "category-bar", "heatmap", "chart", "area-chart", "bar-chart", "line-chart", "donut-chart", "table", "data-table", "chat", "dashboard-01", "analytics-01", "settings-01", "auth-01", "chat-01"]

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
