import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  Users,
  Search,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  ArrowRight,
  ShieldCheck,
  Headphones,
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  Send,
} from 'lucide-react';
import { RecruiterHeader } from '@/features/recruiter/components/RecruiterHeader';
import { RecruiterFooter } from '@/features/recruiter/components/RecruiterFooter';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from '@/store/useToastStore';

// Danh sách các slide banner tuyển dụng dành riêng cho Nhà tuyển dụng
const RECRUITER_BANNERS = [
  {
    id: 1,
    title: 'Tuyển Dụng Nhân Tài Nhanh Chóng & Chuẩn Xác Cùng JobLink',
    imageUrl: '/banners/banner-recruiter-1.svg',
    target: '#contact',
  },
  {
    id: 2,
    title: 'Xây Dựng Thương Hiệu Tuyển Dụng & Thu Hút Nhân Tài Đẳng Cấp',
    imageUrl: '/banners/banner-recruiter-2.svg',
    target: '#contact',
  },
];

// Câu hỏi thường gặp
const FAQS = [
  {
    question: 'Đăng tin tuyển dụng trên JobLink có được hỗ trợ như thế nào?',
    answer:
      'JobLink cung cấp các giải pháp tuyển dụng linh hoạt và hiệu quả cho mọi doanh nghiệp. Để nhận tư vấn chi tiết theo đúng quy mô và nhu cầu nhân sự của công ty, bạn có thể để lại thông tin trong mục Liên hệ để chuyên viên hỗ trợ trực tiếp.',
  },
  {
    question: 'Sau bao lâu thì tin tuyển dụng được duyệt và hiển thị?',
    answer:
      'Hệ thống duyệt tin thông minh tự động kiểm duyệt trong vòng 5 - 15 phút đối với các doanh nghiệp đã xác minh. Với tài khoản mới, chuyên viên kiểm duyệt của JobLink sẽ hỗ trợ xác thực tối đa trong 2 giờ làm việc.',
  },
  {
    question: 'Làm thế nào để xác thực tài khoản Nhà tuyển dụng?',
    answer:
      'Bạn chỉ cần đăng ký tài khoản Nhà tuyển dụng, sau đó tải lên Giấy phép Đăng ký Kinh doanh (GPKD) hoặc giấy giới thiệu của công ty trong mục Hồ sơ. Đội ngũ kiểm duyệt sẽ xác minh và cấp huy hiệu Đã xác minh (Verified Badge) nhanh chóng.',
  },
  {
    question: 'JobLink hỗ trợ tìm kiếm ứng viên chủ động như thế nào?',
    answer:
      'Nhà tuyển dụng có thể sử dụng tính năng "Tìm kiếm ứng viên" với bộ lọc chi tiết theo ngành nghề, kỹ năng công nghệ, mức lương kỳ vọng và địa điểm để tiếp cận trực tiếp những nhân tài phù hợp mà không cần chờ nộp đơn.',
  },
];

