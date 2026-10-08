import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/**
 * Type on the glass scale. Sizes are steps of a modular scale
 * (`--glass-text-scale` × `--glass-type-ratio`^n); fonts, weights, tracking, case
 * and numerals come from the theme — so a type preset restyles all of it.
 */

const headingVariants = cva("type-glass-heading text-foreground", {
  variants: {
    size: {
      display: "type-step-6",
      "1": "type-step-5",
      "2": "type-step-4",
      "3": "type-step-3",
      "4": "type-step-2",
      "5": "type-step-1",
      "6": "type-step-0",
    },
  },
  defaultVariants: { size: "2" },
})

type Level = 1 | 2 | 3 | 4 | 5 | 6

/** h1–h6. `level` sets the element; `size` the look (defaults to the level). */
function Heading({
  level = 2,
  size,
  asChild = false,
  className,
  ...props
}: React.ComponentProps<"h2"> & { level?: Level; size?: VariantProps<typeof headingVariants>["size"]; asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : (`h${level}` as "h2")
  return <Comp data-slot="heading" data-level={level} className={cn(headingVariants({ size: size ?? (String(level) as "2") }), className)} {...props} />
}

const textVariants = cva("", {
  variants: {
    variant: {
      body: "type-step-0",
      lead: "type-step-1 max-w-(--glass-measure) text-muted-foreground [line-height:var(--glass-leading)]",
      large: "type-step-1 font-semibold [line-height:var(--glass-leading)]",
      small: "type-step-n1 leading-snug",
      muted: "type-step-n1 text-muted-foreground",
      overline: "type-step-n2 font-semibold tracking-[0.12em] text-muted-foreground uppercase",
      caption: "type-step-n2 text-muted-foreground",
    },
  },
  defaultVariants: { variant: "body" },
})

/** Running text. `variant`: body, lead, large, small, muted, overline, caption. */
function Text({ variant = "body", asChild = false, className, ...props }: React.ComponentProps<"p"> & VariantProps<typeof textVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "p"
  return <Comp data-slot="text" data-variant={variant} className={cn(textVariants({ variant }), className)} {...props} />
}

const displayVariants = cva("type-glass-display text-foreground", {
  variants: {
    size: { sm: "type-step-4", md: "type-step-5", lg: "type-step-6", xl: "text-[calc(1rem*var(--glass-text-scale)*pow(var(--glass-type-ratio),8))]" },
  },
  defaultVariants: { size: "lg" },
})

/** A big figure — a count, a day number, a price. Display font, tight tracking, the theme's numerals. */
function Display({ size = "lg", asChild = false, className, ...props }: React.ComponentProps<"div"> & VariantProps<typeof displayVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"
  return <Comp data-slot="display" className={cn(displayVariants({ size }), className)} {...props} />
}

/** A pulled quote in the heading face, ruled with the accent. */
function Blockquote({ className, ...props }: React.ComponentProps<"blockquote">) {
  return (
    <blockquote
      data-slot="blockquote"
      className={cn("border-l-[3px] border-primary pl-4 font-glass-heading type-step-1 [line-height:var(--glass-heading-leading)] text-muted-foreground", className)}
      {...props}
    />
  )
}

/** `code` in running text. */
function InlineCode({ className, ...props }: React.ComponentProps<"code">) {
  return (
    <code
      data-slot="inline-code"
      className={cn("rounded-[calc(var(--glass-radius-control)*0.5)] bg-fill px-[0.4em] py-[0.15em] font-glass-mono text-[0.88em]", className)}
      {...props}
    />
  )
}

/** Bulleted or numbered, markers in the accent. */
function List({ ordered = false, className, ...props }: Omit<React.ComponentProps<"ul">, "ref"> & { ordered?: boolean }) {
  const classes = cn("space-y-1.5 pl-[1.4em] marker:text-primary", ordered ? "list-decimal numeric-glass" : "list-disc", className)
  return ordered ? <ol data-slot="list" className={classes} {...props} /> : <ul data-slot="list" className={classes} {...props} />
}

/** An inline link: accent, underlined at the theme's offset. */
function TextLink({ asChild = false, className, ...props }: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="text-link"
      className={cn(
        "text-primary underline decoration-primary/40 underline-offset-(--glass-underline-offset) transition-colors duration-(--glass-duration) outline-none hover:decoration-primary focus-visible:rounded-sm focus-visible:ring-(length:--glass-ring-width) focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}

export { Heading, Text, Display, Blockquote, InlineCode, List, TextLink, headingVariants, textVariants, displayVariants }
