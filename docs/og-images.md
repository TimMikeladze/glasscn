# Social share images (Open Graph)

Every page has a generated 1200×630 PNG share card and full Open Graph + Twitter/X metadata, so links unfurl on X, LinkedIn, Facebook, Slack, Discord, iMessage, WhatsApp, Telegram and Bluesky.

## How it works

- **Renderer.** `src/lib/og/render.tsx` (`renderOg`) is one template built with `next/og` (`ImageResponse`, Satori). It draws a frosted glass card over an aurora taken from a real palette in `PALETTES` (dark scheme), with the glasscn mark, an eyebrow pill, a title sized to its length, a 2-line description and a footer (install command or URL). Geist Bold/Medium and Geist Mono Medium are vendored in `src/lib/og/fonts` (OFL), because Satori can't read woff2 and fetching fonts at build time is flaky.
- **Colours.** `src/lib/og/colors.ts` (`ogColors`) converts a palette's OKLCH tokens to hex, since Satori has no `oklch()`. Each docs group maps to its own palette (`GROUP_PALETTE`), so you can tell which section a card is from.
- **Routes.** There's an `opengraph-image.tsx` file next to each page: `/`, `/themes`, `/docs`, `/docs/{installation,theming,fonts,native}` and `/docs/[slug]` (one card per registry item, prerendered from `docs`, alt text via `generateImageMetadata`). All of them are static: built once, served from the CDN.
- **Metadata.** `src/lib/metadata.ts` (`pageMetadata`) gives every page `title`, `description`, a canonical URL, `openGraph` (type, url, siteName, locale) and `twitter` (`summary_large_image`, creator). Root defaults live in `src/app/layout.tsx`, and `metadataBase` makes image URLs absolute. Next copies the `opengraph-image` into `twitter:image`.

## Standards followed

- 1200×630 (1.91:1), PNG, well under X's 5 MB and WhatsApp's ~600 KB practical limit.
- Content stays inside a 64px safe margin, with nothing important near the edges (LinkedIn/Slack/Discord crop slightly).
- Absolute `og:image` with `og:image:width|height|type|alt`; `twitter:card=summary_large_image`.
- Title is at most 2 lines and the description is clamped to 2 lines. White on a dark ground stays readable in both light and dark feeds.

## Adding a page

Export `metadata = pageMetadata({ title, description, path })` from the page and add an `opengraph-image.tsx` beside it that calls `renderOg`. Preview it at `/<path>/opengraph-image`.
