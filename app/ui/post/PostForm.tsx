'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import RichTextEditor from "@/app/ui/post/RichTextEditor"
import { getTomorrowDate, getCurrentDate } from '@/lib/utils'

type PostFormValues = {
  title: string
  content: string
  status: string
  publishedAt: string
}

type PostFormProps = {
  postId?: string
  initialValues?: Partial<PostFormValues>
}

const statusOptions: Array<{ value: string; label: string }> = [
  { value: 'draft', label: 'draft' },
  { value: 'published', label: 'published' },
  { value: 'scheduled', label: 'scheduled' },
]

export default function PostForm({ postId, initialValues }: PostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [content, setContent] = useState(initialValues?.content ?? '<p></p>')
  const [status, setStatus] = useState(initialValues?.status ?? 'published')
  const [publishedAt, setPublishedAt] = useState(initialValues?.publishedAt ?? getCurrentDate())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isEditMode = Boolean(postId)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('event', event.target.value);
    setPublishedAt(event.target.value);
  }
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const plainText = content.replace(/<[^>]*>/g, '').trim()
      if (!plainText) {
        throw new Error('content should not be empty')
      }

      const payload: Record<string, string> = {
        title: title.trim(),
        content,
        status,
      }

      if (isEditMode && postId) {
        payload.id = postId
      }
      if (isEditMode && publishedAt) {
        payload.publishedAt = status === 'scheduled' ? publishedAt : getCurrentDate()
      }

      const response = await fetch('/api/posts/list', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to save')
      }

      const data = await response.json()
      if (data.code !== 200) {
        throw new Error(data.message || 'Failed to save')
      }

      setSuccess(isEditMode ? 'update sucess' : 'create success')

      const nextPostId = data.data?.id ?? postId
      if (nextPostId) {
        router.push(`/posts/${nextPostId}`)
      } else {
        router.push('/posts')
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Failed to save'
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
            Title
          </label>
          <Input
            id="post-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="please input title"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="post-status">
            Status
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

        {status === 'scheduled' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Will Publish At:</label>
            <Input
              type="date"
              value={publishedAt}
              min={getTomorrowDate()}
              onChange={handleInputChange}
            />
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Content</label>
          <RichTextEditor value={content} onChange={setContent} placeholder="please input content" />
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
            {submitting ? 'saving...' : 'save'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
