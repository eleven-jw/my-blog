'use client';
import { sanitizeForRender } from '@/lib/sanitizeHtml';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartIcon, BookmarkIcon } from '@heroicons/react/24/outline';

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
    id: string
    title: string
    author: { name: string | null } | null
    createdAt: Date
    status: string
    content: string
    views: number
    tags: { name: string; id: string }[]
    _count: { comments: number }
    updatedAt: Date
  }
  initialLikeCount: number
  isLiked: boolean
};

type LikeResponse = {
  success: boolean
  liked: boolean
  likeCount: number
  message?: string
}

export default function PageContent ({ post, initialLikeCount, isLiked }: PostContentProps) {
  const [liked, setLiked] = useState<boolean>(isLiked);
  const [likeCount, setLikeCount] = useState<number>(initialLikeCount);
  // const [favorited, setFavorited] = useState<boolean>(false);
  const handleLike = async () => {
   try {
    const result = await fetch(`/api/posts/${post.id}/like`, {
      method: 'POST',
    });

    if (result.ok) {
      const data: LikeResponse = await result.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } else {
      const data: LikeResponse | undefined = await result.json().catch(() => undefined);
      console.error('failed to like:', data?.message ?? result.statusText);
    }
  } catch (error) {
    console.error('failed to like:', error);
  }
  };

  // const handleFavorite = async () => {
    
  //   try {
  //     const result = await favoritePost(params.slug);
  //     setFavorited(result.favorited);
  //     // setPost(prev => ({ ...prev, favoriteCount: result.favorited ? prev.favoriteCount + 1 : prev.favoriteCount - 1 }));
  //   } catch (error) {
  //     console.error('收藏失败:', error);
  //   }
  // };

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
                <span>Likes:{likeCount ?? 0}</span>
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
                __html: sanitizeForRender(post.content || '<p class="text-gray-400">no content</p>'),
            }}
            />
            <footer className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500 flex justify-between">
              <div className="flex space-x-4">
                <button 
                  onClick={handleLike}
                  className={`flex items-center space-x-1 ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                >
                  <HeartIcon className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                </button>
                
                {/* <button 
                  onClick={handleFavorite}
                  className={`flex items-center space-x-1 ${favorited ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}
                >
                  <BookmarkIcon className={`h-5 w-5 ${favorited ? 'fill-current' : ''}`} />
                </button> */}
              </div>
            </footer>
        </div>
      </>
      
    ) 
}
