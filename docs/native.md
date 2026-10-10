# Native twins: every component on iOS, Android and web

Every web component and block has a React Native twin, `native-<name>`. It's one file that renders on iOS and Android, and on the web through react-native-web. Like the web items, each one installs standalone through the shadcn CLI.

## Decisions

- **One file per item, same name and API.** `registry/native/<name>.tsx` exports the web file's components, parts and variant props. `className` becomes `style`, and `asChild` is dropped. Controlled and uncontrolled state follow Radix (`value`/`onValueChange`, `open`/`onOpenChange`, `defaultValue`).
- **Plain React Native only.** No Tailwind, Radix or DOM. Surfaces are `Glass` and tappables are `Press`. Overlays are `Modal` plus `measureInWindow` anchors, sliders use `PanResponder`, and sliding thumbs use `onLayout` (because `use-sliding-indicator` is DOM-only). Charts are `react-native-svg` on `chart-math`, because `@tanstack/charts` renders DOM SVG.
- **Tokens as values.** `native-ui` gives the web theme's radii, control heights, padding, type scale, `chart-1…5`, destructive and motion as numbers (`useUI()`), on top of `native-tokens`. `GText` sets all text. Presets (material, shape, motion, type, density) stay CSS-only for now.
- **Standalone install.** A twin's npm deps and `native-*` registry deps are read from its imports in `registry/items.mjs`, so `shadcn add …/native-dialog.json` brings `native-glass`, `native-ui` and the rest with it. `registry.test.mjs` already checks that every import is covered.
- **Icons** come from `lucide-react-native`. `data-table` keeps `@tanstack/react-table` because it's headless.

## Verification

- `sandbox/native` lists every twin at `/c/<name>`, with demos in `src/sandbox/demos/<group>.tsx`.
- `pnpm verify:native` installs every native item from a local registry into a copy of the sandbox and type-checks it.
- Then look at it: run `npm run web` in the browser and `npm run ios` on the iOS 26 simulator.
