import Link from 'next/link';
import Logo from '@/public/logo';
import UserIcon from '@/public/user';
import PlusIcon from '@/public/plus';

export default function Navbar() {
  return (
    <nav className="shadow-md px-4 py-3 mb-8 border-b border-(--glint)">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo and Title */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Logo size={40} />
          <h1 className="text-3xl">Glint</h1>
        </Link>
        <div className="flex flex-row gap-4">
          <Link href="/profile" className="hover:opacity-70 transition-opacity">
            <UserIcon size={40} />
          </Link>
          <Link href="/post" className="hover:opacity-70 transition-opacity">
            <PlusIcon size={40} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
