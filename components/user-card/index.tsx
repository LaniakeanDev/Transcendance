import Image from 'next/image';
import Link from 'next/link';
import type { UserSearchResult } from '@/types/types';

export default function UserCard({ user }: { user: UserSearchResult }) {
  return (
    <Link
      href={`/profile/${user.username}`}
      className="flex items-center gap-4 rounded-lg border border-gray-200 dark:border-gray-600 px-4 py-3 transition-colors hover:bg-neutral-50 hover:dark:bg-neutral-800"
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-neutral-100 ring-1 ring-neutral-200">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.username}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-neutral-400">
            {user.username.slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate font-medium">{user.username}</p>
        {user.bio && (
          <p className="truncate text-sm text-neutral-500">{user.bio}</p>
        )}
      </div>
    </Link>
  );
}