export const RecruiterLandingPage = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [openFaq, setOpenFaq] = useState(0);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);

  // Tự động chuyển slide banner sau 6s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIdx((prev) => (prev + 1) % RECRUITER_BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevBanner = () => {
    setCurrentBannerIdx((prev) => (prev - 1 + RECRUITER_BANNERS.length) % RECRUITER_BANNERS.length);
  };

  const handleNextBanner = () => {
    setCurrentBannerIdx((prev) => (prev + 1) % RECRUITER_BANNERS.length);
  };

  // Tự động cuộn đến section khi có hash trên URL
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
    }
  }, [location.hash]);

  // Form liên hệ tư vấn
  const [contactForm, setContactForm] = useState({
    companyName: '',
    contactName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    hiringNeeds: '1 - 5 vị trí',
    note: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.companyName || !contactForm.phone || !contactForm.email) {
      toast.error('Thiếu thông tin', 'Vui lòng điền đầy đủ Tên công ty, Số điện thoại và Email liên hệ.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        'Gửi yêu cầu thành công!',
        'Chuyên viên tư vấn tuyển dụng của JobLink sẽ liên hệ với bạn trong vòng 30 phút.'
      );
      setContactForm({
        companyName: '',
        contactName: user?.fullName || '',
        phone: user?.phone || '',
        email: user?.email || '',
        hiringNeeds: '1 - 5 vị trí',
        note: '',
      });
    }, 700);
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col font-sans text-base-content">
      {/* 1. RecruiterHeader chuyên nghiệp dành cho Doanh nghiệp */}
      <RecruiterHeader />

      <main className="flex-1">
        {/* 2. Hero Section: Hình Banner Tuyển Dụng Tràn Viền Trên và 2 Bên */}
        <section className="w-full pt-0 px-0 pb-6 sm:pb-10">
          <div className="w-full relative overflow-hidden bg-slate-900 group">
            {/* Banner Image Container */}
            <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] md:aspect-[28/9] min-h-[220px] sm:min-h-[360px] md:min-h-[420px] max-h-[500px]">
              <img
                src={RECRUITER_BANNERS[currentBannerIdx].imageUrl}
                alt={RECRUITER_BANNERS[currentBannerIdx].title}
                className="w-full h-full object-cover object-center transition-all duration-700"
              />

              {/* Nút điều hướng Slide trước */}
              <button
                type="button"
                onClick={handlePrevBanner}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs opacity-80 group-hover:opacity-100 z-10"
                aria-label="Slide trước"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Nút điều hướng Slide tiếp theo */}
              <button
                type="button"
                onClick={handleNextBanner}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs opacity-80 group-hover:opacity-100 z-10"
                aria-label="Slide tiếp theo"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Chấm chỉ báo Slide (Indicators) */}
              <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                {RECRUITER_BANNERS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentBannerIdx(idx)}
                    className={`h-2 sm:h-2.5 rounded-full transition-all cursor-pointer ${
                      currentBannerIdx === idx
                        ? 'w-7 sm:w-8 bg-white'
                        : 'w-2 sm:w-2.5 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Trụ cột giải pháp tuyển dụng (Features & Capabilities) */}
        <section id="solutions" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 scroll-mt-16">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="badge badge-primary badge-outline font-bold text-2xs uppercase tracking-wide py-1 px-3">
              Tính năng vượt trội
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
              Giải Pháp Tuyển Dụng Đột Phá Cho Mọi Doanh Nghiệp
            </h2>
            <p className="text-xs sm:text-sm text-base-content/60">
              JobLink mang đến bộ công cụ toàn diện giúp doanh nghiệp tiếp cận đúng người, đúng thời điểm và tối ưu chi phí.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="card bg-base-100 border border-base-200 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-200 p-6 rounded-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-base-content">
                  Đăng Tin Thần Tốc & Tiếp Cận Chuẩn
                </h3>
                <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
                  Đăng tin nhanh trong 3 phút, hệ thống tự động tối ưu hóa từ khóa tuyển dụng giúp hiển thị nổi bật trước hàng nghìn ứng viên phù hợp.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-base-200 flex items-center text-xs font-bold text-primary">
                <span>Tiết kiệm 70% thời gian</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card bg-base-100 border border-base-200 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-200 p-6 rounded-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-base-content">
                  Sàng Lọc Hồ Sơ CV Đa Chiều
                </h3>
                <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
                  Chủ động tìm kiếm và mở khóa kho hồ sơ 50.000+ ứng viên với bộ lọc chuyên sâu theo kỹ năng, kinh nghiệm, mức lương và khu vực.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-base-200 flex items-center text-xs font-bold text-emerald-600">
                <span>Chủ động săn nhân tài</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card bg-base-100 border border-base-200 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-200 p-6 rounded-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-base-content">
                  Quản Lý Ứng Tuyển ATS Tinh Gọn
                </h3>
                <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
                  Theo dõi trạng thái từng ứng viên (Đã nhận, Đang duyệt, Phỏng vấn, Tuyển dụng) tập trung, gửi thông báo phản hồi nhanh chóng.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-base-200 flex items-center text-xs font-bold text-amber-600">
                <span>Quy trình chuyên nghiệp</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="card bg-base-100 border border-base-200 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-200 p-6 rounded-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-base-content">
                  Định Vị Thương Hiệu Tuyển Dụng
                </h3>
                <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
                  Trang hồ sơ công ty độc quyền với huy hiệu Doanh nghiệp Uy tín, quảng bá hình ảnh văn hóa, chế độ phúc lợi để thu hút ứng viên giỏi.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-base-200 flex items-center text-xs font-bold text-purple-600">
                <span>Gia tăng 85% uy tín</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Quy trình 4 bước bắt đầu tuyển dụng */}
        <section className="bg-base-100 border-y border-base-200/80 py-12 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
                Quy Trình Bắt Đầu Đơn Giản Trong 4 Bước
              </h2>
              <p className="text-xs sm:text-sm text-base-content/60">
                Chỉ mất chưa đầy 5 phút để kích hoạt chiến dịch tuyển dụng đầu tiên của bạn
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Step 1 */}
              <div className="p-5 rounded-2xl bg-base-200/50 border border-base-200 space-y-3 relative">
                <div className="w-9 h-9 rounded-xl bg-primary text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                  01
                </div>
                <h3 className="font-bold text-sm text-base-content">Đăng ký tài khoản</h3>
                <p className="text-xs text-base-content/70 leading-relaxed">
                  Đăng ký tài khoản Nhà tuyển dụng và điền các thông tin doanh nghiệp cơ bản hoàn toàn miễn phí.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-2xl bg-base-200/50 border border-base-200 space-y-3 relative">
                <div className="w-9 h-9 rounded-xl bg-primary text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                  02
                </div>
                <h3 className="font-bold text-sm text-base-content">Xác thực doanh nghiệp</h3>
                <p className="text-xs text-base-content/70 leading-relaxed">
                  Tải giấy phép kinh doanh hoặc giấy giới thiệu để nhận huy hiệu Doanh nghiệp Đã xác minh.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-2xl bg-base-200/50 border border-base-200 space-y-3 relative">
                <div className="w-9 h-9 rounded-xl bg-primary text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                  03
                </div>
                <h3 className="font-bold text-sm text-base-content">Đăng tin & Lọc CV</h3>
                <p className="text-xs text-base-content/70 leading-relaxed">
                  Tạo tin tuyển dụng theo biểu mẫu chuẩn hoặc chủ động lọc hồ sơ ứng viên từ cơ sở dữ liệu.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-5 rounded-2xl bg-base-200/50 border border-base-200 space-y-3 relative">
                <div className="w-9 h-9 rounded-xl bg-primary text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                  04
                </div>
                <h3 className="font-bold text-sm text-base-content">Tuyển chọn nhân sự</h3>
                <p className="text-xs text-base-content/70 leading-relaxed">
                  Tiến hành phỏng vấn, cập nhật trạng thái hồ sơ và đón nhân sự mới về đồng hành cùng công ty.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Form Nhận Tư Vấn Tuyển Dụng Nhanh (Lead Form) */}
        <section id="contact" className="bg-base-100 border-b border-base-200/80 py-12 sm:py-16 scroll-mt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-br from-brand-navy via-primary-700 to-primary text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Cột trái: Thông tin mời liên hệ */}
                <div className="md:col-span-5 space-y-4">
                  <span className="badge bg-white/20 text-white border border-white/30 text-2xs font-bold py-1 px-3 uppercase">
                    Tư vấn miễn phí 1-1
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                    Cần giải pháp tuyển dụng chuyên biệt?
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
                    Để lại thông tin doanh nghiệp, đội ngũ chuyên viên tư vấn của JobLink sẽ liên hệ phân tích nhu cầu và gửi giải pháp tối ưu trong 30 phút.
                  </p>

                  <div className="space-y-2 pt-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-accent" />
                      <span>Hotline tuyển dụng: <strong>1900 6868 (Ext: 2)</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-accent" />
                      <span>Email: <strong>recruiter@joblink.vn</strong></span>
                    </div>
                  </div>
                </div>

                {/* Cột phải: Form nhập thông tin */}
                <div className="md:col-span-7 bg-base-100 text-base-content rounded-2xl p-5 sm:p-6 shadow-lg">
                  <form onSubmit={handleContactSubmit} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-bold text-base-content/80 block mb-1">
                        Tên doanh nghiệp / Công ty <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={contactForm.companyName}
                        onChange={(e) => setContactForm({ ...contactForm, companyName: e.target.value })}
                        placeholder="Ví dụ: Công ty Cổ phần Công nghệ XYZ"
                        className="input input-bordered w-full h-10 text-xs sm:text-sm focus:input-primary"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-base-content/80 block mb-1">
                          Số điện thoại <span className="text-error">*</span>
                        </label>
                        <input
                          type="tel"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          placeholder="Ví dụ: 0912 345 678"
                          className="input input-bordered w-full h-10 text-xs sm:text-sm focus:input-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-base-content/80 block mb-1">
                          Email công việc <span className="text-error">*</span>
                        </label>
                        <input
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          placeholder="hr@company.com"
                          className="input input-bordered w-full h-10 text-xs sm:text-sm focus:input-primary"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-base-content/80 block mb-1">
                        Quy mô vị trí cần tuyển
                      </label>
                      <select
                        value={contactForm.hiringNeeds}
                        onChange={(e) => setContactForm({ ...contactForm, hiringNeeds: e.target.value })}
                        className="select select-bordered w-full h-10 min-h-10 text-xs sm:text-sm focus:select-primary"
                      >
                        <option value="1 - 5 vị trí">1 - 5 vị trí tuyển dụng</option>
                        <option value="5 - 15 vị trí">5 - 15 vị trí tuyển dụng</option>
                        <option value="Trên 15 vị trí">Trên 15 vị trí (Tuyển dụng số lượng lớn)</option>
                        <option value="Cần tư vấn gói giải pháp">Cần tư vấn giải pháp toàn diện</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary w-full text-white font-bold text-xs sm:text-sm h-11 rounded-xl shadow-xs hover:shadow-md cursor-pointer mt-2 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>Đang gửi thông tin...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Gửi yêu cầu tư vấn ngay</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Câu hỏi thường gặp (FAQs) */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="badge badge-ghost font-bold text-2xs uppercase tracking-wide py-1 px-3">
              Giải đáp thắc mắc
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
              Những Câu Hỏi Thường Gặp
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="card bg-base-100 border border-base-200/90 rounded-2xl overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-sm text-base-content hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-base-content/50 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-primary' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-base-content/70 leading-relaxed border-t border-base-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* 7. RecruiterFooter chuẩn dành cho Doanh nghiệp */}
      <RecruiterFooter />
    </div>
  );
};

export default RecruiterLandingPage;
