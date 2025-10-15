'use client';
import { sanitizeForRender } from '@/lib/sanitizeHtml';
import { formatRelativeTime } from '@/lib/utils';
import type { PostComment } from './types'

type CommentItemProps = {
  comment: PostComment
}

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value)

export default function CommentItem({ comment }: CommentItemProps) {
  const createdAt = new Date(comment.createdAt)
  const initial = comment.authorName?.trim()?.charAt(0)?.toUpperCase() || '友'

  return (
    <article className="rounded-xl border border-gray-100 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
          {initial}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-gray-900">{comment.authorName}</span>
            <span className="text-xs text-gray-400">{formatRelativeTime(createdAt)}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">{formatDate(createdAt)}</span>
          </div>
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{
              __html: sanitizeForRender(
                comment.content || '<p class="text-gray-400">暂无内容</p>',
              ),
            }}
          />
        </div>
      </div>
    </article>
  )
}
