# Charts, tables, visualisation and chat: spec

This expands glasscn's data components (today: rings, sparkline, stat, heatmap) into full charts, tables and a few compact visuals, and adds chat. It's the web track only. Native ports come later through `port-to-native`.

## Decisions

- **Charts run on TanStack Charts** (`@tanstack/charts`, SVG, typed, SSR-safe). Its theme reads the `--ts-chart-1..6` and `--ts-chart-tooltip-*` CSS variables and inherits `currentColor`. So glass theming is a container that maps our tokens onto those variables. There's no per-chart colour config, and palettes and `ThemeScope` work without extra wiring.
  - Scales go under `scales.x` / `scales.y`, because root `x`/`y` are invalid in 1.0. The factories infer domains (`scaleLinear`, `scaleBand`, `scalePoint`). Real time axes use `scaleUtc` from `d3-scale`.
  - Marks get the caller's rows unmodified. Channels are typed accessors `(d: Row) => …`, so tooltips and `onSelect` receive the real row.
  - Every chart renders through the React adapter with a real `ariaLabel`, which is a required prop on every preset.
- **Tables run on TanStack Table v9** (`useTable`, `tableFeatures`, `createColumnHelper`). `table` is shadcn's markup API on glass. `data-table` adds sorting, filtering, pagination and selection on top.
- **Compact visuals stay hand-rolled**, with no dependency. The maths lives in `lib/glass-charts.ts` and is tested. Components only render, the same as rings and heatmap.
- **Chat is one compound item** in the shape of `grouped-list`: parts, not a framework. It doesn't own messages or networking. It renders whatever an AI SDK `useChat`, a socket or local state hands it.

## Items

| Item | Kind | Parts / API | Deps |
|---|---|---|---|
| `chart` | ui | `ChartContainer` (TanStack `<Chart>` in a token-mapped host: series colours from `--chart-*`, glass-strong tooltip, inherited type), `ChartLegend` (HTML swatches), `chartColor(i)` | `@tanstack/charts` |
| `area-chart` | ui | `AreaChart`: rows, `x` accessor, `series[]` (`{ id, label, value, color? }`), `stacked`, gradient fill, grouped tooltip | `@tanstack/charts`, `d3-scale` · reg `chart` |
| `bar-chart` | ui | `BarChart`: grouped or `stacked`, `layout="vertical" \| "horizontal"`, rounded tops | same |
| `line-chart` | ui | `LineChart`: multi-series, optional points, `curve` | same |
| `donut-chart` | ui | `DonutChart`: rows, `label`/`value` accessors, centre content, legend | `@tanstack/charts` · reg `chart` |
| `table` | ui | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` (shadcn API) | none |
| `checkbox` | ui | shadcn `Checkbox` on glass (Radix), indeterminate state | `radix-ui`, `lucide-react` |
| `data-table` | ui | `DataTable` (columns, data, search, pagination, selection), `DataTableColumnHeader` (sort toggle), `DataTablePagination` | `@tanstack/react-table` · reg `table`, `input`, `button`, `checkbox` |
| `bar-list` | ui | ranked horizontal bars, label left / value right, optional links | reg `glass-charts` |
| `gauge` | ui | semicircle meter, value + optional target tick, label in the bowl | reg `glass-charts` |
| `tracker` | ui | row of status segments (uptime, streaks) with titles | none |
| `category-bar` | ui | segmented range bar with a marker (scores, budgets) | reg `glass-charts` |
| `avatar` | ui | shadcn `Avatar`, `AvatarImage`, `AvatarFallback`, + `AvatarGroup` | `radix-ui` |
| `chat` | ui | `ChatThread` (sticks to bottom), `ChatMessage` (`from="user" \| "assistant" \| "system"`), `ChatBubble`, `ChatMeta`, `ChatDivider`, `ChatTyping`, `ChatSuggestions`/`ChatSuggestion`, `ChatComposer` (auto-grow, Enter sends) | `lucide-react` · reg `avatar`, `button` |
| `analytics-01` | block | area chart + donut + bar list + data table | none |
| `chat-01` | block | a conversation: thread, typing, suggestions, composer | none |

## Rules that apply

- Tokens only (`docs/rules/tokens.md`). Series colours are `var(--chart-n)`, surfaces are `glass*` / `bg-fill`, radii are `rounded-*`, heights are `h-control*`.
- Two levels of glass. Charts and tables sit *in* a card, so they use fills and hairlines, not panes. Chat bubbles inside a thread pane are fills (`bg-fill`) or the accent (`bg-primary`), never a third pane.
- Mount motion carries `data-glass-motion`. The typing dots are the one looping animation besides the aurora, and they stop under reduced motion.
- Every item needs a demo in `src/components/demos`, props in `src/lib/docs.ts`, a registry entry, and a passing `pnpm verify:install`.
- The docs get a new group, **Chat** (`category: "chat"`).
