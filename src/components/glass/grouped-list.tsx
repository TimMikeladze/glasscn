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
  return <h3 data-slot="grouped-list-header" className={cn("px-4 text-sm font-semibold text-muted-foreground", className)} {...props} />
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
        "glass flex flex-col overflow-hidden rounded-surface-sm [&>*+*]:shadow-[inset_0_1px_0_color-mix(in_oklch,var(--foreground)_9%,transparent)]",
        className
      )}
      {...props}
    />
  )
}

const rowClass =
  "flex min-h-[calc(3.25rem*var(--glass-density))] w-full items-center gap-3.5 px-4 py-2.5 text-start text-sm transition-colors focus-visible:outline-hidden [a&]:hover:bg-fill [button&]:hover:bg-fill focus-visible:bg-fill-strong focus-visible:ring-(length:--glass-ring-width) focus-visible:ring-ring/50 focus-visible:ring-inset aria-selected:bg-fill"

/**
 * A row. Use `asChild` with a `<button>` or `<a>` to make it interactive — the list-item
 * role then sits on a wrapper, so the button or link keeps its own role.
 */
function GroupedListItem({ className, asChild = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  if (asChild)
    return (
      <div role="listitem" data-slot="grouped-list-row" className="flex">
        <Slot.Root data-slot="grouped-list-item" className={cn(rowClass, className)} {...props} />
      </div>
    )
  return <div data-slot="grouped-list-item" role="listitem" className={cn(rowClass, className)} {...props} />
}

/** A coloured rounded-square glyph tile. Colour it with a `bg-*` class. */
function GroupedListIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="grouped-list-icon"
      className={cn("inline-flex size-7.5 shrink-0 items-center justify-center rounded-[calc(var(--glass-radius-control)*0.75)] bg-primary text-primary-foreground [&_svg:not([class*='size-'])]:size-4", className)}
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
  return <ChevronRightIcon data-slot="grouped-list-chevron" aria-hidden className={cn("size-4 shrink-0 text-muted-foreground", className)} {...props} />
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
