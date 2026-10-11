# Testing

- `pnpm test` — vitest: the theme engine and registry (node) and components (jsdom). Fast, no browser.
- `pnpm test:e2e` — Playwright against the running site (`e2e/`). Not part of `pnpm test`.
- `cd sandbox/native && npm test` — jest-expo component tests for the native items. See [Native](#native).

## Native

Three layers (NAT-50..54), cheapest first.

**Unit — root vitest.** `src/lib/native-theme.test.ts`: every palette × scheme in `registry/native/tokens.generated.ts` equals `toNativeTheme(createGlassTheme({ palette }))`, primary (and an OKLCH label) sits within ΔE<sub>OK</sub> 2 of its source, and `pnpm generate` is a no-op. `registry/native/*.test.ts` (vitest project `native`, `react-native` aliased to `src/test/react-native-stub.ts`) cover pure helpers: `chart-math`, `hitSlop`. Helpers that live inside component files (`placeFloating`, slider `snap`, the toaster store) need real react-native, so they're in the jest layer.

**Component — `sandbox/native/__tests__/` (jest-expo `ios` preset + Testing Library 14).** Config: `jest.config.js` (maps `@/components/glass/native/*` to `registry/native`, or to `GLASS_NATIVE_DIR`), `jest.resolver.js` (registry files resolve bare imports from the sandbox's `node_modules`, never the repo root's), `jest.setup.js` (mocks reanimated + worklets, gesture-handler, keyboard-controller, expo-blur/glass-effect/haptics/video, lucide, FlashList → FlatList) and `jest.expo-ui.js` (every `@expo/ui` entry point → plain views). Liquid Glass is reported available, so tests see the iOS 26 path.
- `controls.test.tsx` — switch, checkbox, slider, segmented control: role, `accessibilityState`/`accessibilityValue`, controlled and uncontrolled, disabled, adjustable increment.
- `demos.test.tsx` — renders **every** entry in `DEMOS`: native's "Text strings must be rendered within a `<Text>`" invariant fails the test, and the structural check fails it if a `Glass variant="liquid" | "liquid-clear"` (or bare `interactive`) has a `Press dim` or a fading (opacity < 1 or animated) ancestor. `structure.test.tsx` proves the check catches both.
- `helpers.test.tsx` — `placeFloating`, `snap`, toaster store.

`pnpm verify:native` (NAT-54) copies the tests into the shadcn-installed app and runs them with `GLASS_NATIVE_DIR` pointing at the installed `src/components/glass/native`.

**E2E — Maestro (`sandbox/native/.maestro/`).** Flows: `toast-swipe`, `slider-scroll` (slider inside the ScrollView), `menu`, `composer-keyboard`, and `screenshots` (the card demo per palette × scheme, via the sandbox's `?palette=&scheme=` deep-link query — NAT-53 baselines land in `.maestro/screenshots/`). Needs Java 17 and Maestro (`curl -fsSL https://get.maestro.mobile.dev | bash`):

```bash
cd sandbox/native && npx expo start --port 8091   # not CI=1 (stale bundles)
JAVA_HOME=$(brew --prefix openjdk@17) maestro --device <sim-udid> test -e APP_URL=exp://127.0.0.1:8091 .maestro
```

CI: a macOS job boots an iOS 26 simulator, installs Expo Go (or a dev build), starts Metro and runs the same command; Android runs on an emulator with `appId` switched. Not wired yet — flows run locally. The forceRTL / largest Dynamic Type / Reduce Transparency / Increase Contrast variants (NAT-52) use the sandbox's force-a11y chips on `/tokens` (or simulator settings).

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
