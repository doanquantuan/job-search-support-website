import React, { useState, forwardRef } from 'react';

export const PasswordInput = forwardRef(function PasswordInput(
  { id, error, disabled, placeholder = '••••••••', className = '', ...props },
  ref
) {
  const [show, setShow] = useState(false);

  const baseStyle =
    'w-full rounded-md border px-3 py-2 text-xs sm:text-sm outline-none transition-colors duration-150 pr-10';
  const stateStyle = disabled
    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
    : error
      ? 'border-red-400 bg-red-50/40 text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500'
      : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 hover:border-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500';

  return (
    <div className="relative">
      <input
        ref={ref}
        id={id}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        disabled={disabled}
        className={`${baseStyle} ${stateStyle} ${className}`}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={() => setShow((v) => !v)}
        aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
      >
        {show ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        )}
      </button>
    </div>
  );
});
