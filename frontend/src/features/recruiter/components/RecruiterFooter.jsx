import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import logo from '@/assets/logo.png';

export const RecruiterFooter = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 font-sans text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
          {/* Cột 1: Thông tin Doanh nghiệp & Giới thiệu */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="JobLink" className="h-10 w-auto brightness-0 invert" />
              <span className="badge bg-primary/20 text-primary-200 border-primary/40 font-bold text-2xs uppercase tracking-wider py-1 px-2.5">
                DOANH NGHIỆP
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Hệ thống giải pháp tuyển dụng thông minh hàng đầu Việt Nam. Kết nối doanh nghiệp với hơn 50.000+ ứng viên chất lượng cao, tối ưu chi phí và thời gian tuyển dụng.
            </p>
            <div className="space-y-2 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Hotline tư vấn dịch vụ: <strong className="text-white">1900 6868 (Phím 2)</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Hỗ trợ Nhà tuyển dụng: <strong className="text-white">recruiter@joblink.vn</strong>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Trụ sở chính: Tầng 8, Tòa nhà Văn phòng Công nghệ, Cầu Giấy, Hà Nội</span>
              </div>
            </div>
          </div>

          {/* Cột 2: Giải pháp & Dịch vụ */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Dịch vụ tuyển dụng
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/recruiter#solutions" className="hover:text-white transition-colors">
                  Đăng tin tuyển dụng VIP
                </Link>
              </li>
              <li>
                <Link to="/recruiter#solutions" className="hover:text-white transition-colors">
                  Lọc hồ sơ & Tìm kiếm CV
                </Link>
              </li>
              <li>
                <Link to="/recruiter#solutions" className="hover:text-white transition-colors">
                  Quảng bá thương hiệu (Employer Branding)
                </Link>
              </li>
              <li>
                <Link to="/recruiter#contact" className="hover:text-white transition-colors">
                  Liên hệ tư vấn dịch vụ
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ & Quy định */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Quy định & Hỗ trợ
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/recruiter" className="hover:text-white transition-colors">
                  Quy định đăng tin tuyển dụng
                </Link>
              </li>
              <li>
                <Link to="/recruiter" className="hover:text-white transition-colors">
                  Chính sách bảo mật dữ liệu HR
                </Link>
              </li>
              <li>
                <Link to="/recruiter" className="hover:text-white transition-colors">
                  Quy trình xác thực doanh nghiệp
                </Link>
              </li>
              <li>
                <Link to="/recruiter" className="hover:text-white transition-colors">
                  Giải quyết khiếu nại & Tranh chấp
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Chuyển đổi Cổng Ứng viên */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Hệ sinh thái JobLink
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bạn đang tìm kiếm việc làm hoặc tạo hồ sơ ứng tuyển cá nhân?
            </p>
            <Link
              to="/"
              className="btn btn-outline btn-sm h-9 min-h-9 px-4 text-xs font-bold text-white border-slate-700 hover:bg-white hover:text-slate-900 rounded-xl gap-2 w-full justify-center"
            >
              <span>Cổng dành cho Ứng viên</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} JobLink Smart Recruitment Platform. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>Nền tảng tuyển dụng được xác thực</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default RecruiterFooter;

