import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import PostBreadcrumb from "@/app/ui/post/PostBreadcrumb"
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import PostContent from '@/app/ui/post/PostContent'
import CommentSection from '@/app/ui/post/CommentSection'

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

export default async function Page({ params, searchParams }: PageProps) {
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

    try {
      await prisma.post.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    }
    catch (err) {
      console.log('failed to update views')
    }

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      status: true,
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
  const likeCount = await prisma.like.count({ where: { postId: post.id } })
  const favoriteCount = await prisma.userFavorite.count({ where: { postId: post.id } })
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

  const comments = await prisma.comment.findMany({
    where: { postId: post.id },
    include: {
      author: true
    },
  });

  const formattedComments = comments.map(comment => ({
    ...comment,
    authorName: comment.author?.name ?? 'Unknown Author',
  }));

  let isLiked = false
  isLiked = !!await prisma.like.findUnique({
    where: { userId_postId: { userId: session.user.id, postId: post.id } },
  })

  const isFavorited = !!await prisma.userFavorite.findUnique({
    where: { userId_postId: { userId: session.user.id, postId: post.id } },
  })
  return (
    <div className="space-y-4">
      <PostBreadcrumb items={breadcrumbItems} />
      <PostContent
        post={post}
        isLiked={isLiked}
        initialLikeCount={likeCount}
        initialFavoriteCount={favoriteCount}
        isFavorited={isFavorited}
      />
      <CommentSection postId={post.id} initialComments={formattedComments}></CommentSection>
    </div>
  )
}
