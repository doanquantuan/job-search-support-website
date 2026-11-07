import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  ArrowRight,
  TrendingUp,
  Users,
  Laptop,
  Megaphone,
  Banknote,
  Palette,
  Truck,
  HeartPulse,
  Award,
  Flame,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ListFilter,
  Check,
  X,
} from 'lucide-react';
import { AppHeader } from '@/components/common/AppHeader';
import { AppFooter } from '@/components/common/AppFooter';
import { JobCard } from '@/features/job/components/JobCard';
import { CompanyCard } from '@/features/company/components/CompanyCard';
import { ApplyJobModal } from '@/features/job/components/ApplyJobModal';
import { jobApi } from '@/features/job/services/jobApi';
import { companyApi } from '@/features/company/services/companyApi';
import { useJobStore } from '@/store/useJobStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from '@/store/useToastStore';

// Nguồn dữ liệu ngành nghề & bộ lọc duy nhất (Single Source of Truth)
import {
  POPULAR_CATEGORIES,
  getSidebarCategoryPages,
  JOB_FILTER_CATEGORIES,
  COMPANY_FILTER_CATEGORIES,
  matchJobByCategory,
  matchCompanyByIndustry,
  matchJobByType,
} from '@/constants/categories';
import {
  LOCATIONS,
  TRENDING_KEYWORDS,
  FILTER_MODES,
  FILTER_LOCATIONS,
  FILTER_SALARIES,
  FILTER_EXPERIENCES,
  matchJobBySalary,
  matchJobByExperience,
} from '@/constants/jobFilters';

