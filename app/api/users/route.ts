import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  console.log('session', session);
  if (!session?.user?.id) {
    return NextResponse.json(
      { code: 401, message: 'Please login' },
      { status: 401 }
    );
  }

  try {
    const [user, postCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          image: true,
          fansCount: true,
          postCount: true,
        },
      }),
      prisma.post.count({
        where: { authorId: session.user.id },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { code: 404, message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.postCount !== postCount) {
      await prisma.user.update({
        where: { id: user.id },
        data: { postCount },
      });
    }

    const payload = { ...user, postCount };

    console.log('user', payload);
    return NextResponse.json({
      code: 200,
      message: 'success',
      data: payload,
    });
  } catch (err) {
    console.log('err', err);
    return NextResponse.json(
      { code: 500, message: 'Server error' },
      { status: 500 }
    );
  }
}
