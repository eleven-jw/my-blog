"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import RichTextEditor from "@/app/ui/post/RichTextEditor"
import { getTomorrowDate, getCurrentDate } from "@/lib/utils"
import TagInput from "@/app/ui/post/TagInput"
import { Tag } from "@/types/post"
import { MAX_TAGS_PER_POST, TAG_NAME_MAX_LENGTH } from "@/lib/tagRules"

type PostFormValues = {
  title: string
  content: string
  status: string
  publishedAt: string
  tags: Tag[]
}

type PostFormProps = {
  postId?: string
  initialValues?: Partial<PostFormValues>
}

const statusOptions: Array<{ value: string; label: string }> = [
  { value: "draft", label: "draft" },
  { value: "published", label: "published" },
  { value: "scheduled", label: "scheduled" },
]

export default function PostForm({ postId, initialValues }: PostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialValues?.title ?? "")
  const [content, setContent] = useState(initialValues?.content ?? "<p></p>")
  const [status, setStatus] = useState(initialValues?.status ?? "published")
  const [publishedAt, setPublishedAt] = useState(initialValues?.publishedAt ?? getCurrentDate())
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialValues?.tags ?? [])
  const [existingTags, setExistingTags] = useState<Tag[]>([])
  const [tagError, setTagError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isEditMode = Boolean(postId)
  useEffect(() => {
    const loadTags = async () => {
      try {
        const data = await fetch("/api/tags")
        if (!data.ok) throw new Error("Failed to get tags")

        const tags = await data.json()
        if (tags.code !== 200) throw new Error(tags.message)
        const deduped = Array.from(new Map(tags.data.map((tag: Tag) => [tag.name, tag])).values())
        setExistingTags(deduped)
      } catch (err) {
        console.error("Failed to get tags:", err)
      }
    }
    loadTags()
  }, [])
  useEffect(() => {
    if (!initialValues?.tags || !initialValues.tags.length) {
      return
    }

    const incomingTags = initialValues.tags
    setSelectedTags((prev) => (prev.length ? prev : incomingTags))
    setExistingTags((prev) => {
      const map = new Map<string, Tag>()
      prev.forEach((tag) => {
        map.set(tag.name, tag)
      })
      incomingTags.forEach((tag) => {
        map.set(tag.name, tag)
      })
      return Array.from(map.values())
    })
  }, [initialValues?.tags])
  const handleAddNewTag = async (tagName: string) => {
    const trimmed = tagName.trim()

    if (!trimmed) {
      setTagError("please input tag name")
      return
    }

    if (trimmed.length > TAG_NAME_MAX_LENGTH) {
      setTagError(`tag should no more than ${TAG_NAME_MAX_LENGTH} `)
      return
    }

    const isExist =
      existingTags.some((t) => t.name === trimmed) || selectedTags.some((t) => t.name === trimmed)
    if (isExist) {
      setTagError("tag exits")
      return
    }

    if (selectedTags.length >= MAX_TAGS_PER_POST) {
      setTagError(`please choose less than ${MAX_TAGS_PER_POST} tags`)
      return
    }

    const tempId = `new-${Date.now()}`
    const newTag = { id: tempId, name: trimmed }
    setSelectedTags((prev) => [...prev, newTag])
    setExistingTags((prev) => {
      if (prev.some((tag) => tag.name === trimmed)) {
        return prev
      }
      return [...prev, newTag]
    })
    setTagError("")
  }

  const handleToggleExistingTag = (tag: Tag) => {
    setSelectedTags((prev) => {
      const isSelected = prev.some((t) => t.id === tag.id)
      if (isSelected) {
        return prev.filter((t) => t.id !== tag.id)
      } else {
        if (prev.length >= MAX_TAGS_PER_POST) {
          setTagError(`please choose less than ${MAX_TAGS_PER_POST} tags`)
          return prev
        }
        if (prev.some((t) => t.name === tag.name)) {
          setTagError("tag exits")
          return prev
        }
        return [...prev, tag]
      }
    })
    setTagError("")
  }

  const handleRemoveTag = (tag: Tag) => {
    setSelectedTags((prev) => prev.filter((t) => t.id !== tag.id))
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPublishedAt(event.target.value)
  }
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const plainText = content.replace(/<[^>]*>/g, "").trim()
      if (!plainText) {
        throw new Error("content should not be empty")
      }

      const payload: Record<string, string | string[] | Tag[]> = {
        title: title.trim(),
        content,
        status,
        tags: selectedTags.map((tag) => tag.name),
      }

      if (status === "scheduled") {
        payload.publishedAt = publishedAt
      }

      if (isEditMode && postId) {
        payload.id = postId
      }

      const response = await fetch("/api/posts/list", {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to save")
      }

      const data = await response.json()
      if (data.code !== 200) {
        throw new Error(data.message || "Failed to save")
      }

      setSuccess(isEditMode ? "update sucess" : "create success")

      const nextPostId = data.data?.id ?? postId
      if (nextPostId) {
        router.push(`/posts/${nextPostId}`)
      } else {
        router.push("/posts")
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to save"
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
            className="h-10 w-full rounded-md border-input bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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

        {status === "scheduled" && (
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
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="please input content"
          />
        </div>

        <TagInput
          selectedTags={selectedTags}
          existingTags={existingTags}
          onToggleExistingTag={handleToggleExistingTag}
          onAddNewTag={handleAddNewTag}
          onRemoveTag={handleRemoveTag}
          maxTags={MAX_TAGS_PER_POST}
          tagMaxLength={TAG_NAME_MAX_LENGTH}
          error={tagError}
        />
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
            {submitting ? "saving..." : "save"}
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
