import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useJobStore } from '@/store/useJobStore';

export const JobPagination = () => {
  const { currentPage, totalPages, setCurrentPage, totalCount, itemsPerPage } = useJobStore();

  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-base-200">
      {/* Thông tin số lượng hiển thị */}
      <div className="text-xs sm:text-sm text-base-content/70 font-medium">
        Hiển thị <span className="font-bold text-base-content">{startIdx} - {endIdx}</span> trên{' '}
        <span className="font-bold text-base-content">{totalCount}</span> việc làm (10 việc làm/trang)
      </div>

      {/* Cụm nút chuyển trang */}
      <div className="flex items-center gap-1.5">
        {/* Nút Trước `<` */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="btn btn-ghost btn-sm h-9 w-9 p-0 rounded-xl border border-base-300 text-base-content/80 hover:bg-base-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Danh sách trang số */}
        {pages.map((page) => {
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`btn btn-sm h-9 w-9 p-0 rounded-xl text-xs sm:text-sm font-bold transition ${
                isActive
                  ? 'btn-primary text-white shadow-xs'
                  : 'btn-ghost border border-base-200 text-base-content/80 hover:bg-base-200'
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Nút Tiếp `>` */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="btn btn-ghost btn-sm h-9 w-9 p-0 rounded-xl border border-base-300 text-base-content/80 hover:bg-base-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
