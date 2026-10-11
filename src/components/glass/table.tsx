"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * shadcn's Table on glass. It has no pane of its own — put it inside a Card:
 * hairline rows, fill on hover and selection, muted small headers and the
 * theme's numerals. Cell padding follows --glass-density.
 *
 *   <Table>
 *     <TableHeader><TableRow><TableHead>Day</TableHead><TableHead numeric>Minutes</TableHead></TableRow></TableHeader>
 *     <TableBody><TableRow><TableCell>Monday</TableCell><TableCell numeric>20</TableCell></TableRow></TableBody>
 *   </Table>
 *
 * When the table is wider than its container, the scroll container becomes a
 * focusable, named region so keyboard users can scroll it.
 */
function Table({ className, ...props }: React.ComponentProps<"table">) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [overflowing, setOverflowing] = React.useState(false)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setOverflowing(el.scrollWidth > el.clientWidth + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    if (el.firstElementChild) observer.observe(el.firstElementChild)
    return () => observer.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      data-slot="table-container"
      data-overflowing={overflowing || undefined}
      role={overflowing ? "region" : undefined}
      tabIndex={overflowing ? 0 : undefined}
      aria-label={overflowing ? (props["aria-label"] ?? "Table") : undefined}
      className="glass-focus relative w-full overflow-x-auto"
    >
      <table data-slot="table" className={cn("w-full caption-bottom text-sm numeric-glass", className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b [&_tr]:hover:bg-transparent", className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return <tfoot data-slot="table-footer" className={cn("border-t border-separator bg-fill font-medium [&>tr]:last:border-b-0", className)} {...props} />
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-separator transition-colors duration-(--glass-duration) ease-glass hover:bg-fill data-[state=selected]:bg-fill data-[state=selected]:hover:bg-fill-strong",
        className
      )}
      {...props}
    />
  )
}

type CellAlign = "start" | "center" | "end"

/** Alignment for a head or cell: `numeric` lines figures up at the end. */
const alignClass = "data-[align=center]:text-center data-[align=end]:text-end"

function TableHead({ className, align, numeric, ...props }: Omit<React.ComponentProps<"th">, "align"> & { align?: CellAlign; numeric?: boolean }) {
  return (
    <th
      data-slot="table-head"
      data-align={align ?? (numeric ? "end" : undefined)}
      className={cn(
        "h-control px-pad-sm text-start align-middle text-xs font-medium whitespace-nowrap text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pe-0",
        alignClass,
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, align, numeric, ...props }: Omit<React.ComponentProps<"td">, "align"> & { align?: CellAlign; numeric?: boolean }) {
  return (
    <td
      data-slot="table-cell"
      data-align={align ?? (numeric ? "end" : undefined)}
      className={cn(
        "px-pad-sm py-[calc(0.625rem*var(--glass-density))] align-middle whitespace-nowrap [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pe-0",
        alignClass,
        className
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
