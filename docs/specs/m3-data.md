# M3: data track

Part of [`m3-parity-forms.md`](m3-parity-forms.md). Charts, data table v2, rings, stats, surfaces.

## Charts (`chart.tsx` + presets)

- **Stable definitions (CHT-02).** `useLatest(fn)` returns a stable wrapper that calls the latest function. Presets wrap `x`, `valueFormat`, `xFormat` and every `series[i].value`; the definition memo keys on `data` and a *structure key* (series ids/labels/colours, flags), so inline props no longer rebuild the definition.
- **Motion (CHT-03)** already reads `--glass-duration`; `initial: false` at 0. Kept.
- **Scoped radius (CHT-04).** `useControlRadius` measures in a layout effect (before paint), observes `<html>`, `<head>` *and* the nearest `[data-glass-scope]` plus its `<style>`, and a ResizeObserver on the host.
- **SSR (CHT-05).** `ChartContainer` passes `initialWidth` (default 640) and `idPrefix` from `useId()`.
- **Text alternative (CHT-06, DAT-01).** `ChartDataTable` (a real `<table>`, `sr-only` or toggled visible) and `ChartSummary` (min/max/latest/trend sentence, `summarize()` in `glass-charts`). Every preset takes `accessibilityTable?: boolean | "visible"` (default `true` = sr-only) and renders both.
- **States (CHT-07, DAT-07).** `ChartContainer state="ready|loading|empty|error"`: skeleton axes with shimmer, "No data for this range", error + retry (`onRetry`). Labels overridable. `ChartState` exported for tables/widgets too.
- **Selection (CHT-08, DAT-03).** Line/area/bar take `selectedX` + `onSelect(row | null)`; a `ruleX` marks the selection, a focus change scrubs (press-and-drag on touch is the library's pointer focus). Sparkline takes `onScrub(index | null)` with pointer + arrow keys.
- **Apple axes (CHT-09).** `axis="trailing"` default for y (`side: "right"`, flipped in RTL by the CSS direction of the host; TanStack has no RTL, so `dir` is read at mount), no domain lines, hairline grid at `--chart-grid-opacity`-like 12%.
- **Palette (CHT-10).** `--chart-6..8` added to every palette with a lightness ladder so series separate by lightness (CVD-safe in principle). `chartColor` cycles 8. Stacked bars/areas get a hairline separator (background-coloured stroke).
- **Bars (CHT-13).** Dates keyed by local `isoDate` and row index; labels via `xFormat`; band key ≠ label so two "Mon"s don't merge.
- **Donut (CHT-15).** Locale from `locale` prop (default: browser), key/colour by index, more than 8 slices fold into "Other", `selectedIndex`/`onSelect` with centre showing the selected slice, legend rows with value + %.

## New items

- **`widget`** (DAT-04): `Widget size="small|medium|large|extraLarge|circular|rectangular|inline"`, container-query layout, 16px padding, `WidgetHeader/WidgetTitle/WidgetValue/WidgetContent`, 11px min text, `accented` (monochrome).
- **`kpi`** (DAT-05): `Kpi` = label, Intl compact value, trend (`StatTrend`), description, sparkline slot, skeleton.
- **`range-chart`** (DAT-06): capsules low→high per row with an optional current dot (Weather temps / Health heart rate). Pure HTML, server-safe, gradient over the global min/max. Candlestick deferred.
- **`backdrop`** (SRF-01): `Backdrop variant="image|video|mesh|noise"`, `dim`, poster, video paused under reduced motion.

## Rebuilt

- **Data table v2** (DTB-01..05): `DataTableToolbar`, `DataTableViewOptions` (column visibility), `DataTableFacetedFilter`, `DataTableRowActions`, rows-per-page + first/last page; `state`/`onStateChange` + `manualPagination|Sorting|Filtering` + `rowCount`; `virtual` (`@tanstack/react-virtual`, sticky header); `loading` skeleton rows + `error` row; row click ignores interactive descendants, Space activates; debounced live count, `labels` for strings.
- **Activity rings** (RNG-01): track + full laps + `value % 1` arc, conic-gradient along the arc (dark → light), cap shadow only past 100%, per-ring `icon`, unlimited laps.
- **Stat** (STA-03): `StatDescription`, `StatChart`, `formatCompact`, `title` on truncation, `StatSkeleton`.
- **Card** (SRF-04): `material="regular|thick|solid"`, `variant="widget"` delegates sizing to container queries.

Blocks `analytics-01`/`dashboard-01` adopt stable accessors, KPIs and the new states.
