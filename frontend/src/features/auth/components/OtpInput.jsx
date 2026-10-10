import React, { useRef, useEffect } from 'react';

export function OtpInput({
  length = 6,
  value = ['', '', '', '', '', ''],
  onChange,
  disabled = false,
  hasError = false,
  isSuccess = false,
}) {
  const inputRefs = useRef([]);

  useEffect(() => {
    const isAllEmpty = Array.isArray(value) && value.every((v) => !v);
    if (!disabled && isAllEmpty && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [disabled, value]);

  useEffect(() => {
    if (hasError && !disabled && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [hasError, disabled]);

  const handleChange = (index, e) => {
    const rawVal = e.target.value;

    if (rawVal.length > 1) {
      const digits = rawVal.replace(/\D/g, '').slice(0, length).split('');
      if (digits.length === 0) return;
      const newValue = [...value];
      digits.forEach((digit, i) => {
        newValue[i] = digit;
      });
      onChange(newValue);
      const nextIndex = Math.min(digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const char = rawVal.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newValue = [...value];
    newValue[index] = char;
    onChange(newValue);

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        const newValue = [...value];
        newValue[index - 1] = '';
        onChange(newValue);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    const digits = pasteData.replace(/\D/g, '').slice(0, length).split('');
    if (digits.length === 0) return;

    const newValue = [...value];
    digits.forEach((digit, i) => {
      newValue[i] = digit;
    });
    onChange(newValue);
    const nextIndex = Math.min(digits.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-2.5">
      {Array.from({ length }).map((_, index) => {
        const val = value[index] || '';
        const isFilled = !!val;

        let borderClass = 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600';
        if (hasError) {
          borderClass = 'border-red-400 bg-red-50/40 text-red-600 focus:border-red-500 focus:ring-1 focus:ring-red-500';
        } else if (isSuccess) {
          borderClass = 'border-emerald-500 bg-emerald-50/30 text-emerald-700';
        } else if (isFilled) {
          borderClass = 'border-blue-600 bg-blue-50/20 text-gray-900 font-semibold';
        }

        return (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            value={val}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`h-11 w-11 sm:h-12 sm:w-12 text-center text-base sm:text-lg rounded-md border outline-none transition-colors duration-150 ${borderClass} ${
              disabled ? 'cursor-not-allowed bg-gray-50 opacity-60' : ''
            }`}
          />
        );
      })}
    </div>
  );
}
