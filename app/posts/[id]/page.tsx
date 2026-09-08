import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import GlintPost from '@/components/post';
import { prisma } from '@/lib/prisma';
import { PostWithRelations } from '@/types/types';
import { getCurrentUser } from '@/lib/session';

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const post: PostWithRelations | null = await prisma.post.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
      likes: {
        select: {
          id: true,
          userId: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      comments: {
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
      },
    },
  });

  if (!post) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <Link
        href={`/profile/${post.user.username}`}
        className="mb-6 inline-block text-sm text-neutral-500 hover:underline"
      >
        ← Back to {post.user.username}
      </Link>
      <GlintPost post={post} userId={user.id} size="large" />
    </main>
  );
}
