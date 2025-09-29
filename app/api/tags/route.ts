import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
   try {
    const categories = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    })
    return NextResponse.json({
      code: 200,
      message: 'success',
      data: categories,
    })
   } catch (err) {
    return NextResponse.json({ error: 'Failed to get categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    
    const category = await prisma.tag.create({
      data: {
        name
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create categories' }, { status: 500 });
  }
}