# Apple Liquid Glass 27 rebuild

The target is the current public iOS 27, iPadOS 27 and macOS 27 design, verified from Apple documentation, WWDC sessions and system APIs. Existing code and earlier studies are inputs to audit, not proof of conformance. Backward compatibility does not constrain this rebuild.

## Evidence and scope

Keep a dated primary-source study in `docs/research/apple-liquid-glass-2026-11.md`, with a recreation catalogue. Audit every shipped web and native item by family, recording file evidence and the difference between Apple behavior and a glasscn choice. Update the existing study, per-component reference and rules where they conflict with current evidence.

Apple exposes system effects and behavioral APIs, not its shader source, spring constants, blur kernels, exact opacity tables or refraction maps. Use native system controls/effects to inherit those defaults. Label web optical models and chosen numeric values as glasscn approximations. Do not describe a fixed blur or a conic border as Apple's implementation.

## Material and interaction

Content is readable text, lists, images and data. Liquid Glass is the floating control/navigation layer. Regular glass diffuses complex backgrounds and carries text; clear glass belongs over media. A dim belongs on bright media behind clear controls, can be omitted for dark media, and must not be duplicated when the player already dims it. Neighboring control groups share a surface; separate sibling surfaces can merge in a system glass container.

Web controls need visible edge refraction where the browser can render it, a specular rim and shaded opposite edge, press illumination at the pointer, elastic interaction, stable typography, source transitions, scroll-responsive bars, and usable accessibility overrides. Native controls must use the OS material untinted by default, permit explicit app tint/scheme choices, honor Reduce Motion/Transparency/Increase Contrast, and never sit under fading ancestors.

The 27 updates include stronger diffusion, refined refraction/edge contrast, sidebars that meet window edges on Mac/iPad with accent-colored icons, and a uniform toolbar top when content scrolls beneath floating controls. Automatic scroll-edge appearance must represent that behavior rather than infer it from input hardware.

## Implementation decisions

- Keep plain CSS primitives and per-element derived values. Add a small web optics runtime, a pure rounded-lens displacement model and a local `LiquidGlass` surface. Shared runtime enhancement covers existing floating controls and portaled overlays. Native uses `expo-glass-effect`, not a recreation of the shader.
- Browser refraction is progressive: verify it with pixel evidence on Chromium; WebKit/Firefox keep complete CSS materials if their URL backdrop filter does not render correctly. Disable optics for accessibility overrides, matte and fully tinted settings. Cache geometry maps, resize only when necessary, and cap filtered area.
- Rebuild audited navigation, overlay and custom-control defects in both tracks. Accessibility, focus, keyboard navigation and screen-reader semantics are part of each interaction.
- Ship interactive Apple-inspired examples with actual content under the glass: Photos/media viewing, Music mini-player/tab accessory, Maps search/sheet, Safari address/navigation, Mail sidebar/toolbar, and expandable floating controls. Each example links its Apple reference and exercises an observable behavior. Show both material variants, tint, optical changes and accessibility settings.
- Integrate the examples into the site and native sandbox, with installable registry entries and documentation. Preserve the product's registry, theme engine and copy-as-source model; visual structure may be replaced.

## Verification contract

Pure lens tests prove neutral interior, symmetric edge displacement, valid bounds and stable geometry. Browser tests must prove filtered pixels differ, readable content survives, new portals are enhanced, preference changes remove enhancement, and navigation/focus/scroll behavior works at desktop/mobile widths. Native tests must inspect the system-effect props and exercise controlled/uncontrolled custom paths and sheet detents. Inspect rendered web and native light/dark states, dense backgrounds, compact/square/matte themes and reduced transparency/motion.

Run typecheck, lint, unit/component tests, real web install, real native install, browser matrix/axe/visual/blur-budget checks and a production build. Record actual runtime evidence and unresolved limits. A passing typecheck or a previous screenshot is not proof of visual fidelity.

## Work record

The rebuild, sourced studies and installable six-scene showcases are implemented. See the [implementation plan](../plans/apple-liquid-glass-27.md) for completion status and verification evidence, and the [native audit](../research/native-liquid-glass-audit.md) for runtime scope. The initial checkout was clean; work is isolated on `liquid-glass-27-rebuild`.
