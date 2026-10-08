# Accessibility rules

1. **Contrast is checked, not assumed.** Body text on a default pane over the ground and every aurora blob must reach 4.5:1 for shipped presets (`legibility()`; the studio shows it). Lower the frost opacity only with that number in view.
2. **Focus is always visible.** Every interactive part has a `focus-visible` ring of `--glass-ring-width` in `--ring`. Never `outline-none` without a replacement.
3. **Radix does the semantics.** Use Radix primitives for anything with roles, keyboard handling or focus management (switch, tabs, dialog, menu, slider, toggle group). Don't rebuild them from divs.
4. **Every control has a name.** Icon-only buttons take `aria-label`; sliders and segmented controls take `aria-label` (or a `Label`).
5. **Data has text.** `ActivityRings` and charts carry `role="img"` and an `aria-label` describing the values; heatmap cells have titles/labels.
6. **Motion respects the user.** `prefers-reduced-motion` stills the aurora and every `data-glass-motion` element; the `motion-still` preset does it for everyone.
7. **No information by colour alone.** Kept/missed, trends and states pair colour with text or an icon.
8. **Fallbacks stay readable.** Without `backdrop-filter`, panes become nearly opaque — test with the `matte` material.
