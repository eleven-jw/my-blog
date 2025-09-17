// app/api/stats/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/route';
import { prisma } from '@/lib/prisma';
import { getYesterdayDate } from '@/lib/utils';

export async function GET() {
  const session = await getServerSession(authOptions);
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
        totalViews: true,
        followsCount: true,
        starsCount: true,
      },
    });

    const yesterday = getYesterdayDate();
    const yesterdayStat = await prisma.userFollowerDaily.findUnique({
      where: { userId: session.user.id, date: yesterday },
      select: {
        viewsIncrement: true,
        followsIncrement: true,
        starsIncrement: true,
      },
    });
    
    return NextResponse.json({
      code: 200,
      message: 'success',
      data: [
        {
            label: 'Total Views',
            value: user.totalViews,
            change: yesterdayStat?.viewsIncrement ? `+${yesterdayStat.viewsIncrement}` : 'No Change Yesterday',
            changeVariant: yesterdayStat?.viewsIncrement ? "up" : "down"    
        },
        {
            label: 'Follows',
            value: user.followsCount,
            change: yesterdayStat?.followsIncrement ? `+${yesterdayStat.followsIncrement}` : 'No Change Yesterday',
            changeVariant: yesterdayStat?.followsIncrement ? "up" : "down"
        },
        {
            label: 'Stars',
            value: user.starsCount,
            change: yesterdayStat?.starsIncrement ? `+${yesterdayStat.starsIncrement}` : 'No Change Yesterday',
            changeVariant: yesterdayStat?.starsIncrement ? "up" : "down"
        }
    ]
    });
  } catch (err) {
    return NextResponse.json(
      { code: 500, message: '服务器错误' },
      { status: 500 }
    );
  }
}