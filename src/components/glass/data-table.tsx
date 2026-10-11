"use client"

import * as React from "react"
import { cn } from "cn"
import {
  Subscribe,
  columnFacetingFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_arrIncludesSome,
  filterFn_includesString,
  functionalUpdate,
  globalFilteringFeature,
  metaHelper,
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
  type Row,
  type RowData,
  type SortingState,
  type Table as CoreTable,
  type TableOptions,
  type TableState,
  type Updater,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  CirclePlusIcon,
  EllipsisIcon,
  SearchIcon,
  Settings2Icon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/glass/button"
import { Checkbox } from "@/components/glass/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/glass/dropdown-menu"
import { Input } from "@/components/glass/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/glass/table"
import { fromInteractive } from "@/lib/glass-charts"

/**
 * A data table on TanStack Table v9, drawn with the glass `table` — shadcn's
 * data-table recipe as one component: sorting, search, faceted filters, column
 * visibility, row selection and pagination (rows per page, first/last), plus
 * the modes a real app needs:
 *
 *   controlled  pass `state` (any slices) + `onStateChange` — URL sync, persistence
 *   manual      `manual` + `rowCount`: the server sorts, filters and pages; you pass one page of rows
 *   virtual     `virtual`: every row in one scrolling body (sticky header), only the visible ones rendered
 *   loading     skeleton rows; `error` shows a row with a retry
 *
 *   const col = createDataTableColumnHelper<Workout>()
 *   const columns = col.columns([
 *     selectColumn<Workout>(),
 *     col.accessor("activity", { header: ({ column }) => <DataTableColumnHeader column={column} title="Activity" /> }),
 *   ])
 *   <DataTable columns={columns} data={workouts} searchPlaceholder="Search sessions…" filters={[{ column: "activity", title: "Activity", options }]} />
 *
 * Align a column with `meta: { align: "end" }` (or `numeric: true` for figures) —
 * its header and cells line up at the inline end, flipping in RTL. Name it for
 * the column menu with `meta: { label: "Distance" }`.
 *
 * Keep `columns` and `data` stable (module scope, state or useMemo) — a fresh array each
 * render makes the table recompute every row model.
 */
/** Per-column options the data table reads from `columnDef.meta`. */
interface DataTableColumnMeta {
  /** Inline alignment of the header and cells. */
  align?: "start" | "center" | "end"
  /** Figures: aligned to the end. */
  numeric?: boolean
  /** The column's name in the view options menu (defaults to its id). */
  label?: string
}

const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, datetime: sortFn_datetime, text: sortFn_text },
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString, arrIncludesSome: filterFn_arrIncludesSome },
  columnFacetingFeature,
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  columnVisibilityFeature,
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature,
  columnMeta: metaHelper<DataTableColumnMeta>(),
})

type DataTableFeatures = typeof dataTableFeatures
type DataTableColumns<TData extends RowData> = TableOptions<DataTableFeatures, TData>["columns"]
type DataTableState = TableState<DataTableFeatures>
type DataTableInstance<TData extends RowData> = ReactTable<DataTableFeatures, TData>

/** Every string the table shows, for translation. */
interface DataTableLabels {
  search: string
  noResults: React.ReactNode
  loading: string
  retry: string
  reset: string
  view: string
  toggleColumns: string
  rowsPerPage: string
  page: (page: number, pageCount: number) => string
  rows: (count: number) => string
  selected: (selected: number, total: number) => string
  first: string
  previous: string
  next: string
  last: string
  selectAll: string
  selectRow: string
  rowActions: string
  clearFilter: string
}

const DEFAULT_LABELS: DataTableLabels = {
  search: "Search",
  noResults: "No results.",
  loading: "Loading rows",
  retry: "Retry",
  reset: "Reset",
  view: "View",
  toggleColumns: "Toggle columns",
  rowsPerPage: "Rows per page",
  page: (page, count) => `Page ${page} of ${count}`,
  rows: (n) => `${n.toLocaleString()} ${n === 1 ? "row" : "rows"}`,
  selected: (n, total) => `${n.toLocaleString()} of ${total.toLocaleString()} selected`,
  first: "First page",
  previous: "Previous page",
  next: "Next page",
  last: "Last page",
  selectAll: "Select all rows on this page",
  selectRow: "Select row",
  rowActions: "Row actions",
  clearFilter: "Clear filter",
}

const LabelsContext = React.createContext<DataTableLabels>(DEFAULT_LABELS)
const useLabels = () => React.useContext(LabelsContext)

