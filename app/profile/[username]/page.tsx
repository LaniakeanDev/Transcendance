import { notFound } from 'next/navigation';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import LogoutButton from '@/components/LogoutButton';
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
      <div className="flex items-center gap-8 border-b border-neutral-200 pb-8">
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
          <div className="flex flex-wrap items-center gap-4">
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

          <dl className="mt-4 flex gap-8 text-sm">
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
            <p className="mt-4 max-w-md text-sm text-neutral-700">
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
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {posts.map((post, index) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="group relative aspect-square overflow-hidden bg-neutral-100"
              >
                {post.imageUrl ? (
                  <Image
                    src={post.imageUrl}
                    alt={post.caption ?? 'Post'}
                    fill
                    sizes="(min-width: 768px) 256px, 33vw"
                    priority={index === 0}
                    className="object-cover transition group-hover:opacity-90"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                    No image
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/0 text-sm font-semibold text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="white"
                      className="size-4"
                    >
                      <path d="M2 6.342a3.375 3.375 0 0 1 6-2.088 3.375 3.375 0 0 1 5.997 2.26c-.063 2.134-1.618 3.76-2.955 4.784a14.437 14.437 0 0 1-2.676 1.61c-.02.01-.038.017-.05.022l-.014.006-.004.002h-.002a.75.75 0 0 1-.592.001h-.002l-.004-.003-.015-.006a5.528 5.528 0 0 1-.232-.107 14.395 14.395 0 0 1-2.535-1.557C3.564 10.22 1.999 8.558 1.999 6.38L2 6.342Z" />
                    </svg>
                    {post._count.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="white"
                      className="size-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M1 8c0-3.43 3.262-6 7-6s7 2.57 7 6-3.262 6-7 6c-.423 0-.838-.032-1.241-.094-.9.574-1.941.948-3.06 1.06a.75.75 0 0 1-.713-1.14c.232-.378.395-.804.469-1.26C1.979 11.486 1 9.86 1 8Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {post._count.comments}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
