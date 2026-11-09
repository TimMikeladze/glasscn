# Changelog

Registry items are copied into your app, so re-run `npx shadcn add @glasscn-app/<item>` to pick up a change. IDs refer to [`docs/roadmap.md`](docs/roadmap.md).

## Unreleased — Apple Liquid Glass 27 rebuild (2026-11-08)

### Breaking

- System palette values follow iOS/macOS 27 (`#0088FF` systemBlue, `#FF383C` systemRed and the rest of the HIG table) on native iOS; the web uses Apple's web blue `#0071E3` so white labels pass AA. Filled and prominent button labels are semibold. Labels use achromatic `oklch(… none)` so accent ink mixes keep the accent's hue. The web clarity slider's clear end keeps half the frost. Prose blockquotes, Markdown alerts and the native Blockquote drop their accent rail.
- Apple's system appearance is the default everywhere: the new `system` palette (systemBlue accent, `#F2F2F7`/black grounds, system colours as chart series, no aurora), the System type preset (San Francisco) and neutral frost, labels, fills and shadows. Dusk is now one palette among thirteen; the docs site, showcase, Studio and native sandbox all start in System and follow the OS light/dark setting.
- Native Liquid Glass starts untinted with automatic system appearance. Explicit tint/scheme overrides remain available; `visible` hides the whole surface, while `materialized` controls its effect lifecycle. `GText`/`GIcon` use dynamic semantic foregrounds inside system glass.
- Clear glass no longer dims its own backdrop. Place a separate dim behind controls over bright media; omit it for dark media or an already-dimmed player. `Card` accepts content materials, not Liquid Glass variants (LG-01).
- Mac/iPad-style sidebars now meet container edges and use accent-colored symbols. Automatic scroll edges have a continuous diffuse treatment, including the uniform scrolled toolbar top (NAV-02/04).
- Components import the shipped, configured `glass-cn` helper so themed radius and spacing overrides merge correctly in both this site and shadcn-installed apps.
- The showcase scenes follow Apple's layouts on both tracks ([independent review](docs/research/independent-ui-ux-review.md)): Photos (Share | Favorite·Info | Delete, photo undimmed outside the control bands), Music (tabs leading, Search trailing, minimized tab → accessory → search), Mail (split view, back chevrons, compose in the bottom toolbar), Notes (symbol bar items, tinted Done, plain document, Aa format sheet), Maps (search in the bottom card on iPhone, leading column on iPad), Safari (Back, domain-only capsule, More; a small pill when collapsed), Search (one field and scope bar, recents list). Labels, test IDs and some accessible names changed.
- Liquid Glass surfaces lose the uniform white hairline; their edge is the two-sided specular/edge-shade rim. Increase Contrast, Show control borders and forced colours still draw a solid border.
- `ToolbarCommands` shows a command's icon or its label, not both. Filled and prominent buttons drop the coloured glow on both tracks.
- Native iOS text sizes are Apple's text-style defaults (Body 17, Subheadline 15, Large Title 34…) instead of the web's 1.25 scale. Native `ScrollEdge` variants are gradients that fade out at their inner end.
- Overlay transition helpers now ship as `glass-transitions`; `glass-morph` names the new identified sibling component. Native system Button actions use explicit eventless `onAction`; RN `onPress` keeps its event through the custom path. Native `LiquidGlass` no longer accepts ineffective browser-only `optics`/`followLight` props.

### Added

- `GlassEffects`, `LiquidGlass` and `GlassCluster`: bounded Chromium edge refraction, pointer illumination and sibling split/merge, with complete CSS materials in Safari/Firefox. Native uses the actual OS glass renderer and sibling effect container (LG-14/16).
- Installable `liquid-glass-01` / `native-liquid-glass-01` with Photos, Music, Maps, Safari, Mail and expandable controls; the source-linked `/showcase` includes material and merging labs. [Research and audits](docs/research/apple-liquid-glass-2026-11.md) distinguish Apple requirements from glasscn tuning.
- Separate clear-blur, refraction and bezel primitives; Reduce bright effects preference; direct-surface transparency/contrast overrides that remain effective inside scoped themes.
- `liquid-glass-02` / `native-liquid-glass-02`: Landmarks, Notes, Search and Materials extend the showcase to ten scenes. Both tracks gain `GlassMorph`, image-only `BackgroundExtension`, prioritized/pinned `ToolbarCommands`, removable SearchField tokens and four named standard material tiers. The [55-case parity matrix](docs/research/apple-liquid-glass-parity-matrix.md) separates system delegation, custom compositions, browser approximations and unavailable APIs.
- Locally derived regular-glass depth, inactive-window web treatment and Show control borders. New theme primitives bring the engine to 109 tokens.
- `ActionSheet placement="source"` (web): the choices open beside their trigger with no scrim and no Cancel, and the rest of the page stays usable. A tap outside or Escape cancels. This is the iOS 27 sheet with a source; the default `"sheet"` placement keeps Cancel and the scrim.

