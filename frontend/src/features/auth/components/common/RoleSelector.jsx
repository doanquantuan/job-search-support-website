import React from 'react';
import { LayoutGroup } from 'framer-motion';

export function RoleSelector({ value, onChange, disabled }) {
  const options = [
    {
      role: 'JOB_SEEKER',
      title: 'Người tìm việc',
      sub: '(Job Seeker)',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      ),
    },
    {
      role: 'RECRUITER',
      title: 'Nhà tuyển dụng',
      sub: '(Recruiter)',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      ),
    },
  ];

  return (
    <div className="form-control space-y-1.5">
      <label className="label py-0">
        <span className="label-text text-xs font-semibold">Bạn đăng ký với vai trò</span>
      </label>
      <LayoutGroup id="roleSelection">
        <div className="grid grid-cols-2 gap-2.5">
          {options.map(({ role, title, sub, icon }) => {
            const isSelected = value === role;
            return (
              <button
                key={role}
                type="button"
                disabled={disabled}
                onClick={() => onChange(role)}
                className={`relative flex items-center justify-between rounded-btn border p-3 text-left transition-all duration-150 overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-xs'
                    : 'border-base-300 bg-base-100 hover:border-base-content/30 hover:bg-base-200/50'
                }`}
              >
                <div className="relative z-10 flex items-center gap-2.5 min-w-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isSelected ? 'text-primary' : 'text-base-content/40'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    {icon}
                  </svg>
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`font-semibold text-xs leading-tight truncate ${
                        isSelected ? 'text-primary' : 'text-base-content'
                      }`}
                    >
                      {title}
                    </span>
                    <span className="text-[11px] text-base-content/60 font-normal leading-tight mt-0.5">
                      {sub}
                    </span>
                  </div>
                </div>

                {/* DaisyUI Radio Indicator */}
                <div className="relative z-10 ml-auto shrink-0 pl-2">
                  <input
                    type="radio"
                    readOnly
                    checked={isSelected}
                    className="radio radio-primary radio-xs pointer-events-none"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
