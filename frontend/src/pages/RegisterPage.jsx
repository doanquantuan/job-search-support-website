import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { AuthBanner } from '@/features/auth/components/AuthBanner';

export function RegisterPage() {
  return (
    <div className="min-h-screen w-full bg-base-200 flex items-center justify-center px-4 py-8">
      <div className="card bg-base-100 shadow-xl w-full max-w-5xl border border-base-300">
        <div className="card-body p-0 flex flex-col md:flex-row">

          {/* Banner trái – giữ tỷ lệ phù hợp ảnh 3:4 */}
          <div className="md:w-[48%] lg:w-[50%] min-h-[360px] md:min-h-[600px] shrink-0 overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none border-b md:border-b-0 md:border-r border-base-200">
            <AuthBanner mode="register" />
          </div>

          {/* Form phải */}
          <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 sm:px-8 lg:px-10 overflow-y-auto">
            <div className="w-full max-w-[420px]">
              <RegisterForm />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
