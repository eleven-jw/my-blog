'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Search, {
  AuthorOption,
  PostFilterValues,
} from "@/app/ui/post/Search"
import CreatePostButton from "@/app/ui/post/Button"
import ConfirmDialog from "@/app/ui/post/Dialog"
import PostTable, { PostListItem } from "@/app/ui/post/PostTable"
import PostBreadcrumb from "@/app/ui/post/PostBreadcrumb"

const defaultFilters: PostFilterValues = {
  title: '',
  startDate: '',
  endDate: '',
  authorId: 'all',
}

const PAGE_SIZE = 10

type PostListResponse = {
  code: number
  message: string
  data: {
    list: PostListItem[]
    page: number
    size: number
    total: number
  }
}

type AuthorsResponse = {
  code: number
  message: string
  data: AuthorOption[]
}

export default function PostsPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<PostFilterValues>({ ...defaultFilters })
  const [posts, setPosts] = useState<PostListItem[]>([])
  const [authors, setAuthors] = useState<AuthorOption[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [targetPostId, setTargetPostId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchAuthors = useCallback(async () => {
    try {
      const response = await fetch('/api/users/authors')
      if (!response.ok) {
        throw new Error('获取作者列表失败')
      }
      const payload = (await response.json()) as AuthorsResponse
      if (payload.code !== 200) {
        throw new Error(payload.message || '获取作者列表失败')
      }

      const unique = new Map<string, AuthorOption>()
      payload.data.forEach((author) => {
        unique.set(author.id, {
          id: author.id,
          name: author.name || '未命名作者',
        })
      })
      setAuthors(Array.from(unique.values()))
    } catch (error) {
      console.error(error)
      setAuthors([])
    }
  }, [])

  const fetchPosts = useCallback(
    async (nextPage: number, activeFilters: PostFilterValues) => {
      setLoading(true)
      setErrorMessage(null)
      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          size: String(PAGE_SIZE),
        })

        if (activeFilters.title) {
          params.set('title', activeFilters.title)
        }
        if (activeFilters.startDate) {
          params.set('startDate', activeFilters.startDate)
        }
        if (activeFilters.endDate) {
          params.set('endDate', activeFilters.endDate)
        }
        if (activeFilters.authorId && activeFilters.authorId !== 'all') {
          params.set('authorId', activeFilters.authorId)
        }

        const response = await fetch(`/api/posts/list?${params.toString()}`)
        if (!response.ok) {
          throw new Error('获取文章列表失败')
        }

        const payload = (await response.json()) as PostListResponse
        if (payload.code !== 200) {
          throw new Error(payload.message || '获取文章列表失败')
        }

        setPosts(payload.data.list)
        setPage(payload.data.page)
        setTotal(payload.data.total)
      } catch (error) {
        const message = error instanceof Error ? error.message : '获取文章列表失败'
        setErrorMessage(message)
        setPosts([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    fetchAuthors()
    fetchPosts(1, { ...defaultFilters })
  }, [fetchAuthors, fetchPosts])

  const handleFilterChange = useCallback((updates: Partial<PostFilterValues>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleSearch = useCallback(() => {
    fetchPosts(1, filters)
  }, [fetchPosts, filters])

  const handleReset = useCallback(() => {
    setFilters({ ...defaultFilters })
    fetchPosts(1, { ...defaultFilters })
  }, [fetchPosts])

  const handlePageChange = useCallback(
    (nextPage: number) => {
      if (nextPage < 1) return
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
      if (nextPage > totalPages) return
      fetchPosts(nextPage, filters)
    },
    [fetchPosts, filters, total]
  )

  const handleView = useCallback(
    (postId: string) => {
      router.push(`/posts/${postId}`)
    },
    [router]
  )

  const handleEdit = useCallback(
    (postId: string) => {
      router.push(`/posts/${postId}/edit`)
    },
    [router]
  )

  const handleDeleteRequest = useCallback((postId: string) => {
    setTargetPostId(postId)
    setDialogOpen(true)
  }, [])

  const handleDeleteCancel = useCallback(() => {
    if (deleteLoading) return
    setDialogOpen(false)
    setTargetPostId(null)
  }, [deleteLoading])

  const handleDeleteConfirm = useCallback(async () => {
    if (!targetPostId) return
    setDeleteLoading(true)
    try {
      const response = await fetch('/api/posts/list', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: targetPostId }),
      })

      if (!response.ok) {
        throw new Error('删除文章失败')
      }

      const payload = await response.json()
      if (payload.code !== 200) {
        throw new Error(payload.message || '删除文章失败')
      }

      setDialogOpen(false)
      setTargetPostId(null)
      const totalPages = Math.max(1, Math.ceil((total - 1) / PAGE_SIZE))
      const nextPage = Math.min(page, totalPages)
      fetchPosts(nextPage, filters)
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除文章失败'
      setErrorMessage(message)
    } finally {
      setDeleteLoading(false)
    }
  }, [fetchPosts, filters, page, targetPostId, total])

  const pagination = useMemo(
    () => ({ page, size: PAGE_SIZE, total }),
    [page, total]
  )

  return (
    <div className="space-y-6">
      <PostBreadcrumb
        items={[
          { label: '首页', href: '/' },
          { label: '文章管理' },
        ]}
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">文章管理</h1>
        <CreatePostButton />
      </div>
      <Search
        filters={filters}
        authors={authors}
        isSubmitting={loading}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
      />
      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}
      <PostTable
        data={posts}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />
      <ConfirmDialog
        open={dialogOpen}
        title="确认删除文章"
        description="删除后文章将无法恢复，确认要继续吗？"
        confirmText={deleteLoading ? '删除中...' : '删除'}
        confirmDisabled={deleteLoading}
        cancelDisabled={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  )
}
