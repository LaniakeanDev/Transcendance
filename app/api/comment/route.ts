import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { text, postId } = await request.json();
    if (!text?.trim()) {
      return NextResponse.json(
        { message: 'Comment text is required' },
        { status: 400 }
      );
    }
    if (!postId) {
      return NextResponse.json(
        { message: 'Post ID is required' },
        { status: 400 }
      );
    }
    const comment = await prisma.comment.create({
      data: { userId: user.id, postId: postId, text: text.trim() },
      select: {
        id: true,
        userId: true,
        text: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    if (!comment) {
      return NextResponse.json(
        { message: 'Could not create comment' },
        { status: 500 }
      );
    }
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);

    const message =
      error instanceof Error ? error.message : 'Could not create comment';

    return NextResponse.json({ message }, { status: 500 });
  }
}
