'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RemoveFriendButtonProps {
  friendId: string;
  friendUsername: string;
}

export default function RemoveFriendButton({
  friendId,
  friendUsername,
}: RemoveFriendButtonProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${friendUsername} as a friend?`
    );

    if (!confirmed) return;

    try {
      setIsRemoving(true);

      const response = await fetch('/api/friend', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          friendId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(errorData?.message || 'Failed to remove friend');
      }

      router.refresh();
    } catch (error) {
      console.error('Error removing friend:', error);

      alert(error instanceof Error ? error.message : 'Failed to remove friend');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={isRemoving}
      className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isRemoving ? 'Removing...' : 'Remove'}
    </button>
  );
}
