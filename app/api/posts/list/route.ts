import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma, Role } from "@prisma/client"
import { sanitizeForRender } from "@/lib/sanitizeHtml"
import { MAX_TAGS_PER_POST, TAG_NAME_MAX_LENGTH, TAG_NAME_MIN_LENGTH } from "@/lib/tagRules"

const allowedStatuses = new Set(["draft", "published", "scheduled"])

const postListSelect = {
  id: true,
  title: true,
  status: true,
  views: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  author: {
    select: {
      id: true,
      name: true,
    },
  },
  _count: {
    select: {
      comments: true,
      likes: true,
    },
  },
} satisfies Prisma.PostSelect

const postDetailSelect = {
  id: true,
  title: true,
  content: true,
  status: true,
  views: true,
  tags: {
    select: {
      id: true,
      name: true,
    },
  },
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
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
      likes: true,
    },
  },
} satisfies Prisma.PostSelect

type PostListQueryResult = Prisma.PostGetPayload<{ select: typeof postListSelect }>

type PostDetailQueryResult = Prisma.PostGetPayload<{ select: typeof postDetailSelect }>

type PostListItem = {
  id: string
  title: string
  status: string
  likes: number
  views: number
  createdAt: string
  updatedAt: string
  publishedAt: string
  author: {
    id: string
    name: string | null
  }
  commentsCount: number
}

