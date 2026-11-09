# Apple system appearance as the default

Every default (the theme engine, `glass-style`, the docs site, the showcase, the Studio and the native sandbox) starts from Apple's default iOS/macOS appearance in light and dark, following the OS scheme. The coloured palettes (Dusk, Ocean…) stay available as choices. No backwards compatibility.

## What "default" means

Values are iOS/macOS 27: the HIG Color specification for the system colours, read back from the macOS 27.2 SDK (`NSColor.system*`), which matches the HIG where both publish a value.

| Role | Web (light / dark) | Native iOS (light / dark) | Apple name |
| --- | --- | --- | --- |
| Accent | `#0071E3` held at 5:1 with white, both schemes | `#0088FF` / `#0091FF`, Increase Contrast `#1E6EF4` / `#5CB8FF` | Apple's web blue / systemBlue |
| Label on the accent | white, semibold | white, semibold | n/a |
| Destructive | `#E30000` / systemRed dark | `#FF383C` / `#FF4245` | apple.com red / systemRed |
| Charts | systemBlue (accent), green, orange, purple, pink, indigo, teal, gray | same, exact | system colours |
| Page ground | `#F2F2F7` / `#000000` | same | systemGroupedBackground |
| Cards, sheets | white / `#1C1C1E`, popovers `#2C2C2E` | same | secondarySystemBackground, elevated |
| Label | black / white | system label | label |
| Secondary text | Apple's `#3C3C43` grey held opaque on glass; a darker grey on the site's own fills | system secondaryLabel | secondaryLabel |
| Aurora | none | none | n/a |
| Type | San Francisco (`system` type preset) | system font, iOS text-style sizes | SF Pro / SF Rounded / SF Mono |

Why the web accent differs from iOS: white on iOS 27 systemBlue is 3.5:1. Apple's HIG accepts 3:1 for bold text, and native button labels are semibold, so iOS keeps the exact colour. The web is held to WCAG AA by axe on every docs page, which treats a 14–17 px semibold label as normal text. `#0071E3` is the blue Apple's own website uses for filled buttons for the same reason. Under the System palette, native system controls keep their native tints (a green switch), and custom controls use the same iOS colours, so one screen never shows two blues.

## Pieces

- `src/lib/glass-theme.ts`: a `system` palette first in `PALETTES`, built from the values above; `createGlassTheme()` defaults to `palette: "system"` and `type: "system"`; schema defaults for colour, material and depth tokens move to the same values so `glass-style` alone looks like the system. Dusk loses "the default". The `default` type preset is retitled "App fonts".
- Site: palette provider, Studio start recipe and generated CSS default to System; the site's Geist font is replaced by the system stack.
- Native: `buildGlassTheme`/`useGlassTheme` and the sandbox default to `system`; `tokens.generated.ts` gains the palette.
- Tests: legibility matrix covers the new palette; visual baselines for the default page are regenerated; tests that assumed Dusk name it explicitly.
- Docs: README, theming, native docs and the CHANGELOG say System is the default.

## Verification

`pnpm typecheck && pnpm lint && pnpm test`, Playwright with updated visual baselines, native Jest, `verify:install`, `verify:native`, then `/`, `/showcase`, `/themes` and the native scenes in light and dark.
