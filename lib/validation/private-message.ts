import { z } from 'zod';

export const privateMessageSchema = z.object({
  receiver: z.string().trim().min(1, 'Please enter a recipient'),

  content: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message cannot exceed 5000 characters'),
});

export type PrivateMessageFormData = z.infer<typeof privateMessageSchema>;
