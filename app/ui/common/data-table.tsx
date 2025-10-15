"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Cell,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table"

export type DataTableColumnMeta = {
  headerClassName?: string
  cellClassName?: string
}

export type DataTableColumnDef<TData, TValue> = ColumnDef<TData, TValue> & {
  meta?: DataTableColumnMeta
}

type RowClassName<TData> = string | ((row: Row<TData>) => string | undefined)
type CellClassName<TData, TValue> = string | ((cell: Cell<TData, TValue>) => string | undefined)

type DataTableProps<TData, TValue> = {
  columns: DataTableColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  emptyState?: React.ReactNode
  tableClassName?: string
  headerClassName?: string
  bodyClassName?: string
  rowClassName?: RowClassName<TData>
  cellClassName?: CellClassName<TData, TValue>
  onRowClick?: (row: TData, info: Row<TData>) => void
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string
}

const defaultEmptyState = "暂无数据"

export default function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  emptyState = defaultEmptyState,
  tableClassName,
  headerClassName,
  bodyClassName,
  rowClassName,
  cellClassName,
  onRowClick,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  })

  const visibleColumnsCount = table.getVisibleLeafColumns().length || columns.length || 1

  const rows = table.getRowModel().rows

  return (
    <Table className={tableClassName}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const meta = header.column.columnDef.meta as DataTableColumnMeta | undefined
              return (
                <TableHead key={header.id} className={cn(headerClassName, meta?.headerClassName)}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className={bodyClassName}>
        {loading ? (
          <TableRow>
            <TableCell
              colSpan={visibleColumnsCount}
              className="py-8 text-center text-sm text-gray-500"
            >
              加载中...
            </TableCell>
          </TableRow>
        ) : rows.length ? (
          rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              className={cn(
                typeof rowClassName === "function" ? rowClassName(row) : rowClassName,
                onRowClick && "cursor-pointer",
              )}
              onClick={onRowClick ? () => onRowClick(row.original, row) : undefined}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    typeof cellClassName === "function" ? cellClassName(cell) : cellClassName,
                    (cell.column.columnDef.meta as DataTableColumnMeta | undefined)?.cellClassName,
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={visibleColumnsCount}
              className="py-8 text-center text-sm text-gray-500"
            >
              {emptyState}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
