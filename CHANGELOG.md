# Changelog

Registry items are copied into your app, so re-run `npx shadcn add @glasscn-app/<item>` to pick up a change. IDs refer to [`docs/roadmap.md`](docs/roadmap.md).

## Unreleased — M3 parity and forms (2026-10-11)

### Breaking
- `button` depends on the new `spinner` item; a loading button keeps its label in the accessibility tree.
- Avatar root no longer clips (for `AvatarBadge`); `primary` line-tab label uses `text-primary-ink`.
- Chart presets show an "empty" state on empty data; the value axis sits on the trailing side.

### Added
- Forms: `select`, `radio-group`, `field`, `input-group`, `button-group`, `toggle` / `toggle-group`, `spinner`, `skeleton`, `drawer`, `context-menu`, `scroll-area`, `accordion` / `collapsible`, `alert`, `item`, `stepper`, `empty`, `confirmation-popover`; Input `size`, Textarea `maxRows`, Checkbox `shape="circle"` / `size`, `BadgeCount`, `AvatarBadge`, Text Apple styles + `emphasized`, `glass-hyphens`.
- Pickers: `command` (+ `CommandDialog`), `combobox` (single / multi chips), `calendar`, `date-picker`.
- AI chat: `chat-markdown` (streaming-safe), `chat-parts` (reasoning, tools, sources, files, errors, `renderParts`), composer status / Stop / attachments / counter, `layout="bubble|document"`, actions, reactions, message status, history anchoring, liquid jump button with unread count.
- Data: `ChartDataTable` / `ChartSummary` (`accessibilityTable`), chart `state` (loading / empty / error), selection and scrubbing, `--chart-6..8`, donut selection and locale, area diverging / expand stacks; `widget`, `kpi`, `range-chart`, `backdrop`; Card `material`; data-table v2 (toolbar, faceted filters, column visibility, pagination, controlled / manual, virtual); activity rings rebuilt.

### Fixed
- Charts inside a `ThemeScope` no longer hang the page (radius probe re-triggered its own observer).
- Bar chart dates no longer shift a day (UTC); same-label bars no longer merge.

## Unreleased — M2 the liquid layer (2026-10-11)

### Breaking
- `primary-ink` / `destructive-ink` carry 30% accent (was 68%) so tinted labels pass WCAG AA on every palette (BTN-05) — tinted badges, links and dock labels are less saturated.
- Liquid surfaces draw their rim on `::before`; don't use `::before` on `glass-liquid` elements.
- Slider names its thumbs from the root `aria-label` (ranges: "… minimum" / "… maximum"); the root no longer carries it.

### Added
- Light and motion (LG-04/05/06/07/09/10/11/13): `glass-light`, `glass-illuminate` + `use-glass-pointer`, `glass-shadow-adaptive`, `glass-prominent`, `glass-knob-lens`, `glass-materialize`, `glass-morph-origin`, `glass-press` / `glass-press-liquid`, `scroll-edge-soft|hard`; 9 new primitives. Two-tone `glass-focus` (UX-02).
- `glass-group` (LG-14), `toolbar` (NAV-01), `scroll-edge` (NAV-02), `sidebar` (NAV-04), `search-field` (NAV-05), `navigation-bar` and `action-sheet` (NAV-06) — web and native.
- Button `prominent`, `loading`, `PullDownButton`, `SplitButton`; switch drag + stretch; slider ticks, icons, value bubble, `neutralValue`, `variant="progress"`; segmented `shape`, scrub, `momentary`.
- Dock `minimizeBehavior`, `DockAccessory`/`usePlacement`, `DockSearch`, badges, scrub, compact layout; sheet `detents`, grabber, drag-to-dismiss, `modal={false}` inspector; toasts top-center on phones.
- Overlays materialise and grow from their trigger; dialogs morph from `DialogTrigger` via View Transitions.
- ProgressRing and Sparkline get default accessible names; aurora pauses while scrolling; previews sit on an aurora ground (UX-04/06).
- `pnpm test:e2e`: Playwright + axe, visual regression, Chromium/WebKit/Firefox liquid surfaces, blur budget (QA-02/03/09). See `docs/testing.md`.

## Unreleased — M1 foundations (2026-10-11)

### Breaking
- Material preset `liquid` is renamed **`vivid`** (`material-vivid`); "liquid" now names the control-layer surface.
- Control-layer parts (Dock, DockAction, Tooltip, Popover, DropdownMenu, Sheet, Dialog, AlertDialog, toasts, floating chat composer, `Button variant="glass"`) use **`glass-liquid`**.
- `Stat` defaults to a fill tile (glass when standalone or with `intensity`/`variant="glass"`); `StatTrend` "up" is success-green by default (`sentiment` prop).
- Focus is an outline (`glass-focus`), not a box-shadow ring.

