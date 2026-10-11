# Changelog

Registry items are copied into your app, so re-run `npx shadcn add @glasscn-app/<item>` to pick up a change. IDs refer to [`docs/roadmap.md`](docs/roadmap.md).

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
