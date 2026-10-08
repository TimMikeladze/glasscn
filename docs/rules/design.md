# Design rules

1. **Glass needs something to frost.** Every page using glass has an `Aurora` (or another colourful ground) behind it. Glass over a flat white page is just a grey box.
2. **One ground per view.** One `Aurora` per page (or per `ThemeScope`/preview). Never stack auroras.
3. **Two levels of glass, at most.** A pane may sit on glass (a card on the page, a stat in a card's grid), but not a third frosted layer inside that. Inside a pane use fills (`bg-fill`), not more panes.
4. **Intensity follows elevation.** `glass-subtle` for quiet, in-flow panes (code, previews); `glass` for cards and controls; `glass-strong` for anything floating over content (dialogs, menus, popovers, sticky headers, toasts).
5. **One accent.** The palette's `--primary` is the only accent. Charts use `--chart-1..5`. Don't introduce ad-hoc colours; add a token or a palette instead.
6. **Text sits on the frost, never directly on the aurora.** Body copy goes on panes; only large display type may sit on the ground.
7. **Motion is quiet and purposeful.** Things slide to where they're going (thumbs, pills, indicators), draw in once (rings, sparklines), and squash slightly on press. No looping motion except the aurora.
8. **Shape is consistent.** Use the radius tokens (`rounded-surface`, `-control`, `-button`, `-badge`) so a shape preset changes everything at once. Never hard-code corner radii on themed parts.
9. **Density is a token, not a redesign.** Use `h-control*`, `px-pad*` and the card spacing so `--glass-density` scales a whole area.
10. **Check legibility.** The studio's text badge (and `legibility()`) must not read "low" for a theme we ship.
