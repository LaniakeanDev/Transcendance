'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  privateMessageSchema,
  PrivateMessageFormData,
} from '@/lib/validation/private-message';

interface PrivateMessageFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const PrivateMessageForm: React.FC<PrivateMessageFormProps> = ({
  onSuccess,
  onError,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    watch,
  } = useForm<PrivateMessageFormData>({
    resolver: zodResolver(privateMessageSchema),
    defaultValues: {
      receiver: '',
      content: '',
    },
  });

  const onSubmit: SubmitHandler<PrivateMessageFormData> = async (data) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('receiver', data.receiver);
      formData.append('content', data.content);

      // Make API call to your backend
      const response = await fetch('/api/message', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const detail = Array.isArray(errorData.errors)
          ? errorData.errors.join(' ')
          : null;
        throw new Error(
          detail || errorData.message || 'Failed to send messsage'
        );
      }
      const result = await response.json();
      console.log({ result });
      // Reset form
      reset();
      setPreviewUrl(null);
      onSuccess?.();
    } catch (error) {
      console.error('Error sending messsage:', error);
      setError('root', {
        message:
          error instanceof Error ? error.message : 'Failed to send messsage',
      });
      onError?.(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageLength = watch('content').length;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">Send Message</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label
            htmlFor="receiver"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            To
          </label>
          <div className="mt-1">
            <textarea
              id="receiver"
              rows={1}
              className="p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-(--glint) focus:ring-(--glint) sm:text-sm"
              placeholder="Recipient..."
              {...register('receiver')}
            />
          </div>
          {errors.receiver && (
            <p className="mt-2 text-sm text-red-600">
              {errors.receiver.message}
            </p>
          )}
          <div className="mt-1 text-xs text-gray-500 text-right">
            {watch('receiver')?.length || 0}/500
          </div>
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Message
          </label>
          <div className="mt-1">
            <textarea
              id="content"
              rows={6}
              className="p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-(--glint) focus:ring-(--glint) sm:text-sm"
              placeholder="Your message..."
              {...register('content')}
            />
          </div>
          {errors.content && (
            <p className="mt-2 text-sm text-red-600">
              {errors.content.message}
            </p>
          )}
          <div className="mt-1 text-xs text-gray-500 text-right">
            {watch('content')?.length || 0}/3000
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
                Sending...
              </>
            ) : (
              'Send Message'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
