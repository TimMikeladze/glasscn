import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/**
 * shadcn's Button with glass variants. Capsule by default (`shape="rounded"` for
 * shadcn's corners). Presses squash a touch; hover lifts on pointer devices.
 *
 * `variant="glass"` is liquid glass — the control layer, for buttons floating over
 * content — with a soft shadow. Disabled, it keeps its material and dims the label;
 * the other variants fade as a whole. `aria-disabled` disables too, so an `asChild`
 * link can be disabled.
 */
const dim = "disabled:opacity-45 aria-disabled:opacity-45"
const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-[transform,background-color,box-shadow,opacity,color] duration-(--glass-duration) ease-glass glass-focus select-none active:not-aria-[haspopup]:scale-(--glass-press-scale) disabled:pointer-events-none aria-disabled:pointer-events-none aria-invalid:ring-(length:--glass-ring-width) aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: `bg-primary text-primary-foreground shadow-glass-accent hover:brightness-105 ${dim}`,
        // liquid: the control layer. Hover takes it to the content material's frost; the elevation is shadow-glass-1, computed here from primitives
        glass:
          "glass-liquid [--glass-elevation:0_calc(var(--glass-shadow-y)*0.3)_calc(var(--glass-shadow-blur)*0.3)_color-mix(in_oklch,var(--glass-shadow-color)_var(--glass-shadow-opacity),transparent)] text-foreground hover:[--glass-liquid-opacity:var(--glass-opacity)] disabled:text-glass-label-tertiary aria-disabled:text-glass-label-tertiary",
        tinted: `bg-primary/16 text-primary-ink hover:bg-primary/24 dark:bg-primary/22 ${dim}`,
        secondary: `bg-fill text-foreground hover:bg-fill-strong ${dim}`,
        outline: `border border-glass-border bg-transparent text-foreground hover:bg-fill ${dim}`,
        ghost: `text-foreground hover:bg-fill ${dim}`,
        destructive: `bg-destructive/14 text-destructive-ink hover:bg-destructive/22 ${dim}`,
        link: `text-primary-ink underline-offset-4 hover:underline active:not-aria-[haspopup]:scale-100 ${dim}`,
      },
      size: {
        default: "h-control gap-2 px-pad text-sm has-data-[icon=inline-end]:pe-4 has-data-[icon=inline-start]:ps-4",
        xs: "h-control-xs gap-1 px-pad-xs hit-area text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-control-sm gap-1.5 px-pad-sm hit-area text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-control-lg gap-2 px-pad-lg text-base [&_svg:not([class*='size-'])]:size-5",
        icon: "size-control",
        "icon-xs": "size-control-xs hit-area [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-control-sm hit-area [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-control-lg [&_svg:not([class*='size-'])]:size-5",
      },
      shape: {
        pill: "rounded-button",
        rounded: "rounded-control",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "pill",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  shape = "pill",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, shape, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
