# Performance rules

`backdrop-filter` is the expensive part of glass: every frosted pane re-blurs what's behind it, every frame something behind it moves.

1. **Fewer, larger panes.** Prefer one pane with fills inside over many small panes. Lists of 50 frosted rows are a smell — frost the list, not each row.
2. **Blur radius costs.** Keep `--glass-blur` ≤ 32px for anything that scrolls; `vapor` (56px) is for hero moments.
3. **The aurora animates transforms only** (and only three elements), on the compositor. Don't animate its colours, sizes or blur; `--aurora-blur` is static by design.
4. **Offer `matte`.** No blur at all — the escape hatch for low-end devices, old WebViews and very dense screens.
5. **No glass under scrolling glass when avoidable.** A sticky `glass-strong` header over frosted cards blurs blurred content every scroll frame; it's fine once, not stacked.
6. **Charts are CSS-animated.** Rings and sparklines draw with a CSS keyframe on `stroke-dashoffset`, not per-frame JS.
7. **Server-render what you can.** Surfaces, cards, rings, sparklines, heatmaps and `ThemeScope` need no client JS.
