import type { Metadata } from 'next';
import { PostForm } from '@/components/post-form';

export const metadata: Metadata = {
  title: 'Create post',
};

export default function PostPage() {
  return (
    <main id="main-content">
      <PostForm />
    </main>
  );
}
