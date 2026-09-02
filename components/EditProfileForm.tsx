'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resizeImage } from '@/lib/resizeImage';

const editProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  bio: z.string().max(160, 'Bio must be 160 characters or fewer').optional(),
});

type EditProfileForm = z.infer<typeof editProfileSchema>;

export default function EditProfileForm({
  currentUsername,
  currentAvatarUrl,
  currentBio,
}: {
  currentUsername: string;
  currentAvatarUrl: string;
  currentBio: string;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [avatarMode, setAvatarMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentAvatarUrl);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      username: currentUsername,
      avatarUrl: currentAvatarUrl,
      bio: currentBio,
    },
  });

  const bioValue = watch('bio') ?? '';
  const avatarUrlValue = watch('avatarUrl') ?? '';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setServerError(null);

    try {
      const MAX_SIZE = 500 * 1024; // 500KB, aligné avec la limite du bucket
      const finalFile =
        file.size > MAX_SIZE ? await resizeImage(file, MAX_SIZE) : file;

      const formData = new FormData();
      formData.append('file', finalFile);

      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || 'Upload failed');
        return;
      }

      setValue('avatarUrl', result.url, { shouldValidate: true });
      setPreview(result.url);
    } catch {
      setServerError('Failed to process image');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: EditProfileForm) => {
    setServerError(null);

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      setServerError(result.error || 'Something went wrong');
      return;
    }

    router.push(`/profile/${data.username}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <div>
        <label htmlFor="username" className="block text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          type="text"
          aria-invalid={!!errors.username}
          aria-describedby={errors.username ? 'username-error' : undefined}
          {...register('username')}
          className="mt-1 w-full rounded-md border border-[#949494] px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
        {errors.username && (
          <p
            id="username-error"
            className="mt-1 text-sm text-red-600 dark:text-[#f6000c]"
          >
            {errors.username.message}
          </p>
        )}
      </div>

      <fieldset className="m-0 border-0 p-0">
        <legend className="block p-0 text-sm font-medium">Avatar</legend>

        {preview && (
          <img
            src={preview}
            alt="Avatar preview"
            className="mt-2 h-16 w-16 rounded-full object-cover ring-1 ring-neutral-200"
          />
        )}

        <div className="mt-2 flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setAvatarMode('url')}
            aria-pressed={avatarMode === 'url'}
            className={`rounded-md px-3 py-1 ${
              avatarMode === 'url'
                ? 'bg-neutral-900 text-white'
                : 'border border-[#949494] text-neutral-600 dark:text-[#7b7b7b]'
            }`}
          >
            Paste a link
          </button>
          <button
            type="button"
            onClick={() => setAvatarMode('upload')}
            aria-pressed={avatarMode === 'upload'}
            className={`rounded-md px-3 py-1 ${
              avatarMode === 'upload'
                ? 'bg-neutral-900 text-white'
                : 'border border-[#949494] text-neutral-600 dark:text-[#7b7b7b]'
            }`}
          >
            Upload an image
          </button>
        </div>

        {avatarMode === 'url' ? (
          <>
            <label htmlFor="avatarUrl" className="sr-only">
              Avatar URL
            </label>
            <input
              id="avatarUrl"
              type="text"
              placeholder="https://example.com/avatar.jpg"
              aria-invalid={!!errors.avatarUrl}
              aria-describedby={
                errors.avatarUrl ? 'avatarUrl-error' : undefined
              }
              {...register('avatarUrl')}
              onChange={(e) => {
                setPreview(e.target.value);
              }}
              className="mt-2 w-full rounded-md border border-[#949494] px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            />
          </>
        ) : (
          <>
            <label htmlFor="avatarFile" className="sr-only">
              Avatar image file
            </label>
            <input
              id="avatarFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              disabled={uploading}
              className="mt-2 w-full text-sm"
            />
          </>
        )}

        {uploading && (
          <p
            role="status"
            className="mt-1 text-sm text-neutral-500 dark:text-[#7b7b7b]"
          >
            Compressing and uploading...
          </p>
        )}
        {errors.avatarUrl && (
          <p
            id="avatarUrl-error"
            className="mt-1 text-sm text-red-600 dark:text-[#f6000c]"
          >
            {errors.avatarUrl.message}
          </p>
        )}

        <input type="hidden" value={avatarUrlValue} readOnly />
      </fieldset>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          rows={3}
          aria-invalid={!!errors.bio}
          aria-describedby={errors.bio ? 'bio-error' : undefined}
          {...register('bio')}
          className="mt-1 w-full resize-none rounded-md border border-[#949494] px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.bio ? (
            <p
              id="bio-error"
              className="text-sm text-red-600 dark:text-[#f6000c]"
            >
              {errors.bio.message}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-[#767676] dark:text-neutral-400">
            {bioValue.length}/160
          </span>
        </div>
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-red-600 dark:text-[#f6000c]">
          {serverError}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || uploading}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-[#949494] px-4 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
