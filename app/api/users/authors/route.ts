import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ code: 401, message: "Please login" }, { status: 401 })
  }

  try {
    const authors = await prisma.user.findMany({
      where: {
        OR: [{ role: "AUTHOR" }, { role: "ADMIN" }, { posts: { some: {} } }],
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    const uniqueAuthors = authors.map((author) => ({
      id: author.id,
      name: author.name || "未命名作者",
      role: author.role,
    }))

    return NextResponse.json({
      code: 200,
      message: "success",
      data: uniqueAuthors,
    })
  } catch (error) {
    console.error("fetch authors failed", error)
    return NextResponse.json({ code: 500, message: "Server error" }, { status: 500 })
  }
}
