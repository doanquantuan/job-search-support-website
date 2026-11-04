import React, { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { getInitials } from "@/lib/utils";

const SIZE_MAP = {
  xs: "w-8 h-8 text-xs rounded-lg",
  sm: "w-10 h-10 text-xs rounded-lg",
  md: "w-14 h-14 text-sm rounded-xl",
  lg: "w-20 h-20 text-lg rounded-2xl",
  xl: "w-24 h-24 text-xl rounded-2xl",
};

/**
 * Component hiển thị Logo công ty tái sử dụng với fallback tự động (ảnh lỗi -> Chữ cái viết tắt)
 */
export const CompanyLogo = ({
  src,
  name = "Doanh nghiệp",
  size = "md",
  className = "",
  imgClassName = "object-cover",
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset lỗi khi link ảnh thay đổi
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const initials = getInitials(name);

  return (
    <div
      className={`relative overflow-hidden bg-base-100 border border-base-200/80 shadow-2xs flex items-center justify-center shrink-0 select-none ${sizeClass} ${className}`}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={name}
          className={`w-full h-full ${imgClassName}`}
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold tracking-tight">
          {initials || <Building2 className="w-1/2 h-1/2 opacity-70" />}
        </div>
      )}
    </div>
  );
};

export default CompanyLogo;

