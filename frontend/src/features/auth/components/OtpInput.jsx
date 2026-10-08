import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export function OtpInput({
  length = 6,
  value = ['', '', '', '', '', ''],
  onChange,
  disabled = false,
  hasError = false,
  isSuccess = false,
}) {
  const inputRefs = useRef([]);

  // Auto-focus first input on mount or when all boxes are cleared
  useEffect(() => {
    const isAllEmpty = Array.isArray(value) && value.every((v) => !v);
    if (!disabled && isAllEmpty && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [disabled, value]);

  // Focus first input when error is triggered
  useEffect(() => {
    if (hasError && !disabled && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [hasError, disabled]);

  const handleChange = (index, e) => {
    const rawVal = e.target.value;

    // Support mobile auto-fill or multi-digit input
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

    // Only allow digits 0-9
    if (char && !/^\d$/.test(char)) return;

    const newValue = [...value];
    newValue[index] = char;
    onChange(newValue);

    // Auto move to next input if digit entered
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // Current box is empty, jump to previous box
        inputRefs.current[index - 1]?.focus();
        const newValue = [...value];
        newValue[index - 1] = '';
        onChange(newValue);
      } else {
        const newValue = [...value];
        newValue[index] = '';
        onChange(newValue);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    if (disabled) return;

    const pastedData = e.clipboardData.getData('text').trim();
    const digits = pastedData.replace(/\D/g, '').slice(0, length).split('');

    if (digits.length === 0) return;

    const newValue = [...value];
    digits.forEach((digit, i) => {
      newValue[i] = digit;
    });
    onChange(newValue);

    // Focus on the next empty box or the last box
    const nextIndex = Math.min(digits.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <motion.div
      animate={hasError ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-center justify-between gap-2 sm:gap-3"
      onPaste={handlePaste}
    >
      {Array.from({ length }).map((_, index) => {
        const digit = value[index] || '';

        let borderStyle = 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100';
        if (hasError) {
          borderStyle = 'border-red-400 bg-red-50/40 text-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-100';
        } else if (isSuccess) {
          borderStyle = 'border-emerald-600 bg-emerald-50/50 text-emerald-700';
        } else if (disabled) {
          borderStyle = 'border-gray-200 bg-gray-50/80 text-gray-400 cursor-not-allowed';
        }

        return (
          <motion.div
            key={index}
            animate={{ scale: digit ? [1, 1.08, 1] : 1 }}
            transition={{ duration: 0.18 }}
            className="flex-1"
          >
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              aria-label={`Chữ số thứ ${index + 1}`}
              disabled={disabled}
              value={digit}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`h-14 sm:h-16 w-full rounded-2xl border text-center text-xl sm:text-2xl font-bold outline-none transition-all duration-150 ${borderStyle}`}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
