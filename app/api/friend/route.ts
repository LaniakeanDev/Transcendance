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
      throw new Error('You cannot add yourself as a friend');
    }

    const [user1Id, user2Id] = [user.id, validatedFriend.id].sort();

    // Create message in database
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

    // revalidatePath("/messages");

    return NextResponse.json(friendship, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating friendship:', error);
    return NextResponse.json(
      { message: 'Failed to create friendship' },
      { status: 500 }
    );
  }
}
