import * as React from "react"
import { View, type ViewProps } from "react-native"
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
import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react-native"

import { Button } from "@/components/glass/native/button"
import { Checkbox } from "@/components/glass/native/checkbox"
import { Input } from "@/components/glass/native/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/glass/native/table"
import { GText, useUI } from "@/components/glass/native/ui"

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

/**
 * Renders a cell or header definition as its own component, as flexRender does,
 * but sets a string or number result in GText — on native, text outside <Text> throws.
 */
function Rendered<P extends object>({ def, context, muted }: { def: unknown; context: P; muted?: boolean }) {
  const out = (typeof def === "function" ? (def as (p: P) => React.ReactNode)(context) : def) as React.ReactNode
  if (typeof out === "string" || typeof out === "number")
    return (
      <GText size={muted ? "xs" : "sm"} tone={muted ? "muted" : "default"} weight={muted ? "500" : undefined} numberOfLines={1}>
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
    enableGlobalFilter: false,
    // Subscribe keeps these in step under the React Compiler, which can't see state behind table methods.
    header: ({ table }) => (
      <Subscribe source={table.store}>
        {() => (
          <Checkbox
            accessibilityLabel="Select all rows on this page"
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
            accessibilityLabel="Select row"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(value) => row.toggleSelected(value === true)}
          />
        )}
      </Subscribe>
    ),
  })
}

/** A header that sorts its column: a press cycles ascending → descending → off. `align` replaces `justify-end`. */
function DataTableColumnHeader<TData extends RowData, TValue extends CellData>({
  column,
  title,
  align = "left",
  style,
  ...props
}: ViewProps & { column: Column<DataTableFeatures, TData, TValue>; title: React.ReactNode; align?: "left" | "right" }) {
  const ui = useUI()
  const justify = align === "right" ? "flex-end" : "flex-start"
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

/** Selection count (or row count) on the left, page x of y and previous/next on the right. */
function DataTablePagination<TData extends RowData>({ table, style, ...props }: ViewProps & { table: ReactTable<DataTableFeatures, TData> }) {
  const total = table.getFilteredRowModel().rows.length
  const selected = table.getFilteredSelectedRowModel().rows.length
  const pageCount = Math.max(table.getPageCount(), 1)
  const page = Math.min(table.state.pagination.pageIndex + 1, pageCount)
  const numeric = { fontVariant: ["tabular-nums" as const] }
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }, style]} {...props}>
      <GText size="sm" tone="muted" accessibilityLiveRegion="polite" style={numeric}>
        {selected > 0 ? `${selected} of ${total} selected` : `${total} ${total === 1 ? "row" : "rows"}`}
      </GText>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <GText size="sm" tone="muted" style={numeric}>
          Page {page} of {pageCount}
        </GText>
        <Button variant="secondary" size="icon-sm" accessibilityLabel="Previous page" disabled={!table.getCanPreviousPage()} onPress={() => table.previousPage()}>
          <ChevronLeftIcon />
        </Button>
        <Button variant="secondary" size="icon-sm" accessibilityLabel="Next page" disabled={!table.getCanNextPage()} onPress={() => table.nextPage()}>
          <ChevronRightIcon />
        </Button>
      </View>
    </View>
  )
}

type DataTableProps<TData extends RowData> = Omit<ViewProps, "children"> & {
  columns: DataTableColumns<TData>
  data: TableOptions<DataTableFeatures, TData>["data"]
  /** Shows a search box that filters every text and number column. */
  searchPlaceholder?: string
  /** Rows per page. */
  pageSize?: number
  initialSorting?: SortingState
  /** Stable ids keep selection attached to the right rows when sorting and paging. */
  getRowId?: TableOptions<DataTableFeatures, TData>["getRowId"]
  /** Makes rows pressable. */
  onRowClick?: (row: TData) => void
  /** Shown when there are no rows, or none match the search. */
  empty?: React.ReactNode
  /** Column min width before the table scrolls sideways; the select column is always narrow. */
  minColumnWidth?: number
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
  minColumnWidth,
  style,
  ...props
}: DataTableProps<TData>) {
  const ui = useUI()
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    globalFilterFn: "includesString",
    initialState: { pagination: { pageIndex: 0, pageSize }, sorting: initialSorting },
  })
  // read sorting here too, as the web does: the row model below must re-run when it changes
  const { sorting, rowSelection, globalFilter } = table.state
  void sorting
  const rows = table.getRowModel().rows
  // The checkbox column hugs its content, as the web's `has-[role=checkbox]:w-px`.
  const narrow = (id: string) => (id === "select" ? { flex: 0, minWidth: 0, width: 40, paddingRight: 0 } : null)

  return (
    <View style={[{ gap: 12 }, style]} {...props}>
      {searchPlaceholder !== undefined && (
        <View style={{ maxWidth: 320, justifyContent: "center" }}>
          <SearchIcon color={ui.mutedForeground} size={16} style={{ position: "absolute", left: 12, zIndex: 1 }} pointerEvents="none" />
          <Input
            accessibilityLabel={searchPlaceholder}
            placeholder={searchPlaceholder}
            inputMode="search"
            returnKeyType="search"
            autoCorrect={false}
            value={typeof globalFilter === "string" ? globalFilter : ""}
            onChangeText={(text) => table.setGlobalFilter(text)}
            style={{ height: ui.control.sm, paddingLeft: 36 }}
          />
        </View>
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id} colSpan={header.colSpan} minWidth={minColumnWidth} style={narrow(header.column.id)}>
                  {header.isPlaceholder ? null : <Rendered def={header.column.columnDef.header} context={header.getContext()} muted />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow key={row.id} selected={!!rowSelection[row.id]} onPress={onRowClick ? () => onRowClick(row.original) : undefined}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id} minWidth={minColumnWidth} style={narrow(cell.column.id)}>
                    <Rendered def={cell.column.columnDef.cell} context={cell.getContext()} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={table.getAllLeafColumns().length} align="center" tone="muted" style={{ height: 96 }}>
                {empty}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </View>
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
