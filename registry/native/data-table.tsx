import * as React from "react"
import { View, type ViewProps } from "react-native"
import { FlashList } from "@shopify/flash-list"
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
  type TableOptions,
  type TableState,
  type Updater,
} from "@tanstack/react-table"
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
} from "lucide-react-native"

import { Button } from "@/components/glass/native/button"
import { Checkbox } from "@/components/glass/native/checkbox"
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
} from "@/components/glass/native/dropdown-menu"
import { Input } from "@/components/glass/native/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/glass/native/table"
import { GText, useUI } from "@/components/glass/native/ui"

/**
 * The web data-table recipe as one component, on TanStack Table v9 and the glass `table`:
 * sorting, search, faceted filters, column visibility, selection, pagination with page
 * sizes, loading / error / empty rows, controlled or server-side (`manual`) state, and a
 * `virtual` body on FlashList for thousands of rows.
 *
 *   const col = createDataTableColumnHelper<Workout>()
 *   const columns = col.columns([
 *     selectColumn<Workout>(),
 *     col.accessor("activity", { filterFn: "arrIncludesSome", header: ({ column }) => <DataTableColumnHeader column={column} title="Activity" /> }),
 *   ])
 *   <DataTable columns={columns} data={workouts} searchPlaceholder="Search sessions…" filters={[{ column: "activity", title: "Activity", options }]} />
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

/**
 * Renders a cell or header definition as its own component, as flexRender does,
 * but sets a string or number result in GText — on native, text outside <Text> throws.
 */
function Rendered<P extends object>({ def, context, muted }: { def: unknown; context: P; muted?: boolean }) {
  const out = (typeof def === "function" ? (def as (p: P) => React.ReactNode)(context) : def) as React.ReactNode
  if (typeof out === "string" || typeof out === "number")
    return (
      <GText size={muted ? "xs" : "sm"} tone={muted ? "muted" : "default"} weight={muted ? "500" : undefined} numberOfLines={1} style={muted ? undefined : { fontVariant: ["tabular-nums"] }}>
        {out}
      </GText>
    )
  return <>{out}</>
}

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
    header: ({ table }) => (
      <Subscribe source={table.store}>
        {() => (
          <Checkbox
            accessibilityLabel={DEFAULT_LABELS.selectAll}
            checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)}
          />
        )}
      </Subscribe>
    ),
    cell: ({ row }) => (
      <Subscribe source={row.table.store} selector={(state) => state.rowSelection}>
        {() => <Checkbox accessibilityLabel={DEFAULT_LABELS.selectRow} checked={row.getIsSelected()} disabled={!row.getCanSelect()} onCheckedChange={(value) => row.toggleSelected(value === true)} />}
      </Subscribe>
    ),
  })
}

/** A header that sorts its column: a press cycles ascending → descending → off. */
function DataTableColumnHeader<TData extends RowData, TValue extends CellData>({
  column,
  title,
  align,
  style,
  ...props
}: ViewProps & { column: Column<DataTableFeatures, TData, TValue>; title: React.ReactNode; align?: "start" | "end" | "left" | "right" }) {
  const ui = useUI()
  const end = align === "end" || align === "right" || (!align && (column.columnDef.meta?.numeric || column.columnDef.meta?.align === "end"))
  const justify = end ? "flex-end" : "flex-start"
  const label = (color: string) =>
    typeof title === "string" ? (
      <GText size="xs" weight="500" color={color}>
        {title}
      </GText>
    ) : (
      title
    )
  if (!column.getCanSort()) {
    return (
      <View style={[{ flexDirection: "row", justifyContent: justify, flex: 1 }, style]} {...props}>
        {label(ui.mutedForeground)}
      </View>
    )
  }
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", justifyContent: justify, flex: 1 }, style]} {...props}>
      <Subscribe source={column.table.store} selector={(state) => state.sorting}>
        {() => {
          const sorted = column.getIsSorted()
          const Icon = sorted === "asc" ? ArrowUpIcon : sorted === "desc" ? ArrowDownIcon : ChevronsUpDownIcon
          const color = sorted ? ui.foreground : ui.mutedForeground
          return (
            <Button
              variant="ghost"
              size="xs"
              accessibilityHint="Sorts this column"
              accessibilityValue={{ text: sorted ? (sorted === "desc" ? "descending" : "ascending") : "none" }}
              onPress={() => column.toggleSorting()}
              style={{ marginHorizontal: -8, paddingHorizontal: 8 }}
            >
              {label(color)}
              <Icon color={color} size={14} style={{ opacity: sorted ? 1 : 0.5 }} />
            </Button>
          )
        }}
      </Subscribe>
    </View>
  )
}

