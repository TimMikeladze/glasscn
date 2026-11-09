# Apple Liquid Glass: verified platform behavior

Research checked on November 8, 2026. Use this report with the implementation audits. An existing glasscn component, token, screenshot, or earlier research note does not establish Apple parity.

## Target the 27 releases

Apple's current public pages identify **iOS 27** and **macOS 27 Golden Gate**. The requested versions are available references; this work must not silently target the original 26 appearance. The public [iOS page](https://www.apple.com/os/ios/), [macOS page](https://www.apple.com/os/macos/), and [Apple Design Resources](https://developer.apple.com/design/resources/) agree on the 27 generation. Design Resources provides iOS/iPadOS 27 and macOS 27 UI kits for Figma and Sketch.

Use current HIG/API documentation for component semantics. Use WWDC26 to resolve changes from the 2025 introduction. Historical videos still explain mechanics, but their sidebar insets, menu icon density, and soft scroll-edge default are superseded.

Keep release and beta references separate. On the research date, Apple's [Safari release index](https://developer.apple.com/documentation/safari-release-notes/) lists 27.2 as released and 27.3 as beta. The [27.3 beta notes](https://developer.apple.com/documentation/safari-release-notes/safari-27_3-release-notes) add Vertical Tabs and Adaptive Dark Mode; these are not assumed stable defaults. The [iPhone 27 guide](https://support.apple.com/en-my/guide/iphone/ipha9ffea1a3/27/ios/27) still documents Compact, Bottom, and Top layouts. A bottom-bar recreation represents one supported layout, not every Safari mode.

