import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';

export default async function ProfileIndexPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  redirect(`/profile/${user.username}`);
}
