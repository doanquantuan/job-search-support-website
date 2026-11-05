import React, { useEffect, useState } from 'react';
import { AppHeader } from '@/components/common/AppHeader';
import { AppFooter } from '@/components/common/AppFooter';
import { JobSearchBar } from '@/features/job/components/JobSearchBar';
import { JobFilterBar } from '@/features/job/components/JobFilterBar';
import { JobCard } from '@/features/job/components/JobCard';
import { JobPagination } from '@/features/job/components/JobPagination';
import { JobDetailModal } from '@/features/company/components/JobDetailModal';
import { useJobStore } from '@/store/useJobStore';
import { ChevronDown, SearchX, Briefcase } from 'lucide-react';
import { JOB_SORT_OPTIONS as SORT_OPTIONS } from '@/constants/jobFilters';

export const JobListPage = () => {
  const {
    jobs,
    totalCount,
    loading,
    location,
    sortBy,
    setSortBy,
    fetchJobs,
    resetFilters,
    selectedJob,
    setSelectedJob,
  } = useJobStore();

  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApplySuccess = (jobTitle) => {
    setToastMessage(`Ứng tuyển thành công vị trí: ${jobTitle}!`);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-200/30 text-base-content font-sans">
      {/* 1. Header Navigation */}
      <AppHeader />

      {/* 2. Banner Tìm kiếm */}
      <JobSearchBar />

      {/* 3. Nội dung chính: Bộ lọc, Kết quả tìm kiếm & Phân trang */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Hàng bộ lọc */}
        <JobFilterBar />

        {/* Hàng đếm số lượng việc làm & Sắp xếp */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="text-sm font-semibold text-base-content/80 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            {loading ? (
              <span className="inline-block w-48 h-4 bg-base-200 animate-pulse rounded" />
            ) : (
              <span>
                Tìm thấy{' '}
                <strong className="font-extrabold text-base-content text-base">
                  {totalCount.toLocaleString('vi-VN')}
                </strong>{' '}
                việc làm {location ? `tại ${location}` : 'phù hợp'}
              </span>
            )}
          </div>

          {/* Dropdown Sắp xếp đồng bộ Company */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="relative inline-flex items-center">
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-base-100 border border-base-300 rounded-xl py-2 pl-3.5 pr-8 text-xs sm:text-sm font-medium text-base-content hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Sắp xếp: {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-base-content/50 absolute right-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Danh sách việc làm dạng lưới 2 cột: 10 việc làm / trang */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="card bg-base-100 border border-base-200/90 rounded-2xl p-5 animate-pulse flex flex-col justify-between h-48"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-14 bg-base-200 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2.5 pt-1">
                    <div className="h-4 bg-base-200 rounded w-3/4" />
                    <div className="h-3 bg-base-200 rounded w-1/2" />
                    <div className="h-3 bg-base-200 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-9 bg-base-200/60 rounded-xl w-full mt-4" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="card bg-base-100 border border-base-200 rounded-2xl p-12 text-center my-6 shadow-xs">
            <SearchX className="w-14 h-14 text-base-content/30 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-base-content mb-1">
              Không tìm thấy việc làm phù hợp
            </h3>
            <p className="text-sm text-base-content/60 max-w-md mx-auto mb-5">
              Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh lại các tiêu chí trong bộ lọc.
            </p>
            <div>
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-primary btn-sm rounded-xl px-5 text-white font-medium"
              >
                Đặt lại tất cả bộ lọc
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Phân trang (10 việc làm / trang) */}
        {!loading && jobs.length > 0 && <JobPagination />}
      </main>

      {/* 4. Modal Chi tiết công việc / Ứng tuyển */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          company={selectedJob.company}
          isOpen={Boolean(selectedJob)}
          onClose={() => setSelectedJob(null)}
          onApplySuccess={handleApplySuccess}
        />
      )}

      {/* Thông báo Toast khi nộp đơn thành công */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-in slide-in-from-bottom duration-200 flex items-center gap-2">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 5. Footer */}
      <AppFooter />
    </div>
  );
};

export default JobListPage;
