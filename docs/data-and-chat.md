# Charts, tables, visualisation and chat — spec

Expands glasscn's data components (today: rings, sparkline, stat, heatmap) into full charts, tables and a few compact visuals, and adds chat. Web track only; native ports come later through `port-to-native`.

## Decisions

- **Charts run on TanStack Charts** (`@tanstack/charts`, SVG, typed, SSR-safe). Its theme reads `--ts-chart-1..6` and `--ts-chart-tooltip-*` CSS variables and inherits `currentColor`, so glass theming is a container that maps our tokens onto those — no per-chart colour config, palettes and `ThemeScope` just work.
  - Scales go under `scales.x` / `scales.y` (root `x`/`y` are invalid in 1.0); factories infer domains (`scaleLinear`, `scaleBand`, `scalePoint`); `scaleUtc` from `d3-scale` for real time axes.
  - Marks get the caller's rows unmodified; channels are typed accessors `(d: Row) => …`, so tooltips and `onSelect` receive the real row.
  - Every chart renders through the React adapter with a real `ariaLabel` (required prop on every preset).
- **Tables run on TanStack Table v9** (`useTable`, `tableFeatures`, `createColumnHelper`). `table` is shadcn's markup API on glass; `data-table` adds sorting, filtering, pagination and selection on top.
- **Compact visuals stay hand-rolled** (no dependency): maths in `lib/glass-charts.ts`, tested; components only render — same as rings and heatmap.
- **Chat is one compound item** in the shape of `grouped-list`: parts, not a framework. It doesn't own messages or networking; it renders whatever an AI SDK `useChat`, a socket or local state gives it.

## Items

| Item | Kind | Parts / API | Deps |
|---|---|---|---|
| `chart` | ui | `ChartContainer` (TanStack `<Chart>` in a token-mapped host: series colours from `--chart-*`, glass-strong tooltip, inherited type), `ChartLegend` (HTML swatches), `chartColor(i)` | `@tanstack/charts` |
| `area-chart` | ui | `AreaChart` — rows, `x` accessor, `series[]` (`{ id, label, value, color? }`), `stacked`, gradient fill, grouped tooltip | `@tanstack/charts`, `d3-scale` · reg `chart` |
| `bar-chart` | ui | `BarChart` — grouped or `stacked`, `layout="vertical" \| "horizontal"`, rounded tops | same |
| `line-chart` | ui | `LineChart` — multi-series, optional points, `curve` | same |
| `donut-chart` | ui | `DonutChart` — rows, `label`/`value` accessors, centre content, legend | `@tanstack/charts` · reg `chart` |
| `table` | ui | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` (shadcn API) | — |
| `checkbox` | ui | shadcn `Checkbox` on glass (Radix), indeterminate state | `radix-ui`, `lucide-react` |
| `data-table` | ui | `DataTable` (columns, data, search, pagination, selection), `DataTableColumnHeader` (sort toggle), `DataTablePagination` | `@tanstack/react-table` · reg `table`, `input`, `button`, `checkbox` |
| `bar-list` | ui | ranked horizontal bars, label left / value right, optional links | reg `glass-charts` |
| `gauge` | ui | semicircle meter, value + optional target tick, label in the bowl | reg `glass-charts` |
| `tracker` | ui | row of status segments (uptime, streaks) with titles | — |
| `category-bar` | ui | segmented range bar with a marker (scores, budgets) | reg `glass-charts` |
| `avatar` | ui | shadcn `Avatar`, `AvatarImage`, `AvatarFallback`, + `AvatarGroup` | `radix-ui` |
| `chat` | ui | `ChatThread` (sticks to bottom), `ChatMessage` (`from="user" \| "assistant" \| "system"`), `ChatBubble`, `ChatMeta`, `ChatDivider`, `ChatTyping`, `ChatSuggestions`/`ChatSuggestion`, `ChatComposer` (auto-grow, Enter sends) | `lucide-react` · reg `avatar`, `button` |
| `analytics-01` | block | area chart + donut + bar list + data table | — |
| `chat-01` | block | a coach conversation: thread, typing, suggestions, composer | — |

## Rules that apply

- Tokens only (`docs/rules/tokens.md`): series colours are `var(--chart-n)`, surfaces `glass*` / `bg-fill`, radii `rounded-*`, heights `h-control*`.
- Two levels of glass: charts and tables sit *in* a card — they use fills and hairlines, not panes. Chat bubbles inside a thread pane are fills (`bg-fill`) or the accent (`bg-primary`), never a third pane.
- Mount motion carries `data-glass-motion`; the typing dots are the one looping animation besides the aurora, and stop under reduced motion.
- Every item: demo in `src/components/demos`, props in `src/lib/docs.ts`, registry entry, `pnpm verify:install`.
- New group **Chat** in the docs (`category: "chat"`).
