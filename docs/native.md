# Use glasscn on iOS, Android and React Native Web

Native registry items install as `native-<name>` and export the web component's parts and prop names. `style` replaces `className`. Triggers support `asChild`, controlled and uncontrolled state work, and every item declares its own native dependencies.

```tsx
import { LiquidGlass } from "@/components/glass/native/liquid-glass"
import { Press } from "@/components/glass/native/press"
import { GText } from "@/components/glass/native/ui"

<Press liquid accessibilityLabel="Add entry" onPress={addEntry}>
  <LiquidGlass interactive style={{ padding: 16 }}>
    <GText>Add entry</GText>
  </LiquidGlass>
</Press>
```

On iOS 27 this uses the OS Liquid Glass effect. It inherits the system's current diffusion, refraction and accessibility treatment. It has no default tint. `tint` opts into a color; `colorScheme` opts into an appearance override. An explicitly forced `GlassThemeProvider scheme` also applies to its effects. Otherwise appearance follows the OS. Apple's shader, opacity tables and spring constants are not copied into tokens. The [source study](research/apple-liquid-glass-2026-11.md) and [native audit](research/native-liquid-glass-audit.md) distinguish system behavior from glasscn choices.

Inside untinted regular glass, `GText` and `GIcon` resolve neutral token colors to UIKit's dynamic semantic labels. They follow the effect's light/dark adaptation and vibrancy even when pale media sits under a dark app. Palette accents use dynamic light/dark palette values; a raw `primary` override remains explicit. Wrap a custom Lucide icon with `<GIcon><PlayIcon /></GIcon>`. A custom text input can call `useGlassForeground()` in a child rendered inside `Glass`; calling the hook before rendering the surface does not read that surface's context.

## Choose the layer

Use `Glass variant="material"` for content panes, cards and grouped lists. Use `LiquidGlass` or `Glass variant="liquid"` for floating controls, toolbars and menus. Children of a liquid surface use fills; nested liquid surfaces keep their shape/tint without starting another effect. `GlassGroup` shares one capsule. `GlassEffectGroup` groups separate sibling effects so iOS can merge them.

Clear glass belongs over media. Dim bright media **behind** the controls, and omit the dim for dark media or a player that already supplies it:

```tsx
<View style={{ minHeight: 320 }}>
  <Backdrop variant="image" src={photoUrl} dim={0.35} />
  <LiquidGlass variant="clear" style={{ position: "absolute", bottom: 16, left: 16, padding: 16 }}>
    <GText>Pause</GText>
  </LiquidGlass>
</View>
```

Clear surfaces do not add another scrim. Their `GText` labels are bright in both app schemes. Reduce Transparency replaces the effect with opaque frost and restores the scheme's normal label colors.

Android uses its platform controls and materials. `GlassBlurTarget` enables the optional Android blur tier; without a target, surfaces use fills. React Native Web uses generated blur, clear blur, saturation and brightness values. These fallback materials approximate the appearance; they are not Apple's renderer. There is no AppKit/React Native macOS build in this repository.

## Use system controls and navigation

Supported switches, single-value sliders, plain-text segmented controls, date pickers, menus and bottom sheets use `@expo/ui`. These inherit platform rendering and interaction. Custom ranges, ticks, icons and other unsupported combinations use the React Native implementation. `native={false}` selects that path explicitly. Custom switch/slider/segmented tracking runs through Gesture Handler and Reanimated shared values; JS receives discrete value changes and commits. Held custom thumbs become glass lenses.

An isolated system control keeps its OS accent and appearance. A provider only changes its accent when a coloured `palette` or raw `tokens.primary` is specified, and only forces appearance when `scheme` is specified. The default `system` palette is the OS's own appearance, so system controls keep their native tints under it (a green iOS switch, the user's accent elsewhere). Other presets never seed a system control's accent.

