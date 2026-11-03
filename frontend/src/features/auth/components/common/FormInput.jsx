import React, { forwardRef } from 'react';

export const FormInput = forwardRef(function FormInput(
  { id, error, disabled, className = '', ...props },
  ref
) {
  const baseStyle =
    'input input-bordered w-full h-10 text-xs sm:text-sm transition-colors duration-150 focus:outline-none focus:border-primary';
  const stateStyle = disabled
    ? 'input-disabled bg-base-200 text-base-content/40 cursor-not-allowed'
    : error
      ? 'input-error bg-error/5 text-base-content focus:border-error'
      : 'bg-base-100 text-base-content placeholder:text-base-content/40';

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
