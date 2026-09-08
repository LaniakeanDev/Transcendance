import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import EditProfileForm from '@/components/EditProfileForm';

export default async function EditProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-xl font-semibold">Edit profile</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Update your public profile information.
      </p>

      <EditProfileForm
        currentUsername={user.username}
        currentAvatarUrl={user.avatarUrl ?? ''}
        currentBio={user.bio ?? ''}
      />
    </main>
  );
}
