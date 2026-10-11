# Accessibility rules

1. **Contrast is checked, not assumed.** For every shipped palette × material in both schemes, `legibilityReport()` must show text and secondary text ≥ 4.5:1 on subtle, default and strong panes, the accent's label ≥ 4.5:1 and the accent against the ground ≥ 3:1 — tested in `glass-theme.test.ts`. Inside panes, text uses `--glass-label` / `--glass-label-secondary` (the panes remap shadcn's foreground tokens). Lower a frost opacity only with that test green.
2. **Focus is always visible — including in forced colours.** Every interactive part has a `focus-visible` ring of `--glass-ring-width` in `--ring`, and hides the browser outline with `focus-visible:outline-hidden` (which forced-colours mode turns back into a visible outline). Never `outline-none`: forced colours strip the box-shadow ring and focus disappears.
3. **Radix does the semantics.** Use Radix primitives for anything with roles, keyboard handling or focus management (switch, tabs, dialog, menu, slider, toggle group). Don't rebuild them from divs.
4. **Every control has a name.** Icon-only buttons take `aria-label`; sliders and segmented controls take `aria-label` (or a `Label`).
5. **Data has text.** `ActivityRings` and charts carry `role="img"` and an `aria-label` describing the values; heatmap cells have titles/labels.
6. **Motion respects the user.** `prefers-reduced-motion` stills the aurora and every `data-glass-motion` element; the `motion-still` preset does it for everyone.
7. **No information by colour alone.** Kept/missed, trends and states pair colour with text or an icon.
8. **Fallbacks stay readable.** Without `backdrop-filter`, panes become nearly opaque — test with the `matte` material.
