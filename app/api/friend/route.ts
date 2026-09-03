import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import cloudinary from 'cloudinary';
import { friendSchema } from '@/lib/validation/friend';
// import { revalidatePath } from 'next/cache';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// export async function GET() {
//   const posts = await getPosts()
//   return Response.json(posts)
// }

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data from the request
    const formData = await request.formData();
    const friend = formData.get('friend') as string;

    // VALIDATE WITH ZOD SCHEMA
    const validationResult = friendSchema.safeParse({
      friend: friend,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => err.message);
      return NextResponse.json(
        { message: 'Validation failed', errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    const validatedFriend = await prisma.user.findUnique({
      where: {
        username: friend,
      },
    });

    if (!validatedFriend) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.id === validatedFriend.id) {
      return NextResponse.json(
        { message: 'Cannot befriend yourself' },
        { status: 404 }
      );
    }

    const [user1Id, user2Id] = [user.id, validatedFriend.id].sort();

    const friendship = await prisma.friendship.create({
      data: {
        user1Id,
        user2Id,
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(friendship, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating friendship:', error);
    return NextResponse.json(
      { message: 'Failed to create friendship (is already your friend?)' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { friendId } = await request.json();

    if (!friendId || typeof friendId !== 'string') {
      return Response.json(
        { message: 'Friend ID is required' },
        { status: 400 }
      );
    }

    // Find the friendship regardless of which user is user1/user2
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          {
            user1Id: user.id,
            user2Id: friendId,
          },
          {
            user1Id: friendId,
            user2Id: user.id,
          },
        ],
      },
      select: {
        user1Id: true,
        user2Id: true,
      },
    });

    if (!friendship) {
      return Response.json(
        { message: 'Friendship not found' },
        { status: 404 }
      );
    }

    // Delete using the composite primary key
    await prisma.friendship.delete({
      where: {
        user1Id_user2Id: {
          user1Id: friendship.user1Id,
          user2Id: friendship.user2Id,
        },
      },
    });

    return Response.json({
      message: 'Friend removed successfully',
    });
  } catch (error) {
    console.error('Error removing friend:', error);

    return Response.json(
      { message: 'Failed to remove friend' },
      { status: 500 }
    );
  }
}
