import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/**
 * shadcn's Button with glass variants. Capsule by default (`shape="rounded"` for
 * shadcn's corners). Presses squash a touch; hover lifts on pointer devices.
 */
const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-[transform,background-color,box-shadow,opacity,color] duration-200 ease-out outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 aria-invalid:ring-3 aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_8px_22px_color-mix(in_oklch,var(--primary)_32%,transparent),inset_0_1px_0_oklch(1_0_0/30%)] hover:brightness-105",
        glass: "glass [--glass-elevation:0_0_#0000] text-foreground hover:[--glass-bg:var(--glass-strong)]",
        tinted: "bg-primary/16 text-primary hover:bg-primary/24 dark:bg-primary/22",
        secondary: "bg-fill text-foreground hover:bg-fill-strong",
        outline: "border border-glass-border bg-transparent text-foreground hover:bg-fill",
        ghost: "text-foreground hover:bg-fill",
        destructive: "bg-destructive/14 text-destructive hover:bg-destructive/22 focus-visible:ring-destructive/30",
        link: "text-primary underline-offset-4 hover:underline active:not-aria-[haspopup]:scale-100",
      },
      size: {
        default: "h-10 gap-2 px-5 text-sm has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-7 gap-1 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3.5 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-7 text-base [&_svg:not([class*='size-'])]:size-5",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-5",
      },
      shape: {
        pill: "rounded-full",
        rounded: "rounded-xl",
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
