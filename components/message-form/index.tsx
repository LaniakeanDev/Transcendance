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

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver: data.receiver,
          content: data.content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        const detail = Array.isArray(errorData.errors)
          ? errorData.errors.join(' ')
          : null;

        throw new Error(
          detail || errorData.message || 'Failed to send message'
        );
      }

      const result = await response.json();

      console.log({ result });

      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error sending private message:', error);

      const message =
        error instanceof Error ? error.message : 'Failed to send message';

      setError('root', {
        message,
      });

      onError?.(error instanceof Error ? error : new Error(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageLength = watch('content')?.length || 0;

  return (
    <div className="p-6">
      <h2 className="mb-6 text-xl font-semibold">Send Private Message</h2>

      {/* Recipient */}
      <div className="mb-5">
        <label
          htmlFor="receiver"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Recipient
        </label>

        <input
          id="receiver"
          type="text"
          placeholder="Enter username..."
          disabled={isSubmitting}
          className="block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-(--glint) focus:ring-(--glint) sm:text-sm disabled:cursor-not-allowed disabled:opacity-50"
          {...register('receiver')}
        />

        {errors.receiver && (
          <p className="mt-1 text-sm text-red-600">{errors.receiver.message}</p>
        )}
      </div>

      {/* Message */}
      <div className="mb-5">
        <label
          htmlFor="content"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Message
        </label>

        <textarea
          id="content"
          rows={6}
          placeholder="Write your private message..."
          disabled={isSubmitting}
          className="block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-(--glint) focus:ring-(--glint) sm:text-sm disabled:cursor-not-allowed disabled:opacity-50"
          {...register('content')}
        />

        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}

        <div className="mt-1 text-right text-sm text-gray-500">
          {messageLength}/5000
        </div>
      </div>

      {/* Error Message */}
      {errors.root && (
        <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {errors.root.message}
        </p>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => reset()}
          className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-(--glint) focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`cursor-pointer rounded-md bg-(--glint) px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-(--glint)/80 focus:outline-none focus:ring-2 focus:ring-(--glint) focus:ring-offset-2 ${
            isSubmitting ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          {isSubmitting ? <>Sending...</> : 'Send Message'}
        </button>
      </div>
    </div>
  );
};
