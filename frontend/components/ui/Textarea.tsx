'use client';

import clsx from 'clsx';
import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, id, ...rest },
  ref
) {
  const inputId = id || rest.name;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        className={clsx(
          'block w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm',
          'placeholder:text-gray-400 focus:outline-none',
          error
            ? 'border-red-300 focus:border-red-500'
            : 'border-gray-300 focus:border-blue-500',
          className
        )}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Textarea;
