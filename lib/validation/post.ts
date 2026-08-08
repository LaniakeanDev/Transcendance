import { z } from 'zod';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

function getFile(files: unknown): File | undefined {
  if (typeof FileList !== 'undefined' && files instanceof FileList)
    return files[0];
  if (Array.isArray(files)) return files[0];
  return undefined;
}

export const postSchema = z.object({
  caption: z
    .string()
    .max(2200, 'Caption is too long (max 2200 characters)')
    .optional(),
  image: z.any().superRefine((files, ctx) => {
    const file = getFile(files);

    if (!file) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Image is required',
      });
      return; // don't run further checks on a missing file
    }

    if (file.size > MAX_FILE_SIZE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Image size must be less than 1MB',
      });
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only JPEG, PNG, GIF, and WEBP images are allowed',
      });
    }
  }),
});

export type PostFormData = z.infer<typeof postSchema>;
