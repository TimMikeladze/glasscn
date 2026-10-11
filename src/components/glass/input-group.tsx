"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { Button } from "@/components/glass/button"
import { Input } from "@/components/glass/input"
import { Textarea } from "@/components/glass/textarea"

/**
 * shadcn's InputGroup on glass: one filled field holding an input (or textarea) and addons —
 * a search icon, a unit, a clear or password-reveal button, a submit capsule. The group owns
 * the fill, rim and focus ring; the input inside goes bare.
 *
 *   <InputGroup>
 *     <InputGroupAddon><SearchIcon /></InputGroupAddon>
 *     <InputGroupInput placeholder="Search entries" />
 *     <InputGroupAddon align="inline-end"><InputGroupButton aria-label="Clear"><XIcon /></InputGroupButton></InputGroupAddon>
 *   </InputGroup>
 */
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex h-control w-full min-w-0 items-center rounded-control bg-fill inset-ring inset-ring-glass-border transition-[box-shadow,background-color] duration-(--glass-duration) ease-out forced-colors:border forced-colors:border-[CanvasText]",
        "has-[>textarea]:h-auto has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col",
        // focus and invalid move from the bare input to the group
        "has-[[data-slot=input-group-control]:focus-visible]:bg-fill-strong has-[[data-slot=input-group-control]:focus-visible]:outline-(length:--glass-ring-width) has-[[data-slot=input-group-control]:focus-visible]:outline-ring has-[[data-slot=input-group-control]:focus-visible]:outline-solid has-[[data-slot=input-group-control]:focus-visible]:outline-offset-2",
        "has-[[data-slot][aria-invalid=true]]:inset-ring-2 has-[[data-slot][aria-invalid=true]]:inset-ring-destructive/70 has-[[data-slot=input-group-control]:disabled]:bg-fill-subtle has-[[data-slot=input-group-control]:disabled]:opacity-70",
        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-control-xs [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start": "order-first ps-pad-sm has-[>button]:-ms-1.5 has-[>kbd]:-ms-1",
        "inline-end": "order-last pe-pad-sm has-[>button]:-me-1.5 has-[>kbd]:-me-1",
        "block-start": "order-first w-full justify-start px-pad-sm pt-3 group-has-[>input]/input-group:pt-2.5",
        "block-end": "order-last w-full justify-start px-pad-sm pb-3 group-has-[>input]/input-group:pb-2.5",
      },
    },
    defaultVariants: { align: "inline-start" },
  }
)

/** Content beside the input. Clicking it (but not a button inside) focuses the input. */
function InputGroupAddon({ className, align = "inline-start", ...props }: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return
        e.currentTarget.parentElement?.querySelector<HTMLElement>("input, textarea")?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva("flex items-center gap-2 text-sm shadow-none", {
  variants: {
    size: {
      xs: "h-control-2xs gap-1 px-2 [&>svg:not([class*='size-'])]:size-3.5",
      sm: "h-control-xs gap-1.5 px-2.5",
      "icon-xs": "size-control-2xs p-0 hit-area",
      "icon-sm": "size-control-xs p-0 hit-area",
    },
  },
  defaultVariants: { size: "xs" },
})

/** A small button inside the field: clear, reveal, copy, submit. Ghost by default; `variant="default"` for a submit capsule. */
function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> & VariantProps<typeof inputGroupButtonVariants>) {
  return <Button type={type} data-size={size} variant={variant} className={cn(inputGroupButtonVariants({ size }), className)} {...props} />
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4", className)} {...props} />
}

const bare = "flex-1 rounded-none border-0 bg-transparent inset-ring-0 shadow-none outline-hidden focus-visible:bg-transparent focus-visible:shadow-none! focus-visible:outline-hidden! aria-invalid:inset-ring-0 disabled:bg-transparent"

function InputGroupInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return <Input data-slot="input-group-control" className={cn(bare, "h-full", className)} {...props} />
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<typeof Textarea>) {
  return <Textarea data-slot="input-group-control" className={cn(bare, "resize-none", className)} {...props} />
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea }
