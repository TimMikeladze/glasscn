# Design rules

Target current Apple behavior in the [source study](../research/apple-liquid-glass-2026-11.md). The [component reference](../apple-hig-reference.md) links each family to primary sources. Numeric web material/spring/optics values are glasscn choices, not published Apple constants.

## Pick the layer

- Content (text, photos, lists, cards, data) uses ordinary fills or standard material: `glass-subtle`, `glass`, `glass-strong`. Card cannot opt into liquid.
- Floating navigation and controls use `LiquidGlass` or `glass-liquid`: bars, menus, popovers, partial-height sheets and floating actions. A full-height sheet anchors and becomes opaque.
- Inside liquid use fills and readable glyphs. Related actions can share a `GlassGroup` capsule. `GlassCluster` joins and separates sibling contours; native maps to the system glass container. Do not describe a shared rectangle as the union renderer.
- Put content behind a lens. Prefer photos, an article, a map or a list that scrolls under controls. Use at most two material levels and one ground per view; glass is not a reason to frost every row.

## Choose the material

- Regular is the default for controls that carry text or sit over complex content. The web uses stronger diffusion and a light/shaded edge; native starts with the untinted system effect.
- Clear belongs over photos/video and uses bright labels. Dim **bright media behind it** when needed (`Backdrop dim={0.35}`); skip dark media or an existing player dim. The lens does not add its own compulsory scrim.
- Keep a composition coherent rather than casually mixing regular and clear. Show both schemes and check accessibility before choosing a custom tint.
- Native system materials and controls inherit the OS implementation. Web URL displacement is a Chromium enhancement with complete CSS diffusion on other engines. Never equate a blur, gradient rim or hand-picked percentage with Apple's shader.

## Shape, color and motion

- Corners, heights, padding, type and motion use tokens. Use `cn` from `@/lib/glass-cn`: it knows the named radius/spacing groups, so a later capsule or size replaces the base class. Use concentric radii inside containers.
- Use the palette accent and semantic status/data colors. Accent can mark a meaningful foreground or prominent background; Apple does not ban colored labels. Keep most bar commands quiet and limit competing prominent actions.
- Current Mac/iPad sidebars meet window edges and use accent-colored symbols. The automatic scrolled top is a continuous diffuse toolbar region, not an input-device soft/hard heuristic.
- Preserve source continuity with unique trigger/presentation identities. A distant appearance may materialize. Respect Reduce Motion; native glass never has a fading ancestor. Inline thumbs use fills at rest and become lenses while held.

## Readability and access

- Body/control text reaches 4.5:1, large text 3:1. Validate every shipped theme, prominent/tinted/destructive labels and both material variants. Clear controls switch to readable regular labels when accessibility makes the surface opaque.
- Viewer clarity, Reduce Transparency, Reduce Bright Effects and OS contrast/motion preferences override authored effects. Fully tinted and matte views must remain usable.
- Focus, keyboard interaction, touch targets, labels, Dynamic Type and screen-reader state are part of the component. Modal sidebars contain focus and restore the opener. Portal content follows the source theme without being clipped by it.
- Verify changed pixels, interaction and device rendering. Some blur existing in a computed style, or a mocked system control rendering in Jest, does not prove visual fidelity.
