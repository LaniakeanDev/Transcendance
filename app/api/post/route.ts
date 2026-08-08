import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import cloudinary from 'cloudinary';
import { postSchema } from '@/lib/validation/post';
import { revalidateTag } from 'next/cache';

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

    // If validation passes, proceed with validated data
    const validatedData = validationResult.data;

    // Upload to Cloudinary using buffer
    const bytes = await imageFile!.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          folder: 'glint/posts',
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
