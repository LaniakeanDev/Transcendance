'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

export default function MessageRealtime() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const messagesChannel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          router.refresh();
        }
      )
      .subscribe((status) => {
        console.log('Messages realtime:', status);
      });

    const usersChannel = supabase
      .channel('users-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'users',
        },
        () => {
          router.refresh();
        }
      )
      .subscribe((status) => {
        console.log('Users realtime:', status);
      });

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(usersChannel);
    };
  }, [router]);

  return null;
}