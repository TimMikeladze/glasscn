"use client"

import * as React from "react"
import { cn } from "cn"
import {
  Subscribe,
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type CellData,
  type Column,
  type ColumnDef,
  type ReactTable,
  type RowData,
  type SortingState,
  type TableOptions,
} from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/glass/button"
import { Checkbox } from "@/components/glass/checkbox"
import { Input } from "@/components/glass/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/glass/table"

/**
 * A sortable, searchable, paginated table on TanStack Table v9, drawn with the glass `table`.
 *
 *   const col = createDataTableColumnHelper<Workout>()
 *   const columns = col.columns([
 *     selectColumn<Workout>(),
 *     col.accessor("activity", { header: ({ column }) => <DataTableColumnHeader column={column} title="Activity" /> }),
 *   ])
 *   <DataTable columns={columns} data={workouts} searchPlaceholder="Search sessions…" />
 *
 * Keep `columns` and `data` stable (module scope, state or useMemo) — a fresh array each
 * render makes the table recompute every row model.
 */
const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, datetime: sortFn_datetime, text: sortFn_text },
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature,
})

type DataTableFeatures = typeof dataTableFeatures
type DataTableColumns<TData extends RowData> = TableOptions<DataTableFeatures, TData>["columns"]

/** A column helper bound to the data table's features, so sort and filter options type-check. */
function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>()
}

/** A leading checkbox column: select a row, or every row on the page from the header. */
function selectColumn<TData extends RowData>(): ColumnDef<DataTableFeatures, TData> {
  return createDataTableColumnHelper<TData>().display({
    id: "select",
    enableSorting: false,
    enableGlobalFilter: false,
    // Subscribe keeps these in step under the React Compiler, which can't see state behind table methods.
    header: ({ table }) => (
      <Subscribe source={table.store}>
        {() => (
          <Checkbox
            aria-label="Select all rows on this page"
            checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)}
          />
        )}
      </Subscribe>
    ),
    cell: ({ row }) => (
      <Subscribe source={row.table.store} selector={(state) => state.rowSelection}>
        {() => (
          <Checkbox
            aria-label="Select row"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(value) => row.toggleSelected(value === true)}
            onClick={(event) => event.stopPropagation()}
          />
        )}
      </Subscribe>
    ),
  })
}

/** A header that sorts its column: click cycles ascending → descending → off. */
function DataTableColumnHeader<TData extends RowData, TValue extends CellData>({
  column,
  title,
  className,
  ...props
}: React.ComponentProps<"div"> & { column: Column<DataTableFeatures, TData, TValue>; title: React.ReactNode }) {
  if (!column.getCanSort()) {
    return (
      <div data-slot="data-table-column-header" className={className} {...props}>
        {title}
      </div>
    )
  }
  return (
    <div data-slot="data-table-column-header" className={cn("flex items-center", className)} {...props}>
      <Subscribe source={column.table.store} selector={(state) => state.sorting}>
        {() => {
          const sorted = column.getIsSorted()
          const Icon = sorted === "asc" ? ArrowUpIcon : sorted === "desc" ? ArrowDownIcon : ChevronsUpDownIcon
          return (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              data-sorted={sorted || undefined}
              onClick={column.getToggleSortingHandler()}
              className="-mx-[calc(0.5rem*var(--glass-density))] px-[calc(0.5rem*var(--glass-density))] text-xs font-medium text-muted-foreground hover:text-foreground data-sorted:text-foreground"
            >
              {title}
              <Icon aria-hidden className={cn("size-3.5", !sorted && "opacity-50")} />
            </Button>
          )
        }}
      </Subscribe>
    </div>
  )
}

