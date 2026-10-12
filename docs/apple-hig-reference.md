# Apple HIG component reference for glasscn

The implementable parts of Apple's Human Interface Guidelines (iOS/macOS 26–27, Liquid Glass era), per component, for building and reviewing glasscn items. Companion to [`liquid-glass.md`](liquid-glass.md) (paradigm, material, layers) and the backlog in [`roadmap.md`](roadmap.md). Each HIG page lives at `developer.apple.com/design/human-interface-guidelines/<slug>` (slug in brackets). Fetched 2026-10-11. ⚠ = not stated by Apple / unverified.

> The HIG publishes almost no point sizes for iOS controls. It describes roles and behaviour. Exact metrics (switch, tab bar, toolbar buttons) live only in Apple's **iOS/iPadOS 27 and macOS 27 Figma kits** (shipped 2026-09-17). Measure there before hard-coding a size token.

## New since the study

- `ControlSize.extraLarge` "resolves to `.large` on platforms other than visionOS", so an `xl` control is our own choice, not Apple parity.
- Scroll edge default (June 2026): prefer the **automatic** style, which is more opaque for top toolbars with many controls, text outside glass controls, and pinned headers; test `soft` for legibility.
- **iPhone Duo** (Sept 2026): on the outer display and inner landscape, toolbars, tab bars and status bar move to the side edge. Order: navigation (Back/Close) top, prominent action (Done), then groups; overflow bottom-to-top by visibility priority; every toolbar item needs a title *and* a symbol. [designing-for-iphone-duo]
- SF Symbols is now versioned "SF Symbols 27"; Icon Composer 2. No 2026 Swift Charts changes (last: `Chart3D`, `SurfacePlot`, June 2025).

## Controls

**Buttons** [buttons]: Hit region ≥ 44×44 pt. Roles: normal, primary (accent, answers Return), cancel, destructive (system red). Custom buttons **always** need a press state. An activity indicator may replace the image while working, with an optional label swap ("Checkout" → "Checking out…"). Prominent style puts the accent on the *background*; **1–2 prominent per view**; show preference by style, not size; keep labels monochrome over colourful content. White fill + black glyph is reserved for "toggled on". Labels: title case, start with a verb. Don't make a destructive action primary; don't mix sizes within a set of choices.

