import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const { newLikeStatus, postId, userId } = await request.json();
  if (newLikeStatus) {
    const like = await prisma.like.create({
      data: { userId: userId, postId: postId },
    });
    if (!like) {
      return NextResponse.json(
        { message: 'Could not create like' },
        { status: 500 }
      );
    }
    return NextResponse.json({ status: 201 });
  } else {
    const likeFetchResult = await prisma.like.findFirst({
      where: { postId, userId },
      select: {
        id: true,
      },
    });
    if (!likeFetchResult) {
      return NextResponse.json(
        { message: 'Could not find like' },
        { status: 500 }
      );
    }
    const likeId = likeFetchResult?.id;
    try {
      const deletedLike = await prisma.like.delete({
        where: { id: likeId },
      });
      if (!deletedLike) {
        return NextResponse.json(
          { message: 'Could not delete like' },
          { status: 500 }
        );
      }
      return NextResponse.json({ status: 200 });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Could not delete like';
      return NextResponse.json({ message: message }, { status: 500 });
    }
  }
}
