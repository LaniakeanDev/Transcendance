import { Prisma } from '@prisma/client';

type Like = Prisma.LikeGetPayload;

type Post = Prisma.PostGetPayload;

type CommentWithUserInfo = Prisma.CommentGetPayload<{
  select: {
    id: true;
    text: true;
    createdAt: true;
    userId: true;
    user: {
      select: {
        id: true;
        username: true;
        avatarUrl: true;
      };
    };
  };
}>;

export type UserSearchResult = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    avatarUrl: true;
    bio: true;
    createdAt: true;
  };
}>;

export type PostSearchResult = Prisma.PostGetPayload<{
  select: {
    id: true;
    imageUrl: true;
    caption: true;
    createdAt: true;
    user: {
      select: {
        id: true;
        username: true;
        avatarUrl: true;
      };
    };
    _count: {
      select: {
        likes: true;
        comments: true;
      };
    };
  };
}>;

type PostWithRelations = Prisma.PostGetPayload<{
  select: {
    id: true;
    userId: true;
    imageUrl: true;
    caption: true;
    createdAt: true;
    user: {
      select: {
        id: true;
        username: true;
        avatarUrl: true;
      };
    };
    likes: {
      select: {
        id: true;
        userId: true;
        user: {
          select: {
            id: true;
            username: true;
          };
        };
      };
    };
    comments: {
      select: {
        id: true;
        userId: true;
        text: true;
        createdAt: true;
        user: {
          select: {
            id: true;
            username: true;
          };
        };
      };
    };
  };
}>;
