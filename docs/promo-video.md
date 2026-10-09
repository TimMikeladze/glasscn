# Promo video

A ~40 s, 1920×1080, 30 fps MP4 for X/Twitter that runs through the registry on the real site, then frames it in device mock-ups across themes. Lives in `video/` (own `package.json`, Playwright only — not part of the app build).

## Approach

Two deterministic passes, no screen recording (Playwright's recorder is low-bitrate VP8):

1. **Capture** (`video/capture.mjs`) — drives the running dev site and saves crisp PNGs to `video/shots/`:
   - every `registry:ui` component's docs preview (`/docs/<name>`), cycling palettes and schemes;
   - the landing page, full height, desktop (1440 wide);
   - `dashboard-01` / `analytics-01` previews under several palette × material × shape themes;
   - mobile (390×844 @3x) full pages of the landing, a docs page and `/themes`, one per theme.
   Themes are applied the way the site does it: `glasscn-palette` in localStorage, scheme via next-themes' `theme` key, and material/shape presets as `glasscn-custom-css` built from the `registry:theme` items' `cssVars` in `registry.json`.
2. **Render** (`video/render.mjs`) — loads `video/stage.html` (one timeline, all motion a pure function of `t`), seeks to each frame via `window.seek(t)`, screenshots, and pipes to `ffmpeg` (H.264, yuv420p, CRF 18, `+faststart`) → `video/out/glasscn.mp4`.

## Timeline

| s | Scene |
|---|---|
| 0–3 | Title on aurora: "glasscn — Glass, for shadcn." |
| 3–13 | Component wall: every component tile flies in, camera drifts, count ticker |
| 13–20 | Browser window: landing page scrolls |
| 20–28 | Laptop: dashboard re-themes (palette · material · shape label) |
| 28–35 | Three phones, each a different theme, scrolling |
| 35–40 | Install command + glasscn.app |

## Run

```bash
pnpm dev                       # any port; pass it as BASE_URL
cd video && npm install
BASE_URL=http://localhost:3000 npm run build
```
