import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma";
import type { Post } from '@prisma/client';

type ArticleListResponse = {
  code: number;
  message: string;
  data: {
    list: Post[]; // 文章列表
    page: number; // 当前页
    size: number; // 每页条数
    total: number; // 总条数
  };
};

type ArticleDetailResponse = {
  code: number;
  message: string;
  data: Post | null;
};

export async function GET(
  request: Request,
  { params }: { params: { id?: string } }
) {
  console.log('request', request);
  console.log('params', params);
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { code: 401, message: 'please login' },
      { status: 401 }
    );
  }

  if (params.id) {
    return getArticleDetail(params.id, session.user.id);
  } else {
    return getArticleList(request, session.user.id);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { code: 401, message: '未登录' },
      { status: 401 }
    );
  }

  try {
    const articleId = params.id;
    const updatedData = await request.json(); // 解析请求体（文章更新数据）

    // 校验用户是否为文章作者（假设文章有 authorId 字段）
    const article = await prisma.post.findUnique({
      where: { id: articleId },
    });
    if (!article) {
      return NextResponse.json(
        { code: 404, message: '文章不存在' },
        { status: 404 }
      );
    }
    if (article.authorId !== session.user.id) {
      return NextResponse.json(
        { code: 403, message: '无权限编辑此文章' },
        { status: 403 }
      );
    }

    // 执行更新（使用 Prisma 的 update 方法）
    const updatedArticle = await prisma.post.update({
      where: { id: articleId },
      data: updatedData,
    });

    return NextResponse.json({
      code: 200,
      message: '文章更新成功',
      data: updatedArticle,
    });
  } catch (err) {
    return NextResponse.json(
      { code: 500, message: '服务器错误' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { code: 401, message: '未登录' },
      { status: 401 }
    );
  }

  try {
    const articleId = params.id;

    // 校验文章是否存在且用户有权限
    const article = await prisma.post.findUnique({
      where: { id: articleId },
    });
    if (!article) {
      return NextResponse.json(
        { code: 404, message: '文章不存在' },
        { status: 404 }
      );
    }
    if (article.authorId !== session.user.id) {
      return NextResponse.json(
        { code: 403, message: '无权限删除此文章' },
        { status: 403 }
      );
    }

    // 逻辑删除（标记 isDeleted 为 true）
    await prisma.post.update({
      where: { id: articleId },
      data: { isDeleted: true },
    });

    return NextResponse.json({
      code: 200,
      message: '文章删除成功',
    });
  } catch (err) {
    return NextResponse.json(
      { code: 500, message: '服务器错误' },
      { status: 500 }
    );
  }
}

async function getArticleList(
  request: Request,
  userId: string
): Promise<ArticleListResponse> {
  try {
    const searchParams = new URL(request.url).searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const size = parseInt(searchParams.get('size') || '10', 10) || 10;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const title = searchParams.get('title');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 构建 Prisma 查询条件
    const where: any = {
      authorId: userId, // 仅查询当前用户文章（可选，根据需求调整）
      isDeleted: false, // 排除已删除文章
    };

    // 标题模糊匹配（使用 PostgreSQL 的 ILIKE 实现不区分大小写）
    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }

    // 时间范围过滤
    if (startDate) {
      where.createdAt = { gte: new Date(startDate) };
    }
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    }

    // 构建排序条件
    const orderBy: any = {};
    if (sortBy === 'title') {
      orderBy.title = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // 查询文章列表（含分页）
    const [list, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip: (page - 1) * size,
        take: size,
        select: {
          id: true,
          title: true,
          content: true,
          impressions: true,
          reads: true,
          commentsCount: true,
          likesCount: true,
          savesCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.post.count({ where }), // 总条数
    ]);

    return NextResponse.json({
      code: 200,
      message: 'success',
      data: {
        list,
        page,
        size,
        total,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { code: 500, message: '服务器错误' },
      { status: 500 }
    );
  }
}

async function getArticleDetail(
  articleId: string,
  userId: string
): Promise<ArticleDetailResponse> {
  try {
    const article = await prisma.post.findUnique({
      where: { id: articleId, authorId: userId }, // 仅查询当前用户文章
      select: {
        id: true,
        title: true,
        content: true,
        impressions: true,
        reads: true,
        commentsCount: true,
        likesCount: true,
        savesCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!article) {
      return NextResponse.json(
        { code: 404, message: 'article not exit' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 200,
      message: 'success',
      data: article,
    });
  } catch (err) {
    return NextResponse.json(
      { code: 500, message: 'server error' },
      { status: 500 }
    );
  }
}