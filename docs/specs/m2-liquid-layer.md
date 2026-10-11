# M2 — the liquid layer

Roadmap milestone M2 ([`../roadmap.md`](../roadmap.md)). Design: [`../liquid-glass.md`](../liquid-glass.md) §3.1–3.5. Builds on M1 ([`m1-foundations.md`](m1-foundations.md)): `glass-liquid`, `--glass-clarity`, springs, `glass-focus`, `hit-area`, `rounded-concentric`.

Items: LG-04..07, LG-09..11, LG-13, LG-14, NAV-01..06, BTN-02/03/05, SWT-02, SLD-03, SEG-01/02, DCK-03/04, SHT-03, TST-03, UX-02, UX-04, UX-06, QA-02, QA-03, QA-09 (+ LG-02 rules rewrite). Already ticked: BTN-04, DCK-02, DLG-01..03, SHT-01/02, POP-01, MNU-01, TST-01/02.

## Primitives (`glass-theme.ts`, light / dark)

| Primitive | Default | Use |
|---|---|---|
| `glass-light-angle` | `-45deg` | direction of the virtual light |
| `glass-specular` | 70% / 30% | lit-side rim strength |
| `glass-edge-shade` | 0% / 18% | iOS 27 dark inner edge, shadow side |
| `glass-highlight-color` | `oklch(1 0 0)` | rim / specular colour |
| `glass-illumination` | 22% | press glow |
| `glass-shadow-over-content` | 1.6 | shadow multiplier when content is under a bar |
| `glass-press-stretch` | 0.04 | elastic press asymmetry |
| `glass-press-grow` | 1.04 | liquid grows on press (solid keeps `--glass-press-scale` squash) |
| `glass-knob-lens-scale` | 1.15 | knob size while active |

Accessibility blocks zero `specular`, `illumination`, `press-stretch` and set `press-grow: 1` where M1 already overrides (contrast, transparency, motion).

## Utilities (`stylesheet.mjs`, derived, no `@media` inside `@utility`)

- `glass-light` — two-sided rim: `::before` conic gradient from `--glass-light-angle` (specular → transparent → edge-shade → transparent) masked to the border (`mask-composite: exclude`). `glass-liquid` / `glass-liquid-clear` include it and drop the single inset highlight (LG-04).
- `glass-illuminate` — `::after` radial glow at `--glass-press-x/y`, `plus-lighter`, opacity on `:active` / `[data-pressed]` (LG-05). Hook `use-glass-pointer` writes the coordinates in rAF; optional `followLight` rotates `--glass-light-angle` on hover devices, off under reduced motion.
- `glass-shadow-adaptive` — shadow × `--glass-shadow-over-content` when `[data-over-content]` (LG-06).
- `glass-prominent` — tinted liquid: `--primary` mixed into liquid frost, `primary-foreground` label, rim + illumination (LG-07). Button `variant="prominent"`; `default` stays solid.
- `glass-knob-lens` — at rest solid `bg-glass-knob`; under `group-active` / `[data-dragging]` liquid, scaled `--glass-knob-lens-scale`, stretched toward travel via `--glass-knob-stretch-x` (LG-09).
- `glass-materialize` — registered `@property --glass-materialize` (0→1) scales blur, frost and scale(0.96→1) for overlay `data-[state=open|closed]`; reduced motion = fade (LG-10).
- `glass-morph-origin` — popover / dropdown / tooltip grow from trigger size and radius: `@starting-style` `clip-path: inset(… round …)` sized from `--radix-*-trigger-width/height`, `transform-origin` from Radix (LG-11). Sheets / dialogs: same-document View Transition from the trigger where supported; blur re-enabled after.
- `glass-press` / `glass-press-liquid` — elastic: solid squashes `scale(1+s, 1−s)·press-scale`, liquid grows `press-grow`; spring ease; none under reduced motion (LG-13, BTN-02).
- `scroll-edge-soft` / `scroll-edge-hard` — progressive blur band (stacked masked backdrop layers) / near-opaque material strip (NAV-02).
- `glass-focus` becomes two-tone: 2px `--ring` outline + 2px offset with a contrasting halo, following radius (UX-02).