/** A column helper bound to the data table's features, so sort and filter options type-check. */
function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>()
}

/** A leading checkbox column: select a row, or every row on the page from the header. */
function selectColumn<TData extends RowData>(): ColumnDef<DataTableFeatures, TData> {
  return createDataTableColumnHelper<TData>().display({
    id: "select",
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    // Subscribe keeps these in step under the React Compiler, which can't see state behind table methods.
    header: ({ table }) => <SelectAllCheckbox table={table} />,
    cell: ({ row }) => <SelectRowCheckbox row={row} />,
  })
}

function SelectAllCheckbox<TData extends RowData>({ table }: { table: CoreTable<DataTableFeatures, TData> }) {
  const labels = useLabels()
  return (
    <Subscribe source={table.store}>
      {() => (
        <Checkbox
          aria-label={labels.selectAll}
          checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)}
        />
      )}
    </Subscribe>
  )
}

function SelectRowCheckbox<TData extends RowData>({ row }: { row: Row<DataTableFeatures, TData> }) {
  const labels = useLabels()
  return (
    <Subscribe source={row.table.store} selector={(state) => state.rowSelection}>
      {() => (
        <Checkbox aria-label={labels.selectRow} checked={row.getIsSelected()} disabled={!row.getCanSelect()} onCheckedChange={(value) => row.toggleSelected(value === true)} />
      )}
    </Subscribe>
  )
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
    <div data-slot="data-table-column-header" className={cn("flex items-center in-data-[align=center]:justify-center in-data-[align=end]:justify-end", className)} {...props}>
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

/** A value of a faceted filter: what's stored, what's shown. */
interface DataTableFilterOption {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

/** One faceted filter in the toolbar: a column id, a title and its options. */
interface DataTableFilter {
  column: string
  title: string
  options: DataTableFilterOption[]
}

/**
 * A toolbar button that filters a column by any of a set of values, with a
 * count beside each from the rows the other filters leave (faceting). The
 * column filters with `arrIncludesSome` — set `filterFn: "arrIncludesSome"` on it.
 */
function DataTableFacetedFilter<TData extends RowData, TValue extends CellData>({
  column,
  title,
  options,
}: {
  column?: Column<DataTableFeatures, TData, TValue>
  title: string
  options: DataTableFilterOption[]
}) {
  const labels = useLabels()
  if (!column) return null
  return (
    <Subscribe source={column.table.store} selector={(state) => state.columnFilters}>
      {() => {
        const facets = column.getFacetedUniqueValues()
        const selected = new Set((column.getFilterValue() as string[] | undefined) ?? [])
        const set = (next: Set<string>) => column.setFilterValue(next.size ? [...next] : undefined)
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" data-slot="data-table-faceted-filter" className="border border-dashed border-separator">
                <CirclePlusIcon aria-hidden />
                {title}
                {selected.size > 0 ? (
                  <span className="ms-1 rounded-badge bg-fill-strong px-1.5 text-xs font-medium numeric-glass">
                    <span className="sr-only">, </span>
                    {selected.size}
                    <span className="sr-only"> selected</span>
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-48">
              <DropdownMenuLabel>{title}</DropdownMenuLabel>
              {options.map((option) => {
                const Icon = option.icon
                return (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={selected.has(option.value)}
                    onSelect={(event) => event.preventDefault()}
                    onCheckedChange={(checked) => {
                      const next = new Set(selected)
                      if (checked) next.add(option.value)
                      else next.delete(option.value)
                      set(next)
                    }}
                  >
                    {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
                    <span className="flex-1">{option.label}</span>
                    <span className="ms-4 text-xs text-muted-foreground numeric-glass">{facets.get(option.value) ?? 0}</span>
                  </DropdownMenuCheckboxItem>
                )
              })}
              {selected.size > 0 ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => set(new Set())}>{labels.clearFilter}</DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }}
    </Subscribe>
  )
}

/** A "View" menu that shows and hides the columns that can hide. */
function DataTableViewOptions<TData extends RowData>({ table }: { table: DataTableInstance<TData> }) {
  const labels = useLabels()
  return (
    <Subscribe source={table.store} selector={(state) => state.columnVisibility}>
      {() => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" data-slot="data-table-view-options" className="ms-auto">
              <Settings2Icon aria-hidden />
              {labels.view}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuLabel>{labels.toggleColumns}</DropdownMenuLabel>
            {table
              .getAllLeafColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onSelect={(event) => event.preventDefault()} onCheckedChange={(value) => column.toggleVisibility(value === true)}>
                  {column.columnDef.meta?.label ?? column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Subscribe>
  )
}

/** A trailing "…" menu for a row; pass DropdownMenuItems as children. */
function DataTableRowActions({ children, label }: { children: React.ReactNode; label?: string }) {
  const labels = useLabels()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" data-slot="data-table-row-actions" aria-label={label ?? labels.rowActions}>
          <EllipsisIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}

/** The value after `delay` ms without change — a live region shouldn't speak every keystroke. */
function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/** Search across every text and number column; typing settles for 200ms before the table filters. */
function DataTableSearch<TData extends RowData>({ table, placeholder, className }: { table: DataTableInstance<TData>; placeholder?: string; className?: string }) {
  const labels = useLabels()
  const current = typeof table.state.globalFilter === "string" ? table.state.globalFilter : ""
  const [text, setText] = React.useState(current)
  const settled = useDebounced(text, 200)
  React.useEffect(() => {
    const now = table.store.state.globalFilter
    if (settled !== (typeof now === "string" ? now : "")) table.setGlobalFilter(settled)
  }, [settled, table])
  return (
    <div data-slot="data-table-search" className={cn("relative w-full max-w-xs", className)}>
      <SearchIcon aria-hidden className="pointer-events-none absolute start-[calc(0.75rem*var(--glass-density))] top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        aria-label={placeholder ?? labels.search}
        placeholder={placeholder ?? labels.search}
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="h-control-sm ps-[calc(2.25rem*var(--glass-density))]"
      />
    </div>
  )
}

/** Search, faceted filters, a reset when anything is filtered, your own actions, and the view menu. */
function DataTableToolbar<TData extends RowData>({
  table,
  searchPlaceholder,
  filters = [],
  viewOptions = true,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { table: DataTableInstance<TData>; searchPlaceholder?: string; filters?: DataTableFilter[]; viewOptions?: boolean }) {
  const labels = useLabels()
  return (
    <Subscribe source={table.store} selector={(state) => state.columnFilters}>
      {(columnFilters) => (
        <div data-slot="data-table-toolbar" className={cn("flex flex-wrap items-center gap-2", className)} {...props}>
          {searchPlaceholder !== undefined ? <DataTableSearch table={table} placeholder={searchPlaceholder} /> : null}
          {filters.map((f) => (
            <DataTableFacetedFilter key={f.column} column={table.getColumn(f.column)} title={f.title} options={f.options} />
          ))}
          {columnFilters.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => table.resetColumnFilters()}>
              {labels.reset}
              <XIcon aria-hidden />
            </Button>
          ) : null}
          {children}
          {viewOptions ? <DataTableViewOptions table={table} /> : null}
        </div>
      )}
    </Subscribe>
  )
}

/** Selection count (or row count), rows per page, page x of y and first/previous/next/last. */
function DataTablePagination<TData extends RowData>({
  table,
  pageSizes = [10, 20, 50, 100],
  className,
  ...props
}: React.ComponentProps<"div"> & { table: DataTableInstance<TData>; pageSizes?: number[] }) {
  const labels = useLabels()
  const total = table.options.manualPagination && table.options.rowCount !== undefined ? table.options.rowCount : table.getFilteredRowModel().rows.length
  const selected = Object.keys(table.state.rowSelection).length
  const pageCount = Math.max(table.getPageCount(), 1)
  const { pageIndex, pageSize } = table.state.pagination
  const page = Math.min(pageIndex + 1, pageCount)
  // spoken once typing settles, not per keystroke
  const status = useDebounced(selected > 0 ? labels.selected(selected, total) : labels.rows(total), 500)
  return (
    <div data-slot="data-table-pagination" className={cn("flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground numeric-glass", className)} {...props}>
      <p aria-live="polite">{status}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" data-slot="data-table-page-size" aria-label={`${labels.rowsPerPage}: ${pageSize}`}>
              <span className="text-muted-foreground">{labels.rowsPerPage}</span>
              <span className="font-medium text-foreground">{pageSize}</span>
              <ChevronsUpDownIcon aria-hidden className="size-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={String(pageSize)} onValueChange={(v) => table.setPageSize(Number(v))}>
              {pageSizes.map((n) => (
                <DropdownMenuRadioItem key={n} value={String(n)}>
                  {n}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <span>{labels.page(page, pageCount)}</span>
        <div className="flex items-center gap-1.5">
          <Button variant="secondary" size="icon-sm" aria-label={labels.first} className="max-sm:hidden" disabled={!table.getCanPreviousPage()} onClick={() => table.firstPage()}>
            <ChevronsLeftIcon className="rtl:rotate-180" />
          </Button>
          <Button variant="secondary" size="icon-sm" aria-label={labels.previous} disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            <ChevronLeftIcon className="rtl:rotate-180" />
          </Button>
          <Button variant="secondary" size="icon-sm" aria-label={labels.next} disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            <ChevronRightIcon className="rtl:rotate-180" />
          </Button>
          <Button variant="secondary" size="icon-sm" aria-label={labels.last} className="max-sm:hidden" disabled={!table.getCanNextPage()} onClick={() => table.lastPage()}>
            <ChevronsRightIcon className="rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function ariaSort(sorting: SortingState, id: string, canSort: boolean): React.AriaAttributes["aria-sort"] {
  if (!canSort) return undefined
  const sort = sorting.find((s) => s.id === id)
  return sort ? (sort.desc ? "descending" : "ascending") : "none"
}

/** The slices the table can hand to you, and take back. */
const SLICES = ["sorting", "columnFilters", "globalFilter", "pagination", "rowSelection", "columnVisibility"] as const
type DataTableSlice = (typeof SLICES)[number]
const HANDLER: Record<DataTableSlice, string> = {
  sorting: "onSortingChange",
  columnFilters: "onColumnFiltersChange",
  globalFilter: "onGlobalFilterChange",
  pagination: "onPaginationChange",
  rowSelection: "onRowSelectionChange",
  columnVisibility: "onColumnVisibilityChange",
}

type DataTableProps<TData extends RowData> = Omit<React.ComponentProps<"div">, "children"> & {
  columns: DataTableColumns<TData>
  data: TableOptions<DataTableFeatures, TData>["data"]
  /** Shows a search box that filters every text and number column. */
  searchPlaceholder?: string
  /** Faceted filter buttons in the toolbar. */
  filters?: DataTableFilter[]
  /** The "View" column menu (on by default when the toolbar shows). */
  viewOptions?: boolean
  /** Extra toolbar content (actions), given the table. */
  toolbar?: (table: DataTableInstance<TData>) => React.ReactNode
  /** Rows per page. */
  pageSize?: number
  pageSizes?: number[]
  initialSorting?: SortingState
  /** Stable ids keep selection attached to the right rows when sorting and paging. */
  getRowId?: TableOptions<DataTableFeatures, TData>["getRowId"]
  /** Makes rows clickable (and focusable — Enter or Space opens). Clicks on links, buttons and inputs inside a row are theirs. */
  onRowClick?: (row: TData) => void
  /** Shown when there are no rows, or none match. */
  empty?: React.ReactNode
  /** Controlled state: any of sorting, columnFilters, globalFilter, pagination, rowSelection, columnVisibility. */
  state?: Partial<Pick<DataTableState, DataTableSlice>>
  /** Called with the slice that changed (only slices you control through `state`). */
  onStateChange?: (change: Partial<Pick<DataTableState, DataTableSlice>>) => void
  /** The server sorts, filters and pages: `data` is one page. `true` for all three. Pair with `rowCount`. */
  manual?: boolean | { pagination?: boolean; sorting?: boolean; filtering?: boolean }
  /** Total rows on the server (manual pagination). */
  rowCount?: number
  /** Render every row in a scrolling body with a sticky header; only visible rows mount. No pagination. */
  virtual?: boolean | { height?: number | string; estimateRowHeight?: number; overscan?: number }
  /** Skeleton rows in place of data. */
  loading?: boolean
  /** An error row in place of data; with `onRetry`, a retry button. */
  error?: React.ReactNode
  onRetry?: () => void
  /** Strings, for translation. */
  labels?: Partial<DataTableLabels>
  /** Anything else TanStack Table takes (merged last). */
  tableOptions?: Partial<TableOptions<DataTableFeatures, TData>>
}

function DataTable<TData extends RowData>({
  columns,
  data,
  searchPlaceholder,
  filters,
  viewOptions,
  toolbar,
  pageSize = 10,
  pageSizes,
  initialSorting = [],
  getRowId,
  onRowClick,
  empty,
  state,
  onStateChange,
  manual,
  rowCount,
  virtual,
  loading = false,
  error,
  onRetry,
  labels: labelOverrides,
  tableOptions,
  className,
  ...props
}: DataTableProps<TData>) {
  const labels = React.useMemo(() => ({ ...DEFAULT_LABELS, ...labelOverrides }), [labelOverrides])
  const m = manual === true ? { pagination: true, sorting: true, filtering: true } : manual || {}
  // for each controlled slice, report changes as plain values
  const latest = React.useRef(state)
  React.useInsertionEffect(() => {
    latest.current = state
  })
  const handlers: Record<string, (updater: Updater<unknown>) => void> = {}
  for (const slice of SLICES) {
    if (state && slice in state)
      handlers[HANDLER[slice]] = (updater) => onStateChange?.({ [slice]: functionalUpdate(updater, latest.current?.[slice]) } as Partial<DataTableState>)
  }
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    globalFilterFn: "includesString",
    initialState: { pagination: { pageIndex: 0, pageSize: virtual ? Number.MAX_SAFE_INTEGER : pageSize }, sorting: initialSorting },
    state,
    manualPagination: m.pagination,
    manualSorting: m.sorting,
    manualFiltering: m.filtering,
    rowCount,
    ...handlers,
    ...tableOptions,
  })
  const showToolbar = searchPlaceholder !== undefined || Boolean(filters?.length) || Boolean(toolbar) || viewOptions === true

  return (
    <LabelsContext.Provider value={labels}>
      <div data-slot="data-table" data-virtual={virtual ? "" : undefined} className={cn("flex flex-col gap-3", className)} {...props}>
        {showToolbar ? (
          <DataTableToolbar table={table} searchPlaceholder={searchPlaceholder} filters={filters} viewOptions={viewOptions ?? true}>
            {toolbar?.(table)}
          </DataTableToolbar>
        ) : null}
        {virtual ? (
          <VirtualBody table={table} options={virtual === true ? {} : virtual} onRowClick={onRowClick} empty={empty} loading={loading} error={error} onRetry={onRetry} />
        ) : (
          <Table>
            <DataTableHead table={table} />
            <TableBody>
              <Rows table={table} rows={table.getRowModel().rows} onRowClick={onRowClick} empty={empty} loading={loading} error={error} onRetry={onRetry} skeletonRows={Math.min(pageSize, 8)} />
            </TableBody>
          </Table>
        )}
        {virtual ? null : <DataTablePagination table={table} pageSizes={pageSizes} />}
      </div>
    </LabelsContext.Provider>
  )
}

function DataTableHead<TData extends RowData>({ table, sticky = false }: { table: DataTableInstance<TData>; sticky?: boolean }) {
  return (
    <TableHeader className={cn(sticky && "sticky top-0 z-10 bg-background/85 [&_th]:bg-background/85")}>
      {table.getHeaderGroups().map((group) => (
        <TableRow key={group.id}>
          {group.headers.map((header) => (
            <TableHead
              key={header.id}
              colSpan={header.colSpan}
              align={header.column.columnDef.meta?.align}
              numeric={header.column.columnDef.meta?.numeric}
              aria-sort={ariaSort(table.state.sorting, header.column.id, header.column.getCanSort())}
            >
              {header.isPlaceholder ? null : <table.FlexRender header={header} />}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  )
}

const shimmer =
  "relative overflow-hidden rounded-badge bg-fill after:absolute after:inset-0 after:-translate-x-full after:animate-[glass-shimmer_1.6s_ease-in-out_infinite] after:bg-linear-to-r after:from-transparent after:via-fill-strong after:to-transparent rtl:after:animate-[glass-shimmer-rtl_1.6s_ease-in-out_infinite] motion-reduce:after:hidden"

function Rows<TData extends RowData>({
  table,
  rows,
  onRowClick,
  empty,
  loading,
  error,
  onRetry,
  skeletonRows = 5,
  measure,
}: {
  table: DataTableInstance<TData>
  rows: Row<DataTableFeatures, TData>[]
  onRowClick?: (row: TData) => void
  empty?: React.ReactNode
  loading: boolean
  error?: React.ReactNode
  onRetry?: () => void
  skeletonRows?: number
  measure?: (el: HTMLTableRowElement | null) => void
}) {
  const labels = useLabels()
  const columns = table.getVisibleLeafColumns()
  if (loading) {
    return Array.from({ length: skeletonRows }, (_, i) => (
      <TableRow key={`skeleton-${i}`} data-slot="data-table-skeleton-row" aria-hidden={i > 0 || undefined} className="hover:bg-transparent">
        {columns.map((column, c) => (
          <TableCell key={column.id} align={column.columnDef.meta?.align} numeric={column.columnDef.meta?.numeric}>
            {i === 0 && c === 0 ? <span className="sr-only">{labels.loading}</span> : null}
            <span className={cn(shimmer, "inline-block h-3.5 align-middle", column.id === "select" ? "w-4" : c % 2 ? "w-12" : "w-24")} />
          </TableCell>
        ))}
      </TableRow>
    ))
  }
  if (error) {
    return (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={columns.length} role="alert" className="h-[calc(6rem*var(--glass-density))] text-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <span>{error}</span>
            {onRetry ? (
              <Button variant="secondary" size="sm" onClick={onRetry}>
                {labels.retry}
              </Button>
            ) : null}
          </div>
        </TableCell>
      </TableRow>
    )
  }
  if (!rows.length) {
    return (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={columns.length} className="h-[calc(6rem*var(--glass-density))] text-center text-muted-foreground">
          {empty ?? labels.noResults}
        </TableCell>
      </TableRow>
    )
  }
  return rows.map((row) => (
    <TableRow
      key={row.id}
      ref={measure}
      data-index={row.index}
      data-state={table.state.rowSelection[row.id] ? "selected" : undefined}
      tabIndex={onRowClick ? 0 : undefined}
      onClick={onRowClick ? (event) => !fromInteractive(event.target, event.currentTarget) && onRowClick(row.original) : undefined}
      onKeyDown={
        onRowClick
          ? (event) => {
              if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) {
                event.preventDefault()
                onRowClick(row.original)
              }
            }
          : undefined
      }
      className={cn(onRowClick && "glass-focus-inset cursor-pointer focus-visible:bg-fill-strong")}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} align={cell.column.columnDef.meta?.align} numeric={cell.column.columnDef.meta?.numeric}>
          <table.FlexRender cell={cell} />
        </TableCell>
      ))}
    </TableRow>
  ))
}

/** Every sorted, filtered row in one scrolling body; spacer rows stand in for the ones off screen. */
function VirtualBody<TData extends RowData>({
  table,
  options,
  ...rest
}: {
  table: DataTableInstance<TData>
  options: { height?: number | string; estimateRowHeight?: number; overscan?: number }
  onRowClick?: (row: TData) => void
  empty?: React.ReactNode
  loading: boolean
  error?: React.ReactNode
  onRetry?: () => void
}) {
  const host = React.useRef<HTMLDivElement>(null)
  const rows = table.getRowModel().rows
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => host.current?.querySelector<HTMLElement>("[data-slot=table-container]") ?? null,
    estimateSize: () => options.estimateRowHeight ?? 44,
    overscan: options.overscan ?? 8,
  })
  const items = virtualizer.getVirtualItems()
  const before = items.length ? items[0].start : 0
  const after = items.length ? virtualizer.getTotalSize() - items[items.length - 1].end : 0
  const columns = table.getVisibleLeafColumns().length
  return (
    <div ref={host} data-slot="data-table-virtual" style={{ ["--data-table-height" as string]: typeof options.height === "number" ? `${options.height}px` : (options.height ?? "28rem") }}>
      <Table containerClassName="h-(--data-table-height) overflow-auto [contain:strict]" aria-rowcount={rows.length + 1}>
        <DataTableHead table={table} sticky />
        <TableBody>
          {before > 0 ? (
            <tr aria-hidden>
              <td colSpan={columns} style={{ height: before, padding: 0 }} />
            </tr>
          ) : null}
          <Rows table={table} rows={items.map((item) => rows[item.index])} measure={virtualizer.measureElement} skeletonRows={8} {...rest} />
          {after > 0 ? (
            <tr aria-hidden>
              <td colSpan={columns} style={{ height: after, padding: 0 }} />
            </tr>
          ) : null}
        </TableBody>
      </Table>
    </div>
  )
}

export {
  DataTable,
  DataTableColumnHeader,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableRowActions,
  DataTableSearch,
  DataTableToolbar,
  DataTableViewOptions,
  selectColumn,
  createDataTableColumnHelper,
  dataTableFeatures,
  DEFAULT_LABELS as dataTableLabels,
  type DataTableColumnMeta,
  type DataTableColumns,
  type DataTableFeatures,
  type DataTableFilter,
  type DataTableFilterOption,
  type DataTableInstance,
  type DataTableLabels,
  type DataTableProps,
  type DataTableState,
}
