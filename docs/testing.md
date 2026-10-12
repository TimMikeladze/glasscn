# Testing

- `pnpm test`: vitest, covering the theme engine and registry (node) and components (jsdom). No browser.
- `pnpm test:e2e`: Playwright against the running site (`e2e/`). Not part of `pnpm test`.
- `cd sandbox/native && npm test`: jest-expo component tests for the native items. See [Native](#native).

## Native

Three layers (NAT-50..54), cheapest first.

### Unit (root vitest)

`src/lib/native-theme.test.ts`: every palette × scheme in `registry/native/tokens.generated.ts` equals `toNativeTheme(createGlassTheme({ palette }))`, primary (and an OKLCH label) sits within ΔE<sub>OK</sub> 2 of its source, and `pnpm generate` is a no-op. `registry/native/*.test.ts` (vitest project `native`, `react-native` aliased to `src/test/react-native-stub.ts`) cover pure helpers: `chart-math`, `hitSlop`. Helpers that live inside component files (`placeFloating`, slider `snap`, the toaster store) need real react-native, so they're in the jest layer.

### Component (jest-expo)

`sandbox/native/__tests__/`, using the jest-expo `ios` preset and Testing Library 14. Config: `jest.config.js` (maps `@/components/glass/native/*` to `registry/native`, or to `GLASS_NATIVE_DIR`), `jest.resolver.js` (registry files resolve bare imports from the sandbox's `node_modules`, never the repo root's), `jest.setup.js` (mocks reanimated + worklets, gesture-handler, keyboard-controller, expo-blur/glass-effect/haptics/video, lucide, FlashList → FlatList) and `jest.expo-ui.js` (every `@expo/ui` entry point → plain views). Liquid Glass is reported available, so tests see the iOS 26 path.

- `controls.test.tsx`: switch, checkbox, slider and segmented control, checking role, `accessibilityState`/`accessibilityValue`, controlled and uncontrolled, disabled, adjustable increment.
- `demos.test.tsx`: renders every entry in `DEMOS`. Native's "Text strings must be rendered within a `<Text>`" invariant fails the test, and the structural check fails it if a `Glass variant="liquid" | "liquid-clear"` (or bare `interactive`) has a `Press dim` or a fading (opacity < 1 or animated) ancestor. `structure.test.tsx` proves the check catches both.
- `helpers.test.tsx`: `placeFloating`, `snap`, toaster store.

`pnpm verify:native` (NAT-54) copies the tests into the shadcn-installed app and runs them with `GLASS_NATIVE_DIR` pointing at the installed `src/components/glass/native`.

### E2E (Maestro)

Flows live in `sandbox/native/.maestro/`: `toast-swipe`, `slider-scroll` (horizontal drag moves the slider, vertical drag scrolls), `menu` (the system menu: open, pick, toast), `composer-keyboard` (input scrolls above the keyboard, one tap sends), and two visual flows: `screenshots` (the card demo per palette × scheme) and `screenshots-a11y` (Reduce Transparency and Increase Contrast, light and dark). `_open.yaml` cold-starts Expo Go and deep-links `?palette=&scheme=&still=1&force=…` (`still` forces Reduce Motion so the aurora is frozen; `force` turns a11y settings on). Needs Java 17 (`brew install openjdk@17`) and Maestro (`curl -fsSL https://get.maestro.mobile.dev | bash`):

```bash
cd sandbox/native && npx expo start --port 8091   # not CI=1 (stale bundles)
export JAVA_HOME=$(brew --prefix openjdk@17)
maestro --device <sim-udid> test -e APP_URL=exp://127.0.0.1:8091 --exclude-tags util .maestro/   # npm run e2e
npm run visual           # NAT-53: diff the latest visual runs against .maestro/baselines/ (status bar cropped; 0.5% budget; diffs in .maestro/diffs/)
npm run visual:update    # accept them as the new baselines
```

Maestro screenshots land in `~/.maestro/tests/<run>/`; `scripts/visual.mjs` picks the newest run of every "Visual baselines …" flow. Match text carefully: a section heading with the same text as a button is matched first (use `index:` or a `testID` → `id:`). The first Maestro run on a fresh simulator can crash Expo Go inside Apple's XCTest automation thread; re-run.

Maestro isn't wired into CI. It would need a macOS runner with a booted iOS 26 simulator, Expo Go and Metro, then the commands above (CI only runs on `main` and PRs). Android would run on an emulator with `appId` switched. forceRTL and the largest Dynamic Type need a native restart; set them in the simulator's settings and re-run the flows.

## End-to-end (`e2e/`)

```bash
pnpm exec playwright install chromium webkit firefox   # once
pnpm test:e2e                                          # whole suite
pnpm test:e2e e2e/a11y.spec.ts --project chromium      # one spec
pnpm test:e2e:update                                   # re-record screenshots after an intended visual change
```

It reuses a dev server on `E2E_BASE_URL` (default `http://localhost:3011`) and starts `next dev` on that port if none is running. If something else is on that port, point `E2E_BASE_URL` elsewhere rather than stopping a server you already have.

| Spec | Roadmap | Checks |
|---|---|---|
| `a11y.spec.ts` | QA-02, A11Y-06 | axe (WCAG 2.1 A/AA) on every `/docs/*` page and `/themes`; `/themes` and the blocks again in light/dark × matte/smoked |
| `visual.spec.ts` | QA-03 | `toHaveScreenshot` of docs previews (button, card, tabs, slider, dashboard-01) × dusk/ocean/rose × light/dark × shape-square/density-compact. Baselines in `e2e/__screenshots__`, Chromium only |
| `liquid-surfaces.spec.ts` | QA-09 | Chromium, WebKit and Firefox: glass surfaces render with a `backdrop-filter` blur, so refraction degrades to frost, never to nothing |
| `blur-budget.spec.ts` | UX-04 | ≤ 12 elements with a `backdrop-filter` in the initial 1440×900 viewport of `/`, `/docs`, `/docs/button`, `/docs/dashboard-01`, `/themes` |

Themes are applied the way the site persists them: `glasscn-palette`, `theme` and `glasscn-custom-css` (preset items' `cssVars`) in localStorage before first paint (`e2e/theme.ts`). Screenshots run with reduced motion, so the aurora is still.
