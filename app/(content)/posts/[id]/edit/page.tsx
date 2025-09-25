import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import PostForm from "@/app/ui/post/PostForm"
import PostBreadcrumb from "@/app/ui/post/PostBreadcrumb"
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

type PageProps = {
  params: { id: string }
}

export default async function EditPostPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/posts/${params.id}/edit`)}`)
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

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      content: true,
      status: true,
      authorId: true,
    },
  })

  if (!post) {
    notFound()
  }

  if (currentUser.role !== 'ADMIN' && post.authorId !== currentUser.id) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PostBreadcrumb segmentOverrides={{ [post.id]: null }} />
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">编辑文章</h1>
        <p className="text-sm text-gray-500">对文章进行修改并保存，系统会自动更新发布时间。</p>
      </div>
      <PostForm
        postId={post.id}
        initialValues={{
          title: post.title,
          content: post.content ?? '',
          status: post.status ?? 'draft',
        }}
      />
    </div>
  )
}
