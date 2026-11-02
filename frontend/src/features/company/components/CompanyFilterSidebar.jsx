import React from 'react';
import { Filter, RotateCcw, Star, Check } from 'lucide-react';

const INDUSTRIES = [
  { label: 'Công nghệ thông tin', count: 8 },
  { label: 'Tài chính / Ngân hàng', count: 2 },
  { label: 'Thương mại điện tử', count: 2 },
  { label: 'Marketing / Truyền thông', count: 1 },
];

const SIZES = [
  { value: '1-50', label: '1 - 50 nhân viên', count: 2 },
  { value: '51-200', label: '51 - 200 nhân viên', count: 4 },
  { value: '201-500', label: '201 - 500 nhân viên', count: 1 },
  { value: '500+', label: '500+ nhân viên', count: 5 },
];

const RATINGS = [
  { value: 4, label: 'Từ 4.0 sao trở lên', count: 10 },
  { value: 4.5, label: 'Từ 4.5 sao trở lên', count: 7 },
];

export const CompanyFilterSidebar = ({
  selectedIndustries = [],
  onIndustryChange,
  selectedSizes = [],
  onSizeChange,
  selectedMinRating = 0,
  onRatingChange,
  onResetFilters,
}) => {
  const handleToggleIndustry = (ind) => {
    if (selectedIndustries.includes(ind)) {
      onIndustryChange(selectedIndustries.filter((i) => i !== ind));
    } else {
      onIndustryChange([...selectedIndustries, ind]);
    }
  };

  const handleToggleSize = (sizeVal) => {
    if (selectedSizes.includes(sizeVal)) {
      onSizeChange(selectedSizes.filter((s) => s !== sizeVal));
    } else {
      onSizeChange([...selectedSizes, sizeVal]);
    }
  };

  const handleToggleRating = (ratingVal) => {
    if (selectedMinRating === ratingVal) {
      onRatingChange(0);
    } else {
      onRatingChange(ratingVal);
    }
  };

  const hasActiveFilters =
    selectedIndustries.length > 0 || selectedSizes.length > 0 || selectedMinRating > 0;

  return (
    <aside className="card bg-base-100 p-5 border border-base-200 shadow-2xs rounded-xl space-y-5 sticky top-20">
      {/* Header Panel */}
      <div className="flex items-center justify-between pb-3 border-b border-base-200">
        <h3 className="font-bold text-sm text-base-content flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <span>Bộ lọc</span>
        </h3>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-primary hover:text-primary-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Xóa</span>
          </button>
        )}
      </div>

      {/* 1. Ngành nghề */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-base-content/90 uppercase tracking-wider">
          Ngành nghề
        </h4>
        <div className="space-y-2">
          {INDUSTRIES.map(({ label, count }) => {
            const isChecked = selectedIndustries.includes(label);
            return (
              <label
                key={label}
                className="flex items-center justify-between text-xs text-base-content/80 hover:text-base-content cursor-pointer select-none group"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleIndustry(label)}
                    className="checkbox checkbox-primary checkbox-xs rounded"
                  />
                  <span className={`transition-colors ${isChecked ? 'font-semibold text-primary' : ''}`}>
                    {label}
                  </span>
                </div>
                <span className="text-2xs text-base-content/40 group-hover:text-base-content/60">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Quy mô doanh nghiệp */}
      <div className="space-y-3 pt-3.5 border-t border-base-200">
        <h4 className="text-xs font-bold text-base-content/90 uppercase tracking-wider">
          Quy mô công ty
        </h4>
        <div className="space-y-2">
          {SIZES.map(({ value, label, count }) => {
            const isChecked = selectedSizes.includes(value);
            return (
              <label
                key={value}
                className="flex items-center justify-between text-xs text-base-content/80 hover:text-base-content cursor-pointer select-none group"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleSize(value)}
                    className="checkbox checkbox-primary checkbox-xs rounded"
                  />
                  <span className={`transition-colors ${isChecked ? 'font-semibold text-primary' : ''}`}>
                    {label}
                  </span>
                </div>
                <span className="text-2xs text-base-content/40 group-hover:text-base-content/60">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Đánh giá chất lượng */}
      <div className="space-y-3 pt-3.5 border-t border-base-200">
        <h4 className="text-xs font-bold text-base-content/90 uppercase tracking-wider">
          Đánh giá
        </h4>
        <div className="space-y-2">
          {RATINGS.map(({ value, label, count }) => {
            const isChecked = selectedMinRating === value;
            return (
              <label
                key={value}
                className="flex items-center justify-between text-xs text-base-content/80 hover:text-base-content cursor-pointer select-none group"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleRating(value)}
                    className="checkbox checkbox-primary checkbox-xs rounded"
                  />
                  <span className={`inline-flex items-center gap-1 transition-colors ${isChecked ? 'font-semibold text-primary' : ''}`}>
                    <span>{label}</span>
                    <Star className="w-3 h-3 fill-warning stroke-warning" />
                  </span>
                </div>
                <span className="text-2xs text-base-content/40 group-hover:text-base-content/60">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Nút Xóa bộ lọc */}
      <div className="pt-2 border-t border-base-200">
        <button
          type="button"
          onClick={onResetFilters}
          disabled={!hasActiveFilters}
          className="btn btn-outline btn-sm w-full h-8 min-h-8 border-base-300 text-xs font-semibold text-base-content/70 hover:bg-base-200 hover:text-base-content disabled:opacity-40 rounded-lg"
        >
          Xóa bộ lọc
        </button>
      </div>
    </aside>
  );
};

export default CompanyFilterSidebar;
