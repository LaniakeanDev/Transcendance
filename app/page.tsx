import GlintPost from '@/components/post';
import { prisma } from '@/lib/prisma';
import { PostWithRelations } from '@/types/types';
import { getCurrentUser } from '@/lib/session';

export default async function Home() {
  const user = await getCurrentUser();
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
    <main className="">
      {posts.map((post) => (
        <GlintPost key={post.id} post={post} userId={user.userId} />
      ))}
    </main>
  );
}