type PostDetailData = {
  id: string
  title: string
  content: string
  status: string
  likes: number
  views: number
  tags: Array<{ id: string; name: string }>
  createdAt: string
  updatedAt: string
  publishedAt: string
  author: {
    id: string
    name: string | null
  }
  commentsCount: number
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams
  const scope = searchParams.get("scope")
  const session = await getServerSession(authOptions)

  let role: Role | null = null

  if (session?.user?.id) {
    role = await getCurrentUserRole(session.user.id)
    if (!role) {
      return NextResponse.json({ code: 403, message: "Account not found" }, { status: 403 })
    }
  } else if (scope === "public") {
    role = "USER"
  } else {
    return NextResponse.json({ code: 401, message: "Please login" }, { status: 401 })
  }

  const postId = searchParams.get("id")

  if (postId) {
    if (!session?.user?.id || !role) {
      return NextResponse.json({ code: 401, message: "Please login" }, { status: 401 })
    }
    return getArticleDetail(postId, session.user.id, role)
  }

  const resolvedRole: Role = role ?? "USER"

  return getArticleList(request, session?.user?.id ?? "", resolvedRole)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ code: 401, message: "Please login" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const title = typeof body?.title === "string" ? body.title.trim() : ""
    const content = typeof body?.content === "string" ? body.content : ""
    const status = normalizeStatus(body?.status)
    const plainText = content.replace(/<[^>]*>/g, "").trim()

    const tagResult = normalizeTagNames(body?.tags)
    if (!tagResult.success) {
      return NextResponse.json({ code: 422, message: tagResult.message }, { status: 422 })
    }

    const tags = tagResult.tags

    if (status === "scheduled") {
      const publishedAt = body?.publishedAt ? new Date(body.publishedAt) : null
      if (!publishedAt) {
        return NextResponse.json({ code: 422, message: "need set publish time" }, { status: 422 })
      }
      if (publishedAt <= new Date()) {
        return NextResponse.json(
          { code: 422, message: "publish time should later than now" },
          { status: 422 },
        )
      }
    }

    if (!title || !plainText) {
      return NextResponse.json(
        { code: 422, message: "Title and content are required" },
        { status: 422 },
      )
    }

    const slug = await generateUniqueSlug(title)

    const sanitizedContent = sanitizeForRender(content)

    const created = await prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          title,
          content: sanitizedContent,
          status,
          slug,
          authorId: session.user.id,
          publishedAt: status === "scheduled" ? new Date(body.publishedAt) : undefined,
          ...(tags.length
            ? {
                tags: {
                  connectOrCreate: tags.map((tagName) => ({
                    where: { name: tagName },
                    create: { name: tagName },
                  })),
                },
              }
            : {}),
        },
        select: postDetailSelect,
      })

      const totalPosts = await tx.post.count({
        where: { authorId: session.user.id },
      })

      await tx.user.update({
        where: { id: session.user.id },
        data: {
          postCount: totalPosts,
        },
      })

      return post
    })

    return NextResponse.json({
      code: 200,
      message: "success",
      data: toPostDetail(created),
    })
  } catch (error) {
    console.error("create post failed", error)
    return NextResponse.json({ code: 500, message: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ code: 401, message: "Please login" }, { status: 401 })
  }

  const role = await getCurrentUserRole(session.user.id)
  if (!role) {
    return NextResponse.json({ code: 403, message: "Account not found" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const postId = typeof body?.id === "string" ? body.id : ""

    if (!postId) {
      return NextResponse.json({ code: 422, message: "Missing post id" }, { status: 422 })
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        title: true,
        status: true,
        publishedAt: true,
      },
    })

    if (!post) {
      return NextResponse.json({ code: 404, message: "Post not found" }, { status: 404 })
    }

    if (role !== "ADMIN" && post.authorId !== session.user.id) {
      return NextResponse.json(
        { code: 403, message: "No permission to update this post" },
        { status: 403 },
      )
    }

    const data: Prisma.PostUpdateInput = {}

    if (body?.status !== undefined) {
      const newStatus = normalizeStatus(body.status)
      data.status = newStatus

      if (newStatus === "scheduled") {
        const publishedAt = body?.publishedAt ? new Date(body.publishedAt) : null
        if (!publishedAt) {
          return NextResponse.json(
            { code: 422, message: "need to set publish time" },
            { status: 422 },
          )
        }
        if (publishedAt <= new Date()) {
          return NextResponse.json(
            { code: 422, message: "pulish time should later than now" },
            { status: 422 },
          )
        }
        data.publishedAt = publishedAt
      } else {
        if (post.status === "scheduled" && newStatus !== "scheduled") {
          data.publishedAt = new Date()
        }
      }
    }

    if (typeof body?.title === "string" && body.title.trim()) {
      const nextTitle = body.title.trim()
      data.title = nextTitle
      if (nextTitle !== post.title) {
        data.slug = await generateUniqueSlug(nextTitle, postId)
      }
    }

    if (typeof body?.content === "string") {
      const htmlContent = body.content
      const plainText = htmlContent.replace(/<[^>]*>/g, "").trim()
      if (!plainText) {
        return NextResponse.json({ code: 422, message: "正文不能为空" }, { status: 422 })
      }
      data.content = sanitizeForRender(htmlContent)
    }

    if (body?.status !== undefined) {
      data.status = normalizeStatus(body.status)
    }

    if (body?.tags !== undefined) {
      const tagResult = normalizeTagNames(body.tags)
      if (!tagResult.success) {
        return NextResponse.json({ code: 422, message: tagResult.message }, { status: 422 })
      }

      const normalizedTags = tagResult.tags
      data.tags = normalizedTags.length
        ? {
            set: [],
            connectOrCreate: normalizedTags.map((tagName) => ({
              where: { name: tagName },
              create: { name: tagName },
            })),
          }
        : { set: [] }
    }

    if (!Object.keys(data).length) {
      return NextResponse.json(
        { code: 422, message: "No updatable fields supplied" },
        { status: 422 },
      )
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data,
      select: postDetailSelect,
    })

    return NextResponse.json({
      code: 200,
      message: "success",
      data: toPostDetail(updated),
    })
  } catch (error) {
    console.error("update post failed", error)
    return NextResponse.json({ code: 500, message: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ code: 401, message: "Please login" }, { status: 401 })
  }

  const role = await getCurrentUserRole(session.user.id)
  if (!role) {
    return NextResponse.json({ code: 403, message: "Account not found" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const postId = body?.id as string | undefined

    if (!postId) {
      return NextResponse.json({ code: 422, message: "Missing post id" }, { status: 422 })
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    })

    if (!post) {
      return NextResponse.json({ code: 404, message: "Post not found" }, { status: 404 })
    }

    if (role !== "ADMIN" && post.authorId !== session.user.id) {
      return NextResponse.json(
        { code: 403, message: "No permission to delete this post" },
        { status: 403 },
      )
    }

    await prisma.$transaction(async (tx) => {
      await tx.post.delete({ where: { id: postId } })

      const totalPosts = await tx.post.count({
        where: { authorId: post.authorId },
      })

      await tx.user.update({
        where: { id: post.authorId },
        data: {
          postCount: totalPosts,
        },
      })
    })

    return NextResponse.json({ code: 200, message: "success" })
  } catch (error) {
    console.error("delete post failed", error)
    return NextResponse.json({ code: 500, message: "Server error" }, { status: 500 })
  }
}

