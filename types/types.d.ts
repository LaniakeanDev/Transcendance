import { Prisma } from '@prisma/client';

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
