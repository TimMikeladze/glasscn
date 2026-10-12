# Native sandbox

An Expo app in `sandbox/native/` that renders every `native-*` item, so the native track can be seen and checked.

## Decisions

- **Live source, not a copy.** The sandbox imports `@/components/glass/native/*`. For the type-checker, `tsconfig.json` points it at `../../registry/native/*` (plus a catch-all `*` so registry files resolve `react-native` from the sandbox). Metro ignores tsconfig paths (`experiments.tsconfigPaths: false`, since it would apply the catch-all too) and maps the `@/` aliases in `metro.config.js`, which also watches `registry/native`. Edit a registry file, the sandbox hot-reloads.
- **Standalone package, npm.** Its own `package.json` + `package-lock.json`, not a pnpm workspace member, so the site's install stays untouched, and Expo's tooling (`npx expo install`) works best with npm. Excluded from the root tsconfig, eslint and vitest.
- **Expo Router, one screen per check.** `index` lists items; each screen exercises one item across palettes and schemes. A global header picks palette + scheme through `GlassThemeProvider`.
- **Runs on Expo Go, the iOS simulator and web.** Every dependency is in the Expo Go SDK (`expo-blur`, `expo-glass-effect`, `expo-haptics`, `react-native-svg`). Web uses react-native-web, so the browser agent can screenshot it.
- **The install check uses the sandbox.** `node scripts/verify-native.mjs` defaults to `sandbox/native`: it copies the app, drops the alias to `registry/native`, `shadcn add`s every native item from a local registry, and type-checks. That proves the shipped files work, not just the live ones.

## Screens

| Route | Checks |
|---|---|
| `/` | Index of items, the platform and the surface `Glass` picked; theme picker |
| `/tokens` | Preset pickers (material, shape, motion, density, type) and force-a11y chips (`forceA11y`: Reduce Motion / Transparency, Increase Contrast, Bold Text), then every `useGlassTheme()` value as a swatch |
| `/glass` | `Glass` default, tinted, `raised` off, `interactive`, `bar`; which surface the platform picked (`hasLiquidGlass()`, `canFade()`) |
| `/aurora` | Full-screen aurora per palette; reduced motion note |
| `/press` | `Press` with haptic, custom squash, hover, disabled |
| `/c/<name>` | Every ported component and block (`native-<name>`), every prop and variant: demos in `src/sandbox/demos/<group>.tsx` (basics, controls, forms, overlays, navigation, data, composite), keyed by registry name. Later groups win a key: `navigation` holds the M4 `dock` and `tabs` demos. Bar demos (dock, toolbar, navigation-bar, scroll-edge) run in a short scrolling stage wrapped in `ScrollEdgeProvider`, so minimize-on-scroll shows inside the page |
| `/tabs-layout` | The `native-tabs-layout` recipe as a real route group (`app/tabs-layout/`): NativeTabs with minimize on scroll, a bottom accessory reading its placement, a badge and a `role="search"` tab |

## Commands

```bash
cd sandbox/native && npm install
npm run ios        # Expo Go on the booted simulator
npm run web        # react-native-web in the browser
npm run typecheck  # sandbox screens + registry/native
npm test           # jest-expo component tests (docs/testing.md#native)
pnpm verify:native # from the repo root: install-from-registry check
```

The theme picker lists all 12 generated palettes. A deep link's `?palette=ocean&scheme=dark` query sets them on launch (Maestro's screenshot flow uses it).

Don't start Metro with `CI=1`. It turns off the file watcher and serves stale bundles.

Overlays that present system UI (the `@expo/ui` bottom sheet, system menus, `FullWindowOverlay` toasts, NativeTabs) only show their native form on the iOS simulator or Android; the web renders the React Native fallback (glass sheet and menu).

## Adding a native item

- **Component twin** (`registry/native/<web-name>.tsx`): add the name to `NATIVE_NAMES` in `registry/items.mjs` (deps and registry deps are read from its imports) and a demo under its name in the right `src/sandbox/demos/<group>.tsx`. The index and `/c/<name>` pick it up. `verify:native` installs every native item.
- **Route recipe** (a layout like `tabs-layout`): add a route group under `sandbox/native/src/app/<name>/`, link it from `ITEMS` and title it in `_layout.tsx`, and give it a link demo under its name.
- **Foundation item:** add a screen under `sandbox/native/src/app/<name>.tsx`, link it from `ITEMS` in `src/app/index.tsx` and title it in `src/app/_layout.tsx`.
