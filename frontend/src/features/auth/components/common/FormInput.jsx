import React, { forwardRef } from 'react';

export const FormInput = forwardRef(function FormInput(
  { id, error, disabled, className = '', ...props },
  ref
) {
  const baseStyle =
    'w-full rounded-md border px-3 py-2 text-xs sm:text-sm outline-none transition-colors duration-150';
  const stateStyle = disabled
    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
    : error
      ? 'border-red-400 bg-red-50/40 text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500'
      : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 hover:border-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500';

  return (
    <input
      ref={ref}
      id={id}
      disabled={disabled}
      className={`${baseStyle} ${stateStyle} ${className}`}
      {...props}
    />
  );
});
