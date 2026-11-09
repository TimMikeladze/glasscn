# Social share images (Open Graph)

Every page has a generated 1200×630 JPEG share card and full Open Graph + Twitter/X metadata, so links unfurl on X, LinkedIn, Facebook, Slack, Discord, iMessage, WhatsApp, Telegram and Bluesky.

## What a card looks like

The cards follow the site: Apple's system look, photographs behind Liquid Glass, Apple's web blue, no aurora.

- **Ground.** One of the showcase photographs in `public/showcase` (`alpine`, `coast`, `summit`), cropped to 1200×630, with a dark scrim on the left so white type holds contrast.
- **Left column.** The glasscn mark, an eyebrow pill, the title (sized to its length, two lines at most), a two-line description, and a mono install command or the site's tagline. The host sits bottom right.
- **Right column.** A scene: a few glass parts drawn the way the components draw them, picked per docs group. `showcase` (toolbar, now playing, tab bar), `controls` (segmented control, switches, slider, buttons), `data` (stat and bar chart), `chat` (bubbles and composer), `menu` (context menu), `navigation` (toolbar, search, tab bar), `type` (type scale), `surfaces` (card and alert), `studio` (palette swatches and material sliders), `native` (an iPhone frame with a sheet).

## How it works

- **Renderer.** `src/lib/og/render.tsx` (`renderOg`) builds the card with `next/og` (`ImageResponse`, Satori), then `sharp` re-encodes it as JPEG. Scenes live in `src/lib/og/scenes.tsx`.
- **Frosted glass without backdrop-filter.** Satori can't blur what's behind an element. Each glass pane instead clips a pre-blurred copy of the same photo (`sharp().blur()`), offset by the pane's position, so the pane shows exactly the blurred patch it covers. Panes are absolutely positioned for that reason and don't nest.
- **Colours.** `src/lib/og/colors.ts` (`ogColors`) converts the `system` palette's dark-scheme OKLCH tokens to hex, since Satori has no `oklch()`: the accent and the chart colours.
- **Fonts.** Geist Bold/Medium and Geist Mono Medium are vendored in `src/lib/og/fonts` (OFL). Satori can't read woff2, and San Francisco can't be redistributed.
- **Routes.** There's an `opengraph-image.tsx` next to each page: `/`, `/showcase`, `/themes`, `/docs`, `/docs/{installation,theming,fonts,native}` and `/docs/[slug]` (one card per registry item, prerendered from `docs`, alt text via `generateImageMetadata`). All of them are static: built once, served from the CDN.
- **Sections.** `GROUP_CARD` in `scenes.tsx` gives each docs group a photo and a scene, so you can tell which section a card is from.
- **Metadata.** `src/lib/metadata.ts` (`pageMetadata`) gives every page `title`, `description`, a canonical URL, `openGraph` (type, url, siteName, locale) and `twitter` (`summary_large_image`, creator). Root defaults live in `src/app/layout.tsx`, and `metadataBase` makes image URLs absolute. Next copies the `opengraph-image` into `twitter:image`.

## Standards followed

- 1200×630 (1.91:1), JPEG, well under X's 5 MB and WhatsApp's ~600 KB practical limit. A photo card as PNG would be over 1 MB.
- Content stays inside a 64px safe margin, with nothing important near the edges (LinkedIn/Slack/Discord crop slightly).
- Absolute `og:image` with `og:image:width|height|type|alt`; `twitter:card=summary_large_image`.
- Title is at most 2 lines and the description is clamped to 2 lines. White on a scrimmed photo stays readable in light and dark feeds.

## Adding a page

Add its copy to `PAGES` in `src/lib/og/pages.ts`, export `metadata = pageMetadata(PAGES.<key>)` from the page, and add an `opengraph-image.tsx` beside it that calls `renderOg(PAGES.<key>)`. Preview it at `/<path>/opengraph-image`.

Next hashes only the `opengraph-image.tsx` file into the image URL, so X keeps a stale card after a change to `render.tsx` or `scenes.tsx`. Bump the `og-v` comment at the top of every `opengraph-image.tsx` on visual changes.
