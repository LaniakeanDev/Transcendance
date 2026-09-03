import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto px-4 py-6 border-t border-gray-200 dark:border-gray-600">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
        <span>© {new Date().getFullYear()} Glint</span>
        <Link
          href="/privacy"
          className="hover:text-(--glint) transition-colors"
        >
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:text-(--glint) transition-colors">
          Terms of Service
        </Link>
      </div>
    </footer>
  );
}
