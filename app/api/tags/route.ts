import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizeForRender } from '@/lib/sanitizeHtml'

export async function GET() {
   try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    })
    return NextResponse.json({
      code: 200,
      message: 'success',
      data: tags,
    })
   } catch (err) {
    return NextResponse.json({ error: 'Failed to get categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    
    const tag = await prisma.tag.create({
      data: {
        name: sanitizeForRender(name)
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create categories' }, { status: 500 });
  }
}