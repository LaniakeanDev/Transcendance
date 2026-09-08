import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  POSTS_PAGE_SIZE,
  USERS_PAGE_SIZE,
  type PostSort,
  type SearchParams,
  type UserSort,
} from '@/lib/validation/search';
import type { PostSearchResult, UserSearchResult } from '@/types/types';

const USER_SELECT = {
  id: true,
  username: true,
  avatarUrl: true,
  bio: true,
  createdAt: true,
} as const;

const POST_SELECT = {
  id: true,
  imageUrl: true,
  caption: true,
  createdAt: true,
  user: { select: { id: true, username: true, avatarUrl: true } },
  _count: { select: { likes: true, comments: true } },
} as const;

const USER_ORDER_BY: Record<UserSort, Prisma.UserOrderByWithRelationInput> = {
  newest: { createdAt: 'desc' },
  oldest: { createdAt: 'asc' },
  username: { username: 'asc' },
};

const POST_ORDER_BY: Record<PostSort, Prisma.PostOrderByWithRelationInput> = {
  recent: { createdAt: 'desc' },
  oldest: { createdAt: 'asc' },
  popular: { likes: { _count: 'desc' } },
};

export type SearchResult<T> = {
  results: T[];
  total: number;
  totalPages: number;
};

function paginate(page: number, pageSize: number) {
  return { take: pageSize, skip: (page - 1) * pageSize };
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function searchUsers(
  params: SearchParams
): Promise<SearchResult<UserSearchResult>> {
  const query = escapeLike(params.q);
  const where: Prisma.UserWhereInput = params.q
    ? {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } },
        ],
      }
    : {};

  const sort = params.sort as UserSort;

  const [results, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: USER_SELECT,
      orderBy: [USER_ORDER_BY[sort], { id: 'asc' }],
      ...paginate(params.page, USERS_PAGE_SIZE),
    }),
    prisma.user.count({ where }),
  ]);

  return { results, total, totalPages: Math.ceil(total / USERS_PAGE_SIZE) };
}

export async function searchPosts(
  params: SearchParams
): Promise<SearchResult<PostSearchResult>> {
  const where: Prisma.PostWhereInput = {};

  if (params.q) {
    where.caption = { contains: escapeLike(params.q), mode: 'insensitive' };
  }

  if (params.author) {
    where.user = { username: { equals: params.author, mode: 'insensitive' } };
  }

  if (params.from || params.to) {
    where.createdAt = {
      ...(params.from ? { gte: new Date(`${params.from}T00:00:00.000`) } : {}),
      ...(params.to ? { lte: new Date(`${params.to}T23:59:59.999`) } : {}),
    };
  }

  const sort = params.sort as PostSort;

  const [results, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      select: POST_SELECT,
      orderBy: [POST_ORDER_BY[sort], { id: 'asc' }],
      ...paginate(params.page, POSTS_PAGE_SIZE),
    }),
    prisma.post.count({ where }),
  ]);

  return { results, total, totalPages: Math.ceil(total / POSTS_PAGE_SIZE) };
}
