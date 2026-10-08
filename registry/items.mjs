/**
 * Every glasscn item, by hand: what it is, which files it ships, what it needs.
 * `scripts/generate.mjs` adds the foundation's tokens and the palette themes and
 * writes registry.json — never edit registry.json directly.
 */

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
      "The design tokens (frost, rim, highlight, shadow, blur, saturation, fill, aurora), the glass / glass-strong / glass-subtle utilities, aurora and draw keyframes, a no-backdrop-filter fallback, and glassVariants — the cva every surface shares.",
    categories: ["glass", "foundations"],
    dependencies: ["cn", "class-variance-authority"],
    files: [{ path: "src/lib/glass-variants.ts", type: "registry:lib", target: "@lib/glass-variants.ts" }],
    // cssVars + css are filled in from registry/tokens.mjs
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
    name: "glass-charts",
    type: "registry:lib",
    title: "Chart maths",
    description: "Pure maths for the data components: ring radii and arcs, scaled series, smooth Catmull-Rom paths and areas, and the heatmap week grid.",
    categories: ["glass", "foundations"],
    files: [{ path: "src/lib/glass-charts.ts", type: "registry:lib", target: "@lib/glass-charts.ts" }],
  },
]

export const components = [
  // surfaces
  ui("aurora", "Aurora", "The living ground: three palette blobs drifting over the base colour. Pure CSS, reduced-motion aware.", { categories: ["surfaces"] }),
  ui("glass", "Glass", "A frosted pane — the base every surface is made from. Intensity, tint and elevation variants; asChild.", { deps: ["radix-ui"], categories: ["surfaces"] }),
  ui("card", "Card", "shadcn's Card API on glass: header, title, description, action, content, footer.", { categories: ["surfaces"] }),
  // controls
  ui("button", "Button", "shadcn's Button with glass, tinted and secondary variants, capsule or rounded, squash on press.", { deps: ["radix-ui", "class-variance-authority"], categories: ["controls"] }),
  ui("badge", "Badge", "Small capsule labels: solid, tinted, glass, secondary, outline, destructive.", { deps: ["radix-ui", "class-variance-authority"], categories: ["controls"] }),
  ui("input", "Input", "A filled field for glass: soft fill, accent caret and focus ring.", { categories: ["controls"] }),
  ui("textarea", "Textarea", "A filled, auto-growing text area for glass.", { categories: ["controls"] }),
  ui("label", "Label", "An accessible label.", { deps: ["radix-ui"], categories: ["controls"] }),
  ui("switch", "Switch", "The iOS switch: capsule track fills with the accent, white knob springs across.", { deps: ["radix-ui"], categories: ["controls"] }),
  ui("segmented-control", "Segmented control", "The iOS segmented control: one raised thumb slides to the chosen segment; always has a selection.", { deps: ["radix-ui"], reg: [hook], categories: ["controls"] }),
  ui("tabs", "Tabs", "Tabs with a sliding pill (glass capsule, plain) or a sliding underline.", { deps: ["radix-ui", "class-variance-authority"], reg: [hook], categories: ["controls"] }),
  ui("slider", "Slider", "A soft track, accent range and white glass knobs. Ranges supported.", { deps: ["radix-ui"], categories: ["controls"] }),
  ui("progress", "Progress", "A capsule bar filling from the second chart colour into the accent.", { deps: ["radix-ui"], categories: ["controls"] }),
  ui("kbd", "Kbd", "Keycaps on glass, singly or grouped.", { categories: ["controls"] }),
  ui("separator", "Separator", "A hairline that reads on glass.", { deps: ["radix-ui"], categories: ["controls"] }),
  // overlays
  ui("dialog", "Dialog", "A strong-glass modal over a dimmed, softened page.", { deps: ["radix-ui", "lucide-react"], reg: [at("button")], categories: ["overlays"] }),
  ui("sheet", "Sheet", "A floating glass panel that slides in from any edge, inset like an iPad sheet.", { deps: ["radix-ui", "lucide-react"], reg: [at("button")], categories: ["overlays"] }),
  ui("popover", "Popover", "Floating glass content anchored to a trigger.", { deps: ["radix-ui"], categories: ["overlays"] }),
  ui("tooltip", "Tooltip", "A small glass capsule on hover and focus.", { deps: ["radix-ui"], categories: ["overlays"] }),
  ui("dropdown-menu", "Dropdown menu", "A glass menu: items, checkbox and radio items, labels, shortcuts, submenus.", { deps: ["radix-ui", "lucide-react"], categories: ["overlays"] }),
  ui("toaster", "Toaster", "Sonner toasts dressed in glass.", { deps: ["sonner", "lucide-react"], categories: ["overlays"] }),
  // navigation
  ui("dock", "Dock", "The floating tab bar: a glass capsule of destinations with a sliding pill, plus a round action button.", { deps: ["radix-ui"], reg: [hook], categories: ["navigation"] }),
  ui("grouped-list", "Grouped list", "iOS Settings-style inset grouped rows on glass: headers, footers, icon tiles, values, chevrons.", { deps: ["radix-ui", "lucide-react"], categories: ["navigation"] }),
  // data
  ui("activity-rings", "Activity rings", "Concentric Activity-style rings that sweep in and lap past 100%. Server-component safe.", { reg: [charts], categories: ["data"] }),
  ui("progress-ring", "Progress ring", "One ring that closes around its content — a goal, a countdown, a seal.", { reg: [charts], categories: ["data"] }),
  ui("sparkline", "Sparkline", "A smooth measure over time that draws itself, with a soft area and the latest point lit.", { reg: [charts], categories: ["data"] }),
  ui("stat", "Stat", "A figure on a glass tile: icon, value, label, trend.", { deps: ["lucide-react"], categories: ["data"] }),
  ui("heatmap", "Heatmap", "Days in week columns coloured by intensity — a contribution graph with month and weekday labels and a legend.", { reg: [charts], categories: ["data"] }),
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
  block("settings-01", "Settings", "iOS Settings in glass: grouped rows, icon tiles, a switch, a segmented control and a slider.", ["grouped-list", "segmented-control", "slider", "switch"]),
  block("auth-01", "Sign in", "A strong-glass sign-in card with email, password and a passkey option.", ["button", "card", "input", "label", "separator"]),
]

const native = (name, title, description, deps, reg = []) => ({
  name: `native-${name}`,
  type: "registry:ui",
  title,
  description,
  categories: ["glass", "native"],
  dependencies: deps,
  registryDependencies: reg.map((n) => `${R}/native-${n}.json`),
  files: [{ path: `registry/native/${name}.tsx`, type: "registry:ui", target: `@components/glass/native/${name}.tsx` }],
})

export const nativeItems = [
  native("tokens", "Native tokens", "The glasscn palettes and tokens for React Native, a GlassThemeProvider and useGlassTheme().", []),
  native("glass", "Native glass", "Frosted glass for Expo: Liquid Glass on iOS 26, blur on older iOS, backdrop-filter on web, a fill on Android.", ["expo-blur", "expo-glass-effect"], ["tokens"]),
  native("aurora", "Native aurora", "The drifting aurora for React Native, drawn with react-native-svg on the native driver.", ["react-native-svg"], ["tokens"]),
  native("press", "Native press", "The pressable everything is built on: spring squash, dim, haptic, hover lift.", ["expo-haptics"]),
]
