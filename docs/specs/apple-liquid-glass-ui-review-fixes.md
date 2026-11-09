# Fixes from the independent UI/UX review

The [independent review](../research/independent-ui-ux-review.md) compared the working tree against Apple's iOS/iPadOS 27 references in a browser and on the iOS 27 simulator. This spec covers the corrections made after it. No backwards compatibility is kept: scene markup, labels and component defaults change where Apple's apps do it differently.

## Site and runtime defects

- `/themes` opened scrolled to y≈7,500–14,000. cmdk calls `Element.scrollIntoView` on the selected row at mount, which also scrolls the page. `CommandItem` and `CommandGroup` now replace that method on their own nodes with a scroll that moves only the enclosing `[cmdk-list]`.
- `GlassEffects` wrote `data-glass-refracting` and `--glass-optical-filter` onto server-rendered nodes that React had not hydrated yet, so `/` logged a hydration mismatch. The runtime skips a node until React has attached its fiber (or the node is outside any React tree) and retries on a short timer, since hydration doesn't mutate the DOM.
- The pinned `ToolbarCommands` group sat in an `overflow-x-auto` box that clipped its shadow into a grey square behind Share. The box only scrolls when the allocator says the pinned group doesn't fit, and then pads vertically so the shadow isn't cut.

## Presentations stay inside their scene

`SheetContent` takes `container`. It portals there, positions `absolute` instead of `fixed`, and measures detents and the full-height anchor against the container's height. The showcase blocks pass their own `<section>`, so Maps' place card, Notes' Format sheet and Mail's compose sheet present inside the app frame instead of covering the docs page.

## Apple-matching scene compositions

| Scene | Before | After (Apple reference) |
| --- | --- | --- |
| Photos | Whole photo dimmed 35%; prev/back/next and favorite/adjust split oddly | Photo stays bright, only the top/bottom bands under clear controls are dimmed. Share and Delete sit alone at the bottom corners, Favorite and Info share glass between them, Delete confirms through a source-anchored menu. Title/date float centered at the top, More at the trailing edge. Pointer arrows at the vertical edges. |
| Music | Centered tab capsule with Search inside it; minimizing put the tab on the trailing side | Tab capsule leading (Home, New, Library), Search as its own trailing tab, MiniPlayer accessory above both. Scrolling down collapses the tabs to the selected icon at the leading edge with the accessory inline and Search kept trailing. The Search tab opens a browse-categories landing page and puts its field in the bottom bar. |
| Mail | List and message stacked vertically | Sidebar at the window edge, message list and message side by side at regular width, push navigation when compact. Unread dots, times, two-line previews, Flag/Archive grouped in the message bar, modal Compose sheet with Cancel and a tinted Send. |
| Notes | Form-like card, textarea with resize grip, text-labelled toolbar, orange "Save note" button | Icon-only Undo/Redo/Pin with More and a pinned Share, tinted Done (checkmark) at the trailing edge, a plain document with date line and title, a floating Checklist/Aa group at the bottom, and a compact nonmodal Format sheet with Title/Heading/Body/Monostyled chips. |
| Landmarks | No toolbar | Share, Favorite + Collections, and an inspector toggle in three glass groups (Apple's toolbar sample). Hiding the inspector widens the hero and the horizontal row. Sidebar rows use accent icons. |
| Search | Detail column kept showing a result that the filter had removed | The detail follows the visible results and disappears when nothing matches. |
| Controls | Segmented control centered in an oversized capsule | Capsule hugs the control. |
| Maps | Phone-style bottom card on the wide canvas | Search card floats at the top leading corner at regular width; the place card opens in the same column. Compact width keeps the bottom card. |
| Site header | Trailing controls in two sizes (32/36 px) and two glyph sizes (14/16 px) | One 32 px circle per control, 16 px glyphs, one tone, no gap. |

## Shared component changes

- Liquid surfaces (`glass-liquid`, `glass-liquid-clear`, `glass-prominent`) have a transparent border. Their edge is the two-sided rim; the solid border returns under Increase Contrast, Show control borders and forced colours.
- `ToolbarCommands` shows an icon or a label, not both. The label stays the accessible name and the More menu text.
- Filled (`default`) and `prominent` buttons drop the coloured glow. Apple's filled and tinted-glass buttons cast a neutral shadow.

## Native track

Native changes follow the review's native findings and are listed in the review's fix order. Each scene change above is mirrored in `registry/native/liquid-glass-01.tsx` / `liquid-glass-02.tsx` where the native scene had the same defect.

## Verification

- `pnpm typecheck && pnpm lint && pnpm test`
- Playwright: showcase, site width, action sheet, liquid surfaces, glass morph specs on Chromium
- Before/after captures under `docs/research/evidence/independent-ui-ux/`
- Native: `npm --prefix sandbox/native test -- --runInBand`, then the scenes on the iOS 27 simulator
