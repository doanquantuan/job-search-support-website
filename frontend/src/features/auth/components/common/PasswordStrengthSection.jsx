import React from 'react';
import { motion } from 'framer-motion';
import { getPasswordStrength } from '@/features/auth/schemas/registerSchema';

export function PasswordStrengthSection({ password, hasError }) {
  const { checks, score } = getPasswordStrength(password || '');

  const isComplete = score === 5;
  const isWeak = password && score < 3;

  const getStatusText = () => {
    if (!password) return { text: 'Chưa nhập', color: 'text-base-content/40' };
    if (score < 3) return { text: 'Yếu', color: 'text-error' };
    if (score < 5) return { text: 'Trung bình', color: 'text-warning' };
    return { text: 'Mạnh', color: 'text-success' };
  };

  const status = getStatusText();

  const checklist = [
    { key: 'length', label: 'Ít nhất 8 ký tự' },
    { key: 'uppercase', label: 'Có chữ hoa' },
    { key: 'lowercase', label: 'Có chữ thường' },
    { key: 'number', label: 'Có chữ số' },
    { key: 'special', label: 'Có ký tự đặc biệt' },
  ];

  return (
    <div className="mt-2.5 space-y-2">
      {/* 4 Segment Bars */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((step) => {
          let barBg = 'bg-base-300';
          if (isComplete) {
            barBg = 'bg-success';
          } else if (score >= 4 && step <= 3) {
            barBg = 'bg-success/80';
          } else if (score >= 3 && step <= 2) {
            barBg = 'bg-warning';
          } else if (isWeak && step === 1) {
            barBg = 'bg-error';
          }
          return (
            <div key={step} className="h-1 flex-1 rounded-sm overflow-hidden bg-base-300">
              <div className={`h-full w-full transition-all duration-300 ${barBg}`} />
            </div>
          );
        })}
      </div>

      {/* Label Row */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-base-content/60">Độ mạnh mật khẩu</span>
        <span className={`font-medium ${status.color}`}>{status.text}</span>
      </div>

      {/* 2-column Checklist Grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-0.5">
        {checklist.map(({ key, label }) => {
          const isPassed = !!checks[key];
          const isFailedWithError = hasError && !isPassed;

          return (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <span className="shrink-0 flex items-center justify-center">
                {isPassed ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 text-success"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : isFailedWithError ? (
                  <span className="h-3.5 w-3.5 rounded-full border border-error" />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full border border-base-300" />
                )}
              </span>
              <span
                className={
                  isPassed
                    ? 'text-success font-medium'
                    : isFailedWithError
                      ? 'text-error'
                      : 'text-base-content/50'
                }
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PasswordStrengthSection;
