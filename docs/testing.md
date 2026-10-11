# Testing

- `pnpm test` — vitest: the theme engine and registry (node) and components (jsdom). Fast, no browser.
- `pnpm test:e2e` — Playwright against the running site (`e2e/`). Not part of `pnpm test`.

## End-to-end (`e2e/`)

```bash
pnpm exec playwright install chromium webkit firefox   # once
pnpm test:e2e                                          # whole suite
pnpm test:e2e e2e/a11y.spec.ts --project chromium      # one spec
pnpm test:e2e:update                                   # re-record screenshots after an intended visual change
```

It reuses a dev server on `E2E_BASE_URL` (default `http://localhost:3011`) and starts `next dev` on that port if none is running — point it elsewhere rather than stopping a server you already have.

| Spec | Roadmap | Checks |
|---|---|---|
| `a11y.spec.ts` | QA-02, A11Y-06 | axe (WCAG 2.1 A/AA) on every `/docs/*` page and `/themes`; `/themes` and the blocks again in light/dark × matte/smoked |
| `visual.spec.ts` | QA-03 | `toHaveScreenshot` of docs previews (button, card, tabs, slider, dashboard-01) × dusk/ocean/rose × light/dark × shape-square/density-compact. Baselines in `e2e/__screenshots__`, Chromium only |
| `liquid-surfaces.spec.ts` | QA-09 | Chromium, WebKit and Firefox: glass surfaces render with a `backdrop-filter` blur — refraction degrades to frost, never to nothing |
| `blur-budget.spec.ts` | UX-04 | ≤ 12 elements with a `backdrop-filter` in the initial 1440×900 viewport of `/`, `/docs`, `/docs/button`, `/docs/dashboard-01`, `/themes` |

Themes are applied the way the site persists them — `glasscn-palette`, `theme` and `glasscn-custom-css` (preset items' `cssVars`) in localStorage before first paint (`e2e/theme.ts`). Screenshots run with reduced motion, so the aurora is still.
