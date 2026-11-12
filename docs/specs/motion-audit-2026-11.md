# Motion audit, November 2026

Measured in Chromium against `pnpm dev`: running animations per page, computed transitions on every element, and frame strips of each overlay at 8% playback rate.

## What the audit found

| Finding | Where | Fix |
|---|---|---|
| The trigger's label is stretched to the panel's width and cross-fades over the panel's content for the whole morph | every overlay that morphs from its trigger (dialog, sheet, menus, select, popover) | The trigger snapshot keeps its own size and the two snapshots fade in sequence |
| `duration-*` beside `animate-in` also sets `transition-duration`, and the default `transition-property` is `all`. The sheet transitioned `backdrop-filter`, `background-color` and `box-shadow` on open | sheet, dialog and alert-dialog overlays, action sheet, tabs content | `transition-none` on those elements |
| Hover colour changes with no transition | chart legend, chat tool disclosure, combobox chip, data-table sort header, scroll-area thumb, search-field clear, site header and footer links | `transition-colors` on the token duration |

Not changed: infinite animations (aurora, shimmer, spinner, typing dots) keep running offscreen. They animate transforms on the compositor and Reduce Motion stops them. The switch thumb still animates `margin`, because its drag logic reads the same box.

## Morph snapshots

`view-transition-class` now carries the direction: `glass-presentation glass-presentation-open` or `glass-presentation-close`. The stylesheet uses it to find the trigger's snapshot (old while opening, new while closing):

- The trigger snapshot fills the group with `object-fit: none`, so it stays at its own size in the centre.
- Opening: the trigger fades out over the first 40% of the morph, the panel fades in from 20%.
- Closing: the panel fades out over the first 50%, the trigger fades in from 20%.

## Root capture, tried and dropped

Every morph also snapshots the whole page as the `root` group, so the page under the overlay freezes and takes no input until the morph ends. Setting `view-transition-name: none` on `<html>` during the morph fixes that, but Chrome then stops applying the group's `backdrop-filter` to the live page: the panel is see-through and unblurred until the last frame. The glass matters more than a live page for half a second, so the root stays captured.

## Verification

- `src/lib/__tests__/glass-morph-interruption.test.tsx`: direction class on both elements.
- `registry/registry.test.mjs`: no element combines `animate-in` with a `duration-*` unless it also sets a transition.
- Frame strips before and after, `pnpm test:e2e` on the transition specs.
