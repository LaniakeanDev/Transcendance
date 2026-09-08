import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { searchPosts, searchUsers } from '@/lib/search';
import { buildSearchHref } from '@/lib/search-url';
import { parseSearchParams } from '@/lib/validation/search';
import SearchBar from '@/components/search-bar';
import SearchFilters from '@/components/search-filters';
import PostGrid from '@/components/post-grid';
import UserCard from '@/components/user-card';
import Pagination from '@/components/pagination';

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-20 text-center">
      <p className="text-lg font-medium">{title}</p>
      <p className="text-sm text-neutral-500">{hint}</p>
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const params = parseSearchParams(await searchParams);
  const hasFilters = Boolean(params.author || params.from || params.to);
  const isSearching = Boolean(params.q || hasFilters);

  const data =
    params.type === 'users'
      ? { kind: 'users' as const, ...(await searchUsers(params)) }
      : { kind: 'posts' as const, ...(await searchPosts(params)) };
  const { total, totalPages } = data;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-xl font-semibold">Search</h1>

      <div className="mt-4">
        <SearchBar params={params} />
        <SearchFilters params={params} />
      </div>

      <div className="mt-8">
        {!isSearching ? (
          <EmptyState
            title="Find people and posts"
            hint={
              params.type === 'users'
                ? 'Start typing a username or a few words from someone’s bio.'
                : 'Start typing to search captions, or narrow things down with the filters above.'
            }
          />
        ) : total === 0 ? (
          <EmptyState
            title="No results"
            hint={
              params.q
                ? `Nothing matched “${params.q}”. Try a different spelling${
                    hasFilters ? ' or clear the filters' : ''
                  }.`
                : 'No posts match these filters.'
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-neutral-500">
              {total} {total === 1 ? 'result' : 'results'}
            </p>

            {data.kind === 'users' ? (
              <div className="flex flex-col gap-2">
                {data.results.map((result) => (
                  <UserCard key={result.id} user={result} />
                ))}
              </div>
            ) : (
              <PostGrid posts={data.results} />
            )}

            <Pagination
              page={params.page}
              totalPages={totalPages}
              makeHref={(page) => buildSearchHref(params, { page })}
            />
          </>
        )}
      </div>
    </main>
  );
}
