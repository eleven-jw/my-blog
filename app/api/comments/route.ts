import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sanitizeForRender } from '@/lib/sanitizeHtml'

const CommentSchema = z.object({
  postId: z.string(),
  content: z.string().min(1, { message: 'content should not be empty' }),
  authorId: z.string().min(1, { message: 'author should not be empty' }),
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const validated = CommentSchema.parse(data);
    console.log('validated', validated);

    const comment = await prisma.comment.create({
      data: {
        content: sanitizeForRender(validated.content),
        postId: validated.postId,
        authorId: validated.authorId,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json({ error: 'need ID' }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: true
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedComments = comments.map(comment => ({
    ...comment,
    authorName: comment.author?.name ?? 'Unknown Author',
  }));
    return NextResponse.json(formattedComments);
  } catch (err) {
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}