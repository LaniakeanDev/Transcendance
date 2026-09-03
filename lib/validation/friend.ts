import { z } from 'zod';

export const friendSchema = z.object({
  friend: z.string().trim().min(1, 'Please enter a recipient'),
});

export type FriendFormData = z.infer<typeof friendSchema>;
