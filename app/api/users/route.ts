import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  console.log('session', session);
  if (!session?.user?.id) {
    return NextResponse.json(
      { code: 401, message: '未登录' },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        image: true,
        fansCount: true,
        postCount: true,
      },
    });

    console.log('user', user);
    return NextResponse.json({
      code: 200,
      message: 'success',
      data: user,
    });
  } catch (err) {
    console.log('err', err);
    return NextResponse.json(
      { code: 500, message: '服务器错误' },
      { status: 500 }
    );
  }
}