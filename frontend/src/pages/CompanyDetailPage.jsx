import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppHeader } from '@/components/common/AppHeader';
import { AppFooter } from '@/components/common/AppFooter';
import { Toast } from '@/components/common/Toast';
import { companyApi } from '@/features/company/services/companyApi';
import { JobDetailModal } from '@/features/company/components/JobDetailModal';
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Star,
  Briefcase,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Share2,
  Heart,
  Check,
  ChevronRight,
  Calendar,
  Layers,
  Map,
  Compass,
  ArrowRight,
  Image as ImageIcon,
  ThumbsUp,
} from 'lucide-react';

export const CompanyDetailPage = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [similarCompanies, setSimilarCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' (tất cả theo wireframe) | 'jobs' | 'reviews' | 'culture'
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      try {
        const data = await companyApi.getCompanyById(id);
        setCompany(data);

        const similar = await companyApi.getSimilarCompanies(id, 3);
        setSimilarCompanies(similar);
      } catch (err) {
        console.error('Failed to load company detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleFollow = () => {
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    if (nextState) {
      showToast('Đã theo dõi công ty', `Bạn sẽ nhận thông báo khi ${company.name} có việc làm mới.`);
    } else {
      showToast('Đã hủy theo dõi', `Bạn đã ngừng nhận cập nhật từ ${company.name}.`, 'info');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Đã sao chép liên kết', 'Link trang công ty đã được lưu vào bộ nhớ tạm.');
    }
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleApplySuccess = (jobTitle) => {
    showToast('Ứng tuyển thành công', `Hồ sơ cho vị trí "${jobTitle}" đã được gửi tới nhà tuyển dụng.`);
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'jobs') {
      const el = document.getElementById('section-jobs');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tabId === 'reviews') {
      const el = document.getElementById('section-reviews');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tabId === 'culture') {
      const el = document.getElementById('section-culture');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 320, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 text-base-content flex flex-col font-sans">
        <AppHeader />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="skeleton h-6 w-48 rounded-md" />
          <div className="skeleton h-60 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="skeleton h-44 w-full rounded-2xl" />
              <div className="skeleton h-60 w-full rounded-2xl" />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="skeleton h-44 w-full rounded-2xl" />
              <div className="skeleton h-56 w-full rounded-2xl" />
            </div>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-base-200 text-base-content flex flex-col font-sans">
        <AppHeader />
        <main className="flex-1 max-w-md w-full mx-auto px-4 py-20 text-center space-y-4">
          <Building2 className="w-12 h-12 text-primary/50 mx-auto" />
          <h2 className="text-xl font-bold text-base-content">Không tìm thấy thông tin công ty</h2>
          <p className="text-xs text-base-content/60">Doanh nghiệp này không tồn tại hoặc đã ngừng hoạt động.</p>
          <Link to="/companies" className="btn btn-primary text-white btn-sm px-6 rounded-xl">
            Quay lại danh sách công ty
          </Link>
        </main>
        <AppFooter />
      </div>
    );
  }

  const {
    name = 'Công ty',
    logo,
    coverImage,
    coverGradient = 'from-secondary/35 via-primary/25 to-accent/20',
    industry = 'Công nghệ thông tin',
    location = 'Hà Nội',
    address = 'Hà Nội',
    size = '500+ nhân viên',
    rating = 4.8,
    reviewCount = 100,
    description = '',
    website = '',
    founded = '2006',
    tags = [],
    keySkills = [],
    jobs = [],
    reviews = [],
    cultureGallery = [],
  } = company;

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const displayedJobs = showAllJobs ? jobs : jobs.slice(0, 3);

  // Danh sách các lĩnh vực hoạt động (specialties)
  const activityFields = tags.length > 0 ? tags : [
    'Phát triển ứng dụng & Giải pháp số',
    'Chuyển đổi số doanh nghiệp',
    'Điện toán đám mây (Cloud Computing)',
    'Trí tuệ nhân tạo (AI & Data)',
  ];

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col font-sans">
      <AppHeader />
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Quick Job Details & Apply Modal */}
      <JobDetailModal
        job={selectedJob}
        company={company}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApplySuccess={handleApplySuccess}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5">
        {/* ── 1. Breadcrumb navigation (Trang chủ > Công ty > [Tên công ty]) ── */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-base-content/60 overflow-hidden">
          <Link to="/" className="hover:text-primary transition-colors shrink-0">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
          <Link to="/companies" className="hover:text-primary transition-colors shrink-0">
            Công ty
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
          <span className="font-semibold text-base-content truncate">
            {name}
          </span>
        </nav>

        {/* ── 2. Top Banner Card (Cover + Header Info Bar + Tabs) ── */}
        <div className="card bg-base-100 border border-base-200 shadow-2xs overflow-hidden rounded-2xl">
          {/* Ảnh bìa công ty (Full Width Cover) */}
          <div className={`h-40 sm:h-56 md:h-64 w-full bg-gradient-to-r ${coverGradient} relative overflow-hidden`}>
            {coverImage && (
              <img
                src={coverImage}
                alt={`${name} cover`}
                className="w-full h-full object-cover mix-blend-overlay opacity-60"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-base-100/30 via-transparent to-transparent" />
          </div>

          {/* Khung thông tin dưới ảnh bìa */}
          <div className="p-5 sm:p-6 sm:pb-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Cụm Logo + Tên + Thông tin tóm tắt */}
              <div className="flex items-start sm:items-center gap-4">
                {/* Logo vuông bo góc */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-base-100 border-2 border-base-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                  {logo && !imgError ? (
                    <img
                      src={logo}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-xl sm:text-2xl select-none">
                      {initials || <Building2 className="w-8 h-8" />}
                    </div>
                  )}
                </div>

                {/* Tên & Dòng thông tin phụ */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-base-content tracking-tight">
                      {name}
                    </h1>
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" title="Doanh nghiệp đã xác thực" />
                  </div>
                  <p className="text-xs sm:text-sm text-base-content/70 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>{industry}</span>
                    <span className="opacity-30">·</span>
                    <span>{location}</span>
                    <span className="opacity-30">·</span>
                    <span>{size}</span>
                    <span className="opacity-30">·</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-base-content">
                      <Star className="w-3.5 h-3.5 fill-warning stroke-warning" />
                      <span>{rating.toFixed(1)}/5</span>
                    </span>
                  </p>
                </div>
              </div>

              {/* Cụm nút hành động bên phải: Website & Theo dõi */}
              <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 w-full sm:w-auto">
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm h-10 px-4 text-xs font-semibold border-base-300 text-base-content hover:bg-base-200 hover:text-primary rounded-xl flex-1 sm:flex-initial gap-1.5 transition-colors"
                  >
                    <Globe className="w-4 h-4 text-base-content/60" />
                    <span>Website</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`btn btn-sm h-10 px-5 text-xs font-bold rounded-xl flex-1 sm:flex-initial gap-1.5 transition-all shadow-2xs ${
                    isFollowing
                      ? 'btn-outline border-primary text-primary hover:bg-primary/10'
                      : 'btn-primary text-white'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đang theo dõi</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      <span>Theo dõi</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Thanh Tabs điều hướng: Giới thiệu | Việc làm ([N]) | Đánh giá | Hình ảnh */}
            <div className="pt-3 border-t border-base-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
              {[
                { id: 'all', label: 'Giới thiệu' },
                { id: 'jobs', label: `Việc làm (${jobs.length})` },
                { id: 'reviews', label: `Đánh giá (${reviews.length})` },
                { id: 'culture', label: 'Hình ảnh' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabClick(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-primary text-white shadow-2xs'
                        : 'text-base-content/70 hover:bg-base-200 hover:text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 3. Main 2-Column Layout (Wireframe Structure) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ══════════════════════════════════════════════════════════════
              CỘT TRÁI (8 / 12 Cột)
              - Card 1: Giới thiệu công ty
              - Card 2: Lĩnh vực hoạt động
              - Card 3: Việc làm đang tuyển
              - Card 4: Đánh giá từ nhân viên
              - Card 5: Hình ảnh & Không gian làm việc
             ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-8 space-y-5">
            {/* ── Card 1: Giới thiệu công ty ── */}
            <section id="section-about" className="card bg-base-100 p-5 sm:p-6 border border-base-200 shadow-2xs rounded-2xl space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-base-content">
                Giới thiệu công ty
              </h2>
              <p className="text-xs sm:text-sm text-base-content/80 leading-relaxed whitespace-pre-line">
                {description || `${name} là doanh nghiệp hàng đầu trong lĩnh vực ${industry}. Với đội ngũ nhân sự nhiệt huyết và giàu kinh nghiệm, chúng tôi cam kết mang đến những sản phẩm công nghệ tiên tiến, kiến tạo môi trường làm việc lý tưởng và chế độ đãi ngộ vượt trội cho người lao động.`}
              </p>
            </section>

            {/* ── Card 2: Lĩnh vực hoạt động ── */}
            <section className="card bg-base-100 p-5 sm:p-6 border border-base-200 shadow-2xs rounded-2xl space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-base-content">
                Lĩnh vực hoạt động
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {activityFields.map((field, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-base-200 text-base-content/80 hover:bg-primary/10 hover:text-primary transition-colors text-xs font-medium"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </section>

            {/* ── Card 3: Việc làm đang tuyển ── */}
            <section id="section-jobs" className="card bg-base-100 p-5 sm:p-6 border border-base-200 shadow-2xs rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-base-200">
                <h2 className="text-base sm:text-lg font-bold text-base-content">
                  Việc làm đang tuyển
                </h2>
                <span className="badge bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                  {jobs.length} vị trí đang mở
                </span>
              </div>

              {/* Danh sách các vị trí việc làm */}
              <div className="divide-y divide-base-200">
                {displayedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 min-w-0">
                      <h3
                        onClick={() => handleViewJob(job)}
                        className="font-bold text-sm sm:text-base text-base-content group-hover:text-primary transition-colors cursor-pointer line-clamp-1"
                        title={job.title}
                      >
                        {job.title}
                      </h3>
                      <p className="text-xs text-base-content/65 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-semibold text-primary">{job.salary}</span>
                        <span className="opacity-30">·</span>
                        <span>{job.location}</span>
                        <span className="opacity-30">·</span>
                        <span>{job.type}</span>
                        {job.workMode && (
                          <>
                            <span className="opacity-30">·</span>
                            <span className="text-secondary font-medium">{job.workMode}</span>
                          </>
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleViewJob(job)}
                      className="btn btn-outline btn-sm h-9 px-4 text-xs font-semibold border-base-300 text-base-content hover:bg-primary hover:border-primary hover:text-white rounded-xl self-start sm:self-center shrink-0 transition-colors"
                    >
                      Xem việc làm
                    </button>
                  </div>
                ))}
              </div>

              {/* Nút Xem tất cả việc làm */}
              {jobs.length > 3 && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllJobs(!showAllJobs)}
                    className="btn btn-outline btn-sm w-full h-10 border-base-300 text-xs font-bold text-base-content/80 hover:bg-base-200 hover:text-primary rounded-xl"
                  >
                    {showAllJobs ? 'Thu gọn danh sách việc làm' : `Xem tất cả ${jobs.length} việc làm`}
                  </button>
                </div>
              )}
            </section>

            {/* ── Card 4: Đánh giá từ nhân viên ── */}
            <section id="section-reviews" className="card bg-base-100 p-5 sm:p-6 border border-base-200 shadow-2xs rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-base-200 gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-base-content">
                    Đánh giá từ nhân viên
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-base-content">
                      {rating.toFixed(1)}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-warning stroke-warning" />
                      ))}
                    </div>
                    <span className="text-xs text-base-content/60 font-medium">
                      ({reviewCount} đánh giá)
                    </span>
                  </div>
                </div>

                <span className="badge badge-ghost text-xs text-base-content/60 font-medium self-start sm:self-auto">
                  94% khuyên làm việc tại đây
                </span>
              </div>

              {/* Danh sách các đánh giá */}
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl bg-base-200/40 border border-base-200 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-base-content">
                          {rev.author}
                        </h4>
                        <p className="text-2xs text-base-content/50 mt-0.5">
                          {rev.role} • {rev.date}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 font-bold text-xs text-base-content shrink-0">
                        <Star className="w-3.5 h-3.5 fill-warning stroke-warning" />
                        <span>{rev.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {rev.title && (
                      <p className="text-xs font-semibold text-base-content/90">
                        "{rev.title}"
                      </p>
                    )}

                    <div className="space-y-1.5 text-xs text-base-content/75 leading-relaxed">
                      {rev.pros && (
                        <p>
                          <span className="font-semibold text-success">Ưu điểm: </span>
                          {rev.pros}
                        </p>
                      )}
                      {rev.cons && (
                        <p>
                          <span className="font-semibold text-base-content/60">Điểm cần cải thiện: </span>
                          {rev.cons}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Card 5: Hình ảnh công ty (Culture & Office Gallery) ── */}
            {cultureGallery && cultureGallery.length > 0 && (
              <section id="section-culture" className="card bg-base-100 p-5 sm:p-6 border border-base-200 shadow-2xs rounded-2xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-base-200">
                  <h2 className="text-base sm:text-lg font-bold text-base-content flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <span>Hình ảnh & Không gian làm việc</span>
                  </h2>
                  <span className="text-xs text-base-content/50 font-medium">
                    {cultureGallery.length} hình ảnh
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {cultureGallery.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="aspect-4/3 rounded-xl overflow-hidden bg-base-200 border border-base-200 group"
                    >
                      <img
                        src={imgUrl}
                        alt={`${name} photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════
              CỘT PHẢI (4 / 12 Cột)
              - Card 1: Thông tin chung
              - Card 2: Địa chỉ (kèm Bản đồ)
              - Card 3: Công ty tương tự
             ══════════════════════════════════════════════════════════════ */}
          <aside className="lg:col-span-4 space-y-5">
            {/* ── Card 1: Thông tin chung ── */}
            <div className="card bg-base-100 p-5 border border-base-200 shadow-2xs rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-base-content pb-2.5 border-b border-base-200">
                Thông tin chung
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-2xs text-base-content/50 uppercase font-semibold">Quy mô</span>
                  <p className="font-semibold text-base-content mt-0.5">{size}</p>
                </div>

                <div>
                  <span className="text-2xs text-base-content/50 uppercase font-semibold">Ngành</span>
                  <p className="font-semibold text-base-content mt-0.5">{industry}</p>
                </div>

                <div>
                  <span className="text-2xs text-base-content/50 uppercase font-semibold">Thành lập</span>
                  <p className="font-semibold text-base-content mt-0.5">{founded}</p>
                </div>

                {website && (
                  <div>
                    <span className="text-2xs text-base-content/50 uppercase font-semibold">Website</span>
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:underline flex items-center gap-1 mt-0.5 break-all"
                    >
                      <span>{website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* ── Card 2: Địa chỉ ── */}
            <div className="card bg-base-100 p-5 border border-base-200 shadow-2xs rounded-2xl space-y-3.5">
              <h3 className="font-bold text-sm text-base-content pb-2.5 border-b border-base-200">
                Địa chỉ
              </h3>

              {/* Khung bản đồ trực quan */}
              <div className="w-full h-36 rounded-xl bg-gradient-to-br from-base-200 to-base-300/80 border border-base-200 relative overflow-hidden flex flex-col items-center justify-center p-4 text-center group">
                {/* Họa tiết đường phố giả lập nhẹ */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#1B365D_1px,transparent_1px)] [background-size:12px_12px]" />
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-md mb-1.5 z-10 group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="z-10 text-2xs font-bold text-primary hover:underline inline-flex items-center gap-1 bg-base-100/90 px-2.5 py-1 rounded-md shadow-2xs mt-1"
                >
                  <span>Xem trên Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Địa chỉ đầy đủ */}
              <div className="flex items-start gap-2 pt-1 text-xs text-base-content/80 leading-relaxed">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="font-medium">{address}</p>
              </div>
            </div>

            {/* ── Card 3: Công ty tương tự ── */}
            {similarCompanies && similarCompanies.length > 0 && (
              <div className="card bg-base-100 p-5 border border-base-200 shadow-2xs rounded-2xl space-y-3.5">
                <h3 className="font-bold text-sm text-base-content pb-2.5 border-b border-base-200">
                  Công ty tương tự
                </h3>

                <div className="divide-y divide-base-200">
                  {similarCompanies.map((simComp) => (
                    <Link
                      key={simComp.id}
                      to={`/companies/${simComp.id}`}
                      className="py-3 first:pt-1 last:pb-1 flex items-center gap-3 group transition-colors"
                    >
                      {/* Logo */}
                      <div className="w-11 h-11 rounded-xl bg-base-200 border border-base-200 overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {simComp.logo ? (
                          <img
                            src={simComp.logo}
                            alt={simComp.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-5 h-5 text-base-content/50" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs sm:text-sm text-base-content group-hover:text-primary transition-colors truncate">
                          {simComp.name}
                        </h4>
                        <p className="text-2xs text-base-content/60 truncate mt-0.5">
                          {simComp.industry} • {simComp.activeJobsCount} việc làm
                        </p>
                      </div>

                      <ArrowRight className="w-4 h-4 text-base-content/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default CompanyDetailPage;
