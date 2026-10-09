import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "@/features/auth/services/authApi";
import { useAuthStore } from "@/store/useAuthStore";
import { FormInput } from "./common/FormInput";
import { PasswordInput } from "./common/PasswordInput";

export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loginSuccess = useAuthStore((state) => state.loginSuccess);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await authApi.login({ email, password });
      const { user, accessToken } = res.data;
      loginSuccess(user, accessToken);
      setSuccess(`Đăng nhập thành công! Chào mừng ${user.fullName || user.email}`);
    } catch (err) {
      const message =
        err.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại!";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-[420px] mx-auto py-2 ${className || ""}`} {...props}>
      <div className="rounded-md border border-gray-200 bg-white p-6 shadow-xs space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Đăng nhập</h1>
          <p className="text-xs text-gray-500">
            Truy cập tài khoản của bạn để tiếp tục
          </p>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Thông báo thành công */}
        {success && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-xs font-semibold text-gray-700">
              Email
            </label>
            <FormInput
              id="email"
              type="email"
              placeholder="ten@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-semibold text-gray-700">
                Mật khẩu
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:bg-orange-700"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-semibold text-orange-600 hover:text-orange-700 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
