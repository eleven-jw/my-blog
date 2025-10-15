import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sanitizeForRender } from "@/lib/sanitizeHtml"
import { PRESET_TAG_NAMES, TAG_NAME_MAX_LENGTH, TAG_NAME_MIN_LENGTH } from "@/lib/tagRules"

export async function GET() {
  try {
    await prisma.tag.createMany({
      data: PRESET_TAG_NAMES.map((name) => ({ name })),
      skipDuplicates: true,
    })
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    })
    return NextResponse.json({
      code: 200,
      message: "success",
      data: tags,
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to get categories" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const rawName = typeof body?.name === "string" ? body.name.trim() : ""

    if (!rawName) {
      return NextResponse.json({ error: "please input tagName" }, { status: 422 })
    }

    const safeName = sanitizePlainTag(rawName)

    if (safeName.length < TAG_NAME_MIN_LENGTH) {
      return NextResponse.json({ error: "tag is too short" }, { status: 422 })
    }

    if (safeName.length > TAG_NAME_MAX_LENGTH) {
      return NextResponse.json(
        { error: `tag should no more ${TAG_NAME_MAX_LENGTH}` },
        { status: 422 },
      )
    }

    const tag = await prisma.tag.create({
      data: {
        name: safeName,
      },
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: "Failed to create categories" }, { status: 500 })
  }
}

function sanitizePlainTag(value: string): string {
  const sanitized = sanitizeForRender(value)
  return sanitized.replace(/\s+/g, " ").trim()
}
