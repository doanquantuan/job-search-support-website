import React from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "@/components/common/AppHeader";
import { AppFooter } from "@/components/common/AppFooter";

export const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col font-sans text-base-content">
      <AppHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-base-100 border border-base-200 rounded-xl p-6 sm:p-10 space-y-6">
          <div className="border-b border-base-200 pb-5 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content">
              Điều khoản sử dụng
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60">
              Cập nhật lần cuối: 28/11/2026 · Áp dụng cho nền tảng Jobloria (jobloria.click)
            </p>
          </div>

          <section className="space-y-2 text-sm text-base-content/80 leading-relaxed">
            <h2 className="text-base font-bold text-base-content">
              1. Chấp nhận điều khoản
            </h2>
            <p>
              Khi truy cập và sử dụng nền tảng Jobloria, bạn đồng ý tuân thủ các điều khoản sử dụng này cùng{" "}
              <Link to="/privacy" className="text-primary font-medium hover:underline">
                Chính sách bảo mật
              </Link>{" "}
              của chúng tôi.
            </p>
          </section>

          <section className="space-y-2 text-sm text-base-content/80 leading-relaxed">
            <h2 className="text-base font-bold text-base-content">
              2. Trách nhiệm của Ứng viên
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Cung cấp thông tin cá nhân và hồ sơ CV trung thực, chính xác.</li>
              <li>Không sử dụng tài khoản để spam hồ sơ hoặc gửi nội dung vi phạm pháp luật.</li>
              <li>Tự chịu trách nhiệm bảo mật thông tin đăng nhập tài khoản của mình.</li>
            </ul>
          </section>

          <section className="space-y-2 text-sm text-base-content/80 leading-relaxed">
            <h2 className="text-base font-bold text-base-content">
              3. Trách nhiệm của Nhà tuyển dụng
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Cung cấp thông tin doanh nghiệp hợp pháp và tin tuyển dụng minh bạch, đúng thực tế.</li>
              <li>Không đăng tin lừa đảo, thu phí trái phép ứng viên hoặc sử dụng dữ liệu ứng viên sai mục đích tuyển dụng.</li>
              <li>Jobloria có quyền ẩn hoặc khóa các tin tuyển dụng, tài khoản vi phạm quy định mà không cần báo trước.</li>
            </ul>
          </section>

          <section className="space-y-2 text-sm text-base-content/80 leading-relaxed">
            <h2 className="text-base font-bold text-base-content">
              4. Quyền sở hữu và giới hạn trách nhiệm
            </h2>
            <p>
              Jobloria đóng vai trò nền tảng kết nối giữa ứng viên và doanh nghiệp. Chúng tôi nỗ lực xác thực doanh nghiệp và kiểm duyệt tin đăng, tuy nhiên các thỏa thuận lao động trực tiếp thuộc trách nhiệm giữa hai bên.
            </p>
          </section>

          <section className="space-y-2 text-sm text-base-content/80 leading-relaxed">
            <h2 className="text-base font-bold text-base-content">
              5. Liên hệ hỗ trợ
            </h2>
            <p>
              Mọi thắc mắc hoặc báo cáo vi phạm xin gửi về:{" "}
              <a href="mailto:support@jobloria.click" className="text-primary font-medium hover:underline">
                support@jobloria.click
              </a>
              .
            </p>
          </section>

          <div className="pt-4 border-t border-base-200 flex items-center justify-between text-xs text-base-content/60">
            <Link to="/privacy" className="text-primary font-medium hover:underline">
              ← Xem Chính sách bảo mật
            </Link>
            <Link to="/" className="hover:text-base-content">
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default TermsOfServicePage;
