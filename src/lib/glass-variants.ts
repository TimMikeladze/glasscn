import { cva, type VariantProps } from "class-variance-authority"

/**
 * The glass surface every glasscn component is built from.
 *
 * Backed by the `glass`, `glass-strong` and `glass-subtle` utilities from the
 * foundation CSS. Two CSS variables customise any surface without a new variant:
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
      primary: "[--glass-bg:color-mix(in_oklch,var(--primary)_18%,var(--glass))]",
      destructive: "[--glass-bg:color-mix(in_oklch,var(--destructive)_18%,var(--glass))]",
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
