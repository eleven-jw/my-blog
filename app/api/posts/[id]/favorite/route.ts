import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

interface FavoriteParams {
  id: string
}

async function toggleFavorite(
  userId: string,
  postId: string,
): Promise<{ favorited: boolean; favoriteCount: number }> {
  const existingFavorite = await prisma.userFavorite.findUnique({
    where: { userId_postId: { userId, postId } },
  })

  const favoriteAction = existingFavorite
    ? prisma.userFavorite.delete({ where: { id: existingFavorite.id } })
    : prisma.userFavorite.create({ data: { userId, postId } })

  const [, favoriteCount] = await prisma.$transaction([
    favoriteAction,
    prisma.userFavorite.count({ where: { postId } }),
  ])

  return {
    favorited: !existingFavorite,
    favoriteCount,
  }
}

export async function POST(_request: NextRequest, { params }: { params: FavoriteParams }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login",
        },
        { status: 401 },
      )
    }

    const userId = session.user.id
    const postId = params.id

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    })

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          message: "Post not found",
        },
        { status: 404 },
      )
    }

    const { favorited, favoriteCount } = await toggleFavorite(userId, postId)

    return NextResponse.json(
      {
        success: true,
        favorited,
        favoriteCount,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("收藏操作失败:", error instanceof Error ? error.message : error)

    return NextResponse.json(
      {
        success: false,
        message: "操作失败，请稍后重试",
      },
      { status: 500 },
    )
  }
}
