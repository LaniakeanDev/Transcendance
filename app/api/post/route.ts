import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import cloudinary from 'cloudinary';
import { postSchema } from '@/lib/validation/post';
import { revalidateTag } from 'next/cache';

const CLOUDINARY_POSTS_FOLDER = 'glint/posts';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data from the request
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const caption = formData.get('caption') as string | null;

    // VALIDATE WITH ZOD SCHEMA
    const validationResult = postSchema.safeParse({
      image: imageFile ? [imageFile] : [],
      caption: caption || undefined,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => err.message);
      return NextResponse.json(
        { message: 'Validation failed', errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Upload to Cloudinary using buffer
    const bytes = await imageFile!.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          folder: CLOUDINARY_POSTS_FOLDER,
          transformation: [
            { width: 1080, height: 1080, crop: 'limit' },
            { quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // Create post in database
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        imageUrl: (uploadResult as { secure_url: string }).secure_url,
        caption: validatedData.caption || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Revalidate with default profile
    revalidateTag('posts', 'default');

    return NextResponse.json(post, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { message: 'Failed to create post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await request.json();
    if (!postId) {
      return NextResponse.json({ message: 'Missing postId' }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true, imageUrl: true },
    });
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // The client-side owner check only hides a button, so re-verify here
    if (post.userId !== user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Delete the Cloudinary image (public_id extracted from the secure_url)
    const match = post.imageUrl.match(
      new RegExp(`/(${CLOUDINARY_POSTS_FOLDER}/[^/]+)\\.\\w+$`)
    );
    if (match) {
      try {
        await cloudinary.v2.uploader.destroy(match[1]);
      } catch (error) {
        // Don't block the post deletion over an orphaned image
        console.error('Error deleting Cloudinary image:', error);
      }
    }

    // Likes and comments are removed by the cascade in schema.prisma
    await prisma.post.delete({ where: { id: postId } });

    revalidateTag('posts', 'default');

    return NextResponse.json({ message: 'Post deleted' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { message: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
