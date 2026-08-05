'use client';
import React, { useState } from 'react';
import Image from 'next/image';

// Mock user data
const mockUser: User = {
  id: 'user_1',
  username: 'johndoe',
  name: 'John Doe',
  avatarUrl: 'https://picsum.photos/seed/user1/200',
};

// Mock comments
const mockComments: GlintComment[] = [
  {
    id: 'comment_1',
    userId: 'user_2',
    text: 'This is amazing! 🔥',
    createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    user: {
      id: 'user_2',
      username: 'janedoe',
      name: 'Jane Doe',
      avatarUrl: 'https://picsum.photos/seed/user2/200',
    },
  },
  {
    id: 'comment_2',
    userId: 'user_3',
    text: 'Love this! 😍',
    createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
    user: {
      id: 'user_3',
      username: 'alexsmith',
      name: 'Alex Smith',
      avatarUrl: 'https://picsum.photos/seed/user3/200',
    },
  },
];

// Mock likes
const mockLikes: Like[] = [
  {
    id: 'like_1',
    userId: 'user_2',
    user: {
      id: 'user_2',
      username: 'janedoe',
    },
  },
  {
    id: 'like_2',
    userId: 'user_3',
    user: {
      id: 'user_3',
      username: 'alexsmith',
    },
  },
  {
    id: 'like_3',
    userId: 'user_4',
    user: {
      id: 'user_4',
      username: 'emilyw',
    },
  },
];

// Mock post data
const mockPost: Post = {
  id: 'post_1',
  userId: 'user_1',
  imageUrl: 'https://picsum.photos/seed/post1/600/600',
  caption: 'Beautiful sunset at the beach 🌅 #nature #sunset #beach',
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  user: mockUser,
  likes: mockLikes,
  comments: mockComments,
};

// Format time helper
const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const count = Math.floor(seconds / secondsInUnit);
    if (count >= 1) {
      return `${count}${unit[0]}`;
    }
  }
  return 'now';
};

// Format like count
const formatCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

interface GlintPostProps {
  post?: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string, text: string) => void;
}

export default function GlintPost(props: GlintPostProps) {
  const { post = mockPost, onLike, onComment } = props;
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments);

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1));
    if (onLike) onLike(post.id);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: GlintComment = {
      id: `comment_${Date.now()}`,
      userId: 'current_user',
      text: commentText,
      createdAt: new Date(),
      user: {
        id: 'current_user',
        username: 'currentuser',
        name: 'Current User',
        avatarUrl: 'https://picsum.photos/seed/current/200',
      },
    };

    setComments([newComment, ...comments]);
    setCommentText('');
    if (onComment) onComment(post.id, commentText);
  };

  return (
    <div className="max-w-md mx-auto border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Header - User Info */}
      <div className="flex items-center p-3">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-linear-to-r from-(--glint)/80 to-(--glint) p-0.5">
          <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-600 p-0.5">
            {post.user.avatarUrl ? (
              <Image
                src={post.user.avatarUrl}
                alt={post.user.username}
                width={32}
                height={32}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                <p>{post.user.username[0].toUpperCase()}</p>
              </div>
            )}
          </div>
        </div>
        <div className="ml-3 flex-1">
          <span className="font-semibold text-sm">{post.user.username}</span>
          <span className="text-xs text-gray-500 dark:text-gray-300 ml-2">
            • {formatTimeAgo(post.createdAt)}
          </span>
        </div>
        <button className="text-gray-600 dark:text-gray-300">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </div>

      {/* Image */}
      <div className="bg-gray-100 aspect-square relative">
        <Image
          src={post.imageUrl}
          alt="Post"
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 640px"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center p-2 space-x-3">
        <div className="flex items-center">
          <button
            onClick={handleLike}
            className="p-1 hover:bg-gray-100 hover:dark:bg-gray-600 cursor-pointer rounded-full transition-colors"
          >
            {isLiked ? (
              <svg
                className="w-6 h-6 text-red-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            )}
          </button>
          <p className="text-sm">{formatCount(likesCount)}</p>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setShowComments(!showComments)}
            className="p-1 hover:bg-gray-100 hover:dark:bg-gray-600 cursor-pointer rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>
          <p className="text-sm">{comments.length}</p>
        </div>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-3 pb-1">
          <span className="text-sm">
            <span className="font-semibold">{post.user.username}</span>
            <span className="ml-1">{post.caption}</span>
          </span>
        </div>
      )}

      {/* Comments section */}
      {comments.length > 0 && (
        <div className="px-3 pb-1">
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-xs text-gray-500 cursor-pointer"
          >
            View all {comments.length} comments
          </button>
          {showComments && (
            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="text-sm">
                  <span className="font-semibold">{comment.user.username}</span>
                  <span className="ml-1">{comment.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timestamp */}
      <div className="px-3 pb-1">
        <span className="text-xs text-gray-400 uppercase">
          {post.createdAt.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>

      {/* Comment Input */}
      <form
        onSubmit={handleCommentSubmit}
        className="border-t border-gray-100 p-3 flex items-center"
      >
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={!commentText.trim()}
          className={`ml-2 text-sm font-semibold ${
            commentText.trim()
              ? 'text-blue-500 hover:text-blue-600 cursor-pointer'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          Post
        </button>
      </form>
    </div>
  );
}