Use `GlassTabs` from `native-tabs-layout` for app-level tabs. It wraps Expo Router `NativeTabs` and leaves `minimizeBehavior="automatic"` to the OS. Pass `"onScrollDown"` explicitly when that behavior suits the screen. Search tabs and the bottom accessory remain system components. Use `Dock` for controls inside a screen.

An inline `DockAccessory` takes the space left beside the collapsed destination and search button. Expanded `DockSearch` takes the row and temporarily hides the accessory, destination bar and action; Cancel restores them. Its `expanded` / `onExpandedChange` props work as a controlled pair.

`DockItem` labels keep their size at every text size, as a tab bar's do, and a long press at an accessibility size shows the item in the iOS Large Content Viewer (`accessibilityShowsLargeContentViewer`). Don't swap the bar for a vertical list at large sizes: fold it instead. The Music scene in `native-liquid-glass-01` passes `minimized` at accessibility sizes, so the bar starts as the current tab and Search; tapping the tab opens the bar and choosing one folds it again.

Wide custom sidebars meet the window edges; compact overlays remain separate presentations. Symbols carry the accent while row labels stay neutral. Custom top toolbars join a uniform region when content scrolls beneath them. `ScrollEdge variant="automatic"` is the default React Native approximation of this 27 treatment: near-uniform under a top bar, a shorter fade behind a floating bottom bar, and every variant fades to nothing at its inner end so it never cuts a line of text. `soft` and `hard` remain explicit custom choices. System navigation keeps its own automatic chrome.

`GlassEffectGroup` renders a system `GlassContainer`, which draws its effects in the window's appearance and takes no `colorScheme`. When a theme forces the other scheme, the group keeps separate effects (which do follow it) and loses only the merging; pass `merge` for clear controls over media, where merging matters more than appearance. A `Dock` orders its minimized row itself (folded tab, accessory, search) because Yoga has no CSS `order`, and sizes `DockSearch` to the bar beside it through `SearchField collapsedSize`.

Props must survive the system/custom choice. On iOS, system sheets support `detent`, `defaultDetent`, `onDetentChange`, `anchor` and `modal={false}` through SwiftUI presentation modifiers. Controlled detents resynchronize when the parent rejects a drag. `onBeforeDismiss` requires the custom path because the bridge cannot asynchronously veto system dismissal. Android uses the custom path for detent control and nonmodal interaction; `native={false}` explicitly selects the custom implementation. An iOS menu with controlled/open-change state uses the custom path because its Expo system wrapper does not expose open/close notifications.

Plain iOS `Button` content with supported props uses the actual SwiftUI glass/prominent style when its callback is `onAction={() => …}`. `onPress` preserves the React Native event and selects the custom implementation. Rich content, loading and unsupported styles also select that path. No callback's signature is guessed from its declared argument count.

