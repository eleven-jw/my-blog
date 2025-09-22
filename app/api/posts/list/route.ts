import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma';
import type { Post, Prisma } from '@prisma/client';

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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { code: 401, message: 'Please login' },
      { status: 401 }
    );
  }
  if (params?.id) {
    return getArticleDetail(params.id, session.user.id);
  } else {
    return getArticleList(request, session.user.id);
  }
}

// export async function GET(
//   request: Request,
//   { params }: { params: { id?: string } }
// ) {
//   // console.log('request', request);
//   console.log('params', params);
//   // const session = await getServerSession(authOptions);
//   // if (!session?.user?.id) {
//   //   return NextResponse.json(
//   //     { code: 401, message: 'please login' },
//   //     { status: 401 }
//   //   );
//   // }

//   if (params.id) {
//     return NextResponse.json({
//       code: 200,
//       message: 'success',
//       data: {
//         list:[{
//           id: "1",
//           title: "github上react开箱即用的模板 (仅供自己...",
//           impressions: 1315,
//           reads: 1028,
//           comments: 0,
//           likes: 8,
//           saves: 14,
//         },
//         {
//           id: "2",
//           title: "npm fund 命令的作用",
//           impressions: 2540,
//           reads: 912,
//           comments: 0,
//           likes: 4,
//           saves: 1,
//         }
//       ]
//     }
//     });
//   }
// }

// export async function PUT(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.id) {
//     return NextResponse.json(
//       { code: 401, message: 'Please login' },
//       { status: 401 }
//     );
//   }

//   try {
//     const articleId = params.id;
//     const updatedData = await request.json(); // 解析请求体（文章更新数据）

//     // 校验用户是否为文章作者（假设文章有 authorId 字段）
//     const article = await prisma.post.findUnique({
//       where: { id: articleId },
//     });
//     if (!article) {
//       return NextResponse.json(
//         { code: 404, message: '文章不存在' },
//         { status: 404 }
//       );
//     }
//     if (article.authorId !== session.user.id) {
//       return NextResponse.json(
//         { code: 403, message: '无权限编辑此文章' },
//         { status: 403 }
//       );
//     }

//     // 执行更新（使用 Prisma 的 update 方法）
//     const updatedArticle = await prisma.post.update({
//       where: { id: articleId },
//       data: updatedData,
//     });

//     return NextResponse.json({
//       code: 200,
//       message: '文章更新成功',
//       data: updatedArticle,
//     });
//   } catch (err) {
//     return NextResponse.json(
//       { code: 500, message: 'Server error' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.id) {
//     return NextResponse.json(
//       { code: 401, message: 'Please login' },
//       { status: 401 }
//     );
//   }

//   try {
//     const articleId = params.id;

//     // 校验文章是否存在且用户有权限
//     const article = await prisma.post.findUnique({
//       where: { id: articleId },
//     });
//     if (!article) {
//       return NextResponse.json(
//         { code: 404, message: '文章不存在' },
//         { status: 404 }
//       );
//     }
//     if (article.authorId !== session.user.id) {
//       return NextResponse.json(
//         { code: 403, message: '无权限删除此文章' },
//         { status: 403 }
//       );
//     }

//     // 逻辑删除（标记 isDeleted 为 true）
//     await prisma.post.update({
//       where: { id: articleId },
//       data: { isDeleted: true },
//     });

//     return NextResponse.json({
//       code: 200,
//       message: '文章删除成功',
//     });
//   } catch (err) {
//     return NextResponse.json(
//       { code: 500, message: 'Server error' },
//       { status: 500 }
//     );
//   }
// }

async function getArticleList(
  request: Request,
  userId: string
) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const sizeParam = parseInt(searchParams.get('size') || '10', 10);
    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const size = Number.isNaN(sizeParam) || sizeParam < 1 ? 10 : sizeParam;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrderParam = searchParams.get('sortOrder');
    const sortOrder = sortOrderParam === 'asc' ? 'asc' : 'desc';
    const title = searchParams.get('title');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const startBoundary = startDate ? new Date(startDate) : undefined;
    const endBoundary = endDate ? new Date(endDate) : undefined;

    const where: Prisma.PostWhereInput = {
      authorId: userId,
    };

    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }

    if (startBoundary && !Number.isNaN(startBoundary.getTime())) {
      where.createdAt = { gte: startBoundary };
    }
    if (endBoundary && !Number.isNaN(endBoundary.getTime())) {
      where.createdAt = where.createdAt
        ? { ...where.createdAt, lte: endBoundary }
        : { lte: endBoundary };
    }

    const orderBy: Prisma.PostOrderByWithRelationInput =
      sortBy === 'title'
        ? { title: sortOrder }
        : { createdAt: sortOrder };

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
          likes: true,
          views: true,
          comments: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.post.count({ where }),
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
      { code: 500, message: 'Server error' },
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
        likes: true,
        views: true,
        comments: true,
        tags: true,
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
