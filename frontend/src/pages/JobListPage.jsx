import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppHeader } from '@/components/common/AppHeader';
import { AppFooter } from '@/components/common/AppFooter';
import { JobSearchBar } from '@/features/job/components/JobSearchBar';
import { JobFilterBar } from '@/features/job/components/JobFilterBar';
import { JobCard } from '@/features/job/components/JobCard';
import { JobPagination } from '@/features/job/components/JobPagination';
import { JobDetailModal } from '@/features/company/components/JobDetailModal';
import { useJobStore } from '@/store/useJobStore';
import { ChevronDown, SearchX, Briefcase, Check, ArrowUpDown } from 'lucide-react';
import { JOB_SORT_OPTIONS as SORT_OPTIONS } from '@/constants/jobFilters';
import {
  fadeIn,
  fadeInUp,
  slideInLeft,
  scaleInBounce,
  staggerContainer,
} from '@/lib/motionVariants';

export const JobListPage = () => {
  const {
    jobs,
    totalCount,
    currentPage,
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
  const [sortOpen, setSortOpen] = useState(false);
  const sortMenuRef = useRef(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  // Đóng popover sắp xếp khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Mới nhất';

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
        <motion.div
          variants={slideInLeft}
          custom={0.15}
          initial="hidden"
          animate="visible"
        >
          <JobFilterBar />
        </motion.div>

        {/* Hàng đếm số lượng việc làm & Sắp xếp */}
        <motion.div
          variants={fadeIn}
          custom={0.25}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5"
        >
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

          {/* Dropdown Sắp xếp tùy chỉnh đồng bộ UI/UX */}
          <div className="flex items-center gap-2 self-end sm:self-auto" ref={sortMenuRef}>
            <div className="relative inline-flex items-center">
              <button
                type="button"
                onClick={() => setSortOpen((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-medium transition cursor-pointer shadow-xs ${
                  sortOpen
                    ? 'border-primary bg-base-100 text-primary ring-2 ring-primary/10'
                    : 'border-base-300 bg-base-100 text-base-content/80 hover:border-primary/50 hover:bg-base-200/50'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-base-content/50" />
                <span>
                  Sắp xếp: <strong className="font-bold text-base-content">{currentSortLabel}</strong>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    sortOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Popover Dropdown Menu Sắp xếp */}
              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-base-100 border border-base-200 rounded-xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  {SORT_OPTIONS.map((opt) => {
                    const isOptionActive = sortBy === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSortBy(opt.value);
                          setSortOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between transition hover:bg-base-200/70 cursor-pointer ${
                          isOptionActive
                            ? 'font-bold text-primary bg-primary/10'
                            : 'text-base-content/80'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isOptionActive && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>

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
          <motion.div
            variants={scaleInBounce}
            initial="hidden"
            animate="visible"
            className="card bg-base-100 border border-base-200 rounded-2xl p-12 text-center my-6 shadow-xs"
          >
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
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`jobs-page-${currentPage}-${sortBy}`}
              variants={staggerContainer(0.06, 0.04)}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 12, transition: { duration: 0.18 } }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {jobs.map((job) => (
                <motion.div key={job.id} variants={fadeInUp}>
                  <JobCard job={job} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
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
