# Apple component behavior for glasscn

Current reference: iOS/iPadOS 27 and macOS 27. Checked November 8, 2026. The [source study](research/apple-liquid-glass-2026-11.md) records version evidence, APIs, examples and unpublished details. The implementation audits enumerate every shipped web/native family: [web](research/web-liquid-glass-audit.md), [native](research/native-liquid-glass-audit.md).

Apple's HIG defines roles and behavior. Exact compositor constants are not public. A glasscn value is not an Apple default merely because it resembles a screenshot. Use system controls/effects on native; distinguish our metric/optics choices on web.

## Navigation and search

| Family | Verified behavior | Implementation reference |
| --- | --- | --- |
| Toolbars | Group related actions on one background. Preserve important actions and overflow secondary commands. Content scrolling beneath the top produces a uniform diffuse region in 27. | [Toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars), [27 updates](https://developer.apple.com/videos/play/wwdc2026/102/) |
| Tabs and accessories | Tabs are persistent destinations. A MiniPlayer can appear above the tabs and move inline when minimized. Preserve the current destination's state. | [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars) |
| Sidebars | Mac/iPad sidebars now extend to window edges, selected rows gain weight and icons use the accent. Adapt to available space; a compact modal sidebar must contain focus and restore its opener. | [27 updates](https://developer.apple.com/videos/play/wwdc2026/102/), [UIKit adaptation](https://developer.apple.com/videos/play/wwdc2026/278/) |
| Scroll edges | Automatic has a distinct system appearance. Explicit soft/hard styles have specific legibility contexts; input hardware alone does not choose the current automatic design. | [UIKit scroll-edge update](https://developer.apple.com/videos/play/wwdc2026/278/?time=652) |
| Search | Standard tab: landing page with a field and suggestions. Prominent tab: immediately begin input. Inline or sidebar search filters its own content; toolbar search can span split columns. | [Design intuitive search](https://developer.apple.com/videos/play/wwdc2026/292/) |

## Materials and presentations

| Family | Verified behavior | Implementation reference |
| --- | --- | --- |
| Regular/clear | Regular diffuses and adjusts background luminosity. Clear is for media. Dim bright media beneath clear controls when needed; skip dark/already dimmed content. | [Materials](https://developer.apple.com/design/human-interface-guidelines/materials) |
| Grouped effects | Sibling effects combine in a system container as they approach. A capsule with filled items is a shared background, not a split/merge renderer. | [GlassEffectContainer](https://developer.apple.com/documentation/swiftui/glasseffectcontainer) |
| Sheet/drawer | A partial-height sheet is inset glass. Full-height presentation anchors and becomes opaque. Respect modal/nonmodal behavior and detents; cancellation and completion have distinct meanings. | [Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets), [design adoption](https://developer.apple.com/videos/play/wwdc2025/323/?time=397) |
| Menus/popovers | Preserve the source relationship. Icons convey common/important commands; do not assume every Mac/iPad item should have an icon. | [Menus](https://developer.apple.com/design/human-interface-guidelines/menus), [UIKit menus](https://developer.apple.com/videos/play/wwdc2026/278/?time=757) |
| Alerts/confirmation | Interrupt for a decision that requires attention. Give actions specific labels and an accessible title. Source continuity must not remove focus management or reduced-motion behavior. | [Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts), [Motion](https://developer.apple.com/design/human-interface-guidelines/motion) |

## Controls and content

| Family | Verified behavior | glasscn consequence |
| --- | --- | --- |
| Buttons | Clear actions, a visible press state and an adequate hit region. Accent communicates importance. | Native uses the system where possible. Web uses tokenized focus/press/hit areas; one primary action in a control group is our composition convention. [Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) |
| Switches/sliders/segmented controls | Inline controls use fills at rest; their interacting thumb can lift into glass. Live values and selection remain accessible. | Native defaults to system controls. Custom paths require UI-thread tracking, cancellation/commit handling and actual held-lens rendering. [UIKit controls](https://developer.apple.com/videos/play/wwdc2025/284/?time=835) |
| Fields, pickers and forms | Labels, input purpose, value and errors must remain understandable. A visual placeholder does not replace an accessible name. | Preserve system semantics and Dynamic Type; use fills inside material panes. [Text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields), [Pickers](https://developer.apple.com/design/human-interface-guidelines/pickers) |
| Cards, lists and data | Content stays on ordinary fills or standard materials. It does not need a Liquid Glass lens. | Card cannot select the liquid layer. Dense tables/charts use opaque or standard material hosts and accessible alternatives. [Materials](https://developer.apple.com/design/human-interface-guidelines/materials) |
| Typography and status | Use semantic text/color, support larger text and sufficient contrast, and communicate state beyond color alone. | Typography scales and chart geometry remain glasscn APIs; avoid calling chosen CSS sizes Apple's current control metrics. [Typography](https://developer.apple.com/design/human-interface-guidelines/typography), [Color](https://developer.apple.com/design/human-interface-guidelines/color) |

## Motion and accessibility

Source effects can match geometry using stable unique identities. Distant appearances materialize. Interactive motion stays interruptible. Reduce Motion removes unnecessary elasticity; avoid visual effects that impair readability. Native alpha below one on the effect or its ancestors can break the effect, so animate its effect property or geometry. [Custom glass](https://developer.apple.com/documentation/swiftui/applying-liquid-glass-to-custom-views), [UIVisualEffectView](https://developer.apple.com/documentation/uikit/uivisualeffectview)

Regular and clear both respect system appearance/accessibility. Do not force a brand tint to make a pale background look glassy. Color can live on a meaningful foreground or a prominent background; the HIG does not prohibit accent-colored labels. Respect Reduce Transparency, increased contrast, Reduce Motion, Reduce Bright Effects and Show Borders where the system exposes them. [Materials](https://developer.apple.com/design/human-interface-guidelines/materials), [Color](https://developer.apple.com/design/human-interface-guidelines/color), [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)

The [showcase](/showcase) demonstrates ten compositions and the optical/merging experiments. The [expanded official catalogue](research/apple-liquid-glass-official-examples-review-2026-11.md) covers 55 baseline behaviors plus four provisional/platform cases; the [parity matrix](research/apple-liquid-glass-parity-matrix.md) maps every case to source, examples and observed limits. A source catalogue is research evidence; an implemented example also needs runtime verification.
