import GlintPost from '@/components/post';
import { prisma } from '@/lib/prisma';
import { PostWithRelations } from '@/types/types';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  const posts: PostWithRelations[] = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
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
  return (
    <main id="main-content" className="">
      {posts.map((post) => (
        <GlintPost key={post.id} post={post} userId={user.id} />
      ))}
    </main>
  );
}
