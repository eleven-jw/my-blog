'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Search, {
  type AuthorOption,
  type PostFilterValues,
} from "@/app/ui/post/Search"
import PublicPostsTable, {
  type PublicPostListItem,
} from "@/app/ui/post/PublicPostsTable"
import { Button } from "@/components/ui/button"
import PostBreadcrumb from "@/app/ui/post/PostBreadcrumb"

const defaultFilters: PostFilterValues = {
  title: '',
  startDate: '',
  endDate: '',
  authorId: 'all',
}

const PAGE_SIZE = 10

type PublicPostsResponse = {
  code: number
  message: string
  data: {
    list: PublicPostListItem[]
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

export default function ExplorePage() {
  const router = useRouter()
  const [filters, setFilters] = useState<PostFilterValues>({ ...defaultFilters })
  const [authors, setAuthors] = useState<AuthorOption[]>([])
  const [posts, setPosts] = useState<PublicPostListItem[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
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
          scope: 'public',
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
          throw new Error('获取文章失败')
        }

        const payload = (await response.json()) as PublicPostsResponse
        if (payload.code !== 200) {
          throw new Error(payload.message || '获取文章失败')
        }

        setPosts(payload.data.list)
        setPage(payload.data.page)
        setTotal(payload.data.total)
      } catch (error) {
        const message = error instanceof Error ? error.message : '获取文章失败'
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
      router.push(`/posts/${postId}?from=explore`)
    },
    [router]
  )

  const pagination = useMemo(
    () => ({ page, size: PAGE_SIZE, total }),
    [page, total]
  )

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <PostBreadcrumb />
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">文章广场</h1>
        <p className="text-sm text-gray-500">浏览所有作者发布的公开文章，随时发现新的灵感。</p>
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
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <PublicPostsTable data={posts} loading={loading} onView={handleView} />
        <div className="flex flex-col gap-4 border-t border-gray-100 p-4 md:flex-row md:items-center md:justify-between">
          <span className="text-sm text-gray-600">
            第 {pagination.page} 页，共 {totalPages} 页（共 {pagination.total} 篇文章）
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages || loading}
            >
              下一页
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
