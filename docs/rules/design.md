# Design rules

glasscn follows Apple's Liquid Glass model ([`../liquid-glass.md`](../liquid-glass.md)): two layers, and glass is never decoration.

- **Content layer** — what people came for: text, photos, lists, cards, charts. It uses the **material** (`glass-subtle`, `glass`, `glass-strong` — Apple's standard materials) or plain **fills** (`bg-fill`), or is simply opaque.
- **Control layer** — the thin layer of controls and navigation that floats *over* the content: the dock / tab bar, toolbars, floating buttons, menus, popovers, tooltips, sheets, dialogs. It uses **liquid glass** (`glass-liquid`, `Button variant="glass"`).

## Layers

1. **Glass needs content beneath it.** Something real has to show through: an `Aurora` behind material panes, or content — photos, an article, a list — scrolling under liquid controls. Glass over a flat page is a grey box; liquid glass over nothing has nothing to bend.
2. **Liquid glass is only for the control layer.** Bars, the dock, floating buttons, menus, popovers, sheets and dialogs — things that float above content and move with the viewport. Never make a card, a stat tile, a list or a chart host liquid; those are content and take the material or fills.
3. **Never liquid on liquid.** Nothing inside a liquid surface is another liquid surface: items in a toolbar, a menu or the dock are fills, tints and plain glyphs. Neighbouring liquid controls that belong together share **one** capsule (one toolbar group = one `glass-liquid`), rather than sitting as separate capsules side by side in a single cluster.
4. **Two levels of material, at most.** A material pane may sit on another (a card on the page, a stat in a card), but not a third frosted layer inside that. Inside a pane use fills (`bg-fill`, `bg-fill-subtle`), not more panes.
5. **Material intensity follows weight, not elevation.** `glass-subtle` for quiet in-flow panes (code, previews), `glass` for cards, `glass-strong` for content that must read like paper (a pinned header, a long form). Anything that *floats* is liquid instead (rule 2).
6. **One ground per view.** One `Aurora` per page (or per `ThemeScope` / preview). Never stack auroras.

## Variants

7. **Regular by default.** `glass-liquid` (regular) adapts to anything beneath it and carries text.
8. **Clear only over media, with a dim.** `glass-liquid-clear` is for controls over photos and video only — it dims what's behind it (`--glass-liquid-clear-dim`) and its glyphs are bold and bright. Never over text or UI.
9. **Never mix regular and clear in one view.** A media viewer is all clear; an article with a toolbar and a dock is all regular.

## Colour

10. **One accent.** The palette's `--primary` is the only accent; data uses `--chart-1..5`; status uses `success` / `warning` / `info`. Don't introduce ad-hoc colours — add a token or a palette.
11. **Colour the glass, not the label.** A prominent control is tinted glass (or the accent fill) with a plain label on it — never an accent-coloured label on clear glass. Glyphs in bars are monochrome.
12. **One prominent action per bar.** A toolbar or dock has at most one tinted / accent action (the `DockAction`, the trailing toolbar item). Everything else stays neutral.

## Text, shape, density, motion

13. **Text sits on frost or on content, never directly on the aurora.** Body copy goes in panes; only large display type may sit on the ground.
14. **Shape is consistent.** Use the radius tokens (`rounded-surface`, `-control`, `-button`, `-badge`, `rounded-concentric` inside a container) so a shape preset changes everything at once. Never hard-code corner radii on themed parts.
15. **Density is a token, not a redesign.** Use `h-control*`, `px-pad*` and the card spacing so `--glass-density` scales a whole area.
16. **Motion is quiet and purposeful.** Things slide to where they're going (thumbs, pills, indicators), draw in once (rings, sparklines), and squash slightly on press. Liquid glass appears by materialising (scale, blur), not by fading. No looping motion except the aurora.

## Legibility

17. **Check legibility.** The studio's text badge and `legibilityReport()` must not read "low" for a theme we ship — on every tier, liquid included, at the default clarity.
18. **The viewer has the last word.** `--glass-clarity` (the `glass-preferences` control, like iOS 27's slider) and the OS settings (reduce transparency, increase contrast) override every theme. Design so the page still works when every pane is nearly opaque.