Plain, uncontrolled, enabled iOS `ActionSheet` choices similarly use the source-attached SwiftUI `ConfirmationDialog` with eventless Action `onAction`. The system owns anchoring, layout and Cancel visibility. Controlled state, a `disabled` action (SwiftUI's dialog leaves disabled actions out), RN action `onPress`, preferred/rich/styled actions or any Cancel callback select custom; `native={false}` explicitly does too. Expo's cancel-role closure also runs on passive dismissal, so it cannot safely implement a callback reserved for an explicit Cancel tap. Passive dismissal still reports one `onOpenChange(false)` without invoking a custom Cancel action.

The custom sheet matches the system one: with an `ActionSheetTrigger` it opens beside the trigger (above it when there's no room below), lists its choices as capsules and leaves Cancel out, and tapping outside closes it. With no trigger, opened through `open`, it rises from the bottom edge with its Cancel capsule.

`ToolbarCommands` measures declarative commands and allocates priorities, pinned actions and More on both tracks. It shares one pure allocator generated into `registry/native/toolbar-layout.ts`. It composes controls rather than acquiring SwiftUI `ToolbarItem` semantics. `GlassMorph`/`GlassMorphItem` use a SwiftUI namespace and `glassEffectId` for stable sibling identities; explicit named unions and transition-policy modifiers remain unavailable in this Expo bridge. Items that move animate, and nearby surfaces fuse while they pass. Items that are inserted or removed appear and leave in place: Expo UI 57 mounts hosted React Native children outside the animation transaction, so they don't morph out of a neighbour. `accessibilityState={{ selected }}` adds the selected trait on iOS.

`BackgroundExtension` extends only its image under leading/trailing chrome and renders foreground children once. Expo UI has no `backgroundExtensionEffect` modifier, so this is an image composition (a mirrored, blurred copy beside the photo), not a bridge to SwiftUI's effect. Give it `start`/`end` wherever chrome covers the image, at any width; the `background-extension` sandbox demo puts a sidebar over it at phone width.

The iOS system sheet hosts bounded, scrolling React Native content in a single SwiftUI environment. Its foreground follows the physical native presentation. SDK 57's `Host.colorScheme` sets a SwiftUI environment value; it does not expose `preferredColorScheme` for the presentation chrome. A forced preview scheme can therefore differ from the sheet's OS appearance. Test sheet chrome with the simulator's matching appearance as well as the forced preview.

## Animate without hiding the effect

Keep native glass and its ancestors at opacity 1. `Press` does not dim by default. A disabled glass control dims its label, and overlay motion uses transforms or effect materialization. Reduce Motion removes elasticity and turns off native effect animation.

`visible={false}` hides an entire surface from layout, hit testing and accessibility. `materialized={false}` animates only its system effect and keeps content geometry mounted; overlays use this while `usePresence` finishes their exit. Neither fades a glass ancestor. See the [native rules](rules/native.md) and [Expo GlassEffect reference](https://docs.expo.dev/versions/v57.0.0/sdk/glass-effect/).

## Theme native components

`pnpm generate` converts the web engine through `toNativeTheme()` into `registry/native/tokens.generated.ts`. Do not edit that file. `GlassThemeProvider` selects palettes, material/shape/motion/density/type presets, fonts and raw token overrides; nested providers inherit unset options. `useUI()` exposes the resolved values and eight chart colors. Charts render with `react-native-svg` and the native chart helpers; headless tables use TanStack Table.

Accessibility settings come from `native-a11y`: live Reduce Motion, Reduce Transparency, Increase Contrast and Bold Text observations, announcements and the 44pt target policy. The sandbox can force settings for inspection. A mocked observation is not evidence that a system control renders correctly on a device.

`GText` has no implicit Dynamic Type cap (`maxFontSizeMultiplier={0}`). Its custom font weight responds to Bold Text. Text containers use minimum heights so accessibility sizes can grow them; a caller can still set an explicit font multiplier for constrained content. On iOS it chooses a semantic `dynamicTypeRamp` from its size: caption1/subheadline/body/title3/title2/title1/largeTitle. An explicit ramp overrides that default. The sizes themselves are Apple's defaults for those styles on iOS (`xs` 12, `sm` 15, `base` 17, `lg` 20, `xl` 22, `2xl` 28, `3xl` 34, times the type preset's scale); Android and the web keep the theme's modular scale. This keeps scaled glyphs inside their line boxes at the largest accessibility sizes.

## Verify an item

1. Run `pnpm verify:native` to install all native registry items into a fresh sandbox copy, type-check and run its component suite.
2. Run `cd sandbox/native && npm run ios`; inspect `/c/<name>` on iOS 27 in light/dark, accessibility modes and large Dynamic Type.
3. Run `npm run web` in the sandbox to inspect the React Native Web path. Use the Android emulator when available.

The component suite checks contracts, semantics and forbidden fading ancestors. Its native effects and Expo UI controls are mocked. Refraction, actual native menu/sheet presentation and gesture performance require runtime inspection; see [testing](testing.md).
