'use client'

import { useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type AuthorOption = {
  id: string
  name: string
}

export type PostFilterValues = {
  title: string
  startDate: string
  endDate: string
  authorId: string
}

type SearchProps = {
  filters: PostFilterValues
  authors: AuthorOption[]
  isSubmitting?: boolean
  onFilterChange: (updates: Partial<PostFilterValues>) => void
  onSearch: () => void
  onReset: () => void
}

export default function Search({
  filters,
  authors,
  isSubmitting,
  onFilterChange,
  onSearch,
  onReset,
}: SearchProps) {
  const handleInputChange = useCallback(
    (key: keyof PostFilterValues) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onFilterChange({ [key]: event.target.value })
      },
    [onFilterChange]
  )

  return (
    <div className="rounded-lg">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">标题</label>
          <Input
            type="text"
            placeholder="请输入文章标题"
            value={filters.title}
            onChange={handleInputChange('title')}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">开始时间</label>
          <Input
            type="date"
            value={filters.startDate}
            onChange={handleInputChange('startDate')}
            max={filters.endDate || undefined}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">结束时间</label>
          <Input
            type="date"
            value={filters.endDate}
            onChange={handleInputChange('endDate')}
            min={filters.startDate || undefined}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">作者</label>
          <select
            className={cn(
              "h-10 w-full rounded-md border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            )}
            value={filters.authorId}
            onChange={handleInputChange('authorId')}
          >
            <option value="all">全部作者</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={onSearch} disabled={isSubmitting}>
          查询
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={isSubmitting}
        >
          重置
        </Button>
      </div>
    </div>
  )
}
