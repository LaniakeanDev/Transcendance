import { z } from 'zod';

export const friendSchema = z.object({
  friend: z.string().trim().min(1, 'Please enter a recipient'),
});

export const friendshipSchema = z.object({
  user1: z.string().trim().min(1, 'Please enter a recipient'),
});

export type FriendFormData = z.infer<typeof friendSchema>;

export type FriendshipFormData = z.infer<typeof friendshipSchema>;
