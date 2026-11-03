import React, { useState, useEffect } from 'react';
import { AppHeader } from '@/components/common/AppHeader';
import { AppFooter } from '@/components/common/AppFooter';
import { CompanyHero } from '@/features/company/components/CompanyHero';
import { CompanyFilterSidebar } from '@/features/company/components/CompanyFilterSidebar';
import { CompanyCard } from '@/features/company/components/CompanyCard';
import { SearchX, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Pagination } from '@/components/common/Pagination';
import { useCompanyStore } from '@/store/useCompanyStore';

const CATEGORY_TABS = [
  { id: 'all', label: 'Tất cả công ty' },
  { id: 'featured', label: '★ Doanh nghiệp nổi bật' },
  { id: 'tech', label: 'Công nghệ thông tin' },
  { id: 'Hà Nội', label: 'Hà Nội' },
  { id: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
];

export const CompanyListPage = () => {
  const {
    companies,
    loading,
    totalCount,
    totalPages,
    currentPage,
    itemsPerPage,
    searchTerm,
    location,
    activeTab,
    selectedIndustries,
    selectedSizes,
    selectedMinRating,
    sortBy,
    setHeroSearch,
    setActiveTab,
    setSelectedIndustries,
    setSelectedSizes,
    setSelectedMinRating,
    setSortBy,
    setCurrentPage,
    resetFilters,
    fetchCompanies,
  } = useCompanyStore();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [
    searchTerm,
    location,
    activeTab,
    selectedIndustries,
    selectedSizes,
    selectedMinRating,
    sortBy,
    currentPage,
  ]);

  const startResult = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endResult = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col font-sans">
      {/* 1. App Header */}
      <AppHeader />

      {/* 2. Compact Minimal Header Search */}
      <CompanyHero
        onSearch={setHeroSearch}
        initialSearch={searchTerm}
        initialLocation={location}
        totalCount={totalCount}
      />

      {/* 3. Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Quick Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-base-100 text-base-content/70 hover:bg-base-200 hover:text-primary border border-base-200/90 shadow-2xs'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left: Filter Sidebar (Desktop) */}
          <div className="hidden lg:block w-72 shrink-0">
            <CompanyFilterSidebar
              selectedIndustries={selectedIndustries}
              onIndustryChange={setSelectedIndustries}
              selectedSizes={selectedSizes}
              onSizeChange={setSelectedSizes}
              selectedMinRating={selectedMinRating}
              onRatingChange={setSelectedMinRating}
              onResetFilters={resetFilters}
            />
          </div>

          {/* Right: Company Grid & Controls */}
          <div className="flex-1 min-w-0 w-full space-y-4">
            {/* Top Toolbar: Counter, Mobile Filter Trigger, Sort Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-base-100 p-3.5 sm:px-5 rounded-2xl border border-base-200/90 shadow-2xs">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <span className="text-xs sm:text-sm text-base-content/70">
                  Hiển thị <span className="font-bold text-base-content">{startResult} - {endResult}</span> trên{' '}
                  <span className="font-bold text-primary">{totalCount}</span> doanh nghiệp
                </span>

                {/* Mobile Filter Button */}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                  className="lg:hidden btn btn-ghost btn-sm h-8 px-2.5 text-xs text-primary font-semibold gap-1.5 rounded-lg border border-primary/20"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Bộ lọc</span>
                </button>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <div className="flex items-center gap-1.5 text-xs text-base-content/60 font-medium">
                  <ArrowUpDown className="w-3.5 h-3.5 text-base-content/40 hidden sm:inline" />
                  <span className="hidden sm:inline">Sắp xếp:</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="select select-bordered select-sm h-9 min-h-9 text-xs focus:select-primary rounded-xl font-medium bg-base-100"
                >
                  <option value="default">Phù hợp nhất</option>
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="jobs">Nhiều việc tuyển nhất</option>
                  <option value="name">Tên doanh nghiệp (A - Z)</option>
                </select>
              </div>
            </div>

            {/* Mobile Filter Collapse Area */}
            {mobileFilterOpen && (
              <div className="lg:hidden">
                <CompanyFilterSidebar
                  selectedIndustries={selectedIndustries}
                  onIndustryChange={setSelectedIndustries}
                  selectedSizes={selectedSizes}
                  onSizeChange={setSelectedSizes}
                  selectedMinRating={selectedMinRating}
                  onRatingChange={setSelectedMinRating}
                  onResetFilters={resetFilters}
                />
              </div>
            )}

            {/* Loading Skeletons */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2, 3, 4, 5, 6].map((sk) => (
                  <div
                    key={sk}
                    className="card bg-base-100 border border-base-200 p-5 rounded-2xl shadow-xs space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="skeleton w-14 h-14 rounded-xl shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="skeleton h-4 w-3/4" />
                        <div className="skeleton h-3 w-1/2" />
                      </div>
                    </div>
                    <div className="skeleton h-10 w-full" />
                    <div className="flex justify-between items-center pt-3 border-t border-base-200">
                      <div className="skeleton h-6 w-32 rounded-btn" />
                      <div className="skeleton h-7 w-24 rounded-btn" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && companies.length === 0 && (
              <div className="card bg-base-100 p-12 border border-base-200 shadow-sm rounded-2xl text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 ring-8 ring-primary/5">
                  <SearchX className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-base-content text-base sm:text-lg mb-1">
                  Không tìm thấy công ty phù hợp
                </h3>
                <p className="text-xs sm:text-sm text-base-content/60 max-w-sm mb-5 leading-relaxed">
                  Thử tìm kiếm với từ khóa khác hoặc xóa bớt các tiêu chí lọc để xem thêm nhiều công ty.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn btn-primary btn-sm h-10 px-6 text-white font-semibold rounded-xl"
                >
                  Đặt lại tất cả bộ lọc
                </button>
              </div>
            )}

            {/* Company Cards Grid */}
            {!loading && companies.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {companies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            )}

            {/* Pagination Section */}
            {!loading && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemName="doanh nghiệp"
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 280, behavior: 'smooth' });
                }}
              />
            )}
          </div>
        </div>
      </main>

      {/* 4. App Footer */}
      <AppFooter />
    </div>
  );
};

export default CompanyListPage;
