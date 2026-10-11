# LG-02 / LG-03 — viewer glass preferences, rules rewrite, over-content scene

Part of M1 ([`m1-foundations.md`](m1-foundations.md)). Background: [`../liquid-glass.md`](../liquid-glass.md) 3.1 and 3.3.

## `glass-preferences` (registry:ui)

Two files, because a `"use client"` module can't hand a server layout a plain string:

- `components/glass/glass-preferences-script.tsx` (server-safe): the storage key, `parseGlassPreferences`, `effectiveClarity`, `glassPreferencesCss`, `applyGlassPreferences`, the inline `glassPreferencesScript` and `<GlassPreferencesScript />` for `<head>`.
- `components/glass/glass-preferences.tsx` (client): `useGlassPreferences()` (a `useSyncExternalStore` over localStorage + a same-tab event, so every instance and every tab stays in step) and `<GlassPreferences />` — a Clarity slider (Clear ↔ Tinted, 0–1) and a Reduce transparency switch, built from `Slider`, `Switch`, `Label`.

Decisions:

- **Where the value goes.** One `<style id="glass-preferences">` with `:where(:root, [data-glass-scope]) { --glass-clarity: X !important }`. `!important` beats every theme, `ThemeScope` and site theme (a viewer preference outranks the author's default, as iOS's system slider does); `:where()` keeps specificity at zero so the OS settings — `prefers-reduced-transparency` / `prefers-contrast`, also `!important` but on `:root, [data-glass-scope]` — still win. Per-element `[--glass-clarity:…]` on a non-scope element still applies to its subtree.
- **Reduce transparency = clarity ≥ 0.9** plus `data-glass-reduce-transparency` on `<html>` as a styling hook. 0.9 maps the default frosts (52 / 74 / 28 / 46 %) to ≈ 90 / 95 / 86 / 89 % — the same numbers the `prefers-reduced-transparency` block uses — so the switch matches the OS setting, and works in Safari, which lacks the media query. The slider is disabled while it is on.
- **Unset means the theme.** Nothing is written until the viewer changes something; Reset removes the style and the key.
- **Before paint.** The inline script reads the key and writes the same style before first paint (no flash); the hook re-applies on mount so apps without the script still work.
- **No native twin.** iOS 26+ applies the system's own Liquid Glass clarity and Reduce Transparency to `GlassView`; nothing for the app to store.

Site: a "Glass" popover (sliders icon) in the header; the script in `app/layout.tsx` after `paletteScript`.

## Rules (LG-02, AGT-05)

`docs/rules/design.md` and the `use-glasscn` skill are rewritten around Apple's two layers: material for content, liquid only for the control layer over content; never liquid on liquid; regular by default, clear only over media with a dim, never mixed; glass needs content beneath it; one prominent action per bar; colour the glass, not the label. The still-valid rules (one accent, shape, density, legibility, text on frost) stay.

## Over-content scene

The `glass` docs demo shows the three material tiers, then a clipped phone-sized frame of real content (an article with a hero and a photo grid, all CSS gradients from the palette's chart colours) scrolling under a `glass-liquid` toolbar and dock, with a `glass-liquid-clear` play control over the hero. The studio gets a "Content" ground option beside "Aurora".
