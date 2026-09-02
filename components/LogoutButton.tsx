'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-md border border-[#949494] px-4 py-1.5 text-sm font-medium hover:bg-neutral-50 hover:dark:bg-neutral-800 cursor-pointer"
    >
      Sign out
    </button>
  );
}
