import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary caught an error]:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-base-100 rounded-2xl border border-base-300 shadow-lg p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-error/10 text-error mx-auto flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-base-content">
                Đã xảy ra lỗi hiển thị
              </h3>
              <p className="text-xs text-base-content/60 leading-relaxed font-mono bg-base-200/60 p-2 rounded-lg text-left break-all">
                {this.state.error?.message || "Vui lòng tải lại trang hoặc quay về trang chủ để tiếp tục."}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="btn btn-sm btn-primary gap-2 font-semibold"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tải lại</span>
              </button>
              <a
                href="/recruiter/dashboard"
                className="btn btn-sm btn-ghost gap-2 font-semibold"
              >
                <Home className="w-4 h-4" />
                <span>Tổng quan</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
