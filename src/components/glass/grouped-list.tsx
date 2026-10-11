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
      className={cn("glass flex flex-col overflow-hidden rounded-surface-sm", className)}
      {...props}
    />
  )
}

// Separators are a hairline above every row but the first, inset to where the text starts
// (past the icon tile when there is one), as in iOS — drawn with the separator token.
const separator =
  "relative not-first:before:pointer-events-none not-first:before:absolute not-first:before:inset-x-0 not-first:before:top-0 not-first:before:ms-4 not-first:before:h-px not-first:before:bg-separator not-first:has-data-[slot=grouped-list-icon]:before:ms-[calc(1rem+1.875rem+0.875rem)]"

const rowClass =
  "glass-focus-inset flex min-h-[calc(3.25rem*var(--glass-density))] w-full items-center gap-3.5 px-4 py-2.5 text-start text-sm transition-colors duration-(--glass-duration) ease-glass [a&]:hover:bg-fill [button&]:hover:bg-fill focus-visible:bg-fill-strong aria-selected:bg-fill aria-disabled:pointer-events-none aria-disabled:opacity-50 disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50"

/**
 * A row. Use `asChild` with a `<button>` or `<a>` to make it interactive — the list-item
 * role then sits on a wrapper, so the button or link keeps its own role.
 * `disabled` dims the row and takes it out of the pointer's way (a `<button>` child is
 * disabled too; a link gets aria-disabled).
 */
function GroupedListItem({ className, asChild = false, disabled = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean; disabled?: boolean }) {
  const state = disabled ? { "data-disabled": "", "aria-disabled": true, disabled: true } : {}
  if (asChild)
    return (
      <div role="listitem" data-slot="grouped-list-row" className={cn("flex", separator)}>
        <Slot.Root data-slot="grouped-list-item" className={cn(rowClass, className)} {...state} {...props} />
      </div>
    )
  return <div data-slot="grouped-list-item" role="listitem" data-disabled={disabled ? "" : undefined} className={cn(rowClass, separator, className)} {...props} />
}

/** A coloured rounded-square glyph tile. Colour it with a `bg-*` class. */
function GroupedListIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="grouped-list-icon"
      className={cn("inline-flex size-7.5 shrink-0 items-center justify-center rounded-control-sm bg-primary text-primary-foreground [&_svg:not([class*='size-'])]:size-4", className)}
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
  return <ChevronRightIcon data-slot="grouped-list-chevron" aria-hidden className={cn("size-4 shrink-0 text-muted-foreground rtl:rotate-180", className)} {...props} />
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
