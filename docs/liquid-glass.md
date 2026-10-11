# Liquid Glass — study and alignment plan

A study of Apple's Liquid Glass (iOS/iPadOS/macOS 26, refined in 27) — paradigm, material physics, colour, shape, components, motion, accessibility, APIs — and a gap analysis of glasscn against it, ending in a prioritised plan.

Sources: Apple's [Liquid Glass technology overview](https://developer.apple.com/documentation/technologyoverviews/liquid-glass), [Adopting Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass), [Applying Liquid Glass to custom views](https://developer.apple.com/documentation/swiftui/applying-liquid-glass-to-custom-views), the HIG ([Materials](https://developer.apple.com/design/human-interface-guidelines/materials), [Color](https://developer.apple.com/design/human-interface-guidelines/color), [Layout](https://developer.apple.com/design/human-interface-guidelines/layout), [Toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars), [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars), [Scroll views](https://developer.apple.com/design/human-interface-guidelines/scroll-views), [Motion](https://developer.apple.com/design/human-interface-guidelines/motion)), WWDC25 sessions [219](https://developer.apple.com/videos/play/wwdc2025/219) (Meet Liquid Glass), [356](https://developer.apple.com/videos/play/wwdc2025/356) (new design system), [323](https://developer.apple.com/videos/play/wwdc2025/323) (SwiftUI), [284](https://developer.apple.com/videos/play/wwdc2025/284) (UIKit), [310](https://developer.apple.com/videos/play/wwdc2025/310) (AppKit), WWDC26 sessions [101](https://developer.apple.com/videos/play/wwdc2026/101), [102](https://developer.apple.com/videos/play/wwdc2026/102), [289](https://developer.apple.com/videos/play/wwdc2026/289), [8120](https://developer.apple.com/videos/play/wwdc2026/8120); web techniques from [kube.io](https://kube.io/blog/liquid-glass-css-svg/) and [Aave](https://aave.com/design/building-glass-for-the-web); critique from [NN/g](https://www.nngroup.com/articles/liquid-glass/). Studied 2026-10-11.

---

## TL;DR

