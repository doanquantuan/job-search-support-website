import React from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "@/components/common/AppHeader";
import { AppFooter } from "@/components/common/AppFooter";

export const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col font-sans text-base-content">
      <AppHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-base-100 border border-base-200 rounded-xl p-6 sm:p-10 space-y-6">
          <div className="border-b border-base-200 pb-5 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content">
              Chính sách bảo mật
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60">
              Cập nhật lần cuối: 28/11/2026 · Áp dụng cho nền tảng Jobloria (jobloria.click)
            </p>
          </div>

          <section className="space-y-2 text-sm text-base-content/80 leading-relaxed">
            <h2 className="text-base font-bold text-base-content">
              1. Thông tin chúng tôi thu thập
            </h2>
            <p>
              Khi bạn đăng ký tài khoản hoặc sử dụng dịch vụ tìm việc và tuyển dụng trên Jobloria, chúng tôi thu thập các thông tin sau:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Thông tin tài khoản:</strong> Họ tên, địa chỉ email, ảnh đại diện (bao gồm thông tin cơ bản khi bạn đăng nhập qua Google OAuth hoặc Facebook).
              </li>
              <li>
                <strong>Hồ sơ ứng viên &amp; CV:</strong> Số điện thoại, kinh nghiệm làm việc, học vấn, kỹ năng và tệp CV bạn chủ động tải lên.
              </li>
              <li>
                <strong>Thông tin doanh nghiệp (Nhà tuyển dụng):</strong> Tên công ty, mã số thuế/giấy phép kinh doanh, địa chỉ và tin tuyển dụng.
              </li>
            </ul>
          </section>

          <section className="space-y-2 text-sm text-base-content/80 leading-relaxed">
            <h2 className="text-base font-bold text-base-content">
              2. Mục đích sử dụng thông tin
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Xác thực danh tính, duy trì phiên đăng nhập và bảo vệ tài khoản của bạn.</li>
              <li>Kết nối hồ sơ ứng viên với nhà tuyển dụng khi bạn chủ động nộp đơn ứng tuyển.</li>
              <li>Gửi thông báo về trạng thái ứng tuyển, việc làm phù hợp và phản hồi từ doanh nghiệp.</li>
              <li>Cải thiện chất lượng tìm kiếm việc làm và ngăn chặn hành vi gian lận, tin tuyển dụng vi phạm.</li>
            </ul>
          </section>

          <section className="space-y-2 text-sm text-base-content/80 leading-relaxed">
            <h2 className="text-base font-bold text-base-content">
              3. Chia sẻ và bảo vệ dữ liệu
            </h2>
            <p>
              Jobloria không bán hoặc cho thuê dữ liệu cá nhân của người dùng cho bên thứ ba. Hồ sơ và CV của bạn chỉ được chia sẻ với nhà tuyển dụng tại các vị trí bạn chủ động ứng tuyển hoặc khi bạn cho phép công khai hồ sơ. Mật khẩu và phiên đăng nhập được mã hóa theo tiêu chuẩn bảo mật hiện hành.
            </p>
          </section>

          <section className="space-y-2 text-sm text-base-content/80 leading-relaxed">
            <h2 className="text-base font-bold text-base-content">
              4. Quyền của người dùng
            </h2>
            <p>
              Bạn có quyền xem, chỉnh sửa thông tin cá nhân, gỡ bỏ CV đã tải lên hoặc yêu cầu xóa tài khoản bất cứ lúc nào thông qua trang{" "}
              <Link to="/profile" className="text-primary font-medium hover:underline">
                Hồ sơ cá nhân
              </Link>{" "}
              hoặc liên hệ đội ngũ hỗ trợ.
            </p>
          </section>

          <section className="space-y-2 text-sm text-base-content/80 leading-relaxed">
            <h2 className="text-base font-bold text-base-content">
              5. Thông tin liên hệ
            </h2>
            <p>
              Nếu có câu hỏi liên quan đến chính sách bảo mật hoặc quyền riêng tư, vui lòng liên hệ qua email:{" "}
              <a href="mailto:support@jobloria.click" className="text-primary font-medium hover:underline">
                support@jobloria.click
              </a>
              .
            </p>
          </section>

          <div className="pt-4 border-t border-base-200 flex items-center justify-between text-xs text-base-content/60">
            <Link to="/terms" className="text-primary font-medium hover:underline">
              Xem Điều khoản sử dụng →
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

export default PrivacyPolicyPage;
