'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type PostFormValues = {
  title: string
  content: string
  status: string
}

type PostFormProps = {
  postId?: string
  initialValues?: Partial<PostFormValues>
}

const statusOptions: Array<{ value: string; label: string }> = [
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已发布' },
  { value: 'scheduled', label: '计划发布' },
]

export default function PostForm({ postId, initialValues }: PostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [content, setContent] = useState(initialValues?.content ?? '')
  const [status, setStatus] = useState(initialValues?.status ?? 'draft')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isEditMode = Boolean(postId)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const payload: Record<string, string> = {
        title: title.trim(),
        content: content.trim(),
        status,
      }

      if (isEditMode && postId) {
        payload.id = postId
      }

      const response = await fetch('/api/posts/list', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('保存文章失败')
      }

      const data = await response.json()
      if (data.code !== 200) {
        throw new Error(data.message || '保存文章失败')
      }

      setSuccess(isEditMode ? '文章更新成功' : '文章创建成功')

      const nextPostId = data.data?.id ?? postId
      if (nextPostId) {
        router.push(`/posts/${nextPostId}`)
      } else {
        router.push('/posts')
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : '保存文章失败'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="post-title">
            标题
          </label>
          <Input
            id="post-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="请输入文章标题"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="post-status">
            状态
          </label>
          <select
            id="post-status"
            className="h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="post-content">
            正文
          </label>
          <textarea
            id="post-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="请输入文章内容"
            className="min-h-[240px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          />
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-600">
            {success}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? '保存中...' : '保存文章'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            取消
          </Button>
        </div>
      </form>
    </div>
  )
}
