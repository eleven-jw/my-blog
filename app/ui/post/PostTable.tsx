'use client'

import { Button } from "@/components/ui/button"
import DataTable, {
  type DataTableColumnDef,
} from "@/app/ui/common/data-table"

export type PostListItem = {
  id: string
  title: string
  status: string
  likes: number
  views: number
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string | null
  }
  commentsCount: number
}

type PaginationState = {
  page: number
  size: number
  total: number
}

type PostTableProps = {
  data: PostListItem[]
  loading?: boolean
  pagination: PaginationState
  onPageChange: (page: number) => void
  onView: (postId: string) => void
  onEdit: (postId: string) => void
  onDelete: (postId: string) => void
}

const columns = (
  onView: (postId: string) => void,
  onEdit: (postId: string) => void,
  onDelete: (postId: string) => void
): DataTableColumnDef<PostListItem, unknown>[] => [
  {
    accessorKey: 'title',
    header: '标题',
    meta: {
      headerClassName: 'w-[28%] text-left',
      cellClassName: 'font-medium text-gray-900',
    },
    cell: ({ row }) => row.original.title,
  },
  {
    accessorKey: 'author',
    header: '作者',
    meta: {
      headerClassName: 'w-[12%] text-left',
    },
    cell: ({ row }) => row.original.author?.name ?? 'Unknown Author',
  },
  {
    accessorKey: 'status',
    header: '状态',
    meta: {
      headerClassName: 'w-[10%] text-left',
    },
    cell: ({ row }) => row.original.status,
  },
  {
    accessorKey: 'views',
    header: '浏览',
    meta: {
      headerClassName: 'w-[10%] text-right',
      cellClassName: 'text-right',
    },
    cell: ({ row }) => row.original.views,
  },
  {
    accessorKey: 'likes',
    header: '点赞',
    meta: {
      headerClassName: 'w-[10%] text-right',
      cellClassName: 'text-right',
    },
    cell: ({ row }) => row.original.likes,
  },
  {
    accessorKey: 'commentsCount',
    header: '评论',
    meta: {
      headerClassName: 'w-[10%] text-right',
      cellClassName: 'text-right',
    },
    cell: ({ row }) => row.original.commentsCount,
  },
  {
    accessorKey: 'createdAt',
    header: '创建时间',
    meta: {
      headerClassName: 'w-[10%] text-left',
    },
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    accessorKey: 'updatedAt',
    header: '更新时间',
    meta: {
      headerClassName: 'w-[10%] text-left',
    },
    cell: ({ row }) => formatDate(row.original.updatedAt),
  },
  {
    id: 'actions',
    header: '操作',
    enableSorting: false,
    meta: {
      headerClassName: 'w-[10%] text-center',
      cellClassName: 'text-center',
    },
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onView(row.original.id)}>
          查看
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(row.original.id)}>
          编辑
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(row.original.id)}>
          删除
        </Button>
      </div>
    ),
  },
]

export default function PostTable({
  data,
  loading,
  pagination,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: PostTableProps) {
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.size))

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <DataTable
        columns={columns(onView, onEdit, onDelete)}
        data={data}
        loading={loading}
        emptyState="暂无文章"
        tableClassName="border-0"
        headerClassName="bg-gray-50"
        bodyClassName="text-sm text-gray-600"
        rowClassName="hover:bg-gray-50"
        onRowClick={(row) => onView(row.id)}
      />
      <div className="flex flex-col gap-4 border-t border-gray-100 p-4 md:flex-row md:items-center md:justify-between">
        <span className="text-sm text-gray-600">
          第 {pagination.page} 页，共 {totalPages} 页（共 {pagination.total} 条记录）
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || loading}
          >
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= totalPages || loading}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
