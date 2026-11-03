import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Globe } from "lucide-react";
import logo from "../../assets/logo.png";

// ── Footer columns data ────────────────────────────────────────────────────────

const FOOTER_COLS = [
  {
    title: "Dành cho ứng viên",
    links: [
      { label: "Tìm việc làm",         to: "/jobs"     },
      { label: "Tạo CV",               to: "/cvs"      },
      { label: "Việc làm đã lưu",      to: "/saved"    },
      { label: "Cẩm nang nghề nghiệp", to: "/guide"    },
    ],
  },
  {
    title: "Nhà tuyển dụng",
    links: [
      { label: "Đăng tin tuyển dụng",  to: "/employer/post"    },
      { label: "Tìm hồ sơ ứng viên",  to: "/employer/search"  },
      { label: "Bảng giá dịch vụ",     to: "/employer/pricing" },
      { label: "Liên hệ tư vấn",       to: "/employer/contact" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Trung tâm trợ giúp",   to: "/help"    },
      { label: "Câu hỏi thường gặp",   to: "/faq"     },
      { label: "Liên hệ",              to: "/contact" },
      { label: "Về JobLink",           to: "/about"   },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export const AppFooter = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    // TODO: call subscription API
    setEmail("");
  };

  return (
    <footer className="w-full font-sans">

      {/* ── Email subscription banner ────────────────────────────── */}
      <div className="bg-secondary text-secondary-content border-t border-secondary">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-white text-base sm:text-lg">
              Nhận việc làm phù hợp qua email
            </p>
            <p className="text-xs text-secondary-content/80 mt-0.5">
              Cập nhật mỗi tuần, hủy bất cứ lúc nào
            </p>
          </div>
          <form
            onSubmit={handleSubscribe}
            className="join w-full sm:w-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="input input-bordered input-sm h-10 join-item flex-1 sm:w-64 bg-base-100 text-base-content text-sm"
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm h-10 join-item text-white font-semibold px-5"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </div>

      {/* ── Main footer body ─────────────────────────────────────── */}
      <div className="bg-base-100 border-t border-base-200">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Brand column */}
            <div className="flex flex-col gap-4">
              <Link to="/">
                <img src={logo} alt="JobLink" className="h-20 w-auto" />
              </Link>
              <p className="text-sm text-base-content/60 leading-relaxed max-w-[180px]">
                Kết nối ứng viên với cơ hội nghề nghiệp phù hợp.
              </p>
              {/* Social icons */}

            </div>

            {/* Link columns */}
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <h4 className="footer-title text-sm font-semibold text-base-content opacity-100 normal-case mb-3">
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="link link-hover text-sm text-base-content/60 hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────── */}
      <div className="bg-base-200 border-t border-base-300">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-base-content/50">
            © 2026 JobLink. Bảo lưu mọi quyền.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link to="/terms"   className="link link-hover text-xs text-base-content/60 hover:text-base-content">Điều khoản</Link>
            <Link to="/privacy" className="link link-hover text-xs text-base-content/60 hover:text-base-content">Chính sách bảo mật</Link>
            <Link to="/rules"   className="link link-hover text-xs text-base-content/60 hover:text-base-content">Quy chế hoạt động</Link>
            <button className="btn btn-ghost btn-xs gap-1.5 text-xs text-base-content/60 hover:text-base-content">
              <Globe className="w-3.5 h-3.5" />
              Tiếng Việt
            </button>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default AppFooter;
