import { z } from 'zod';

export const USERS_PAGE_SIZE = 10;
export const POSTS_PAGE_SIZE = 12;

export const SEARCH_TYPES = ['users', 'posts'] as const;
export const USER_SORTS = ['newest', 'oldest', 'username'] as const;
export const POST_SORTS = ['recent', 'oldest', 'popular'] as const;

export type SearchType = (typeof SEARCH_TYPES)[number];
export type UserSort = (typeof USER_SORTS)[number];
export type PostSort = (typeof POST_SORTS)[number];
export type SearchSort = UserSort | PostSort;

export const DEFAULT_TYPE: SearchType = 'posts';
export const DEFAULT_USER_SORT: UserSort = 'newest';
export const DEFAULT_POST_SORT: PostSort = 'recent';

export const SORT_LABELS: Record<SearchSort, string> = {
  newest: 'Newest members',
  oldest: 'Oldest first',
  username: 'Username (A–Z)',
  recent: 'Most recent',
  popular: 'Most liked',
};

export function defaultSortFor(type: SearchType): SearchSort {
  return type === 'users' ? DEFAULT_USER_SORT : DEFAULT_POST_SORT;
}

export function sortsFor(type: SearchType): readonly SearchSort[] {
  return type === 'users' ? USER_SORTS : POST_SORTS;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

const isoDate = z.string().refine(isValidIsoDate).optional().catch(undefined);

const rawSearchParamsSchema = z.object({
  q: z.string().trim().max(100).catch(''),
  type: z.enum(SEARCH_TYPES).catch(DEFAULT_TYPE),
  sort: z.string().catch(''),
  author: z.string().trim().max(30).min(1).optional().catch(undefined),
  from: isoDate,
  to: isoDate,
  page: z.coerce.number().int().min(1).max(500).catch(1),
});

export type SearchParams = {
  q: string;
  type: SearchType;
  sort: SearchSort;
  author?: string;
  from?: string;
  to?: string;
  page: number;
};

export function parseSearchParams(
  raw: Record<string, string | string[] | undefined>
): SearchParams {
  const parsed = rawSearchParamsSchema.parse(raw);
  const { type } = parsed;

  const allowed = sortsFor(type) as readonly string[];
  const sort = allowed.includes(parsed.sort)
    ? (parsed.sort as SearchSort)
    : defaultSortFor(type);

  if (type === 'users') {
    return { q: parsed.q, type, sort, page: parsed.page };
  }

  let { from, to } = parsed;
  if (from && to && from > to) [from, to] = [to, from];

  return {
    q: parsed.q,
    type,
    sort,
    author: parsed.author,
    from,
    to,
    page: parsed.page,
  };
}
