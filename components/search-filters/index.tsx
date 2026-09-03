'use client';

import { useRouter } from 'next/navigation';
import { useDebouncedSearchField } from '@/hooks/useDebouncedSearchField';
import { buildSearchHref } from '@/lib/search-url';
import {
  SEARCH_TYPES,
  SORT_LABELS,
  sortsFor,
  type SearchParams,
  type SearchSort,
  type SearchType,
} from '@/lib/validation/search';

const TYPE_LABELS: Record<SearchType, string> = {
  posts: 'Posts',
  users: 'People',
};

const inputClass =
  'w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent px-3 py-2 text-sm outline-none focus:border-(--glint) transition-colors';

export default function SearchFilters({ params }: { params: SearchParams }) {
  const router = useRouter();
  const author = useDebouncedSearchField(params, 'author', 500);

  const go = (patch: Partial<SearchParams>) =>
    router.push(buildSearchHref(params, patch));

  const hasPostFilters = Boolean(params.author || params.from || params.to);

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex gap-2 text-sm"
          role="tablist"
          aria-label="Result type"
        >
          {SEARCH_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={params.type === type}
              onClick={() => go({ type })}
              className={`rounded-md px-3 py-1 cursor-pointer ${
                params.type === type
                  ? 'bg-neutral-900 text-white'
                  : 'border border-neutral-300 text-neutral-600'
              }`}
            >
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-neutral-500">Sort by</span>
          <select
            value={params.sort}
            onChange={(event) => go({ sort: event.target.value as SearchSort })}
            className="rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-(--glint) transition-colors cursor-pointer"
          >
            {sortsFor(params.type).map((sort) => (
              <option key={sort} value={sort}>
                {SORT_LABELS[sort]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {params.type === 'posts' && (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-neutral-500">Author</span>
            <input
              type="text"
              value={author.value}
              onChange={(event) => author.setValue(event.target.value)}
              maxLength={30}
              placeholder="username"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-neutral-500">Posted after</span>
            <input
              type="date"
              value={params.from ?? ''}
              max={params.to}
              onChange={(event) =>
                go({ from: event.target.value || undefined })
              }
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-neutral-500">Posted before</span>
            <input
              type="date"
              value={params.to ?? ''}
              min={params.from}
              onChange={(event) => go({ to: event.target.value || undefined })}
              className={inputClass}
            />
          </label>
        </div>
      )}

      {params.type === 'posts' && hasPostFilters && (
        <button
          type="button"
          onClick={() =>
            go({ author: undefined, from: undefined, to: undefined })
          }
          className="self-start rounded-md border border-neutral-300 px-3 py-1 text-sm font-medium hover:bg-neutral-50 hover:dark:bg-neutral-800 cursor-pointer"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
