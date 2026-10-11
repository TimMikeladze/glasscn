# glasscn roadmap — every gap, fix and rebuild

The complete backlog from the October 2026 audit: seven parallel reviews (web controls, web data/content, theme engine, native, docs site/DX/market, Apple HIG component pass, live browser audit) on top of the Liquid Glass study. Goal: the best Liquid Glass component system on the web and native.

- **Why / design detail:** [`liquid-glass.md`](liquid-glass.md) (paradigm, material, plan) · [`apple-hig-reference.md`](apple-hig-reference.md) (per-component Apple spec, type and colour tables).
- **IDs** are stable — reference them in commits and PRs (`fix(ENG-01): …`). Tick the box when merged *and* verified.
- **Priority:** **P0** broken, inaccessible, violates our own rules, or blocks the Liquid Glass paradigm · **P1** required for best-in-class · **P2** polish, reach, nice-to-have.
- **Type:** bug · gap · a11y · token (rule 3 violation) · parity (shadcn API) · rebuild · perf · test · docs · growth.
- `file:line` references are as of commit `01d72c6`. "(verify)" = inferred from code, not reproduced.

## Decisions (made 2026-10-11)

1. **Name** (DX-01) — brand **glasscn**, site `glasscn.app`. shadcn namespace: **`@glasscn-app`** (permanent — the directory's `@glasscn` belongs to glasscn-components.vercel.app, and `-app` matches our domain). npm packages: the **`@glasscn`** scope we own (`@glasscn/theme`, `@glasscn/mcp`, `@glasscn/eslint-plugin` — GRO-09).
2. **Primitive base** (DX-04) — **both**. Radix stays the source; every Radix-backed item gets a Base UI build, verified in `verify:install` with `--base radix` and `--base base`. Lands in M6.
3. **Default `Button`** — stays solid (shadcn parity); new `prominent` = tinted liquid glass, recommended for floating bars (LG-07).
4. **Cards** — stay frosted *material* (Apple's standard materials); liquid is reserved for the control layer (LG-01).
5. **Native** (NAT-80) — `@expo/ui` native controls first on iOS/Android, our React Native implementation as the web and custom-content fallback.
6. **Everything free** (GRO-06) — no Pro tier. Templates, every block, the Figma kit and the MCP are MIT and free. Sustain through GitHub Sponsors (`FUNDING.yml`, DX-09).

## What users hit today (fix first)

| ID | Problem |
|---|---|
| ENG-01 | `Glass tint` renders fully transparent (self-referencing custom property) |
| ENG-40 | Switch never shows "on", overlays don't animate, unless the app already has shadcn's CSS + `tw-animate-css` (undeclared) |
| ENG-02 / UX-01 | Light mode: 40–55% of measured text fails AA; button labels fail on all 11 coloured palettes |
| ENG-03 | `smoked` material: muted text 1.22:1 |
| TIP-01 | `Tooltip` crashes without a provider (shadcn's doesn't) |
| GRL-01 / DCK-01 | Grouped-list `asChild` rows lose button/link roles; Dock can't be links |
| CMP-X01 / A11Y-01..03 | Focus vanishes in forced colours; no reduced-transparency / increased-contrast handling |
| SPK-01 / CHT-01 / HMP-01 | Sparkline dots become ellipses; two area charts share gradients; heatmap hydration mismatch |
| NAT-01 / NAT-02 | Native toast swipe throws; glass buttons fade Liquid Glass (verify) |
| SITE-01 / UX-04 | Every docs page ships every demo (1.4 MB JS); 92–124 blur layers make scrolling 2–4× slower |
| UX-10 | Phone: home palette bar clips, scheme toggle off-screen |
| ENG-10 | Sanitizer lets `/*` through — one share link value can void a ThemeScope stylesheet |

## Progress

- **2026-10-11 — M0 (stop the bleeding):** 44 items closed (ticked below), with tests. See the M0 notes in each item.

- **2026-10-11 — M1 (foundations):** 53 items closed — material/liquid layers, clarity, accessibility overrides, label/status/fill tokens, focus outlines, hit areas, concentric corners, springs, gamut mapping, ThemeScope fixes, component sweep (RTL, tokens, motion), structural and component tests. Spec: [`specs/m1-foundations.md`](specs/m1-foundations.md).

- **2026-10-11 — M2 (the liquid layer):** 32 items closed (+ LG-02) — specular rim, illumination, adaptive shadow, prominent glass, glass knobs, materialise, morph from trigger, elastic press, `GlassGroup`; toolbar, scroll-edge, sidebar, search-field, navigation-bar, action-sheet; dock, sheet, button, switch, slider, segmented upgrades; Playwright axe / visual / browser-matrix / blur-budget suite. Spec: [`specs/m2-liquid-layer.md`](specs/m2-liquid-layer.md).

- **2026-10-11 — M3 (parity and forms):** 71 items closed — select, radio-group, field, input-group, button-group, toggle, spinner, skeleton, drawer, context-menu, scroll-area, accordion, alert, item, stepper, empty, confirmation-popover, command, combobox, calendar / date-picker; AI chat parts; chart fixes, data table, summaries, states, selection; widget, kpi, range-chart, backdrop; data-table v2. Spec: [`specs/m3-parity-forms.md`](specs/m3-parity-forms.md).

- **2026-10-11 — M4 (native rebuild):** generated native tokens (all palettes and presets), `native-a11y`, two-layer `Glass`, Reanimated `Press` + typed haptics, `@expo/ui` system controls first (switch, slider, segmented, date picker, menus, bottom sheet), gesture-handler everywhere, NativeTabs recipe, keyboard layer, FullWindowOverlay toasts, accessible Reanimated charts, FlashList chat, activity-rings rebuild, backdrop video; vitest + jest-expo suites, Maestro flows. Spec: [`specs/m4-native.md`](specs/m4-native.md).

## Milestones (do in order; each ends green on `pnpm typecheck && pnpm lint && pnpm test`, `verify:install`, `verify:native`, and a browser check)

1. **M0 — Stop the bleeding.** Every P0 bug/a11y/token item: ENG-01..03, ENG-10, ENG-40, CMP-X01, CMP-X03, TIP-01, GRL-01, DCK-01, INP-01, SWT-01, SLD-01, BTN-01, KBD-01, PRG-01, SPK-01, HMP-01, CHT-01, CHA-03, SITE-01, SITE-02, AGT-01, NAT-01, NAT-02, NAT-04, UX-01, UX-10, DLG-04 (via NEW-05). Plus QA-01 and QA-05 so they can't come back.
2. **M1 — Foundations for Liquid Glass.** Tokens and engine first, because everything else consumes them: ENG-20..25, ENG-29, ENG-34, ENG-04..09, ENG-41..44, ENG-50..52, A11Y-01..04, LG-01..03, LG-08, LG-12, CMP-X02, CMP-X04..X09, REG-01..03, QA-04, QA-08.
3. **M2 — The liquid layer.** LG-04..07, LG-09..11, LG-13, LG-14, NAV-01..06, BTN-02..05, SWT-02, SLD-03, SEG-01..02, DCK-02..04, SHT-01..03, DLG-01..03, POP-01, MNU-01, TST-01..03, UX-02, UX-04, UX-06, QA-02, QA-03, QA-09. Rules rewrite (LG-02) lands with it.
4. **M3 — Parity and forms.** NEW-01..05, NEW-10..27, INP-02..05, CHK, AVT, BDG, DTB-01..05, CHT-02..15, CHA-01..10, DAT-01..07, RNG-01, STA-01..03, SRF-01..04, TYP, PRS, remaining P1 component items.
5. **M4 — Native rebuild.** NAT-60 (generated tokens) → NAT-03, NAT-80..83 (two layers, native controls, Reanimated + gesture-handler, navigation pieces, Android) → every NAT P1 → NAT-50..54 tests. Native parity for every M2/M3 item.
6. **M5 — Showcase and site.** BLK-10..13 (app shell, photos, media viewer, AI chat), BLK-01..04, UX-11 home rebuild, SITE-03..14, SITE-22, AGT-02..05, STU-01..09, UX-20..33.
7. **M6 — Distribution and growth.** DX-01..13 (naming, versioning, pinned deps, Base UI, framework matrix), GRO-01..05, AGT-06..08, ENG-60..62, QA-06, QA-07.
8. **M7 — Advanced and polish.** LG-15..20 (refraction, tone, squircles, focus, spill), BLK-14..15, DAT-08, NEW-30..31, every remaining P2, GRO-06..08.

---

## 1. Liquid Glass core (paradigm, material, light, motion)

Design detail for every item here: [`liquid-glass.md`](liquid-glass.md) Part 3.

- [x] **LG-01** P0 rebuild — **Material vs liquid layers.** Keep `glass`/`-subtle`/`-strong` as the *content material* (Apple's standard materials); add `@utility glass-liquid` (regular) and `glass-liquid-clear` (+ `--glass-dim`, 35% over bright media); `Glass variant="material|liquid|liquid-clear"`. Move control-layer parts to liquid: Dock, DockAction, Toolbar, floating composer + jump button, Tooltip, Popover, DropdownMenu, Sheet, Dialog, active knobs, `Button variant="glass"`. Done when: no component renders liquid inside liquid (structural test) and cards/stats/tiles use material or fills. Needs ENG-34 rename first.
- [x] **LG-02** P0 docs — **Rules rewrite** (`docs/rules/design.md`, `use-glasscn` skill, AGT-05): liquid only for controls/navigation over content; never liquid on liquid; `regular` default, `clear` only over media with a dim, never mixed; rule 1 becomes "glass needs content beneath it"; one prominent action per bar; colour the glass not the label. Add an "over content" demo scene (photo grid / long article under Toolbar + Dock).
- [x] **LG-03** P0 gap — **Clarity** primitive `glass-clarity` (0 ultra clear → 1 fully tinted, ≈ iOS 27 slider) feeding derived opacity/blur/dim; `GlassPreferences` item (slider + reduce-transparency switch writing `:root`, persisted); exposed in site header; `legibility()` takes clarity.
- [x] **LG-04** P1 gap — **Light**: two-sided specular rim (`::before` conic gradient masked to the border, `glass-light-angle`, `glass-specular`), iOS 27 darkened edge (`glass-edge-shade`), `glass-highlight-color`; liquid surfaces replace the single `inset 0 1px` highlight.
- [x] **LG-05** P1 gap — **Illumination**: `use-glass-pointer` hook writes `--glass-press-x/y` in rAF; `::after` radial glow with `plus-lighter` on press; optional pointer-follow light angle on hover devices (off under reduced motion).
- [x] **LG-06** P1 gap — **Adaptive shadow**: bars read `data-over-content` (scroll-edge sentinel, NAV-02) and multiply shadow by `glass-shadow-over-content`.
- [x] **LG-07** P1 gap — **Prominent tinted glass**: `Button variant="prominent"` (tone range of `--primary` in liquid frost); DockAction, ToolbarItem prominent, chat send use it; `default` stays solid for shadcn parity.
- [x] **LG-08** P1 gap — **Concentric radii**: containers set `--glass-container-radius`/`--glass-container-pad`; `rounded-concentric` = `max(min, radius − pad)`; used by segmented/tab thumbs, menu items, sheet inner cards, grouped rows, stat tiles, widget tiles; native `concentric(outer, pad, min)` helper replaces `radius − 6`.
- [x] **LG-09** P1 gap — **Glass knobs**: switch/slider/segmented thumbs become liquid lenses while `:active`/dragging, scaled ~1.15× and stretched toward travel; solid at rest.
- [x] **LG-10** P1 gap — **Materialise**: registered `@property --glass-materialize` (0→1) drives blur + frost + small scale for overlay entrances/exits instead of opacity fades; reduced motion → plain fade (Apple: don't animate into/out of blur).
- [x] **LG-11** P1 gap — **Morph from source**: menus/popovers/select grow from the trigger's size and radius (`--radix-*-trigger-width/height`, transform origin, `@starting-style` clip-path); sheets/dialogs from their button via View Transitions (re-enable blur after). *(M2: panel starts as a trigger-sized capsule centred on itself, not exactly over the trigger)*
- [x] **LG-12** P1 gap — **Real springs**: `spring({ stiffness, damping, mass }) → linear()` in the engine (tested); motion presets emit `linear()` `--glass-ease` with cubic-bezier fallback; overshoot only on transforms (CMP-X07d).
- [x] **LG-13** P1 gap — **Elastic press**: `--glass-press-stretch` asymmetric scale on press, spring back; liquid grows (`--glass-press-grow`), solid squashes; disabled under reduced motion.
- [x] **LG-14** P1 gap — **`GlassGroup`** (GlassEffectContainer analogue) phase 1: children share one liquid backdrop; generalised sliding/morphing selection (size + radius). Used by toolbar groups, button groups, steppers, segmented. P2 phase 2: SVG goo split/merge (Chromium-first). *(M2: phase 1; phase 2 goo open)*
- [ ] **LG-15** P2 gap — **Thickness by size**: larger liquid (popover, menu, sheet) reads thicker — deeper shadow, more opaque — than small (tooltip, button). Size-tier tokens.
- [ ] **LG-16** P2 gap — **Refraction** `use-glass-lens`: convex-squircle bezel displacement map (Snell, n = 1.5, quadrant-mirrored), PNG data URI in an inline filter, ResizeObserver regen, animate only `scale`; optional 3-pass dispersion; primitives `glass-refraction|bezel|dispersion`; **Chromium-gated by engine detection** (Firefox passes `@supports` and renders nothing); small liquid elements only; off under reduced transparency / increased contrast / still.
- [ ] **LG-17** P2 gap — **Known-background tone** `tone="auto"`: sample aurora blob colours at the element's position or an image's 8×8 average; flip glyphs via `data-tone` with hysteresis.
- [ ] **LG-18** P2 gap — **Continuous corners**: `--glass-corner-shape` (`round|squircle`) via `corner-shape` under `@supports` (Chrome/Edge 139+); `round` preset uses squircle.
- [ ] **LG-19** P2 gap — **Window focus**: liquid recedes (less specular, flatter) when the document loses focus (`blur`/`visibilitychange`), like inactive Mac windows.
- [ ] **LG-20** P2 gap — **Ambient spill** on large liquid (sidebar): faint accent/aurora colour bleed into frost and shadow.

## 2. Foundation: engine, tokens, stylesheet

### 2.1 Engine correctness (`src/lib/glass-theme.ts`)

- [x] **ENG-01** P0 bug — `Glass tint="primary|destructive"` renders **fully transparent**: `glass-variants.ts:22-23` sets `--glass-tint: color-mix(…, var(--glass-tint))` on the same element → cycle → invalid → `rgba(0,0,0,0)` (confirmed in Chrome). Live in `demos/glass.tsx:9`, `/docs/theming:67`. → Separate hook (`--glass-tint-mix`) or a `glass-tinted` utility. Test: reject `[--x:…var(--x)…]` anywhere.
- [x] **ENG-02** P0 bug/a11y — `primary-foreground` is always `oklch(0.99 0 0)` in light (`:306, :335`): accent-label contrast fails AA on **all 11 coloured palettes** (Dusk 3.32, Amber 3.25, Lagoon 3.42, Mint 3.58, Sage 3.78, Sand 3.88, Rose 3.94, Midnight 4.04, Lavender 4.08, Ocean 4.23, Cherry 4.24; hue sweep 2.85–4.46). → Pick black/white by contrast or lower accent L until ≥ 4.5; test every palette + 0–360° sweep.
- [x] **ENG-03** P0 bug — `smoked` material darkens the light frost but leaves text/fill/thumb tuned for light: muted text **1.22:1**; `legibility` says "AA 5.08" because it only checks the darkest text. → Materials set label roles (ENG-20) or force dark text tokens on their surfaces.
- [x] **ENG-04** P1 a11y — Accent vs ground non-text contrast Amber 2.94, Dusk 3.00; components draw rings at `ring/50` (≈ halves it) → switch track, checkbox, slider range, focus ring fail WCAG 1.4.11. → Enforce primary/ground ≥ 3; ring-opacity primitive default 100%.
- [x] **ENG-05** P1 bug — No gamut mapping: out-of-sRGB tokens in 9/12 palettes (Cherry dark 8, Midnight dark 7); at chroma 0.26 every hue but 330 puts primary out of gamut → per-channel browser clipping shifts hue and differs sRGB vs P3. → CSS Color 4 chroma-reduction gamut map; optional P3 under `@media (color-gamut: p3)`. Share the helper with `oklchToLinearRgb` (`:773-785`, which clamps per channel).
- [x] **ENG-06** P1 bug — `legibility()` composites in linear light; browsers composite gamma-encoded sRGB → light over-estimated by 0.4–0.5:1, dark under-estimated by 1.0–1.3:1 (Dusk dark 9.02 vs real 10.37). → Mix in gamma sRGB.
- [ ] **ENG-07** P1 gap — `legibility()` ignores brightness (smoked 85%), saturate, aurora opacity/blur, sheen (up to +22% white), grain, glow, strong/subtle tiers, the theme's own `--foreground` (hard-coded `FOREGROUND` `:793`), muted text, accent label, display type on aurora. Measured muted on default panes 3.15–4.3, subtle 2.97–3.7. → Return a matrix {foreground, muted, primary-fg/primary, ring/ground, chart/pane} × {subtle, default, strong} × schemes (+ clarity, LG-03). *(M0 done: `legibilityReport` — text + secondary per tier, accent label, accent vs ground, brightness; left: sheen, grain, glow, chart ΔE)* *(M1: + sheen, liquid tier, clarity; left: saturate, grain, glow, chart ΔE)*
- [x] **ENG-08** P1 bug — Unknown palette/material/shape/motion/type/density keys silently fall back (`:575-590`); types `keyof … | string` defeat checking. → Narrow types; throw (dev warn) on unknown keys.
- [x] **ENG-09** P1 bug — `themeToRegistryItem` skips the `display` font role (`:706`) → a Google display font ≠ heading ships a stack nothing loads (a test asserts this). → Map display to a `font-heading-*` dep or add the `@import`.
- [x] **ENG-10** P1 security — Sanitizer holes (`:600-617`): allows `/*` `*/` (confirmed: `glass-shadow-y: "10px /*"` comments out all later declarations, can swallow `}` and `.dark {`, voids the rest of a ThemeScope `<style>`); `var(--anything)` passes (references page vars, cycles); no type check (`glass-blur: red`, `glass-density: -5|0` pass; `decodeTheme` keeps 0 → collapsed controls). → Reject comments; validate each value against its `TokenDef.control` (range: number+unit within min/max; colour: parseable; select: option/pattern).
- [ ] **ENG-11** P1 bug — Share codes unversioned and diffed against `defaultTheme()` at decode time → changing a default re-themes old links, while `/r/theme/[code]` is cached `immutable` for a year (`route.ts:10`). → `{ v: 1, recipe, overrides }` + migrations on decode.
- [ ] **ENG-12** P2 bug — Non-OKLCH colours (hex allowed by sanitizer/tests) parse to null → silent white-tint fallback (`#000` tint at 90% reports AAA 18.87; real ≈ 1.2). → Parse hex/rgb/hsl or reject.
- [ ] **ENG-13** P2 bug — `tuned()` gives every hand-tuned palette `primary-foreground` dark = `oklch(0.18 0.02 30)` → red-tinted near-black on Ocean/Sage. → Palette hue.
- [ ] **ENG-14** P1 bug — Chart palette not CVD-safe: analogous puts chart-1..3 within ±38° at similar L; monochrome offsets ±8° (Sand min ΔE 6.1 normal / 2.8 protan; Graphite 4.2; Dusk protan 3.6; Amber protan 4.2). Dead code `b + (mono ? 0 : 0)` (`:309`). → Generate categorical colours maximising ΔE under deutan/protan simulation, ≥ 0.08 L apart; test.
- [ ] **ENG-15** P2 bug — `fontDependencies` matches stacks by exact string, light scheme only (`:659-666`). → Match first family.
- [ ] **ENG-16** P2 improve — `EXTRA_NAMES` (`foreground`, `muted-foreground`, `background`…) bypass the schema: accepted from share links, not editable, not shipped by `glass-style`. → Promote into a Label group (ENG-20) or drop.
- [ ] **ENG-17** P2 improve — `randomTheme` never checks legibility → re-roll until worst case ≥ AA.
- [x] **ENG-18** P2 improve — `glass-ring-width` lives in Shape but declared after Aurora; shape presets reset it; range starts at 0 (themes can remove focus). → Focus group; min 2px.
- [x] **ENG-19** P2 improve — `still` motion uses `aurora-speed: 0.0001`; `aurora.tsx:49` divides by zero at 0. → `aurora-play-state` primitive; 0 = paused.

### 2.2 Token model (missing roles)

- [x] **ENG-20** P0 gap — **Label roles**: no text tokens of our own; we rely on shadcn's `foreground`/`muted-foreground` (not shipped, not contrast-checked). → `label`, `label-secondary`, `label-tertiary`, `label-quaternary` (Apple's four tiers) computed per material and scheme. Fixes ENG-03 and muted failures. *(M0 done: `glass-label`, `glass-label-secondary` remapped inside panes; left: tertiary/quaternary tiers)*
- [x] **ENG-21** P1 gap — **Status roles**: only shadcn `destructive` (hue 27, collides with Dusk 35, Cherry 22, Rose 10). → `success`, `warning`, `info`, `destructive` + `-foreground`, generated per palette with hue avoidance.
- [ ] **ENG-22** P1 gap — **Fills/separators/grouped**: 2 fills vs Apple's 4; no separator token (uses rim or `foreground/10`); no grouped backgrounds. → `fill-secondary|tertiary|quaternary`, `separator`, `separator-opaque`, `grouped-bg`. *(M1: fill-subtle/faint, separator; left: grouped backgrounds)*
- [ ] **ENG-23** P1 gap — **Elevation + z-index**: one shadow; `z-50` hard-coded. → `glass-elevation-1..4`; `z-dropdown|sticky|overlay|modal|toast|tooltip`. *(M1: shadow-glass-1..4; left: z-index scale)*
- [x] **ENG-24** P1 gap — **Hit targets**: `control-xs` = 1.75rem × density → 21px at 0.75, 23.8px compact (< WCAG 2.5.8's 24px; Apple 44pt). → `--glass-hit-min` + `max(24px, …)` + `hit-area` utility (CMP-X05).
- [ ] **ENG-25** P1 gap — **Knob/dim/accent-shadow**: `bg-white` knobs, `rgb()` shadows, `bg-black/15 dark:bg-black/45` scrims, literal accent shadows. → `glass-knob`, `glass-knob-shadow`, `glass-dim`, derived `shadow-glass-accent` (`glass-thumb` can't serve as a switch knob in dark). *(M0 done: `glass-knob`, `glass-dim`, `shadow-glass-knob`, `shadow-glass-accent`)*
- [ ] **ENG-26** P2 gap — Focus offset + ring opacity, `::selection` (site-only today), link/hover/visited, scrim tokens.
- [ ] **ENG-27** P2 gap — Chart: 5 colours → 8 categorical + `chart-seq-*` + `chart-div-*` (OKLCH generated, CVD-tested).
- [ ] **ENG-28** P2 gap — Spacing scale `space-1..8` and icon sizes `icon-sm|md|lg`, density-scaled (`gap-*`, `size-4` hard-coded today).
- [x] **ENG-29** P1 gap — **Apple text styles**: modular steps (16/20/25/31…) don't map to largeTitle 34, title1 28, title2 22, title3 20, headline 17 semibold, body 17, callout 16, subheadline 15, footnote 13, caption1 12, caption2 11. → Semantic `type-large-title … type-caption-2` utilities + per-role leading + `emphasized` twins; a `type-apple` preset with a fixed table. Display leading fixed at 1 (`stylesheet.mjs:113`).
- [ ] **ENG-30** P2 gap — Five material thicknesses (ultraThin, thin, regular, thick, chrome) vs our three; vibrancy text levels. (Pairs with LG-01.)
- [ ] **ENG-31** P2 cleanup — Unused tokens `font-weight-title`, `tracking-title`, `spacing-card(-sm)` (card.tsx re-derives it), `color-glass-highlight`, `color-aurora-1..3` in components.
- [ ] **ENG-32** P2 gap — Highlight/sheen colour hard-coded `oklch(1 0 0)` (`stylesheet.mjs:12,71`) → `glass-highlight-color` (neon, smoked).
- [ ] **ENG-33** P2 gap — Foundation never sets `color-scheme` → add in light/dark blocks and on forced `ThemeScope`.
- [x] **ENG-34** P1 rename — Material preset `liquid` collides with the planned `glass-liquid` surface (`glass-theme.ts:426`). → Rename (e.g. `vapor-soft`/`gel`) before LG-01 ships.

### 2.3 Stylesheet and install contract

- [x] **ENG-40** P0 bug — Components depend on `shadcn/tailwind.css` custom variants (`data-open|closed|checked|unchecked|disabled|horizontal|vertical`) and `tw-animate-css` (`animate-in`, `zoom-in-95`…) — neither shipped nor declared. Without them: **Switch never shows its on state** (`data-checked` falls back to `[data-checked]`, which Radix never sets), overlay animations do nothing, Tabs root loses `flex-col`. → Put the `@custom-variant`s in `glass-style` css, declare `tw-animate-css`, add a verify fixture without shadcn's CSS.
- [x] **ENG-41** P1 bug — Reduced motion only stills aurora + `[data-glass-motion]`; press scale, overlay zoom/slide, sheet slides, tabs content slide, thumb scaling keep running. → Under `prefers-reduced-motion`, override primitives (`--glass-duration: 0ms; --glass-press-scale: 1`) on `:root, [data-glass-scope]`; tag overlays/indicators/thumbs `data-glass-motion`; crossfade.
- [x] **ENG-42** P1 token — Hard-coded durations: dialog 200, sheet 300/200, popover/dropdown 150, progress `duration-700 ease-out`, segmented/tab `transition-colors` default 150 → `--glass-duration` multiples.
- [ ] **ENG-43** P1 token — Control sizes off-scale: segmented 1.75/2.25/2.75rem vs control 2/2.5/3rem (misaligns with Button in a toolbar); tabs `calc(2rem*density)` = `h-control-sm`; line tabs `h-9`; badge, kbd `h-5`, switch px, slider `size-6`/`h-1.5`, progress `h-2.5`. → `control-2xs`, `knob-*` tokens. *(M1: control-2xs, knob, aligned segmented/tabs; left: switch knob sizes, kbd/track heights)*
- [x] **ENG-44** P1 token — `rounded-full` ignores shape presets (slider, progress, tabs indicator); ad-hoc multipliers (checkbox ×0.35, kbd ×0.5, grouped icon ×0.75, typography code ×0.5). → `rounded-button` / named `radius-control-xs` / `rounded-concentric` (LG-08).
- [ ] **ENG-45** P2 improve — `chart.tsx:117` hand-rolls backdrop filter without `brightness()` or the no-backdrop fallback → reuse utility.
- [ ] **ENG-46** P2 improve — `pow()` in type steps has no fallback (Chrome < 120, Safari < 15.4 → invalid font-size). → `@supports not` fallback steps.
- [ ] **ENG-47** P2 gap — `type-step-7/8` utilities (typography `xl` uses arbitrary `pow(…,8)`).

### 2.4 ThemeScope, apply-to-site

- [x] **ENG-50** P1 bug — `ThemeScope scheme="light"` inside `.dark` still matches `@custom-variant dark (&:is(.dark *))` → every `dark:` utility applies in a forced-light scope; it forces only four text colours (`--background`, `--border`, `--input`, `--muted`, `--secondary`, `--accent`, `--destructive`, `--popover`, `--card` keep page scheme). → Dark variant `&:where(.dark, .dark *):not(:where(.light, .light *) *)` (or `[data-scheme]`), ship full neutrals per scheme, set `color-scheme`.
- [x] **ENG-51** P1 bug — Partial props (`<ThemeScope shape="sharp">`) resolve a full theme (Dusk, frosted…) → overrides page palette/custom theme. → Emit only the named groups (`partial` mode in `createGlassTheme`).
- [x] **ENG-52** P1 perf — Every scope writes 64 values × 2 schemes; home has 9 scopes = 38 KB inline CSS. → Diff against page or class-based presets.
- [ ] **ENG-53** P2 bug — `:root[data-glass-custom]` vs `:root[data-palette=x]` equal specificity → winner depends on `<style>` vs `<link>` order (palette dock clicks can appear dead) (`providers.tsx:101`). → `:root:root[data-glass-custom]`; store the share code, re-render through the engine (stored CSS is unvalidated and goes stale after renames).
- [ ] **ENG-54** P2 improve — ThemeScope `loadFonts`: no `preconnect`; React 19 `precedence` suspends subtree; no `size-adjust` fallback metrics. → Preconnect, document, metric fallbacks.

### 2.5 Export formats

- [ ] **ENG-60** P1 gap — `themeToDtcg()` — W3C design tokens JSON (`$value`, `$type`, `$extensions` light/dark modes); covers Style Dictionary and Tokens Studio.
- [x] **ENG-61** P0 gap — `toNativeTheme()` → `registry/native/tokens.generated.ts` (see NAT-60).
- [ ] **ENG-62** P2 gap — Figma Variables JSON (collection, Light/Dark modes; palette modes) (feeds GRO-05); CSS-in-JS object; shadcn `create` preset URL; Open in v0.

### 2.6 Theme Studio

- [ ] **STU-01** P1 bug — Export "Changes" diffs against `createGlassTheme()` (includes Dusk accent/charts); `glass-style` ships no accent → a Dusk-based theme pasted after the foundation gets shadcn's neutral `--primary` (`export-panel.tsx:16`). → Always include Colour group or diff against `glass-style` values.
- [ ] **STU-02** P1 bug — Loading a link and Randomise reset the recipe to START and turn every value into an override → chips show Dusk/Frosted wrongly, "N edited" inflated, density shows no selection (`theme-studio.tsx:115-120, 158-163, 265`). → Encode/restore recipe (ENG-11).
- [ ] **STU-03** P1 gap — Contrast shows one scheme + body text only (`:175`). → Matrix (ENG-07) with WCAG + APCA.
- [ ] **STU-04** P1 gap — Accessibility simulation toggles: CVD (`feColorMatrix` on preview), reduced transparency, increased contrast, forced colours, reduced motion.
- [ ] **STU-05** P2 bug — Default "Both" edit mode writes light colours into dark (`:150`). → Default colour edits to the previewed scheme.
- [ ] **STU-06** P2 perf — Effect with no deps re-encodes hash and rewrites site CSS every render (`:136`); preview re-renders ~50 frosted demos per slider drag; token-control requests ~22 Google families on open. → Deps; rAF throttle; virtualise/cap catalogue; debounce font loads.
- [ ] **STU-07** P2 gap — Undo/redo; A/B split compare; saved themes + gallery with thumbnails; image → palette (k-means in OKLab → hue/harmony); hex/rgb input → OKLCH; per-component focus mode; lock groups before randomise.
- [ ] **STU-08** P2 gap — Phone layout: controls sit above preview below `lg` (`:179`). → Sticky preview + Controls/Preview tabs.
- [ ] **STU-09** P1 gap — Liquid controls in studio: clarity (LG-03), light angle/specular/edge shade (LG-04), refraction (LG-16) once they exist; "over content" preview ground (photo/article) besides aurora. *(M1: liquid group, clarity, content ground; left: light/refraction controls)*

### 2.7 Registry pipeline

- [x] **REG-01** P1 test — "In sync" test compares item counts only; `pnpm test` regenerates first → stale committed `registry.json` never caught. → CI `git diff --exit-code registry.json` after generate.
- [x] **REG-02** P1 test — No-derived-values check covers `glass-style` only, looks only for `var(`. → Every `registry:theme` item; also `calc(`/`color-mix(` referencing vars.
- [x] **REG-03** P2 test — Unknown-variable scan covers stylesheet only. → Also component class strings (`[--glass-…]`, `var(--glass-…)`).
- [x] **REG-04** P2 bug — Every Vercel deploy (previews too) stamped `https://glasscn.app` (`build-registry.mjs:15`) → previews depend on prod items. → `VERCEL_BRANCH_URL`/`VERCEL_URL` for non-prod.
- [x] **REG-05** P2 improve — `verify-install` uses `create-next-app@latest`, `shadcn@latest` → pin; bump deliberately.
- [x] **REG-06** P2 improve — `generate.mjs` rewrites three files every run (HMR churn) → write only on change.
- [ ] **REG-07** P2 perf — Budgets: `glass.generated.css` 29 KB, `registry.json` 180 KB, `public/r` 1.3 MB/192 files, dev CSS 184 KB → CSS-size budget test; parse generated CSS with lightningcss to catch invalid declarations.

## 3. Accessibility adaptivity

- [x] **A11Y-01** P0 gap — `@media (prefers-reduced-transparency: reduce)` → override *primitives* on `:root, [data-glass-scope]` (frost 80–94%, blur up, texture/refraction/specular off). Safari lacks the query → LG-03 clarity covers it.
- [x] **A11Y-02** P0 gap — `@media (prefers-contrast: more)` → near-opaque frost, 1.5px full-opacity rim in a contrasting colour per scheme, sheen/specular/glow/texture off, increased-contrast palette variants (ENG/palette work).
- [x] **A11Y-03** P0 gap — `@media (forced-colors: active)` → no backdrop, `Canvas` / `CanvasText` / `Highlight`, real outlines (CMP-X01), borders on inputs.
- [x] **A11Y-04** P1 gap — Reduced motion done properly: primitives override (ENG-41), all overlays/indicators/thumbs tagged, x/y/z transitions → fades, no blur animations, no elasticity (Apple).
- [ ] **A11Y-05** P1 docs — Published accessibility statement (WCAG 2.2 AA target, what adapts, known limits — Safari reduced transparency, refraction) at `/docs/accessibility` (SITE-22); per-item a11y sections (SITE-07).
- [ ] **A11Y-06** P1 test — axe in Playwright on every docs page × light/dark × matte/smoked (QA-02); legibility matrix test (QA-04).

## 3b. Navigation layer (new and upgraded items)

- [x] **NAV-01** P1 — `toolbar`: floating liquid bar top/bottom; `ToolbarGroup` (one shared glass per group), `ToolbarSpacer` fixed/flexible, `ToolbarItem prominent` trailing, `ToolbarTitle` (< 15 chars guidance), overflow menu, `minimize="onScrollDown"`, visibility priority; Back/Close as symbols. Docs: ≤ 3 groups; don't mix text and symbols in a group. *(M2: overflow is a manual ToolbarOverflow, no auto-collapse by priority)*
- [x] **NAV-02** P1 — `scroll-edge`: `<ScrollEdge edge style="automatic|soft|hard">` + utilities; soft = stacked masked `backdrop-filter` progressive blur; hard = near-opaque material strip; automatic = hard behind dense toolbars/pinned headers, soft otherwise (June 2026 HIG); sentinel sets `data-over-content` (LG-06); one per edge, never stacked; switches to dim over dark content.
- [x] **NAV-03** P1 — `dock` upgrades: `minimizeBehavior` (icon-only capsule on scroll down; restored by tap or scroll to top), `DockAccessory` (above when expanded, inline when minimised, `usePlacement()`), `DockSearch` (separated trailing capsule expanding into a field), `DockItem prominent`, badges, link semantics (DCK-01), `--dock-inset`.
- [x] **NAV-04** P1 — `sidebar`: floating inset liquid sidebar (collapsible, ≤ 2 levels, accent icons, more opaque), `BackgroundExtension` (mirror + blur hero under it), iOS 27 edge-to-edge option.
- [x] **NAV-05** P1 — `search-field`: capsule liquid field; `minimized` icon button morphing open; bottom-toolbar placement riding above the virtual keyboard (`visualViewport`); recent searches, suggestions, tokens; Clear trailing, Cancel while focused on touch.
- [x] **NAV-06** P1 — Sheet detents/grabber/drag (SHT-03), `navigation-bar` large title (NEW-26), `alert-dialog` (NEW-05), action sheet (NEW-25). *(M2: native nav bar takes `collapsed`, no overscroll stretch)*
- [ ] **NAV-07** P2 — Vertical toolbar orientation for side-edge layouts (iPhone Duo / landscape analogue).

## 4. Web components — cross-cutting

- [x] **CMP-X01** P0 a11y — `outline-none` (Tailwind v4 = `outline-style: none`) + box-shadow ring → **no focus indicator in forced-colors** (box-shadows stripped). button:11, input:11, textarea:9, checkbox:14, switch:18, slider:33, segmented:72, tabs:63,75, dock:71,86, grouped-list:56. → `outline-hidden` (transparent outline forced-colors paints) or real `focus-visible:outline`; forced-colors block (A11Y-03).
- [x] **CMP-X02** P1 a11y — Rings drawn at `ring/40`–`ring/50` on frost, likely < 3:1 (WCAG 1.4.11/2.4.13). → Full-opacity ring + contrasting offset halo in `--glass-tint`; min width 2px (ENG-18).
- [x] **CMP-X03** P0 token — Literal colours on themed parts: `bg-white` + `rgb()` shadows (switch:25, slider:33), `rgb()` shadow (segmented:59), `oklch(1 0 0/30%)` + `color-mix` shadows (button:16, dock:86), `text-white` (grouped-list:69), `bg-black/15 dark:bg-black/45` scrims (dialog:32, sheet:31). → ENG-25 tokens.
- [x] **CMP-X04** P1 a11y/RTL — Physical properties break `dir="rtl"`: switch knob `translate-x`, progress `translateX(-…)`, close buttons `right-3.5` + `pr-8`/`pr-14` (dialog:60,72; sheet:72,84), menu `pr-8 right-2.5 pl-8.5 ml-auto` + unflipped chevron (dropdown:42,63,65,80-82,96,107,118), grouped-list `text-left` + chevron (:56,88), button `has-data-[icon]:pr-4/pl-4` (:26). → `ps/pe/start/end`, `rtl:-translate-x-*`, `rtl:rotate-180`; RTL demo + test (DX-08).
- [x] **CMP-X05** P1 a11y — Touch targets < 44px with no expanded hit area: checkbox 18, switch sm 22, slider thumb 24, icon-xs/sm 28/32, `h-control` 40, menu rows ~36, tab triggers 32. → `hit-area` utility (transparent `::after` grown to 44px) + `pointer-coarse:` size bumps.
- [x] **CMP-X06** P1 a11y — `legibility()` checks body only; components use `muted-foreground`, `/80` placeholders, `foreground/65` tabs, `/70` segmented, `muted-foreground/70` chevrons. → Include each (ENG-07); test shipped palettes.
- [x] **CMP-X07** P1 bug — `use-sliding-indicator`: (a) user `ref` overrides hook ref because `{...props}` spreads after `ref` (segmented:38/52, tabs:42, dock:47/58) → compose refs; (b) `--indicator-*` unset before hydration → **active pill invisible on first paint / no-JS** → CSS fallback `not-in-data-indicator-ready:data-[state=on]:bg-…`; (c) only root observed (`:42`) → children resizing (badge counts, font swap) don't update; (d) overshooting `ease-glass` (spring 1.12, snappy 1.4) applies to width/height → pill grows past track; overshoot on transform only. *(M0 done: (a) ref composition; left: (b) SSR fallback, (c) child resize, (d) overshoot)*
- [x] **CMP-X08** P1 token — Hard-coded durations (ENG-42), off-scale sizes (ENG-43), `rounded-full` and ad-hoc radii (ENG-44).
- [x] **CMP-X09** P1 a11y — Reduced motion misses overlays/indicators/thumbs (ENG-41).
- [ ] **CMP-X10** P1 docs — Missing props/notes for input, textarea, label, slider, progress, kbd, separator, dialog (`showCloseButton`), popover, tooltip (Provider), dropdown-menu (`variant`, `inset`), toaster (mounting, theme); badge description empty (`docs.ts:91`); switch docs claim fixed "51×31". (SITE-05)
- [ ] **CMP-X11** P2 improve — `data-shape`, `data-tint`, `data-elevation` attributes missing (state on `data-*` rule).

## 5. Web components — per item

### Button
- [x] **BTN-01** P0 token — `default` variant shadow literal (`:16`). → `shadow-glass-accent`.
- [x] **BTN-02** P1 rebuild (LG) — Press always squashes (0.97). Apple `.interactive()` glass grows, bounces, lights up. → Glass/liquid variants grow (`--glass-press-grow`) + illumination (LG-05); solid fills keep squash.
- [x] **BTN-03** P1 gap — `prominent` (tinted liquid) (LG-07), `loading` (spinner replaces leading icon, `aria-busy`, width kept, optional label swap "Checkout" → "Checking out…"), icon-only circle size, pull-down variant (trailing chevron, `aria-haspopup`) + split button.
- [x] **BTN-04** P1 a11y — `disabled:opacity-45` fades the whole glass → dim label, keep material; style `aria-disabled` so `asChild` links can disable.
- [x] **BTN-05** P1 a11y — `tinted` (`text-primary` on `primary/16`) and `destructive` can fall < 4.5:1 on light hues → legibility checks.
- [ ] **BTN-06** P2 bug — Comment promises hover lift (none); `hover:brightness-105` snaps (filter not in transition list); `whitespace-nowrap` without `min-w-0/truncate`; `text-[0.8rem]` (→ `type-step-n1`); `pr-4/pl-4` not density-aware. Glass variant elevation 0 — floating liquid buttons need soft shadow. Document no default `type="button"`.
- [ ] **BTN-07** P2 guidance — Docs: one or two prominent per view; preference by style not size; destructive never primary (HIG §1).

### Badge
- [x] **BDG-01** P1 gap (LG) — Count/dot badge that attaches to `DockItem`, `Avatar`, icon `Button` (Apple: red oval, white number, critical only).
- [ ] **BDG-02** P2 — Height/padding tokens; focused badge links show double outline; no `[a&]:hover`; missing shadcn `ghost`/`link`; clipped long text without ellipsis.

### Input / Textarea / Label
- [x] **INP-01** P0 a11y — No border; only `bg-fill` boundary (< 3:1, vanishes in forced-colors). Same for Textarea. → Inset rim `ring-1 ring-glass-border` + forced-colors border.
- [x] **INP-02** P1 a11y — Invalid = 30% destructive ring that overrides focus (focused invalid ≡ unfocused). → Destructive rim + distinct focus ring.
- [x] **INP-03** P1 gap — Sizes `sm|lg`; search type cancel styling; clear button (trailing, HIG §18); password reveal; number spinners styled. → Most via `input-group` (NEW-04).
- [x] **INP-04** P1 bug — Textarea `field-sizing-content` without `max-h` (grows forever); no JS autosize fallback; `py-3`/`min-h-24` ignore density; no duration tokens.
- [x] **INP-05** P2 — `px-[calc(.875rem*density)]` = `px-pad-sm`; `file:h-7` fixed; `disabled:pointer-events-none` cancels `cursor-not-allowed`; textarea character count/resize control; demo positions icon by hand (`left-3 pl-9`). Label: required marker / optional hint; `leading-none` collides on wrap. *(M3: file height, label required/optional, leading fixed; no textarea character count)*

### Checkbox
- [x] **CHK-01** P1 a11y — 18px with no hit area; `border-foreground/25` likely < 3:1.
- [x] **CHK-02** P2 — `rounded-[calc(…*0.35)]` → token; `shape="circle"` (iOS selection checkmark); `size` prop; mixed state styling (HIG §2).

### Switch
- [x] **SWT-01** P0 token — px sizes ignore density; `bg-white`, `rgb()` shadows (`:18,25`).
- [x] **SWT-02** P1 rebuild (LG) — iOS 7–18 geometry. iOS 26 switch: capsule knob that **stretches on press** toward its destination, then becomes a glass lens while dragged. → Re-measure from iOS 27 Figma kit; `group-active` stretch; glass knob while active (LG-09); drag-to-toggle.
- [ ] **SWT-03** P1 a11y — RTL translate; off track low contrast; colour-only state → optional I/O glyphs (HIG: don't rely on colour).
- [ ] **SWT-04** P2 — Overshoot pushes knob past `p-0.5` with `snappy`; `lg` size. Docs: iOS uses switches in list rows; outside lists prefer a toggle button (HIG §2).

### Segmented control
- [x] **SEG-01** P1 improve (LG) — iOS 26 segmented = capsule; ours `rounded-control` track + `rounded-control-sm` thumb (not concentric; tabs use `rounded-button` → disagree). → `shape` prop, capsule default, concentric thumb.
- [x] **SEG-02** P1 gap (LG) — Drag-to-scrub across segments; glass-lens thumb while dragging; momentary mode (actions, no selection; HIG §5).
- [ ] **SEG-03** P1 bug — Ref override + SSR indicator (CMP-X07); off-scale heights (ENG-43).
- [ ] **SEG-04** P2 — Arrow keys move focus without selecting (WAI-ARIA radio selects on focus) → select on focus or document; long labels overflow (no `truncate`). Guidance: ≤ 5 segments on iPhone; text or icons never mixed.

### Tabs
- [ ] **TAB-01** P1 bug — `line` + `orientation="vertical"`: indicator forced `bottom-0 h-0.5!` + translateX → underline slides along the bottom. → Inline-start bar + translateY.
- [ ] **TAB-02** P1 a11y — `TabsContent` focusable (Radix `tabIndex=0`) with `outline-none` → invisible focus.
- [ ] **TAB-03** P1 gap — No overflow: many tabs overflow mobile → `overflow-x-auto`, scroll active into view, edge fades.
- [ ] **TAB-04** P2 — Default list is frosted glass capsule in content layer → fill track default, glass opt-in when floating; trigger height arbitrary; line `h-9 px-2`; inactive `foreground/65` contrast; content slide ignores reduced motion.

### Slider
- [x] **SLD-01** P0 token — `bg-white`, `rgb()` shadows, `size-6`, `focus-visible:ring-4` (not `--glass-ring-width`) (`:33`).
- [ ] **SLD-02** P1 a11y — No per-thumb names ("Minimum"/"Maximum") or `aria-valuetext` formatter (range demo labels both "Range"). → `thumbLabels`, `getAriaValueText`.
- [x] **SLD-03** P1 rebuild (LG) — iOS 26 thumb = horizontal capsule that becomes a stretching glass lens while dragged; plus leading/trailing min-max icons, value bubble while dragging, `ticks` (label min/max only), `neutralValue`, `variant="progress"`, circular slider for wrapping values (P2). *(M2: value bubble is solid accent, not glass; circular slider open)*
- [ ] **SLD-04** P1 a11y — `hover:scale-105`/`active:scale-110` not stilled; 24px thumb no hit area.
- [ ] **SLD-05** P2 bug — `disabled:pointer-events-none` on a `<span>` never matches → `data-disabled:`; renders `[min,max]` thumbs when no value (Radix defaults `[min]`).

### Progress
- [x] **PRG-01** P1 bug — `max` ignored: `translateX(-(100 - value)%)` (value 5, max 10 shows 5%). → `value / max`.
- [ ] **PRG-02** P1 gap — Indeterminate state (`value={null}` shows empty, still). → Animated stripe (still under reduced motion). HIG: never switch spinner ↔ bar.
- [ ] **PRG-03** P1 — RTL fill direction; `h-2.5 rounded-full duration-700 ease-out` literals; demo uses `tabular-nums` (rule) → `numeric-glass`.
- [ ] **PRG-04** P2 (LG) — Decorative chart-2 → primary gradient; Apple progress is one tint → opt-in gradient; sizes; label/value slot.

### Kbd / Separator / Avatar
- [x] **KBD-01** P1 bug — `KbdGroup` renders `<div>` → invalid inside `<p>` → hydration error. → `<kbd>`/`<span>`.
- [ ] **KBD-02** P1 token — `font-glass-sans` but rules say `font-glass-mono` (pick one, update rule); `h-5/min-w-5`; ×0.5 radius. P2: styling inside tooltips / primary buttons.
- [ ] **SEP-01** P2 — Comment says rim colour, code uses `bg-foreground/10`; not increased-contrast aware; inset variant (list separators start at text); device-pixel hairline.
- [x] **AVT-01** P1 parity — `AvatarBadge` (status dot/count).
- [ ] **AVT-02** P2 — `text-[0.6rem]`, `ring-2`, gradient hack (`:74`); `AvatarGroupCount` "+4" needs "4 more"; monogram style (grey gradient, white initials); `xl`.

### Dialog
- [x] **DLG-01** P1 bug — No `max-h`/overflow → long content runs off phones. → `max-h-[calc(100dvh-2rem)] overflow-y-auto` / `DialogBody`.
- [x] **DLG-02** P1 rebuild — Footer close + demo Cancel are `variant="glass"` inside `glass-strong` → glass on glass (design rule 3, Apple). → `secondary` (fill).
- [x] **DLG-03** P1 token/perf — Scrim `bg-black/15 dark:bg-black/45 backdrop-blur-[3px]` under `glass-strong` = blur on blur (perf rule 5). → `--glass-dim`, no scrim blur.
- [x] **DLG-04** P0 gap — Destructive-confirm demo uses Dialog not `role="alertdialog"` → `alert-dialog` (NEW-05).
- [ ] **DLG-05** P2 (LG) — iOS 26 modal header: leading `xmark` glass circle, centred title, trailing prominent ✓ → `DialogToolbar`; physical close/padding (CMP-X04); `p-6 gap-4` ignore card spacing.

### Sheet
- [x] **SHT-01** P1 bug — No scroll container → long content overflows. → `SheetBody` (`flex-1 overflow-y-auto`) + scroll edge under header.
- [x] **SHT-02** P1 bug — Bottom sheet `bottom-3` ignores `env(safe-area-inset-bottom)` → collides with home indicator.
- [x] **SHT-03** P1 gap (LG) — Detents (`medium`/`large`/custom), grabber (tap cycles detents; VoiceOver-operable), drag-to-dismiss with unsaved-changes confirm, morph from source, opaque at full height, `modal={false}` non-dimming inspector, one sheet at a time; HIG button layout (Cancel leading, Done trailing; never Cancel+Done+Back). Merge with `drawer` (NEW-14).
- [ ] **SHT-04** P2 bug — Slide 100% while panel inset 0.75rem → sliver + rim visible at start → slide `calc(100% + inset)`; literal scrim/durations; export `SheetOverlay`/`SheetPortal`; logical `side="start|end"`.

### Popover / Tooltip / Dropdown menu
- [x] **POP-01** P1 bug — No `max-h-(--radix-popover-content-available-height)` → tall content clips.
- [ ] **POP-02** P2 parity — `PopoverHeader/Title/Description`, optional `PopoverArrow`; larger glass should read thicker than a tooltip (same `glass-strong` today); animate size changes; auto-save on dismiss guidance.
- [x] **TIP-01** P0 parity — `Tooltip` doesn't wrap its own `TooltipProvider` → **code copied from shadcn crashes** (Radix throws). Demo/site mask it. → Wrap Root in Provider.
- [x] **TIP-02** P1 bug — `rounded-button` capsule + `max-w-xs` → multi-line tooltips become stretched pills, corners clip. → `rounded-control` when wrapping.
- [ ] **TIP-03** P2 — Raw px shadow vars; delay 120 vs shadcn 0; document no-touch (icon buttons need `aria-label`); arrow omission documented.
- [x] **MNU-01** P1 improve (LG/touch) — Rows ~36px; iOS 44pt → `pointer-coarse:py-3`.
- [ ] **MNU-02** P2 (LG) — Check indicator trailing; iOS 26/macOS put it leading in the icon column. HIG: all items in a group get an icon or none; submenus one level ≤ 5 items; iOS palette row (`preferredElementSize` small/medium); inline-expanding submenus on touch (not cascading glass-on-glass, `:123`); item description line.
- [ ] **MNU-03** P2 bug — `SubContent` no `max-h`; `duration-150`; uppercase labels; demo doesn't exercise Sub/RadioGroup/inset.

### Toaster
- [x] **TST-01** P1 token — Only `toast`/`description` styled; Sonner `actionButton`/`cancelButton`/`closeButton` render default black/grey. → `buttonVariants`.
- [x] **TST-02** P1 bug — `theme` not wired → Sonner defaults light; `.dark` sites get light internals.
- [x] **TST-03** P1 bug — Default bottom-right, no offset → toasts land on the fixed `Dock`. → Offset from `--dock-inset`; mobile `top-center` (iOS banners).
- [ ] **TST-04** P2 — `sonner` alias name; demo shows mounting; HUD position (centred transient capsule: "Copied", volume).

### Dock
- [x] **DCK-01** P0 a11y — Navigation built as a radio group (ToggleGroup) → destinations can't be links (no href, `aria-current="page"`, new tab, prefetch). → `nav` + `DockItem asChild` links, indicator keyed on `aria-current`; `tablist` mode for in-page panels.
- [x] **DCK-02** P1 bug — `min-w-18` no shrink: 5 items + action ≈ 450px overflows 375px phones. → `flex-1 min-w-0`, truncating labels.
- [x] **DCK-03** P1 gap — Export `--dock-inset` for page padding/toasts; count badges on items; drag-to-scrub (pill becomes a lens following the finger, iOS 26 tab bar); icon+label side-by-side in compact height; minimise/accessory/search (NAV-03). *(M1: --dock-inset; left: badges, scrub, compact layout)* *(M2: web done; native has no scrub)*
- [x] **DCK-04** P1 token — `text-[0.65rem]`, `calc(3.25rem)`/`calc(3.75rem)`; literal accent shadow; solid action → tinted liquid. Guidance: filled symbols in tab bars; never disable/hide tabs; single-word labels.

### Grouped list
- [x] **GRL-01** P0 a11y — `role="listitem"` lands on the `asChild` child via Slot → documented `<button>`/`<a>` rows **lose their role**. → `<div role="listitem">` around Slot, or `ul/li`.
- [x] **GRL-02** P1 a11y — Focus = `bg-fill-strong` only, `outline-none`, no ring.
- [ ] **GRL-03** P1 token — `text-white` icon tile → `text-primary-foreground`; `size-7.5`; radius ×0.75; `text-[0.95rem]`. *(M0 done: icon tile label token; left: sizes, radius)*
- [ ] **GRL-04** P2 (LG) — Full-width separators (iOS insets to text start); hard-coded `h3`; uppercase headers → title case; row accessories (switch, checkmark, info button — info ≠ navigation; chevron drills in), disabled rows, swipe actions; align API with shadcn `Item` (`ItemMedia`, `ItemContent`, `ItemActions`). *(M1: inset separators, disabled rows; left: accessories, swipe actions)*

### Glass
- [ ] **GLS-01** P2 — Only `data-intensity` exposed; `tint` only primary/destructive (→ `prominent` tone range, LG-07).

## 6. Missing components

### 6.1 Form and core (P0)
- [x] **NEW-01** P0 — `select` — Radix Select; glass-strong listbox morphing from trigger; leading check; trigger = Input height/radius; `variant="pill"` = Apple pop-up button (current choice shown; mutually exclusive; no submenus).
- [x] **NEW-02** P0 — `radio-group` — accent circle + dot; 44px hit; card variant. (Mac guidance: 2–5 options, else pop-up.)
- [x] **NEW-03** P0 — `field` (+ form) — `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldSet`, `FieldLegend`; wires `aria-describedby`/`aria-invalid`; horizontal orientation for switch rows. *(M3: Field wires ids/aria itself; no separate react-hook-form `form` item)*
- [x] **NEW-04** P0 — `input-group` — addons inline-start/end/block, `InputGroupButton`, `InputGroupText`: search icon, clear, password reveal, units, submit in a capsule.
- [x] **NEW-05** P0 — `alert-dialog` — `role="alertdialog"`, no outside dismiss, bold left-aligned title (≤ 2 lines), ≤ 3 capsule buttons (default trailing/top, Cancel leading/bottom, never Cancel as default), destructive style only for non-deliberate actions, optional source-anchored origin.

### 6.2 Best-in-class (P1)
- [x] **NEW-10** — `button-group` — joined buttons sharing one glass (Apple toolbar grouping), separators, orientation.
- [x] **NEW-11** — `toggle` / `toggle-group` — pressed fill/tint; multi-select (also iOS "toggle button" outside lists).
- [x] **NEW-12** — `spinner` — iOS radial ticks or ring, `role="status"`, still frame under reduced motion; used by Button `loading`.
- [x] **NEW-13** — `skeleton` — fill shimmer on frost; still under reduced motion.
- [x] **NEW-14** — `drawer` — bottom sheet with drag/detents/grabber (merge with SHT-03).
- [x] **NEW-15** — `command` — cmdk palette in liquid panel, search capsule, groups, shortcuts, `CommandDialog` (powers SITE-03).
- [x] **NEW-16** — `combobox` — Popover + Command; single/multi with chips (doubles as token field).
- [x] **NEW-17** — `context-menu` — shares `menuSurface`; long-press on touch; optional preview card (clip path matches preview radius); ≤ 3 groups; hide (not dim) unavailable; destructive last in red.
- [x] **NEW-18** — `scroll-area` — capsule thumbs on glass; scroll-edge hook.
- [x] **NEW-19** — `accordion` / `collapsible` — disclosure rows (chevron trailing→down), `interpolate-size` height, grouped-list styling (Apple DisclosureGroup).
- [x] **NEW-20** — `alert` — inline status callout on a fill (not glass); icon/title/description; status variants (ENG-21).
- [x] **NEW-21** — `calendar` / `date-picker` — react-day-picker on glass; compact pop-up date button (iOS compact style: value in accent opens calendar); range; time (minute interval divides 60).
- [x] **NEW-22** — `item` — shadcn list-row primitive; reconcile with GroupedList.
- [x] **NEW-23** — `pull-down-button` — Button + DropdownMenu, trailing chevron, ≥ 3 items, optional split primary action. *(M2: PullDownButton / SplitButton in button)*
- [x] **NEW-24** — `stepper` — −/+ capsule pair sharing one glass, `role="spinbutton"`, long-press repeat, Shift ×10; always beside a value field.
- [x] **NEW-25** — `confirmation-popover` / `action-sheet` — destructive confirm anchored to source; bottom action sheet on phones (destructive top, Cancel bottom). *(M3: `confirmation-popover` shipped; no automatic phone fallback to ActionSheet)*
- [x] **NEW-26** — `navigation-bar` / large title — large title collapsing into inline title under a scroll edge; Back/Close as symbols.
- [x] **NEW-27** — `empty` — empty state (icon tile, title, description, actions; search variant shows the query).

### 6.3 Nice (P2)
- [ ] **NEW-30** — `hover-card`; `input-otp`; `breadcrumb` (Apple path control, middle truncation menu); `pagination` (extract from data-table); `navigation-menu` / `menubar`; `carousel` (Embla + page control); `resizable` (split view, thin 1pt divider, glass grab handle); `aspect-ratio`; `native-select`.
- [ ] **NEW-31** — Apple-only: `page-control` (dots in glass capsule, ≤ 10, scrubbable, automatic/prominent/minimal backgrounds); `picker-wheel` (scroll-snap); `token-field`; `color-well` (reuse studio OKLCH editor); `level-indicator` / `rating`; `hud`; `share` button pattern.

## 7. Content layer: surfaces, type, data, charts, tables, chat, blocks

### 7.1 Surfaces
- [x] **SRF-01** P1 gap — Grounds: aurora is the only one; Liquid Glass sits on real content. → `Backdrop` variants `image` (object-position, optional 35% dim for clear glass), `video` (muted, playsInline, poster, paused under reduced motion), `mesh` (4–6 point mesh from palette), `noise`.
- [x] **SRF-02** P1 perf — Aurora `will-change-transform` always on (even `animate={false}`/reduced motion) → three viewport GPU layers for nothing (`aurora.tsx:42`); `filter: blur()` on animated blobs re-rasterises every frame (`:48`) → bake softness into gradient stops; pause offscreen (IntersectionObserver) — matters with an aurora per ThemeScope preview; flat `--aurora-base` under reduced transparency.
- [ ] **SRF-03** P2 — `minWidth` floors 560/480/540px (`:45`) → `vmax`/token; `speed={0}` divides by zero (ENG-19); aurora demo body text sits on the ground (rule 6).
- [x] **SRF-04** P1 rebuild (LG) — `Card material="regular|thick|solid"` (solid = opaque `--card` for dense screens); `variant="widget"` sizes small/medium/large/extraLarge with container-query layout, 16pt padding, `rounded-concentric` inner tiles; `CardImage`/hero slot; `asChild` link card with press state. *(M3: Card material + CardImage; widget sizes ship as the `widget` item)*
- [ ] **SRF-05** P2 — Card re-derives `--card-spacing` (`:21`, use `spacing-card`); `text-sm/base` → type steps; `overflow-hidden` clips edge children's focus rings → `overflow-clip` + `overflow-clip-margin`.

### 7.2 Typography and prose
- [x] **TYP-01** P1 gap — Apple text styles on `Text variant` (ENG-29) + `emphasized`.
- [x] **TYP-02** P1 improve — Body: `text-wrap: pretty`; `hyphens: auto` primitive (`glass-hyphens`, needs `lang`).
- [ ] **TYP-03** P2 — Overline hard-codes `tracking-[0.12em] uppercase` (`:49`); `xl` arbitrary `pow(…,8)` (ENG-47); physical `border-l-[3px] pl-4`, `pl-[1.4em]` (`:80,99`); `rounded-[calc(…*0.5)]` → `rounded-control-xs`; `List` `Omit<…,"ref">` drops React 19 ref.
- [x] **PRS-01** P1 bug — Prose `img`/`video` no `max-width: 100%; height: auto` → overflow measure (`stylesheet.mjs:232`); wide `table` overflows (`:229`) → `display:block; overflow-x:auto`.
- [x] **PRS-02** P1 gap — Missing elements: `kbd`, `mark`, `del/ins`, footnotes, `dl/dt/dd`, `details/summary`, GFM task lists, GitHub alerts (`> [!NOTE]`), `figure`, nested list markers, heading `scroll-margin-top` + anchors, `h2 + *` rhythm, Shiki light/dark token colours. *(M3: all but Shiki light/dark token colours)*
- [ ] **PRS-03** P2 — Physical props (`:198-204, 230`); hard-coded weights 650/600, `3px`, `1px`; prose blockquote styled as pull quote (multi-paragraph Markdown quotes look wrong); `pre` frost without backdrop → `bg-fill-strong` + copy button; `dangerouslySetInnerHTML` docs need a sanitise warning.
- [ ] **FNT-01** P2 bug — `editorial` sets `glass-numeric: oldstyle-nums`, applied to tables/tooltips/pagination → misaligned columns. Tables/tooltips force `tabular-nums lining-nums`.

### 7.3 Compact data visuals
- [x] **RNG-01** P1 rebuild — Activity rings ≠ Apple anatomy: flat colour (Apple: angular gradient dark start → light end), second lap at 0.85 opacity capped at 200% (Apple keeps winding with drop shadow under the leading cap), no start glyph. → Track + full ring + `value % 1` arc, gradient along arc, cap shadow only when > 1, per-ring `icon`, unlimited laps.
- [x] **RNG-02** P1 token — Hard-coded `1.2s cubic-bezier(…)`/`0.8s` → `motion-still` ignored. Same: progress-ring:48-49, sparkline:59,71, gauge:72, bar-list:54, chat:217. → `calc(var(--glass-duration) * k)`, `var(--glass-ease)`.
- [ ] **RNG-03** P2 — `strokeOpacity={0.2}` → `--glass-track-opacity`; centre slot; responsive `size="100%"`; index keys; default label "Ring 1" (English) → require `label`.
- [ ] **PRR-01** P1 a11y — Progress ring `role="progressbar"` without name or `aria-valuetext` → `label` (required), `valueText`. P2: indeterminate arc; > 1 lap; content text in `--primary` on glass → `text-foreground`.
- [x] **SPK-01** P0 bug — Fixed `W=300` viewBox + `preserveAspectRatio="none"` → **dots stretch into ellipses** at any other width. → HTML overlay dots by % or ResizeObserver real width.
- [ ] **SPK-02** P1 — `role="img"` without default name → require `aria-label` or derive "min–max, latest N"; scrubbing (lollipop rule), baseline/reference line (previous close), `bar`/`win-loss` variants, min/max dots, trend colour.
- [x] **SPK-03** P2 — `useId().replace(/:/g,"")` misses React 19 `«»`/`_r_` → shared sanitiser; `Math.min(...arr)` overflows ~100k points.
- [x] **STA-01** P1 rebuild — Stat is its own glass pane → tiles in a card are glass-on-glass; content tiles shouldn't be glass. → `bg-fill` + `rounded-concentric` inside cards; glass opt-in standalone.
- [x] **STA-02** P1 bug — `direction` conflates direction and sentiment (latency up = green); no flat. → `direction: up|down|flat` + `sentiment: positive|negative|neutral`; sr-only "increased/decreased".
- [x] **STA-03** P2 — Token sizes; `StatDescription` ("vs last week"), `StatChart` slot, Intl compact formatting, `title` on truncation, skeleton.
- [x] **HMP-01** P0 bug — Default `today = isoDate(new Date())` server UTC vs client local → **hydration mismatch** (`heatmap.tsx:17`; also in dashboard-01).
- [x] **HMP-02** P1 bug — Weekdays use `undefined` locale (server ≠ browser), months hard-coded `en-US` → `locale` prop throughout.
- [ ] **HMP-03** P1 a11y — `onSelect` puts ~182 cells in tab order → `role="grid"` + roving tabindex (arrows, Home/End, PageUp/Down by month); non-interactive values only in `title` → root summary + hidden table.
- [ ] **HMP-04** P1 token — `text-[0.625rem]`, `gap-[3px]`, `rounded-[3px]`, `ring-2` → tokens (shape presets don't reach cells).
- [ ] **HMP-05** P2 — Custom levels/quantiles; month/year layouts; glass Tooltip not `title`; `hover:scale-125` not motion-tagged.
- [ ] **BAR-01** P2 — RTL (`left-0 origin-left text-left`); `h-[calc(2rem…)] px-2.5`; duplicate-name keys; per-item colour, share % column, `limit` + "Show all" sheet, sort.
- [ ] **GAU-01** P1 a11y — `label` optional on `role="meter"`, unclamped `aria-valuenow`, no `aria-valuetext`.
- [ ] **GAU-02** P1 gap — SwiftUI Gauge parity: gradient track, current-value marker dot, min/max labels, capacity vs standard styles, linear style, threshold bands → `variant: arc|circular|linear`, `gradient`, `marker="dot"`, `minLabel`/`maxLabel`. Level-indicator style (discrete segments, green default).
- [ ] **TRK-01** P1 a11y — `aria-label` on non-focusable `listitem` unreliable; colour-only status → summary `role="img"` ("22 of 30 done; missed Sep 7, 18") + focusable blocks with Tooltip; pattern fill for missed. P2: RTL `rounded-l/r`, tokens, legend/summary, `onSelect`.
- [ ] **CAT-01** P1 — Category bar: marker name is a bare number; bands unnamed → root `role="meter"` / img "62, in band 2 of 3 (Fair)"; `bands: {size,label,color}[]`, `valueFormat`, tooltip. P2: active band outline (not 0.4 dim); RTL; tokens.

### 7.4 Charts
- [x] **CHT-01** P0 bug — Area gradient ids `area-${i}` fixed → **two area charts on a page share colours** (`area-chart.tsx:67,81-82`). → `useId()` prefix + `idPrefix`.
- [x] **CHT-02** P1 bug — Preset memos depend on `x`, `series`, `valueFormat`, `xFormat` passed inline by every demo/block → definition rebuilds every parent render (area:102, line:80, bar:95, donut:74; analytics-01:102,106). → Latest accessors in a ref; memo on data/structure.
- [x] **CHT-03** P1 bug — `drawIn` fixed 900ms ignores `motion-still` (`chart.tsx:27`) → read `--glass-duration`; `initial:false` at 0; consider TanStack spring to match `--glass-ease`.
- [x] **CHT-04** P1 bug — `useControlRadius` starts at 8 then corrects (rebuild/re-animate); observes `<html>` + `<head>` but ThemeScope writes `<style>` in body → scoped shape never reaches bars/slices. → `useSyncExternalStore` + ResizeObserver on host + nearest `[data-glass-scope]`, or CSS var radius. *(M3: a radius change still rebuilds once)*
- [x] **CHT-05** P1 bug — No `initialWidth`/`idPrefix` → SSR at fallback width (CLS). → `initialWidth` (default 640), `idPrefix={useId()}`.
- [x] **CHT-06** P1 a11y — `ariaDescription` not surfaced; no exact-value alternative. → `ChartDataTable` (hidden/toggle `<table>`) + `ChartSummary` (auto min/max/latest/trend); P2 audio graph (Web Audio sonification). Hide axis text from AT; per-mark labels with context.
- [x] **CHT-07** P1 gap — Empty/loading/error states → `ChartContainer state` (skeleton axes with shimmer, "No data for this range", retry).
- [x] **CHT-08** P1 gap — Touch scrubbing/selection: press-and-drag rule + top annotation (Swift Charts `chartXSelection` + `.annotation(position:.top, overflowResolution:.fit)`), whole plot area as target, keyboard by x; `selectedX`/`onSelect(row)` on presets.
- [x] **CHT-09** P1 improve — Apple axis style: y axis trailing, no domain lines, hairline grid ~10–15%, caption2 labels; bars start at zero; units in title. → `axisPosition="trailing"` default, `--chart-grid-opacity`, `type-step-n2`.
- [x] **CHT-10** P1 bug — Chart palette not CVD-safe (ENG-14); `chartColor` cycles 5 → 6th series silently repeats → `--chart-6..8` or "Other"; separators between stacked segments (HIG). *(M3: --chart-6..8 + separators; CVD not test-validated)*
- [ ] **CHT-11** P2 — Legend keyed by label, round swatch for lines (should be dashes), not interactive → TanStack `interactiveColorLegend` (`aria-pressed`, hover linking). `ChartHeader` (headline value, delta, period like Health/Stocks); reference lines/bands/annotations (`RuleMark`/`RectangleMark`); export; tooltip uses liquid + tokens (`chart.tsx:115-116`).
- [x] **CHT-12** P2 — Area: mixed-sign stacking wrong (`stackOffsetDiverging`); tooltip order = reverse stack + total; `expand` 100% stack; latest-point dot; forecast dashes. *(M3: forecast dashes open)*
- [x] **CHT-13** P1 bug — Bar: Dates labelled via `toISOString().slice(0,10)` (UTC, off by a day) (`bar-chart.tsx:57`); band key = formatted label → two "Mon"s merge (`:55-58`). P2: `Math.min(radius, 8)`, `maxThickness: 44` px; value labels on bars; negative baseline; selected bar.
- [ ] **CHT-14** P2 — Line: `sort` mis-indented (prettier); end labels (direct labelling), step curve, log scale, dual axis, brush/zoom, per-series dash pattern.
- [x] **CHT-15** P1 — Donut: `Intl.NumberFormat("en-US")` hard-coded (`:43,68`); key/colour by label (dupes, > 5 cycle) → index + "Other"; selection (`chartAngleSelection`: centre shows selected label/value; legend rows show value and %); per-slice text alternative.
- [ ] **CHT-16** P2 a11y — Chart demo encodes workout vs rest by colour alone → symbol channel/direct labels.

### 7.5 Tables
- [ ] **TBL-01** P2 — `table.tsx`: `text-left`, `pr-0` → logical; heights/paddings → tokens; overflow container not focusable (`scrollable-region-focusable`) → `tabIndex=0 role="region" aria-label`; `align`/`numeric` on Head/Cell; sticky header with hard scroll edge; sr-only caption; inset-grouped variant. *(M1: align/numeric, focusable region; left: sticky header, caption, inset variant)*
- [x] **DTB-01** P0 parity — Data table vs shadcn: no column visibility, rows-per-page, first/last page, faceted filters, row actions, pinning, resizing, expanding, grouping. → Register features + ship `DataTableToolbar`, `DataTableViewOptions`, `DataTableFacetedFilter`, `DataTableRowActions`.
- [x] **DTB-02** P0 gap — Uncontrolled only: no `state`/`onStateChange`, no `manual*` + `rowCount` → server data and URL sync impossible. → `tableOptions` passthrough + controlled props.
- [x] **DTB-03** P1 — Virtual mode (`@tanstack/react-virtual`, sticky header, `contain: strict`); loading skeleton rows + error row.
- [x] **DTB-04** P1 bug — Clickable `tr` fires `onRowClick` for nested links/buttons; Space doesn't activate → ignore interactive descendants or stretched primary link.
- [x] **DTB-05** P2 — `aria-live` count announces every keystroke (debounce); English-only strings → `labels`; RTL `left-[…]`/`pl-[…]`; select-all-across-pages banner; debounced search; narrow-screen list layout (Apple uses lists on iPhone); CSV export.

### 7.6 Chat
- [x] **CHA-01** P0 gap — AI SDK `UIMessage.parts`: `ChatMarkdown` (streaming-safe, unclosed fences), `ChatCodeBlock` (language, copy, wrap, Shiki), `ChatReasoning` ("Thought for 12s", auto-open while streaming), `ChatTool` (states `input-streaming|input-available|output-available|output-error`, JSON in/out, approve/deny), `ChatSources`/`ChatCitation`, `ChatFile`/`ChatAttachment`, `ChatError` (retry); `renderParts(message)`.
- [x] **CHA-02** P0 gap — Composer: `status` → send becomes Stop (`onStop`) during `submitted|streaming`; `trailing` slot (model picker, mic); attachments (paste, drop, chips); `maxLength` counter; `submitOnEnter`; send = tinted prominent, not solid.
- [x] **CHA-03** P0 a11y — `role="log"` + `aria-live="polite"` re-announces every streamed token → `aria-busy` on streaming message + hidden `role="status"` announcing the whole message once.
- [x] **CHA-04** P1 bug — `whitespace-pre-wrap` on every bubble adds blank lines between Markdown blocks → plain text only.
- [x] **CHA-05** P1 rebuild — Assistant turns always bubbles; modern AI chats render assistant as full-width prose → `layout="bubble|document"`.
- [x] **CHA-06** P1 a11y — Speaker identity visual only → `role="article"` + `aria-label` per message, `<time dateTime>` in `ChatMeta`; suggestions inside the log are announced as entries → move above composer.
- [x] **CHA-07** P1 gap — `ChatActions` (copy, regenerate, edit, thumbs, share), `ChatReactions` (tapbacks as a liquid capsule on the bubble corner), message status (sending, failed + retry, edited).
- [x] **CHA-08** P1 bug — Prepending older history jumps scroll → `overflow-anchor` + anchor-preserving `loadOlder`.
- [x] **CHA-09** P1 token/LG — `text-[0.7rem]`, `max-w-[min(80%,36rem)]` (→ `--chat-bubble-max`), calc paddings; jump button + floating composer → liquid; jump button materialises, not fades.
- [x] **CHA-10** P2 — Virtualisation (reverse mode) + unread count on jump button; per-token re-render (`querySelectorAll` + `setAtBottom(true)` each resize); `textareaProps.ref` overrides internal ref (merge; prefer `field-sizing: content`); suggestions row edge fades + scroll-snap. *(M3: all but virtualisation)*

### 7.7 Blocks (existing)
- [ ] **BLK-01** P1 — dashboard-01: `tabular-nums` + `font-glass-heading font-bold` on figures (rule) → `type-glass-display numeric-glass`; heatmap hydration (HMP-01); three stats in `grid-cols-3` truncate at 375px; ring vs legend labels disagree, duplicated colours. Rebuild as Fitness/Health "Summary": large title, widget cards, floating liquid toolbar + tab bar. *(M1: token fixes; left: phone truncation, Health-style rebuild)*
- [ ] **BLK-02** P1 — analytics-01: inline `x`/`valueFormat` (CHT-02); ⅓-width DataTable cramped; `text-right`; Day column unsortable; KPI deltas, date-range picker, loading/empty demos.
- [ ] **BLK-03** P2 — settings-01: `text-[0.95rem]`, `tabular-nums`; segmented/slider change nothing → wire to local `ThemeScope`; inert "Reminder time"; push/detail navigation, large-title header, search; title-case headers.
- [ ] **BLK-04** P2 — auth-01: `autoComplete="username webauthn"` for passkeys + icon; error/pending states; `href="#"`; float as a sheet over a photo/video ground.
- [ ] **BLK-05** P2 — chat-01: `h-[min(600px,80svh)]` → `dvh`.

### 7.8 New data components
- [x] **DAT-01** P0 — `chart-data-table` / `ChartSummary` for every preset (one `accessibilityTable` prop).
- [x] **DAT-02** P0 — Data table v2 toolbar + server + virtual modes (DTB-01..03).
- [x] **DAT-03** P1 — Shared chart selection/scrubber (line, area, bar, sparkline).
- [x] **DAT-04** P1 — `widget` (small/medium/large/XL; lock-screen `circular` 76², `rectangular` 172×76, `inline`; 16pt margins, 11pt min text; accented rendering).
- [x] **DAT-05** P1 — `kpi` / Stat v2.
- [x] **DAT-06** P1 — `range-chart` (Health heart rate, Weather temperature capsules with current dot) + `candlestick`. *(M3: range-chart; candlestick deferred)*
- [x] **DAT-07** P1 — Shared chart/table skeleton + empty + error.
- [ ] **DAT-08** P2 — `scatter`/`bubble` (sqrt radius, ordinal colour + shape), `radial-bar` (Screen Time), year calendar heatmap + punch card, storage `segmented-bar` + linear `meter`, `timeline`/activity feed, `funnel`/`waterfall`/`treemap`, `json-viewer`/key-value list.

### 7.9 New blocks — Liquid Glass showcases first
- [ ] **BLK-10** P0 — `app-shell-01`: floating inset liquid sidebar, top floating toolbar (groups + one prominent), soft scroll edge, edge-to-edge content; collapses to dock on mobile.
- [ ] **BLK-11** P0 — `photos-01`: edge-to-edge grid, floating bottom liquid toolbar (select/share/delete), top segmented Years/Months/All, minimising tab bar. *The canonical Liquid Glass scene.*
- [ ] **BLK-12** P0 — `media-viewer-01`: fullscreen image/video, clear glass controls + 35% dim, auto-hide, materialise on tap.
- [ ] **BLK-13** P0 — `chat-02` (AI assistant): streaming Markdown, reasoning, tools, code, sources, attachments, stop/regenerate, model picker in a liquid composer, conversation sidebar.
- [ ] **BLK-14** P1 — `now-playing-01` (album-art ground via background extension, glass scrubber, transport, lyrics, mini-player accessory over dock); `maps-01` (search capsule, detented sheet, trailing floating controls); `weather-01` (sky/video ground, range bars, gauge/compass tiles); `mail-01` (three panes, swipe actions, compose sheet morphing from button); `calendar-01`; `settings-02` (split view, large title, search, rows wired to ThemeScope); `command-palette-01`; `notifications-01` (stacks, banners, Live Activity capsule); `lock-screen-01` (clear glass, accessory widgets).
- [ ] **BLK-15** P2 — `onboarding-01`, `pricing-01`, `profile-01`, `file-manager-01`, `kanban-01`, `product-01`, `health-01`.

## 8. Native track

### 8.1 Breaks things (P0)

- [x] **NAT-01** P0 bug — Toast swipe-dismiss throws on iOS/Android: enter/place animations use the native driver on the shared transform (`toaster.tsx:164-199, 216-220`), then release runs a JS-driven `Animated.timing(drag)` → RN throws "Attempting to run JS driven animation on animated node that has been moved to native" (`react-native/Libraries/Animated/animations/Animation.js:73`). Web hides it. → Reanimated shared values + gesture-handler Pan (NAT-30).
- [x] **NAT-02** P0 bug (verify on device) — `Press` animates its own opacity to 0.72 on every press (`press.tsx:31`), and glass buttons/toasts put `GlassView` inside `Press`; disabled buttons sit at 0.45 → violates native rule 3. → `Press` skips opacity dim when child is glass (`isInteractive` already squashes/shimmers); disabled glass dims the label, not the container.
- [x] **NAT-03** P0 paradigm — On iOS 26 every surface (card, stat, grouped list, tooltip, toast, dialog) becomes `GlassView` (`glass.tsx:47`) → content-layer glass and glass-on-glass (`auth-01` button in card; `chat-01` composer in card), plus render cost. → `Glass variant="material" | "liquid" | "liquid-clear"`; material = `BlurView` system materials; liquid only on the control layer.
- [x] **NAT-04** P0 a11y — `BlurView` (iOS < 26), RN-web and Android paths ignore `isReduceTransparencyEnabled` / `reduceTransparencyChanged`, Bold Text, Darker System Colors / High Text Contrast. → `useGlassAccessibility()` → `glassSolid` + stronger borders.
- [x] **NAT-05** P0 test — No runtime tests for 53 native files; `verify:native` only installs + type-checks (that is why NAT-01/02 shipped). → See NAT-50..54.

### 8.2 Foundation

- [x] **NAT-10** P0 parity — `tokens.tsx:10-20` has 6 hand-converted hex palettes (web has 12); nothing checks parity. → Generated tokens (NAT-60).
- [x] **NAT-11** P1 parity — `tokens.tsx:44-66` glass opacities/border/shadow are literals → material/shape/motion/density/type presets and studio one-line install can't reach native.
- [x] **NAT-12** P1 a11y — No increased-contrast variants of primary/border/muted.
- [x] **NAT-13** P2 bug — Nested `GlassThemeProvider` setting only `palette` drops an outer forced `scheme` (`tokens.tsx:71-82`). → Merge with parent context.
- [x] **NAT-14** P1 fidelity — `glass.tsx:49` only `"regular"`; `clear`/`none`, `glassEffectStyle={{style, animate, animationDuration}}` (materialise) and `GlassContainer spacing` unused. → Export `GlassGroup` = `GlassContainer` (dock, tabs, segmented).
- [x] **NAT-15** P2 bug — `glass.tsx:13` lacks `isGlassEffectAPIAvailable()` (Expo: some iOS 26 betas crash without it).
- [x] **NAT-16** P2 bug — iOS < 26 path `overflow: hidden` drops the `raised` shadow (`glass.tsx:86`). → Shadow on outer wrapper.
- [x] **NAT-17** P1 android — Translucent fill + `elevation` gives a dark halo (`glass.tsx:77-83`). → No elevation on translucent fills / RN 0.76+ `boxShadow`; opt-in blur tier: expo-blur `BlurTargetView` + `dimezisBlurViewSdk31Plus` (stable from SDK 55; provider pattern with a root target ref).
- [x] **NAT-18** P1 parity — RN-web path hard-codes `blur(28px) saturate(180%)` and uses `tint` as background (so `tint={ui.primary}` turns opaque) (`glass.tsx:64-66`). → Tokens; tint as a mix.
- [x] **NAT-19** P2 token — Default radius 26 vs `ui.radius.surface` 24 (`glass.tsx:43`).
- [x] **NAT-20** P1 fidelity — Haptic fires on `onPressIn` (`press.tsx:29`) so scroll-starts buzz; buttons opt in by default (`button.tsx:107`). → Fire on `onPress`; haptics for selection changes and typed notifications only; `useHaptics()` with global off switch, no-op on web.
- [x] **NAT-21** P1 anim — Animated friction/tension springs ≠ web motion tokens. → Reanimated `withSpring({ duration, dampingRatio })` from tokens; gesture-handler pressables so press doesn't fight ScrollView.
- [x] **NAT-22** P2 a11y — `Press` has no default `accessibilityRole`; function-style `style` lost.
- [x] **NAT-23** P1 a11y — Control heights 28/32/40 < 44pt with no `hitSlop` policy; fixed `height` clips at large Dynamic Type (`ui.tsx:53`). → `minHeight`, `hitSlop` to 44, `maxFontSizeMultiplier` per role (labels ~1.6, display/stat ~1.2).
- [x] **NAT-24** P1 token — `ui.tsx:52-58` radius/pad/type/motion literals; fonts ignore type presets; no expo-font loading of theme fonts.
- [x] **NAT-25** P2 rtl — No `I18nManager` awareness anywhere.
- [x] **NAT-26** P2 perf — Aurora: three full-window SVG gradients animate forever, sized by `useWindowDimensions` not parent (`aurora.tsx:41-65`, wrong in cards/iPad split). → `onLayout`; expo-linear-gradient or Skia.
- [x] **NAT-27** P1 a11y — Reduce motion implemented four ways (`aurora:13` state, `segmented-control:8` ref, `dialog:9` never-removed module listener, one-shot promise in charts); ref/one-shot read `false` on first mount so mount animations still play. `switch`, `chat`, `progress` import it from `segmented-control`. → One `native-a11y` foundation item (Reanimated's synchronous `useReducedMotion`).

### 8.3 Controls

- [x] **NAT-30** P1 fidelity — Switch is a JS re-implementation: no drag-to-toggle, solid knob, JS-thread translate (`switch.tsx:26`), `sm` 36×22 no hitSlop. → `@expo/ui` `Switch` on iOS/Android (SwiftUI Toggle gets the glass knob free; Compose M3); RN version for web.
- [x] **NAT-31** P1 bug — Slider: `onPanResponderTerminate` never calls `onValueCommit` (`slider.tsx:69-72`); grabs responder on touch start and never releases (`:50-52`, likely blocks vertical scroll). → gesture-handler `Pan().activeOffsetX([-8,8]).failOffsetY([-8,8])`.
- [x] **NAT-32** P1 rtl — Slider maths in physical x while `left:` flips in RTL. → `translateX`.
- [x] **NAT-33** P1 fidelity — Slider: no glass knob while dragging, no ticks/neutral value, 24pt touch height. → `@expo/ui` `Slider` for single values; Reanimated thumb with `GlassView` while active for ranges.
- [x] **NAT-34** P2 a11y — VoiceOver adjusts by `step` (100 swipes on 0–100). → 10% steps + `accessibilityValue.text` formatter.
- [x] **NAT-35** P1 rtl (verify) — Segmented indicator uses `left: box.x` (`segmented-control:69`) → lands on mirrored segment in RTL. → `translateX`.
- [x] **NAT-36** P1 anim — Indicator layout props on JS thread. → Reanimated / `LinearTransition`.
- [x] **NAT-37** P1 fidelity — iOS: `@expo/ui` `Picker` segmented style = real `UISegmentedControl` with iOS 26 glass; track heights 28/36 < 44.
- [x] **NAT-38** P1 paradigm — `native-dock` duplicates `NativeTabs` for app tabs. → `native-tabs-layout` recipe item (`minimizeBehavior="onScrollDown"`, `BottomAccessory` + `usePlacement`, `role="search"`, Material bar on Android; import path `expo-router/unstable-native-tabs` on SDK 57, `expo-router/native-tabs` on 58). Keep `Dock` for in-screen bars with `GlassContainer` + minimise.
- [x] **NAT-39** P1 fidelity — `DockAction` solid primary (`dock.tsx:106-122`). → Tinted `GlassView` (`tintColor=primary`, `isInteractive`).
- [x] **NAT-40** P2 bug — `dock.tsx:23` `useSafeAreaInsets()` throws without provider (sheet/toaster fall back).
- [x] **NAT-41** P2 a11y — `tabs.tsx:149` `PanelText` uses `Animated.Text`, bypassing `GText` scaling rules.
- [x] **NAT-42** P1 a11y — Checkbox 18pt + 10 hitSlop = 38pt; `Input` fixed `height: 40` (`input.tsx:54`); `invalid` not announced. → `minHeight`; `aria-invalid` + error text via `aria-describedby`.
- [x] **NAT-43** P2 fidelity — `Label` linking uses Android-only `accessibilityLabelledBy`; `auth-01:47` duplicates labels. → `Label htmlFor` via context.

### 8.4 Overlays

- [x] **NAT-44** P1 bug — Dialog/sheet: no keyboard avoidance. → `react-native-keyboard-controller`.
- [x] **NAT-45** P1 bug — Dialog content taller than window overflows with no scroll (`dialog.tsx:173-184`). → `maxHeight` + `ScrollView` body.
- [ ] **NAT-46** P1 fidelity — Sheet: no detents/grabber/drag-dismiss; default side `right` (not a phone idiom). → `@expo/ui` `BottomSheet` (iOS 26 inset glass sheet; Compose `ModalBottomSheet`) or expo-router `formSheet` + `sheetAllowedDetents`; web: Reanimated + Pan with snap points and rubber-banding. *(M4: system sheet can't report/control detents — `detent`/`onBeforeDismiss` use the Reanimated sheet)*
- [x] **NAT-47** P2 a11y — Dialog doesn't move focus to title; `accessibilityViewIsModal` set on `GlassView` not modal root.
- [x] **NAT-48** P2 motion — iOS 26 entrances translate+scale. → Materialise via `glassEffectStyle={{style:"regular", animate:true}}` from `"none"`.
- [ ] **NAT-49** P1 fidelity — Dropdown is a JS Modal. → Native `@expo/ui` `Menu`/`ContextMenu` on iOS/Android for plain items (label, icon, destructive, checkbox, radio, submenu) — morphs from button on iOS 26; JS version for custom content and web. Add `native-context-menu`. *(M4: system menu: no controlled `open`, no `onOpenChange` on iOS, SF Symbols only (`systemImage`))*
- [x] **NAT-55** P1 a11y — Dropdown rows `minHeight: 36` (`dropdown-menu.tsx:245`); uppercase label (`:185`); no select haptic.
- [x] **NAT-56** P2 bug (verify) — `popover.tsx:39-46` `measureInWindow` inside translucent-status-bar Modal on Android edge-to-edge.
- [x] **NAT-57** P1 fidelity — Long-press tooltip isn't an iOS idiom and screen readers never get it. → Tip into trigger `accessibilityHint`; long-press only on Android icon buttons; hover on web/iPad.
- [x] **NAT-58** P1 bug — Toaster is a root `View` with `zIndex` (`toaster.tsx:93-98`) → hidden under RN `Modal` and native `modal`/`formSheet`. → iOS `FullWindowOverlay` (react-native-screens); Android overlay/portal.
- [x] **NAT-59** P1 a11y — Toast `accessibilityLiveRegion` is Android-only (`:223`); VoiceOver never announces. → `announceForAccessibilityWithOptions(title, { queue: true })`; Android `getRecommendedTimeoutMillis`. P2: typed-toast notification haptics.

### 8.5 Chat and data

- [x] **NAT-61** P1 perf — Chat thread is a plain `ScrollView` (`chat.tsx:99-120`). → FlashList v2 / LegendList with `maintainVisibleContentPosition`, start-at-end.
- [x] **NAT-62** P1 bug — No keyboard handling for the floating composer. → `KeyboardStickyView`, interactive dismiss.
- [x] **NAT-63** P2 fidelity — `submitBehavior="submit"` on multiline (`chat.tsx:439`) → Return always sends on iOS. → Prop, default newline on native.
- [x] **NAT-64** P2 rtl — Bubble corners physical (`chat.tsx:224-228`). → `borderTopStartRadius`/`End`.
- [x] **NAT-65** P2 a11y — Send button 32pt; assistant messages not announced.
- [x] **NAT-66** P1 a11y — Charts collapse to one `image` (`chart.tsx:299-305`). → `adjustable` role stepping focus + announcing the tooltip row; "view as table".
- [x] **NAT-67** P1 perf — Every touch-move `setState` re-renders SVG and remounts a glass tooltip (`chart.tsx:312-321`). → Reanimated focus index + `useAnimatedProps`; Skia for dense series.
- [x] **NAT-68** P2 bug — Chart tooltip never clears on lift (no `onResponderRelease`); tick width assumes `length*6.4`; `SvgText` ignores font scale.
- [x] **NAT-69** P1 perf/a11y — Heatmap renders ~365 `Press` elements with two Animated values each and 365 VoiceOver stops (`heatmap.tsx:74`; same `tracker.tsx:55`). → Plain cells + one hit-testing gesture layer; summary + adjustable navigation.
- [x] **NAT-70** P2 anim — Native-driver `strokeDashoffset` on react-native-svg (rings/gauge/progress-ring) is undocumented. → Reanimated `useAnimatedProps`.
- [x] **NAT-71** P1 test — `chart-math.ts` and `placeFloating` (`popover.tsx:17`) are pure TS with no tests (root vitest excludes `registry/native`).
- [ ] **NAT-72** P2 fidelity — Avatar uses RN `Image`. → expo-image (cache, transition, placeholder). *(M4: expo-image not adopted; Avatar on RN `Image`)*
- [ ] **NAT-73** P1 fidelity — Grouped list: uppercase headers (`grouped-list.tsx:31`), separator inset 16 not aligned to text, title 15.2pt ≠ iOS body 17pt, `marginLeft` → `marginStart`; offer `@expo/ui` `Form`/`Section` on iOS. *(M4: done except an `@expo/ui` Form path on iOS)*
- [x] **NAT-74** P2 a11y — `Display` 95pt without `maxFontSizeMultiplier` (`typography.tsx:55`); `Blockquote` `borderLeft` → `borderStart`.
- [x] **NAT-75** P2 parity — `stat.tsx:27` ignores `intensity`; `card.tsx:25` maps `subtle` to `ui.fill`.

### 8.6 Sandbox, platform, verification

- [x] **NAT-50** P0 test — Unit (root vitest): chart-math, `placeFloating`, slider snapping, toaster store, **token parity** (generated native tokens vs `createGlassTheme` within ΔE threshold).
- [x] **NAT-51** P1 test — Component (jest-expo + RNTL): controlled/uncontrolled state, a11y role/state/value, text-in-`Text` safety, and a structural test failing if `Press` or any opacity-animated node wraps `Glass`.
- [ ] **NAT-52** P1 test — E2E (Maestro on iOS 26/27 sim + Android emulator in CI): a flow per `/c/<name>` (swipe toast, slider in ScrollView, menu, composer + keyboard) with screenshots; runs with `forceRTL`, largest Dynamic Type, Reduce Transparency, Increase Contrast. *(M4: 6 flows green on the iOS 26.5 sim incl. Reduce Transparency + Increase Contrast; left: CI job, Android emulator, RTL / largest Dynamic Type runs)*
- [x] **NAT-53** P1 test — Visual diffs of Maestro screenshots per palette × scheme. *(M4: 28 baselines in `sandbox/native/.maestro/baselines/`, `npm run visual`)*
- [x] **NAT-54** P1 test — `verify:native` also runs component tests against the shadcn-installed copy.
- [x] **NAT-76** P1 infra — Reanimated 4.5, worklets, gesture-handler installed in sandbox but unused by the registry; `@expo/ui` only transitive. → Declare as item deps when adopted.
- [x] **NAT-77** P1 platform — iOS 27 SDK requires scene-based lifecycle: SDK 57 needs `ios.enableSceneSupport` (expo ≥ 57.0.23) via `expo-build-properties`; default in SDK 58. Set in sandbox; document.
- [x] **NAT-78** P2 platform — `app.json` `"orientation": "portrait"`, no iPad/landscape demos → rotation, form sheets, sidebar untested.
- [x] **NAT-79** P2 docs — `docs/rules/native.md` rule 3 ("opacity starts below 1") → cite Expo (opacity 0 kills glass; use `animate` / swap to `none`) and point at materialise.

### 8.7 Native rebuild — target architecture

1. **One theme source.** `toNativeTheme(createGlassTheme(opts))` in `glass-theme.ts`: OKLCH → sRGB, rem → pt, density/shape/motion/type applied, `light`/`dark`/`highContrast` blocks. `pnpm generate` writes `registry/native/tokens.generated.ts` (all 12 palettes). Studio exports a `native-theme` item. `useUI()` = selector over generated theme + OS state (scheme, fontScale, Bold Text, Reduce Transparency, Increase Contrast, RTL). Parity tested. (**NAT-60**, P0)
2. **Two-layer surfaces.** `material` (BlurView system materials / Android blur tier or fill / token web) vs `liquid` / `liquid-clear` (`GlassView` on iOS 26+). `GlassGroup` = `GlassContainer`. Materialise via `glassEffectStyle.animate`. Test: no liquid in liquid, no opacity animation above liquid.
3. **Native controls first, JS fallback second.** Switch, single Slider, SegmentedControl, DropdownMenu/ContextMenu, BottomSheet, DatePicker, Button `glass`/`prominent` via `@expo/ui` (SwiftUI/Compose; `buttonStyle('glass'|'glassProminent')`; `glassEffectId` + `Namespace` morphs) through `.ios.tsx` / `.android.tsx`. RN versions remain for web and custom content. (**NAT-80**, P1)
4. **One animation + gesture stack.** Reanimated 4 + gesture-handler everywhere; drop `Animated`/`PanResponder`. `native-a11y` foundation: reduced motion/transparency, bold text, contrast, announce/focus, 44pt hitSlop. (**NAT-81**, P1)
5. **Navigation pieces.** `NativeTabs` recipe, `Stack.Toolbar` / header search recipes, scroll-edge via system bars, in-screen `Dock` only, toasts in `FullWindowOverlay`, keyboard layer (keyboard-controller) for dialog/sheet/chat. (**NAT-82**, P1)
6. **Lists + data.** FlashList/LegendList under chat, data-table, long grouped lists; Skia/Reanimated chart interaction; accessible chart navigation.
7. **Android first-class.** M3 colour roles from the palette (optional dynamic colour), Compose M3 controls via `@expo/ui`, blur tier, predictive back (sandbox disables it), edge-to-edge insets. (**NAT-83**, P1)
8. **Verification that sees behaviour.** NAT-50..54.

## 8b. Live visual and UX audit (measured in the browser)

Measured on the dev server with Chrome + Playwright: 23 pages × 1440/390 × light/dark, contrast from real pixels across 8 palette/material set-ups, forced-colours and increased-contrast emulation. **No console errors, warnings or hydration warnings anywhere.**

**Blur layers and scroll cost** — `backdrop-filter` elements: `/` **92**, `/themes` **124**, `/docs` 53, component pages 10–13, blocks 15–16. Headless scroll: `/` median frame 16.7 ms (50/171 slow) vs 8.3 ms with blur off (0 slow); `/themes` 32.5 ms (101/211 slow) vs 8.3 ms. Fast scroll on `/` in real Chrome showed blank dark tiles until scrolling stopped.

**Text failing WCAG AA** — dusk dark 12/87 on `/`; **dusk light 48/87**; ocean-liquid light 47/87; rose-crystal light 47/87; **sage matte light 10/87**; amber neon dark 17/87. Worst: category pill 2.3:1, tinted badges 2.4–2.7:1, orange stat 2.8:1, white-on-orange buttons 3.0–3.2:1, footer links 2.8:1, grey subtitles 3.2:1. Matte fixes most → the light default frost is too transparent. The studio badge ("AAA 9.02:1") checks body text only and hides this.

### Site-wide
- [ ] **UX-01** P0 a11y — Light mode illegible (above). → Raise light frost opacity toward matte for text-bearing surfaces; darken muted/tinted text; dark label or deeper orange on primary (ENG-02); legibility badge reports the worst of muted, tinted badges, button labels (ENG-07, QA-01). *(M0 done: accent to AA, text-on-glass labels, `primary-ink`/`destructive-ink` for tinted text, AA-tested secondary text on segments/tabs, site muted text. Measured on real pixels (8 themes × 7 pages): dusk light `/` 48 → 2 failing texts, most docs pages 0–4 (was 16–32). Left: install-command tabs on `glass-subtle` (3.8–4.5), footer/sidebar links on the light ground (4.0–4.5), a dark-mode ring figure (2.3) — and `legibilityReport` still ignores blur/saturate, so the model reads ~0.5 higher than pixels)*
- [x] **UX-02** P1 a11y — Focus ring 3px primary at 50% (orange on orange-red ground, < 3:1); header links get a 1px square browser ring on a rounded bar. → Two-tone ring (light inner + dark outer, or 100% primary + 2px offset) following the element radius.
- [ ] **UX-03** P2 a11y — No skip link (~55 Tabs to reach docs content).
- [x] **UX-04** P1 perf — 92–124 blur layers + always-animating aurora = 2–4× scroll cost. → LG-01 (blur only the control layer), `content-visibility: auto` off-screen, pause aurora while scrolling/off-screen; CI budget: ≤ 12 `backdrop-filter` elements in the initial viewport, frame-time budget (QA-06).
- [x] **UX-05** P2 bug — In dev, install commands read `http://localhost:3000/r/…` (`src/lib/site.ts:8` fallback) while the site runs on another port. → Derive from the request origin in dev (apps must work on any port).
- [x] **UX-06** P1 visual — Glass in glass in glass: block previews are glass panes holding glass cards holding glass lists/docks (`/docs/dashboard-01`, home "Small gains", `/themes` preview). The main reason it reads as 2021 glassmorphism. → Preview frames are an opaque/aurora ground, not a pane; blocks use material/fills (LG-01, STA-01).
- [ ] **UX-07** P2 copy — "Glassmorphic components" → reposition around Liquid Glass + material (GRO-02).
- [ ] **UX-08** P2 visual — Uppercase tracked group headers everywhere (sidebar, "ACCOUNT", menu "THURSDAY, OCT 8", "TYPE SPECIMEN") → title case. *(M0 done: grouped-list headers; left: sidebar, menus, overline)*

### Home
- [x] **UX-10** P0 bug — On a 390px phone the fixed palette bar is wider than the screen: the light/dark button sits at x = 498 (invisible), swatches clipped both sides, no labels, bar permanently covers ~80px. → Phone: one palette button opening a sheet (or scroll + edge fades, scheme button pinned in view).
- [ ] **UX-11** P1 ux — Home is 11,185px desktop / **19,359px phone**, repeating heatmap ×2, stats ×2, rings ×3, gauge ×2. → Hero → one composed app scene (liquid controls over real content) → controls → theme strip → gallery.
- [ ] **UX-12** P1 visual — Theme strip: Graphite switch white square on white track (state indistinguishable); Cherry crystal sharp "Skip"/"Keep" double outline looks like a stuck focus ring.
- [ ] **UX-13** P2 visual — Palette bar overlaps first card row at 1440×900; gallery last row one orphan tile; Glass tile's Subtle/Default/Strong look identical in dark; Recovery/Top habits cards stretch to neighbour height; demo data contradicts ("Kept 118%" vs "71% Kept").
- [ ] **UX-14** P2 visual — Phone charts: sleep-stage x labels overlap, readiness "90"/"100" collide, 39-week heatmap cells ≈ 5px, chat chips cut without fade. → Responsive tick thinning, min cell size / fewer weeks on phone, edge fades.
- [ ] **UX-15** P1 a11y — Unnamed controls: slider thumbs, table checkboxes; heatmap cells 8×8 tap targets.

### Docs
- [ ] **UX-20** P1 a11y — Switch demos: no accessible name (visible label not linked); slider and settings-01 thumbs unnamed. → Fix demos; Field (NEW-03) wires it.
- [ ] **UX-21** P1 visual — Light mode: white knobs vanish on near-white frost; Glass/Outline buttons disappear into the ground; Tinted/"Learn more" low-contrast orange. → Knob shadow + stronger track (ENG-25), legibility (UX-01).
- [ ] **UX-22** P2 visual — Segmented thumb flat 20% white with no shadow in dark; radius 8.4px inside 12px with 2px padding (concentric = 10px) (LG-08).
- [ ] **UX-23** P2 ux — `/docs` index: text-only equal-weight tiles → live mini previews.
- [ ] **UX-24** P2 a11y — Footer icon links 14×14 on phone; "Installation"/"Theming" pills 21px tall; auth "Forgot?" 42×16; data-table row checkboxes 18×18 (19 targets < 24px).
- [ ] **UX-25** P2 ux — Overlay demos float in mostly empty previews; full source dumped inline with no collapse; install commands cut on phone with no fade.
- [ ] **UX-26** P2 visual — Dialog shows ✕ *and* Cancel (iOS alerts have no ✕); 45% dim + 3px blur turns the page to mush. Sheet: right-side full-screen on phone (→ bottom sheet), 72% see-through at full height (Apple: opaque), plain 300ms ease-out (not the theme spring). Menus/popovers scale-fade 150ms instead of growing from the trigger; 36px rows.

### Theme Studio
- [ ] **UX-30** P1 bug — Phone: segmented control in the "Tonight's reflection" preview card clipped ("Didn't" cut).
- [ ] **UX-31** P1 ux — Phone: ~1,550px of controls before any preview; preview not sticky (STU-08).
- [ ] **UX-32** P1 visual — Preview ground near-black and flat → glass has nothing to frost, looks like dark cards. → Aurora/photo ground option (STU-09).
- [ ] **UX-33** P1 perf — Heaviest page: 124 blur layers, 3,486 elements, 23,930px tall on phone (STU-06).

### What already works
Ocean-liquid light settings screen is close to Apple-grade (grouped rows, shadowed white segmented thumb, one blue accent). Capsule controls, single accent, sliding indicators, inset sheet, correct menu origins, left-aligned dialog titles, dark-mode body text, matte material.

## 9. Docs site

- [x] **SITE-01** P0 bug — Every docs page ships every demo: `src/components/site/component-preview.tsx` is a client component that imports `src/components/demos/index.ts` (51 static imports). Live `/docs/kbd` = 1,427 KB JS, `/` = 1,258 KB. → Render `<Demo/>` on the server in `docs/[slug]/page.tsx` and pass it to `ComponentPreview` as `children` (tabs stay client). Done when: `/docs/kbd` < 250 KB JS, budget enforced in CI (QA-06).
- [x] **SITE-02** P0 gap — `sitemap.ts`, `robots.ts` missing (404 live). → Generate from `docs` registry list.
- [ ] **SITE-03** P1 gap — No search / ⌘K. → Command palette (built on the new `command` item, CMP-NEW) indexing items, guides, presets, fonts, tokens.
- [ ] **SITE-04** P1 gap — One demo per item. → `demos[slug]` becomes a list of named examples (variants, sizes, states, controlled, with icon, RTL, over-content). Button: 8 variants × 2 shapes × sizes.
- [ ] **SITE-05** P1 gap — 17/50 items have no props table (input, textarea, label, slider, progress, kbd, separator, dialog, popover, tooltip, dropdown-menu, toaster, all 5 blocks). → Generate props from TypeScript in `scripts/generate.mjs` (react-docgen-typescript / ts-morph); keep `PROPS` for descriptions only. Test: every item has a props table.
- [ ] **SITE-06** P1 gap — No Apple-style guidance. → `guidance: { do, dont }` per item rendered as two cards (Dock 3–5 items; Sheet vs Dialog; never liquid on liquid; clear needs a dim; one prominent action). Differentiator — no competitor has it.
- [ ] **SITE-07** P1 gap — No keyboard table or a11y section. → `keyboard: [{ keys, action }]` per interactive item + "Accessibility" block (legibility score, reduced motion/transparency behaviour, fallback).
- [ ] **SITE-08** P1 gap — No `/blocks` page. → Iframe previews with desktop/tablet/phone toggle + copy CLI, like shadcn.
- [ ] **SITE-09** P1 gap — No "Migrating from shadcn/ui" page. → Import swap, behaviour differences (pill default, solid default button), token mapping (`--radius`, `--primary`), mixing both, codemod script.
- [ ] **SITE-10** P1 bug — `docs/installation/page.tsx` says "six" palettes (12) and "three commands" (4 steps); code blocks are hand-escaped `<pre>` without Shiki. Same copy in `src/lib/og/pages.ts`. README says 50 primitives (68); spec "Foundations (v1 notes)" lists 6 palettes; theming says "eleven groups" (10). → Generate counts from the engine; delete stale sections.
- [ ] **SITE-11** P1 bug — Install page claims Vite / React Router / Astro / TanStack Start but `verify-install` only scaffolds Next; font items use `next/font`. → Framework matrix in verify (DX-05) or narrow the claim; document fonts outside Next.
- [ ] **SITE-12** P1 gap — Changelog page + "Updated" badges (DX-02).
- [ ] **SITE-13** P1 growth — Metadata never says "Liquid Glass". → Titles like "Liquid Glass Button for shadcn/ui · glasscn"; hero copy — only once LG-01..03 ship so the claim is true.
- [ ] **SITE-14** P1 perf — Home renders 5 blocks + ~15 demos + gallery; 302 KB HTML, 36+ panes. → `content-visibility: auto` + mount-on-visible for below-fold sections; pause aurora off-screen. *(M0 left: home + /themes still load every demo (gallery/studio import the full demos list))*
- [ ] **SITE-15** P2 gap — No right-rail TOC or heading anchors on item pages.
- [ ] **SITE-16** P2 bug — Top nav "Components" active only on `/docs/button`; "Docs" only on `/docs` + installation. → Active for any `/docs/[slug]`; add `/docs/components` index.
- [ ] **SITE-17** P2 improve — Theme toggle can't return to "system". → Three-way system/light/dark.
- [ ] **SITE-18** P2 improve — Package-manager tab choice not remembered across `InstallCommand`s/reloads. → Shared context + localStorage.
- [ ] **SITE-19** P2 gap — Per-item playground: knobs for variant/size/intensity + 5–6 relevant primitives inside `ThemeScope`, code updates live (reuse studio `token-control.tsx`).
- [ ] **SITE-20** P2 gap — "Open in v0" for each ui/block item.
- [ ] **SITE-21** P2 gap — Preview-scoped theme switcher (palette/material/scheme per preview, not only global).
- [ ] **SITE-22** P2 gap — Publish `docs/rules/performance.md` and accessibility rules as `/docs/performance`, `/docs/accessibility` (with an accessibility statement — a positioning asset).
- [ ] **SITE-23** P2 gap — Theming "recipes": brand colour → palette, dark-only app, low-end devices, per-route themes.
- [ ] **SITE-24** P2 gap — JSON-LD (`WebSite` + SearchAction, `SoftwareSourceCode`, per-item `TechArticle`).
- [ ] **SITE-25** P2 cleanup — `public/` boilerplate SVGs (`file`, `globe`, `next`, `vercel`, `window`); add `icon.svg`, `apple-icon`, `manifest.webmanifest`.
- [ ] **SITE-26** P2 docs — `docs/og-images.md` says PNG; `src/lib/og/render.tsx:20` emits JPEG.
- [ ] **SITE-27** P2 improve — Footer Discord link points to a personal profile. → Community server or remove.
- [ ] **SITE-28** P2 docs — `bar-list`, `heatmap` take `onSelect` without `"use client"` → document "interactive use needs a client parent" or split server visual + client wrapper.
- [ ] **SITE-29** P2 improve — Sidebar group labels uppercase → title case (matches LG study §1.4).
- [ ] **SITE-30** P2 gap — RSC-safe and bundle-size badges per item (DX-07).

## 10. Distribution and developer experience

- [x] **DX-01** P0 growth — **Name collision**: `@glasscn` in the shadcn registry directory (`ui.shadcn.com/r/registries.json`) belongs to kostyniuk/glasscn-components; three other "glasscn" repos exist (itsjavi/glasscn-ui 99★, TheOrcDev/glasscn-ui). → Decide: negotiate, namespace variant (`@glasscn-app`), or rename the product. Blocks directory listing (GRO-01). *Your call.*
- [ ] **DX-02** P1 gap — No versioning: no tags, no CHANGELOG, `/r/<name>.json` always latest, package 0.1.0. → Changesets (or tag workflow) → changelog + git tag + snapshot `/r/v{n}/{name}.json`; `/r/{name}.json` = latest; written breaking-change policy (prop/token rename, default change).
- [ ] **DX-03** P1 gap — Registry npm deps unpinned (`radix-ui`, `@tanstack/react-table`, `@tanstack/charts`, `lucide-react`, `sonner`, `expo-glass-effect`…). → `pkg@^x` ranges in `registry/items.mjs`; CI installs both pinned and latest.
- [ ] **DX-04** P1 gap — **Base UI**: shadcn's default since July 2026; we are Radix-only and verify with `--base radix`. → Base UI variants of Radix-backed items (or a `base` build of each), verify both.
- [ ] **DX-05** P1 gap — verify-install matrix: Next, Vite, React Router 7, TanStack Start, Astro + React.
- [ ] **DX-06** P1 improve — Namespace-first install: hero uses `@glasscn/…`; registry deps as `@glasscn/x` rather than absolute URLs; set the registry-item `docs` field for post-install hints (`glass-style`: "put `<Aurora/>` in your root layout").
- [ ] **DX-07** P2 gap — Per-item bundle size computed at build (esbuild + gzip), shown as a badge.
- [ ] **DX-08** P2 gap — RTL: ~40 physical classes (`ml/mr/pl/pr/left/right`), 2 logical, 0 `rtl:`; sliding indicator and switch thumb translate wrong in RTL. → Logical properties everywhere, RTL-aware indicator, `dir="rtl"` demo toggle, test.
- [ ] **DX-09** P2 gap — Repo hygiene: CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue templates (ask browser/palette/material/scheme), PR template, renovate/dependabot, FUNDING.
- [ ] **DX-10** P2 gap — Release workflow (Changesets action → bump, changelog, tag, `/r/v{n}` snapshot), replacing the manual `ship-registry` checklist steps.
- [ ] **DX-11** P2 gap — Analytics: privacy-friendly page analytics + count `/r/*.json` fetches → "installs" metric per item.
- [ ] **DX-12** P2 docs — State Tailwind v4-only explicitly on installation.
- [ ] **DX-13** P2 improve — Consumer lint: ESLint plugin / `glasscn check` flagging hex colours, fixed radii, `bg-white`, glass-in-glass, liquid-on-liquid in user code.

## 11. Agents and AI surfaces

- [x] **AGT-01** P0 gap — `/llms.txt`, `/llms-full.txt` (404 live). → Generate at build from docs, props, rules, guidance.
- [ ] **AGT-02** P1 gap — `/docs/<slug>.md` (text/markdown) + "Copy page" button.
- [ ] **AGT-03** P1 gap — `use-glasscn` skill never reaches consumers. → Ship as `registry:file` targeting `.claude/skills/use-glasscn/SKILL.md` and `.agents/skills/…` (`shadcn add @glasscn/skill`) + `npx skills add`; move contributor skills (`build-glass-component`, `extend-theme`, `ship-registry`, `port-to-native`) to a separate dir.
- [ ] **AGT-04** P1 gap — "AI agents" docs page: copyable consumer AGENTS.md block, shadcn MCP setup with `@glasscn`, llms links, skill install.
- [x] **AGT-05** P1 rebuild — Rewrite `use-glasscn` rules for the material/liquid split *first* when LG-01 lands (agents copy rules literally; today it says "cards are glass, two levels max").
- [ ] **AGT-06** P2 gap — `@glasscn/mcp` with theme tools (`create_theme(hue, material, …)` → studio code → `/r/theme/<code>`, `check_legibility`) — unique; nobody else has an engine to expose.
- [ ] **AGT-07** P2 gap — 3–4 full screens as `registry:example` items (app shell, settings, dashboard, media) that agents install and edit.
- [ ] **AGT-08** P2 gap — `shadcn create` / `preset` / `apply` support: ship palette+material+shape+type bundles in the format those commands accept (verify against the shadcn changelog first).

## 12. Growth and product

- [ ] **GRO-01** P0 growth — List `@glasscn-app` in the shadcn registry directory (PR to shadcn-ui/ui). Outward-facing: needs your OK to open.
- [ ] **GRO-09** P1 growth — Publish under the `@glasscn` npm scope we own: `@glasscn/theme` (the engine, for non-shadcn users and the native token export), `@glasscn/mcp` (AGT-06), `@glasscn/eslint-plugin` (DX-13). Keeps the name ours in the npm namespace.
- [ ] **GRO-02** P1 positioning — Lead with what nobody else has: theme engine + web and native twins from one API + shadcn install + accessibility. Target **iOS 27** (darkened edge, clarity slider) while competitors still say iOS 26. Be honest about refraction (Chromium layer, frosted elsewhere).
- [ ] **GRO-03** P1 gap — App starters: Next app (dashboard + settings + auth + chat) and Expo app with the same screens; GitHub templates with "Deploy to Vercel".
- [ ] **GRO-04** P2 gap — `/themes/gallery`: curated + community theme codes, each with install command and theme-rendered OG image (growth loop: every shared theme is a backlink).
- [ ] **GRO-05** P2 gap — Figma kit: variables generated from `TOKENS` (modes for palette × scheme) + core components. No web competitor ships one.
- [ ] **GRO-06** P2 growth — ~~Pro tier~~ **Decided: everything free.** App templates, showcase blocks (control center, media player, onboarding, pricing) and the Figma kit ship MIT; GitHub Sponsors + `FUNDING.yml`.
- [ ] **GRO-07** P2 gap — CJK/i18n type preset (washiveil ships CJK stacks).
- [ ] **GRO-08** P2 gap — Optional WebGPU/WebGL refraction adapter item (liquidGL-style) for hero elements so refraction works in every browser.

### Competitive landscape (Oct 2026)

| Name | Technique | Better than us at | Weaker at |
|---|---|---|---|
| liquefy-ui | WebGL-generated maps → SVG displacement in `backdrop-filter`, pointer-velocity springs | Real refraction; MCP server, llms.txt, per-component .md; Base UI; in directory | Chromium-only lens; 39 items; no engine |
| opaline | Snell's-law SVG displacement | Apple showpieces (control center, widgets, knob, player) | Chromium-only; no theming/native |
| pane | SVG displacement + aberration, Chromium-gated | `use-glass-support` / `use-glass-pointer` hooks | 20 items |
| glass-ui (crenspire) | blur + glow | 49 items, broad shadcn parity | No refraction/engine; stale |
| glasscn-components (kostyniuk) | Base UI, one Chromium lens item | Owns `@glasscn`; playground | Blur only; no engine/native |
| washiveil | CSS veils over WebGL light field | 58 items, WCAG 2.2 AA statement, CJK type | No refraction; one aesthetic |
| liquid-glass-react | SVG displacement | 6.4k★ mindshare; elasticity, aberration | One wrapper; dormant since Jun 2025 |
| liquidGL v3 | WebGPU → WebGL, own rasteriser | Refracts in every browser, incl. video | Vanilla JS; fixed position; licence unclear |
| Konsta UI v5.2 | backdrop-filter, iOS 26 anatomy | React/Svelte/Vue; full app chrome | No shadcn/engine/refraction |
| Framework7 v9 | CSS iOS 26 | Full mobile framework | Not shadcn; heavy |
| @rdlabo/ionic-theme-ios27 | CSS + native UIKit shell | Already iOS 27 | Ionic-only |
| expo-glass-effect / @callstack/liquid-glass / @expo/ui | Native glass | Real glass, container merging | Primitives only — our native twins fill this |
| Aceternity / Magic UI | — | Audience | No glass items — open lane |

## 13. Quality: tests, lint, CI

- [x] **QA-01** P0 test — **Legibility matrix** across PALETTES × MATERIALS × schemes (× clarity): body ≥ 4.5, muted ≥ 4.5, accent label ≥ 4.5, accent & ring vs ground ≥ 3, chart min ΔE under CVD. Fails today (Dusk, smoked) — fix ENG-02/03/07 with it.
- [x] **QA-02** P1 test — Playwright + axe on `/docs/*`, `/themes`, blocks (light/dark × matte/smoked).
- [x] **QA-03** P1 test — Visual regression (`toHaveScreenshot`) on docs previews × 3 palettes × 2 schemes × {shape-square, density-compact} — reuse `video/capture.mjs`. *(M2: curated set, Chromium baselines)*
- [x] **QA-04** P1 test — Component tests (vitest + jsdom/RTL): controlled/uncontrolled, keyboard, ARIA roles/states, ref composition, Tooltip without provider, GroupedList asChild roles, Dock links.
- [x] **QA-05** P1 lint — Token rules enforced (custom ESLint rule or vitest scan of `src/components/{glass,blocks}`): ban `bg-white|black`, `text-white`, hex, `bg-zinc-*`, `rounded-[…]`, `h-[Npx]`, raw `backdrop-blur`, `tabular-nums`, `outline-none` without visible focus, self-referencing custom props, physical `ml/mr/pl/pr/left/right` (RTL); require `data-slot` per exported part.
- [ ] **QA-06** P1 ci — CI adds: `next build` of the site, `git diff --exit-code` on generated files, JS/CSS size budgets, Lighthouse (LCP/TBT) on `/`, `/docs/button`, `/themes`, framework install matrix (DX-05), pinned + latest deps (DX-03).
- [ ] **QA-07** P1 test — Studio e2e: share-link round trip, apply-to-site survives reload, export → `shadcn add` from `/r/theme/<code>`.
- [x] **QA-08** P1 test — Engine: ThemeScope CSS (partial props, forced scheme), sanitizer cases (`/*`, ranges, `var()`), decode back-compat fixtures, gamut, tint cycle, generated CSS parsed with lightningcss.
- [x] **QA-09** P1 test — Browser matrix (Chromium, WebKit, Firefox) for liquid surfaces; refraction must degrade to frost.
- [ ] **QA-10** P1 test — Native: NAT-50..54.

---

## Appendix — sources

Audit reports and measurements (screenshots, contrast JSON, perf scripts) were produced in the session scratchpad and are summarised above; Apple sources are cited in [`liquid-glass.md`](liquid-glass.md) and [`apple-hig-reference.md`](apple-hig-reference.md); market sources in §12.
