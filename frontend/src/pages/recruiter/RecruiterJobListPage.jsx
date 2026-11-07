import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FilePlus2,
  Search,
  Briefcase,
  Users,
  Eye,
  Calendar,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Power,
  ChevronRight,
  Archive,
} from "lucide-react";
import { useRecruiterJobStore } from "@/store/useRecruiterJobStore";
import { StatusBadge } from "@/components/common/StatusBadge";
import { FilterTabs } from "@/components/common/FilterTabs";
import { MetricCard } from "@/components/common/MetricCard";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";

export const RecruiterJobListPage = () => {
  const navigate = useNavigate();
  const {
    jobs,
    totalJobs,
    totalPages,
    currentPage,
    filterStatus,
    searchTerm,
    loading,
    metrics,
    fetchMyJobs,
    setFilterStatus,
    setSearchTerm,
    setCurrentPage,
    toggleJobStatus,
    deleteJobPost,
  } = useRecruiterJobStore();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedJobToDelete, setSelectedJobToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handleOpenDelete = (job) => {
    setSelectedJobToDelete(job);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedJobToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteJobPost(selectedJobToDelete.id || selectedJobToDelete.jobId);
      setDeleteModalOpen(false);
      setSelectedJobToDelete(null);
    } catch {
      // toast shown in store
    } finally {
      setDeleteLoading(false);
    }
  };

  const tabs = [
    { id: "ALL", label: "Tất cả tin", count: metrics.total },
    { id: "PUBLISHED", label: "Đang tuyển", count: metrics.published },
    { id: "DRAFT", label: "Bản nháp", count: metrics.draft },
    { id: "CLOSED", label: "Đã đóng", count: metrics.closed },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* ── Top Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-base-100 p-6 rounded-2xl border border-base-300 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            Quản Lý Tin Tuyển Dụng
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-0.5">
            Theo dõi, đóng/mở nhận hồ sơ và quản lý toàn bộ các vị trí tuyển dụng của doanh nghiệp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/recruiter/jobs/create"
            className="btn btn-primary btn-sm text-white shadow-xs gap-1.5"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>Đăng tin mới</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Metrics Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tổng số tin đã đăng"
          value={metrics.total}
          subtext="Vị trí trong hệ thống"
          icon={Briefcase}
          color="blue"
          onClick={() => setFilterStatus("ALL")}
        />
        <MetricCard
          title="Tin đang công khai"
          value={metrics.published}
          subtext="Đang nhận hồ sơ"
          icon={CheckCircle2}
          color="emerald"
          onClick={() => setFilterStatus("PUBLISHED")}
        />
        <MetricCard
          title="Hồ sơ ứng tuyển nhận được"
          value={metrics.totalApplications}
          subtext="Trên tất cả các tin"
          icon={Users}
          color="amber"
          link="/recruiter/applications"
        />
        <MetricCard
          title="Tổng lượt xem tin"
          value={metrics.totalViews.toLocaleString()}
          subtext="Lượt truy cập từ ứng viên"
          icon={Eye}
          color="purple"
        />
      </div>

      {/* ── Filter Bar & Search ──────────────────────────────────────────────── */}
      <div className="bg-base-100 p-4 rounded-2xl border border-base-300 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Reusable FilterTabs */}
        <FilterTabs
          tabs={tabs}
          activeTab={filterStatus}
          onTabChange={(tabId) => setFilterStatus(tabId)}
          layoutId="activeRecruiterJobTab"
        />

        {/* Search input */}
        <div className="relative min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề vị trí hoặc kỹ năng..."
            className="input input-bordered input-sm w-full pl-9 focus:input-primary"
          />
        </div>
      </div>

      {/* ── Jobs Table View ──────────────────────────────────────────────────── */}
      {loading ? (
        <div className="bg-base-100 rounded-2xl border border-base-300 p-12 text-center flex flex-col items-center justify-center space-y-3">
          <span className="loading loading-spinner loading-md text-primary" />
          <p className="text-xs text-base-content/60">Đang tải danh sách tin tuyển dụng...</p>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={
            searchTerm
              ? "Không tìm thấy tin tuyển dụng phù hợp"
              : filterStatus === "DRAFT"
              ? "Chưa có bản nháp nào"
              : filterStatus === "CLOSED"
              ? "Chưa có tin tuyển dụng nào đã đóng"
              : "Doanh nghiệp chưa có tin tuyển dụng nào"
          }
          description={
            searchTerm
              ? "Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc hiện tại."
              : "Bắt đầu đăng tin tuyển dụng ngay để tìm kiếm nhân tài phù hợp cho công ty."
          }
          actionText={searchTerm ? "Xóa tìm kiếm" : "Đăng tin tuyển dụng ngay"}
          onAction={() => {
            if (searchTerm) {
              setSearchTerm("");
            } else {
              navigate("/recruiter/jobs/create");
            }
          }}
          actionIcon={FilePlus2}
        />
      ) : (
        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              {/* Table Head */}
              <thead>
                <tr className="bg-base-200/60 text-base-content/70 border-b border-base-200 text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-bold">Vị trí tuyển dụng</th>
                  <th className="py-3.5 px-4 font-bold">Lương & Hình thức</th>
                  <th className="py-3.5 px-4 font-bold">Thời hạn</th>
                  <th className="py-3.5 px-4 font-bold text-center">Lượt xem</th>
                  <th className="py-3.5 px-4 font-bold text-center">Ứng viên (ATS)</th>
                  <th className="py-3.5 px-4 font-bold">Trạng thái</th>
                  <th className="py-3.5 px-4 font-bold text-center">Nhận hồ sơ</th>
                  <th className="py-3.5 px-4 font-bold text-right">Thao tác</th>
                </tr>
              </thead>

              {/* Table Body with Staggered Entrance */}
              <tbody className="divide-y divide-base-200">
                <AnimatePresence>
                  {jobs.map((job, idx) => {
                    const isPublished = job.status === "PUBLISHED";
                    const isClosed = job.status === "CLOSED";

                    return (
                      <motion.tr
                        key={job.id || job.jobId}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18, delay: idx * 0.03 }}
                        className="hover:bg-base-200/40 transition-colors group"
                      >
                        {/* Tiêu đề & Ngành */}
                        <td className="py-3.5 px-4 max-w-[280px]">
                          <div className="space-y-0.5">
                            <Link
                              to={`/jobs/${job.id || job.jobId}`}
                              target="_blank"
                              className="font-bold text-sm text-base-content hover:text-primary transition-colors line-clamp-1 flex items-center gap-1.5"
                              title={job.title}
                            >
                              <span>{job.title}</span>
                              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                            </Link>
                            <div className="flex items-center gap-1.5 text-2xs text-base-content/50">
                              <span>{job.industry || "Công nghệ"}</span>
                              <span>•</span>
                              <span>{job.province || "Toàn quốc"}</span>
                            </div>
                          </div>
                        </td>

                        {/* Mức lương & Hình thức */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {job.salary || "Thỏa thuận"}
                            </p>
                            <p className="text-2xs text-base-content/50">
                              {job.workplaceType || job.workMode || "Hybrid"}
                            </p>
                          </div>
                        </td>

                        {/* Ngày đăng & Hạn chót */}
                        <td className="py-3.5 px-4 text-xs text-base-content/70">
                          <div className="space-y-0.5">
                            <p className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-base-content/40" />
                              <span>{job.deadline ? job.deadline : "Không giới hạn"}</span>
                            </p>
                            <p className="text-2xs text-base-content/40">
                              Đăng: {job.createdAt ? new Date(job.createdAt).toLocaleDateString("vi-VN") : "Gần đây"}
                            </p>
                          </div>
                        </td>

                        {/* Lượt xem */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-xs font-semibold text-base-content/70 inline-flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-base-content/40" />
                            {job.viewCount || 0}
                          </span>
                        </td>

                        {/* Ứng viên (ATS) */}
                        <td className="py-3.5 px-4 text-center">
                          <Link
                            to={`/recruiter/applications?jobId=${job.id || job.jobId}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors shadow-2xs group/btn"
                            title="Xem danh sách ứng viên đã nộp đơn"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>{job.applicationsCount || 0} hồ sơ</span>
                            <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                          </Link>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          <StatusBadge status={job.status} size="sm" />
                        </td>

                        {/* Optimistic Toggle Switch */}
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isPublished}
                            disabled={job.status === "DRAFT"}
                            onChange={() => toggleJobStatus(job.id || job.jobId)}
                            className="toggle toggle-primary toggle-sm"
                            title={
                              job.status === "DRAFT"
                                ? "Bản nháp không thể mở nhận đơn trực tiếp"
                                : isPublished
                                ? "Gạt để tạm dừng nhận hồ sơ"
                                : "Gạt để mở lại nhận đơn"
                            }
                          />
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/recruiter/jobs/${job.id || job.jobId}/edit`}
                              className="btn btn-ghost btn-xs btn-square text-base-content/70 hover:text-primary"
                              title="Chỉnh sửa tin"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleOpenDelete(job)}
                              className="btn btn-ghost btn-xs btn-square text-base-content/70 hover:text-error"
                              title="Xóa tin"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-base-200 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Reusable ConfirmModal for Deleting Jobs ────────────────────────── */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Xóa tin tuyển dụng"
        message={`Bạn có chắc chắn muốn xóa tin "${selectedJobToDelete?.title}"? Toàn bộ dữ liệu hồ sơ và thông tin tin đăng sẽ bị gỡ bỏ khỏi hệ thống.`}
        confirmText="Xác nhận xóa"
        confirmColor="btn-error"
      />
    </div>
  );
};

export default RecruiterJobListPage;
