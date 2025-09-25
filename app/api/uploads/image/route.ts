import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ code: 401, message: 'Please login' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('image')

    if (!(file instanceof File)) {
      return NextResponse.json({ code: 422, message: '未收到图片文件' }, { status: 422 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ code: 422, message: '仅支持 PNG/JPG/WEBP/GIF 图片格式' }, { status: 422 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ code: 422, message: '图片大小不能超过 5MB' }, { status: 422 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'posts')
    await mkdir(uploadDir, { recursive: true })

    const ext = file.type.split('/')[1] || 'png'
    const filename = `${session.user.id}-${Date.now()}-${crypto.randomUUID()}.${ext}`
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    const url = `/uploads/posts/${filename}`

    return NextResponse.json({
      code: 200,
      message: 'success',
      data: { url },
    })
  } catch (error) {
    console.error('upload image failed', error)
    return NextResponse.json({ code: 500, message: 'Server error' }, { status: 500 })
  }
}
