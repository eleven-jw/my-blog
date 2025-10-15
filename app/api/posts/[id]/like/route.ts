import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

interface LikeParams {
  id: string
}

interface LikeResponse {
  success: boolean
  liked: boolean
  likeCount: number
  message?: string
}

async function toggleLike(
  userId: string,
  postId: string,
): Promise<{ liked: boolean; likeCount: number }> {
  const existingLike = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  })

  const likeAction = existingLike
    ? prisma.like.delete({ where: { id: existingLike.id } })
    : prisma.like.create({ data: { userId, postId } })

  const [_, likeCount] = await prisma.$transaction([
    likeAction,
    prisma.like.count({ where: { postId } }),
  ])

  return {
    liked: !existingLike,
    likeCount,
  }
}

export async function POST(request: NextRequest, { params }: { params: LikeParams }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "请先登录",
        },
        { status: 401 },
      )
    }

    const userId = session.user.id
    const postId = params.id
    console.log("userId和postId是:", `${postId}-${userId}`)

    const { liked, likeCount } = await toggleLike(userId, postId)

    return NextResponse.json(
      {
        success: true,
        liked,
        likeCount,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("点赞操作失败:", error instanceof Error ? error.message : error, error?.stack)

    return NextResponse.json(
      {
        success: false,
        message: "操作失败，请稍后重试",
      },
      { status: 500 },
    )
  }
}
