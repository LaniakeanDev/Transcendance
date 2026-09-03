import {
  DEFAULT_TYPE,
  defaultSortFor,
  type SearchParams,
} from '@/lib/validation/search';

export function buildSearchHref(
  current: SearchParams,
  patch: Partial<SearchParams>
): string {
  const next: SearchParams = { ...current, ...patch };

  if (Object.keys(patch).some((key) => key !== 'page')) {
    next.page = 1;
  }

  if (patch.type && patch.type !== current.type) {
    next.sort = defaultSortFor(patch.type);
    next.author = undefined;
    next.from = undefined;
    next.to = undefined;
  }

  const params = new URLSearchParams();
  if (next.q) params.set('q', next.q);
  if (next.type !== DEFAULT_TYPE) params.set('type', next.type);
  if (next.sort !== defaultSortFor(next.type)) params.set('sort', next.sort);
  if (next.type === 'posts') {
    if (next.author) params.set('author', next.author);
    if (next.from) params.set('from', next.from);
    if (next.to) params.set('to', next.to);
  }
  if (next.page > 1) params.set('page', String(next.page));

  const query = params.toString();
  return query ? `/search?${query}` : '/search';
}