**Toggles** [toggles]: iOS switch only in list rows (the row is the label); outside lists use a toggle *button* whose background changes. Default on-colour green; accent only if on/off contrast holds. Mac: mini switch for child rows; checkbox has on/off/**mixed**; radio buttons for 2–5 options (more → pop-up). Never colour alone: change fill, shape, checkmark or dot.

**Sliders** [sliders]: Track, fill from minimum to thumb, optional min/max icons; minimum leading (or bottom). Live feedback while dragging; label only min/max ticks unless non-linear; value tooltip on hover; circular slider for wrapping values (0–360°). Pair with a field + stepper for precision. A11y: label, value, adjustable trait; throttle announcements ~0.3 s; 2D pads use four custom actions. Thumb turns glass while dragged.

**Steppers** [steppers]: Two segments, no value of their own; always beside a field showing the value. Shift-click ×10 on Mac.

**Segmented controls** [segmented-controls]: Equal-width segments; ≤ ~5 on iPhone (5–7 wide); text **or** images, never mixed; title-case nouns; no intro label on iOS. Modes: single, multi (Mac), momentary (actions), never mixed. On iOS for closely related subviews (app sections → tab bar); on Mac for toolbars/inspectors (window body → tab view), each segment with a tooltip.

**Pickers** [pickers]: iOS date styles: compact (button showing value in accent, opens a modal calendar), inline, wheels, automatic. Modes: date, time, date+time, countdown (≤ 23h59m, not inline/compact). Minute intervals divide 60. Show in context (below field / popover), never by switching views. Selection haptics.

**Pop-up button** [pop-up-buttons]: Flat list of mutually exclusive options; shows the current choice; sensible default; "Custom…" allowed; no submenus, multi-select or actions.

**Pull-down button** [pull-down-buttons]: Commands related to the button (Add ▸, Sort ▸); ≥ 3 items; destructive in red, confirmed by an action sheet (iPhone) or popover (iPad); icons after the label; "More" (ellipsis) for overflow. Don't hide primary actions in one.

**Text fields** [text-fields]: Placeholder plus a persistent label; secure field for secrets; width matches expected input; validate on blur; locale-aware number formatting; iOS **Clear button trailing**; leading image shows purpose, trailing adds function; right keyboard type. Labels use the four label colours; make useful text selectable.

**Search fields** [search-fields]: Leading magnifier, placeholder, Clear once typed; iOS adds Cancel while focused. Glass in a toolbar, plain inside content. iOS placement, in order of preference: bottom toolbar (adapts width to 1 leading + 1 trailing item, or a button expanding to a field; rides above the keyboard) → top toolbar → search tab (standard landing page, or button/prominent tab that focuses immediately) → inline under the title for scoped search. iPad/Mac: trailing end of the toolbar (collapses to a button), top of sidebar to filter it, or a sidebar item. Search as you type; recent searches (removable); few predictive suggestions styled distinctly; scope bar starts broad; tokens inline (don't replace visible filters); empty state shows the query.

**Token field / combo box** (Mac): Comma makes a token; tokens draggable with context menus. Combo box = field + pull-down; custom values not added to the list; label ends with a colon.

**Page controls** [page-controls]: Equal dots, solid current page, centred at bottom; ≤ ~10 dots (edge dots shrink on overflow); tap side for next/prev; scrub by dragging (past the ends jumps to first/last; no page animation while scrubbing). Backgrounds: automatic (translucent only during interaction), prominent (always), minimal (never, and then no scrubbing). ≤ 2 custom indicator kinds; no custom colours.

**Disclosure** [disclosure-controls]: Triangle points trailing when closed, down when open, with a descriptive label. Disclosure button points down when hidden, up when shown; one per view.

**Progress / loading / gauges** [progress-indicators, loading, gauges]: Determinate bar (leading → trailing) or ring (clockwise); indeterminate spinner. Prefer determinate; switch indeterminate → determinate when possible; **never switch spinner ↔ bar**; keep pace even; no vague "Loading…"; offer Cancel (+ Pause if cancelling loses work). Show placeholder content immediately. Gauges: circular or linear; *standard* (indicator at value), *capacity* (fill to value), *accessory*; label value and both ends; gradient may encode meaning. Mac level indicator: continuous or discrete segments, green default, rating and relevance styles.

**Colour wells** [color-wells]: Prefer the system picker; highlight when active; drag between wells.

## Menus and presentations

**Menus** [menus]: Title case, verb first, no articles, "…" when more input follows. Unavailable items dimmed (menu still opens). **All items in a group get an icon or none do**; standard symbols for standard actions. Most frequent first; separators between groups; **submenus: one level, ≤ ~5 items**, chevron after the label. Toggled items: changeable label (Show/Hide) or checkmark. iOS `preferredElementSize`: small = top row of 4 icons, medium = 3 icon + short label, large = full list. Menu morphs from its button.

**Context menus** [context-menus]: Short, ≤ ~3 groups, one submenu level; **hide** unavailable items; no shortcuts; destructive **last**, red; most-used nearest the finger (order may flip); every item also reachable elsewhere. iOS preview animates out of the content over a dim; match clip path to preview radius. Context menu *or* edit menu per item, never both.

**Edit menus** [edit-menus]: iOS: compact horizontal bar with a pointer; chevron expands to a vertical menu. iPad: touch → bar, pointer/keyboard → vertical menu. Custom commands after related system ones.

**Popovers** [popovers]: Arrow points at the source; don't cover it; small content sized to fit; **animate size changes**; dismiss by tapping outside or selecting (stay open for multi-select); **auto-save on dismiss**, discard only on Cancel; one at a time, never cascade; nothing over a popover except an alert; never for warnings; in compact width use a sheet. Regular glass.

**Sheets** [sheets]: Grabber, title toolbar; iOS: **Cancel leading, Done trailing**; always pair Done with Cancel or Back; **never Cancel + Done + Back together**; Back never dismisses. Detents: `large`, `medium` (≈ half), custom; grabber shows resizability, **cycles detents on tap**, VoiceOver-operable; swipe down dismisses (confirm with an action sheet if unsaved). One sheet at a time. Non-modal sheets may act on the parent (Notes formatting). Mac: card attached to the window, which dims.

**Alerts** [alerts]: Title ≤ 2 lines (sentence case with punctuation if a sentence; title case otherwise); optional message and field; **≤ 3 buttons**. Buttons: 1–2 word verbs, sentence case; "OK" only for purely informational; always "Cancel". **Default trailing (row) or top (stack); Cancel leading/bottom**; destructive style only when the user didn't deliberately choose it; never make Cancel the default; Esc and ⌘. cancel. No alerts at launch, for undoable deletes, or for information only.

**Action sheets** [action-sheets]: Choices tied to an action the user started; single-line title; **destructive top, Cancel bottom**; no scrolling.

**Activity view (share)** [activity-views]: Sheet or popover from the Share button (`square.and.arrow.up`) only; app actions first; short verb titles, no brand.

**Notifications** [notifications]: Title-case title, no punctuation or app name; body in sentences; ≤ 4 actions; badge = unread count only, never imitated.

**Feedback / onboarding** [feedback, onboarding]: Multimodal (colour, text, sound, haptic); status inline; alerts only for critical; confirm only significant successes. Onboarding interactive, brief, optional; prefer contextual tips; ask for ratings later.

## Navigation and structure

**Tab bars** [tab-bars]: Navigation, not actions; always visible except under a modal; avoid "More"; **never disable or hide tabs** (explain empty states); single-word labels; **filled** symbols; compact = icon over label, regular = side by side; badge = red oval with white number or "!", critical only; monochrome bar over colourful content. iOS: floating glass, minimises with its accessory on scroll down, restored by tapping a tab or scrolling to top; trailing search tab. iPad: top, optionally sidebar-adaptable. ⚠ iOS 26 bar ≈ 62 pt inside an 83 pt container, icons 26×26 (third-party measurements).

**Tab views** (Mac) [tab-views]: Tabs on the top edge of an inset pane; ≤ 6; title-case nouns. iOS uses a segmented control instead.

**Toolbars / navigation bars** [toolbars]: Title < 15 characters, never the app name; Back/Close as **symbols, never text**. Zones: leading (back, sidebar toggle, title; not customisable), centre (customisable; collapses to overflow), trailing (always visible: inspectors, search, More, primary). **≤ 3 groups**; borderless symbols (no circled glyphs); **one `.prominent` action, trailing**; no custom overflow menu on Mac/iPad; use a scroll edge, not custom backgrounds; custom parts **concentric** with the bar corners; iOS large title collapses on scroll. Mac: every toolbar item also in the menu bar.

**Sidebars** [sidebars]: Float on glass; content extends beneath; ≤ 2 levels; icons in the **accent colour** (fixed colours only when meaningful); hideable but not hidden by default; Mac sizes follow the user setting.

**Split views** [split-views]: Selection stays highlighted per pane; drag between panes; Mac dividers thin (1 pt); min/max pane sizes; hideable panes with several ways back; one scroll edge per pane at equal heights.

**Scroll views** [scroll-views]: Elastic; hint overflow with partial content; **no nested same-axis scrolling**; scroll edge effect only behind floating UI, never decorative, one per view.

**Lists and tables** [lists-and-tables]: Text-first; navigation lists keep the selected row highlighted, option lists flash then checkmark; middle-truncate; headings title-case nouns; styles grouped / bordered / alternating. **Info button = more detail, not navigation; chevron = drill in.** No section index with trailing accessories. Mac: click header to sort, resizable columns.

**Collections** [collections]: Row or grid; pad for hover/focus effects; animate insert/delete/reorder; don't change layout during interaction.

**Windows / panels** [windows, panels]: Mac inactive windows **drop materials** and grey their traffic lights (custom windows must too). Panels: float, noun title, hide when app inactive. HUD: dark translucent, small, media apps only.

## Data

**Charts** [charts, charting-data]: Marks, plot area, scales, axes, grid, labels, title/subtitle, annotations, legend (non-position encodings only). Fixed range when bounds mean something, dynamic otherwise; **bars start at zero**; familiar tick sequences; interactive charts: fewer grid lines, light labels. Maximise plot width; short y labels with units in the title; **y labels on the trailing side**. Never require interaction to reveal critical information; small marks → whole plot area is the scrub target; keyboard and Switch Control paths; announce changes. **Never colour-only**: use shapes or patterns; separators between stacked segments. A11y: Audio Graphs, title + summary, per-mark labels with context and real values, no subjective words, hide axis text from AT. Headline summary; consistent style when one dataset appears in several charts; don't chart what a list says better. Swift Charts 3D (`Chart3D`, `SurfacePlot`) exists since 26.

**Widgets** [widgets]: Margins 16 pt (tight 11); text ≥ 11 pt; concentric corners (`ContainerRelativeShape`); appearances light, dark, **clear** (desaturated + Liquid Glass), **tinted** (accented rendering mode splits accent and primary groups). iPhone 430×932 sizes: small 170², medium 364×170, large 364×382; lock screen circular 76², rectangular 172×76, inline 257×26.

## Foundations

### Typography [typography]

Defaults / minimums: iOS 17/11 pt · macOS 13/10 · visionOS 17/12 · watchOS 16/12. Avoid Ultralight/Thin/Light. Emphasis via bold traits.

**iOS Dynamic Type at Large (default).** Headline semibold, the rest regular; emphasized = bold for Large Title/Title 1/Title 2, semibold otherwise.

| Style | Size / leading (pt) | AX5 |
|---|---|---|
| Large Title | 34 / 41 | 60 / 70 |
| Title 1 | 28 / 34 | 58 / 68 |
| Title 2 | 22 / 28 | 56 / 66 |
| Title 3 | 20 / 25 | 55 / 65 |
| Headline | 17 / 22 (semibold) | 53 / 62 |
| Body | 17 / 22 | 53 / 62 |
| Callout | 16 / 21 | 51 / 60 |
| Subheadline | 15 / 20 | 49 / 58 |
| Footnote | 13 / 18 | 44 / 52 |
| Caption 1 | 12 / 16 | 43 / 51 |
| Caption 2 | 11 / 13 | 40 / 48 |

xS sizes run 31/25/19/17/14/14/13/12/12/11/11 (Large Title → Caption 2). Full xS…AX5 tables: HIG Typography.

**macOS (fixed):** Large Title 26/32, Title 1 22/26, Title 2 17/22, Title 3 15/20, Headline 13/16 **bold**, Body 13/16, Callout 12/15, Subheadline 11/14, Footnote 10/13, Caption 1 10/13, Caption 2 10/13 medium.

**SF Pro tracking (1/1000 em):** 6pt +41 · 9 +19 · 11 +6 · 12 0 · 13 −6 · 15 −16 · **17 −26** · 20 −23 · 22 −12 · 24 +3 · 28 +14 · 34 +12 · 40 +10 · 48 +8 · 60 +4 · 72 +2 · ≥ 80 0.

### Colour [color]

System colours (iOS 26+, RGB; light · dark · increased-contrast light · IC dark). Apple says don't hard-code, so use these as palette references.

| Colour | Light | Dark | IC light | IC dark |
|---|---|---|---|---|
| Red | 255,56,60 | 255,66,69 | 233,21,45 | 255,97,101 |
| Orange | 255,141,40 | 255,146,48 | 197,83,0 | 255,160,86 |
| Yellow | 255,204,0 | 255,214,0 | 161,106,0 | 254,223,67 |
| Green | 52,199,89 | 48,209,88 | 0,137,50 | 74,217,104 |
| Mint | 0,200,179 | 0,218,195 | 0,133,117 | 84,223,203 |
| Teal | 0,195,208 | 0,210,224 | 0,129,152 | 59,221,236 |
| Cyan | 0,192,232 | 60,211,254 | 0,126,174 | 109,217,255 |
| Blue | 0,136,255 | 0,145,255 | 30,110,244 | 92,184,255 |
| Indigo | 97,85,245 | 109,124,255 | 86,74,222 | 167,170,255 |
| Purple | 203,48,224 | 219,52,242 | 176,47,194 | 234,141,255 |
| Pink | 255,45,85 | 255,55,95 | 231,18,77 | 255,138,196 |
| Brown | 172,127,94 | 183,138,102 | 149,109,81 | 219,166,121 |

Greys 1–6 (light / dark): Gray 142,142,147 / same · Gray2 174,174,178 / 99,99,102 · Gray3 199,199,204 / 72,72,74 · Gray4 209,209,214 / 58,58,60 · Gray5 229,229,234 / 44,44,46 · Gray6 242,242,247 / 28,28,30.

Semantic hierarchies glasscn should mirror: **labels** (label, secondary, tertiary = unavailable, quaternary = watermark, placeholder, link) · **separators** (translucent, opaque) · **backgrounds** system and grouped, each primary/secondary/tertiary · dark mode **base vs elevated** (popovers/sheets elevated). ⚠ The HIG publishes no values for these; pre-26 UIKit values (secondaryLabel ≈ rgba(60,60,67,.6) light / rgba(235,235,245,.6) dark; tertiary .3; quaternary .18/.16; systemFill rgba(120,120,128,.2/.36) → quaternary .08/.18) are a starting point only. Every custom colour needs light, dark and increased-contrast variants: "even if your app ships in a single appearance mode, to support Liquid Glass adaptivity". Contrast ≥ 4.5:1, aim for 7:1 on small text.

### Materials [materials]

Standard (content-layer) materials: ultraThin, thin, **regular (default)**, thick. Thicker = better contrast for fine text. Vibrancy: labels primary → quaternary (**no quaternary on thin/ultraThin**), fills primary → tertiary, one separator level. Mac: inactive windows lose materials.

### Accessibility [accessibility]

Text scaling ≥ 200%. Contrast: ≤ 17 pt needs 4.5:1; ≥ 18 pt or bold 3:1. Control size default / minimum: iOS 44 / 28 · macOS 28 / 20 · visionOS 60 / 28. Spacing ~12 pt around bezelled elements, ~24 pt around borderless. Reduce Motion: tighter springs, direct gesture tracking, no z-depth animation, **fades instead of x/y/z transitions, don't animate into or out of blurs**. Custom controls expose label, value, traits, actions, activation point.

### Motion and dark mode [motion, dark-mode]

Glass motion stronger for touch, subdued for trackpad. Brief, purposeful, cancellable, never the only signal, paired with haptics/audio; avoid motion on frequent interactions. No app-specific appearance toggle; test Increase Contrast and Reduce Transparency together and apart.

### SF Symbols [sf-symbols] → our icons

Rendering modes: monochrome, hierarchical (one colour, layer opacities), palette (colour per layer), multicolor, **gradient** (SF7). Variable colour (thresholds) vs variable **draw** (SF7, path to a percentage, for progress). Variants: outline (toolbars, lists) vs **fill (tab bars, swipe actions, selection)**. Animations: appear/disappear, bounce, scale, pulse, variable colour, replace / magic replace, wiggle, breathe, rotate, **draw on/off** (SF7). Standard actions: Done `checkmark`, Cancel/Close `xmark`, Delete `trash`, Share `square.and.arrow.up`, More `ellipsis`, Add `plus`, Search `magnifyingglass`, Filter `line.3.horizontal.decrease`, Compose `square.and.pencil`, Copy `document.on.document`, Paste `document.on.clipboard`, Undo/Redo `arrow.uturn.backward/forward`. Web equivalent: lucide icons with matched weight to text, outline vs filled variants by role, and CSS/SVG symbol effects (bounce, pulse, draw via `stroke-dashoffset`).

### Haptics [playing-haptics]

System patterns only for their meanings: notification (success, warning, error), impact (light, medium, heavy, soft, rigid ⚠), selection. Causal, consistent, optional, not overused. Web: `navigator.vibrate` is Android-only, so haptics are native track only.

## Apple Design Resources

iOS/iPadOS 27 and macOS 27 UI kits (Figma, Sketch), watchOS/visionOS 26, SF Symbols 27, Icon Composer 2, SF fonts, product bezels (incl. iPhone 18, iPhone Duo) at `developer.apple.com/design/resources`. Use the Figma kits for the control metrics this page can't give.
