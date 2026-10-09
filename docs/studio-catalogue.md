# Studio catalogue — every item, automatically

**What:** the Theme Studio's preview (`/themes`) is a hand-composed scene using a subset of
components. Below the scene it now renders **the catalogue**: every documented registry item —
components *and* blocks — each with its docs demo, grouped as in the registry. A new component
appears in the studio the moment it has a registry entry and a demo; nobody edits the studio.

**Approach**

- `StudioPreview` (`src/components/site/studio/studio-preview.tsx`) builds the catalogue at
  module scope from the same two sources the docs use: `docs` from `src/lib/docs.ts`
  (derived from `registry.json`) and `demos` from `src/components/demos` (keyed by item slug).
  Items without a demo are skipped, not rendered broken.
- The catalogue renders inside the preview's `ThemeScope`, so every item wears the theme
  being edited — palette, material, shape, motion, density, type.
- Each demo is wrapped in `React.memo` at module scope. Demos take no props, so dragging a
  token re-renders only the catalogue wrappers; the theme reaches the demos through the
  scope's `<style>` (CSS variables), not through React.
- One frame per item on a flat `glass-subtle` pane (the same framing as the docs' previews,
  elevation off), titled with the registry title; blocks span the full row.
- Known limit, accepted: portal demos (Dialog, Sheet, Popover, Dropdown menu, Toaster) open
  their floating content on `document.body`, outside the scope — documented `ThemeScope`
  behaviour. Triggers wear the theme; portal content follows the page.

**Docs:** `docs/theming.md` (studio description) mentions the catalogue.
