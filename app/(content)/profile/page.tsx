import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import ProfileView from "@/app/ui/profile/ProfileView"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/profile')
  }

  const [user, postCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        fansCount: true,
        postCount: true,
        followsCount: true,
        starsCount: true,
        totalViews: true,
        createdAt: true,
        interests: true,
      },
    }),
    prisma.post.count({ where: { authorId: session.user.id } }),
  ])

  if (!user) {
    redirect('/login?error=user_not_found')
  }

  if (user.postCount !== postCount) {
    await prisma.user.update({
      where: { id: user.id },
      data: { postCount },
    })
  }

  const profile = { ...user, postCount }

  return <ProfileView profile={profile} />
}
