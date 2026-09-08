import { notFound } from 'next/navigation';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import LogoutButton from '@/components/LogoutButton';
import PostGrid from '@/components/post-grid';
import Link from 'next/link';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const [profileUser, currentUser] = await Promise.all([
    prisma.user.findUnique({ where: { username } }),
    getCurrentUser(),
  ]);

  if (!profileUser) notFound();

  const isOwnProfile = currentUser?.id === profileUser.id;

  const posts = await prisma.post.findMany({
    where: { userId: profileUser.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { likes: true, comments: true } },
    },
  });

  const [postCount, likesReceived, commentsReceived] = await Promise.all([
    prisma.post.count({ where: { userId: profileUser.id } }),
    prisma.like.count({ where: { post: { userId: profileUser.id } } }),
    prisma.comment.count({ where: { post: { userId: profileUser.id } } }),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-col items-center gap-6 border-b border-neutral-200 pb-8 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-neutral-100 ring-1 ring-neutral-200 sm:h-32 sm:w-32">
          {profileUser.avatarUrl ? (
            <Image
              src={profileUser.avatarUrl}
              alt={profileUser.username}
              fill
              priority
              sizes="(min-width: 640px) 128px, 96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-neutral-400">
              {profileUser.username.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
            <h1 className="text-xl font-semibold">{profileUser.username}</h1>

            {isOwnProfile && (
              <>
                <Link
                  href="/profile/edit"
                  className="rounded-md border border-neutral-300 px-4 py-1.5 text-sm font-medium hover:bg-neutral-50 hover:dark:bg-neutral-800"
                >
                  Edit profile
                </Link>
                <LogoutButton />
              </>
            )}
          </div>

          <dl className="mt-4 flex flex-wrap justify-center gap-4 text-sm sm:justify-start sm:gap-8">
            <div className="flex items-center gap-1.5">
              <dd className="font-semibold">{postCount}</dd>
              <dt className="text-neutral-500">posts</dt>
            </div>
            <div className="flex items-center gap-1.5">
              <dd className="font-semibold">{likesReceived}</dd>
              <dt className="text-neutral-500">likes received</dt>
            </div>
            <div className="flex items-center gap-1.5">
              <dd className="font-semibold">{commentsReceived}</dd>
              <dt className="text-neutral-500">comments received</dt>
            </div>
          </dl>

          {profileUser.bio && (
            <p className="mt-4 max-w-md text-sm text-neutral-700 mx-auto sm:mx-0">
              {profileUser.bio}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-20 text-center">
            <p className="text-lg font-medium">No posts yet</p>
            <p className="text-sm text-neutral-500">
              {isOwnProfile
                ? 'Posts you share will appear here.'
                : `${profileUser.username} hasn't posted anything yet.`}
            </p>
          </div>
        ) : (
          <PostGrid posts={posts} />
        )}
      </div>
    </main>
  );
}