glasscn is a very good **frosted-material** library (Apple's *standard materials* — ultraThin…thick — plus vibrancy-style fills). Liquid Glass is a different thing: a **lens** that lives only on a **floating control/navigation layer**, with **dynamic light**, **morphing**, and **accessibility-driven adaptivity**. We match its shapes (capsules), one-accent colour discipline and a lot of iOS control anatomy; we miss its paradigm and most of its physics.

The five changes that would move us furthest:

1. **Split the two layers.** Keep today's `glass*` as the *content material*; add a **`liquid`** surface (regular + clear) for the control layer — dock, toolbars, floating buttons, menus, popovers, sheets, knobs — and rewrite the design rules around it.
2. **Accessibility adaptivity** (cheap, overdue): `prefers-reduced-transparency`, `prefers-contrast`, `forced-colors`, plus a **clarity** primitive that mirrors iOS 27's "clear ↔ tinted" slider.
3. **Light, not a static sheen:** a two-sided specular rim with a light angle, the iOS 27 darkened edge, pointer-driven illumination on press, adaptive shadow.
4. **Concentric shapes** (`inner = outer − padding`, with a minimum) and continuous corners where the browser has them.
5. **The missing navigation layer:** floating `Toolbar`, scroll-edge effect, dock minimise-on-scroll + bottom accessory + search tab, sheet detents, morph-from-source menus, glass knobs on switch/slider/segmented control.

Refraction (true lensing) is the headline effect but the least portable on the web — ship it as a Chromium-only progressive layer on small control-layer elements, never as the base.

---

## Part 1 — What Liquid Glass is

### 1.1 Paradigm

- **Two layers.** Liquid Glass "forms a distinct functional layer for controls and navigation elements… that floats above the content layer." **"Don't use Liquid Glass in the content layer."** Content uses the standard materials (ultraThin, thin, regular, thick) and vibrancy. Exception: transient controls in content (slider, toggle) become glass *only while being touched*. (HIG Materials)
- **Deference.** Glass exists to put attention on content. "Use Liquid Glass effects sparingly… limit to the most important functional elements." Over a flat area "there's nothing for it to refract." (HIG, WWDC26 8120)
- **One floating plane.** Controls live on a single glass plane that morphs between contexts rather than separate panels appearing and disappearing. (219)
- **Hierarchy by layout and grouping, not decoration.** Remove custom bar backgrounds, borders and `presentationBackground`. (356)
- **Hardware harmony.** Corner radii derive from the device/window: nested shapes are concentric with their container. (Adopting)
- **Edge to edge.** Content runs under bars and sidebars; a *scroll edge effect* — not an opaque bar — keeps controls legible. (HIG Layout)
- **Never glass on glass.** Things on glass use fills, transparency and vibrancy. Glass cannot sample other glass, so related glass shapes share one container. (219, 323)

### 1.2 Material anatomy

Apple publishes no blur radii or refraction indices; it publishes behaviours.

| Layer | Behaviour |
|---|---|
| **Lensing** | "Bends, shapes and concentrates light" rather than scattering it. Refraction at the **edges** defines the silhouette; the centre stays readable. |
| **Specular highlights** | Virtual lights produce highlights that **respond to geometry** and move on interaction (and, sometimes, device motion). iOS 27: **brighter speculars plus a darkened edge.** |
| **Adaptive shadow** | Shadow opacity **rises over text**, falls over light flat backgrounds. |
| **Illumination** | On touch the material "illuminates from within" — a glow starting under the finger that spreads through the element and onto nearby glass. |
| **Tint / dynamic range** | Tint and range shift continuously to keep glyphs legible. |
| **Thickness by size** | Larger glass (a menu grown from a button) reads thicker: deeper shadow, stronger lensing, softer scatter. Sidebars are more opaque than buttons. |
| **Light/dark flip** | *Small* elements (bars, buttons) flip light↔dark with the content beneath; glyphs follow monochromatically. *Large* elements adapt but don't flip. |
| **Ambient spill** | Colourful content near a large surface bleeds light onto it and into its shadow. |
| **Focus** | Inactive windows' glass recedes. |
| **Materialise** | Glass appears/disappears by modulating lensing, **not by fading opacity**. (UIKit: animate `effect`, never `alpha`.) |

### 1.3 Variants, tint and colour

- **`regular`** — default; blurs and adjusts luminosity; fully adaptive; for anything, any size, text on top.
- **`clear`** — highly translucent, **no adaptive behaviour**; only over media, only if a dimming layer is acceptable, only with bold bright content on top. Bright media: add a **35% dark dimming layer**. **Never mix regular and clear.**
- **`identity`** — no effect (for toggling).
- **Tint** maps a colour to a *range of tones* by the brightness underneath, like real coloured glass. Use for meaning (primary action, status), not decoration. **Colour the background of a prominent button, not its label.** Never a solid opaque fill on a glass button.
- **Colour discipline:** glass has no colour of its own. One prominent (tinted) action per toolbar; monochrome toolbars/tab bars in colourful apps; monochrome icons in bars; avoid similar hues in content and controls; every custom colour needs light, dark and increased-contrast variants.

### 1.4 Shape, concentricity, layout, type

- Three shapes: **fixed**, **capsule** (r = h/2, the default for buttons, sliders, switches, bars), **concentric** (r = parent r − padding).
- Concentric needs a **minimum radius** (`.concentric(minimum:)`) or corners far from the container collapse to 0 ("pinched") or overshoot ("flared").
- macOS: small controls stay rounded-rect for density; large are capsules; new **extra-large** size.
- iPhone sheets at partial height are inset and their bottom corners nest into the display curve; at full height they anchor and get more opaque.
- `backgroundExtensionEffect` mirrors and blurs hero art under a sidebar.
- Lists/forms: taller rows, rounder section corners, **section headers in title case, not ALL CAPS**.
- Type: bolder, **left-aligned** titles in alerts and onboarding; large titles scroll under the bar.

### 1.5 Components

| Component | Liquid Glass behaviour |
|---|---|
| **Tab bar** | Floating capsule; **minimises on scroll** (`onScrollDown/Up/automatic/never`); **bottom accessory** above it that goes inline when minimised; **search tab** separated at the trailing end; iOS 27 `TabRole.prominent` for one separated tab. Adapts to a sidebar on iPad. |
| **Toolbar / nav bar** | Transparent bar; items float on glass, **auto-grouped** (one glass background per group), `ToolbarSpacer` splits groups, ≤ ~3 groups, one **prominent** trailing action, don't mix text and symbols in a group. iOS 27: toolbar minimisation, overflow menu, visibility priority. |
| **Scroll edge effect** | Not an overlay: `soft` (progressive blur, iOS default) or `hard` (nearly opaque, macOS/pinned headers). One per edge; never stacked. iOS 27 adds a "uniform toolbar" strip when content scrolls under. |
| **Sidebar** | Floating inset glass (iPad/Mac), more opaque; content extends beneath. 27: edge-to-edge, accent-coloured icons. |
| **Sheet** | Inset, rounder at partial height; opaque and anchored at full height; **morphs out of its source button**; dim only for interrupting tasks. |
| **Menu / popover** | **The button morphs into the menu.** Leading icons on items. |
| **Action sheet / confirmation** | Originates from the source element, not the screen bottom. |
| **Buttons** | `glass`, `glassProminent` (tinted), `clear`; capsule default; one or two prominent per view; always a press state. |
| **Switch / slider / segmented** | **Knob turns into glass while dragging** — a lens over the value; momentum and stretch. Slider: tick marks, neutral value (fill origin), thumbless progress style. |
| **Search** | iPhone: bottom toolbar field that can minimise to a button, or a search tab. iPad/Mac: top trailing. |
| **Alerts** | Bolder, left-aligned text. |
| **App icons / widgets** | Layered, with system speculars/refraction; clear and tinted appearances. |

### 1.6 Motion and interaction

- `.interactive()`: on touch the glass **scales, bounces and shimmers**; gel-like flex. Touch reads stronger than pointer.
- **Morphing** — `GlassEffectContainer(spacing:)` blends shapes nearer than `spacing`; `glassEffectID` + namespace morphs between states; transitions `matchedGeometry` (near), `materialize` (far), `identity`; `glassEffectUnion` merges at rest.
- **Source-anchored presentations** — menus, popovers, sheets, alerts flow out of their control.
- **Materialise, don't fade.**

### 1.7 Accessibility and user control

- **Reduce Transparency** → frostier, obscures more. **Increase Contrast** → predominantly black/white with a contrasting border. **Reduce Motion** → weaker effects, **no elasticity**.
- **User clarity setting** — iOS 26.1 added *Clear / Tinted*; **iOS 27 replaced it with a continuous slider "ultra clear → fully tinted"**, applied to all glass apps without recompiling. Apple's answer to legibility critique (NN/g: low contrast over busy content, text over text, floating controls hiding content).
- Icon-only buttons need labels.

### 1.8 What changed in 27 (June 2026)

Material retuned (diffuses complex content better, darkened edge, brighter speculars, more uniform refraction, better contrast); clarity slider; uniform toolbar under floating bars; edge-to-edge sidebars with accent icons on Mac/iPad; uniform window radius on Mac; AppKit glass bounces on click; `TabRole.prominent`, toolbar minimisation APIs; the `UIDesignRequiresCompatibility` opt-out is gone — every app recompiled with Xcode 27 gets Liquid Glass. No new `Glass` variants.

### 1.9 Platform APIs (for the native track and naming)

| Concept | SwiftUI | UIKit | AppKit | Expo / RN |
|---|---|---|---|---|
| Glass surface | `glassEffect(.regular/.clear/.identity, in: shape)` | `UIGlassEffect(style:)` | `NSGlassEffectView` | `expo-glass-effect` `GlassView glassEffectStyle` |
| Tint / interactive | `.tint()`, `.interactive()` | `tintColor`, `isInteractive` | `tintColor`, `effectIsInteractive` | `tintColor`, `isInteractive` |
| Group / morph | `GlassEffectContainer(spacing:)`, `glassEffectID`, `glassEffectUnion`, `glassEffectTransition` | `UIGlassContainerEffect` | `NSGlassEffectContainerView` | `GlassContainer spacing`; `@expo/ui` `glassEffectId` + `Namespace` |
| Buttons | `.glass`, `.glassProminent` | `.glass()`, `.prominentGlass()`, `.clearGlass()` | `BezelStyle.glass`, `tintProminence` | `@expo/ui` `buttonStyle('glass'│'glassProminent')` |
| Scroll edge | `scrollEdgeEffectStyle(.soft/.hard)` | `UIScrollEdgeEffect` | `NSScrollEdgeEffectStyle` | system bars (`headerTransparent`, `NativeTabs`) |
| Corners | `ConcentricRectangle`, `.concentric(minimum:)` | `UICornerConfiguration`, `.containerConcentric` | `NSViewCornerConfiguration` (27) | — |
| Tab bar | `tabBarMinimizeBehavior`, `tabViewBottomAccessory`, `Tab(role: .search)` | `UITabAccessory`, `UISearchTab` | — | `NativeTabs minimizeBehavior`, `BottomAccessory`, `role="search"` |

---

## Part 2 — Where glasscn stands

### 2.1 Scorecard

| Area | Apple | glasscn today | Fit |
|---|---|---|---|
| Layer model | Glass only on control/navigation layer; content uses standard materials | Glass everywhere — cards, stats, panes, controls — with a "two levels max" rule | ❌ paradigm gap |
| Material | Lens: refraction at edges, dynamic speculars, adaptive shadow, illumination | Frost: blur + saturate + brightness, static linear sheen, 1px top highlight, one drop shadow, optional grain | ⚠️ good *material*, not *liquid* |
| Variants | `regular` / `clear` (+35% dim) / `identity`; never mixed | `subtle` / default / `strong` intensities; tint none/primary/destructive; 7 material presets | ⚠️ intensity ≠ variant; no `clear` |
| Light | Speculars follow geometry and interaction; 27 darkened edge | Fixed-angle sheen | ❌ |
| Adaptivity | Small glass flips light/dark with content; shadow tracks content | Scheme from `.dark` only | ❌ (web can't sample the backdrop — see 3.6) |
| Tint | Tone range; colour the prominent button's glass | `tinted` button = 16% primary fill; default button = **solid** primary; `DockAction` solid accent | ⚠️ |
| Shape | Capsule / fixed / concentric with minimum | Capsule buttons ✅, radius tokens ✅, fixed `×0.75` inner radii, native `radius − 6` hacks | ⚠️ no concentric system |
| Continuous corners | Squircle everywhere | Native `borderCurve: continuous` ✅; web none | ⚠️ |
| Motion | Real springs, morph, materialise, elastic press, illumination | Cubic-bezier "spring", sliding indicator ✅, scale-only press, fade/zoom overlays | ⚠️ |
| Morphing | Container merge, ID morph, menu-from-button | Sliding pill only | ❌ |
| Tab bar | Minimise, accessory, search tab, prominent tab | `Dock`: floating capsule + sliding pill ✅ + separate action | ⚠️ |
| Toolbar | Floating grouped glass toolbar | None (site header is not a registry item) | ❌ |
| Scroll edge effect | Soft / hard | None | ❌ |
| Sidebar | Floating inset glass | None | ❌ |
| Sheet | Detents, morph from source, opaque at full height | Inset floating panel, any edge ✅; no detents, grabber, drag | ⚠️ |
| Menus / popovers | Morph from trigger, leading icons | Zoom-95 + slide from Radix origin | ⚠️ |
| Switch / slider / segmented | Knob becomes glass while dragged; ticks; neutral value | Solid white knobs (`bg-white`); no ticks | ⚠️ |
| Search | Toolbar/tab placement, minimisable | Only inside `data-table` | ❌ |
| Grouped list headers | Title case | `uppercase` (also dropdown labels) | ⚠️ trivial |
| Reduce transparency | Frostier | Absent (only `@supports not (backdrop-filter)` fallback; `matte` preset by hand) | ❌ |
| Increase contrast | Black/white + contrasting border | Absent | ❌ |
| Forced colours | n/a on Apple; required on the web | Absent | ❌ |
| Reduce motion | No elasticity, weaker effects | ✅ web + native | ✅ |
| User clarity control | 26.1 toggle → 27 slider | None (studio controls are author-side) | ❌ |
| Legibility | Runtime adaptive tint/range | `legibility()` static estimate, studio badge | ⚠️ author-time only |
| Colour discipline | One accent, monochrome bars | One `--primary`, OKLCH, `--chart-*` ✅ | ✅ |
| Native iOS 26 | Real glass | `GlassView` regular + tint + interactive ✅; no `clear`, no `GlassContainer`, no reduce-transparency check | ⚠️ |
| Native Android | (no system glass; tonal surfaces) | Plain 88–90% fill | ⚠️ acceptable, blur now possible |
| Native web (RN-web) | — | Hard-coded `blur(28px) saturate(180%)`, ignores tokens | ⚠️ |

### 2.2 Paradigm misalignments (the important part)

1. **Glass is our content.** `Card`, `Stat`, `GroupedList`, chart hosts and blocks are all frosted panes over an aurora — the 2021 *glassmorphism* paradigm. Apple's is the inverse: content is opaque or standard-material, and glass is reserved for the thin layer of controls floating over it. Our rules 3 and 4 ("two levels of glass", "intensity follows elevation") are a reasonable glassmorphism system but say nothing about *what kind* of element may be glass.
2. **Glass needs an aurora (rule 1).** Apple's glass needs *content scrolling underneath*, not a decorative gradient. Every demo we ship shows panes on an aurora; none shows a floating control over real scrolling content (photos, text, a list) — the canonical Liquid Glass scene.
3. **"Strong" is opacity, not thickness.** Apple's large glass is thicker (deeper shadow, stronger lensing, more opaque) and small glass flips tone. Ours scales only opacity.
4. **Fading.** Our overlays fade + zoom. Liquid Glass materialises (lens/blur modulation + scale). Native already learned this the hard way (`canFade()`).
5. **Solid accent buttons.** The default `Button` and `DockAction` are solid `--primary` fills; Apple's prominent action is *tinted glass*. Solid opaque fills "break the visual character".

What we already get right and should keep: the primitives-vs-derived engine (it makes everything below cheap to add), capsule defaults, one accent, OKLCH, the sliding indicator, inset floating sheet, real `GlassView` on iOS 26, reduced motion, the no-fade-under-glass native rule, and the "no third layer" instinct (Apple's "never glass on glass" is the same rule, stricter).

---

## Part 3 — How to align

Every proposal respects the five AGENTS.md rules: new tokens are **primitives** in `src/lib/glass-theme.ts`; derived values are computed in `registry/stylesheet.mjs` utilities; components use tokens only.

### 3.1 Layer model: `material` vs `liquid`

- Keep `glass` / `glass-subtle` / `glass-strong` exactly as they are and **document them as the content material** (Apple's standard materials). No breaking change.
- Add a **`liquid`** surface family for the control layer:
  - `@utility glass-liquid` — `regular`: lower base opacity than `glass`, tighter blur, two-sided specular rim (3.2), darkened edge, adaptive-ready shadow, `isolation: isolate`.
  - `@utility glass-liquid-clear` — `clear`: very low opacity, small blur, no tone adaptivity, paired with an optional dim (`--glass-dim`, default 35% when used over media).
  - `Glass` gets `variant: "material" | "liquid" | "liquid-clear"` (cva in `glass-variants.ts`), keeping `intensity` for material.
- Move control-layer parts to `liquid`: `Dock`, `DockAction`, `Toolbar` (new), floating `chat` composer and jump button, `Tooltip`, `Popover`, `DropdownMenu`, `Sheet`, `Dialog`, switch/slider/segmented knobs *while active*, `Button variant="glass"`.
- **Rules rewrite** (`docs/rules/design.md`):
  - Glass (liquid) is for controls and navigation floating over content; content uses the material or opaque fills.
  - Never liquid on liquid; group neighbouring liquid elements in one group (3.5).
  - `regular` by default; `clear` only over media with a dim; never mix in one view.
  - Rule 1 becomes "glass needs content beneath it" — aurora *or* real content.
- Add an "over content" demo scene: a photo grid / long article scrolling under a `Toolbar` and `Dock`.

### 3.2 Light: speculars, edge, illumination, shadow

New primitives (Material/Rim/Depth groups):

| Primitive | Default | Purpose |
|---|---|---|
| `glass-light-angle` | `-45deg` | Direction of the virtual light (replaces the role of `glass-sheen-angle` for the rim) |
| `glass-specular` | 70% / 30% | Rim highlight strength on the lit side |
| `glass-edge-shade` | 0% / 18% | iOS 27 darkened inner edge on the shadow side |
| `glass-illumination` | 22% | Press/hover glow strength |
| `glass-shadow-over-content` | 1.6 | Multiplier applied by the scroll-edge state when content sits under a bar |

Rendering (all in utilities, all evaluated per element):

- **Two-sided rim** via a `::before` gradient stroke: `conic-gradient(from var(--glass-light-angle), specular, transparent 25%, edge-shade 50%, transparent 75%, specular)` masked to the border with `mask-composite: exclude`. Replaces the single `inset 0 1px 0` highlight on liquid surfaces; material surfaces keep theirs.
- **Interactive illumination**: a `::after` `radial-gradient(circle at var(--glass-press-x) var(--glass-press-y), illumination, transparent 60%)` with `mix-blend-mode: plus-lighter`, faded in on `:active` / `data-pressed`. A tiny hook (`use-glass-pointer`, registry:hook) writes `--glass-press-x/y` on `pointerdown/move` in rAF — no React state.
- **Optional pointer/tilt light**: the same hook can rotate `--glass-light-angle` toward the pointer for hover devices (off by default, off under reduced motion).
- **Adaptive shadow**: bars read `data-over-content` (set by the scroll-edge observer, 3.4) and multiply shadow opacity.

### 3.3 Accessibility and the clarity slider (do first — cheap, high value)

In `registry/stylesheet.mjs`, override **primitives** (so it composes with every theme and `ThemeScope`):

```css
@media (prefers-reduced-transparency: reduce) {
  :root, [data-glass-scope] { --glass-opacity: 88%; --glass-opacity-strong: 94%; --glass-opacity-subtle: 80%;
    --glass-blur: 40px; --glass-texture: none; }
}
@media (prefers-contrast: more) {
  :root, [data-glass-scope] { --glass-opacity: 94%; --glass-opacity-strong: 97%; --glass-border-width: 1.5px;
    --glass-border-opacity: 100%; --glass-sheen: 0%; --glass-glow: 0%; --glass-texture: none; }
}
@media (forced-colors: active) {
  .glass, .glass-strong, .glass-subtle, .glass-liquid, .glass-liquid-clear {
    backdrop-filter: none; background: Canvas; border-color: CanvasText; box-shadow: none; }
}
```

Once 3.2 and 3.6 land, the same blocks zero `--glass-specular`, `--glass-illumination` and `--glass-refraction`. Increase-contrast also needs a dark-scheme border colour that contrasts (`--glass-border-color` → `CanvasText`-like black/white per scheme). Safari doesn't support `prefers-reduced-transparency` — hence the clarity control:

- **`glass-clarity`** primitive, 0 (ultra clear) → 1 (fully tinted), default ≈ 0.35. Derived opacity in utilities becomes `calc(var(--glass-opacity) + (100% - var(--glass-opacity)) * var(--glass-clarity))`, blur and dim scale with it. One number, matching iOS 27's slider.
- A `GlassPreferences` component (registry:ui) — a slider + "reduce transparency" switch writing `--glass-clarity` on `:root` and persisting to `localStorage` — and expose it on the docs site.
- `legibility()` gains a `clarity` input and reports the worst case at the theme's default clarity.

Native: read `AccessibilityInfo.isReduceTransparencyEnabled()` and `isBoldTextEnabled()` (iOS); under reduce transparency skip `GlassView`/`BlurView` and render `glassSolid`. iOS honours the system clarity slider by itself.

### 3.4 Navigation layer components

| Item | Scope |
|---|---|
| **`toolbar`** (new) | Floating liquid bar, top or bottom; `ToolbarGroup` (one shared glass per group), `ToolbarSpacer` (`fixed`/`flexible`), `ToolbarItem prominent` (tinted glass, trailing); max-groups guidance in docs; `minimize="onScrollDown"`. |
| **`scroll-edge`** (new) | `<ScrollEdge edge="top" style="soft│hard">` and `@utility scroll-edge-soft│hard`. Soft = a band of stacked `backdrop-filter` layers with stepped `mask-image` gradients (progressive blur); hard = near-opaque material strip. An IntersectionObserver sentinel sets `data-over-content` on the bar for adaptive shadow. |
| **`dock`** (upgrade) | `minimizeBehavior` (shrinks to icon-only capsule on scroll down), `DockAccessory` (above when expanded, inline when minimised, `usePlacement()`), `DockSearch` (separated trailing capsule that expands into a field), `DockItem prominent`; `DockAction` becomes tinted liquid, not solid. |
| **`sheet`** (upgrade) | `detents={["medium","large"]}`, grabber, drag-to-dismiss (pointer + spring), partial height = inset liquid with concentric bottom corners, full height = anchored + `glass-strong`; `dim` only when modal. |
| **`sidebar`** (new) | Floating inset liquid sidebar (`collapsible`), plus `BackgroundExtension` (mirror + blur hero under the sidebar). |
| **`search-field`** (new) | Capsule liquid field; `minimized` renders as an icon button that morphs open. |
| Menus / popovers / tooltip | **Morph from trigger**: start at the trigger's size and radius (`--radix-*-trigger-width/height`, transform origin) and grow, via `@starting-style` on `clip-path: inset(… round …)` + scale; reduced motion = crossfade. Leading-icon slot on `DropdownMenuItem`. |
| Confirmation | Add `alert-dialog` and `confirmation-popover` anchored to the source element; bold, left-aligned title. |

### 3.5 Controls and morphing

- **Glass knobs**: switch, slider and segmented thumbs swap `bg-white` for `glass-liquid` while `:active`/`data-dragging`, scaling up (~1.15×) so the knob reads as a lens over the track; at rest they stay solid. Slider: `ticks` (auto from `step`), `neutralValue` (range grows from that origin), `variant="progress"` (thumbless).
- **Elastic press**: `--glass-press-scale` stays; add `--glass-press-stretch` (asymmetric `scale(1.03, 0.95)` on press, spring back). Disabled under reduced motion (Apple: "disables any elastic properties").
- **Real springs**: `glass-theme` gains `spring({ stiffness, damping, mass }) → linear(…)` (tested), and motion presets emit `--glass-ease` as a `linear()` curve (cubic-bezier fallback stays for old engines via `@supports`).
- **Materialise**: overlay entrances animate a registered `@property --glass-materialize` (0→1) that scales blur and frost opacity together with a small scale, instead of fading `opacity`.
- **`GlassGroup`** (new, the `GlassEffectContainer` analogue): children inside share one liquid backdrop and morph between each other. Phase 1 = shared background + sliding/morphing selection (generalise `use-sliding-indicator` to size + radius). Phase 2 = SVG goo-merged shapes for "split/merge" (Chromium-first, flat fallback).
- **View Transitions** for page-level morphs (dock pill → sheet, card → detail): same-document transitions are Baseline; snapshots are flat, so re-enable blur after the transition.

### 3.6 Refraction (progressive, Chromium-only)

- `backdrop-filter: url(#lens)` with an `feDisplacementMap` works only in Chromium; WebKit (bug 245510) ignores it and Firefox passes `@supports` yet renders nothing (bug 1961378). So: **gate by engine detection, not `@supports`**, and treat it as an enhancement on top of a complete frosted look.
- `use-glass-lens` (registry:hook): generates a displacement map per element size with a **convex-squircle bezel** `f(x) = ⁴√(1 − (1 − x)⁴)` (Snell's law, n = 1.5, quadrant-mirrored), encodes it as a PNG data URI in an inline `<filter>`, regenerates on `ResizeObserver` (debounced), animates only the filter `scale`. Optional chromatic dispersion = three channel passes.
- Primitives: `glass-refraction` (displacement scale, 0 = off), `glass-bezel` (bezel width), `glass-dispersion`.
- Only on small liquid elements (dock, toolbar groups, prominent buttons, knobs, search capsule). Never on cards, sheets or anything large. Off under reduced transparency, increased contrast and `still` motion.
- Content-adaptive tone: the web cannot read backdrop pixels, so offer `tone="auto"` only where the background is *known* (the aurora: sample the three blob colours at the element's position; an image: 8×8 canvas average) and flip glyph colour via `data-tone`, with hysteresis. Elsewhere, rely on the clarity primitive and adaptive shadow.

### 3.7 Shape

- **Concentric radii**: containers set plain values `--glass-container-radius` and `--glass-container-pad` on themselves (from their own tokens); `@utility rounded-concentric` = `max(var(--glass-concentric-min, 0.375rem), calc(var(--glass-container-radius) - var(--glass-container-pad)))`. Use it in segmented/tab thumbs, menu items, sheet inner cards, grouped-list rows, stat tiles. Replace native `ui.radius.surface - 6` with a `concentric(outer, pad, min)` helper in `native-ui`.
- **Continuous corners on the web**: `--glass-corner-shape` primitive (`round` | `squircle`) applied via `corner-shape` under `@supports (corner-shape: squircle)` (Chrome/Edge 139+; not Safari or Firefox yet), plain round elsewhere. The `round` shape preset uses `squircle`.
- **Sizes**: add `xl` control size (Apple's extra-large) and an icon-only circular button size.
- **Lists**: grouped-list and dropdown labels drop `uppercase` (title case, normal tracking).

### 3.8 Colour and tint

- `Button variant="prominent"` = tinted liquid glass (tone range of `--primary` mixed into the liquid frost, label in `--primary-foreground` with legibility check); keep `default` solid for shadcn-API compatibility but recommend `prominent` for floating/toolbars in docs. `DockAction` and `ToolbarItem prominent` use it.
- Document Apple's rules in `design.md`: colour the glass not the label; one prominent action per bar; monochrome glyphs in bars; don't tint several controls.
- Palettes gain increased-contrast variants of `--primary`/`--ring` (generated by `paletteFromHue`, checked by tests).

### 3.9 Native track

- `Glass` gets `variant: "regular" | "clear" | "none"` (maps to `glassEffectStyle`), and materialise by animating `glassEffectStyle: { style, animate: true }` instead of translate-only entrances.
- `GlassGroup` → `GlassContainer spacing` for dock, toolbar groups and segmented controls; optional `@expo/ui` `glassEffectId` morphing where `@expo/ui` is present.
- Reduce transparency / bold text handling (3.3).
- Android: `expo-blur` with `BlurTargetView` (stable from SDK 55) as an opt-in tier above the solid fill; keep solid as the default for low-end devices.
- RN-web path reads theme primitives instead of the hard-coded `blur(28px) saturate(180%)`.
- Docs: recommend `NativeTabs` (`minimizeBehavior`, `BottomAccessory`, `role="search"`) for app-level tabs; our `native-dock` is for in-screen bars.

---

## Part 4 — Plan

The full, ID'd backlog — this study's items plus the October 2026 audit of every component, the engine, native, the site and the market — lives in [`roadmap.md`](roadmap.md), sequenced into milestones M0–M7. Mapping from this study:

| Study section | Roadmap items |
|---|---|
| 3.1 Layer model | LG-01, LG-02, ENG-34 (rename the `liquid` material preset first) |
| 3.2 Light | LG-04, LG-05, LG-06, LG-19, LG-20 |
| 3.3 Accessibility + clarity | A11Y-01..04, LG-03, NAT-04 |
| 3.4 Navigation layer | NAV-01..07, SHT-03, NEW-05, NEW-25, NEW-26 |
| 3.5 Controls and morphing | LG-09..14, SWT-02, SLD-03, SEG-01..02 |
| 3.6 Refraction | LG-16, LG-17 |
| 3.7 Shape | LG-08, LG-18, ENG-44 |
| 3.8 Colour and tint | LG-07, ENG-02, ENG-20, ENG-21 |
| 3.9 Native | NAT-03, NAT-14, NAT-60, NAT-80..83 |

Component-level Apple specs (metrics, button order, menus, sheets, charts, type and colour tables): [`apple-hig-reference.md`](apple-hig-reference.md).

## Open questions

- Should `default` `Button` stay solid (shadcn parity) or become `prominent` glass? Recommendation: stay solid, add `prominent`.
- Should cards move off glass by default (Apple-strict) or stay frosted material (current look)? Recommendation: stay frosted — it *is* Apple's standard material — but stop calling it Liquid Glass and stop putting liquid surfaces on it.
- Unverified: Firefox's current behaviour with `backdrop-filter: url()` (an open bug says broken, a 2026 svgwg comment says it works — test before relying on it).
- Answered: `ControlSize.extraLarge` "resolves to `.large` on platforms other than visionOS" — an `xl` size is our choice, not Apple parity.
- The material preset named `liquid` must be renamed before the `glass-liquid` surface ships (ENG-34).
