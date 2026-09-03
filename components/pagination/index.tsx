import Link from 'next/link';

function pageWindow(page: number, totalPages: number): (number | 'gap')[] {
  const wanted = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const pages = [...wanted]
    .filter((candidate) => candidate >= 1 && candidate <= totalPages)
    .sort((a, b) => a - b);

  const items: (number | 'gap')[] = [];
  pages.forEach((current, index) => {
    if (index > 0 && current - pages[index - 1] > 1) items.push('gap');
    items.push(current);
  });
  return items;
}

const baseClass = 'rounded-md px-3 py-1.5 text-sm font-medium';
const linkClass = `${baseClass} border border-neutral-300 hover:bg-neutral-50 hover:dark:bg-neutral-800`;
const disabledClass = `${baseClass} border border-neutral-200 text-neutral-300 cursor-not-allowed`;

export default function Pagination({
  page,
  totalPages,
  makeHref,
}: {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Search results pages"
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link href={makeHref(page - 1)} rel="prev" className={linkClass}>
          Previous
        </Link>
      ) : (
        <span className={disabledClass}>Previous</span>
      )}

      {pageWindow(page, totalPages).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className="px-1 text-neutral-400">
            …
          </span>
        ) : item === page ? (
          <span
            key={item}
            aria-current="page"
            className={`${baseClass} bg-neutral-900 text-white`}
          >
            {item}
          </span>
        ) : (
          <Link key={item} href={makeHref(item)} className={linkClass}>
            {item}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={makeHref(page + 1)} rel="next" className={linkClass}>
          Next
        </Link>
      ) : (
        <span className={disabledClass}>Next</span>
      )}
    </nav>
  );
}
