'use client';

import { useMemo, useState } from "react"
import { Tag } from "@/types/post"
import { MAX_TAGS_PER_POST, TAG_NAME_MAX_LENGTH } from "@/lib/tagRules"

interface TagInputProps {
  selectedTags: Tag[];
  existingTags: Tag[];
  onToggleExistingTag: (tags: Tag) => void;
  onAddNewTag: (tagName: string) => void;
  onRemoveTag: (tag: Tag) => void;
  maxTags?: number
  tagMaxLength?: number
  error?: string;
}

export default function TagInput ({
  selectedTags,
  existingTags,
  onToggleExistingTag,
  onAddNewTag,
  onRemoveTag,
  maxTags = MAX_TAGS_PER_POST,
  tagMaxLength = TAG_NAME_MAX_LENGTH,
  error,
}: TagInputProps) {
  const [inputTag, setInputTag] = useState('')

  const suggestions = useMemo(() => {
    const map = new Map<string, Tag>()
    existingTags.forEach((tag) => {
      map.set(tag.name.toLowerCase(), tag)
    })
    return Array.from(map.values())
  }, [existingTags])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTag(e.target.value)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const trimmed = inputTag.trim()
      if (!trimmed || selectedTags.length >= maxTags) {
        return
      }
      onAddNewTag(trimmed)
      setInputTag('')
    }
  }

  const handleExistingTagClick = (tag: Tag) => {
    onToggleExistingTag(tag)
  }

  const handleTagRemove = (tag: Tag) => {
    onRemoveTag(tag)
  }

  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm font-medium text-gray-700">Tags</label>

      <div className="mb-2 flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
          >
            <span>{tag.name}</span>
            <button
              type="button"
              className="ml-2 text-gray-500 hover:text-gray-700"
              onClick={() => handleTagRemove(tag)}
              aria-label={`移除标签 ${tag.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="flex-grow">
        <input
          type="text"
          value={inputTag}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder="输入新标签，按 Enter 添加"
          className="w-full rounded-md bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          disabled={selectedTags.length >= maxTags}
          maxLength={tagMaxLength}
        />
      </div>

      <div className="mt-3">
        <span className="mb-1 block text-sm font-medium text-gray-700">推荐标签：</span>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((tag) => {
            const isSelected = selectedTags.some((t) => t.id === tag.id || t.name === tag.name)
            return (
              <button
                key={tag.id}
                type="button"
                className={`rounded-full px-3 py-1 text-sm transition ${
                  isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => handleExistingTagClick(tag)}
              >
                {tag.name}
              </button>
            )
          })}
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      <p className="mt-2 text-xs text-gray-500">
        最多可选择 {maxTags} 个标签，每个标签不超过 {tagMaxLength} 。
      </p>
    </div>
  )
}
