# Screen recipes

## App shell (mobile-first)
`Aurora` in the layout · content in `max-w-xl` · `Dock` (`DockBar` of 3–5 `DockItem`s + a `DockAction` for the primary verb) fixed at the bottom · pad the page bottom by ~7rem so content clears it.

## Dashboard
`ActivityRings` card (2–3 rings, legend beside) · a row of 3 `Stat` tiles · a `Card size="sm"` with a `Sparkline` and a `SegmentedControl` range (7d/30d/90d) in `CardAction` · a wide `Heatmap` card. Start from `dashboard-01`.

## Settings
Stack `GroupedList`s: header (overline), rows with `GroupedListIcon` tiles coloured `bg-chart-N`, values or a `Switch` on the right, `GroupedListChevron` for drill-ins, footer for the explanation. Start from `settings-01`. On wide screens: list on the left, the chosen section on the right.

## Forms / auth
`Card intensity="strong"` centred · `Label` + `Input` pairs · primary `Button size="lg"` full width · a glass secondary option under a `Separator`. Start from `auth-01`.

## Destructive confirmation
`Dialog` with a `destructive` button and a `glass` cancel. The overlay softens the page; the content is `glass-strong`.

## Article / docs page
`type-glass` on body · `Text variant="overline"` + `Heading level={1}` + `Text variant="lead"` · body in `<Prose>` (held to `--glass-measure`) · `type-editorial` or `type-classic` for long reading.

## A themed island
Wrap a promo, a widget or a preview in `ThemeScope` with its own palette/material — it won't affect the page. Portalled content (dialogs) renders outside the scope.
