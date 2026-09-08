'use client';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { postSchema, PostFormData } from '@/lib/validation/post';

interface PostFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const PostForm: React.FC<PostFormProps> = ({ onSuccess, onError }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    watch,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      caption: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const onSubmit: SubmitHandler<PostFormData> = async (data) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('image', data.image[0]);
      if (data.caption) {
        formData.append('caption', data.caption);
      }

      // Make API call
      const response = await fetch('/api/post', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const detail = Array.isArray(errorData.errors)
          ? errorData.errors.join(' ')
          : null;
        throw new Error(detail || errorData.message || 'Failed to create post');
      }
      const result = await response.json();
      console.log({ result });
      // Reset form
      reset();
      setPreviewUrl(null);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating post:', error);
      setError('root', {
        message:
          error instanceof Error ? error.message : 'Failed to create post',
      });
      onError?.(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Create New Post
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
            {previewUrl ? (
              <div className="relative w-full max-h-100 flex items-center justify-center">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={400}
                  height={400}
                  className="rounded-lg object-contain max-h-100"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null);
                    const input = document.getElementById(
                      'image-upload'
                    ) as HTMLInputElement;
                    if (input) input.value = '';
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="mt-4 flex text-sm text-gray-600">
                  <label
                    htmlFor="image-upload"
                    className="relative cursor-pointer rounded-md font-medium text-(--glint) hover:text-(--glint) focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-b(--glint)"
                  >
                    <span>Upload an image</span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      {...register('image', {
                        onChange: handleImageChange,
                      })}
                    />
                  </label>
                  <p className="pl-1 dark:text-gray-200">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-200">
                  PNG, JPG, GIF up to 1MB
                </p>
              </div>
            )}
          </div>
          {errors.image?.message &&
            typeof errors.image.message === 'string' && (
              <p className="mt-2 text-sm text-red-600">
                {errors.image.message}
              </p>
            )}
        </div>

        <div>
          <label
            htmlFor="caption"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Caption
          </label>
          <div className="mt-1">
            <textarea
              id="caption"
              rows={4}
              className="p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-(--glint) focus:ring-(--glint) sm:text-sm"
              placeholder="Your caption..."
              {...register('caption')}
            />
          </div>
          {errors.caption && (
            <p className="mt-2 text-sm text-red-600">
              {errors.caption.message}
            </p>
          )}
          <div className="mt-1 text-xs text-gray-500 text-right">
            {watch('caption')?.length || 0}/2200
          </div>
        </div>

        {/* Error Message */}
        {errors.root && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{errors.root.message}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              reset();
              setPreviewUrl(null);
            }}
            className="px-4 py-2 cursor-pointer border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--glint)"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 cursor-pointer rounded-md shadow-sm text-sm font-medium text-black bg-(--glint) hover:bg-(--glint)/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--glint) ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </>
            ) : (
              'Create Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
