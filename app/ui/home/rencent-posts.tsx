"use client"

import { Card, CardContent } from "@/components/ui/card"
import DataTable, { type DataTableColumnDef } from "@/app/ui/common/data-table"

type OnRowClick<TData> = (row: TData) => void

type RecentPostsProps<TData, TValue> = {
  columns: DataTableColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: OnRowClick<TData>
}

export default function RecentPosts<TData, TValue>({
  columns,
  data,
  onRowClick,
}: RecentPostsProps<TData, TValue>) {
  return (
    <Card className="rounded-xl border-gray-200">
      <CardContent className="p-6">
        <DataTable
          columns={columns}
          data={data}
          onRowClick={(row) => onRowClick?.(row)}
          emptyState="暂无数据"
          tableClassName="border-0"
          headerClassName="bg-gray-50"
          bodyClassName="text-sm text-gray-600"
          rowClassName="hover:bg-gray-50"
        />
      </CardContent>
    </Card>
  )
}

export type RecentPostsColumnDef<TData, TValue> = DataTableColumnDef<TData, TValue>
