import React, { useState, forwardRef } from "react";

export const PasswordInput = forwardRef(function PasswordInput(
  { id, error, disabled, placeholder = "••••••••", className = "", ...props },
  ref,
) {
  const [show, setShow] = useState(false);

  // PlanetScale Password Input: góc 4px, viền dứt khoát
  const baseStyle =
    'input input-bordered w-full h-10 text-xs sm:text-sm pr-10 transition-colors duration-150 focus:outline-none focus:border-primary';
  const stateStyle = disabled
    ? 'input-disabled bg-base-200 text-base-content/40 cursor-not-allowed'
    : error
      ? 'input-error bg-error/5 text-base-content focus:border-error'
      : 'bg-base-100 text-base-content placeholder:text-base-content/40';

  return (
    <div className="relative">
      <input
        ref={ref}
        id={id}
        type={show ? "text" : "password"}
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
        className="btn btn-ghost btn-xs btn-circle absolute right-2 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
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
