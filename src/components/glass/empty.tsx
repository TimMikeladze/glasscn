import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * shadcn's Empty: what a list, search or page shows when there's nothing in it — an icon tile,
 * a title, a description and actions. Pass `query` for the search flavour: the title becomes
 * "No results for “query”" unless you write your own.
 */
function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn("flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-surface-sm p-[calc(1.5rem*var(--glass-density))] text-center text-balance md:p-[calc(3rem*var(--glass-density))]", className)}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="empty-header" className={cn("flex max-w-sm flex-col items-center gap-2 text-center", className)} {...props} />
}

const emptyMediaVariants = cva("mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0", {
  variants: {
    variant: {
      default: "bg-transparent",
      icon: "size-12 rounded-control bg-fill text-muted-foreground [&_svg:not([class*='size-'])]:size-6",
    },
  },
  defaultVariants: { variant: "default" },
})

function EmptyMedia({ className, variant = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return <div data-slot="empty-icon" data-variant={variant} className={cn(emptyMediaVariants({ variant, className }))} {...props} />
}

function EmptyTitle({ className, query, children, ...props }: React.ComponentProps<"div"> & { query?: string }) {
  return (
    <div data-slot="empty-title" className={cn("type-glass-heading text-lg", className)} {...props}>
      {children ?? (query !== undefined ? <>No results for “{query}”</> : null)}
    </div>
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <div data-slot="empty-description" className={cn("text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary-ink", className)} {...props} />
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="empty-content" className={cn("flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance", className)} {...props} />
}

export { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia }
