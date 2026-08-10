import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import cloudinary from 'cloudinary';
import { privateMessageSchema } from '@/lib/validation/private-message';
// import { revalidateTag } from 'next/cache';

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
    const receiver = formData.get('receiver') as string;
    const content = formData.get('contnent') as string;

    // VALIDATE WITH ZOD SCHEMA
    const validationResult = privateMessageSchema.safeParse({
      receiver: receiver,
      content: content,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => err.message);
      return NextResponse.json(
        { message: 'Validation failed', errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    //     model Message {
    //   id         String    @id @default(uuid()) @db.Uuid
    //   senderId   String    @map("sender_id") @db.Uuid
    //   receiverId String    @map("receiver_id") @db.Uuid
    //   content    String
    //   createdAt  DateTime  @default(now()) @map("created_at")
    //   readAt     DateTime? @map("read_at")

    //   sender   User @relation("MessageSender", fields: [senderId], references: [id], onDelete: Cascade)
    //   receiver User @relation("MessageReceiver", fields: [receiverId], references: [id], onDelete: Cascade)

    //   @@index([senderId])
    //   @@index([receiverId])
    //   @@index([senderId, receiverId])
    //   @@map("messages")
    // }

    // Create message in database
    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId: validatedData.receiver,
        content: validatedData.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { message: 'Failed to create post' },
      { status: 500 }
    );
  }
}
