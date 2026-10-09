# Native sandbox

An Expo app in `sandbox/native/` that renders every `native-*` item, so the native track can be seen and checked.

## Decisions

- **Live source, not a copy.** The sandbox imports `@/components/glass/native/*`. For the type-checker, `tsconfig.json` points it at `../../registry/native/*` (plus a catch-all `*` so registry files resolve `react-native` from the sandbox). Metro ignores tsconfig paths (`experiments.tsconfigPaths: false` — it would apply the catch-all too) and maps the `@/` aliases in `metro.config.js`, which also watches `registry/native`. Edit a registry file, the sandbox hot-reloads.
- **Standalone package, npm.** Its own `package.json` + `package-lock.json`, not a pnpm workspace member — the site's install stays untouched, and Expo's tooling (`npx expo install`) is happiest with npm. Excluded from the root tsconfig, eslint and vitest.
- **Expo Router, one screen per check.** `index` lists items; each screen exercises one item across palettes and schemes. A global header picks palette + scheme through `GlassThemeProvider`.
- **Runs on Expo Go, the iOS simulator and web.** Every dependency is in the Expo Go SDK (`expo-blur`, `expo-glass-effect`, `expo-haptics`, `react-native-svg`). Web uses react-native-web, so the browser agent can screenshot it.
- **The install check uses the sandbox.** `node scripts/verify-native.mjs` defaults to `sandbox/native`: it copies the app, drops the alias to `registry/native`, `shadcn add`s every native item from a local registry, and type-checks — proving the shipped files work, not just the live ones.

## Screens

| Route | Checks |
|---|---|
| `/` | Index of items, the platform and the surface `Glass` picked; theme picker |
| `/tokens` | Every `useGlassTheme()` value as a swatch, for the current palette + scheme |
| `/glass` | `Glass` default, tinted, `raised` off, `interactive`, `bar`; which surface the platform picked (`hasLiquidGlass()`, `canFade()`) |
| `/aurora` | Full-screen aurora per palette; reduced motion note |
| `/press` | `Press` with haptic, custom squash, hover, disabled |

## Commands

```bash
cd sandbox/native && npm install
npm run ios        # Expo Go on the booted simulator
npm run web        # react-native-web in the browser
npm run typecheck  # sandbox screens + registry/native
pnpm verify:native # from the repo root: install-from-registry check
```

Don't start Metro with `CI=1` — it turns off the file watcher and serves stale bundles.

## Adding a native item

Add a screen under `sandbox/native/src/app/<name>.tsx`, link it from `ITEMS` in `src/app/index.tsx`, title it in `src/app/_layout.tsx`, and add the item to `items` + the check file in `scripts/verify-native.mjs`.
