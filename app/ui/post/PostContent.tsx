'use client';
import { sanitizeForRender } from '@/lib/sanitizeHtml';

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value)
}


type PostContentProps = {
  post: {
    title: string;
    author: { name: string };
    createdAt: Date;
    status: string;
    content: string;
    views: number;
    likes: number;
    tags: { name: string, id: string}[];
    _count: {comments: number }
    updatedAt: Date
  };
};

export default function PageContent ( {post}: PostContentProps ) {
    return (
      <>
        <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-gray-900">{post.title}</h1>
            <div className="space-y-2 rounded-md bg-gray-50 p-4 text-sm text-gray-600">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>autho:{post.author?.name ?? 'Unknown Author'}</span>
                <span>status:{post.status}</span>
                <span>createdAt:{formatDate(post.createdAt)}</span>
                <span>updatedAt:{formatDate(post.updatedAt)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                <span>Views:{post.views ?? 0}</span>
                <span>Likes:{post.likes ?? 0}</span>
                <span>Comments:{post?._count?.comments ?? 0}</span>
                <span>
                    Tags:
                    {post?.tags?.length ? post.tags.map((tag) => tag.name).join('、') : 'No tags'}
                </span>
                </div>
            </div>

        </div>
        <div className="rounded-lg bg-white">
            <article
            className="prose max-w-none text-gray-700"
            dangerouslySetInnerHTML={{
                __html: sanitizeForRender(post.content || '<p class="text-gray-400">暂无内容</p>'),
            }}
            />
        </div>
      </>
      
    ) 
}