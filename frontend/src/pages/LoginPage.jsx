import { LoginForm } from '@/features/auth/components/LoginForm';
import { AuthBanner } from '@/features/auth/components/AuthBanner';

export function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:flex-row">
      {/* Left Column – Khung nền xám nhạt bên trái chứa banner logo Jobloria động (mode='login' để ẩn các bước đăng ký) */}
      <div className="hidden md:flex md:w-[46%] lg:w-[45%] xl:w-[44%] bg-[#F9FAFC] border-r border-gray-100 flex-col justify-center items-center py-10 px-6 sm:px-8 shrink-0">
        <AuthBanner mode="login" />
      </div>

      {/* Right Column – Khung màu trắng bên phải chứa LoginForm */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 sm:px-8 lg:px-12 overflow-y-auto">
        <div className="w-full max-w-[450px]">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
