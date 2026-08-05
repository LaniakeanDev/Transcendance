// Mock types based on your Prisma schema
interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  name?: string;
}

interface Like {
  id: string;
  userId: string;
  user: User;
}

interface GlintComment {
  id: string;
  userId: string;
  text: string;
  createdAt: Date;
  user: User;
}

interface Post {
  id: string;
  userId: string;
  imageUrl: string;
  caption?: string;
  createdAt: Date;
  user: User;
  likes: Like[];
  comments: GlintComment[];
}
