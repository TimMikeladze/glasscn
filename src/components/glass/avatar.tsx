"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Avatar as AvatarPrimitive } from "radix-ui"

/**
 * shadcn's Avatar on glass: a round photo with a hairline rim, falling back to
 * initials on a soft fill. Stack several in an `AvatarGroup`.
 *
 *   <Avatar>
 *     <AvatarImage src="/mara.jpg" alt="Mara" />
 *     <AvatarFallback>MK</AvatarFallback>
 *   </Avatar>
 */
const avatarVariants = cva(
  "group/avatar relative flex shrink-0 overflow-hidden rounded-full select-none after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border after:border-glass-border",
  {
    variants: {
      size: {
        sm: "size-[calc(1.5rem*var(--glass-density))] text-[0.6rem]",
        default: "size-[calc(2rem*var(--glass-density))] text-xs",
        lg: "size-[calc(2.5rem*var(--glass-density))] text-sm",
      },
    },
    defaultVariants: { size: "default" },
  }
)

function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & VariantProps<typeof avatarVariants>) {
  return <AvatarPrimitive.Root data-slot="avatar" data-size={size} className={cn(avatarVariants({ size }), className)} {...props} />
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn("aspect-square size-full object-cover", className)} {...props} />
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("flex size-full items-center justify-center bg-fill font-medium text-foreground [&_svg:not([class*='size-'])]:size-[55%]", className)}
      {...props}
    />
  )
}

/** Overlapping avatars, each ringed in the glass rim so the stack reads on any pane. */
function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        // The glass tint underneath keeps translucent fallbacks from showing the avatar they overlap.
        "flex items-center -space-x-2 *:data-[slot=avatar]:bg-(--glass-tint) *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-glass-border *:data-[slot=avatar-group-count]:ring-2 *:data-[slot=avatar-group-count]:ring-glass-border",
        className
      )}
      {...props}
    />
  )
}

/** The "+3" at the end of a group. Takes the same `size` as the avatars. */
function AvatarGroupCount({ className, size = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof avatarVariants>) {
  return (
    <div
      data-slot="avatar-group-count"
      data-size={size}
      className={cn(avatarVariants({ size }), "items-center justify-center bg-(--glass-tint) bg-linear-to-b from-fill to-fill font-medium text-muted-foreground numeric-glass", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, avatarVariants }
