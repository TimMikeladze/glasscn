# Home page

The landing page (`src/app/page.tsx`) shows the kit running instead of describing it. Every documented
component appears on it live, plus composed examples that only exist on the home page.

## Sections (top to bottom)

1. **Hero**: badge with the item count, install command, CTAs.
2. **Dashboard01**: the flagship block.
3. **Three pitches**: shadcn APIs · tokens · native.
4. **Controls**: `ControlsSampler` (segmented control, tabs, switch, input, slider, progress, badges, rings, toast).
5. **Examples**: `HomeExamples` (`src/components/site/home-examples.tsx`). These are app-shaped
   screens built only from glass parts: a now-playing player, a notification inbox, a habit
   checklist, a team card with overlays (dropdown, popover, tooltip, dialog, sheet), a journal
   composer, a pricing toggle. They're there to show how parts combine. They're site code, not
   registry items.
6. **Data**: charts, meters and lists (area, donut, tracker, bar list, gauge), then a second row
   with the bar chart, KPI stats + sparklines, heatmap, progress rings, and the sortable data table.
7. **One component, many themes**: a `ThemeScope` strip showing the same card in six
   palette/material/shape combinations side by side.
8. **Chat**: the `Chat01` block next to the line chart and category bar.
9. **Blocks**: Analytics01, Settings01, Auth01.
10. **Every component**: `ComponentGallery` (`src/components/site/component-gallery.tsx`). Group
    tabs (Surfaces, Typography, Controls, Overlays, Navigation, Data, Chat), each a grid of tiles
    that render the item's own docs demo from `demos` and link to `/docs/<slug>`. It's driven by the
    registry, so new items show up without editing the page. Blocks are excluded, since they're shown in full above.
11. **CTA** + `PaletteDock`.

## Decisions

- The gallery receives `{ slug, title, description, group }` from the server page, so the
  client bundle doesn't pull in `registry.json`.
- Gallery tiles clip overflow and scale wide demos down (`overflow-hidden`) so big demos don't
  break the grid. The link goes to the full page.
- Composed examples use tokens only (no hex, no fixed radii), same as registry components, so every
  palette, shape, density and material in the dock/studio restyles them.
- Overlay demos portal outside `ThemeScope`, so the theme strip uses only inline parts.
