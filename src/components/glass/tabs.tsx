"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Tabs as TabsPrimitive } from "radix-ui"

import { slidingIndicatorClass, useSlidingIndicator } from "@/hooks/use-sliding-indicator"

function Tabs({ className, orientation = "horizontal", ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn("group/tabs flex gap-3 data-horizontal:flex-col", className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list relative inline-flex w-fit items-center justify-center p-1 text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col group-data-vertical/tabs:items-stretch",
  {
    variants: {
      variant: {
        /** A glass capsule with a sliding pill. */
        default: "glass rounded-button [--glass-elevation:0_0_#0000]",
        /** No track — the pill slides over the page. */
        plain: "rounded-button",
        /** An underline that slides. */
        line: "gap-1 rounded-none p-0",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function TabsList({ className, variant = "default", children, ...props }: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  const ref = useSlidingIndicator<HTMLDivElement>('[data-slot="tabs-trigger"][data-state="active"]')
  return (
    <TabsPrimitive.List ref={ref} data-slot="tabs-list" data-variant={variant} className={cn(tabsListVariants({ variant }), className)} {...props}>
      <span
        data-slot="tabs-indicator"
        aria-hidden
        className={cn(
          slidingIndicatorClass,
          variant === "line"
            ? "top-auto bottom-0 h-0.5! [transform:translateX(var(--indicator-x))]! rounded-full bg-primary"
            : "rounded-button bg-fill-strong shadow-[inset_0_1px_0_var(--color-glass-highlight)]"
        )}
      />
      {children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative z-10 inline-flex h-[calc(2rem*var(--glass-density))] flex-1 items-center justify-center gap-1.5 rounded-button px-3.5 text-sm font-medium whitespace-nowrap text-foreground/65 transition-colors outline-none group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:ring-(length:--glass-ring-width) focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground group-data-[variant=line]/tabs-list:h-9 group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:px-2 group-data-[variant=line]/tabs-list:data-[state=active]:text-primary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-(--glass-duration) data-[state=active]:slide-in-from-bottom-1 motion-reduce:animate-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