| Change in 27 | Consequence for a port | Evidence |
| --- | --- | --- |
| Stronger diffusion of complex backgrounds; darker edge; brighter specular highlights; user slider from clear to tinted | Refine the material itself and expose adjustable clarity on web | [WWDC26 State of the Union, design updates](https://developer.apple.com/videos/play/wwdc2026/102/) |
| Mac/iPad sidebars reach window edges; sidebar icons regain accent color; Mac windows use a consistent tighter radius | Remove the original 26 inset-sidebar default; preserve content beneath it | [WWDC26 State of the Union](https://developer.apple.com/videos/play/wwdc2026/102/) |
| A uniform toolbar appears when content scrolls beneath floating bars | A floating pill's shadow alone does not represent the current top-edge treatment | [WWDC26 State of the Union](https://developer.apple.com/videos/play/wwdc2026/102/) |
| UIKit `.automatic` scroll-edge has its own visuals, rather than selecting `.soft` or `.hard` | Add an automatic mode; re-evaluate explicit soft overrides | [Modernize your UIKit app, 10:52 onward](https://developer.apple.com/videos/play/wwdc2026/278/?time=652) |
| Mac automatic edge becomes hard with free-floating title text; sidebar selection becomes semibold; interactive custom glass gains click response | Keep title contrast, selected weight, and pointer feedback distinct | [Modernize your AppKit app, 14:24 onward](https://developer.apple.com/videos/play/wwdc2026/289/?time=864) |

Many system-glass improvements arrive just by running on the new OS. Using an old custom blur/tint recreation prevents that automatic adoption. [Apple's adoption guide](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass) recommends standard framework components and removing custom navigation/presentation backgrounds that interfere with system effects.

## Material, color, and geometry

### Choose a material by role

| Surface | Verified rule | Evidence |
| --- | --- | --- |
| Navigation and controls | Liquid Glass is the functional layer above content. Use custom effects sparingly. | [HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials) |
| Content cards, lists, tables, app backgrounds | Use standard materials or ordinary content fills. A content card does not become Liquid Glass merely because it is translucent. | [HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials) |
| Regular | Blurs and adjusts background luminosity; appropriate for text-heavy alerts, popovers, and sidebars. | [HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials) |
| Clear | For photos/video. Consider a **35% dark dim behind it when content is bright**. Dark media or AVKit's existing dim needs no extra layer. | [HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials) |
| Control thumb inside content | A slider/toggle's transient interactive element may become Liquid Glass during interaction. | [HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials) |

Regular and clear have different uses; they are not arbitrary low/high-opacity presets. The introduction warns against mixing them in one composition and against stacking glass over glass. Foreground elements inside glass should use fills/transparency/vibrancy rather than another glass backdrop. [Meet Liquid Glass, principles](https://developer.apple.com/videos/play/wwdc2025/219/?time=631)

### Preserve the optical behavior

Apple describes lensing, adaptive shadows, interaction illumination, and size-dependent material thickness. Small bars can change light/dark appearance with their background. Large menus and sidebars adapt without disruptive wholesale scheme flips. A growing menu gains scattering and depth. Highlights respond to geometry and interaction; some system contexts also respond to device motion. Glass materializes by changing its optical treatment. [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/)

These are related behaviors, not separate decorative gradients to apply to every item. The available documentation describes their result and public APIs; it does not supply the compositor's shader implementation.

### Color expresses meaning

Glass starts without an inherent brand tint and picks up surrounding content. Accent can appear on either glass or its foreground; the HIG explicitly shows a colored selected tab label. Therefore a blanket rule that all labels must always be monochrome would be inaccurate. Use color selectively for meaningful emphasis, supply light/dark/increased-contrast variants, and preserve contrast over both schemes even in an app that normally uses one appearance. [HIG Color](https://developer.apple.com/design/human-interface-guidelines/color)

Most bar glyphs remain visually quiet. A prominent Done/confirm action can use tinted glass. Grouping and spacing communicate relationships; avoid grouping a text command and a symbol command so closely they look like one button. [Get to know the new design system](https://developer.apple.com/videos/play/wwdc2025/356/)

### Geometry is contextual

Fixed rectangles, capsules, and concentric shapes serve different roles. A capsule has half-height radius; a nested concentric shape derives its radius from the outer shape and inset. Small dense Mac controls retain rounded rectangles; touch controls and larger actions favor capsules. [Get to know the new design system](https://developer.apple.com/videos/play/wwdc2025/356/)

Mac 27 adds `NSView.cornerConfiguration`, `NSViewCornerConfiguration`, and `.containerConcentric` corner radii with a minimum radius. Maps' local weather control demonstrates window-relative concentricity. [Modernize your AppKit app](https://developer.apple.com/videos/play/wwdc2026/289/?time=941)

Do not present an invented web control height, spring constant, lens index, or radius as an Apple default. There is also a documentation mismatch worth retaining: the current [`ControlSize.extraLarge` reference](https://developer.apple.com/documentation/swiftui/controlsize/extralarge) still says it resolves to `.large` outside visionOS, despite design sessions discussing extra-large buttons. A distinct glasscn `xl` size is a library decision unless measured on the target SDK.

## Components and transitions

### Navigation, toolbars, and search

| Family | What to implement | Evidence |
| --- | --- | --- |
| Toolbar | Related actions share a background; secondary actions can overflow; avoid overcrowding. The system automatically supplies overflow on Mac/iPad. | [HIG Toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars) |
| Tab bar | Persistent top-level navigation with labels and preserved section state. An accessory such as Music's MiniPlayer can move inline when minimized. Tabs are not action buttons. | [HIG Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars) |
| Adaptive sidebar | Sidebars are an alternate navigation representation when space permits, rather than a mandatory device-name breakpoint. iOS 27 can opt into them in regular horizontal space. | [Modernize your UIKit app](https://developer.apple.com/videos/play/wwdc2026/278/?time=558) |
| Toolbar resizing | `visibilityPriority(.high)`, `ToolbarOverflowMenu`, and `.topBarPinnedTrailing` keep selected commands available. `toolbarMinimizeBehavior(.onScrollDown, for: .navigationBar)` supports top-bar minimization. | [What's new in SwiftUI, 2:12–8:06](https://developer.apple.com/videos/play/wwdc2026/269/?time=132) |
| Search | A standard search tab opens a landing page; a prominent search tab opens input immediately. Scoped inline/sidebar search differs from global toolbar search. | [Design intuitive search experiences](https://developer.apple.com/videos/play/wwdc2026/292/) |

Current search guidance uses available space, scope, and intent. Show recent searches inline on iOS; toolbar/sidebar search can use a menu on Mac/iPad. Search needs working clear/cancel, suggestions, filtering, and a no-results state rather than a decorative expanding capsule. [Design intuitive search experiences](https://developer.apple.com/videos/play/wwdc2026/292/)

### Presentations and controls

| Family | What to implement | Evidence |
| --- | --- | --- |
| Sheet | Partial-height presentation is inset glass; moving to full height anchors it and makes it opaque. Preserve the relationship with its presenting control. | [Build a SwiftUI app with the new design](https://developer.apple.com/videos/play/wwdc2025/323/?time=397) |
| Modality | A modal sheet interrupts the parent. A nonmodal sheet permits related work without dismissal; Notes formatting is Apple's example. Cancel discards; Done completes/saves. | [HIG Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets) |
| Menu/popover/confirmation | Presentation grows from its source. Current Mac/iPad menu icons are sparse; use meaningful icons for common actions/key features. | [HIG Menus](https://developer.apple.com/design/human-interface-guidelines/menus), [Modernize your UIKit app](https://developer.apple.com/videos/play/wwdc2026/278/?time=757) |
| Buttons | Supply a press state; generally at least a 44×44 pt hit area; limit prominent choices. A small visual glyph can still have a larger hit target. | [HIG Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) |
| Slider/switch/segmented picker | Interaction can lift the thumb into glass. Sliders support ticks, neutral origins, and a thumbless presentation in suitable contexts. | [Build a UIKit app with the new design](https://developer.apple.com/videos/play/wwdc2025/284/?time=835) |

Motion should communicate response and continuity, remain interruptible, and account for the input method. Touch glass responds more emphatically than trackpad glass. A universal elastic scale for mouse, touch, keyboard, and reduced motion does not match this guidance. [HIG Motion](https://developer.apple.com/design/human-interface-guidelines/motion)

### Public rendering APIs

| Platform | Public entry points and behavior | Evidence |
| --- | --- | --- |
| SwiftUI surface | `glassEffect()` defaults to regular glass in a capsule. Configure shape, tint, and interactivity; apply after appearance/layout modifiers. | [Applying Liquid Glass to custom views](https://developer.apple.com/documentation/swiftui/applying-liquid-glass-to-custom-views) |
| SwiftUI group | `GlassEffectContainer(spacing:)` renders nearby effects together. Increasing spacing makes shapes merge sooner. This shares rendering, rather than painting a rectangular frosted parent. | [GlassEffectContainer](https://developer.apple.com/documentation/swiftui/glasseffectcontainer) |
| SwiftUI morph | Stable unique `glassEffectID` values and a namespace connect inserted/removed shapes. Nearby shapes use matched geometry; distant appearances should materialize. `glassEffectUnion` combines contributing views into an effect. | [Applying Liquid Glass to custom views](https://developer.apple.com/documentation/swiftui/applying-liquid-glass-to-custom-views) |
| UIKit | `UIGlassEffect(style: .regular/.clear)` on `UIVisualEffectView`; `isInteractive` and `tintColor`; `UIGlassContainerEffect` for combined rendering. | [UIGlassEffect](https://developer.apple.com/documentation/uikit/uiglasseffect), [UIKit design session](https://developer.apple.com/videos/play/wwdc2025/284/?time=1228) |
| AppKit | `NSGlassEffectView` with `contentView`, style, radius, tint; `NSGlassEffectContainerView` groups effects. `effectIsInteractive` defaults to false and is for interactive controls/containers. | [NSGlassEffectView](https://developer.apple.com/documentation/appkit/nsglasseffectview), [effectIsInteractive](https://developer.apple.com/documentation/appkit/nsglasseffectview/effectisinteractive) |

SwiftUI's [`materialize`](https://developer.apple.com/documentation/swiftui/glasseffecttransition/materialize) animates the glass and fades its **content**, without matching another shape. UIKit should animate the effect property to/from glass, rather than the glass view's alpha. The [`UIVisualEffectView` documentation](https://developer.apple.com/documentation/uikit/uivisualeffectview) warns that alpha below one on the effect **or any ancestor** can make effects incorrect or disappear. Ancestor masking also fails; add content through `contentView`.

UIKit labels in a glass view's `contentView` become vibrant automatically. Use dynamic semantic text colors so glass and foreground can switch appearance together; Apple's example uses `UILabel.textColor = .secondaryLabel`, without an additional `UIVibrancyEffect`. Fixed light/dark hex values cannot follow this backdrop-dependent adaptation. A React Native wrapper still needs device verification that its rendered text and glyphs retain those dynamic colors. [UIKit session, 21:49](https://developer.apple.com/videos/play/wwdc2025/284/?time=1309)

## Apple examples to recreate

These are behavior references, not permission to label a CSS imitation as Apple's renderer. Historical 26 scenes below must use the verified 27 material/sidebar/scroll-edge corrections. The current [Landmarks sample](https://developer.apple.com/documentation/swiftui/landmarks-building-an-app-with-liquid-glass) has 27 SDK metadata, screenshots, downloadable SwiftUI source, and feature articles. It is the strongest inspectable implementation reference.

### Phone navigation

| Apple example | Recreate and exercise | Source |
| --- | --- | --- |
| Music MiniPlayer | Accessory above tabs; scroll down to move playback inline; reverse to expand | [HIG Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars) |
| Apple TV tab bar | Minimize on downward scrolling, preserve navigation, expand on upward scrolling | [SwiftUI session, app structure](https://developer.apple.com/videos/play/wwdc2025/323/?time=187) |
| Phone prominent search | A persistent prominent search action opens input immediately | [Search design session](https://developer.apple.com/videos/play/wwdc2026/292/) |
| Photos search tab | Search navigates to a dedicated section rather than acting as a filter everywhere | [HIG Searching](https://developer.apple.com/design/human-interface-guidelines/searching) |
| Mail search | Minimized search opens a full field near the keyboard | [SwiftUI session, search](https://developer.apple.com/videos/play/wwdc2025/323/?time=670) |

### Desktop and tablet structure

| Apple example | Recreate and exercise | Source |
| --- | --- | --- |
| Landmarks hero | Extend only imagery behind sidebar/inspector; preserve readable foreground | [Landmarks sample](https://developer.apple.com/documentation/swiftui/landmarks-building-an-app-with-liquid-glass) |
| Landmarks carousel | Horizontal artwork continues beneath sidebar and inspector | [Landmarks sample](https://developer.apple.com/documentation/swiftui/landmarks-building-an-app-with-liquid-glass) |
| Notes toolbar | Resize until secondary commands enter overflow; keep important actions reachable | [HIG Toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars) |
| Maps local weather | Window-relative concentric corners respond to layout | [AppKit 27 session](https://developer.apple.com/videos/play/wwdc2026/289/?time=941) |
| Stickers sample toolbar | Priority, explicit overflow, pinned Share, navigation-bar minimization | [SwiftUI 27 session](https://developer.apple.com/videos/play/wwdc2026/269/?time=312) |

### Controls and presentation

| Apple example | Recreate and exercise | Source |
| --- | --- | --- |
| Landmarks collection sheet | Drag partial glass to full opaque presentation; dismiss back to source | [SwiftUI design session](https://developer.apple.com/videos/play/wwdc2025/323/?time=397) |
| Landmarks badges | Expand distinct glass shapes; merge them back into the trigger | [Landmarks sample](https://developer.apple.com/documentation/swiftui/landmarks-building-an-app-with-liquid-glass) |
| Maps floating controls | Glass buttons over map content with interaction response | [UIKit design session](https://developer.apple.com/videos/play/wwdc2025/284/?time=1228) |
| Notes formatting sheet | Change text selections while the nonmodal sheet remains available | [HIG Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets) |
| Notes Done button | Meaningful tinted confirmation; test both scheme and increased contrast | [HIG Color](https://developer.apple.com/design/human-interface-guidelines/color) |

### Search scope and media

| Apple example | Recreate and exercise | Source |
| --- | --- | --- |
| Apple TV search | Browse categories before entering a query | [Search design session](https://developer.apple.com/videos/play/wwdc2026/292/) |
| Music library search | Inline field explicitly filters the current library | [HIG Searching](https://developer.apple.com/design/human-interface-guidelines/searching) |
| Settings/Stocks sidebar search | Search scope follows sidebar navigation, keeping detail context visible | [Search design session](https://developer.apple.com/videos/play/wwdc2026/292/) |
| Photos/video controls | Clear glass over media; compare bright media with dim and dark media without added dim | [HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials) |
| Safari and system surfaces | Controls stay separate from content; inspect Lock Screen, Dock, and Control Center material examples | [Apple's design announcement](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/) |

The same announcement includes Camera, Photos, FaceTime, Music, News, and Podcasts reference imagery. Treat app icons and system Lock Screen typography as separate effects; their use of glass does not justify applying glass to all app content.

## Fidelity, accessibility, and verification

### Native should delegate to the operating system

Use actual system surfaces, native controls, presentation, and navigation where available. The framework already handles glass adaptation, overlap, focus, user clarity, and supported accessibility preferences. An Expo wrapper needs verification against its installed implementation: a view called `Glass` or `NativeTabs` does not prove the required native API is used. Native iOS rendering and a React Native web fallback are separate verification targets. This implementation recommendation follows [Apple's adoption guide](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass).

### Web recreations are measured approximations

CSS blur/saturation/fills can approximate regular material; edge highlights, shade, responsive illumination, shadow, and geometry changes reproduce observable cues. A displacement filter may approximate lensing but is not Apple's compositor. DOM geometry morphing can preserve source relationships; it does not become `GlassEffectContainer` merely because multiple children move. These are proposed glasscn implementation techniques, not Apple specifications.

No inspected primary source publishes the exact diffusion kernel, refraction index, dispersion formula, highlight amplitudes, per-component opacity, spring stiffness/damping, or all size-dependent material coefficients. Label numerical web tokens as glasscn tuning. Verify appearances against native reference captures on the target OS instead of claiming exactness from chosen constants.

### Accessibility is part of the material contract

| Setting or condition | Required result | Evidence |
| --- | --- | --- |
| Reduce Transparency / Increase Contrast / preferred clarity | Custom surfaces must remain usable under each; standard components adapt automatically | [Adopting Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass) |
| Show Borders | Clearly distinguish custom interactive edges; Mac 27 has a dedicated setting | [accessibilityShowBorders](https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityshowborders) |
| Reduce Bright Effects | Minimize highlighting and flashing, including custom press illumination | [accessibilityReduceHighlightingEffects](https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducehighlightingeffects) |
| Reduce Motion / input method | Offer reduced motion; keep response cancellable; use subtler pointer motion | [HIG Motion](https://developer.apple.com/design/human-interface-guidelines/motion) |
| Text enlargement / contrast | Support enlarged text without losing hierarchy or access; measure foreground/background contrast | [HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |

Apple's recommended default text size is 17 pt on iOS/iPadOS and 13 pt on macOS; the listed minimums are 11 pt and 10 pt respectively. Prefer regular or heavier weights for small text and maintain hierarchy as sizes grow. These platform type recommendations are not a requirement that web browser root text become 17 CSS pixels. [HIG Typography](https://developer.apple.com/design/human-interface-guidelines/typography)

### Acceptance evidence to collect

1. Compare regular/clear over a photo, bright flat field, dark field, and scrolling text in light/dark appearances. Include a genuinely bright media case to test dim placement.
2. Exercise press, drag, interruption, source-to-menu/sheet morph, glass split/merge, search activation, bar minimization, overflow, and inactive-window response.
3. Resize between phone, tablet, and desktop layouts. Confirm edge sidebar, top toolbar contrast, safe areas, concentric corners, and keyboard reachability.
4. Repeat with reduced motion/transparency, increased contrast, clarity endpoints, Show Borders, enlarged text, keyboard, and screen reader navigation.
5. Inspect native OS captures and browser captures separately. Static source tests and a successful typecheck alone cannot establish optical, touch, or transition fidelity.

These are proposed verification criteria derived from the documented behavior. They are not a claim that the current glasscn implementation passes them.

### Recreation assets

The example photography is stock imagery, not copied Apple app artwork. Native defaults use Unsplash image identifiers `photo-1470770841072-f978cf4d019e` (alpine lake), `photo-1500530855697-b586d89ba3ee` (landscape), and `photo-1464822759023-fed622ff2c3b` (summit); matching local web files are `public/showcase/{alpine,coast,summit}.jpg`. The [Unsplash license](https://unsplash.com/license) permits downloading and using these photos. Article text, track names, messages, and map labels in the recreations are illustrative content. The map is a local schematic rather than live cartographic or routing data; music controls demonstrate player state rather than stream an audio recording.

## Observed glasscn runtime

These are implementation observations, separate from the Apple specifications above. Native inspection used **iPhone 18 Pro, iOS 27.0, Expo Go 57.0.9**, simulator `980F1928-1320-4C63-8540-2F5B7BB16651`, with the installed SDK 57 implementation. The existing iOS 26 simulator was left running. Metro served the sandbox on port 8083.

| Check | Observed result and artifact |
| --- | --- |
| Six scenes × two schemes × three preference modes | Captured 12 default, 12 forced Reduce Motion, and 12 forced Reduce Transparency states. The initial run stopped during concurrent module refresh after 26 images; the remaining 10 completed. Initial files: `/tmp/glasscn-native-ios27-matrix/2026-11-08_154517/glasscn-native-matrix/takeScreenshot/`; completion files: `/tmp/glasscn-native-ios27-final/final-{light,dark}/`. Defects found in those images received the targeted checks below. These are coverage captures, not an assertion that every original image was correct. |
| Dynamic foreground and Music interaction | RN text and SVG glyphs followed regular material's light inversion in a dark app. Playback state, minimizing/re-expanding on scroll, filtering, no-results, keyboard field visibility, and Cancel were exercised. The final result list stays above the field while the keyboard is visible. [Curated Music search](evidence/ios27-music-search.png); final interaction images: `/tmp/glasscn-native-ios27-final/music-verify/2026-11-08_163124/glasscn-native-music-verify/takeScreenshot/`. |
| Native presentations and scene actions | Photos favorite/next/details, Maps category→pin→route preview, Safari collapse/address editing/tab selection, and Mail read→archive→compose→save draft passed on the simulator. Photos medium→large changed inset translucent glass to anchored opaque presentation in physical OS light and dark; image, readable metadata, and Close stayed within bounds. Sheet evidence: `/tmp/glasscn-native-ios27-sheets/2026-11-08_160216/` and `/tmp/glasscn-native-ios27-os-dark/2026-11-08_160403/`; interaction evidence under `/tmp/glasscn-native-ios27-final/{interactions-reduced,interactions-finish,mail-finish}/`. |
| Largest text and responsive layout | Actual OS `accessibility-extra-extra-extra-large` exposed overlapping fixed-height overlays and clipped horizontal tabs. The showcase now uses semantic [Dynamic Type ramps](https://reactnative.dev/docs/text#dynamictyperamp-ios), uncapped body text, a taller scrollable canvas, wrapped Mail rows, stacked adjustment values, and labeled vertical Music tab actions at accessibility sizes. [Curated Photos text-size proof](evidence/ios27-photos-largest-type.png); six-scene header/control captures: `/tmp/glasscn-native-ios27-final/largest-reflow/2026-11-08_163154/`; corrected Music selection proof under `/tmp/glasscn-native-ios27-final/largest-music-final/`. The gallery requires vertical scrolling at this size; it does not squeeze the enlarged content into a fixed phone frame. |
| Native and custom geometry | Separate cluster surfaces retained independent favorite/save/add actions at 12/36 pt spacing. Landscape Mail displayed an edge sidebar and hid it. Controls expanded, selected warmth, cropped and reset. A custom slider changed 40→100 horizontally; dragging vertically scrolled the page while retaining 100. A custom sheet dragged from its .3 detent to large (index 2) and then dismissed. Evidence: `/tmp/glasscn-native-ios27-final/new-demos/2026-11-08_162322/` and `/tmp/glasscn-native-ios27-final/custom-drag/2026-11-08_163551/`. |

The sandbox links used `?scheme=light|dark&scene=photos|music|maps|safari|mail|controls`. `still=1` forces the **library** Reduce Motion override; `force=reduceTransparency` forces the **library** solid fallback. They do not change the OS preferences for native presentation animations. OS appearance and largest text were changed separately with `simctl`. SDK 57's SwiftUI `Host.colorScheme` sets an environment value, while sheet chrome follows its physical presentation environment; a forced React scheme can therefore differ. Semantic native foreground keeps that mismatch legible. The focused showcase suite passed 13 tests; native TypeScript and the block's ESLint check passed. Mocked tests establish behavior contracts; the images and gestures above establish the named runtime observations.

Commands used for the native captures (the flow YAML and complete logs remain in `/tmp`):

```sh
# Run from sandbox/native. This separate server also served the iOS bundle.
npm exec expo start -- --web --port 8083
JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home \
  /Users/tim/.maestro/bin/maestro \
  --device 980F1928-1320-4C63-8540-2F5B7BB16651 test \
  --test-output-dir /tmp/glasscn-native-ios27-final/custom-drag \
  /tmp/glasscn-native-custom-drag.yaml
xcrun simctl ui 980F1928-1320-4C63-8540-2F5B7BB16651 content_size accessibility-extra-extra-extra-large
# Restored after the accessibility run:
xcrun simctl ui 980F1928-1320-4C63-8540-2F5B7BB16651 content_size large
```

The glass renderer, supported system controls, menus, and bottom sheets use platform APIs. The in-screen Dock, address-bar layout, custom automatic scroll-edge fill, gallery reflow, and illustration geometry remain React Native compositions; they are not UIKit navigation controllers or Apple's unpublished coefficients. This inspection did not run an Android emulator, native macOS target, physical-device performance test, JS-stall stress test, or VoiceOver reading-order session. Mac Show Borders and personal clarity endpoints were researched, not physically exercised on this iOS simulator.