// Danh sách các slide banner tuyển dụng nổi bật dạng hình ảnh (Image Banners)
const PROMO_SLIDES = [
  {
    id: 1,
    title: 'Tuyển dụng Shinhan Bank - Chuyên viên Quan hệ Khách hàng Cá nhân',
    imageUrl: '/banners/banner-shinhan.svg',
    keyword: 'Tài chính',
  },
  {
    id: 2,
    title: 'Đón sóng công nghệ 2026 - FPT Software & Tech Partners',
    imageUrl: '/banners/banner-fpt.svg',
    keyword: 'Công nghệ thông tin',
  },
  {
    id: 3,
    title: 'Tuyển dụng Tập đoàn Bán lẻ & FMCG Mega Plaza',
    imageUrl: '/banners/banner-retail.svg',
    keyword: 'Kinh doanh',
  },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    keyword,
    setKeyword,
    location: storeLocation,
    setLocation: setStoreLocation,
    savedJobIds,
    selectedJob,
    setSelectedJob,
  } = useJobStore();

  // Search input state
  const [searchKeyword, setSearchKeyword] = useState(keyword || '');
  const [selectedLocation, setSelectedLocation] = useState(storeLocation || '');

  // Category card & Promo slider state
  const SIDEBAR_CATEGORIES = useMemo(() => getSidebarCategoryPages(6), []);
  const [catPage, setCatPage] = useState(0);
  const [promoSlide, setPromoSlide] = useState(0);
  const totalCatPages = SIDEBAR_CATEGORIES.length;
  const currentCategories = SIDEBAR_CATEGORIES[catPage] || SIDEBAR_CATEGORIES[0];
  const currentSlide = PROMO_SLIDES[promoSlide] || PROMO_SLIDES[0];

  // Auto slide promo banner mỗi 5.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setPromoSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const handlePrevPromo = () => {
    setPromoSlide((prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length);
  };

  const handleNextPromo = () => {
    setPromoSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
  };

  const handlePrevCat = () => {
    setCatPage((prev) => (prev > 0 ? prev - 1 : totalCatPages - 1));
  };

  const handleNextCat = () => {
    setCatPage((prev) => (prev < totalCatPages - 1 ? prev + 1 : 0));
  };

  // Data states
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // Filter states cho phần "Việc làm nổi bật" chuẩn TopCV
  const [jobTypeTab, setJobTypeTab] = useState('office'); // 'office' | 'general'
  const [filterMode, setFilterMode] = useState('category'); // 'category' | 'location' | 'salary' | 'experience'
  const [subFilter, setSubFilter] = useState('Tất cả');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [jobPage, setJobPage] = useState(0);
  const JOBS_PER_PAGE = 6;

  const filterDropdownRef = useRef(null);
  const pillsScrollRef = useRef(null);

  // Filter states cho phần "Top Công ty hàng đầu" (tương tự TopCV)
  const [selectedCompanyIndustry, setSelectedCompanyIndustry] = useState('Tất cả');
  const [companyPage, setCompanyPage] = useState(0);
  const companyPillsScrollRef = useRef(null);

  const scrollCompanyPills = (direction) => {
    if (companyPillsScrollRef.current) {
      companyPillsScrollRef.current.scrollBy({
        left: direction === 'left' ? -260 : 260,
        behavior: 'smooth',
      });
    }
  };

  const handleSelectCompanyIndustry = (cat) => {
    setSelectedCompanyIndustry(cat);
    setCompanyPage(0);
  };

  // Đóng dropdown bộ lọc khi nhấp ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollPills = (direction) => {
    if (pillsScrollRef.current) {
      pillsScrollRef.current.scrollBy({
        left: direction === 'left' ? -260 : 260,
        behavior: 'smooth',
      });
    }
  };

  const handleSelectFilterMode = (modeKey) => {
    setFilterMode(modeKey);
    setSubFilter('Tất cả');
    setIsFilterDropdownOpen(false);
    setJobPage(0);
  };

  const handleSelectSubFilter = (item) => {
    setSubFilter(item);
    setJobPage(0);
  };

  const handleJobTypeChange = (type) => {
    setJobTypeTab(type);
    setJobPage(0);
  };

  const currentSubFilterOptions = useMemo(() => {
    if (filterMode === 'location') return FILTER_LOCATIONS;
    if (filterMode === 'salary') return FILTER_SALARIES;
    if (filterMode === 'experience') return FILTER_EXPERIENCES;
    return JOB_FILTER_CATEGORIES;
  }, [filterMode]);

  // Fetch Jobs & Companies on mount
  useEffect(() => {
    let isMounted = true;

    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);
        const res = await jobApi.getJobs({ limit: 40 });
        if (isMounted && res) {
          const list = Array.isArray(res) ? res : res.jobs || res.data || [];
          setJobs(list);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách việc làm:', err);
      } finally {
        if (isMounted) setLoadingJobs(false);
      }
    };

    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const res = await companyApi.getCompanies({ limit: 24 });
        if (isMounted && res) {
          const list = Array.isArray(res) ? res : res.companies || res.data || [];
          setCompanies(list);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách công ty:', err);
      } finally {
        if (isMounted) setLoadingCompanies(false);
      }
    };

    fetchJobs();
    fetchCompanies();

    return () => {
      isMounted = false;
    };
  }, []);

  // Xử lý Tìm kiếm từ Hero Bar
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setKeyword(searchKeyword.trim());
    setStoreLocation(selectedLocation);

    const params = new URLSearchParams();
    if (searchKeyword.trim()) params.set('keyword', searchKeyword.trim());
    if (selectedLocation) params.set('location', selectedLocation);

    navigate(`/jobs?${params.toString()}`);
  };

  // Click vào từ khóa xu hướng
  const handleTagClick = (tag) => {
    setSearchKeyword(tag);
    setKeyword(tag);
    navigate(`/jobs?keyword=${encodeURIComponent(tag)}`);
  };

  // Lọc danh sách việc làm theo Tab & Bộ lọc chi tiết sử dụng helpers tập trung
  const filteredJobs = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];

    return jobs.filter((job) => {
      // 1. Phân loại theo Việc văn phòng vs Việc phổ thông
      if (!matchJobByType(job, jobTypeTab)) return false;

      // 2. Lọc theo subFilter chi tiết
      if (!subFilter || subFilter === 'Tất cả') return true;

      if (filterMode === 'category') {
        return matchJobByCategory(job, subFilter);
      }
      if (filterMode === 'location') {
        return (job.location || '').toLowerCase().includes(subFilter.toLowerCase());
      }
      if (filterMode === 'salary') {
        return matchJobBySalary(job, subFilter);
      }
      if (filterMode === 'experience') {
        return matchJobByExperience(job, subFilter);
      }

      return true;
    });
  }, [jobs, jobTypeTab, filterMode, subFilter]);

  const totalJobPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE) || 1;
  const displayedJobs = useMemo(() => {
    const start = jobPage * JOBS_PER_PAGE;
    return filteredJobs.slice(start, start + JOBS_PER_PAGE);
  }, [filteredJobs, jobPage]);

  // Lọc danh sách công ty theo ngành nghề sử dụng helper tập trung
  const filteredCompanies = useMemo(() => {
    if (!companies || companies.length === 0) return [];
    if (!selectedCompanyIndustry || selectedCompanyIndustry === 'Tất cả') return companies;

    return companies.filter((c) => matchCompanyByIndustry(c, selectedCompanyIndustry));
  }, [companies, selectedCompanyIndustry]);

  const COMPANIES_PER_PAGE = 8;
  const totalCompanyPages = Math.ceil(filteredCompanies.length / COMPANIES_PER_PAGE) || 1;
  const displayedCompanies = useMemo(() => {
    const start = companyPage * COMPANIES_PER_PAGE;
    return filteredCompanies.slice(start, start + COMPANIES_PER_PAGE);
  }, [filteredCompanies, companyPage]);

  return (
    <div className="min-h-screen bg-base-200 flex flex-col font-sans text-base-content">
      {/* 1. AppHeader chuẩn của dự án */}
      <AppHeader />

      <main className="flex-1">
        {/* 2. Hero Section: Tông màu Navy & Ocean Blue đặc trưng (#1B365D & #005A9C) */}
        <section className="bg-gradient-to-br from-brand-navy via-primary-700 to-primary text-white pt-10 pb-12 sm:pb-14 px-4 sm:px-6 relative overflow-hidden shadow-inner">
          {/* Họa tiết trang trí thương hiệu nhẹ */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#60C1E5_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Tiêu đề chính */}
            <div className="text-center max-w-3xl mx-auto mb-6">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug">
                Tìm kiếm cơ hội việc làm mơ ước cùng JobLink
              </h1>
              <p className="text-xs sm:text-sm text-primary-100 mt-2 font-normal">
                Kết nối nhanh chóng với hơn <span className="font-bold text-white">10.000+</span> việc làm chất lượng cao từ các doanh nghiệp hàng đầu
              </p>
            </div>

            {/* Thanh tìm kiếm trung tâm chuẩn thương hiệu */}
            <div className="bg-base-100 rounded-2xl shadow-xl p-2 sm:p-2.5 max-w-4xl mx-auto border border-white/20">
              <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch gap-2">
                {/* Input từ khóa */}
                <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 bg-base-200/50 md:bg-transparent rounded-xl md:rounded-none">
                  <Search className="w-5 h-5 text-primary shrink-0" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Vị trí tuyển dụng, tên công ty, kỹ năng..."
                    className="w-full bg-transparent text-base-content placeholder:text-base-content/40 text-sm focus:outline-none"
                  />
                  {searchKeyword && (
                    <button
                      type="button"
                      onClick={() => setSearchKeyword('')}
                      className="text-base-content/40 hover:text-base-content"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Phân cách đứng */}
                <div className="hidden md:block w-px bg-base-300 my-2" />

                {/* Dropdown Địa điểm */}
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-base-200/50 md:bg-transparent rounded-xl md:rounded-none min-w-[200px]">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-transparent text-base-content text-sm focus:outline-none cursor-pointer"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc.value} value={loc.value} className="text-base-content bg-base-100">
                        {loc.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nút Tìm kiếm màu Ocean Blue chuẩn dự án */}
                <button
                  type="submit"
                  className="btn btn-primary text-white font-bold text-sm h-11 px-7 rounded-xl shadow-sm shrink-0 border-none cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Tìm kiếm</span>
                </button>
              </form>
            </div>

            {/* Từ khóa thịnh hành */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              <span className="text-white/80 font-medium">Từ khóa nổi bật:</span>
              {TRENDING_KEYWORDS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-full transition-colors backdrop-blur-sm cursor-pointer border border-white/10"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* 2-Column Section chuẩn layout: Danh mục nghề nghiệp nhanh & Banner chiến dịch tuyển dụng */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6 sm:mt-8 items-stretch">
              {/* Cột trái: Box danh mục nghề nghiệp (phân trang 6 mục/trang, 1/5) */}
              <div className="lg:col-span-4 xl:col-span-3 bg-base-100 rounded-2xl shadow-xl border border-white/20 p-3 sm:p-4 flex flex-col justify-between text-base-content min-h-[310px] sm:min-h-[340px]">
                <div className="space-y-0.5">
                  {currentCategories.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTagClick(item.keyword || item.name)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 transition-all group cursor-pointer"
                    >
                      <span className="truncate pr-2 group-hover:translate-x-0.5 transition-transform">
                        {item.name}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>

                {/* Phân trang danh mục dạng 1/5 với 2 nút mũi tên tròn */}
                <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100 px-3 text-xs text-slate-500 font-semibold select-none">
                  <span>
                    {catPage + 1}/{totalCatPages}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevCat}
                      aria-label="Trang trước"
                      className="w-7 h-7 rounded-full border border-slate-200 hover:border-primary flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextCat}
                      aria-label="Trang sau"
                      className="w-7 h-7 rounded-full border border-primary text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Cột phải: Banner chiến dịch tuyển dụng dạng hình ảnh (Image Banner Slider) */}
              <div className="lg:col-span-8 xl:col-span-9 rounded-2xl shadow-xl border border-white/20 overflow-hidden relative min-h-[310px] sm:min-h-[340px] flex items-center bg-base-100 group">
                <img
                  src={currentSlide.imageUrl}
                  alt={currentSlide.title}
                  onClick={() => handleTagClick(currentSlide.keyword)}
                  className="w-full h-full object-cover object-center cursor-pointer transition-transform duration-500 group-hover:scale-[1.01]"
                />

                {/* Nút mũi tên trượt trái / phải */}
                <button
                  type="button"
                  onClick={handlePrevPromo}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-slate-700 hover:text-primary transition-all cursor-pointer z-20 backdrop-blur-sm"
                  aria-label="Slide trước"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPromo}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-slate-700 hover:text-primary transition-all cursor-pointer z-20 backdrop-blur-sm"
                  aria-label="Slide tiếp theo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Chấm chỉ báo trang slide bên dưới */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                  {PROMO_SLIDES.map((_, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => setPromoSlide(sIdx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        promoSlide === sIdx ? 'w-7 bg-primary' : 'w-2.5 bg-slate-400/60 hover:bg-slate-400'
                      }`}
                      aria-label={`Slide ${sIdx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Khu vực "Việc làm nổi bật" - Bộ lọc tương tự TopCV chuẩn nhận diện JobLink */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-12">
          {/* Hàng 1: Tiêu đề + Tabs Loại việc làm + Link Xem tất cả & Mũi tên phân trang */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            {/* Trái: Tiêu đề + Pill tabs: Việc văn phòng, Việc phổ thông */}
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-base-content tracking-tight">
                Việc làm nổi bật
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleJobTypeChange('office')}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    jobTypeTab === 'office'
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-base-100 hover:bg-base-200 text-base-content/70 hover:text-base-content border border-base-300'
                  }`}
                >
                  Việc văn phòng
                </button>
                <button
                  type="button"
                  onClick={() => handleJobTypeChange('general')}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    jobTypeTab === 'general'
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-base-100 hover:bg-base-200 text-base-content/70 hover:text-base-content border border-base-300'
                  }`}
                >
                  Việc phổ thông
                </button>
              </div>
            </div>

            {/* Phải: Xem tất cả + Nút tròn < > chuyển trang việc làm */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <Link
                to="/jobs"
                className="text-xs sm:text-sm font-semibold text-primary hover:underline hover:text-primary-focus cursor-pointer"
              >
                Xem tất cả
              </Link>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setJobPage((prev) => Math.max(0, prev - 1))}
                  disabled={jobPage === 0}
                  aria-label="Trang trước"
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                    jobPage === 0
                      ? 'border-base-300 text-base-content/30 cursor-not-allowed'
                      : 'border-base-300 hover:border-primary text-base-content/70 hover:text-primary hover:bg-primary/5 cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setJobPage((prev) => Math.min(totalJobPages - 1, prev + 1))}
                  disabled={jobPage >= totalJobPages - 1}
                  aria-label="Trang sau"
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                    jobPage >= totalJobPages - 1
                      ? 'border-base-300 text-base-content/30 cursor-not-allowed'
                      : 'border-primary text-primary hover:bg-primary hover:text-white cursor-pointer'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Hàng 2: Thanh bộ lọc chi tiết (Dropdown "Lọc theo: ..." + Dải Pills cuộn ngang có 2 nút tròn < >) */}
          <div className="flex items-center gap-2.5 py-2 border-b border-base-300/80 mb-6">
            {/* Dropdown "Lọc theo: [Ngành nghề / Địa điểm / ...]" */}
            <div className="relative shrink-0" ref={filterDropdownRef}>
              <button
                type="button"
                onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-base-100 hover:bg-base-200 border border-base-300 text-xs sm:text-sm font-semibold text-base-content shadow-2xs transition-all cursor-pointer"
              >
                <ListFilter className="w-4 h-4 text-base-content/60" />
                <span>
                  Lọc theo:{' '}
                  <strong className="text-primary font-bold">
                    {FILTER_MODES.find((m) => m.key === filterMode)?.label}
                  </strong>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-base-content/50 transition-transform ${
                    isFilterDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Menu xổ xuống */}
              {isFilterDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-48 bg-base-100 rounded-xl shadow-xl border border-base-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                  {FILTER_MODES.map((mode) => (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() => handleSelectFilterMode(mode.key)}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm text-left transition-colors cursor-pointer ${
                        filterMode === mode.key
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-base-content/80 hover:bg-base-200'
                      }`}
                    >
                      <span>{mode.label}</span>
                      {filterMode === mode.key && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nút cuộn danh sách pills sang trái */}
            <button
              type="button"
              onClick={() => scrollPills('left')}
              className="w-7 h-7 rounded-full border border-base-300 hover:border-primary flex items-center justify-center text-base-content/60 hover:text-primary transition-all shrink-0 cursor-pointer"
              aria-label="Cuộn trái"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dải Pills cuộn ngang mượt mà */}
            <div
              ref={pillsScrollRef}
              className="flex-1 flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth py-1"
            >
              {currentSubFilterOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSelectSubFilter(item)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    subFilter === item
                      ? 'bg-primary text-white shadow-2xs'
                      : 'bg-base-100 hover:bg-base-200 text-base-content/75 hover:text-base-content border border-base-300'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Nút cuộn danh sách pills sang phải */}
            <button
              type="button"
              onClick={() => scrollPills('right')}
              className="w-7 h-7 rounded-full border border-base-300 hover:border-primary flex items-center justify-center text-base-content/60 hover:text-primary transition-all shrink-0 cursor-pointer"
              aria-label="Cuộn phải"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Lưới thẻ việc làm: hiển thị 6 việc / trang */}
          {loadingJobs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-base-100 rounded-2xl border border-base-300 p-5 space-y-3 animate-pulse"
                >
                  <div className="flex gap-3">
                    <div className="w-14 h-14 bg-base-300 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-base-300 rounded w-3/4" />
                      <div className="h-3 bg-base-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-base-200 rounded w-20" />
                    <div className="h-6 bg-base-200 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedJobs.length === 0 ? (
            <div className="text-center py-14 bg-base-100 rounded-2xl border border-base-300 space-y-3">
              <Briefcase className="w-12 h-12 text-base-content/30 mx-auto" />
              <p className="text-base-content/70 font-medium text-sm">
                Không tìm thấy việc làm phù hợp với tiêu chí lọc &quot;{subFilter}&quot;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubFilter('Tất cả');
                  setJobTypeTab('office');
                  setJobPage(0);
                }}
                className="btn btn-sm btn-ghost text-primary font-bold"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedJobs.map((job) => (
                <JobCard key={job.id || job.jobId} job={job} />
              ))}
            </div>
          )}

          {/* Nút Xem thêm việc làm */}
          <div className="text-center mt-9">
            <Link
              to="/jobs"
              className="btn btn-outline btn-primary rounded-xl font-bold text-xs sm:text-sm px-8 h-11 shadow-xs inline-flex items-center gap-2"
            >
              <span>Xem tất cả việc làm</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* 5. Khu vực "Top Công ty hàng đầu" - Kèm bộ lọc ngành nghề chuẩn TopCV */}
        <section className="bg-base-100 py-12 border-y border-base-300/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Header: Tiêu đề + Link Xem tất cả & Phân trang công ty */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-base-300/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-base-content tracking-tight">
                    Top Công ty hàng đầu
                  </h2>
                  <p className="text-xs sm:text-sm text-base-content/60 mt-0.5">
                    Khám phá cơ hội nghề nghiệp tại các doanh nghiệp đối tác uy tín
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <Link
                  to="/companies"
                  className="text-xs sm:text-sm font-bold text-primary hover:text-primary-600 flex items-center gap-1 group"
                >
                  <span>Xem tất cả công ty</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCompanyPage((prev) => Math.max(0, prev - 1))}
                    disabled={companyPage === 0}
                    aria-label="Trang công ty trước"
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                      companyPage === 0
                        ? 'border-base-300 text-base-content/30 cursor-not-allowed'
                        : 'border-base-300 hover:border-primary text-base-content/70 hover:text-primary hover:bg-primary/5 cursor-pointer'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompanyPage((prev) => Math.min(totalCompanyPages - 1, prev + 1))}
                    disabled={companyPage >= totalCompanyPages - 1}
                    aria-label="Trang công ty sau"
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                      companyPage >= totalCompanyPages - 1
                        ? 'border-base-300 text-base-content/30 cursor-not-allowed'
                        : 'border-primary text-primary hover:bg-primary hover:text-white cursor-pointer'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Dải bộ lọc Pills cho Top Công ty (chuẩn layout TopCV) */}
            <div className="flex items-center gap-2.5 py-4">
              <div
                ref={companyPillsScrollRef}
                className="flex-1 flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth py-1"
              >
                {COMPANY_FILTER_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleSelectCompanyIndustry(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold shrink-0 transition-all cursor-pointer ${
                      selectedCompanyIndustry === cat
                        ? 'bg-primary text-white shadow-2xs font-bold'
                        : 'bg-base-200/80 hover:bg-base-300 text-base-content/75 hover:text-base-content border border-base-300/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* 2 nút mũi tên tròn cuộn ngang dải pills */}
              <div className="flex items-center gap-1.5 shrink-0 pl-1">
                <button
                  type="button"
                  onClick={() => scrollCompanyPills('left')}
                  className="w-7 h-7 rounded-full border border-base-300 hover:border-primary flex items-center justify-center text-base-content/60 hover:text-primary transition-all cursor-pointer"
                  aria-label="Cuộn trái danh mục công ty"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCompanyPills('right')}
                  className="w-7 h-7 rounded-full border border-base-300 hover:border-primary flex items-center justify-center text-base-content/60 hover:text-primary transition-all cursor-pointer"
                  aria-label="Cuộn phải danh mục công ty"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lưới danh sách thẻ công ty */}
            {loadingCompanies ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-56 bg-base-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : displayedCompanies.length === 0 ? (
              <div className="text-center py-12 bg-base-200/50 rounded-2xl border border-base-300/80 mt-2 space-y-3">
                <Building2 className="w-10 h-10 text-base-content/30 mx-auto" />
                <p className="text-base-content/70 font-medium text-sm">
                  Chưa có công ty nào trong danh mục &quot;{selectedCompanyIndustry}&quot;.
                </p>
                <button
                  type="button"
                  onClick={() => handleSelectCompanyIndustry('Tất cả')}
                  className="btn btn-sm btn-ghost text-primary font-bold"
                >
                  Xem tất cả công ty
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-2">
                {displayedCompanies.map((company) => (
                  <CompanyCard key={company.id || company.companyId} company={company} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 6. Khu vực "Khám phá theo ngành nghề" */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="pb-6 border-b border-base-300/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-base-content tracking-tight">
                  Khám phá theo ngành nghề
                </h2>
                <p className="text-xs sm:text-sm text-base-content/60 mt-0.5">
                  Tìm kiếm cơ hội việc làm theo những nhóm ngành nghề được quan tâm nhiều nhất
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {POPULAR_CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setKeyword(cat.keyword);
                    navigate(`/jobs?keyword=${encodeURIComponent(cat.keyword)}`);
                  }}
                  className="group bg-base-100 rounded-2xl border border-base-300/80 hover:border-primary/50 hover:shadow-md transition-all duration-200 p-4 flex items-center gap-3.5 cursor-pointer"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cat.badgeColor} group-hover:scale-105 transition-transform duration-200`}
                  >
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base-content group-hover:text-primary transition-colors text-xs sm:text-sm truncate">
                      {cat.name}
                    </h3>
                    <p className="text-2xs sm:text-xs text-base-content/60 mt-0.5 font-medium">
                      {cat.jobCount} việc làm
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 7. Banner dành cho Nhà Tuyển Dụng chuẩn tông màu thương hiệu JobLink */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-14">
          <div className="bg-gradient-to-r from-brand-navy via-primary-700 to-primary text-white rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="badge bg-white/20 text-white border border-white/30 font-bold text-2xs uppercase py-1 px-3">
                Dành cho Nhà Tuyển Dụng
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                Doanh nghiệp bạn đang tìm kiếm nhân tài phù hợp?
              </h2>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
                Đăng tin tuyển dụng và tiếp cận hơn <strong className="text-white font-bold">50.000+</strong> ứng viên tiềm năng trên hệ thống JobLink. Tối ưu quy trình và tìm được nhân sự ưng ý nhanh chóng.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/recruiter"
                className="btn bg-white hover:bg-white/90 text-primary border-none rounded-xl font-bold text-xs sm:text-sm h-11 px-6 shadow-md"
              >
                Đăng tin tuyển dụng ngay
              </Link>
              <Link
                to="/companies"
                className="btn btn-ghost text-white hover:bg-white/10 rounded-xl font-semibold text-xs sm:text-sm h-11 px-5 border border-white/30"
              >
                Khám phá doanh nghiệp
              </Link>
            </div>

            {/* Họa tiết trang trí */}
            <div className="absolute right-0 bottom-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
          </div>
        </section>
      </main>

      {/* 8. Modal Ứng tuyển nhanh - TÁI SỬ DỤNG ApplyJobModal */}
      {selectedJob && (
        <ApplyJobModal
          job={selectedJob}
          company={selectedJob.company}
          isOpen={Boolean(selectedJob)}
          onClose={() => setSelectedJob(null)}
          onApplySuccess={(jobTitle) => {
            toast.success(
              'Ứng tuyển thành công!',
              `Hồ sơ cho vị trí "${jobTitle}" đã được gửi tới nhà tuyển dụng.`
            );
          }}
        />
      )}

      {/* 9. AppFooter chuẩn của dự án */}
      <AppFooter />
    </div>
  );
};

export default HomePage;
