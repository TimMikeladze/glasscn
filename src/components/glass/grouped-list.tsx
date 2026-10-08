import * as React from "react"
import { cn } from "cn"
import { Slot } from "radix-ui"
import { ChevronRightIcon } from "lucide-react"

/**
 * iOS Settings-style inset grouped lists on glass.
 *
 *   <GroupedList>
 *     <GroupedListHeader>Your ritual</GroupedListHeader>
 *     <GroupedListContent>
 *       <GroupedListItem asChild><button>
 *         <GroupedListIcon className="bg-primary"><BellIcon /></GroupedListIcon>
 *         <GroupedListTitle>Reminders</GroupedListTitle>
 *         <GroupedListValue>9:00 PM</GroupedListValue>
 *         <GroupedListChevron />
 *       </button></GroupedListItem>
 *     </GroupedListContent>
 *     <GroupedListFooter>Rings once each evening.</GroupedListFooter>
 *   </GroupedList>
 */
function GroupedList({ className, ...props }: React.ComponentProps<"section">) {
  return <section data-slot="grouped-list" className={cn("flex flex-col gap-2", className)} {...props} />
}

function GroupedListHeader({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 data-slot="grouped-list-header" className={cn("px-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase", className)} {...props} />
}

function GroupedListFooter({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="grouped-list-footer" className={cn("px-4 text-xs text-muted-foreground", className)} {...props} />
}

function GroupedListContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="grouped-list-content"
      role="list"
      className={cn(
        "glass flex flex-col overflow-hidden rounded-2xl [&>[data-slot=grouped-list-item]+[data-slot=grouped-list-item]]:shadow-[inset_0_1px_0_color-mix(in_oklch,var(--foreground)_9%,transparent)]",
        className
      )}
      {...props}
    />
  )
}

/** A row. Use `asChild` with a `<button>` or `<a>` to make it interactive. */
function GroupedListItem({ className, asChild = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="grouped-list-item"
      role="listitem"
      className={cn(
        "flex min-h-13 w-full items-center gap-3.5 px-4 py-2.5 text-left text-sm outline-none transition-colors [a&]:hover:bg-fill [button&]:hover:bg-fill focus-visible:bg-fill-strong aria-selected:bg-fill",
        className
      )}
      {...props}
    />
  )
}

/** A coloured rounded-square glyph tile. Colour it with a `bg-*` class. */
function GroupedListIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="grouped-list-icon"
      className={cn("inline-flex size-7.5 shrink-0 items-center justify-center rounded-[0.55rem] bg-primary text-white [&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    />
  )
}

function GroupedListTitle({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="grouped-list-title" className={cn("flex min-w-0 flex-1 flex-col gap-0.5 text-[0.95rem] text-foreground", className)} {...props} />
}

function GroupedListDescription({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="grouped-list-description" className={cn("text-xs text-muted-foreground", className)} {...props} />
}

function GroupedListValue({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="grouped-list-value" className={cn("max-w-[45%] truncate text-sm text-muted-foreground", className)} {...props} />
}

function GroupedListChevron({ className, ...props }: React.ComponentProps<typeof ChevronRightIcon>) {
  return <ChevronRightIcon data-slot="grouped-list-chevron" aria-hidden className={cn("size-4 shrink-0 text-muted-foreground/70", className)} {...props} />
}

export {
  GroupedList,
  GroupedListHeader,
  GroupedListFooter,
  GroupedListContent,
  GroupedListItem,
  GroupedListIcon,
  GroupedListTitle,
  GroupedListDescription,
  GroupedListValue,
  GroupedListChevron,
}
