import Image from 'next/image';
import Link from 'next/link';

export type GridPost = {
  id: string;
  imageUrl: string | null;
  caption: string | null;
  _count: { likes: number; comments: number };
};

export default function PostGrid({ posts }: { posts: GridPost[] }) {
  return (
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
  );
}
