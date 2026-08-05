import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

const updateProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  bio: z.string().max(160, 'Bio must be 160 characters or fewer').optional(),
});

export async function PATCH(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid data' },
      { status: 400 }
    );
  }

  const { username, avatarUrl, bio } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { username, NOT: { id: currentUser.id } },
  });
  if (existing) {
    return NextResponse.json(
      { error: 'Username already taken' },
      { status: 409 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      username,
      avatarUrl: avatarUrl || null,
      bio: bio || null,
    },
  });

  return NextResponse.json({ success: true, user: updated });
}
