import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import crypto from "crypto"
import type { Prisma } from "@prisma/client"

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ code: 401, message: "Please login" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const name = (formData.get("name") ?? "").toString().trim()
    const email = (formData.get("email") ?? "").toString().trim()
    const avatar = formData.get("avatar")
    const interests = formData
      .getAll("interests")
      .map((entry) => entry.toString())
      .filter((item) => item.trim().length > 0)

    if (!name) {
      return NextResponse.json({ code: 422, message: "用户名不能为空" }, { status: 422 })
    }

    if (!email) {
      return NextResponse.json({ code: 422, message: "邮箱不能为空" }, { status: 422 })
    }

    let imagePath: string | undefined

    if (avatar instanceof File && avatar.size > 0) {
      if (avatar.size > MAX_FILE_SIZE) {
        return NextResponse.json({ code: 422, message: "头像大小不能超过 2MB" }, { status: 422 })
      }

      const buffer = Buffer.from(await avatar.arrayBuffer())
      const uploadDir = path.join(process.cwd(), "public", "uploads")
      await mkdir(uploadDir, { recursive: true })

      const mimeExt = avatar.type?.split("/")[1]
      const fileExt = path.extname(avatar.name || "")?.replace(".", "")
      const ext = mimeExt || fileExt || "png"
      const filename = `${session.user.id}-${Date.now()}-${crypto.randomUUID()}.${ext}`
      const filepath = path.join(uploadDir, filename)
      await writeFile(filepath, buffer)
      imagePath = `/uploads/${filename}`
    }

    const data: Prisma.UserUpdateInput = {
      name,
      email,
      interests,
    }

    if (imagePath) {
      data.image = imagePath
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        fansCount: true,
        postCount: true,
        followsCount: true,
        totalViews: true,
        role: true,
        interests: true,
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    })

    const { _count, ...userInfo } = updated

    return NextResponse.json({
      code: 200,
      message: "success",
      data: {
        ...userInfo,
        favoritesCount: _count.favorites,
      },
    })
  } catch (error) {
    console.error("update profile failed", error)
    return NextResponse.json({ code: 500, message: "Server error" }, { status: 500 })
  }
}
