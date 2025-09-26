'use client';
import { sanitizeForRender } from '@/lib/sanitizeHtml';
import { Comment } from '@prisma/client';

type CommentItemProps = {
  comment: Comment;
};

export default function CommentItem({ comment }: CommentItemProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between mb-2 text-sm">
        <span className="font-semibold text-gray-800">{comment.authorName}</span>
        <span className="text-gray-500">{formatDate(new Date(comment.createdAt))}</span>
      </div>
      <p className="text-gray-700 leading-relaxed"
      dangerouslySetInnerHTML={{
                __html: sanitizeForRender(comment.content || '<p class="text-gray-400">暂无内容</p>'),
            }}>
        
      </p>
    </div>
  );
}