/** One option of a faceted filter. */
interface DataTableFilterOption {
  label: string
  value: string
  icon?: React.ComponentType<{ size?: number; color?: string }>
}

/** One faceted filter in the toolbar: a column id, a title and its options. */
interface DataTableFilter {
  column: string
  title: string
  options: DataTableFilterOption[]
}

/**
 * A toolbar button that filters a column by any of a set of values, with a count beside
 * each from the rows the other filters leave (faceting). The column filters with
 * `arrIncludesSome` — set `filterFn: "arrIncludesSome"` on it.
 */
function DataTableFacetedFilter<TData extends RowData, TValue extends CellData>({ column, title, options }: { column?: Column<DataTableFeatures, TData, TValue>; title: string; options: DataTableFilterOption[] }) {
  const ui = useUI()
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
            <DropdownMenuTrigger
              accessibilityLabel={selected.size ? `${title}, ${selected.size} selected` : title}
              style={{ flexDirection: "row", alignItems: "center", gap: 6, height: ui.control.sm, paddingHorizontal: ui.pad.xs, borderRadius: ui.radius.button, borderWidth: 1, borderStyle: "dashed", borderColor: ui.separator, backgroundColor: ui.fill }}
            >
              <CirclePlusIcon size={14} color={ui.mutedForeground} />
              <GText size="sm" weight="500">
                {title}
              </GText>
              {selected.size > 0 ? (
                <GText size="xs" weight="500" style={{ backgroundColor: ui.fillStrong, borderRadius: ui.radius.badge, paddingHorizontal: 6, overflow: "hidden", fontVariant: ["tabular-nums"] }}>
                  {String(selected.size)}
                </GText>
              ) : null}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" style={{ minWidth: 192 }}>
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
                    {Icon ? <Icon size={16} color={ui.mutedForeground} /> : null}
                    <GText size="sm" style={{ flex: 1 }}>
                      {option.label}
                    </GText>
                    <GText size="xs" tone="muted" style={{ marginStart: 16, fontVariant: ["tabular-nums"] }}>
                      {String(facets.get(option.value) ?? 0)}
                    </GText>
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
  const ui = useUI()
  const labels = useLabels()
  return (
    <Subscribe source={table.store} selector={(state) => state.columnVisibility}>
      {() => (
        <DropdownMenu>
          <DropdownMenuTrigger style={{ flexDirection: "row", alignItems: "center", gap: 6, height: ui.control.sm, paddingHorizontal: ui.pad.xs, borderRadius: ui.radius.button, backgroundColor: ui.fill }}>
            <Settings2Icon size={14} color={ui.foreground} />
            <GText size="sm" weight="500">
              {labels.view}
            </GText>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" style={{ minWidth: 160 }}>
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
  const ui = useUI()
  const labels = useLabels()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger accessibilityLabel={label ?? labels.rowActions} style={{ width: ui.control.sm, height: ui.control.sm, alignItems: "center", justifyContent: "center", borderRadius: ui.radius.button }}>
        <EllipsisIcon size={16} color={ui.mutedForeground} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}

/** The value after `delay` ms without change — filtering and announcing shouldn't run per keystroke. */
function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/** Search across every text and number column; typing settles for 200ms before the table filters. */
function DataTableSearch<TData extends RowData>({ table, placeholder }: { table: DataTableInstance<TData>; placeholder?: string }) {
  const ui = useUI()
  const labels = useLabels()
  const current = typeof table.state.globalFilter === "string" ? table.state.globalFilter : ""
  const [text, setText] = React.useState(current)
  const settled = useDebounced(text, 200)
  React.useEffect(() => {
    const now = table.store.state.globalFilter
    if (settled !== (typeof now === "string" ? now : "")) table.setGlobalFilter(settled)
  }, [settled, table])
  return (
    <View style={{ width: "100%", maxWidth: 320, justifyContent: "center" }}>
      <SearchIcon color={ui.mutedForeground} size={16} style={{ position: "absolute", start: 12, zIndex: 1 }} pointerEvents="none" />
      <Input
        accessibilityLabel={placeholder ?? labels.search}
        placeholder={placeholder ?? labels.search}
        inputMode="search"
        returnKeyType="search"
        autoCorrect={false}
        value={text}
        onChangeText={setText}
        style={{ height: ui.control.sm, paddingStart: 36 }}
      />
    </View>
  )
}

/** Search, faceted filters, a reset when anything is filtered, your own actions, and the view menu. */
function DataTableToolbar<TData extends RowData>({
  table,
  searchPlaceholder,
  filters = [],
  viewOptions = true,
  style,
  children,
  ...props
}: ViewProps & { table: DataTableInstance<TData>; searchPlaceholder?: string; filters?: DataTableFilter[]; viewOptions?: boolean }) {
  const labels = useLabels()
  return (
    <Subscribe source={table.store} selector={(state) => state.columnFilters}>
      {(columnFilters) => (
        <View style={[{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }, style]} {...props}>
          {searchPlaceholder !== undefined ? <DataTableSearch table={table} placeholder={searchPlaceholder} /> : null}
          {filters.map((f) => (
            <DataTableFacetedFilter key={f.column} column={table.getColumn(f.column)} title={f.title} options={f.options} />
          ))}
          {columnFilters.length > 0 ? (
            <Button variant="ghost" size="sm" onPress={() => table.resetColumnFilters()}>
              {labels.reset}
              <XIcon />
            </Button>
          ) : null}
          {children}
          {viewOptions ? (
            <View style={{ marginStart: "auto" }}>
              <DataTableViewOptions table={table} />
            </View>
          ) : null}
        </View>
      )}
    </Subscribe>
  )
}

/** Selection count (or row count), rows per page, page x of y and first/previous/next/last. */
function DataTablePagination<TData extends RowData>({ table, pageSizes = [10, 20, 50, 100], style, ...props }: ViewProps & { table: DataTableInstance<TData>; pageSizes?: number[] }) {
  const ui = useUI()
  const labels = useLabels()
  const total = table.options.manualPagination && table.options.rowCount !== undefined ? table.options.rowCount : table.getFilteredRowModel().rows.length
  const selected = Object.keys(table.state.rowSelection).length
  const pageCount = Math.max(table.getPageCount(), 1)
  const { pageIndex, pageSize } = table.state.pagination
  const page = Math.min(pageIndex + 1, pageCount)
  // spoken once typing settles, not per keystroke
  const status = useDebounced(selected > 0 ? labels.selected(selected, total) : labels.rows(total), 500)
  const numeric = { fontVariant: ["tabular-nums" as const] }
  return (
    <View style={[{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }, style]} {...props}>
      <GText size="sm" tone="muted" accessibilityLiveRegion="polite" style={numeric}>
        {status}
      </GText>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 16, rowGap: 8 }}>
        <DropdownMenu>
          <DropdownMenuTrigger accessibilityLabel={`${labels.rowsPerPage}: ${pageSize}`} style={{ flexDirection: "row", alignItems: "center", gap: 6, height: ui.control.sm, paddingHorizontal: 8, borderRadius: ui.radius.button }}>
            <GText size="sm" tone="muted">
              {labels.rowsPerPage}
            </GText>
            <GText size="sm" weight="500" style={numeric}>
              {String(pageSize)}
            </GText>
            <ChevronsUpDownIcon size={14} color={ui.mutedForeground} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={String(pageSize)} onValueChange={(v) => table.setPageSize(Number(v))}>
              {pageSizes.map((n) => (
                <DropdownMenuRadioItem key={n} value={String(n)}>
                  {String(n)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <GText size="sm" tone="muted" style={numeric}>
          {labels.page(page, pageCount)}
        </GText>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {pageCount > 2 ? (
            <Button variant="secondary" size="icon-sm" accessibilityLabel={labels.first} disabled={!table.getCanPreviousPage()} onPress={() => table.firstPage()}>
              <ChevronsLeftIcon />
            </Button>
          ) : null}
          <Button variant="secondary" size="icon-sm" accessibilityLabel={labels.previous} disabled={!table.getCanPreviousPage()} onPress={() => table.previousPage()}>
            <ChevronLeftIcon />
          </Button>
          <Button variant="secondary" size="icon-sm" accessibilityLabel={labels.next} disabled={!table.getCanNextPage()} onPress={() => table.nextPage()}>
            <ChevronRightIcon />
          </Button>
          {pageCount > 2 ? (
            <Button variant="secondary" size="icon-sm" accessibilityLabel={labels.last} disabled={!table.getCanNextPage()} onPress={() => table.lastPage()}>
              <ChevronsRightIcon />
            </Button>
          ) : null}
        </View>
      </View>
    </View>
  )
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

type DataTableProps<TData extends RowData> = Omit<ViewProps, "children"> & {
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
  /** Makes rows pressable. */
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
  /** Every row in a scrolling FlashList body under a fixed header; only visible rows mount. No pagination. */
  virtual?: boolean | { height?: number; estimateRowHeight?: number }
  /** Skeleton rows in place of data. */
  loading?: boolean
  /** An error row in place of data; with `onRetry`, a retry button. */
  error?: React.ReactNode
  onRetry?: () => void
  /** Strings, for translation. */
  labels?: Partial<DataTableLabels>
  /** Column min width before the table scrolls sideways; the select column is always narrow. */
  minColumnWidth?: number
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
  minColumnWidth,
  tableOptions,
  style,
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
    if (state && slice in state) handlers[HANDLER[slice]] = (updater) => onStateChange?.({ [slice]: functionalUpdate(updater, latest.current?.[slice]) } as Partial<DataTableState>)
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
  // read the slices here too, as the web does: the row model below must re-run when they change
  const { sorting, columnFilters, columnVisibility, globalFilter } = table.state
  void sorting
  void columnFilters
  void columnVisibility
  void globalFilter
  const showToolbar = searchPlaceholder !== undefined || Boolean(filters?.length) || Boolean(toolbar) || viewOptions === true
  const rows = table.getRowModel().rows
  const v = virtual === true ? {} : virtual || null
  const body = { table, onRowClick, empty, loading, error, onRetry, minColumnWidth }

  return (
    <LabelsContext.Provider value={labels}>
      <View style={[{ gap: 12 }, style]} {...props}>
        {showToolbar ? (
          <DataTableToolbar table={table} searchPlaceholder={searchPlaceholder} filters={filters} viewOptions={viewOptions ?? true}>
            {toolbar?.(table)}
          </DataTableToolbar>
        ) : null}
        <Table>
          <DataTableHead table={table} minColumnWidth={minColumnWidth} />
          {v ? (
            <View style={{ height: v.height ?? 448 }}>
              {loading || error || !rows.length ? (
                <TableBody>
                  <Rows {...body} rows={rows} skeletonRows={8} />
                </TableBody>
              ) : (
                <FlashList
                  data={rows}
                  keyExtractor={(row) => row.id}
                  renderItem={({ item }) => (
                    <TableBody>
                      <Rows {...body} rows={[item]} />
                    </TableBody>
                  )}
                  extraData={table.state}
                />
              )}
            </View>
          ) : (
            <TableBody>
              <Rows {...body} rows={rows} skeletonRows={Math.min(pageSize, 8)} />
            </TableBody>
          )}
        </Table>
        {v ? null : <DataTablePagination table={table} pageSizes={pageSizes} />}
      </View>
    </LabelsContext.Provider>
  )
}

/** The checkbox column hugs its content, as the web's `has-[role=checkbox]:w-px`. */
const narrow = (id: string) => (id === "select" ? { flex: 0, minWidth: 0, width: 40, paddingEnd: 0 } : null)

function DataTableHead<TData extends RowData>({ table, minColumnWidth }: { table: DataTableInstance<TData>; minColumnWidth?: number }) {
  return (
    <TableHeader>
      {table.getHeaderGroups().map((group) => (
        <TableRow key={group.id}>
          {group.headers.map((header) => {
            const meta = header.column.columnDef.meta
            const sort = header.column.getIsSorted()
            return (
              <TableHead
                key={header.id}
                colSpan={header.colSpan}
                align={meta?.align}
                numeric={meta?.numeric}
                minWidth={minColumnWidth}
                accessibilityValue={header.column.getCanSort() ? { text: sort ? (sort === "desc" ? "sorted descending" : "sorted ascending") : "not sorted" } : undefined}
                style={narrow(header.column.id)}
              >
                {header.isPlaceholder ? null : <Rendered def={header.column.columnDef.header} context={header.getContext()} muted />}
              </TableHead>
            )
          })}
        </TableRow>
      ))}
    </TableHeader>
  )
}

function Rows<TData extends RowData>({
  table,
  rows,
  onRowClick,
  empty,
  loading,
  error,
  onRetry,
  minColumnWidth,
  skeletonRows = 5,
}: {
  table: DataTableInstance<TData>
  rows: Row<DataTableFeatures, TData>[]
  onRowClick?: (row: TData) => void
  empty?: React.ReactNode
  loading: boolean
  error?: React.ReactNode
  onRetry?: () => void
  minColumnWidth?: number
  skeletonRows?: number
}) {
  const ui = useUI()
  const labels = useLabels()
  const columns = table.getVisibleLeafColumns()
  if (loading) {
    return Array.from({ length: skeletonRows }, (_, i) => (
      <TableRow key={`skeleton-${i}`} accessibilityElementsHidden={i > 0} importantForAccessibility={i > 0 ? "no-hide-descendants" : "auto"} accessibilityLabel={i === 0 ? labels.loading : undefined}>
        {columns.map((column, c) => (
          <TableCell key={column.id} minWidth={minColumnWidth} style={narrow(column.id)} align={column.columnDef.meta?.align} numeric={column.columnDef.meta?.numeric}>
            <View style={{ height: 14, width: column.id === "select" ? 16 : c % 2 ? 48 : 96, borderRadius: ui.radius.badge, backgroundColor: ui.fill }} />
          </TableCell>
        ))}
      </TableRow>
    ))
  }
  if (error || !rows.length) {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} align="center" tone="muted" role={error ? "alert" : undefined} style={{ height: Math.round(96 * ui.density) }}>
          {error ? (
            <View style={{ alignItems: "center", gap: 8 }}>
              {typeof error === "string" ? (
                <GText size="sm" tone="muted">
                  {error}
                </GText>
              ) : (
                error
              )}
              {onRetry ? (
                <Button variant="secondary" size="sm" onPress={onRetry}>
                  {labels.retry}
                </Button>
              ) : null}
            </View>
          ) : (
            (empty ?? labels.noResults)
          )}
        </TableCell>
      </TableRow>
    )
  }
  return rows.map((row) => (
    <TableRow key={row.id} selected={!!table.state.rowSelection[row.id]} onPress={onRowClick ? () => onRowClick(row.original) : undefined}>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} minWidth={minColumnWidth} style={narrow(cell.column.id)} align={cell.column.columnDef.meta?.align} numeric={cell.column.columnDef.meta?.numeric}>
          <Rendered def={cell.column.columnDef.cell} context={cell.getContext()} />
        </TableCell>
      ))}
    </TableRow>
  ))
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
