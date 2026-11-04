import React from "react";

export const PageLoader = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
      <p className="text-sm text-base-content/60 font-medium animate-pulse">
        Đang tải nội dung...
      </p>
    </div>
  );
};

export default PageLoader;

