'use client';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PostWithRelations, CommentWithUserInfo } from '@/types/types';

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

interface GlintPostProps {
  post: PostWithRelations;
  userId: string;
  // onLike?: (postId: string) => void;
  // onComment?: (postId: string, text: string) => void;
}

const getInitialLikeStatus = (
  userId: string,
  post: PostWithRelations
): boolean => {
  for (const like of post.likes) {
    if (userId === like.userId) {
      return true;
    }
  }
  return false;
};

export default function GlintPost(props: GlintPostProps) {
  const { post, userId } = props;
  const initialLikeStatus = getInitialLikeStatus(userId, post);
  const [isLiked, setIsLiked] = useState(initialLikeStatus);
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isOwner = post.userId === userId;
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking outside of it
  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Close the confirmation dialog on Escape, unless a delete is in flight
  useEffect(() => {
    if (!showDeleteConfirm || isDeleting) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowDeleteConfirm(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDeleteConfirm, isDeleting]);

  async function handleLike() {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount((prev: number) => (newLiked ? prev + 1 : prev - 1));
    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newLikeStatus: newLiked,
          postId: post.id,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        const detail = Array.isArray(errorData.errors)
          ? errorData.errors.join(' ')
          : null;
        throw new Error(detail || errorData.message || 'Failed to like post');
      }
    } catch (error) {
      setIsLiked(!newLiked);
      setLikesCount((prev: number) => (newLiked ? prev - 1 : prev + 1));
      console.error('Error liking post:', error);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/post', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete post');
      }
      setShowDeleteConfirm(false);
      // Re-run the server component so the post leaves the feed
      router.refresh();
    } catch (error) {
      console.error('Error deleting post:', error);
      setIsDeleting(false);
    }
  }

  async function handleCommentSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const response = await fetch('/api/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: commentText,
          postId: post.id,
          userId: userId,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        const detail = Array.isArray(errorData.errors)
          ? errorData.errors.join(' ')
          : null;
        throw new Error(detail || errorData.message || 'Failed to like post');
      }
      const data = await response.json();
      const comment = data.comment;
      const allComments = comments;
      allComments.push(comment);
      setComments(allComments);
    } catch (error) {
      // setIsLiked(!newLiked);
      // setLikesCount((prev: number) => (newLiked ? prev - 1 : prev + 1));
      console.error('Error commenting post:', error);
    }
    setCommentText('');
  }

  return (
    <div className="max-w-md mx-auto border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden mb-8">
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
        <div className="relative" ref={menuRef}>
          <button
            className="text-gray-600 dark:text-gray-300"
            onClick={() => setShowMenu(!showMenu)}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {showMenu && isOwner && (
            <div className="absolute right-0 top-full mt-1 z-10 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowDeleteConfirm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer w-full"
              >
                {/* icône corbeille */}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="bg-gray-100 aspect-square relative">
        <Image
          src={post.imageUrl}
          alt="Post"
          fill
          priority
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
          <p className="text-sm">{likesCount}</p>
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
            {showComments ? 'Hide' : 'View all'} {comments.length} comments
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

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="max-w-sm w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Delete post?</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
              This post and its comments will be permanently deleted. This
              cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 cursor-pointer border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 cursor-pointer rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
