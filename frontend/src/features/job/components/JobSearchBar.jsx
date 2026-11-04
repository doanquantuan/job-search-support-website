import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useJobStore } from '@/store/useJobStore';

export const JobSearchBar = () => {
  const { keyword, location, setKeyword, setLocation, fetchJobs } = useJobStore();

  const [localKeyword, setLocalKeyword] = useState(keyword);
  const [localLocation, setLocalLocation] = useState(location);

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(localKeyword);
    setLocation(localLocation);
    fetchJobs();
  };

  return (
    <section className="bg-gradient-to-b from-primary/5 via-base-100 to-base-100 border-b border-base-200/80 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Tiêu đề trang đồng bộ màu chữ Company */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight mb-6">
          Tìm việc làm phù hợp với bạn
        </h1>

        {/* Form tìm kiếm chuẩn UI */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 items-stretch">
          {/* Ô tìm kiếm từ khóa */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={localKeyword}
              onChange={(e) => setLocalKeyword(e.target.value)}
              placeholder="Chức danh, kỹ năng, công ty..."
              className="w-full bg-base-100 border border-base-300 rounded-xl pl-10 pr-4 py-2.5 text-base-content placeholder:text-base-content/40 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition shadow-xs"
            />
          </div>

          {/* Ô tìm kiếm địa điểm */}
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={localLocation}
              onChange={(e) => setLocalLocation(e.target.value)}
              placeholder="Địa điểm (Hà Nội, TP. HCM...)"
              className="w-full bg-base-100 border border-base-300 rounded-xl pl-10 pr-4 py-2.5 text-base-content placeholder:text-base-content/40 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition shadow-xs"
            />
          </div>

          {/* Nút bấm Tìm kiếm màu chủ đạo Primary */}
          <button
            type="submit"
            className="btn btn-primary px-7 h-11 min-h-11 rounded-xl font-semibold text-sm text-white shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <Search className="w-4 h-4" />
            <span>Tìm kiếm</span>
          </button>
        </form>
      </div>
    </section>
  );
};