### Fixed

- Header: icons share one painted size (brand marks were larger or smaller than the lucide glyphs). The bar collapses by its own width in rem instead of viewport breakpoints, so the six links show at 1024px and enlarged text collapses it before anything leaves the bar; palette and glass settings also sit in the Menu sheet (UX3-W08, W15).
- Text at 200%: the home hero, showcase intro and Studio no longer scroll sideways; Music, Photos, Controls, Search and Materials keep their bars inside the scene (Music collapses its bar and Controls shows tool symbols when the frame is narrow in rem) (UX3-W08).
- Landmarks: sidebar and inspector are regular glass again, so the background extension shows through both; the card row scrolls under both; inspector text uses the primary label. The extension's own blur is a third of the glass blur, and its docs demo has sidebar and inspector chrome (UX3-W03, W04).
- Notes: the Format sheet hides the tools that opened it; typing within a second is one undo step and format changes are undoable (UX3-W05, W12).
- Music: every Browse category leads to its tracks; the decorative ellipsis on song rows is gone. Mail compose opens with the cursor in To. Photos' third photo has one name (UX3-W06, W10, W11, W18).
- Materials: over dark content the material tiles take the dark scheme's labels (UX3-W07).
- Larger regular glass casts a deeper shadow, and depth now starts at control size (UX3-W09). Clear glass fills continuously with the clarity slider; only the label palette switches, at 0.65 (UX3-W17).
- Search predictions use the thick tier; Maps' leading sheet is inset on every side at regular width; Studio's density options are title-cased and the counter reports preset changes (UX3-W19, W20, H02).
- Forced colours (Windows High Contrast) erased switches, segmented selections, tab pills and slider tracks, which are drawn only with fills. They now get `ButtonText` edges and a `Highlight` state (UX3-W01).
- Destructive choices in action sheets, dropdown menus and context menus read as red: `text-destructive-label` mixes the destructive colour with the label by the new `glass-ink-strength` primitive (75% light, 60% dark, 20% on smoked glass in the light scheme), which holds 4.5:1 on liquid glass for every palette × material. The action-sheet demo puts Delete first, as Apple does (UX3-W02). Text buttons (`Button variant="link"`, SearchField's Cancel) use `text-primary-label` from the same primitive, so they read as the accent instead of near-black (UX3-W14).
- Native: the thumbless `progress` slider is back in the accessibility tree (its adjustable element spans the slider instead of a 0×0 knob); the system Switch and the iOS segmented control pass their label to the SwiftUI control VoiceOver reads (UX3-N01, UX3-N16).
- Native showcase: Maps' search card rides the keyboard; Safari's address shows one line of text at rest and becomes a single-line field only while editing (UX3-N02, UX3-N04).
- Menus, popovers, selects, dialogs, alert dialogs, sheets, action sheets and confirmation popovers seemed to open twice: after the morph from the trigger finished, clearing `data-morphing` restarted the content's CSS entry animation from opacity 0. `useGlassPresentation` now ends those animations before the next frame.
- `GlassCluster`'s shared glass trailed moving items by a frame or more (Landmarks badges, `GlassMorph` reorders): the union was a data-URL SVG mask set through React state, which decodes asynchronously. The outline is now traced in script and written into inline SVG masks in the frame it is measured. The surface's `data-shapes` attribute lists the measured item boxes.
- Destructive action-sheet rows rendered in the accent ink on liquid glass: the inactive-window rule for `text-primary-ink` was unlayered CSS and beat every utility. The dimming now lives in `--color-primary-ink` (through `--glass-ink-active`, set only on glass), so `text-destructive-ink` and other overrides apply again.
- Radix parts on the docs site (tabs, sliders, menus) follow `<html dir>`; Music's tabs mirror in right-to-left.
- Native sandbox: a deep link's forced Reduce Motion or Reduce Transparency no longer survives later links that omit it; the preset rows' reset chip is "unset", so density and type no longer show two "default" chips.
- `/themes` opened 7,500–14,000 px down the page: cmdk scrolled its selected row into view with the window. Command rows now scroll only their list.
- Hydration mismatch on `/`: `GlassEffects` waits for React to hydrate a node before enhancing it.
- Showcase sheets presented over the docs page; `SheetContent container` presents them inside their scene.
- Native system menu triggers had no VoiceOver name; native `GlassEffectGroup` ignored a forced scheme; the minimized native Dock put the accessory first.
- Site header trailing controls use one size, glyph size and tone.
- Scoped portal theme inheritance; real source-position transitions and interrupted transition cleanup; hidden sidebar focus; adaptive shadows; scroll minimization and full-height sheet anchoring (LG-06/11, NAV-02, SHT-01/02).
- Native system sheet detent routing, menu callback paths, effect visibility, fading ancestors, semantic vibrancy and Dynamic Type. Custom gestures stay on the UI thread and recover when a controlled parent rejects repeated changes; minimized/search Dock layouts stay bounded.
- Next and its ESLint configuration are patched to 16.4.5 so fresh consumer builds pass the framework's security check.
- Clear-label contrast at opaque clarity, live scoped style-text optics, child-only/paused geometry tracking, centered/scaled identity motion, exit glass bounds and live Reduce Motion cleanup. Native sheets now use supported iOS detents/nonmodal interaction, preserve repeated controlled rejections and keep real Button anchors functional; semantic GText ramps prevent clipping at the largest accessibility sizes.
- Landing/Studio width from 320–1440 px: the header switches to a complete compact menu before desktop links overflow, and Studio's preview column can shrink.
- ActionSheet allows passive outside/Escape dismissal on web. Supported plain uncontrolled iOS choices use an actual source-attached system confirmation dialog; explicit eventful/custom choices and Cancel callbacks retain the custom presentation without duplicate close notifications.

## Unreleased — M4 native rebuild (2026-10-11)

### Breaking (native)
- `native-tokens` is generated from the web theme (`tokens.generated.ts`): 12 palettes, every material/shape/motion/density/type preset, increased-contrast overrides. `GlassTheme` gained the label tiers and status colours; `foreground` is the on-glass label. `GlassThemeProvider` takes presets and merges with its parent.
- `Glass` defaults to `variant="material"` (a system material, never Liquid Glass); pass `variant="liquid"` (or `interactive`) for the control layer.
- `Press` no longer dims by default; haptics fire on press, not press-in. Native items now need `react-native-reanimated` and `react-native-gesture-handler` (wrap the app in `GestureHandlerRootView`) and, for dialogs/sheets/chat, `react-native-keyboard-controller` (`KeyboardProvider`).
- Custom charts: `ChartFrame.focused` / `hit` replaced by `targets`, `tooltip`, `dots`.

### Added (native)
- `native-a11y` (live Reduce Motion / Transparency, Increase Contrast, Bold Text, `announce()`, 44pt `hitSlop`), `native-toast-store`, `native-tabs-layout` (NativeTabs recipe), `GlassBlurTarget` (Android blur tier), `GlassEffectGroup`, `haptics` / `setHapticsEnabled`.
- `@expo/ui` system controls first: switch, slider, segmented control, date picker, dropdown/context menus, bottom sheet — `native={false}` for the glass version.
- Sheet detents, grabber, drag-to-dismiss; dock drag-to-scrub; navigation bar follows scroll; confirmation popover → action sheet on phones; toasts above modals and announced; keyboard-aware dialogs and chat composer; FlashList chat; accessible, Reanimated charts with "view as table"; activity rings rebuilt; backdrop video; demos for every native item.
- Tests: vitest (chart maths, token parity, a11y helpers), jest-expo component + structural suites (also run by `verify:native`), Maestro flows.

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
