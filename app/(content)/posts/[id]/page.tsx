import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import PostBreadcrumb from "@/app/ui/post/PostBreadcrumb"
import sanitizeHtml from 'sanitize-html'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value)
}

type PageProps = {
  params: { id: string }
  searchParams?: { from?: string }
}

export default async function PostDetailPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/posts/${params.id}`)}`)
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
    },
  })

  if (!currentUser) {
    notFound()
  }


  const { id } = params
  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      status: true,
      likes: true,
      views: true,
      createdAt: true,
      updatedAt: true,
      tags: {
        select: {
          id: true,
          name: true,
        },
      },
      authorId: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  })

  if (!post) {
    notFound()
  }

  const isOwner = post.authorId === currentUser.id
  const isAdmin = currentUser.role === 'ADMIN'
  const isPublished = post.status === 'published'

  if (!isOwner && !isAdmin && !isPublished) {
    notFound()
  }

  const isFromExplore = searchParams?.from === 'explore'
  const parentHref = isFromExplore ? '/explore' : '/posts'
  const parentLabel = isFromExplore ? '文章广场' : '文章管理'
  const breadcrumbItems = [
    { label: '首页', href: '/' },
    { label: parentLabel, href: parentHref },
    { label: post.title },
  ]

  return (
    <div className="space-y-4">
      <PostBreadcrumb items={breadcrumbItems} />
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-gray-900">{post.title}</h1>
        <div className="space-y-2 rounded-md bg-gray-50 p-4 text-sm text-gray-600">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>作者：{post.author?.name ?? '未知作者'}</span>
            <span>状态：{post.status}</span>
            <span>创建于：{formatDate(post.createdAt)}</span>
            <span>更新于：{formatDate(post.updatedAt)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>浏览：{post.views ?? 0}</span>
            <span>点赞：{post.likes ?? 0}</span>
            <span>评论：{post._count?.comments ?? 0}</span>
            <span>
              标签：
              {post.tags.length ? post.tags.map((tag) => tag.name).join('、') : '暂无标签'}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <article
          className="prose max-w-none text-gray-700"
          dangerouslySetInnerHTML={{
            __html: sanitizeForRender(post.content || '<p class="text-gray-400">暂无内容</p>'),
          }}
        />
      </div>
    </div>
  )
}

function sanitizeForRender(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      'p',
      'span',
      'strong',
      'em',
      'u',
      's',
      'code',
      'pre',
      'blockquote',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'br',
      'hr',
      'a',
      'img',
    ],
    allowedAttributes: {
      span: ['style'],
      code: ['class'],
      pre: ['class'],
      a: ['href', 'title', 'rel', 'target'],
      img: ['src', 'alt', 'title', 'width', 'height', 'style'],
    },
    allowedStyles: {
      span: {
        color: [/^#[0-9a-f]{3,6}$/i, /^rgb\((\s*\d+\s*,){2}\s*\d+\s*\)$/i],
      },
      img: {
        width: [/^\d+(px|%)$/],
        height: [/^\d+(px|%)$/],
        display: [/^block$/, /^inline-block$/, /^inline$/],
      },
    },
  })
}
