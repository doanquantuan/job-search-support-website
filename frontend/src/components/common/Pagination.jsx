import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
  itemName = 'doanh nghiệp',
  className = '',
}) => {
  if (totalPages <= 1) return null;

  // Thuật toán hiển thị số trang thông minh kèm dấu ba chấm (...)
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; // số trang hiển thị liền kề trang hiện tại

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  const handleSelectPage = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 border-t border-base-200/90 ${className}`}>
      {/* Thông tin tổng quan trang */}
      <div className="text-xs sm:text-sm text-base-content/70 font-medium order-2 sm:order-1">
        {totalItems !== undefined ? (
          <span>
            Trang <span className="font-bold text-base-content">{currentPage}</span> /{' '}
            <span className="font-bold text-base-content">{totalPages}</span> ({totalItems} {itemName})
          </span>
        ) : (
          <span>
            Trang <span className="font-bold text-base-content">{currentPage}</span> trên{' '}
            <span className="font-bold text-base-content">{totalPages}</span>
          </span>
        )}
      </div>

      {/* Cụm nút chuyển trang hiện đại */}
      <nav aria-label="Pagination" className="flex items-center gap-1.5 order-1 sm:order-2">
        {/* Nút Trước (Previous) */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => handleSelectPage(currentPage - 1)}
          className="btn btn-sm h-9 min-h-9 px-3 bg-base-100 hover:bg-base-200 hover:text-primary border border-base-200 text-base-content/80 rounded-xl gap-1 text-xs font-semibold disabled:opacity-35 disabled:cursor-not-allowed shadow-2xs transition-all cursor-pointer"
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {/* Khung chứa các nút số trang */}
        <div className="flex items-center gap-1 bg-base-100 p-1 rounded-xl border border-base-200 shadow-2xs">
          {pages.map((item, idx) => {
            if (item === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-xs text-base-content/40 select-none font-bold"
                >
                  •••
                </span>
              );
            }

            const pageNum = item;
            const isActive = currentPage === pageNum;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => handleSelectPage(pageNum)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-8 h-8 min-h-8 text-xs font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-sm ring-2 ring-primary/25 scale-105'
                    : 'text-base-content/70 hover:bg-base-200 hover:text-primary'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Nút Sau (Next) */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => handleSelectPage(currentPage + 1)}
          className="btn btn-sm h-9 min-h-9 px-3 bg-base-100 hover:bg-base-200 hover:text-primary border border-base-200 text-base-content/80 rounded-xl gap-1 text-xs font-semibold disabled:opacity-35 disabled:cursor-not-allowed shadow-2xs transition-all cursor-pointer"
          title="Trang sau"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;

