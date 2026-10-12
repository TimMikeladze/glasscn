# M3: parity and forms

Roadmap milestone M3 ([`../roadmap.md`](../roadmap.md)). Builds on M2 ([`m2-liquid-layer.md`](m2-liquid-layer.md)): `glass-materialize`, `glass-morph-origin`, `GlassGroup`, `glass-prominent`, `glass-knob-lens`, `scroll-edge-*`.

Scope: NEW-01..04, NEW-10..27, INP-02..05, CHK, AVT, BDG, DTB-01..05, CHT-02..15, CHA-01..10, DAT-01..07, RNG-01..02, STA-01..03, SRF-01/02/04, TYP-01/02, PRS-01/02. P2s in those families only when cheap. Already shipped in M2: NEW-23 (`PullDownButton`/`SplitButton`), NEW-25 (`action-sheet`), NEW-26 (`navigation-bar`). Tick those, plus `confirmation-popover`.

## Principles

- shadcn API parity first: same export names and props as shadcn/ui, so `npx shadcn add @glasscn-app/select` is a drop-in. Glass is styling, not API.
- Overlays (select, combobox, command, context-menu, hover-card, date-picker) share the dropdown `menuSurface`: `glass-liquid` + `glass-materialize` + `glass-morph-origin`.
- Inline controls are fills (`bg-fill`), never glass, because they sit on panes. Groups that read as one control (button-group, stepper, toggle-group) use `GlassGroup` only when floating.
- Every item: demo, docs entry, `registry/items.mjs`, native twin (best effort; M4 rebuilds native), component test for roles/keyboard, tokens only, RTL logical properties, reduced motion.
- New deps allowed: `cmdk`, `react-day-picker`, `date-fns`, `@tanstack/react-virtual`, `input-otp` (only if NEW-30 lands), `streamdown` or `react-markdown`+`remark-gfm` for chat markdown (pick one, streaming-safe).

## Work split

| Track | Items |
|---|---|
| **Forms** | select, radio-group, field (+form), input-group, button-group, toggle/toggle-group, spinner (Button `loading` uses it), skeleton, drawer (alias of sheet with bottom detents), context-menu, scroll-area, accordion/collapsible, alert, item, stepper, empty, confirmation-popover; INP, CHK, BDG-01 (count badge for DockItem/Avatar/icon Button), AVT-01, TYP-01/02, PRS-01/02 |
| **Data** | charts CHT-02..15 (stable defs, motion tokens, scoped radius, SSR width, `ChartDataTable`/`ChartSummary`, states, selection/scrub, Apple axes, CVD palette + `--chart-6..8`, bar dates, donut intl + selection), DAT-01..07 (`widget`, `kpi`, `range-chart`, skeleton/empty/error), data-table v2 DTB-01..05 (toolbar, faceted filters, column visibility, pagination, controlled + manual modes, virtual, row-click fix), RNG-01/02, STA-01..03, SRF-01/02/04 (`Backdrop` image/video, Card `material` + `variant="widget"`) |
| **AI + pickers** | CHA-01..10 (AI SDK `UIMessage.parts`: markdown, code block, reasoning, tool, sources, attachments; composer status/stop/attachments; `layout="bubble│document"`; a11y; actions/reactions; scroll anchoring; liquid jump button), command (NEW-15, `CommandDialog`), combobox (NEW-16, single/multi chips), calendar/date-picker (NEW-21) |

## Done when

`pnpm typecheck && pnpm lint && pnpm test`, `verify:install`, `verify:native`, `pnpm test:e2e` (axe on new pages; re-record visual baselines) green; browser check light/dark/phone/RTL; roadmap ticked with partial notes; CHANGELOG; commit.
