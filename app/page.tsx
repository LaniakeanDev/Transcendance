import GlintPost from '@/components/post';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const posts = await prisma.post.findMany({
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
        <GlintPost key={post.id} post={post} />
      ))}
    </main>
  );
}
