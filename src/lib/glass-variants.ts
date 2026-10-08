import { cva, type VariantProps } from "class-variance-authority"

/**
 * The glass surface every glasscn component is built from.
 *
 * Backed by the `glass`, `glass-strong` and `glass-subtle` utilities from the
 * foundation CSS. Any primitive can be overridden on any element, e.g.
 * `[--glass-blur:8px]` or `[--glass-radius-surface:0]`; two extra hooks replace
 * whole layers:
 *   --glass-bg         the fill            e.g. `[--glass-bg:var(--primary)]`
 *   --glass-elevation  the outer shadow    e.g. `[--glass-elevation:0_0_#0000]`
 */
export const glassVariants = cva("relative", {
  variants: {
    intensity: {
      default: "glass",
      strong: "glass-strong",
      subtle: "glass-subtle",
    },
    tint: {
      none: "",
      // a tint replaces the frost's colour, keeping its opacity
      primary: "[--glass-tint:color-mix(in_oklch,var(--primary)_30%,var(--glass-tint))]",
      destructive: "[--glass-tint:color-mix(in_oklch,var(--destructive)_30%,var(--glass-tint))]",
    },
    elevation: {
      raised: "",
      flat: "[--glass-elevation:0_0_#0000]",
    },
  },
  defaultVariants: {
    intensity: "default",
    tint: "none",
    elevation: "raised",
  },
})

export type GlassVariantProps = VariantProps<typeof glassVariants>
