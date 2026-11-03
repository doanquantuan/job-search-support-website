import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

const LOCATIONS = [
  { value: 'all', label: 'Tất cả địa điểm' },
  { value: 'Hà Nội', label: 'Hà Nội' },
  { value: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng' },
  { value: 'Cần Thơ', label: 'Cần Thơ' },
  { value: 'Bình Dương', label: 'Bình Dương' },
];

const POPULAR_KEYWORDS = ['FPT', 'VNG', 'Shopee', 'MoMo', 'Viettel'];

export const CompanyHero = ({ onSearch, initialSearch = '', initialLocation = 'all', totalCount = 0 }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ search: searchTerm, location: selectedLocation });
  };

  const handleKeywordClick = (keyword) => {
    setSearchTerm(keyword);
    onSearch({ search: keyword, location: selectedLocation });
  };

  return (
    <div className="bg-gradient-to-b from-accent/15 via-primary/5 to-transparent border-b border-base-200/80 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
        {/* Concise Heading & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
            Danh sách công ty
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60">
            {totalCount > 0 ? (
              <span><span className="font-semibold text-primary">{totalCount}</span> công ty đang hoạt động & tuyển dụng</span>
            ) : (
              <span>Khám phá các doanh nghiệp uy tín và cơ hội nghề nghiệp</span>
            )}
          </p>
        </div>

        {/* Compact Minimal Search Bar */}
        <div className="max-w-3xl mx-auto pt-1">
          <form
            onSubmit={handleSubmit}
            className="bg-base-100 p-2 border border-base-200 shadow-xs rounded-xl flex flex-col md:flex-row items-center gap-2"
          >
            {/* Input Search Name */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nhập tên công ty, ngành nghề..."
                className="input input-ghost w-full pl-10 h-10 text-xs sm:text-sm focus:outline-none focus:bg-base-200/40 rounded-lg font-medium"
              />
            </div>

            <div className="hidden md:block w-px h-6 bg-base-200" />

            {/* Select Location */}
            <div className="relative w-full md:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="select select-ghost w-full pl-9 h-10 min-h-10 text-xs sm:text-sm focus:outline-none focus:bg-base-200/40 rounded-lg font-medium cursor-pointer"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary h-10 min-h-10 px-6 text-white text-xs sm:text-sm font-semibold rounded-lg w-full md:w-auto shadow-2xs hover:shadow-xs gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Tìm kiếm</span>
            </button>
          </form>

          {/* Quick Keywords */}
          <div className="flex items-center justify-center gap-1.5 pt-2.5 text-xs text-base-content/50 flex-wrap">
            <span className="font-normal text-2xs sm:text-xs">Gợi ý:</span>
            {POPULAR_KEYWORDS.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => handleKeywordClick(kw)}
                className="px-2 py-0.5 rounded-md bg-base-100 hover:bg-primary/10 hover:text-primary border border-base-200 text-base-content/70 transition-colors text-2xs font-medium"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyHero;