/** Selection count (or row count) on the left, page x of y and previous/next on the right. */
function DataTablePagination<TData extends RowData>({
  table,
  className,
  ...props
}: React.ComponentProps<"div"> & { table: ReactTable<DataTableFeatures, TData> }) {
  const total = table.getFilteredRowModel().rows.length
  const selected = table.getFilteredSelectedRowModel().rows.length
  const pageCount = Math.max(table.getPageCount(), 1)
  const page = Math.min(table.state.pagination.pageIndex + 1, pageCount)
  return (
    <div data-slot="data-table-pagination" className={cn("flex items-center justify-between gap-3 text-sm text-muted-foreground numeric-glass", className)} {...props}>
      <p aria-live="polite">{selected > 0 ? `${selected} of ${total} selected` : `${total} ${total === 1 ? "row" : "rows"}`}</p>
      <div className="flex items-center gap-2">
        <span>
          Page {page} of {pageCount}
        </span>
        <Button variant="secondary" size="icon-sm" aria-label="Previous page" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
          <ChevronLeftIcon />
        </Button>
        <Button variant="secondary" size="icon-sm" aria-label="Next page" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  )
}

function ariaSort(sorting: SortingState, id: string, canSort: boolean): React.AriaAttributes["aria-sort"] {
  if (!canSort) return undefined
  const sort = sorting.find((s) => s.id === id)
  return sort ? (sort.desc ? "descending" : "ascending") : "none"
}

type DataTableProps<TData extends RowData> = Omit<React.ComponentProps<"div">, "children"> & {
  columns: DataTableColumns<TData>
  data: TableOptions<DataTableFeatures, TData>["data"]
  /** Shows a search box that filters every text and number column. */
  searchPlaceholder?: string
  /** Rows per page. */
  pageSize?: number
  initialSorting?: SortingState
  /** Stable ids keep selection attached to the right rows when sorting and paging. */
  getRowId?: TableOptions<DataTableFeatures, TData>["getRowId"]
  /** Makes rows clickable (and focusable — Enter opens). */
  onRowClick?: (row: TData) => void
  /** Shown when there are no rows, or none match the search. */
  empty?: React.ReactNode
}

function DataTable<TData extends RowData>({
  columns,
  data,
  searchPlaceholder,
  pageSize = 10,
  initialSorting = [],
  getRowId,
  onRowClick,
  empty = "No results.",
  className,
  ...props
}: DataTableProps<TData>) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    globalFilterFn: "includesString",
    initialState: { pagination: { pageIndex: 0, pageSize }, sorting: initialSorting },
  })
  const { sorting, rowSelection, globalFilter } = table.state
  const rows = table.getRowModel().rows

  return (
    <div data-slot="data-table" className={cn("flex flex-col gap-3", className)} {...props}>
      {searchPlaceholder !== undefined && (
        <div data-slot="data-table-toolbar" className="relative max-w-xs">
          <SearchIcon aria-hidden className="pointer-events-none absolute top-1/2 left-[calc(0.75rem*var(--glass-density))] size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            value={typeof globalFilter === "string" ? globalFilter : ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="h-control-sm pl-[calc(2.25rem*var(--glass-density))]"
          />
        </div>
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id} colSpan={header.colSpan} aria-sort={ariaSort(sorting, header.column.id, header.column.getCanSort())}>
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={rowSelection[row.id] ? "selected" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === "Enter" && event.target === event.currentTarget) onRowClick(row.original)
                      }
                    : undefined
                }
                className={cn(onRowClick && "cursor-pointer outline-none focus-visible:bg-fill-strong focus-visible:outline-(length:--glass-ring-width) focus-visible:-outline-offset-2 focus-visible:outline-ring/50")}
              >
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={table.getAllLeafColumns().length} className="h-[calc(6rem*var(--glass-density))] text-center text-muted-foreground">
                {empty}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  )
}

export {
  DataTable,
  DataTableColumnHeader,
  DataTablePagination,
  selectColumn,
  createDataTableColumnHelper,
  dataTableFeatures,
  type DataTableFeatures,
  type DataTableColumns,
  type DataTableProps,
}
