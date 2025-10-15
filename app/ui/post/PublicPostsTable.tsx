"use client"

import DataTable, { type DataTableColumnDef } from "@/app/ui/common/data-table"
import { Button } from "@/components/ui/button"

export type PublicPostListItem = {
  id: string
  title: string
  status: string
  likes: number
  views: number
  createdAt: string
  publishedAt: string
  author: {
    id: string
    name: string | null
  }
  commentsCount: number
}

type PublicPostsTableProps = {
  data: PublicPostListItem[]
  loading?: boolean
  onView: (postId: string) => void
}

const columns = (
  onView: (postId: string) => void,
): DataTableColumnDef<PublicPostListItem, unknown>[] => [
  {
    accessorKey: "title",
    header: "标题",
    meta: {
      headerClassName: "w-[35%] text-left",
      cellClassName: "font-medium text-gray-900",
    },
    cell: ({ row }) => row.original.title,
  },
  {
    accessorKey: "author",
    header: "作者",
    meta: {
      headerClassName: "w-[20%] text-left",
    },
    cell: ({ row }) => row.original.author?.name ?? "Unknown Author",
  },
  {
    accessorKey: "views",
    header: "浏览",
    meta: {
      headerClassName: "w-[10%] text-right",
      cellClassName: "text-right",
    },
    cell: ({ row }) => row.original.views,
  },
  {
    accessorKey: "likes",
    header: "点赞",
    meta: {
      headerClassName: "w-[10%] text-right",
      cellClassName: "text-right",
    },
    cell: ({ row }) => row.original.likes,
  },
  {
    accessorKey: "commentsCount",
    header: "评论",
    meta: {
      headerClassName: "w-[10%] text-right",
      cellClassName: "text-right",
    },
    cell: ({ row }) => row.original.commentsCount,
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    meta: {
      headerClassName: "w-[10%] text-left whitespace-nowrap",
    },
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  // {
  //   accessorKey: 'publishedAt',
  //   header: '发布时间',
  //   meta: {
  //     headerClassName: 'w-[10%] text-left whitespace-nowrap',
  //   },
  //   cell: ({ row }) => formatDate(row.original.publishedAt),
  // },
  {
    id: "actions",
    header: "操作",
    enableSorting: false,
    meta: {
      headerClassName: "w-[5%] text-center",
      cellClassName: "text-center",
    },
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" onClick={() => onView(row.original.id)}>
        查看
      </Button>
    ),
  },
]

export default function PublicPostsTable({ data, loading, onView }: PublicPostsTableProps) {
  return (
    <DataTable
      columns={columns(onView)}
      data={data}
      loading={loading}
      emptyState="暂时没有已发布文章"
      tableClassName="border-0"
      headerClassName="bg-gray-50"
      bodyClassName="text-sm text-gray-600"
      rowClassName="hover:bg-gray-50"
      onRowClick={(row) => onView(row.id)}
    />
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