async function getArticleList(request: Request, userId: string, role: Role) {
  try {
    const searchParams = new URL(request.url).searchParams
    const pageParam = parseInt(searchParams.get("page") || "1", 10)
    const sizeParam = parseInt(searchParams.get("size") || "10", 10)
    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
    const size = Number.isNaN(sizeParam) || sizeParam < 1 ? 10 : sizeParam
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrderParam = searchParams.get("sortOrder")
    const sortOrder = sortOrderParam === "asc" ? "asc" : "desc"
    const title = searchParams.get("title")?.trim()
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const authorIdParam = searchParams.get("authorId")
    const scope = searchParams.get("scope")
    const statusFilter = searchParams.get("status")

    const startBoundary = startDate ? new Date(startDate) : undefined
    const endBoundary = endDate ? new Date(endDate) : undefined

    const where: Prisma.PostWhereInput = {}

    const isPublicScope = scope === "public"

    if (isPublicScope) {
      where.status = "published"
      if (authorIdParam && authorIdParam !== "all") {
        where.authorId = authorIdParam
      }
    } else {
      if (authorIdParam && authorIdParam !== "all") {
        if (role !== "ADMIN" && authorIdParam !== userId) {
          return NextResponse.json(
            { code: 403, message: "No permission to view this author posts" },
            { status: 403 },
          )
        }
        where.authorId = authorIdParam
      } else if (role !== "ADMIN") {
        where.authorId = userId
      }

      if (statusFilter) {
        where.status = statusFilter
      }
    }

    if (title) {
      where.title = { contains: title, mode: "insensitive" }
    }

    if (startBoundary && !Number.isNaN(startBoundary.getTime())) {
      where.createdAt = { gte: startBoundary }
    }

    if (endBoundary && !Number.isNaN(endBoundary.getTime())) {
      where.createdAt = where.createdAt
        ? { ...where.createdAt, lte: endBoundary }
        : { lte: endBoundary }
    }

    const orderBy: Prisma.PostOrderByWithRelationInput =
      sortBy === "title" ? { title: sortOrder } : { createdAt: sortOrder }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip: (page - 1) * size,
        take: size,
        select: postListSelect,
      }),
      prisma.post.count({ where }),
    ])

    const list: PostListItem[] = posts.map(toPostListItem)

    return NextResponse.json({
      code: 200,
      message: "success",
      data: {
        list,
        page,
        size,
        total,
      },
    })
  } catch (error) {
    console.error("fetch posts failed", error)
    return NextResponse.json({ code: 500, message: "Server error" }, { status: 500 })
  }
}

async function getArticleDetail(postId: string, userId: string, role: Role) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: postDetailSelect,
    })

    if (!post) {
      return NextResponse.json({ code: 404, message: "Post not found" }, { status: 404 })
    }

    if (role !== "ADMIN" && post.authorId !== userId) {
      return NextResponse.json(
        { code: 403, message: "No permission to view this post" },
        { status: 403 },
      )
    }

    return NextResponse.json({
      code: 200,
      message: "success",
      data: toPostDetail(post),
    })
  } catch (error) {
    console.error("fetch post detail failed", error)
    return NextResponse.json({ code: 500, message: "Server error" }, { status: 500 })
  }
}

async function getCurrentUserRole(userId: string): Promise<Role | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  return user?.role ?? null
}

function toPostListItem(post: PostListQueryResult): PostListItem {
  return {
    id: post.id,
    title: post.title,
    status: post.status ?? "draft",
    likes: post._count.likes ?? 0,
    views: post.views ?? 0,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: {
      id: post.author.id,
      name: post.author.name,
    },
    commentsCount: post._count.comments,
  }
}

function toPostDetail(post: PostDetailQueryResult): PostDetailData {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    status: post.status ?? "draft",
    likes: post._count.likes ?? 0,
    views: post.views ?? 0,
    tags: post.tags ?? [],
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: {
      id: post.author.id,
      name: post.author.name,
    },
    commentsCount: post._count.comments,
  }
}

function normalizeStatus(status: unknown): string {
  if (typeof status !== "string") {
    return "draft"
  }

  const normalized = status.toLowerCase()
  return allowedStatuses.has(normalized) ? normalized : "draft"
}

type NormalizeTagsSuccess = { success: true; tags: string[] }
type NormalizeTagsError = { success: false; message: string }
type NormalizeTagsResult = NormalizeTagsSuccess | NormalizeTagsError

function normalizeTagNames(input: unknown): NormalizeTagsResult {
  if (input === undefined || input === null) {
    return { success: true, tags: [] }
  }

  if (!Array.isArray(input)) {
    return { success: false, message: "标签格式不正确" }
  }

  const cleaned: string[] = []
  const seen = new Set<string>()

  for (const raw of input) {
    if (typeof raw !== "string") {
      continue
    }

    const sanitized = sanitizePlainTag(raw)
    if (!sanitized) {
      continue
    }

    if (sanitized.length < TAG_NAME_MIN_LENGTH) {
      return { success: false, message: "tag is too short" }
    }

    if (sanitized.length > TAG_NAME_MAX_LENGTH) {
      return {
        success: false,
        message: `tag should no more ${TAG_NAME_MAX_LENGTH}`,
      }
    }

    const key = sanitized.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      cleaned.push(sanitized)
    }
  }

  if (cleaned.length > MAX_TAGS_PER_POST) {
    return {
      success: false,
      message: `最多只能选择或创建 ${MAX_TAGS_PER_POST} 个标签`,
    }
  }

  return { success: true, tags: cleaned }
}

function sanitizePlainTag(value: string): string {
  const sanitized = sanitizeForRender(value)
  return sanitized.replace(/\s+/g, " ").trim()
}

function createSlugFragment(title: string): string {
  const fragment = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")

  return fragment.slice(0, 48)
}

async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = createSlugFragment(title) || `post-${Date.now()}`
  let attempt = base
  let counter = 1

  while (true) {
    const existing = await prisma.post.findFirst({
      where: excludeId ? { slug: attempt, NOT: { id: excludeId } } : { slug: attempt },
      select: { id: true },
    })

    if (!existing) {
      return attempt
    }

    attempt = `${base}-${counter}`
    counter += 1
  }
}