### Added
- `glass-liquid`, `glass-liquid-clear`; `Glass variant="material|liquid|liquid-clear"`; `--glass-clarity` (iOS 27-style clear↔tinted) and the `glass-preferences` item (also in the site header).
- Accessibility: `prefers-reduced-transparency`, `prefers-contrast: more`, `forced-colors`, reduced-motion primitive overrides.
- Tokens: `glass-label-tertiary/-quaternary`, `success`/`warning`/`info` (+ `-ink`), `separator`, `fill-subtle/-faint`, `shadow-glass-1..4`, `control-2xs`, `knob`, `rounded-control-xs`, `glass-hit-min`; utilities `hit-area`, `rounded-concentric`, Apple text styles `type-large-title … type-caption-2`.
- Real spring easings (`spring()` → CSS `linear()`); gamut-mapped palettes; display fonts as `font-display-*` items.
- `ThemeScope`: forced schemes isolate `dark:`; partial props emit only their groups; much smaller CSS. `glass-style` ships the scope-aware `dark` variant.
- RTL via logical properties across components; `SheetBody`, `DialogBody`, sheet `side="start|end"`, `--dock-inset`, `GroupedListItem disabled`, `TableHead/Cell align|numeric`.
- Tests: component (jsdom), structural "never glass on glass", ThemeScope/sanitizer/decode fixtures, generated CSS parses, CI checks generated files.

## Unreleased — M0 "stop the bleeding" (2026-10-11)

### Breaking

- **Namespace is now `@glasscn-app`** (DX-01). The shadcn directory's `@glasscn` belongs to another project. Update `components.json`: `"registries": { "@glasscn-app": "https://glasscn.app/r/{name}.json" }`.
- **Sparkline renders a `<div role="img">` around its `<svg>`** (SPK-01) — props are now `div` props. The end dot is an HTML overlay, so it stays round at any width.
- **Panes set the text colour of what's inside them**: `--foreground`, `--card-foreground`, `--popover-foreground` and `--muted-foreground` are remapped to the new `--glass-label` / `--glass-label-secondary` inside `glass*` surfaces (ENG-20). If your app customises `--foreground`, set `--glass-label` to match.
- **Palette accents are darker in light mode** where their white label failed WCAG AA (ENG-02) — `accentFor()` moves lightness only.

### Fixed

- `Glass tint` rendered fully transparent (a custom property referencing itself) — it now writes `--glass-tinted` (ENG-01).
- Switch never showed "on" and data-* states didn't apply in apps without shadcn's `tailwind.css`: `glass-style` now ships the `data-open/closed/checked/unchecked/selected/active/disabled/horizontal/vertical` variants, and declares `tw-animate-css` (ENG-40).
- Light-mode legibility: every palette × material × scheme now passes AA for text and secondary text on every pane tier, the accent label and the accent against the ground — tested (ENG-02, ENG-03, QA-01). `smoked` gets light text on its dark panes.
- Keyboard focus stays visible in forced-colours mode (`focus-visible:outline-hidden` instead of `outline-none`) — lint-tested (CMP-X01, QA-05).
- `Tooltip` brings its own provider, like shadcn's — copied code no longer crashes (TIP-01); wrapped tooltips aren't stretched capsules (TIP-02).
- `GroupedListItem asChild` rows keep their button/link role; rows show a focus ring; headers are title case (GRL-01, GRL-02).
- A user `ref` on SegmentedControl, TabsList or DockBar no longer breaks the sliding indicator (CMP-X07).
- Inputs and textareas have a visible rim (and a border in forced colours); invalid is a destructive rim, distinct from focus (INP-01, INP-02).
- Switch and slider sizes follow `--glass-density`; knobs, scrims and accent shadows are tokens (`glass-knob`, `glass-dim`, `shadow-glass-knob`, `shadow-glass-accent`); dialog/sheet scrims no longer blur under a frosted pane (SWT-01, SLD-01, BTN-01, CMP-X03, DLG-03).
- No glass buttons inside glass panels (dialog close, auth passkey) (DLG-02).
- Progress honours `max` (PRG-01); `KbdGroup` renders `<kbd>` (KBD-01); heatmap hydration mismatch and locale (`locale` prop) (HMP-01, HMP-02); area charts on one page no longer share gradients (CHT-01); chat no longer re-announces every streamed token — new `streaming` prop (CHA-03).
- Theme values can't contain comments or `var()`, and must fit their token (number + unit, colour, select) (ENG-10).
- Native: toast swipe-to-dismiss no longer throws; `Press` never fades Liquid Glass (`dim` prop); glass falls back to a solid fill under Reduce Transparency (`useReduceTransparency`); disabled presses dim again; text glass buttons no longer render as empty pills on iOS (NAT-01, NAT-02, NAT-04, NAT-15).

### Added

- `alert-dialog` (web + native): `role="alertdialog"`, Apple's button order, destructive/secondary actions, no glass on glass (NEW-05).
- `DockNav` + `DockLink`: route navigation as real links with `aria-current` (DCK-01); dock items shrink to fit phones (DCK-02).
- Theme engine: `legibilityReport`, `accentFor`, `relativeLuminance`, `contrastRatio`, `fitsToken`; primitives `glass-label`, `glass-label-secondary`, `glass-knob`, `glass-dim` (72 primitives).
- Site: `/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/robots.txt`; each docs page loads only its own demo (≈ 45% less JS); compact palette switcher on phones and tablets; dev install commands use the running port.
