import { z } from 'zod';

export const privateMessageSchema = z.object({
  receiver: z
    .string()
    .trim()
    .min(1, 'Please enter a recipient')
    .max(500, 'recipient cannot exceed 500 characters'),

  content: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(3000, 'Message cannot exceed 3000 characters'),
});

export type PrivateMessageFormData = z.infer<typeof privateMessageSchema>;
