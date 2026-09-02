'use client';

import { useDebouncedSearchField } from '@/hooks/useDebouncedSearchField';
import type { SearchParams } from '@/lib/validation/search';
import SearchIcon from '@/public/search';

export default function SearchBar({ params }: { params: SearchParams }) {
  const { value, setValue, commit } = useDebouncedSearchField(params, 'q');

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        commit();
      }}
      className="relative"
    >
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <SearchIcon size={18} />
      </span>

      <input
        type="search"
        name="q"
        autoFocus
        value={value}
        onChange={(event) => setValue(event.target.value)}
        maxLength={100}
        placeholder={
          params.type === 'users'
            ? 'Search people by username or bio'
            : 'Search posts by caption'
        }
        aria-label="Search"
        className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent py-2 pl-10 pr-3 text-sm outline-none focus:border-(--glint) transition-colors"
      />
    </form>
  );
}