## Components

| Item | Change |
|---|---|
| `glass-group` (new) | `GlassGroup` + `GlassGroupItem`: one shared liquid backdrop, children go `bg-transparent`; optional sliding selection (generalised `use-sliding-indicator`: x, y, width, height, radius) (LG-14). Used by toolbar groups, segmented, button groups. |
| `button` | `prominent`, `loading` (spinner swaps leading icon, `aria-busy`, width kept, optional `loadingText`), `size="icon"` circle, `PullDownButton` / split; liquid variants grow + illuminate (BTN-02/03). Legibility test for `tinted` / `destructive` (BTN-05). |
| `switch` | iOS 27 geometry, knob stretches toward destination on press, lens while dragged, drag-to-toggle (SWT-02). |
| `slider` | capsule lens thumb, min/max icons, value bubble while dragging, `ticks`, `neutralValue`, `variant="progress"` (SLD-03). |
| `segmented-control` | `shape` (capsule default), concentric thumb, drag-to-scrub, lens thumb while dragging, `momentary` (SEG-01/02). |
| `toolbar` (new) | `Toolbar` (top/bottom floating liquid), `ToolbarGroup`, `ToolbarSpacer` (fixed/flexible), `ToolbarItem prominent`, `ToolbarTitle`, overflow menu, `minimize="onScrollDown"` (NAV-01). |
| `scroll-edge` (new) | `<ScrollEdge edge style="automatic│soft│hard">` + sentinel setting `data-over-content` on the nearest bar (NAV-02, LG-06). |
| `dock` | `minimizeBehavior="onScrollDown"`, `DockAccessory` + `usePlacement()`, `DockSearch`, `DockItem prominent`, count badges, drag-to-scrub, compact side-by-side layout, `DockAction` tinted liquid, token sizes (NAV-03, DCK-03/04). |
| `sidebar` (new) | floating inset liquid, collapsible, ≤ 2 levels, `BackgroundExtension` (NAV-04). |
| `search-field` (new) | capsule liquid; `minimized` icon button morphs open; keyboard-riding bottom placement (`visualViewport`); suggestions; Clear / Cancel (NAV-05). |
| `sheet` | `detents` (`medium`/`large`/custom), grabber (tap cycles, `role=button`, keyboard), drag-to-dismiss with `onBeforeDismiss` confirm, opaque at full height, `modal={false}` inspector (SHT-03, NAV-06). |
| `navigation-bar` (new) | large title collapsing into inline title on scroll (NAV-06). |
| `action-sheet` (new) | iOS action sheet on alert-dialog primitives (NAV-06). `alert-dialog` exists. |
| `toaster` | `top-center` on narrow viewports (TST-03). |
| `tooltip`, `popover`, `dropdown-menu`, `dialog`, `alert-dialog` | `glass-materialize` + `glass-morph-origin` (LG-10/11). |

Every new or changed web item gets a native twin in `registry/native/` (best effort parity; full rebuild is M4), a demo, docs entry, item in `registry/items.mjs`.

## Site / perf / QA

- UX-06: preview frames are aurora ground, not panes; blocks use material/fills — no glass in glass in glass.
- UX-04: `content-visibility: auto` on off-screen doc sections, aurora pauses off-screen / while scrolling, blur budget (≤ 12 `backdrop-filter` in initial viewport) checked in e2e.
- QA-02/03/09: Playwright (`e2e/`, `pnpm test:e2e`, not part of `pnpm test`): axe on `/docs/*`, `/themes`, blocks (light/dark × 2 materials); `toHaveScreenshot` on docs previews × 3 palettes × 2 schemes × {square, compact}; Chromium/WebKit/Firefox projects for liquid surfaces.

## Done when

`pnpm typecheck && pnpm lint && pnpm test`, `verify:install`, `verify:native` green; e2e runs; browser check light/dark/phone/RTL; roadmap ticked; CHANGELOG; commit.
