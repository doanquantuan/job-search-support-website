import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, RotateCcw, Filter } from 'lucide-react';
import { useJobStore } from '@/store/useJobStore';

const SALARY_OPTIONS = [
  { value: 'all', label: 'Tất cả mức lương' },
  { value: 'under_10', label: 'Dưới 10 triệu' },
  { value: '10_15', label: '10 – 15 triệu' },
  { value: '15_25', label: '15 – 25 triệu' },
  { value: '25_50', label: '25 – 50 triệu' },
  { value: 'over_50', label: 'Trên 50 triệu' },
  { value: 'deal', label: 'Thỏa thuận' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'all', label: 'Tất cả kinh nghiệm' },
  { value: 'Chưa có kinh nghiệm', label: 'Chưa có kinh nghiệm' },
  { value: 'Dưới 1 năm', label: 'Dưới 1 năm' },
  { value: '1 - 3 năm', label: '1 – 3 năm' },
  { value: '3 - 5 năm', label: '3 – 5 năm' },
  { value: 'Trên 5 năm', label: 'Trên 5 năm' },
];

const WORK_TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả hình thức' },
  { value: 'Toàn thời gian', label: 'Toàn thời gian' },
  { value: 'Bán thời gian', label: 'Bán thời gian' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'Remote', label: 'Remote / Từ xa' },
  { value: 'Tại văn phòng', label: 'Tại văn phòng' },
  { value: 'Thực tập', label: 'Thực tập' },
];

const INDUSTRY_OPTIONS = [
  { value: 'all', label: 'Tất cả ngành nghề' },
  { value: 'Công nghệ thông tin', label: 'Công nghệ thông tin' },
  { value: 'Marketing / Truyền thông', label: 'Marketing / Truyền thông' },
  { value: 'Thiết kế / UI-UX', label: 'Thiết kế / UI-UX' },
  { value: 'Tài chính / Ngân hàng', label: 'Tài chính / Ngân hàng' },
  { value: 'Kinh doanh / Bán hàng', label: 'Kinh doanh / Bán hàng' },
];

const LEVEL_OPTIONS = [
  { value: 'all', label: 'Tất cả cấp bậc' },
  { value: 'Thực tập sinh', label: 'Thực tập sinh' },
  { value: 'Nhân viên', label: 'Nhân viên' },
  { value: 'Chuyên viên', label: 'Chuyên viên' },
  { value: 'Trưởng nhóm / Quản lý', label: 'Trưởng nhóm / Quản lý' },
  { value: 'Giám đốc', label: 'Giám đốc' },
];

export const JobFilterBar = () => {
  const { filters, setFilter, resetFilters } = useJobStore();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (key) => {
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  const hasActiveFilters =
    filters.salary !== 'all' ||
    filters.experience !== 'all' ||
    filters.workType !== 'all' ||
    filters.industry !== 'all' ||
    filters.level !== 'all';

  const filterConfigs = [
    {
      key: 'salary',
      label: 'Mức lương',
      options: SALARY_OPTIONS,
      currentValue: filters.salary,
    },
    {
      key: 'experience',
      label: 'Kinh nghiệm',
      options: EXPERIENCE_OPTIONS,
      currentValue: filters.experience,
    },
    {
      key: 'workType',
      label: 'Hình thức làm việc',
      options: WORK_TYPE_OPTIONS,
      currentValue: filters.workType,
    },
    {
      key: 'industry',
      label: 'Ngành nghề',
      options: INDUSTRY_OPTIONS,
      currentValue: filters.industry,
    },
    {
      key: 'level',
      label: 'Cấp bậc',
      options: LEVEL_OPTIONS,
      currentValue: filters.level,
    },
  ];

  return (
    <div
      ref={containerRef}
      className="bg-base-100 border border-base-200/90 rounded-2xl p-3.5 shadow-xs mb-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Nhóm Bộ lọc bên trái */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 font-bold text-sm text-base-content mr-1">
            <Filter className="w-4 h-4 text-primary" />
            <span>Bộ lọc</span>
          </div>

          {filterConfigs.map((cfg) => {
            const isSelected = cfg.currentValue !== 'all';
            const currentLabel =
              cfg.options.find((o) => o.value === cfg.currentValue)?.label || cfg.label;
            const isOpen = activeDropdown === cfg.key;

            return (
              <div key={cfg.key} className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown(cfg.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium transition cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary text-white shadow-xs'
                      : 'border-base-300 bg-base-100 text-base-content/80 hover:border-primary/50 hover:bg-base-200/50'
                  }`}
                >
                  <span className="truncate max-w-[130px]">
                    {isSelected ? currentLabel : cfg.label}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Popover Dropdown Menu */}
                {isOpen && (
                  <div className="absolute top-full left-0 mt-2 w-52 bg-base-100 border border-base-200 rounded-xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                    {cfg.options.map((opt) => {
                      const isOptionActive = cfg.currentValue === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setFilter(cfg.key, opt.value);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between transition hover:bg-base-200/70 ${
                            isOptionActive
                              ? 'font-bold text-primary bg-primary/10'
                              : 'text-base-content/80'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isOptionActive && <Check className="w-4 h-4 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Nút Xóa bộ lọc */}
        <button
          type="button"
          onClick={resetFilters}
          className={`btn btn-ghost btn-xs h-8 px-3 rounded-xl text-xs font-semibold gap-1.5 transition-colors cursor-pointer ${
            hasActiveFilters
              ? 'text-error bg-error/10 hover:bg-error/20'
              : 'text-base-content/60 hover:text-base-content hover:bg-base-200'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Xóa bộ lọc</span>
        </button>
      </div>
    </div>
  );
};
