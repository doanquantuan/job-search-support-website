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

        let stateClass = 'input-bordered bg-base-100 focus:border-primary';
        if (hasError) {
          stateClass = 'input-error bg-error/5 text-error';
        } else if (isSuccess) {
          stateClass = 'input-success bg-success/10 text-success';
        } else if (isFilled) {
          stateClass = 'input-primary bg-primary/5 text-base-content font-semibold';
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
            className={`input h-11 w-11 sm:h-12 sm:w-12 p-0 text-center text-base sm:text-lg focus:outline-none transition-colors duration-150 ${stateClass} ${
              disabled ? 'input-disabled opacity-60' : ''
            }`}
          />
        );
      })}
    </div>
  );
}
