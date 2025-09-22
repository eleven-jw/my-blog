import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
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
  params: Promise<{ id: string }>
  searchParams?: Promise<URLSearchParams>;
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


  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id: id },
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

  const resolvedParams = await searchParams;
  const backHref = resolvedParams?.from === 'explore' ? '/explore' : '/posts'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100"
        >
          ← 返回
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900">{post.title}</h1>
      </div>
      <p className="text-sm text-gray-500">
        状态：{post.status} · 作者：{post.author?.name ?? '未知作者'} · 创建于 {formatDate(post.createdAt)} · 更新于 {formatDate(post.updatedAt)}
      </p>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <article
          className="prose max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: post.content || '<p class="text-gray-400">暂无内容</p>' }}
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-medium text-gray-900">统计</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
            <dt className="text-gray-500">浏览</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">{post.views ?? 0}</dd>
          </div>
          <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
            <dt className="text-gray-500">点赞</dt>
            <dd className="mt-1 text-xl font-semibold text-gray-900">{post.likes ?? 0}</dd>
          </div>
          <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
            <dt className="text-gray-500">标签</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {post.tags.length ? post.tags.map((tag) => tag.name).join('、') : '暂无标签'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
