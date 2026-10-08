---
name: ship-registry
description: Release glasscn — regenerate, run every check including the real install into a fresh Next app and the native check, build the docs site and registry with the right URL, and deploy. Use before merging registry changes, cutting a release, or deploying glasscn.
---

# Ship the registry

A registry is only correct if a stranger can install it. Every step below has caught a real bug.

## Checklist

```bash
pnpm generate                      # registry.json, site CSS, highlighted sources
pnpm typecheck                     # includes next typegen
pnpm lint
pnpm test                          # engine, chart maths, registry integrity
pnpm verify:install                # fresh Next app: shadcn init → add every web item + presets + a local theme → tsc → next build
pnpm verify:native                 # native items from the registry into a copy of sandbox/native → tsc
NEXT_PUBLIC_REGISTRY_URL=https://glasscn.app pnpm build
```

- `verify:install` takes ~3 minutes and needs the network (create-next-app, npm). Run it whenever items, files, dependencies or the stylesheet change. It caught: colliding file names, a deadlocked static server, and wrong preset ordering assumptions.
- `pnpm build` stamps `{REGISTRY_URL}`: `NEXT_PUBLIC_REGISTRY_URL`, else `https://glasscn.app` when `VERCEL` is set, else localhost. A local build without it ships localhost URLs in `public/r/*.json` — check one file before deploying.
- Look at the site: `/`, `/themes` (presets, a slider, export, share link), one component page, light and dark, phone width.

## Deploy

Vercel: framework Next.js, build command `pnpm build`, production domain `glasscn.app` is the default on Vercel (override with `NEXT_PUBLIC_REGISTRY_URL`). The registry is served from `/r/*.json` by the same deployment. Confirm `curl https://glasscn.app/r/button.json` returns JSON whose `registryDependencies` use the production host.

## Never

- Edit `registry.json` or any `*.generated.*` file by hand.
- Commit `public/r` (it's stamped per deploy).
- Make the GitHub repo public without the owner asking.
